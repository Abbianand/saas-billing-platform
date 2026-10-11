from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id"),
        nullable=False,
    )

    plan_id: Mapped[int] = mapped_column(
        ForeignKey("plans.id"),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ACTIVE",
    )

    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    tenant = relationship(
        "Tenant",
        back_populates="subscriptions",
    )

    plan = relationship(
        "Plan",
        back_populates="subscriptions",
    )

    usage_records = relationship(
        "UsageRecord",
        back_populates="subscription",
    )