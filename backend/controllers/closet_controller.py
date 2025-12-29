from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models.closet import ClosetItem, ClosetItemCreate, ClosetItemUpdate
from services.closet_service import ClosetService
from auth.dependencies import get_current_user
from models.user import User

router = APIRouter()

@router.post("/", response_model=ClosetItem, status_code=status.HTTP_201_CREATED)
async def add_item_to_closet(
    item: ClosetItemCreate,
    current_user: User = Depends(get_current_user)
):
    """Add a new item to the user's virtual closet."""
    return await ClosetService.create_item(str(current_user.id), item)

@router.get("/", response_model=List[ClosetItem])
async def get_my_closet(current_user: User = Depends(get_current_user)):
    """Retrieve all items in the user's closet."""
    return await ClosetService.get_user_closet(str(current_user.id))

@router.get("/{item_id}", response_model=ClosetItem)
async def get_closet_item(
    item_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific closet item details."""
    item = await ClosetService.get_item(item_id, str(current_user.id))
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return item

@router.patch("/{item_id}", response_model=ClosetItem)
async def update_closet_item(
    item_id: str,
    item_update: ClosetItemUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a closet item."""
    updated_item = await ClosetService.update_item(item_id, str(current_user.id), item_update)
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return updated_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_closet_item(
    item_id: str,
    current_user: User = Depends(get_current_user)
):
    """Remove an item from the closet."""
    success = await ClosetService.delete_item(item_id, str(current_user.id))
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return None
