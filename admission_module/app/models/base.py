from sqlalchemy.orm import declarative_base

# The declarative base is the foundation class for all our SQLAlchemy models
# It keeps a catalog of classes and tables mappings. 
# We'll use this Base in every model we define.
Base = declarative_base()
