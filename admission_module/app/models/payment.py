from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from app.models.base import Base
from datetime import datetime

class Payment(Base):
    __tablename__ = "payment"
    
    # This payment table is specifically for the final Admission Fee prior to Enrollment
    payment_id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("application.application_id"), nullable=False)
    
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="Pending") # "Paid", "Failed"
    paid_at = Column(DateTime, nullable=True)
