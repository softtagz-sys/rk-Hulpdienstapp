from pydantic import BaseModel, Field, validator
from typing import List, Optional
from enum import Enum
from datetime import datetime


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
    end_date: Optional[str] = Field(None, description="Service end date in YYYY-MM-DD format (defaults to start date)")
    rv_time: Optional[str] = Field(None, description="Meeting/Rendez-vous time in HH:MM format")
    location: str = Field(..., min_length=1, max_length=200)
    department: str = Field(..., min_length=1)
    required_qualifications: List[str] = Field(default_factory=list)
    min_volunteers: int = Field(..., ge=1, le=100)

    @validator('date', 'end_date')
    def validate_date_format(cls, v):
        if v is None:
            return v
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')

    @validator('start_time', 'end_time', 'rv_time')
    def validate_time_format(cls, v):
        if v is None:
            return v
        try:
            datetime.strptime(v, '%H:%M')
            return v
        except ValueError:
            raise ValueError('Time must be in HH:MM format (e.g., 14:30)')

    @validator('end_date')
    def validate_end_date(cls, end_date, values):
        if end_date and 'date' in values:
            start = datetime.strptime(values['date'], '%Y-%m-%d')
            end = datetime.strptime(end_date, '%Y-%m-%d')
            if end < start:
                raise ValueError('End date must be on or after start date')
        return end_date

    @validator('end_time')
    def validate_datetime_range(cls, end_time, values):
        if 'date' in values and 'start_time' in values and 'end_date' in values:
            start_date = values['date']
            end_date = values.get('end_date') or start_date
            start_time = values['start_time']

            start_dt = datetime.strptime(f"{start_date} {start_time}", '%Y-%m-%d %H:%M')
            end_dt = datetime.strptime(f"{end_date} {end_time}", '%Y-%m-%d %H:%M')

            if end_dt <= start_dt:
                raise ValueError('End date/time must be after start date/time')

        return end_time


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    end_date: Optional[str] = None
    rv_time: Optional[str] = None
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


class ServiceResponse(BaseModel):
    service_id: str
    title: str
    description: str
    date: str
    start_time: str
    end_time: str
    end_date: str
    rv_time: Optional[str] = None
    location: str
    department: str
    required_qualifications: List[str]
    min_volunteers: int
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