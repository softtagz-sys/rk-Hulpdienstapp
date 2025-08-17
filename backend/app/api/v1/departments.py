from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import uuid

from app.api.deps import get_current_user, require_roles
from app.models.user import User
from app.models.department import Department
from app.schemas.department import DepartmentResponse, DepartmentCreate, DepartmentUpdate
from app.repositories.department import DepartmentRepository

router = APIRouter()


@router.get("/", response_model=List[DepartmentResponse])
async def list_departments(
        active_only: bool = True,
        current_user: User = Depends(get_current_user)
):
    """List all departments"""
    dept_repo = DepartmentRepository()

    if active_only:
        departments = await dept_repo.get_active_departments()
    else:
        departments = await dept_repo.list_all()

    return [DepartmentResponse(**dept.to_dict()) for dept in departments]


@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(
        department_id: str,
        current_user: User = Depends(get_current_user)
):
    """Get department by ID"""
    dept_repo = DepartmentRepository()
    department = await dept_repo.get_by_id(department_id)

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )

    return DepartmentResponse(**department.to_dict())


@router.post("/", response_model=DepartmentResponse)
async def create_department(
        department_create: DepartmentCreate,
        current_user: User = Depends(require_roles(["supervisor"]))
):
    """Create new department (supervisor only)"""
    dept_repo = DepartmentRepository()

    # Check if department with same code already exists
    existing_dept = await dept_repo.get_by_code(department_create.code)
    if existing_dept:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department with this code already exists"
        )

    # Check if department with same name already exists
    existing_name = await dept_repo.get_by_name(department_create.name)
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department with this name already exists"
        )

    dept_data = department_create.model_dump()
    dept_data['department_id'] = str(uuid.uuid4())

    department = Department(**dept_data)
    created_dept = await dept_repo.create(department)

    if not created_dept:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create department"
        )

    return DepartmentResponse(**created_dept.to_dict())


@router.put("/{department_id}", response_model=DepartmentResponse)
async def update_department(
        department_id: str,
        department_update: DepartmentUpdate,
        current_user: User = Depends(require_roles(["supervisor"]))
):
    """Update department (supervisor only)"""
    dept_repo = DepartmentRepository()

    # Check if department exists
    existing_dept = await dept_repo.get_by_id(department_id)
    if not existing_dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )

    # Update department
    update_data = department_update.model_dump(exclude_unset=True)
    updated_dept = await dept_repo.update(department_id, update_data)

    if not updated_dept:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update department"
        )

    return DepartmentResponse(**updated_dept.to_dict())
