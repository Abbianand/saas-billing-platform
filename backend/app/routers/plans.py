
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.plan import PlanCreate, PlanResponse
from app.services import plan_service

router = APIRouter(prefix="/plans", tags=["Plans"])


@router.post("/", response_model=PlanResponse, status_code=201)
def create_plan(
    plan_data: PlanCreate,
    db: Session = Depends(get_db),
):
    return plan_service.create_plan(db, plan_data)


@router.get("/", response_model=list[PlanResponse])
def list_plans(db: Session = Depends(get_db)):
    return plan_service.list_plans(db)
