import os
import psycopg2
from dotenv import load_dotenv

load_dotenv("backend/.env")
db_url = os.getenv("DATABASE_URL")

# Strip the sqlalchemy prefix if present
if db_url.startswith("postgresql+psycopg2://"):
    db_url = db_url.replace("postgresql+psycopg2://", "postgresql://", 1)

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT username, email, user_id FROM users;")
    users = cur.fetchall()
    print("Username | Email | User ID")
    print("-" * 40)
    for user in users:
        print(f"{user[0]} | {user[1]} | {user[2]}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
