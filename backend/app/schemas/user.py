from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from enum import Enum


class UserRole(str, Enum):
    VOLUNTEER = "volunteer"
    SUPERVISOR = "supervisor"


class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    role: UserRole = UserRole.VOLUNTEER
    departments: List[str] = Field(default_factory=list)
    qualifications: List[str] = Field(default_factory=list)
    phone: str = Field(default="", max_length=20)
    notifications: bool = True


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    departments: Optional[List[str]] = None
    qualifications: Optional[List[str]] = None
    phone: Optional[str] = Field(None, max_length=20)
    notifications: Optional[bool] = None


class UserResponse(UserBase):
    user_id: str
    is_active: bool
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
