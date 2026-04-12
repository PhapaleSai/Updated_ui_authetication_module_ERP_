import asyncio
from app.core.database import engine
from sqlalchemy import text

async def diagnostic():
    async with engine.connect() as conn:
        # 1. Check columns in 'users' table
        print("Columns in 'users' table:")
        res = await conn.execute(text("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'users'"))
        for r in res:
            print(f" - {r[0]} (Nullable: {r[1]})")
        
        # 2. Check if 'brochure_requests' table exists
        print("\nChecking 'brochure_requests' table:")
        res = await conn.execute(text("SELECT * FROM information_schema.tables WHERE table_name = 'brochure_requests'"))
        if res.fetchone():
            print(" - Table exists.")
            # Check columns
            res_cols = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'brochure_requests'"))
            for r in res_cols:
                print(f"   - {r[0]}")
        else:
            print(" - Table DOES NOT EXIST.")

if __name__ == "__main__":
    asyncio.run(diagnostic())
