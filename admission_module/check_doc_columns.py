import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

async def check_columns():
    try:
        engine = create_async_engine(settings.sqlalchemy_database_uri)
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'documents'"))
            columns = [row[0] for row in result.fetchall()]
            print(f"documents columns: {columns}")
    except Exception as e:
        print(f"Check failed: {e}")

if __name__ == "__main__":
    asyncio.run(check_columns())
