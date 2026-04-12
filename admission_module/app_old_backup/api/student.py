from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Student
from app.schemas.schemas import StudentCreate, StudentResponse, StudentUpdate

router = APIRouter()

# ✅ CREATE STUDENT
@router.post("/students", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    new_student = Student(
        first_name=student.first_name,
        last_name=student.last_name,
        email=student.email,
        phone=student.phone
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

# ✅ GET ALL STUDENTS
@router.get("/students", response_model=list[StudentResponse])
def get_all_students(db: Session = Depends(get_db)):
    return db.query(Student).all()

# ✅ GET STUDENT BY ID
@router.get("/students/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

# ✅ UPDATE STUDENT
@router.put("/students/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, student_update: StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.first_name = student_update.first_name
    student.last_name = student_update.last_name
    student.email = student_update.email
    student.phone = student_update.phone

    db.commit()
    db.refresh(student)
    return student

# ✅ DELETE STUDENT
@router.delete("/students/{student_id}", response_model=dict)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return {"detail": f"Student with ID {student_id} deleted successfully"}

    