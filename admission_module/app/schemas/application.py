from pydantic import BaseModel, ConfigDict, Field, model_validator
from datetime import date, datetime
from typing import List, Optional

# ----------------- Sub-Models for Application Details -----------------
class ApplicantDetailsCreate(BaseModel):
    full_name: str
    dob: date
    birth_place: Optional[str] = None
    gender: str
    blood_group: Optional[str] = None
    marital_status: str
    
    abc_id: Optional[str] = None
    email: str
    mobile_number: str
    religion: str
    
    adhar_number: str = Field(..., max_length=12, min_length=12)
    nationality: str = "Indian"
    caste_category: str
    
    is_disable_handicap: str = "No" # "Yes" or "No"
    hosteller_or_day_scholar: str # "Hosteller" or "Day Scholar"
    is_scholarship_student: str = "No" # "Yes" or "No"
    
    mother_tongue: Optional[str] = None
    minority: str = "No" # "Yes" or "No"
    academic_year: Optional[str] = None
    
    # Permanent Address
    perm_area: str
    perm_city: str
    perm_country: str = "India"
    perm_state: str
    perm_district: str
    perm_taluka: str
    perm_pin: str
    
    # Temporary Address
    temp_area: str
    temp_city: str
    temp_country: str = "India"
    temp_state: str
    temp_district: str
    temp_taluka: str
    temp_pin: str

class ParentDetailsCreate(BaseModel):
    parent_relationship: str # e.g., 'Father', 'Guardian'
    name: str # Father/Guardian Name
    mother_name: str
    occupation: Optional[str] = None
    email: Optional[str] = None
    mobile_number: str
    annual_income: float
    
    # Guardian Details
    guardian_name: Optional[str] = None
    guardian_occupation: Optional[str] = None
    guardian_email: Optional[str] = None
    guardian_mobile: Optional[str] = None

class EducationDetailsCreate(BaseModel):
    last_qualification_level: str # e.g., '10th', '12th'
    last_institution_college_name: str
    university_board: str
    passout_year: int
    passing_month: Optional[str] = None
    last_exam_seat_no: Optional[str] = None
    
    total_marks: int
    obtained_marks: int
    percentage: Optional[float] = None # Will be calculated if possible
    
    batch_year: Optional[str] = None
    stream: Optional[str] = None
    grade: Optional[str] = None
    attempt_count: int = 1
    gap_in_education: str = "No" # "Yes" or "No"
    exam_center_code: Optional[str] = None
    
    previous_college_name: Optional[str] = None

    @model_validator(mode='after')
    def calculate_percentage(self) -> 'EducationDetailsCreate':
        if self.total_marks and self.total_marks > 0 and self.obtained_marks is not None:
            self.percentage = (self.obtained_marks / self.total_marks) * 100
        return self

# ----------------- Master Application Submission Model -----------------
class ApplicationCreate(BaseModel):
    user_id: int
    brochure_id: int
    course_name: str
    admission_year: int
    
    applicant: ApplicantDetailsCreate
    parent_details: ParentDetailsCreate
    education: List[EducationDetailsCreate]

class ApplicantDetailsOut(ApplicantDetailsCreate):
    applicant_id: int
    
    religion: Optional[str] = None
    gender: Optional[str] = None
    caste_category: Optional[str] = None
    marital_status: Optional[str] = None
    hosteller_or_day_scholar: Optional[str] = None
    
    perm_area: Optional[str] = None
    perm_city: Optional[str] = None
    perm_state: Optional[str] = None
    perm_district: Optional[str] = None
    perm_taluka: Optional[str] = None
    perm_pin: Optional[str] = None
    
    temp_area: Optional[str] = None
    temp_city: Optional[str] = None
    temp_state: Optional[str] = None
    temp_district: Optional[str] = None
    temp_taluka: Optional[str] = None
    temp_pin: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class ParentDetailsOut(ParentDetailsCreate):
    parent_id: int
    
    parent_relationship: Optional[str] = None
    name: Optional[str] = None
    mother_name: Optional[str] = None
    mobile_number: Optional[str] = None
    annual_income: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)

class EducationDetailsOut(EducationDetailsCreate):
    education_id: int
    
    last_qualification_level: Optional[str] = None
    last_institution_college_name: Optional[str] = None
    university_board: Optional[str] = None
    passout_year: Optional[int] = None
    total_marks: Optional[int] = None
    obtained_marks: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

# ----------------- Output Models -----------------
class ApplicationOut(BaseModel):
    application_id: int
    user_id: int
    brochure_id: int
    course_name: str
    current_status: Optional[str] = "draft"
    is_active: Optional[bool] = True
    is_active_or_not: Optional[bool] = True
    submission_date: Optional[datetime] = None
    admission_year: Optional[int] = None
    created_at: datetime
    
    applicant_details: Optional[ApplicantDetailsOut] = None
    parent_details: Optional[ParentDetailsOut] = None
    education_details: List[EducationDetailsOut] = []

    model_config = ConfigDict(from_attributes=True)
