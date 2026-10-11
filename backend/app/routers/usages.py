
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.usage import UsageCreate, UsageResponse
from app.services import usage_service

router = APIRouter(prefix="/usage", tags=["Usage"])


@router.post("/", response_model=UsageResponse, status_code=201)
def create_usage(
    usage_data: UsageCreate,
    db: Session = Depends(get_db),
):
    return usage_service.create_usage(db, usage_data)


@router.get("/", response_model=list[UsageResponse])
def list_usage(db: Session = Depends(get_db)):
    return usage_service.list_usage(db)
