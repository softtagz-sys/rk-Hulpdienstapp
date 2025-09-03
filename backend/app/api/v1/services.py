from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
import uuid
from datetime import datetime

from app.api.deps import get_current_user, require_roles
from app.models.user import User
from app.models.service import Service
from app.schemas.service import (
    ServiceResponse, ServiceCreate, ServiceUpdate, ServiceRegistrationRequest,
    ServiceListResponse, ServiceAssignmentResponse
)
from app.repositories.service import ServiceRepository, ServiceAssignmentRepository
from app.repositories.user import UserRepository

router = APIRouter()


@router.get("/", response_model=ServiceListResponse)
async def list_services(
        department: Optional[str] = Query(None, description="Filter by department"),
        start_date: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
        status: Optional[str] = Query(None, description="Filter by status"),
        page: int = Query(1, ge=1, description="Page number"),
        page_size: int = Query(20, ge=1, le=100, description="Page size"),
        current_user: User = Depends(get_current_user)
):
    """List services with filters"""
    service_repo = ServiceRepository()
    assignment_repo = ServiceAssignmentRepository()

    # Get services based on filters
    if department:
        services = await service_repo.get_by_department(department)
    elif start_date and end_date:
        services = await service_repo.get_by_date_range(start_date, end_date)
    else:
        services = await service_repo.list_all()

    # Filter by status if specified
    if status:
        services = [s for s in services if s.status == status]

    # Sort by date and time
    services.sort(key=lambda x: (x.date, x.start_time))

    # Pagination
    total_count = len(services)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_services = services[start_idx:end_idx]

    # Get assignments for each service
    service_responses = []
    for service in paginated_services:
        assignments = await assignment_repo.get_by_service(service.service_id)
        assignment_responses = [
            ServiceAssignmentResponse(**assignment.to_dict())
            for assignment in assignments
        ]

        service_dict = service.to_dict()
        service_dict['assigned_volunteers'] = assignment_responses
        service_responses.append(ServiceResponse(**service_dict))

    return ServiceListResponse(
        services=service_responses,
        total_count=total_count,
        page=page,
        page_size=page_size
    )


@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(
        service_id: str,
        current_user: User = Depends(get_current_user)
):
    """Get service by ID"""
    service_repo = ServiceRepository()
    assignment_repo = ServiceAssignmentRepository()

    service = await service_repo.get_by_id(service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    # Get assignments
    assignments = await assignment_repo.get_by_service(service_id)
    assignment_responses = [
        ServiceAssignmentResponse(**assignment.to_dict())
        for assignment in assignments
    ]

    service_dict = service.to_dict()
    service_dict['assigned_volunteers'] = assignment_responses

    return ServiceResponse(**service_dict)


@router.post("/", response_model=ServiceResponse)
async def create_service(
        service_create: ServiceCreate,
        current_user: User = Depends(require_roles(["supervisor"]))
):
    """Create new service (supervisor only)"""
    service_repo = ServiceRepository()

    service_data = service_create.model_dump()
    service_data['service_id'] = str(uuid.uuid4())
    service_data['status'] = 'open'
    service_data['assigned_count'] = 0

    service = Service(**service_data)
    created_service = await service_repo.create(service)

    if not created_service:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create service"
        )

    service_dict = created_service.to_dict()
    service_dict['assigned_volunteers'] = []

    return ServiceResponse(**service_dict)


@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
        service_id: str,
        service_update: ServiceUpdate,
        current_user: User = Depends(require_roles(["supervisor"]))
):
    """Update service (supervisor only)"""
    service_repo = ServiceRepository()
    assignment_repo = ServiceAssignmentRepository()

    # Check if service exists
    existing_service = await service_repo.get_by_id(service_id)
    if not existing_service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    # Update service
    update_data = service_update.model_dump(exclude_unset=True)
    updated_service = await service_repo.update(service_id, update_data)

    if not updated_service:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update service"
        )

    # Get assignments
    assignments = await assignment_repo.get_by_service(service_id)
    assignment_responses = [
        ServiceAssignmentResponse(**assignment.to_dict())
        for assignment in assignments
    ]

    service_dict = updated_service.to_dict()
    service_dict['assigned_volunteers'] = assignment_responses

    return ServiceResponse(**service_dict)


@router.post("/{service_id}/register")
async def register_for_service(
        service_id: str,
        registration: ServiceRegistrationRequest,
        current_user: User = Depends(get_current_user)
):
    """Register for a service"""
    service_repo = ServiceRepository()
    assignment_repo = ServiceAssignmentRepository()

    # Check if service exists and is open
    service = await service_repo.get_by_id(service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    if service.status != 'open':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service is not open for registration"
        )

    # Check if user is already registered
    existing_assignment = await assignment_repo.get_assignment(service_id, current_user.user_id)
    if existing_assignment:
        # Update existing registration
        updated_assignment = await assignment_repo.update_assignment_preference(
            existing_assignment.assignment_id,
            registration.preference
        )
        return {"message": "Registration updated successfully", "assignment_id": updated_assignment.assignment_id}

    # Create new assignment
    assignment = await assignment_repo.create_assignment(
        service_id=service_id,
        volunteer_id=current_user.user_id,
        volunteer_name=current_user.name,
        volunteer_qualifications=current_user.qualifications,
        preference=registration.preference
    )

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register for service"
        )

    return {"message": "Registered successfully", "assignment_id": assignment.assignment_id}


@router.post("/{service_id}/assign/{volunteer_id}")
async def assign_volunteer_to_service(
        service_id: str,
        volunteer_id: str,
        current_user: User = Depends(require_roles(["supervisor"]))
):
    """Assign volunteer to service (supervisor only)"""
    service_repo = ServiceRepository()
    assignment_repo = ServiceAssignmentRepository()

    # Check if service exists
    service = await service_repo.get_by_id(service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    # Check if service is full TODO: re-enable capacity check when min/max logic is defined
    #if service.assigned_count >= service.min_volunteers:
    #    raise HTTPException(
    #        status_code=status.HTTP_400_BAD_REQUEST,
    #        detail="Service is at maximum capacity"
    #    )

    # Get assignment
    assignment = await assignment_repo.get_assignment(service_id, volunteer_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer registration not found"
        )

    if assignment.status == 'assigned':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Volunteer is already assigned"
        )

    # Assign volunteer
    updated_assignment = await assignment_repo.update_assignment_status(
        assignment.assignment_id,
        'assigned'
    )

    # Increment service assigned count
    await service_repo.increment_assigned_count(service_id)

    return {"message": "Volunteer assigned successfully"}


@router.delete("/{service_id}/assign/{volunteer_id}")
async def unassign_volunteer_from_service(
        service_id: str,
        volunteer_id: str,
        current_user: User = Depends(require_roles(["supervisor"]))
):
    """Unassign volunteer from service (supervisor only)"""
    service_repo = ServiceRepository()
    assignment_repo = ServiceAssignmentRepository()

    # Get assignment
    assignment = await assignment_repo.get_assignment(service_id, volunteer_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    if assignment.status != 'assigned':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Volunteer is not currently assigned"
        )

    # Unassign volunteer
    updated_assignment = await assignment_repo.update_assignment_status(
        assignment.assignment_id,
        'pending'
    )

    # Decrement service assigned count
    await service_repo.decrement_assigned_count(service_id)

    return {"message": "Volunteer unassigned successfully"}
