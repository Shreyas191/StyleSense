from fastapi import APIRouter, status
from models.user import UserCreate, UserLogin
from controllers.auth_controller import auth_controller

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """
    Register a new user.
    
    - **email**: User's email address
    - **username**: Unique username
    - **password**: User's password (will be hashed)
    """
    return await auth_controller.signup(user_data)


@router.post("/login")
async def login(login_data: UserLogin):
    """
    Authenticate user and receive JWT token.
    
    - **email**: User's email address
    - **password**: User's password
    """
    return await auth_controller.login(login_data)
