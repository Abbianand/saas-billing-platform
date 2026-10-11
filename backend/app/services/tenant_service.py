
from datetime import date

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Tenant, Plan, Subscription
from app.schemas.tenant import TenantCreate


def create_tenant(db: Session, tenant_data: TenantCreate):
    name = tenant_data.name.strip()

    if not name:
        raise HTTPException(
            status_code=422,
            detail="Tenant name cannot be empty",
        )

    plan = db.query(Plan).filter(
        Plan.id == tenant_data.plan_id
    ).first()

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Plan not found",
        )

    tenant = Tenant(name=name)

    try:
        db.add(tenant)
        db.flush()

        subscription = Subscription(
            tenant_id=tenant.id,
            plan_id=plan.id,
            status="ACTIVE",
            start_date=date.today(),
        )

        db.add(subscription)
        db.commit()
        db.refresh(tenant)

        return {
            "id": tenant.id,
            "name": tenant.name,
            "plan_id": plan.id,
            "plan_name": plan.name,
        }

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A tenant with this name may already exist",
        )
    except Exception:
        db.rollback()
        raise


def list_tenants(db: Session):
    rows = (
        db.query(Tenant, Subscription, Plan)
        .join(
            Subscription,
            Subscription.tenant_id == Tenant.id,
        )
        .join(
            Plan,
            Plan.id == Subscription.plan_id,
        )
        .order_by(Tenant.id.desc())
        .all()
    )

    return [
        {
            "id": tenant.id,
            "name": tenant.name,
            "plan_id": plan.id,
            "plan_name": plan.name,
        }
        for tenant, subscription, plan in rows
    ]
