
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Tenant, UsageRecord, Subscription
from app.schemas.usage import UsageCreate


def create_usage(db: Session, usage_data: UsageCreate):
    if usage_data.usage_type not in {"REQUEST", "API"}:
        raise HTTPException(
            status_code=422,
            detail="usage_type must be REQUEST or API",
        )

    tenant = db.query(Tenant).filter(
        Tenant.id == usage_data.tenant_id
    ).first()

    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="Tenant not found",
        )

    subscription = (
        db.query(Subscription)
        .filter(
            Subscription.tenant_id == tenant.id,
            Subscription.status == "ACTIVE",
        )
        .order_by(Subscription.start_date.desc())
        .first()
    )

    if not subscription:
        raise HTTPException(
            status_code=404,
            detail="No active subscription found for this tenant",
        )

    usage = UsageRecord(
        subscription_id=subscription.id,
        usage_type=usage_data.usage_type,
        quantity=1,
    )

    try:
        db.add(usage)
        db.commit()
        db.refresh(usage)
        return usage
    except Exception:
        db.rollback()
        raise


def list_usage(db: Session):
    return (
        db.query(UsageRecord)
        .order_by(UsageRecord.id.desc())
        .all()
    )
