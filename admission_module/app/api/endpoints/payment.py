from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.schemas import payment as schemas
from app.crud import payment as crud
from app.crud import application as app_crud

router = APIRouter()

@router.post("/admission-fee", response_model=schemas.PaymentOut, status_code=status.HTTP_201_CREATED)
async def pay_admission_fee(payment_in: schemas.PaymentCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Final Admission Fee handling! This must only happen if the application is highly vetted.
    """
    # Ensure application is APPROVED before they can pay
    application = await app_crud.get_application_by_id(db, application_id=payment_in.application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application Not Found")
        
    if application.current_status.upper() != "APPROVED":
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot pay admission fee. Application status is currently {application.current_status}. Must be APPROVED."
        )
        
    return await crud.create_admission_payment(db=db, payment_data=payment_in)
