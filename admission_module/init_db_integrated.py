import asyncio
from app.core.database import engine
from app.models.base import Base

# Import all models to ensure they are registered with Base.metadata
from app.models.external import User, Course
from app.models.brochure import BrochureRequest, BroPayment
from app.models.application import Application, ApplicantDetails, ParentDetails, EducationDetails
from app.models.document import Document, DocumentVerification
from app.models.review_status import ApplicationStatusLog

async def init_db():
    print("Starting Database Initialization for Admission Module in pvg_auth...")
    async with engine.begin() as conn:
        # Create all tables that don't exist
        # This will create brochure_requests, application, etc.
        # It won't touch 'users' if it already exists, unless columns are missing.
        await conn.run_sync(Base.metadata.create_all)
    print("Database Initialization Complete.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_db())
