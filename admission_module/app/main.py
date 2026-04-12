from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback
from app.core.config import settings

# Initialize our FastAPI app with basic metadata
app = FastAPI(
    title="Admission and Enrollment API",
    description="Backend Module for the College ERP System",
    version="1.0.0"
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"message": str(exc), "traceback": traceback.format_exc()})
    
from fastapi.staticfiles import StaticFiles
import os

# Create upload directory if it doesn't exist so mounting won't fail
os.makedirs("uploaded_documents", exist_ok=True)
app.mount("/documents/preview", StaticFiles(directory="uploaded_documents"), name="static_documents")

# Setup CORS (Cross-Origin Resource Sharing)
# This allows external clients (like a React or Angular frontend) to make requests to this backend.
# The user specified 'cors' in their required stack. FastAPI provides a built-in middleware for this.
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """
    Root endpoint for health check.
    We will hit this in Postman (as requested instead of swagger) to verify the server is running.
    """
    return {"message": "Admission and Enrollment Module Backend is Running!"}

# Include API Routers
from app.api.endpoints import brochure, application, admin, document, payment, enrollment

app.include_router(brochure.router, prefix="/api/v1/brochures", tags=["Brochures"])
app.include_router(application.router, prefix="/api/v1/applications", tags=["Applications"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin Review"])
app.include_router(document.router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(payment.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(enrollment.router, prefix="/api/v1/enrollments", tags=["Enrollments"])
