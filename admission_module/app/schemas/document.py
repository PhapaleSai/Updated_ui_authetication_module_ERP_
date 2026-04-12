from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional

class DocumentVerificationCreate(BaseModel):
    document_id: int
    admin_id: int
    status: str # 'Verified' or 'Rejected'
    remarks: Optional[str] = None

class DocumentVerificationOut(BaseModel):
    verification_id: int
    document_id: int
    admin_id: int
    status: str
    remarks: Optional[str]

    model_config = ConfigDict(from_attributes=True)

# Output Schema for Document Upload (Input is via Form-Data in FastAPI, not JSON)
class DocumentOut(BaseModel):
    doc_id: int
    application_id: int
    document_type: str
    document_name: Optional[str] = None
    status: str
    file_path: str
    file_type: str
    file_size: int
    verifications: List[DocumentVerificationOut] = []

    model_config = ConfigDict(from_attributes=True)
