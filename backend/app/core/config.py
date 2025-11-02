from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import Optional, List, Union
import os


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Rode Kruis Platform"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Backend API for Rode Kruis Volunteer Platform"

    # AWS Settings
    AWS_REGION: str = "eu-west-1"
    DYNAMODB_TABLE_PREFIX: str = "rk-platform"
    STAGE: str = "dev"

    # Cognito Settings
    COGNITO_USER_POOL_ID: str = ""
    COGNITO_CLIENT_ID: str = ""
    COGNITO_REGION: str = "eu-west-1"

    # Security
    SECRET_KEY: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS - will be parsed from comma-separated string to list
    CORS_ORIGINS: str = Field(default="http://localhost:3000,http://localhost:5173")

    # Allowed hosts - will be parsed from comma-separated string to list
    ALLOWED_HOSTS: str = Field(default="*")

    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        """Parse and return CORS origins as list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def ALLOWED_HOSTS_LIST(self) -> List[str]:
        """Parse and return allowed hosts as list"""
        return [host.strip() for host in self.ALLOWED_HOSTS.split(",") if host.strip()]

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
