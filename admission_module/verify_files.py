import asyncio
import os
from app.core.database import engine
from sqlalchemy import text

async def verify_files():
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT doc_id, file_path FROM documents WHERE application_id = 16"))
        for r in res:
            path = r[1]
            if os.path.exists(path):
                print(f"Doc {r[0]}: SUCCESS - File exists at {path}")
            else:
                print(f"Doc {r[0]}: FAIL - File NOT FOUND at {path}")

if __name__ == "__main__":
    asyncio.run(verify_files())
