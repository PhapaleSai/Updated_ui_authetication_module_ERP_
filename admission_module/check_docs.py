import asyncio
import os
from app.core.database import engine
from sqlalchemy import text

async def diagnostic():
    async with engine.connect() as conn:
        # 1. Check Document Count
        res = await conn.execute(text("SELECT count(*) FROM documents"))
        count = res.scalar()
        print(f"--- DATABASE CHECK ---")
        print(f"Total Document Records in DB: {count}")
        
        # 2. Check Latest Records
        if count > 0:
            res = await conn.execute(text("SELECT doc_id, application_id, document_type, file_path FROM documents ORDER BY doc_id DESC LIMIT 5"))
            rows = res.fetchall()
            print("\nLatest Document Records:")
            for r in rows:
                print(f"  ID: {r[0]}, App: {r[1]}, Type: {r[2]}, Path: {r[3]}")
                # Check if file exists on disk
                if os.path.exists(r[3]):
                    print(f"    [FILE EXISTS ON DISK]")
                else:
                    print(f"    [FILE MISSING ON DISK: {r[3]}]")

        # 3. Check Filesystem directly
        print(f"\n--- FILESYSTEM CHECK ---")
        upload_dir = "uploaded_documents"
        if os.path.exists(upload_dir):
            files = os.listdir(upload_dir)
            print(f"Total Files in '{upload_dir}': {len(files)}")
            if len(files) > 0:
                print(f"Sample Files: {files[:5]}")
        else:
            print(f"Directory '{upload_dir}' NOT FOUND!")

if __name__ == "__main__":
    asyncio.run(diagnostic())
