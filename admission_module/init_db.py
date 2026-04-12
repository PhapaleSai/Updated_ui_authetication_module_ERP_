import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import asyncio
from app.core.database import engine
from app.models.base import Base
# Import all models to ensure they are registered with Base.metadata
from app.models import application, brochure, document, review_status, external, payment

async def init_db():
    print("Creating tables for admission module...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_db())
