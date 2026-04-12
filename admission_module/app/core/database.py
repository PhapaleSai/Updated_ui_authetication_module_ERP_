from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

# Create async engine for PostgreSQL using asyncpg
# We use the computed database URI from the settings class
engine = create_async_engine(
    settings.sqlalchemy_database_uri,
    echo=True, # Echoes all SQL statements for learning and debugging purposes (as per your request for step-by-step guidance)
    future=True # Use the SQLAlchemy 2.0 API features
)

# Async session maker provides a factory to generate new Session objects
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False, # Don't expire objects after committing
    autocommit=False,
    autoflush=False
)

# Dependency to inject DB session into API endpoints
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
