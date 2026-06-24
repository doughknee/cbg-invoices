"""add notification_settings

Revision ID: 3fe5b9c1464c
Revises: 0009_email_triage_design
Create Date: 2026-06-24 13:46:17.619831

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3fe5b9c1464c'
down_revision: Union[str, None] = '0009_email_triage_design'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Only the new table — autogenerate also surfaced spurious index/unique
    # "drift" on existing tables (a naming-convention vs hand-written-migration
    # mismatch); those are intentionally omitted.
    op.create_table(
        "notification_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("daily_digest_enabled", sa.Boolean(), nullable=False),
        sa.Column("daily_digest_time", sa.String(length=5), nullable=False),
        sa.Column("daily_digest_timezone", sa.String(length=64), nullable=False),
        sa.Column("daily_digest_last_sent_on", sa.Date(), nullable=True),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_notification_settings")),
    )


def downgrade() -> None:
    op.drop_table("notification_settings")
