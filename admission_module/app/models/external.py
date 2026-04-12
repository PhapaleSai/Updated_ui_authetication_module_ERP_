from sqlalchemy import Column, Integer, String
from app.models.base import Base

# We are mocking these classes because in an ERD they are managed by 
# external modules (like Authentication and Academic Modules).
# However, SQLAlchemy still needs them to exist as models if we want to build
# Foreign Key constraints properly across the entire database!

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150))
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

class Course(Base):
    __tablename__ = "course"
    course_id = Column(Integer, primary_key=True, index=True)
    c_name = Column(String(100), nullable=False)
    duration = Column(Integer, nullable=False) # e.g. months
    level = Column(String(50), nullable=False) # e.g. UG, PG
