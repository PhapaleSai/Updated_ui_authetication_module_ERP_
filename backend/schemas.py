from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr


# ── Auth ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str
    role: str
    user_id: int
    username: str
    full_name: Optional[str] = None
    permissions: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class LogoutResponse(BaseModel):
    message: str


class TokenRefreshRequest(BaseModel):
    refresh_token: str


# ── Roles ───────────────────────────────────────────────────────────────────

class RoleOut(BaseModel):
    role_id: int
    role_name: str

    class Config:
        from_attributes = True


class AssignRoleRequest(BaseModel):
    user_id: int
    role: str


class AssignRoleResponse(BaseModel):
    message: str


# ── Users ───────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    full_name: Optional[str] = None
    email: EmailStr
    password: str

class UserOut(BaseModel):
    user_id: int
    username: str
    full_name: Optional[str] = None
    email: str
    role: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Legacy schemas (kept for backward compatibility) ─────────────────────────

class StudentCreate(BaseModel):
    name: str
    student_class: str
    phone: str
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class StudentOut(BaseModel):
    id: int
    name: str
    student_class: str
    phone: str
    username: str

    class Config:
        from_attributes = True
