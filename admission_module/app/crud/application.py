from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from fastapi import HTTPException

from app.models.application import Application, ApplicantDetails, ParentDetails, EducationDetails
from app.models.review_status import ApplicationStatusLog
from app.schemas.application import ApplicationCreate

async def create_full_application(db: AsyncSession, app_data: ApplicationCreate):
    """
    Creates the main Application object, the ApplicantDetails, ParentDetails, EducationDetails,
    and logs the status state change all in one go (transactionally bound).
    """
    
    # 1. Create Main Application Row
    new_application = Application(
        user_id=app_data.user_id,
        brochure_id=app_data.brochure_id,
        course_name=app_data.course_name,
        admission_year=app_data.admission_year,
        current_status="draft", # Initial state is draft
        submission_date=datetime.utcnow()
    )
    
    db.add(new_application)
    await db.flush() # Flush pushes to the DB to generate the application_id without committing!
    
    # 2. Add Applicant Details referencing the newly generated application_id
    applicant_details = ApplicantDetails(
        application_id=new_application.application_id,
        **app_data.applicant.model_dump()
    )
    db.add(applicant_details)
    
    # 3. Add single parent details record
    parent_db = ParentDetails(
        application_id=new_application.application_id,
        **app_data.parent_details.model_dump()
    )
    db.add(parent_db)
        
    # 4. Add all education historical records
    for edu in app_data.education:
        edu_db = EducationDetails(
            application_id=new_application.application_id,
            **edu.model_dump()
        )
        # Percentage is calculated in schema but confirmed here
        if edu.total_marks > 0:
            edu_db.percentage = (edu.obtained_marks / edu.total_marks) * 100
        db.add(edu_db)
        
    # 5. Application State Manager - Log the Submission Action
    status_log = ApplicationStatusLog(
        application_id=new_application.application_id,
        changed_by=app_data.user_id,
        changed_role="Applicant",
        status_id="draft", # Initial log is draft
        remark="Applicant saved the application form as draft."
    )
    db.add(status_log)
    
    # 6. Commit the entire transaction!
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        # Detect Aadhaar unique constraint violation
        error_msg = str(e).lower()
        if "adhar_number" in error_msg and "unique" in error_msg:
            raise HTTPException(
                status_code=400, 
                detail="Aadhaar Number already registered. An application already exists with this Aadhaar."
            )
        raise e

    # Explicitly load relationships to avoid lazy-loading issues in async mode
    await db.refresh(new_application, ["applicant_details", "parent_details", "education_details"])
    
    return new_application

async def update_full_application(db: AsyncSession, application_id: int, app_data: ApplicationCreate):
    """
    Updates an existing main Application object and its related details.
    """
    # 1. Get existing application
    app_record = await get_application_by_id(db, application_id)
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found for update.")
        
    # 2. Update Application Record
    app_record.course_name = app_data.course_name
    app_record.admission_year = app_data.admission_year
    
    # 3. Update Applicant Details
    for key, value in app_data.applicant.model_dump().items():
        setattr(app_record.applicant_details, key, value)
        
    # 4. Update Parent Details
    for key, value in app_data.parent_details.model_dump().items():
        setattr(app_record.parent_details, key, value)
        
    # 5. Replace Education Details
    # Delete existing education rows
    await db.execute(
        EducationDetails.__table__.delete().where(EducationDetails.application_id == application_id)
    )
    # Add new ones
    for edu in app_data.education:
        edu_db = EducationDetails(
            application_id=application_id,
            **edu.model_dump()
        )
        if edu.total_marks > 0:
            edu_db.percentage = (edu.obtained_marks / edu.total_marks) * 100
        db.add(edu_db)
        
    # 6. Log the update Action
    status_log = ApplicationStatusLog(
        application_id=application_id,
        changed_by=app_data.user_id,
        changed_role="Applicant",
        status_id="draft", # reset to draft so they can upload documents again
        remark="Applicant updated the application form for revision."
    )
    db.add(status_log)
    
    # Update status to avoid being stuck in revision_required while uploading docs
    app_record.current_status = "draft"
    
    await db.commit()
    await db.refresh(app_record, ["applicant_details", "parent_details", "education_details"])
    
    return app_record

async def get_application_by_id(db: AsyncSession, application_id: int):
    # Eagerly load relationships to prevent async serialization errors
    query = select(Application).filter(Application.application_id == application_id).options(
        selectinload(Application.applicant_details),
        selectinload(Application.parent_details),
        selectinload(Application.education_details)
    )
    result = await db.execute(query)
    return result.scalars().first()

async def get_all_applications(db: AsyncSession):
    query = select(Application).options(
        selectinload(Application.applicant_details),
        selectinload(Application.parent_details),
        selectinload(Application.education_details)
    )
    result = await db.execute(query)
    return result.unique().scalars().all()

async def get_application_status_logs(db: AsyncSession, application_id: int):
    query = select(ApplicationStatusLog).filter(ApplicationStatusLog.application_id == application_id).order_by(ApplicationStatusLog.changed_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

async def finalize_application(db: AsyncSession, application_id: int, user_id: int):
    """
    Finalizes the application by checking for mandatory documents and updating the status.
    """
    # 1. Get Application
    application = await get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")
    
    # 2. Check and SELF-HEAL for Mandatory Documents
    from app.models.document import Document
    from sqlalchemy.future import select
    from sqlalchemy import update
    
    # First, try to find for CURRENT application
    result = await db.execute(select(Document).filter(Document.application_id == application_id))
    docs = result.scalars().all()
    
    # If NONE found, try to search for any orphaned documents for this USER
    if not docs:
        # Search for documents belonging to OTHER applications of this same user
        from app.models.application import Application
        subq = select(Application.application_id).filter(Application.user_id == user_id)
        result_orphaned = await db.execute(
            select(Document).filter(Document.application_id.in_(subq))
        )
        orphaned_docs = result_orphaned.scalars().all()
        
        if orphaned_docs:
            # AUTO-LINK: Update the application_id of these orphaned docs to the CURRENT one
            for d in orphaned_docs:
                d.application_id = application_id
            await db.commit()
            # Re-fetch docs for the rest of the logic
            docs = orphaned_docs
            print(f"Self-healed: Re-linked {len(docs)} documents to Application {application_id}")

    # Robust matching logic - use lowercase keyword search
    all_text = " ".join([f"{d.document_type} {d.document_name}" for d in docs]).lower()
    
    has_adhar = "adhar" in all_text
    has_photo = "photo" in all_text or "photograph" in all_text or "image" in all_text
    has_sign = "signature" in all_text or "sign" in all_text
    
    missing = []
    if not has_adhar: missing.append("Aadhar Card")
    if not has_photo: missing.append("Passport Photo")
    if not has_sign: missing.append("Signature")
    
    if missing:
        found_info = ", ".join([f"{d.document_type} ({d.document_name})" for d in docs]) or "None"
        raise HTTPException(
            status_code=400, 
            detail=f"Mandatory documents missing: {', '.join(missing)}. We found: {found_info}. Please ensure you have uploaded Aadhar, Photo, and Signature."
        )
    
    # 3. Update Status
    application.current_status = "submitted"
    application.submission_date = datetime.utcnow()
    
    # 4. Log the action
    log_entry = ApplicationStatusLog(
        application_id=application_id,
        changed_by=user_id,
        changed_role="Applicant",
        status_id="submitted",
        remark="Applicant finalized the application after uploading mandatory documents."
    )
    db.add(log_entry)
    
    await db.commit()
    await db.refresh(application)
    return application
