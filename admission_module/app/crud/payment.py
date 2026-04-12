from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime

from app.models.payment import Payment
from app.models.application import Application
from app.models.review_status import ApplicationStatusLog, Enrollment
from app.schemas.payment import PaymentCreate
from fastapi import HTTPException

async def create_admission_payment(db: AsyncSession, payment_data: PaymentCreate):
    """
    Records the final admission fee payment.
    """
    # Check if payment or enrollment already exists
    res = await db.execute(select(Enrollment).filter(Enrollment.application_id == payment_data.application_id))
    if res.scalars().first():
        raise HTTPException(status_code=400, detail="Application is already enrolled.")

    new_payment = Payment(
        application_id=payment_data.application_id,
        amount=payment_data.amount,
        status="Paid",
        paid_at=datetime.utcnow()
    )
    db.add(new_payment)
    
    # Also update application status to 'enrolled'
    res = await db.execute(select(Application).filter(Application.application_id == payment_data.application_id))
    app_record = res.scalars().first()
    if app_record:
        app_record.current_status = "enrolled"
        db.add(app_record)
        
        from sqlalchemy import update
        await db.execute(update(Application).where(Application.application_id == payment_data.application_id).values(current_status="enrolled"))
        
        # Add to Status Log
        log = ApplicationStatusLog(
            application_id=payment_data.application_id,
            changed_by=app_record.user_id,
            changed_role="Applicant",
            status_id="enrolled",
            remark="Admission fee paid successfully. Official enrollment complete."
        )
        db.add(log)
        
        # Add Enrollment Record
        enroll = Enrollment(
            application_id=payment_data.application_id,
            enrollment_status="Enrolled",
            enrollment_date=datetime.utcnow()
        )
        db.add(enroll)

    await db.commit()
    await db.refresh(new_payment)
    return new_payment
