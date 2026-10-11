
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Plan
from app.schemas.plan import PlanCreate


def create_plan(db: Session, plan_data: PlanCreate):
    name = plan_data.name.strip()

    if not name:
        raise HTTPException(
            status_code=422,
            detail="Plan name cannot be empty",
        )

    plan = Plan(
        name=name,
        included_requests=plan_data.included_requests,
        overage_price=plan_data.overage_price,
    )

    db.add(plan)

    try:
        db.commit()
        db.refresh(plan)
        return plan
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A plan with this name may already exist",
        )


def list_plans(db: Session):
    return db.query(Plan).order_by(Plan.id.desc()).all()
