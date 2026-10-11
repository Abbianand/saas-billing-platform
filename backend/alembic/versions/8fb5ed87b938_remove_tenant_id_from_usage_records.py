
"""remove tenant_id from usage records

Revision ID: 8fb5ed87b938
Revises: bcec6d0fe736
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8fb5ed87b938"
down_revision: Union[str, Sequence[str], None] = "bcec6d0fe736"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add the new column temporarily as nullable.
    op.add_column(
        "usage_records",
        sa.Column("subscription_id", sa.Integer(), nullable=True),
    )

    # Preserve existing records by mapping each tenant to a subscription.
    op.execute(
        """
        UPDATE usage_records AS u
        SET subscription_id = (
            SELECT s.id
            FROM subscriptions AS s
            WHERE s.tenant_id = u.tenant_id
            ORDER BY
                CASE WHEN s.status = 'ACTIVE' THEN 0 ELSE 1 END,
                s.id DESC
            LIMIT 1
        )
        """
    )

    # Do not continue if any usage record has no matching subscription.
    connection = op.get_bind()
    missing = connection.execute(
        sa.text(
            "SELECT COUNT(*) FROM usage_records "
            "WHERE subscription_id IS NULL"
        )
    ).scalar_one()

    if missing:
        raise RuntimeError(
            f"{missing} usage record(s) have no matching subscription. "
            "Resolve these records before retrying the migration."
        )

    op.alter_column(
        "usage_records",
        "subscription_id",
        existing_type=sa.Integer(),
        nullable=False,
    )

    op.create_index(
        op.f("ix_usage_records_subscription_id"),
        "usage_records",
        ["subscription_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_usage_records_subscription_id_subscriptions",
        "usage_records",
        "subscriptions",
        ["subscription_id"],
        ["id"],
    )

    # Remove the old tenant relationship.
    op.drop_constraint(
        "usage_records_tenant_id_fkey",
        "usage_records",
        type_="foreignkey",
    )
    op.drop_index(
        op.f("ix_usage_records_tenant_id"),
        table_name="usage_records",
    )
    op.drop_column("usage_records", "tenant_id")


def downgrade() -> None:
    # Restore tenant_id from the linked subscription.
    op.add_column(
        "usage_records",
        sa.Column("tenant_id", sa.Integer(), nullable=True),
    )

    op.execute(
        """
        UPDATE usage_records AS u
        SET tenant_id = s.tenant_id
        FROM subscriptions AS s
        WHERE s.id = u.subscription_id
        """
    )

    connection = op.get_bind()
    missing = connection.execute(
        sa.text(
            "SELECT COUNT(*) FROM usage_records "
            "WHERE tenant_id IS NULL"
        )
    ).scalar_one()

    if missing:
        raise RuntimeError(
            f"{missing} usage record(s) cannot be mapped back to a tenant."
        )

    op.alter_column(
        "usage_records",
        "tenant_id",
        existing_type=sa.Integer(),
        nullable=False,
    )

    op.create_index(
        op.f("ix_usage_records_tenant_id"),
        "usage_records",
        ["tenant_id"],
        unique=False,
    )

    op.create_foreign_key(
        "usage_records_tenant_id_fkey",
        "usage_records",
        "tenants",
        ["tenant_id"],
        ["id"],
    )

    op.drop_constraint(
        "fk_usage_records_subscription_id_subscriptions",
        "usage_records",
        type_="foreignkey",
    )
    op.drop_index(
        op.f("ix_usage_records_subscription_id"),
        table_name="usage_records",
    )
    op.drop_column("usage_records", "subscription_id")