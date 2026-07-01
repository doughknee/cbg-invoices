"""qbo_tokens: make OAuth fields nullable so disconnect keeps config

Disconnecting used to delete the whole qbo_tokens row, wiping
default_expense_account_id and project_source. Reconnecting then created a
fresh row with those unset, which broke posting. We now keep the row on
disconnect and null only the OAuth fields, so config survives — which
requires those columns to be nullable.

Revision ID: 0012_qbo_token_nullable_auth
Revises: 0011_user_notification_prefs
Create Date: 2026-06-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0012_qbo_token_nullable_auth"
down_revision: Union[str, None] = "0011_user_notification_prefs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_COLS = ("realm_id", "access_token", "refresh_token", "expires_at", "refresh_expires_at")


def upgrade() -> None:
    for col in _COLS:
        op.alter_column("qbo_tokens", col, nullable=True)


def downgrade() -> None:
    # Any disconnected (null-auth) row would violate NOT NULL; clear it first so
    # the constraint can be restored.
    op.execute(
        "DELETE FROM qbo_tokens WHERE access_token IS NULL OR refresh_token IS NULL "
        "OR realm_id IS NULL OR expires_at IS NULL OR refresh_expires_at IS NULL"
    )
    for col in _COLS:
        op.alter_column("qbo_tokens", col, nullable=False)
