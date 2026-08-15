from fastapi import APIRouter, Depends, status
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from app.services.auth_service import auth_service
from app.security import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & Roles"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegisterRequest):
    return await auth_service.register_user(req)

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest):
    return await auth_service.login_user(req)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return await auth_service.get_current_user_profile(current_user)
