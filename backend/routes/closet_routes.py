from fastapi import APIRouter
from controllers.closet_controller import router as closet_controller

router = APIRouter(prefix="/api/closet", tags=["Closet"])

router.include_router(closet_controller)
