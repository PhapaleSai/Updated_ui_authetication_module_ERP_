import asyncio
from app.core.database import engine
from sqlalchemy import text

async def diag():
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT doc_id, application_id, document_type, document_name, status FROM documents WHERE application_id = 16"))
        rows = res.fetchall()
        print(f"DOCUMENTS FOR APP 16: {len(rows)}")
        for r in rows:
            print(f"  ID: {r[0]} | Type: {r[1]} | Name: {r[2]} | Status: {r[3]}")

if __name__ == "__main__":
    asyncio.run(diag())
