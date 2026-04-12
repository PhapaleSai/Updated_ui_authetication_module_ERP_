import asyncio
from app.core.database import engine
from sqlalchemy.future import select
from app.models.application import Application
from app.models.document import Document

async def diagnostic():
    async with engine.connect() as conn:
        # Latest application
        q_app = select(Application).order_by(Application.application_id.desc()).limit(1)
        res_app = await conn.execute(q_app)
        app = res_app.fetchone()
        
        if app:
            app_id = app[0]
            print(f"LATEST APPLICATION ID: {app_id}")
            print(f"User ID: {app[1]}")
            
            # Docs for this app
            q_docs = select(Document).filter(Document.application_id == app_id)
            res_docs = await conn.execute(q_docs)
            docs = res_docs.fetchall()
            print(f"DOCUMENT RECORDS FOUND FOR APP {app_id}: {len(docs)}")
            for d in docs:
                print(f" - ID: {d[0]}, Type: {d[2]}, Name: {d[3]}")
        else:
            print("NO APPLICATIONS FOUND IN DATABASE.")

if __name__ == "__main__":
    try:
        asyncio.run(diagnostic())
    except Exception as e:
        print(f"DIAGNOSTIC FAILED: {e}")
