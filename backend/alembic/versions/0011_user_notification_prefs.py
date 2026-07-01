"""add user_notification_prefs

Revision ID: 0011_user_notification_prefs
Revises: 0010_invoice_claimed_at
Create Date: 2026-06-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0011_user_notification_prefs"
down_revision: Union[str, None] = "0010_invoice_claimed_at"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_notification_prefs",
        sa.Column("user_id", sa.String(length=256), nullable=False),
        sa.Column(
            "assignment_emails",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "digest_emails",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("user_id", name=op.f("pk_user_notification_prefs")),
    )


def downgrade() -> None:
    op.drop_table("user_notification_prefs")
