from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime
import uuid


class BaseModel(ABC):
    """Base model class for DynamoDB entities"""

    def __init__(self, **kwargs):
        self.created_at = kwargs.get('created_at', datetime.utcnow().isoformat())
        self.updated_at = kwargs.get('updated_at', datetime.utcnow().isoformat())

    @abstractmethod
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary for DynamoDB"""
        pass

    @classmethod
    @abstractmethod
    def from_dict(cls, data: Dict[str, Any]):
        """Create model instance from DynamoDB data"""
        pass

    def update_timestamp(self):
        """Update the updated_at timestamp"""
        self.updated_at = datetime.utcnow().isoformat()