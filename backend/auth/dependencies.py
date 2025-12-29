from fastapi import Depends, HTTPException, status
from models.user import User, TokenData
from auth.jwt_handler import get_current_user as get_current_token
from services.user_service import user_service

async def get_current_user(token_data: TokenData = Depends(get_current_token)) -> User:
    """
    Dependency that retrieves the full User object from the database 
    based on the JWT token.
    """
    user = await user_service.get_user_by_email(token_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
