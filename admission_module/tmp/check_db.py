import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine

async def check_db():
    # Attempting to load .env variables manually for check if needed or just use strings
    # But usually settings should handle it. 
    # Let's just try to connect to the DB in .env
    from dotenv import load_dotenv
    load_dotenv()
    
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "shravani")
    server = os.getenv("POSTGRES_SERVER", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "Admission_Enrollment_DB")
    
    url = f"postgresql+asyncpg://{user}:{password}@{server}:{port}/{db}"
    print(f"Connecting to {url}...")
    try:
        engine = create_async_engine(url)
        async with engine.connect() as conn:
            print("Successfully connected to the database!")
            await conn.close()
    except Exception as e:
        print(f"Failed to connect to the database: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_db())
