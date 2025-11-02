import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class DynamoDBClient:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.client = boto3.client('dynamodb')

    def get_table(self, table_name: str):
        """Get DynamoDB table resource"""
        return self.dynamodb.Table(table_name)

    async def put_item(self, table_name: str, item: Dict[str, Any]) -> bool:
        """Put item in DynamoDB table"""
        try:
            table = self.get_table(table_name)
            table.put_item(Item=item)
            return True
        except ClientError as e:
            logger.error(f"Error putting item in {table_name}: {e}")
            return False

    async def get_item(self, table_name: str, key: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get item from DynamoDB table"""
        try:
            table = self.get_table(table_name)
            response = table.get_item(Key=key)
            return response.get('Item')
        except ClientError as e:
            logger.error(f"Error getting item from {table_name}: {e}")
            return None

    async def query_items(self, table_name: str, key_condition, **kwargs) -> list[Dict[str, Any]]:
        """Query items from DynamoDB table"""
        try:
            table = self.get_table(table_name)
            response = table.query(KeyConditionExpression=key_condition, **kwargs)
            return response.get('Items', [])
        except ClientError as e:
            logger.error(f"Error querying items from {table_name}: {e}")
            return []

    async def scan_items(self, table_name: str, filter_expression=None, **kwargs) -> list[Dict[str, Any]]:
        """Scan items from DynamoDB table"""
        try:
            table = self.get_table(table_name)
            scan_kwargs = {}
            if filter_expression:
                scan_kwargs['FilterExpression'] = filter_expression
            scan_kwargs.update(kwargs)

            response = table.scan(**scan_kwargs)
            return response.get('Items', [])
        except ClientError as e:
            logger.error(f"Error scanning items from {table_name}: {e}")
            return []

    async def update_item(self, table_name: str, key: Dict[str, Any],
                          update_expression: str, expression_values: Dict[str, Any],
                          expression_names: Dict[str, Any] = None) -> bool:
        """Update item in DynamoDB table with expression names support"""
        try:
            table = self.get_table(table_name)
            update_kwargs = {
                'Key': key,
                'UpdateExpression': update_expression,
                'ExpressionAttributeValues': expression_values
            }

            if expression_names:
                update_kwargs['ExpressionAttributeNames'] = expression_names

            table.update_item(**update_kwargs)
            return True
        except ClientError as e:
            logger.error(f"Error updating item in {table_name}: {e}")
            return False

    async def delete_item(self, table_name: str, key: Dict[str, Any]) -> bool:
        """Delete item from DynamoDB table"""
        try:
            table = self.get_table(table_name)
            table.delete_item(Key=key)
            return True
        except ClientError as e:
            logger.error(f"Error deleting item from {table_name}: {e}")
            return False

    async def update_item(self, table_name: str, key: Dict[str, Any],
                          update_expression: str, expression_values: Dict[str, Any],
                          expression_names: Dict[str, Any] = None) -> bool:
        """Update item in DynamoDB table with expression names support"""
        try:
            table = self.get_table(table_name)
            update_kwargs = {
                'Key': key,
                'UpdateExpression': update_expression,
                'ExpressionAttributeValues': expression_values
            }

            if expression_names:
                update_kwargs['ExpressionAttributeNames'] = expression_names

            table.update_item(**update_kwargs)
            return True
        except ClientError as e:
            logger.error(f"Error updating item in {table_name}: {e}")
            return False


# Global database client instance
db_client = DynamoDBClient()