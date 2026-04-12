import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from app.db.database import async_engine
from app.models.base import Base

# We need to import ALL models so they get registered with Base.metadata before drop/create
from app.models import external, brochure, application, document, payment, review_status

async def reset_database():
    print("Dropping all tables...", flush=True)
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    print("Recreating all tables from latest schema...", flush=True)
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    print("Database reset completed successfully!", flush=True)

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(reset_database())
