from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
    )

    included_requests: Mapped[int] = mapped_column(
        nullable=False,
    )

    overage_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 4),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    subscriptions = relationship(
        "Subscription",
        back_populates="plan",
    )