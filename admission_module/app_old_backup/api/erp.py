from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models.models import User, Course, Application, ApplicantDetails, ParentDetails, EducationDetails
from app.schemas.schemas import (
    UserCreate, UserResponse,
    CourseCreate, CourseResponse,
    ApplicationCreate, ApplicationResponse,
    ApplicantDetailsCreate, ApplicantDetailsResponse,
    ParentDetailsCreate, ParentDetailsResponse,
    EducationDetailsCreate, EducationDetailsResponse
)

router = APIRouter()


# -----------------------
# USER API
# -----------------------
# ✅ CREATE USER
@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(
        username=user.username,
        email=user.email,
        password=user.password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

# ✅ GET ALL USERS
from typing import List

@router.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# ✅ CREATE COURSE
@router.post("/courses", response_model=CourseResponse)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    new_course = Course(
        course_name=course.course_name,
        department_id=course.department_id,
        duration=course.duration,
        level=course.level
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course


# ✅ GET ALL COURSES
@router.get("/courses")
def get_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()


# -----------------------
# APPLICATION API
# -----------------------
@router.post("/applications", response_model=ApplicationResponse)
def create_application(app: ApplicationCreate, db: Session = Depends(get_db)):
    new_app = Application(**app.dict())
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

# ✅ GET ALL APPLICATIONS
@router.get("/applications", response_model=List[ApplicationResponse])
def get_applications(db: Session = Depends(get_db)):
    return db.query(Application).all()

# -----------------------
# APPLICANT DETAILS API
# -----------------------
@router.post("/applicant-details", response_model=ApplicantDetailsResponse)
def create_applicant_details(details: ApplicantDetailsCreate, db: Session = Depends(get_db)):
    try:
        new_details = ApplicantDetails(**details.dict())
        db.add(new_details)
        db.commit()
        db.refresh(new_details)
        return new_details
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database Error: {str(e.orig)}")

@router.get("/applicant-details/{application_id}", response_model=ApplicantDetailsResponse)
def get_applicant_details(application_id: int, db: Session = Depends(get_db)):
    return db.query(ApplicantDetails).filter(ApplicantDetails.application_id == application_id).first()

# -----------------------
# PARENT DETAILS API
# -----------------------
@router.post("/parent-details", response_model=ParentDetailsResponse)
def create_parent_details(details: ParentDetailsCreate, db: Session = Depends(get_db)):
    try:
        new_details = ParentDetails(**details.dict())
        db.add(new_details)
        db.commit()
        db.refresh(new_details)
        return new_details
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database Error: Ensure the 'application_id' matches an existing Application.")

@router.get("/parent-details/{application_id}", response_model=List[ParentDetailsResponse])
def get_parent_details(application_id: int, db: Session = Depends(get_db)):
    return db.query(ParentDetails).filter(ParentDetails.application_id == application_id).all()

# -----------------------
# EDUCATION DETAILS API
# -----------------------
@router.post("/education-details", response_model=EducationDetailsResponse)
def create_education_details(details: EducationDetailsCreate, db: Session = Depends(get_db)):
    try:
        new_details = EducationDetails(**details.dict())
        db.add(new_details)
        db.commit()
        db.refresh(new_details)
        return new_details
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database Error: Ensure the 'application_id' matches an existing Application.")

@router.get("/education-details/{application_id}", response_model=List[EducationDetailsResponse])
def get_education_details(application_id: int, db: Session = Depends(get_db)):
    return db.query(EducationDetails).filter(EducationDetails.application_id == application_id).all()