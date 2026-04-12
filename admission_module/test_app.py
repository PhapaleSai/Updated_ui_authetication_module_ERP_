import asyncio
import sys
import traceback
from app.core.database import AsyncSessionLocal
from app.crud.application import get_all_applications
from app.schemas.application import ApplicationOut

async def test():
    with open("tmp\\test_out.txt", "w") as f:
        sys.stdout = f
        sys.stderr = f
        try:
            async with AsyncSessionLocal() as db:
                apps = await get_all_applications(db)
                print("Found apps:", len(apps))
                for a in apps:
                    print("App ID:", a.application_id)
                    schema_out = ApplicationOut.model_validate(a)
                    print("Serialize OK")
        except Exception as e:
            print("General error:", e)
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
