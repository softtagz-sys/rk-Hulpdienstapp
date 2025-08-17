from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List, Dict, Any
from boto3.dynamodb.conditions import Key, Attr

from app.core.database import db_client

T = TypeVar('T')


class BaseRepository(Generic[T], ABC):
    """Base repository class for DynamoDB operations"""

    def __init__(self, table_name: str):
        self.table_name = table_name
        self.db = db_client

    @abstractmethod
    def _to_model(self, data: Dict[str, Any]) -> T:
        """Convert DynamoDB data to model instance"""
        pass

    @abstractmethod
    def _get_key(self, item_id: str) -> Dict[str, Any]:
        """Get primary key for item"""
        pass

    async def create(self, model: T) -> Optional[T]:
        """Create new item"""
        data = model.to_dict()
        success = await self.db.put_item(self.table_name, data)
        return model if success else None

    async def get_by_id(self, item_id: str) -> Optional[T]:
        """Get item by ID"""
        key = self._get_key(item_id)
        data = await self.db.get_item(self.table_name, key)
        return self._to_model(data) if data else None

    async def update(self, item_id: str, updates: Dict[str, Any]) -> Optional[T]:
        """Update item by ID"""
        # Remove None values and prepare update expression
        filtered_updates = {k: v for k, v in updates.items() if v is not None}
        if not filtered_updates:
            return await self.get_by_id(item_id)

        # Add updated_at timestamp
        from datetime import datetime
        filtered_updates['updated_at'] = datetime.utcnow().isoformat()

        # Build update expression
        update_expression = "SET " + ", ".join([f"#{k} = :{k}" for k in filtered_updates.keys()])
        expression_values = {f":{k}": v for k, v in filtered_updates.items()}
        expression_names = {f"#{k}": k for k in filtered_updates.keys()}

        key = self._get_key(item_id)
        success = await self.db.update_item(
            self.table_name,
            key,
            update_expression,
            expression_values,
            expression_names
        )

        return await self.get_by_id(item_id) if success else None

    async def delete(self, item_id: str) -> bool:
        """Delete item by ID"""
        key = self._get_key(item_id)
        return await self.db.delete_item(self.table_name, key)

    async def list_all(self, filter_expression=None) -> List[T]:
        """List all items"""
        items = await self.db.scan_items(self.table_name, filter_expression)
        return [self._to_model(item) for item in items]
