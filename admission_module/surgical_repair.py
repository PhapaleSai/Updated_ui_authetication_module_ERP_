import asyncio
import os
import re
from app.core.database import engine
from sqlalchemy import text

async def surgical_repair():
    print("--- STARTING SURGICAL DOCUMENT REPAIR ---")
    upload_dir = "uploaded_documents"
    
    if not os.path.exists(upload_dir):
        print(f"Error: Directory '{upload_dir}' not found.")
        return

    files = os.listdir(upload_dir)
    print(f"Found {len(files)} files on disk.")

    async with engine.connect() as conn:
        for filename in files:
            # Pattern: app_{application_id}_{document_type}_{original_name}
            match = re.match(r"app_(\d+)_([^_]+)_", filename)
            if not match:
                continue
                
            app_id = int(match.group(1))
            doc_type = match.group(2)
            
            # Map shorthand types from filenames to expected keys
            mapping = {
                'adhar': 'adhar_no',
                'adhar_no': 'adhar_no',
                'photo': 'photo',
                'signature': 'signature',
                'sign': 'signature'
            }
            final_type = mapping.get(doc_type.lower(), doc_type)
            
            file_path = os.path.join(upload_dir, filename).replace("\\", "/")
            
            # Check if this application exists
            res = await conn.execute(text(f"SELECT application_id FROM application WHERE application_id = {app_id}"))
            if not res.fetchone():
                print(f"  [SKIPPING] App {app_id} does not exist in DB (File: {filename})")
                continue

            print(f"  [PROCESSING] App {app_id} | Type: {doc_type} | File: {filename}")
            
            # Upsert document record
            # 1. Check if already exists for this app and type
            res_doc = await conn.execute(text(f"SELECT doc_id FROM documents WHERE application_id = {app_id} AND document_type = '{final_type}'"))
            existing_doc = res_doc.fetchone()
            
            if existing_doc:
                print(f"    - Updating existing record {existing_doc[0]}")
                await conn.execute(text(f"UPDATE documents SET document_type = '{final_type}', file_path = '{file_path}', status = 'Pending' WHERE doc_id = {existing_doc[0]}"))
            else:
                print(f"    - Creating new record")
                # We need to provide basic metadata
                await conn.execute(text(f"""
                    INSERT INTO documents (application_id, document_type, document_name, file_path, file_type, file_size, status)
                    VALUES ({app_id}, '{final_type}', '{filename.split('_')[-1]}', '{file_path}', 'image/unknown', 0, 'Pending')
                """))
        
        await conn.execute(text("COMMIT"))
    print("\n--- SURGICAL REPAIR COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(surgical_repair())
