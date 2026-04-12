from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

# ----------------- Brochure Request -----------------
class BrochureRequestCreate(BaseModel):
    user_id: int # Given by external auth module upon login
    course_name: str # The name of the course they want a brochure for

class BrochureRequestOut(BaseModel):
    brochure_id: int
    user_id: int
    course_name: str
    brochure_status: str
    created_at: datetime
    updated_at: datetime

    # This config tells Pydantic to read the data even if it is not a dict, 
    # but an ORM model (i.e. an instance of the SQLAlchemy BrochureRequest class)
    model_config = ConfigDict(from_attributes=True)

# ----------------- Brochure Payment -----------------
class BroPaymentCreate(BaseModel):
    brochure_id: int
    # Amount is strictly 200 in the system, so we don't ask user to send it

class BroPaymentOut(BaseModel):
    payment_id: int
    brochure_id: int
    amount: int
    status: str
    paid_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
