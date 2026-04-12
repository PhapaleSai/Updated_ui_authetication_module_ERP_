import asyncio
import sys
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import AsyncSessionLocal
from app.models.external import User, Course

async def main():
    async with AsyncSessionLocal() as db:
        try:
            # Create applicant mock user
            mock_applicant = User(user_id=1, full_name="Test Applicant", role="applicant")
            # Create admin mock user
            mock_admin = User(user_id=2, full_name="Test Admin", role="admin")
            
            # Create a mock course
            mock_course = Course(
                course_id=101,
                c_name="B.Tech Computer Science",
                duration=48,
                level="UG"
            )
            
            db.add_all([mock_applicant, mock_admin, mock_course])
            await db.commit()
            print("Successfully inserted mock User (id: 1, role: applicant), Admin (id: 2, role: admin), and Course (id: 101)!")
        except Exception as e:
            await db.rollback()
            print("Notice: Mock data already exists or error occurred:")
            print(str(e))

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
