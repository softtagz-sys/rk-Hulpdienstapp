from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import date, time


class ServiceStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    CANCELLED = "cancelled"


class PreferenceType(str, Enum):
    ENROLLED = "enrolled"
    RESERVE = "reserve"
    NOT_CHOSEN = "not_chosen"


class AssignmentStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    DECLINED = "declined"


class ServiceBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    date: str = Field(..., description="Service date in YYYY-MM-DD format")
    start_time: str = Field(..., description="Start time in HH:MM format")
    end_time: str = Field(..., description="End time in HH:MM format")
    location: str = Field(..., min_length=1, max_length=200)
    department: str = Field(..., min_length=1)
    required_qualifications: List[str] = Field(default_factory=list)
    min_volunteers: int = Field(..., ge=1, le=100)


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    department: Optional[str] = None
    required_qualifications: Optional[List[str]] = None
    min_volunteers: Optional[int] = Field(None, ge=1, le=100)
    status: Optional[ServiceStatus] = None


class ServiceAssignmentResponse(BaseModel):
    assignment_id: str
    service_id: str
    volunteer_id: str
    volunteer_name: str
    volunteer_qualifications: List[str]
    preference: PreferenceType
    status: AssignmentStatus
    created_at: str
    updated_at: str


class ServiceResponse(ServiceBase):
    service_id: str
    status: ServiceStatus
    assigned_count: int
    assigned_volunteers: List[ServiceAssignmentResponse] = Field(default_factory=list)
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class ServiceRegistrationRequest(BaseModel):
    preference: PreferenceType
    notes: Optional[str] = Field(None, max_length=500)


class ServiceListResponse(BaseModel):
    services: List[ServiceResponse]
    total_count: int
    page: int = 1
    page_size: int = 20