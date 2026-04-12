from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 👉 PostgreSQL connection
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:prapti@localhost:5432/erp"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()