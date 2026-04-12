import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

async def test_conn():
    try:
        engine = create_async_engine(settings.sqlalchemy_database_uri)
        async with engine.connect() as conn:
            print("Successfully connected to the database!")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
