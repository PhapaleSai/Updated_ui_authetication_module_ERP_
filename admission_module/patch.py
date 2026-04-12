import asyncio
from sqlalchemy import update
from sqlalchemy.ext.asyncio import create_async_engine
from app.models.application import Application
from app.core.config import settings

async def f():
    engine = create_async_engine(settings.sqlalchemy_database_uri)
    async with engine.begin() as conn:
        await conn.execute(update(Application).where(Application.application_id.in_([3, 4])).values(current_status='enrolled'))
    await engine.dispose()
    print("Patched!")

asyncio.run(f())
