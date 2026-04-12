from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class Application(Base):
    __tablename__ = "application"
    
    # Primary Key
    application_id = Column(Integer, primary_key=True, index=True)
    
    # Links to the external tables and previous brochure phase
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    brochure_id = Column(Integer, ForeignKey("brochure_request.brochure_id"), nullable=False)
    course_name = Column(String(200), nullable=False)
    
    # Current status representation for quick lookups
    current_status = Column(String(50), default="draft")
    
    # Application life-cycle flags
    is_active = Column(Boolean, default=True)
    is_active_or_not = Column(Boolean, default=True)
    
    submission_date = Column(DateTime, nullable=True)
    admission_year = Column(Integer, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships to connect different pieces of the form
    brochure = relationship("BrochureRequest", back_populates="applications")
    applicant_details = relationship("ApplicantDetails", back_populates="application", uselist=False)
    parent_details = relationship("ParentDetails", back_populates="application", uselist=False)
    education_details = relationship("EducationDetails", back_populates="application")


class ApplicantDetails(Base):
    __tablename__ = "applicant_details"
    
    applicant_id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("application.application_id"), unique=True)
    
    # Core personal data points
    full_name = Column(String(150), nullable=False)
    dob = Column(Date, nullable=False)
    birth_place = Column(String(150))
    gender = Column(String(20), nullable=False)
    blood_group = Column(String(10))
    marital_status = Column(String(50))
    email = Column(String(150), nullable=False)
    mobile_number = Column(String(15), nullable=False)
    religion = Column(String(50))
    abc_id = Column(String(50))
    adhar_number = Column(String(12), nullable=False, unique=True)
    nationality = Column(String(50), default="Indian")
    caste_category = Column(String(50), nullable=False)
    
    is_disable_handicap = Column(String(10), default="No") # "Yes" or "No"
    hosteller_or_day_scholar = Column(String(20)) # "Hosteller" or "Day Scholar"
    is_scholarship_student = Column(String(10), default="No") # "Yes" or "No"
    
    mother_tongue = Column(String(50))
    minority = Column(String(10), default="No") # "Yes" or "No"
    academic_year = Column(String(50))
    
    # Permanent Address
    perm_area = Column(String(255))
    perm_city = Column(String(100))
    perm_country = Column(String(100), default="India")
    perm_state = Column(String(100))
    perm_district = Column(String(100))
    perm_taluka = Column(String(100))
    perm_pin = Column(String(10))
    
    # Temporary Address
    temp_area = Column(String(255))
    temp_city = Column(String(100))
    temp_country = Column(String(100), default="India")
    temp_state = Column(String(100))
    temp_district = Column(String(100))
    temp_taluka = Column(String(100))
    temp_pin = Column(String(10))
    
    # Note: File paths (photo, signature, etc.) are moved to the documents table
    
    application = relationship("Application", back_populates="applicant_details")


class ParentDetails(Base):
    __tablename__ = "parent_details"
    
    # One central parent details record per application
    parent_id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("application.application_id"), unique=True, nullable=False)
    
    parent_relationship = Column(String(50)) # e.g. "Father", "Guardian"
    name = Column(String(150), nullable=False) # Father/Guardian Name
    mother_name = Column(String(150), nullable=False)
    occupation = Column(String(150))
    email = Column(String(150))
    mobile_number = Column(String(15), nullable=False)
    annual_income = Column(Float, nullable=False)
    
    # Guardian Details (Optional)
    guardian_name = Column(String(150))
    guardian_occupation = Column(String(150))
    guardian_email = Column(String(150))
    guardian_mobile = Column(String(15))
    
    application = relationship("Application", back_populates="parent_details")


class EducationDetails(Base):
    __tablename__ = "education_details"
    
    education_id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("application.application_id"), nullable=False)
    
    # Chronological education records
    last_qualification_level = Column(String(50), nullable=False) 
    last_institution_college_name = Column(String(200), nullable=False)
    university_board = Column(String(150), nullable=False)
    passout_year = Column(Integer, nullable=False)
    passing_month = Column(String(20))
    last_exam_seat_no = Column(String(50))
    
    # Tracking academic performance
    total_marks = Column(Integer)
    obtained_marks = Column(Integer)
    percentage = Column(Float)
    batch_year = Column(String(50))
    stream = Column(String(50))
    grade = Column(String(20))
    attempt_count = Column(Integer, default=1)
    gap_in_education = Column(String(10), default="No") # "Yes" or "No"
    exam_center_code = Column(String(50))
    
    previous_college_name = Column(String(200))
    
    application = relationship("Application", back_populates="education_details")
