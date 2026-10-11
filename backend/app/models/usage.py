from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UsageRecord(Base):
    __tablename__ = "usage_records"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    subscription_id: Mapped[int] = mapped_column(
        ForeignKey("subscriptions.id"),
        nullable=False,
        index=True,
    )

    usage_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(
        nullable=False,
        default=1,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )


    subscription = relationship(
        "Subscription",
        back_populates="usage_records",
    )