from typing import List, Optional, Dict, Any
from .base import BaseModel


class ServiceAssignment(BaseModel):
    def __init__(self, assignment_id: str, service_id: str, volunteer_id: str,
                 volunteer_name: str, volunteer_qualifications: List[str],
                 preference: str, status: str = "pending", **kwargs):
        super().__init__(**kwargs)
        self.assignment_id = assignment_id
        self.service_id = service_id
        self.volunteer_id = volunteer_id
        self.volunteer_name = volunteer_name
        self.volunteer_qualifications = volunteer_qualifications
        self.preference = preference  # enrolled, reserve, not_chosen
        self.status = status  # pending, assigned, declined

    def to_dict(self) -> Dict[str, Any]:
        return {
            'assignment_id': self.assignment_id,
            'service_id': self.service_id,
            'volunteer_id': self.volunteer_id,
            'volunteer_name': self.volunteer_name,
            'volunteer_qualifications': self.volunteer_qualifications,
            'preference': self.preference,
            'status': self.status,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]):
        return cls(**data)


class Service(BaseModel):
    def __init__(self, service_id: str, title: str, description: str, date: str,
                 start_time: str, end_time: str, location: str, department: str,
                 required_qualifications: List[str], min_volunteers: int,
                 status: str = "open", end_date: Optional[str] = None,
                 rv_time: Optional[str] = None, **kwargs):
        super().__init__(**kwargs)
        self.service_id = service_id
        self.title = title
        self.description = description
        self.date = date  # Keeping for backward compatibility
        self.start_time = start_time
        self.end_time = end_time
        self.end_date = end_date or date  # Default to same day if not provided
        self.rv_time = rv_time  # Optional meeting/rendez-vous time
        self.location = location
        self.department = department
        self.required_qualifications = required_qualifications
        self.min_volunteers = min_volunteers
        self.status = status  # open, closed, cancelled
        self.assigned_count = kwargs.get('assigned_count', 0)

    def to_dict(self) -> Dict[str, Any]:
        result = {
            'service_id': self.service_id,
            'title': self.title,
            'description': self.description,
            'date': self.date,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'end_date': self.end_date,
            'location': self.location,
            'department': self.department,
            'required_qualifications': self.required_qualifications,
            'min_volunteers': self.min_volunteers,
            'status': self.status,
            'assigned_count': self.assigned_count,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
        # Only include rv_time if it's set
        if self.rv_time:
            result['rv_time'] = self.rv_time
        return result

    @classmethod
    def from_dict(cls, data: Dict[str, Any]):
        return cls(**data)
