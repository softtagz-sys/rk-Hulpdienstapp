from pydantic import BaseModel, Field
from typing import Optional


class DepartmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    code: str = Field(..., min_length=1, max_length=10)
    active: bool = True


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    code: Optional[str] = Field(None, min_length=1, max_length=10)
    active: Optional[bool] = None


class DepartmentResponse(DepartmentBase):
    department_id: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True