from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from datetime import datetime
from fastapi import HTTPException

from app.models.document import Document, DocumentVerification
from app.models.external import User
from app.models.review_status import ApplicationStatusLog
from app.schemas.document import DocumentVerificationCreate

async def upload_document_record(db: AsyncSession, application_id: int, document_type: str, document_name: str, file_path: str, file_type: str, file_size: int, uploader_id: int):
    """
    Creates or UPDATES a record in the database for the uploaded file and logs the action.
    """
    # 1. Check for existing document of this type for this application
    existing_res = await db.execute(
        select(Document).filter(
            Document.application_id == application_id,
            Document.document_type == document_type
        )
    )
    doc = existing_res.scalars().first()

    if doc:
        # Update existing
        doc.file_path = file_path
        doc.file_type = file_type
        doc.file_size = file_size
        doc.status = "Pending"
        doc.document_name = document_name
    else:
        # Create new
        doc = Document(
            application_id=application_id,
            document_type=document_type,
            document_name=document_name,
            file_path=file_path,
            file_type=file_type,
            file_size=file_size,
            status="Pending"
        )
        db.add(doc)
    
    # Log the action in ApplicationStatusLog
    log_entry = ApplicationStatusLog(
        application_id=application_id,
        changed_by=uploader_id,
        changed_role="Applicant",
        status_id="DOCUMENT_UPLOADED",
        remark=f"Document '{document_type}' ({document_name}) {'re-uploaded' if doc.doc_id else 'uploaded'}."
    )
    db.add(log_entry)
    
    await db.commit()
    await db.refresh(doc, ["verifications"])
    return doc

async def get_document_by_id(db: AsyncSession, doc_id: int):
    result = await db.execute(select(Document).filter(Document.doc_id == doc_id).options(selectinload(Document.verifications)))
    return result.scalars().first()

async def get_documents_by_application_id(db: AsyncSession, application_id: int):
    result = await db.execute(select(Document).filter(Document.application_id == application_id).options(selectinload(Document.verifications)))
    return result.scalars().all()

async def verify_document(db: AsyncSession, ver_data: DocumentVerificationCreate):
    # 0. Check User Role
    user_result = await db.execute(select(User).filter(User.user_id == ver_data.admin_id))
    user = user_result.scalars().first()
    if not user or user.role not in ["admin", "registrar"]:
        raise HTTPException(status_code=403, detail="Only Admins or Registrars can verify documents.")

    # 1. Update Document Status
    document = await get_document_by_id(db, ver_data.document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    document.status = ver_data.status # 'Verified' or 'Rejected'

    # 2. Record Verification details
    new_verification = DocumentVerification(
        document_id=ver_data.document_id,
        admin_id=ver_data.admin_id,
        status=ver_data.status,
        remarks=ver_data.remarks
    )
    db.add(new_verification)

    # 3. Log the action in ApplicationStatusLog
    log_entry = ApplicationStatusLog(
        application_id=document.application_id,
        changed_by=ver_data.admin_id,
        changed_role="Admin",
        status_id=f"DOCUMENT_{ver_data.status.upper()}",
        remark=f"Document '{document.document_type}' {ver_data.status.lower()} by Admin. Remarks: {ver_data.remarks}"
    )
    db.add(log_entry)
    
    await db.commit()
    await db.refresh(new_verification)
    return new_verification
