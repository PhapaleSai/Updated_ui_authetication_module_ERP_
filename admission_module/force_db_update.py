import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

async def force_db_update():
    print("Connecting to database to force schema update...")
    engine = create_async_engine(settings.sqlalchemy_database_uri)
    
    try:
        async with engine.begin() as conn:
            # 1. Update documents table
            print("Updating 'documents' table...")
            await conn.execute(text("ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_name VARCHAR(150);"))
            await conn.execute(text("ALTER TABLE documents ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending';"))
            await conn.execute(text("ALTER TABLE documents ALTER COLUMN file_type TYPE VARCHAR(50);"))
            
            # 2. Ensure application_status_log can handle longer status names (e.g. DOCUMENT_UPLOADED)
            print("Updating 'application_status_log' table...")
            await conn.execute(text("ALTER TABLE application_status_log ALTER COLUMN status_id TYPE VARCHAR(100);"))
            
            print("Database schema updated successfully!")
            
    except Exception as e:
        print(f"Update failed: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(force_db_update())
