"""QuickBooks Online DTOs."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class QboStatus(BaseModel):
    connected: bool
    realm_id: str | None = None
    # Environment is always surfaced so the UI can construct correct deep-links
    # (sandbox vs production QBO have different hostnames)
    environment: str = "sandbox"
    expires_at: datetime | None = None
    refresh_expires_at: datetime | None = None
    # True when the refresh token has lapsed (or is about to). Once the refresh
    # token dies, posting silently fails until someone reconnects, so the UI
    # uses this to prompt a reconnect proactively instead of after a failed post.
    needs_reconnect: bool = False
    # True when no default expense account is configured (neither saved nor via
    # env). Posting fails without one, so the UI warns before a post is tried.
    needs_expense_account: bool = False
    last_vendor_sync_at: datetime | None = None
    last_project_sync_at: datetime | None = None
    project_source: str = "Customer"
    default_expense_account_id: str | None = None


class QboAuthUrl(BaseModel):
    url: str


class QboSettingsPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    project_source: str | None = None  # Customer | Class
    default_expense_account_id: str | None = None  # QBO account id (empty string → clear)


class QboExpenseAccount(BaseModel):
    id: str
    name: str
    account_type: str | None = None
    account_sub_type: str | None = None
