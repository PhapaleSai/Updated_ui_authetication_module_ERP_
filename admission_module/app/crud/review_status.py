from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime

from app.models.review_status import AdminReview, ApplicationStatusLog
from app.models.application import Application
from app.models.external import User
from app.schemas.review_status import AdminReviewCreate
from fastapi import HTTPException

async def create_admin_review(db: AsyncSession, review_data: AdminReviewCreate):
    """
    Creates an admin review record and logs the status change.
    """
    # 0. Check User Role
    user_result = await db.execute(select(User).filter(User.user_id == review_data.admin_id))
    user = user_result.scalars().first()
    if not user or user.role not in ["admin", "registrar"]:
        raise HTTPException(status_code=403, detail="Only Admins or Registrars can perform reviews.")
    
    # 1. Store the Admin's Official Review Record
    new_review = AdminReview(
        application_id=review_data.application_id,
        admin_id=review_data.admin_id,
        action=review_data.action,  # 'Approve', 'Revision Required', 'Reject'
        remarks=review_data.remarks,
        timestamp=datetime.utcnow()
    )
    db.add(new_review)

    # 2. Map their action to our ENUM state machine logic
    new_status_code = ""
    if review_data.action == "Approve":
        new_status_code = "approved"
    elif review_data.action == "Revision Required":
        new_status_code = "revision_required"
    elif review_data.action == "Reject":
        new_status_code = "rejected"
    else:
        new_status_code = "under_review"

    # 3. Create the Status Log entry so applicants can 'see' the current state in tracking
    status_log = ApplicationStatusLog(
        application_id=review_data.application_id,
        changed_by=review_data.admin_id,
        changed_role="Admin",
        status_id=new_status_code,
        remark=review_data.remarks
    )
    db.add(status_log)
    
    # 4. Also update the main Application's 'current_status' for quick lookup
    # Need to query it first
    app_result = await db.execute(select(Application).filter(Application.application_id == review_data.application_id))
    app_record = app_result.scalars().first()
    
    if app_record:
        app_record.current_status = new_status_code
        db.add(app_record)

    await db.commit()
    await db.refresh(new_review)
    return new_review
