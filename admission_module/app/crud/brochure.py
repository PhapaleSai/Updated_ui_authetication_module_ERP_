from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime

from app.models.brochure import BrochureRequest, BroPayment
from app.schemas.brochure import BrochureRequestCreate, BroPaymentCreate

from app.models.external import User

async def create_brochure_request(db: AsyncSession, request_data: BrochureRequestCreate):
    """
    Creates a new brochure request in the database.
    """
    # Create the brochure request
    db_bro_req = BrochureRequest(
        user_id=request_data.user_id,
        course_name=request_data.course_name,
        brochure_status="Pending"
    )
    db.add(db_bro_req)
    await db.commit()
    await db.refresh(db_bro_req)
    return db_bro_req

async def get_brochure_by_id(db: AsyncSession, brochure_id: int):
    """
    Fetches a specific brochure request based on ID.
    """
    result = await db.execute(select(BrochureRequest).filter(BrochureRequest.brochure_id == brochure_id))
    return result.scalars().first()

async def pay_brochure_fee(db: AsyncSession, payment_data: BroPaymentCreate):
    """
    Creates a 200rs payment record and updates the brochure status to 'Payment Done'.
    """
    # 1. Create the payment record
    new_payment = BroPayment(
        brochure_id=payment_data.brochure_id,
        amount=200, # Hardcoded business rule for brochure
        status="Payment Done",
        paid_at=datetime.utcnow()
    )
    db.add(new_payment)
    
    # 2. Update the Brochure Request Status
    brochure = await get_brochure_by_id(db, payment_data.brochure_id)
    if brochure:
        brochure.brochure_status = "Payment Done"
        brochure.updated_at = datetime.utcnow()
        db.add(brochure)
        
    await db.commit()
    await db.refresh(new_payment)
    return new_payment
