import asyncio
import sys
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import async_session_maker
from app.models.external import User, Course

async def main():
    try:
        async with async_session_maker() as db:
            mock_applicant = User(user_id=1, full_name="Test Applicant", role="applicant")
            mock_admin = User(user_id=2, full_name="Test Admin", role="admin")
            
            mock_course = Course(
                course_id=101,
                c_name="B.Tech Computer Science",
                duration=48,
                level="UG"
            )
            
            db.add_all([mock_applicant, mock_admin, mock_course])
            await db.commit()
            
            with open("seed_python_out.txt", "w") as f:
                f.write("Successfully seeded!\n")
    except Exception as e:
        with open("seed_python_out.txt", "w") as f:
            f.write(f"Exception happened: {str(e)}\n")
            import traceback
            f.write(traceback.format_exc())

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
