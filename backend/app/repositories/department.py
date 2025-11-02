from typing import Optional, List, Dict, Any
from boto3.dynamodb.conditions import Attr

from app.models.department import Department
from app.core.config import settings
from .base import BaseRepository


class DepartmentRepository(BaseRepository[Department]):
    def __init__(self):
        super().__init__(settings.departments_table_name)

    def _to_model(self, data: Dict[str, Any]) -> Department:
        return Department.from_dict(data)

    def _get_key(self, department_id: str) -> Dict[str, Any]:
        return {"department_id": department_id}

    async def get_by_code(self, code: str) -> Optional[Department]:
        """Get department by code"""
        items = await self.db.scan_items(
            self.table_name,
            filter_expression=Attr('code').eq(code)
        )
        return self._to_model(items[0]) if items else None

    async def get_by_name(self, name: str) -> Optional[Department]:
        """Get department by name"""
        items = await self.db.scan_items(
            self.table_name,
            filter_expression=Attr('name').eq(name)
        )
        return self._to_model(items[0]) if items else None

    async def get_active_departments(self) -> List[Department]:
        """Get all active departments"""
        items = await self.db.scan_items(
            self.table_name,
            filter_expression=Attr('active').eq(True)
        )
        return [self._to_model(item) for item in items]
