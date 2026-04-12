import asyncio
import os
from app.core.database import engine
from sqlalchemy import text

async def deep_diagnostic():
    async with engine.connect() as conn:
        print("--- REPOSITORY INTEGRITY CHECK ---")
        
        # 1. Total records
        u_count = (await conn.execute(text("SELECT count(*) FROM users"))).scalar()
        a_count = (await conn.execute(text("SELECT count(*) FROM application"))).scalar()
        d_count = (await conn.execute(text("SELECT count(*) FROM documents"))).scalar()
        print(f"Users: {u_count}, Applications: {a_count}, Documents: {d_count}")
        
        # 2. Latest 5 Applications and their owner IDs
        print("\n--- LATEST 5 APPLICATIONS ---")
        res = await conn.execute(text("SELECT application_id, user_id, current_status FROM application ORDER BY application_id DESC LIMIT 5"))
        for r in res:
            print(f" App ID: {r[0]} | Owner (User ID): {r[1]} | Status: {r[2]}")
            
        # 3. Latest 10 Documents and their application IDs
        print("\n--- LATEST 10 DOCUMENTS ---")
        res = await conn.execute(text("SELECT doc_id, application_id, document_type FROM documents ORDER BY doc_id DESC LIMIT 10"))
        for r in res:
            print(f" Doc ID: {r[0]} | Linked App: {r[1]} | Type: {r[2]}")
            
        # 4. Check for "Orphaned" Users (logged in but no apps)
        print("\n--- LOGGED IN USER CHECK ---")
        # I'll check Application 15 specifically since it was the latest in the previous run
        res = await conn.execute(text("SELECT user_id FROM application WHERE application_id = 15"))
        user_15 = res.scalar()
        print(f"User who owns App 15: {user_15}")
        
        if user_15:
            res = await conn.execute(text(f"SELECT count(*) FROM documents WHERE application_id IN (SELECT application_id FROM application WHERE user_id = {user_15})"))
            count = res.scalar()
            print(f"Total documents belonging to user {user_15}: {count}")

if __name__ == "__main__":
    asyncio.run(deep_diagnostic())
