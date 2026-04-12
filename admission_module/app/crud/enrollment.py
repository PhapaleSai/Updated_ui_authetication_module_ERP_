from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime

from app.models.review_status import Enrollment, ApplicationStatusLog
from app.models.application import Application
from app.schemas.enrollment import EnrollmentCreate

async def generate_enrollment(db: AsyncSession, enroll_data: EnrollmentCreate):
    """
    Creates the final student enrollment record.
    """
async def generate_enrollment(db: AsyncSession, enroll_data: EnrollmentCreate):
    """
    Creates the final student enrollment record.
    """
    # 1. Create Enrollment
    new_enrollment = Enrollment(
        application_id=enroll_data.application_id,
        enrollment_status="Enrolled",
        enrollment_date=datetime.utcnow()
    )
    db.add(new_enrollment)
    
    # 2. Update the main application status to 'ENROLLED'
    app_query = await db.execute(select(Application).filter(Application.application_id == enroll_data.application_id))
    app_record = app_query.scalars().first()
    if app_record:
        app_record.current_status = "ENROLLED"
        db.add(app_record)
        
    # 3. Log the status switch in history
    status_log = ApplicationStatusLog(
        application_id=enroll_data.application_id,
        changed_by=1, # Fixed to 1 to avoid Foreign Key violation with mock user
        changed_role="System",
        status_id="ENROLLED",
        remark="Student officially enrolled after fee payment."
    )
    db.add(status_log)
    
    await db.commit()
    await db.refresh(new_enrollment)
    return new_enrollment
