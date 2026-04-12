from fastapi import FastAPI
from app.database import Base, engine
from app.models import models
from app.api import erp


# ✅ Create app FIRST
app = FastAPI()

# ✅ Then include router
app.include_router(erp.router)


# ✅ Root API
@app.get("/")
def root():
    return {"message": "Database connected ✅"}