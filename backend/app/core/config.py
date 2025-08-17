from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Rode Kruis Platform"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Backend API for Rode Kruis Volunteer Platform"

    # AWS Settings
    AWS_REGION: str = os.getenv("AWS_REGION", "eu-west-1")
    DYNAMODB_TABLE_PREFIX: str = os.getenv("DYNAMODB_TABLE_PREFIX", "rk-platform")
    STAGE: str = os.getenv("STAGE", "dev")

    # Cognito Settings
    COGNITO_USER_POOL_ID: str = os.getenv("COGNITO_USER_POOL_ID", "")
    COGNITO_CLIENT_ID: str = os.getenv("COGNITO_CLIENT_ID", "")
    COGNITO_REGION: str = os.getenv("COGNITO_REGION", "eu-west-1")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://your-frontend-domain.com"
    ]

    @property
    def users_table_name(self) -> str:
        return f"{self.DYNAMODB_TABLE_PREFIX}-users-{self.STAGE}"

    @property
    def services_table_name(self) -> str:
        return f"{self.DYNAMODB_TABLE_PREFIX}-services-{self.STAGE}"

    @property
    def departments_table_name(self) -> str:
        return f"{self.DYNAMODB_TABLE_PREFIX}-departments-{self.STAGE}"

    @property
    def assignments_table_name(self) -> str:
        return f"{self.DYNAMODB_TABLE_PREFIX}-assignments-{self.STAGE}"

    class Config:
        env_file = ".env"


settings = Settings()
