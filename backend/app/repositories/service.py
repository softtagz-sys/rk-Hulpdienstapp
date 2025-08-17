from typing import Optional, List, Dict, Any
from boto3.dynamodb.conditions import Key, Attr
import uuid
from datetime import datetime

from app.models.service import Service, ServiceAssignment
from app.core.config import settings
from .base import BaseRepository


class ServiceRepository(BaseRepository[Service]):
    def __init__(self):
        super().__init__(settings.services_table_name)

    def _to_model(self, data: Dict[str, Any]) -> Service:
        return Service.from_dict(data)

    def _get_key(self, service_id: str) -> Dict[str, Any]:
        return {"service_id": service_id}

    async def get_by_department(self, department: str) -> List[Service]:
        """Get services by department"""
        items = await self.db.scan_items(
            self.table_name,
            filter_expression=Attr('department').eq(department)
        )
        return [self._to_model(item) for item in items]

    async def get_by_date_range(self, start_date: str, end_date: str) -> List[Service]:
        """Get services within date range"""
        items = await self.db.scan_items(
            self.table_name,
            filter_expression=Attr('date').between(start_date, end_date)
        )
        return [self._to_model(item) for item in items]

    async def get_open_services(self) -> List[Service]:
        """Get all open services"""
        items = await self.db.scan_items(
            self.table_name,
            filter_expression=Attr('status').eq('open')
        )
        return [self._to_model(item) for item in items]

    async def increment_assigned_count(self, service_id: str) -> bool:
        """Increment assigned volunteer count"""
        key = self._get_key(service_id)
        return await self.db.update_item(
            self.table_name,
            key,
            "SET assigned_count = assigned_count + :inc, updated_at = :timestamp",
            {
                ":inc": 1,
                ":timestamp": datetime.utcnow().isoformat()
            }
        )

    async def decrement_assigned_count(self, service_id: str) -> bool:
        """Decrement assigned volunteer count"""
        key = self._get_key(service_id)
        return await self.db.update_item(
            self.table_name,
            key,
            "SET assigned_count = assigned_count - :dec, updated_at = :timestamp",
            {
                ":dec": 1,
                ":timestamp": datetime.utcnow().isoformat()
            }
        )


class ServiceAssignmentRepository(BaseRepository[ServiceAssignment]):
    def __init__(self):
        super().__init__(settings.assignments_table_name)

    def _to_model(self, data: Dict[str, Any]) -> ServiceAssignment:
        return ServiceAssignment.from_dict(data)

    def _get_key(self, assignment_id: str) -> Dict[str, Any]:
        return {"assignment_id": assignment_id}

    async def create_assignment(self, service_id: str, volunteer_id: str,
                                volunteer_name: str, volunteer_qualifications: List[str],
                                preference: str) -> Optional[ServiceAssignment]:
        """Create new service assignment"""
        assignment = ServiceAssignment(
            assignment_id=str(uuid.uuid4()),
            service_id=service_id,
            volunteer_id=volunteer_id,
            volunteer_name=volunteer_name,
            volunteer_qualifications=volunteer_qualifications,
            preference=preference,
            status="pending"
        )
        return await self.create(assignment)

    async def get_by_service(self, service_id: str) -> List[ServiceAssignment]:
        """Get all assignments for a service"""
        items = await self.db.scan_items(
            self.table_name,
            filter_expression=Attr('service_id').eq(service_id)
        )
        return [self._to_model(item) for item in items]

    async def get_by_volunteer(self, volunteer_id: str) -> List[ServiceAssignment]:
        """Get all assignments for a volunteer"""
        items = await self.db.scan_items(
            self.table_name,
            filter_expression=Attr('volunteer_id').eq(volunteer_id)
        )
        return [self._to_model(item) for item in items]

    async def get_assignment(self, service_id: str, volunteer_id: str) -> Optional[ServiceAssignment]:
        """Get specific assignment for service and volunteer"""
        items = await self.db.scan_items(
            self.table_name,
            filter_expression=Attr('service_id').eq(service_id) & Attr('volunteer_id').eq(volunteer_id)
        )
        return self._to_model(items[0]) if items else None

    async def update_assignment_status(self, assignment_id: str, status: str) -> Optional[ServiceAssignment]:
        """Update assignment status"""
        return await self.update(assignment_id, {"status": status})

    async def update_assignment_preference(self, assignment_id: str, preference: str) -> Optional[ServiceAssignment]:
        """Update assignment preference"""
        return await self.update(assignment_id, {"preference": preference})
