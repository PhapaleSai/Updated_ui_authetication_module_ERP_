import asyncio
from app.core.database import engine
from sqlalchemy import text

async def check_paths():
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT doc_id, document_type, file_path FROM documents WHERE application_id = 16"))
        for r in res:
            print(f"Doc ID: {r[0]} | Type: {r[1]} | Path: {r[2]}")

if __name__ == "__main__":
    asyncio.run(check_paths())
