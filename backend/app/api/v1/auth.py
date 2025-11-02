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