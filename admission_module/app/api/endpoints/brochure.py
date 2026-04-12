from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api.dependencies import get_db, get_current_user
from app.schemas import brochure as schemas
from app.crud import brochure as crud

router = APIRouter()

@router.post("/request", response_model=schemas.BrochureRequestOut, status_code=status.HTTP_201_CREATED)
async def request_brochure(brochure_in: schemas.BrochureRequestCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Step 1: An applicant requests a brochure for a specific course.
    """
    brochure_in.user_id = current_user.user_id
    return await crud.create_brochure_request(db=db, request_data=brochure_in)

@router.post("/pay", response_model=schemas.BroPaymentOut, status_code=status.HTTP_201_CREATED)
async def pay_for_brochure(payment_in: schemas.BroPaymentCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Step 2: Applicant pays the required 200rs fee for the brochure.
    This also updates the Brochure Status to 'Payment Done'.
    """
    # 1. Verify the brochure exists
    brochure = await crud.get_brochure_by_id(db, brochure_id=payment_in.brochure_id)
    if not brochure:
        raise HTTPException(status_code=404, detail="Brochure Request not found.")
        
    # 2. Check if already paid
    if brochure.brochure_status == "Payment Done":
        raise HTTPException(status_code=400, detail="Brochure fee already paid.")
        
    # 3. Process payment
    return await crud.pay_brochure_fee(db=db, payment_data=payment_in)
