from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional

from app.api.deps import get_current_user, get_current_supervisor, require_roles
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.repositories.user import UserRepository

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(**current_user.to_dict())


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
        user_update: UserUpdate,
        current_user: User = Depends(get_current_user)
):
    """Update current user profile"""
    user_repo = UserRepository()

    # Convert Pydantic model to dict, excluding None values
    update_data = user_update.model_dump(exclude_unset=True)

    updated_user = await user_repo.update(current_user.user_id, update_data)

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

    return UserResponse(**updated_user.to_dict())


@router.get("/", response_model=List[UserResponse])
async def list_users(
        department: Optional[str] = Query(None, description="Filter by department"),
        role: Optional[str] = Query(None, description="Filter by role"),
        current_user: User = Depends(require_roles(["supervisor"]))
):
    """List users (supervisor only)"""
    user_repo = UserRepository()

    if department:
        users = await user_repo.get_by_department(department)
    else:
        users = await user_repo.list_all()

    # Filter by role if specified
    if role:
        users = [user for user in users if user.role == role]

    return [UserResponse(**user.to_dict()) for user in users]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
        user_id: str,
        current_user: User = Depends(require_roles(["supervisor"]))
):
    """Get user by ID (supervisor only)"""
    user_repo = UserRepository()
    user = await user_repo.get_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(**user.to_dict())


@router.get("/volunteers/qualified", response_model=List[UserResponse])
async def get_qualified_volunteers(
        qualification: str = Query(..., description="Required qualification"),
        current_user: User = Depends(require_roles(["supervisor"]))
):
    """Get volunteers with specific qualification (supervisor only)"""
    user_repo = UserRepository()
    users = await user_repo.get_volunteers_with_qualification(qualification)
    return [UserResponse(**user.to_dict()) for user in users]

