
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.services.dashboard_services import get_dashboard_overview

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/overview")
def dashboard_overview(
    tenant_id: int,
    db: Session = Depends(get_db),
):
    return get_dashboard_overview(
        tenant_id=tenant_id,
        db=db,
    )
