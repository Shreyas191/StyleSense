from fastapi import HTTPException, status
from datetime import timedelta
from models.user import UserCreate, UserLogin, Token, User
from services.user_service import user_service
from auth.jwt_handler import verify_password, create_access_token
from config.settings import settings


class AuthController:
    @staticmethod
    async def signup(user_data: UserCreate) -> dict:
        """Register a new user."""
        try:
            # Create user
            user = await user_service.create_user(user_data)
            
            # Create access token
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.email}, 
                expires_delta=access_token_expires
            )
            
            return {
                "success": True,
                "message": "User created successfully",
                "data": {
                    "user": User(
                        _id=user.id,
                        email=user.email,
                        username=user.username,
                        created_at=user.created_at
                    ),
                    "token": Token(access_token=access_token, token_type="bearer")
                }
            }
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating user: {str(e)}"
            )
    
    @staticmethod
    async def login(login_data: UserLogin) -> dict:
        """Authenticate user and return token."""
        # Get user
        user = await user_service.get_user_by_email(login_data.email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Verify password
        if not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, 
            expires_delta=access_token_expires
        )
        
        return {
            "success": True,
            "message": "Login successful",
            "data": {
                "user": User(
                    _id=user.id,
                    email=user.email,
                    username=user.username,
                    created_at=user.created_at
                ),
                "token": Token(access_token=access_token, token_type="bearer")
            }
        }


auth_controller = AuthController()
