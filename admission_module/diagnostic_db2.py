import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.future import select

async def check():
    # Attempt to connect to the dedicated database
    uri = "postgresql+asyncpg://postgres:sai123@localhost:5432/Admission_Enrollment_DB"
    engine = create_async_engine(uri)
    try:
        async with engine.connect() as conn:
            print("Successfully connected to Admission_Enrollment_DB")
            # Check for application table
            try:
                from sqlalchemy import text
                res = await conn.execute(text("SELECT application_id FROM application ORDER BY application_id DESC LIMIT 1"))
                row = res.fetchone()
                if row:
                    print(f"LATEST APPLICATION ID IN THIS DB: {row[0]}")
                else:
                    print("Application table is empty in this DB.")
            except Exception as e:
                print(f"Table error: {e}")
    except Exception as e:
        print(f"Connection error to Admission_Enrollment_DB: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check())
