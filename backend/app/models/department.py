from typing import Dict, Any

from .base import BaseModel


class Department(BaseModel):
    def __init__(self, department_id: str, name: str, code: str,
                 active: bool = True, **kwargs):
        super().__init__(**kwargs)
        self.department_id = department_id
        self.name = name
        self.code = code
        self.active = active

    def to_dict(self) -> Dict[str, Any]:
        return {
            'department_id': self.department_id,
            'name': self.name,
            'code': self.code,
            'active': self.active,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]):
        return cls(**data)
