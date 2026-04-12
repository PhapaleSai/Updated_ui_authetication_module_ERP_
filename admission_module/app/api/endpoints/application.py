from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api.dependencies import get_db, get_current_user
from app.schemas import application as schemas
from app.schemas import review_status as review_schemas
from app.crud import application as crud
from app.crud import brochure as brochure_crud
from app.crud import document as doc_crud

router = APIRouter()
@router.post("/submit", response_model=schemas.ApplicationOut, status_code=status.HTTP_201_CREATED)
async def submit_application(app_in: schemas.ApplicationCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Step 1 (Application): Applicant submits their entire application payload.
    Status starts as 'draft' until documents are uploaded and finalized.
    """
    # 1. Validate Brochure Exists and is Paid
    brochure = await brochure_crud.get_brochure_by_id(db, brochure_id=app_in.brochure_id)
    if not brochure:
        raise HTTPException(status_code=404, detail="Brochure Request not found.")
        
    if brochure.brochure_status != "Payment Done":
         raise HTTPException(status_code=400, detail="Brochure fee strictly required before application submission.")
    
    # 2. Check course name match
    if brochure.course_name != app_in.course_name:
         raise HTTPException(status_code=400, detail="Application Course name does not match Brochure Course name.")
    
    # 3. Submit application in 'draft' status
    # Force the application to be tied to the authenticated user's ID
    app_in.user_id = current_user.user_id
    
    application = await crud.create_full_application(db=db, app_data=app_in)
    
    # Update for initial draft status (if not already handled in CRUD)
    application.current_status = "draft"
    await db.commit()
    
    return application

@router.put("/{application_id}/update", response_model=schemas.ApplicationOut)
async def update_application(application_id: int, app_in: schemas.ApplicationCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Applicant updates an existing application when a revision is required.
    """
    return await crud.update_full_application(db=db, application_id=application_id, app_data=app_in)

@router.post("/{application_id}/finalize", response_model=schemas.ApplicationOut)
async def finalize_application_final(application_id: int, user_id: int, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Step 3 (Application): Applicant finalizes the application.
    Checks for mandatory documents before moving from 'draft' to 'submitted'.
    """
    return await crud.finalize_application(db=db, application_id=application_id, user_id=user_id)

@router.get("/{application_id}/status", response_model=List[review_schemas.ApplicationStatusLogOut])
async def get_application_status_tracking(application_id: int, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Applicant can track the progress of their application through status logs.
    """
    # Verify app exists
    application = await crud.get_application_by_id(db, application_id=application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application Not Found.")
        
    return await crud.get_application_status_logs(db=db, application_id=application_id)
