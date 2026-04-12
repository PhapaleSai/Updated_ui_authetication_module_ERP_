from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Document(Base):
    __tablename__ = "documents"
    
    doc_id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("application.application_id"), nullable=False)
    
    # Types: 'adhar_no', 'photo', 'signature', 'passout_result', 'caste_certificate', etc.
    document_type = Column(String(100), nullable=False)
    document_name = Column(String(150), nullable=True) # Specific name for the file
    
    # Store its verification status here for easy querying
    status = Column(String(50), default="Pending") # 'Pending', 'Verified', 'Rejected'
    
    # Filesystem or storage details
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50)) # e.g. 'image/jpeg', 'image/png'
    file_size = Column(Integer) # in bytes
    
    verifications = relationship("DocumentVerification", back_populates="document")

class DocumentVerification(Base):
    __tablename__ = "document_verification"
    
    verification_id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.doc_id"), nullable=False)
    
    # Admin who verified the document
    admin_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    
    # 'Verified' or 'Rejected'
    status = Column(String(50), default="Pending")
    remarks = Column(String(500)) # If a user uploaded bad file, tell them why it failed
    
    document = relationship("Document", back_populates="verifications")
