from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# -----------------------
# USER
# -----------------------
# Create User
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

# Response User
class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

# ---------------------------
# Course Create
# ---------------------------
class CourseCreate(BaseModel):
    course_name: str
    department_id: int
    duration: str
    level: str


# ---------------------------
# Course Response
# ---------------------------
class CourseResponse(BaseModel):
    course_id: int
    course_name: str
    department_id: int
    duration: str
    level: str

    model_config = {
        "from_attributes": True
    }
# -----------------------
# APPLICATION
# -----------------------
class ApplicationCreate(BaseModel):
    user_id: int
    course_id: int
    admission_year: int


class ApplicationResponse(BaseModel):
    application_id: int
    user_id: int
    course_id: int
    admission_year: int
    current_status: Optional[str]
    form_approval: Optional[str]
    fee_approval: Optional[str]
    document_approval: Optional[str]
    subject_approval: Optional[str]

    model_config = {"from_attributes": True}

# -----------------------
# APPLICANT DETAILS
# -----------------------
class ApplicantDetailsCreate(BaseModel):
    application_id: int
    full_name: str
    dob: str
    gender: str
    blood_group: str
    nationality: str
    category: str
    marital_status: str
    disability_status: str
    aadhaar_no: str
    mobile_no: str
    email: str
    address: str
    parents_annual_income: str
    caste_category: str
    hostel_required: bool = False
    scholarship_required: bool = False

class ApplicantDetailsResponse(ApplicantDetailsCreate):
    applicant_id: int
    model_config = {"from_attributes": True}

# -----------------------
# PARENT DETAILS
# -----------------------
class ParentDetailsCreate(BaseModel):
    application_id: int
    name: str
    parent_type: str
    mobile_no: str
    email: str
    occupation: str

class ParentDetailsResponse(ParentDetailsCreate):
    parent_id: int
    model_config = {"from_attributes": True}

# -----------------------
# EDUCATION DETAILS
# -----------------------
class EducationDetailsCreate(BaseModel):
    application_id: int
    qualification_level: str
    institution_name: str
    university_board: str
    percentage_result: str
    admission_year: str
    passout_year: str
    attempt_count: int
    stream: str
    gap: str

class EducationDetailsResponse(EducationDetailsCreate):
    education_id: int
    model_config = {"from_attributes": True}