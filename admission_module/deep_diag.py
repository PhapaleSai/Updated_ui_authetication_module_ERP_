import asyncio
from app.core.database import engine
from sqlalchemy import text

async def deep_diagnostic():
    async with engine.connect() as conn:
        # 1. Total count of documents
        res_docs = await conn.execute(text("SELECT count(*) FROM documents"))
        count = res_docs.scalar()
        print(f"TOTAL DOCUMENTS IN DB: {count}")
        
        # 2. List some documents if any
        if count > 0:
            res_list = await conn.execute(text("SELECT application_id, document_type, document_name FROM documents LIMIT 10"))
            rows = res_list.fetchall()
            for r in rows:
                print(f" - App: {r[0]}, Type: {r[1]}, Name: {r[2]}")
                
        # 3. Total count of applications
        res_apps = await conn.execute(text("SELECT count(*) FROM application"))
        app_count = res_apps.scalar()
        print(f"TOTAL APPLICATIONS IN DB: {app_count}")
        
        # 4. Check for current user's brochure status
        # Since uploader_id is passed as 67 in logs
        res_user_apps = await conn.execute(text("SELECT application_id, current_status FROM application WHERE user_id = 67"))
        user_apps = res_user_apps.fetchall()
        print(f"APPLICATIONS FOR USER 67: {len(user_apps)}")
        for ua in user_apps:
            print(f" - ID: {ua[0]}, Status: {ua[1]}")

if __name__ == "__main__":
    asyncio.run(deep_diagnostic())
