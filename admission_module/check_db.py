import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def f():
    engine = create_async_engine(settings.sqlalchemy_database_uri)
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT application_id, current_status, course_name FROM application;"))
        print("Applications:", res.fetchall())
    await engine.dispose()

asyncio.run(f())
