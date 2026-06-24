"""add invoices.claimed_at

Revision ID: 0010_invoice_claimed_at
Revises: 3fe5b9c1464c
Create Date: 2026-06-24 11:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0010_invoice_claimed_at"
down_revision: Union[str, None] = "3fe5b9c1464c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "invoices",
        sa.Column("claimed_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("invoices", "claimed_at")
