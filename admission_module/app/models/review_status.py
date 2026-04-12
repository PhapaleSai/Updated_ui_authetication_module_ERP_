from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
import enum
from datetime import datetime
from app.models.base import Base

class ApplicationStatus(enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    PENDING_VERIFICATION = "pending_verification"
    REVISION_REQUIRED = "revision_required"
    APPROVED = "approved"
    REJECTED = "rejected"
    ENROLLED = "enrolled"

class ApplicationStatusLog(Base):
    __tablename__ = "application_status_log"
    
    # The 'State Machine' table that tracks exactly WHO changed the status and WHEN
    status_log_id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("application.application_id"), nullable=False)
    
    # We record who made the change to know if it was Applicant or Admin
    changed_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    changed_role = Column(String(50), nullable=False) # 'Admin' or 'Applicant'
    
    status_id = Column(String(50), nullable=False) # Link to our enums above -> e.g. "APPROVED"
    remark = Column(String(500)) # Explanation of the change for audit trails
    
    changed_at = Column(DateTime, default=datetime.utcnow)

class AdminReview(Base):
    __tablename__ = "admin_review"
    
    review_id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("application.application_id"), nullable=False)
    admin_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    
    # What the admin decided -> 'Approve', 'Revision Required', 'Reject'
    action = Column(String(100), nullable=False)
    remarks = Column(String(1000))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
class Enrollment(Base):
    __tablename__ = "enrollment"
    
    # The very final stage of the application process
    enrollment_id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("application.application_id"), nullable=False, unique=True)
    
    enrollment_status = Column(String(50), default="Enrolled")
    enrollment_date = Column(DateTime, default=datetime.utcnow)
