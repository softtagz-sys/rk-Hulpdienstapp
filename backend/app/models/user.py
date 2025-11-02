from typing import List, Optional, Dict, Any
from .base import BaseModel


class User(BaseModel):
    def __init__(self, user_id: str, email: str, name: str, role: str = "volunteer",
                 departments: List[str] = None, qualifications: List[str] = None,
                 phone: str = "", notifications: bool = True, **kwargs):
        super().__init__(**kwargs)
        self.user_id = user_id
        self.email = email
        self.name = name
        self.role = role  # volunteer, supervisor
        self.departments = departments or []
        self.qualifications = qualifications or []
        self.phone = phone
        self.notifications = notifications
        self.is_active = kwargs.get('is_active', True)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'user_id': self.user_id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'departments': self.departments,
            'qualifications': self.qualifications,
            'phone': self.phone,
            'notifications': self.notifications,
            'is_active': self.is_active,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]):
        return cls(**data)
