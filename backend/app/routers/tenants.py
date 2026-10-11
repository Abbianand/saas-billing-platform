
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.tenant import TenantCreate, TenantResponse
from app.services import tenant_service

router = APIRouter(prefix="/tenants", tags=["Tenants"])


@router.post("/", response_model=TenantResponse, status_code=201)
def create_tenant(
    tenant_data: TenantCreate,
    db: Session = Depends(get_db),
):
    return tenant_service.create_tenant(db, tenant_data)


@router.get("/", response_model=list[TenantResponse])
def list_tenants(db: Session = Depends(get_db)):
    return tenant_service.list_tenants(db)
