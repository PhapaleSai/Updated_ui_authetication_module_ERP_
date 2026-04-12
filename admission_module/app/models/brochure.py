from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class BrochureRequest(Base):
    __tablename__ = "brochure_request"

    # Primary key identifies the request uniquely
    brochure_id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys linking external user and external course tables
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    course_name = Column(String(200), nullable=False)
    
    # Status to track where the brochure request is in the pipeline
    brochure_status = Column(String(50), default="Pending")
    
    # Tracking time is extremely important for audit logs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships let SQLAlchemy fetch related rows automatically
    payments = relationship("BroPayment", back_populates="brochure")
    applications = relationship("Application", back_populates="brochure")

class BroPayment(Base):
    __tablename__ = "bro_payment"

    payment_id = Column(Integer, primary_key=True, index=True)
    brochure_id = Column(Integer, ForeignKey("brochure_request.brochure_id"), nullable=False)
    
    # Amount fixed to 200 based on the workflow requirements
    amount = Column(Integer, default=200, nullable=False)
    status = Column(String(50), default="Pending") # "Payment Done", etc
    paid_at = Column(DateTime, nullable=True)

    brochure = relationship("BrochureRequest", back_populates="payments")
