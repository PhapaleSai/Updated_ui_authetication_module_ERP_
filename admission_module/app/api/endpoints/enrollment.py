from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.dependencies import get_db
from app.schemas import enrollment as schemas
from app.crud import enrollment as crud
from app.models.payment import Payment

router = APIRouter()

@router.post("/create", response_model=schemas.EnrollmentOut, status_code=status.HTTP_201_CREATED)
async def finalize_enrollment(enroll_in: schemas.EnrollmentCreate, db: AsyncSession = Depends(get_db)):
    """
    Final step! Converts an approved and paid application into a full Enrollment Record.
    """
    # Verify the Admission Fee has been paid
    payment_query = await db.execute(select(Payment).filter(Payment.application_id == enroll_in.application_id))
    payment_record = payment_query.scalars().first()
    
    if not payment_record or payment_record.status != "Paid":
        raise HTTPException(
            status_code=400, 
            detail="Cannot enroll. Final admission fee payment has not been made."
        )
        
    return await crud.generate_enrollment(db=db, enroll_data=enroll_in)
