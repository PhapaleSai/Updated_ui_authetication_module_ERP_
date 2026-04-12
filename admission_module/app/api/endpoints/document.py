import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.schemas import document as schemas
from app.crud import document as crud
from app.crud import application as app_crud

router = APIRouter()

# Setup Upload Directory
UPLOAD_DIR = "uploaded_documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    application_id: int = Form(...),
    uploader_id: int = Form(...),
    document_type: str = Form(...),
    document_name: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Step 1 (Documents): Applicant uploads physical files like Aadhar or Marksheet.
    Constraints: Max 1MB, Format: jpg, jpeg, png.
    """
    # 1. Validation: File Extension
    allowed_extensions = {".jpg", ".jpeg", ".png"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Invalid format. Use: {', '.join(allowed_extensions)}")

    # 2. Validation: File Size (1 MB)
    file_content = await file.read()
    if len(file_content) > 1 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (Max 1MB).")
    
    # 3. Verify Application exists
    application = await app_crud.get_application_by_id(db, application_id=application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")
        
    # 4. Save to disk (Robust path generation)
    safe_type = document_type.replace(" ", "_")
    safe_name = document_name.replace(" ", "_")
    safe_filename = f"app_{application_id}_{safe_type}_{safe_name}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Filesystem error: {str(e)}")
        
    # 5. Save record to Database with explicit column error handling
    try:
        new_doc = await crud.upload_document_record(
            db=db,
            application_id=application_id,
            document_type=document_type,
            document_name=document_name,
            file_path=file_path,
            file_type=file.content_type,
            file_size=len(file_content),
            uploader_id=uploader_id
        )
        return new_doc
    except Exception as e:
        # This usually means the DB columns are missing
        if "column" in str(e).lower() or "attribute" in str(e).lower():
            raise HTTPException(
                status_code=500, 
                detail="Database schema mismatch. Please run the SQL fix I provided to add missing columns."
            )
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/verify", response_model=schemas.DocumentVerificationOut, status_code=status.HTTP_201_CREATED)
async def verify_uploaded_document(ver_in: schemas.DocumentVerificationCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Step 2 (Documents): Admin verifies the uploaded document.
    """
    return await crud.verify_document(db=db, ver_data=ver_in)

@router.get("/application/{application_id}", response_model=list[schemas.DocumentOut])
async def get_uploaded_documents(application_id: int, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Allows the applicant to see all their uploaded documents before final submission.
    """
    documents = await crud.get_documents_by_application_id(db=db, application_id=application_id)
    if not documents:
        # Return empty list if no documents yet
        return []
        
    return documents
