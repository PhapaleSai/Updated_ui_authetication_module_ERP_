import asyncio
import sys

from app.db.database import async_session_maker
from app.crud.application import get_all_applications
from app.schemas.application import ApplicationOut

async def main():
    try:
        async with async_session_maker() as db:
            print("Fetching applications from Database...")
            apps = await get_all_applications(db)
            print(f"Total applications retrieved: {len(apps)}")
            
            for app in apps:
                print(f"Validating app ID: {app.application_id}")
                try:
                    # Validate against pydantic schema
                    parsed = ApplicationOut.model_validate(app)
                    print(f"  [OK] Validated ID {app.application_id}")
                except Exception as e:
                    print(f"  [ERROR] Validation failed for ID {app.application_id}:")
                    print(e)
    except Exception as e:
        print("Fatal error:")
        print(e)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
