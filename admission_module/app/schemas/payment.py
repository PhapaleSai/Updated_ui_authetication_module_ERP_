from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class PaymentCreate(BaseModel):
    application_id: int
    amount: float
    # In a real app we'd have a transaction_id from a payment gateway like Stripe or Razorpay

class PaymentOut(BaseModel):
    payment_id: int
    application_id: int
    amount: float
    status: str
    paid_at: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)
