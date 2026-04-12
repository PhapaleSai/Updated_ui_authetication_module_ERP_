from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class ApplicationStatusLogCreate(BaseModel):
    application_id: int
    changed_by: int
    changed_role: str
    status_id: str
    remark: Optional[str] = None

class ApplicationStatusLogOut(BaseModel):
    status_log_id: int
    application_id: int
    changed_by: int
    changed_role: str
    status_id: str
    remark: Optional[str]
    changed_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class AdminReviewCreate(BaseModel):
    application_id: int
    admin_id: int
    action: str
    remarks: str

class AdminReviewOut(BaseModel):
    review_id: int
    application_id: int
    admin_id: int
    action: str
    remarks: str
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)
