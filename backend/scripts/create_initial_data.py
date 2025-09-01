import boto3
import uuid
from datetime import datetime
import os


def create_initial_departments():
    """Create initial departments"""
    dynamodb = boto3.resource('dynamodb')
    stage = os.getenv('STAGE', 'dev')
    table_name = f"rk-platform-departments-{stage}"

    try:
        table = dynamodb.Table(table_name)

        departments = [
            {
                'department_id': str(uuid.uuid4()),
                'name': 'Sint-Job',
                'code': '1E159',
                'active': True,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
        ]

        for dept in departments:
            table.put_item(Item=dept)
            print(f"Created department: {dept['name']}")

    except Exception as e:
        print(f"Error creating departments: {e}")


if __name__ == "__main__":
    create_initial_departments()
