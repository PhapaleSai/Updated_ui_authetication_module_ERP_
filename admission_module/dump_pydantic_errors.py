import asyncio
import sys
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.database import async_session_maker
from app.models.application import Application
from app.schemas.application import ApplicationOut

async def main():
    try:
        async with async_session_maker() as db:
            query = select(Application).options(
                selectinload(Application.applicant_details),
                selectinload(Application.parent_details),
                selectinload(Application.education_details)
            )
            result = await db.execute(query)
            apps = result.unique().scalars().all()
            
            with open("api_debug_out.txt", "w") as f:
                f.write(f"Total apps: {len(apps)}\n")
                for app in apps:
                    f.write(f"Checking {app.application_id}...\n")
                    try:
                        ApplicationOut.model_validate(app)
                        f.write(f"  Valid!\n")
                    except Exception as e:
                        f.write(f"  Invalid: {repr(e)}\n\n")
    except Exception as e:
        with open("api_debug_out.txt", "w") as f:
            f.write(f"Error fetching: {repr(e)}")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
