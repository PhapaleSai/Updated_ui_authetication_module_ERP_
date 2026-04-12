import asyncio
from app.core.database import engine
from sqlalchemy import text

async def dedupe():
    print("--- DEDUPLICATING APP 16 ---")
    async with engine.connect() as conn:
        # First delete verification logs
        await conn.execute(text("DELETE FROM document_verification WHERE document_id = 7"))
        # Then delete the document record
        res = await conn.execute(text("DELETE FROM documents WHERE doc_id = 7"))
        print(f"Deleted {res.rowcount} duplicate records for App 16.")
        await conn.execute(text("COMMIT"))
    print("--- DEDUPLICATION COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(dedupe())
