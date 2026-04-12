from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from app.database import Base
from datetime import datetime


# -----------------------
# USER TABLE
# -----------------------
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# -----------------------
# ADMIN TABLE
# -----------------------
class Admin(Base):
    __tablename__ = "admin"

    admin_id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String) # e.g. SuperAdmin, AdmissionOfficer
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# -----------------------
# COURSE TABLE
# -----------------------
class Course(Base):
    __tablename__ = "courses"

    course_id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String)
    department_id = Column(Integer)
    duration = Column(String)
    level = Column(String)


# -----------------------
# APPLICATION TABLE
# -----------------------
class Application(Base):
    __tablename__ = "applications"

    application_id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.user_id"))
    course_id = Column(Integer, ForeignKey("courses.course_id"))

    application_date = Column(DateTime, default=datetime.utcnow)
    submission_date = Column(DateTime)

    admission_year = Column(Integer)
    
    # Admin Review Statuses
    form_approval = Column(String, default="Not Checked")
    fee_approval = Column(String, default="Not Checked")
    document_approval = Column(String, default="Not Checked")
    subject_approval = Column(String, default="Not Checked")

    current_status = Column(String, default="Pending")

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# -----------------------
# BROCHURE REQUEST TABLE
# -----------------------
class BrochureRequest(Base):
    __tablename__ = "brochure_requests"

    brochure_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    course_id = Column(Integer, ForeignKey("courses.course_id"))
    status = Column(String, default="Pending")
    payment_status = Column(String, default="Unpaid")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# -----------------------
# APPLICANT DETAILS TABLE
# -----------------------
class ApplicantDetails(Base):
    __tablename__ = "applicant_details"

    applicant_id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.application_id"), unique=True) # 1:1 relation
    
    full_name = Column(String)
    dob = Column(String)
    gender = Column(String)
    blood_group = Column(String)
    nationality = Column(String)
    category = Column(String)
    marital_status = Column(String)
    disability_status = Column(String)
    aadhaar_no = Column(String)
    mobile_no = Column(String)
    email = Column(String)
    address = Column(String)
    parents_annual_income = Column(String)
    caste_category = Column(String)
    
    # Requirements
    hostel_required = Column(Boolean, default=False)
    scholarship_required = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# -----------------------
# PARENT DETAILS TABLE
# -----------------------
class ParentDetails(Base):
    __tablename__ = "parent_details"

    parent_id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.application_id"))
    
    name = Column(String)
    parent_type = Column(String) # For example: "Father", "Mother", "Guardian"
    mobile_no = Column(String)
    email = Column(String)
    occupation = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# -----------------------
# EDUCATION DETAILS TABLE
# -----------------------
class EducationDetails(Base):
    __tablename__ = "education_details"

    education_id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.application_id"))
    
    qualification_level = Column(String) # e.g., "10th", "12th", "Undergraduate"
    institution_name = Column(String)
    university_board = Column(String)
    percentage_result = Column(String)
    admission_year = Column(String)
    passout_year = Column(String)
    attempt_count = Column(Integer)
    stream = Column(String)
    gap = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
