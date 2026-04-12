import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.models.base import Base
from app.core.config import settings
import app.models

async def f():
    engine = create_async_engine(settings.sqlalchemy_database_uri)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('Schema creation successful.')

asyncio.run(f())
