from fastapi import APIRouter

from .auth import router as auth_router
from .users import router as users_router
from .services import router as services_router
from .departments import router as departments_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(services_router, prefix="/services", tags=["services"])
api_router.include_router(departments_router, prefix="/departments", tags=["departments"])