import os
import psycopg2
from dotenv import load_dotenv

load_dotenv("backend/.env")
db_url = os.getenv("DATABASE_URL")

if db_url.startswith("postgresql+psycopg2://"):
    db_url = db_url.replace("postgresql+psycopg2://", "postgresql://", 1)

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT username, email FROM users WHERE username ILIKE '%fee%';")
    users = cur.fetchall()
    print("Matches for 'fee':")
    for user in users:
        print(f"Username: {user[0]}, Email: {user[1]}")
    
    cur.execute("SELECT username, email FROM users WHERE username ILIKE '%sis%';")
    users = cur.fetchall()
    print("\nMatches for 'sis':")
    for user in users:
        print(f"Username: {user[0]}, Email: {user[1]}")
        
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
