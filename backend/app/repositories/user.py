from typing import Optional, List, Dict, Any
from boto3.dynamodb.conditions import Attr

from app.models.user import User
from app.core.config import settings
from .base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(settings.users_table_name)

    def _to_model(self, data: Dict[str, Any]) -> User:
        return User.from_dict(data)

    def _get_key(self, user_id: str) -> Dict[str, Any]:
        return {"user_id": user_id}

    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email address"""
        items = await self.db.scan_items(
            self.table_name,
            filter_expression=Attr('email').eq(email)
        )
        return self._to_model(items[0]) if items else None

    async def get_by_department(self, department: str) -> List[User]:
        """Get users by department"""
        items = await self.db.scan_items(
            self.table_name,
            filter_expression=Attr('departments').contains(department)
        )
        return [self._to_model(item) for item in items]

    async def get_supervisors(self) -> List[User]:
        """Get all supervisors"""
        items = await self.db.scan_items(
            self.table_name,
            filter_expression=Attr('role').eq('supervisor') & Attr('is_active').eq(True)
        )
        return [self._to_model(item) for item in items]

    async def get_volunteers_with_qualification(self, qualification: str) -> List[User]:
        """Get volunteers with specific qualification"""
        items = await self.db.scan_items(
            self.table_name,
            filter_expression=Attr('qualifications').contains(qualification) &
                              Attr('role').eq('volunteer') &
                              Attr('is_active').eq(True)
        )
        return [self._to_model(item) for item in items]
