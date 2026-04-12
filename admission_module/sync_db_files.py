import os
import asyncio
from app.core.database import engine
from sqlalchemy.future import select
from sqlalchemy import text
from app.models.document import Document
from app.models.application import Application

# Directory where files are stored
UPLOAD_DIR = "uploaded_documents"

async def sync_files_to_db():
    if not os.path.exists(UPLOAD_DIR):
        print(f"Directory {UPLOAD_DIR} not found.")
        return

    async with engine.begin() as conn:
        print("Scanning uploaded_documents folder...")
        files = os.listdir(UPLOAD_DIR)
        print(f"Found {len(files)} files in directory.")

        for filename in files:
            # Pattern: app_{application_id}_{document_type}_{document_name}.ext
            if not filename.startswith("app_"):
                continue

            parts = filename.split("_")
            if len(parts) < 3:
                continue

            try:
                # Part 0: 'app'
                # Part 1: application_id
                app_id = int(parts[1])
                
                # The rest is a bit complex due to underscore in names
                # For safety, we'll try to infer document_type
                # Pattern: app_ID_TYPE_NAME.ext
                doc_type = parts[2]
                
                # Check if this app_id exists in the database
                res_app = await conn.execute(text(f"SELECT application_id FROM application WHERE application_id = {app_id}"))
                app_exists = res_app.fetchone()
                
                if not app_exists:
                    # SELF-HEALING: If it doesn't exist, we'll try to link it to the LATEST application in the DB
                    # This helps if the DB was reset but files remained
                    res_latest = await conn.execute(text("SELECT application_id FROM application ORDER BY application_id DESC LIMIT 1"))
                    latest_row = res_latest.fetchone()
                    if latest_row:
                        print(f"Warning: App {app_id} not found for {filename}. Re-linking to latest App {latest_row[0]}.")
                        app_id = latest_row[0]
                    else:
                        print(f"Skipping {filename}: No applications found in DB.")
                        continue

                # Check if document record already exists
                check_doc = await conn.execute(
                    text(f"SELECT doc_id FROM documents WHERE application_id = {app_id} AND document_type = '{doc_type}'")
                )
                if check_doc.fetchone():
                    print(f"Record for {filename} (App {app_id}) already exists. Skipping.")
                    continue

                # Create the record
                file_path_raw = os.path.join(UPLOAD_DIR, filename)
                file_path = file_path_raw.replace('\\', '/')
                file_size = os.path.getsize(file_path_raw)
                
                # Clean name from parts
                # Pattern: app_ID_TYPE_NAME
                doc_name = " ".join(parts[3:]).split(".")[0] or doc_type.replace("_", " ").title()

                stmt = text(f"""
                    INSERT INTO documents (application_id, document_type, document_name, status, file_path, file_size)
                    VALUES ({app_id}, '{doc_type}', '{doc_name}', 'Pending', '{file_path}', {file_size})
                """)
                await conn.execute(stmt)
                print(f"Successfully re-imported: {filename} -> App {app_id}")

            except Exception as e:
                print(f"Error processing {filename}: {e}")

    print("\nSynchronization complete.")

if __name__ == "__main__":
    asyncio.run(sync_files_to_db())
