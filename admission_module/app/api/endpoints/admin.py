from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api.dependencies import get_db, get_current_user
from app.schemas import review_status as schemas
from app.schemas import application as app_schemas
from app.schemas import document as doc_schemas
from app.crud import review_status as crud
from app.crud import application as app_crud
from app.crud import document as doc_crud

router = APIRouter()

@router.get("/seed_mock_users")
async def seed_mock_users_endpoint(db: AsyncSession = Depends(get_db)):
    from app.models.external import User, Course
    from sqlalchemy.future import select
    
    # Check if user 1 exists
    res = await db.execute(select(User).filter(User.user_id == 1))
    if not res.scalars().first():
        mock_applicant = User(user_id=1, full_name="Test Applicant", role="applicant")
        mock_admin = User(user_id=2, full_name="Test Admin", role="admin")
        mock_course = Course(course_id=101, c_name="B.Tech Computer Science", duration=48, level="UG")
        
        db.add_all([mock_applicant, mock_admin, mock_course])
        await db.commit()
        return {"msg": "Successfully seeded users and courses!"}
    
    return {"msg": "Already seeded!"}

@router.get("/applications", response_model=List[app_schemas.ApplicationOut])
async def get_all_applications(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Get a list of all submitted applications.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return await app_crud.get_all_applications(db=db)

@router.get("/applications/{application_id}", response_model=app_schemas.ApplicationOut)
async def get_application_details(application_id: int, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Get detailed information about a specific application.
    """
    application = await app_crud.get_application_by_id(db, application_id=application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application Not Found.")
    return application

@router.post("/review", response_model=schemas.AdminReviewOut, status_code=status.HTTP_201_CREATED)
async def submit_application_review(review_in: schemas.AdminReviewCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Step 5: Admin reviews application and approves/rejects/requests revision.
    """
    application_id = review_in.application_id 
    
    # 1. Verify existence of the application
    application = await app_crud.get_application_by_id(db, application_id=application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application Not Found.")
       
    # 2. Add the Admin Review (which automatically updates the main status)
    new_review = await crud.create_admin_review(db=db, review_data=review_in)
    
    return new_review

@router.post("/document/verify", response_model=doc_schemas.DocumentVerificationOut, status_code=status.HTTP_201_CREATED)
async def verify_application_document(verify_in: doc_schemas.DocumentVerificationCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Admin verifies or rejects a specific document uploaded by the applicant.
    """
    return await doc_crud.verify_document(db=db, ver_data=verify_in)
