import psycopg2
from app.core.config import settings

# Parse the database URL to get connection params for psycopg2
# Example: postgresql+asyncpg://user:pass@host:port/dbname
db_url = str(settings.sqlalchemy_database_uri).replace("postgresql+asyncpg://", "postgresql://")

def sync_update():
    print("Connecting to database (Sync Mode)...")
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Adding 'document_name' column...")
        cur.execute("ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_name VARCHAR(150);")
        
        print("Adding 'status' column...")
        cur.execute("ALTER TABLE documents ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending';")
        
        print("Expanding 'file_type' column...")
        cur.execute("ALTER TABLE documents ALTER COLUMN file_type TYPE VARCHAR(50);")
        
        print("Expanding 'status_id' in logs...")
        cur.execute("ALTER TABLE application_status_log ALTER COLUMN status_id TYPE VARCHAR(100);")
        
        cur.close()
        conn.close()
        print("Sync Update Complete!")
    except Exception as e:
        print(f"Sync Update Failed: {e}")

if __name__ == "__main__":
    sync_update()
