from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from typing import Dict, Any, Optional, List
import logging

from app.core.security import cognito_jwt_bearer, get_user_from_token, security
from app.repositories.user import UserRepository
from app.models.user import User

logger = logging.getLogger(__name__)


async def get_current_user_token(
        credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """Get current user from JWT token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    token = credentials.credentials
    payload = await cognito_jwt_bearer.verify_token(token)
    return get_user_from_token(payload)


async def get_current_user(
        token_user: Dict[str, Any] = Depends(get_current_user_token)
) -> User:
    logger.info(f"Token user data: {token_user}")

    """Get current user model from database"""
    user_repo = UserRepository()
    user = await user_repo.get_by_id(token_user['user_id'])

    if not user:
        try:
            # Create user if doesn't exist (first login after signup)
            user_data = {
                'user_id': token_user['user_id'],
                'email': token_user.get('email'),  # Use .get() to handle missing keys
                'name': token_user.get('name', ''),
                'role': token_user.get('role', 'volunteer'),
                'departments': ['Sint-Job'],  # Add default department
                'qualifications': [],
                'is_active': True
            }

            # Validate email exists and is not None
            if not user_data['email']:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email is required for user creation"
                )

            user = await user_repo.create(User(**user_data))

            # Double-check user was created successfully
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user account"
                )

        except Exception as e:
            logger.error(f"Failed to create user: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user account"
            )

    # Now safely check is_active since we know user exists
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive"
        )

    return user


async def get_current_supervisor(
        current_user: User = Depends(get_current_user)
) -> User:
    """Require supervisor role"""
    if current_user.role != "supervisor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Supervisor privileges required"
        )
    return current_user


def require_roles(allowed_roles: List[str]):
    """Dependency factory for role-based access"""

    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user

    return role_checker


# ===========================================
# app/api/v1/auth.py
# ===========================================
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any

from app.api.deps import get_current_user, get_current_user_token
from app.schemas.user import UserResponse
from app.models.user import User

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information"""
    return UserResponse(**current_user.to_dict())


@router.post("/verify-token")
async def verify_token(token_user: Dict[str, Any] = Depends(get_current_user_token)):
    """Verify JWT token validity"""
    return {
        "valid": True,
        "user_id": token_user["user_id"],
        "email": token_user["email"]
    }


@router.post("/refresh")
async def refresh_token():
    """Refresh JWT token (handled by frontend/Cognito)"""
    return {
        "message": "Token refresh should be handled by the client using Cognito SDK"
    }
