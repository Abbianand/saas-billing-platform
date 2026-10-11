
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Tenant, Subscription, UsageRecord


def get_dashboard_overview(
    tenant_id: int,
    db: Session,
):
    tenant = (
        db.query(Tenant)
        .filter(Tenant.id == tenant_id)
        .first()
    )

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
            detail="No active subscription found",
        )

    plan = subscription.plan

    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)

    if now.month == 12:
        next_month = datetime(now.year + 1, 1, 1)
    else:
        next_month = datetime(now.year, now.month + 1, 1)

    usage_rows = (
        db.query(
            UsageRecord.usage_type,
            func.coalesce(
                func.sum(UsageRecord.quantity), 0
            ),
        )
        .filter(
            UsageRecord.subscription_id == subscription.id,
            UsageRecord.created_at >= month_start,
            UsageRecord.created_at < next_month,
        )
        .group_by(UsageRecord.usage_type)
        .all()
    )

    usage_totals = {
        usage_type: int(quantity)
        for usage_type, quantity in usage_rows
    }

    request_used = usage_totals.get("REQUEST", 0)
    api_used = usage_totals.get("API", 0)

    total_used = request_used + api_used
    included = plan.included_requests

    remaining = max(included - total_used, 0)
    overage = max(total_used - included, 0)
    overage_amount = overage * plan.overage_price

    usage_percentage = (
        round(total_used / included * 100, 2)
        if included > 0 else 0
    )

    return {
        "tenant_id": tenant.id,
        "tenant_name": tenant.name,
        "subscription_id": subscription.id,
        "plan_name": plan.name,
        "included_requests": included,
        "request_used": request_used,
        "api_used": api_used,
        "total_used": total_used,
        "remaining_requests": remaining,
        "overage_requests": overage,
        "overage_price": plan.overage_price,
        "overage_amount": overage_amount,
        "usage_percentage": usage_percentage,
        "billing_period": now.strftime("%B %Y"),
    }
