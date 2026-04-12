from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class EnrollmentCreate(BaseModel):
    application_id: int

class EnrollmentOut(BaseModel):
    enrollment_id: int
    application_id: int
    enrollment_status: str
    enrollment_date: datetime
    
    model_config = ConfigDict(from_attributes=True)
