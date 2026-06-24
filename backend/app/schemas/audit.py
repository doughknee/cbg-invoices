"""Audit log DTOs."""
from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    actor_id: str
    actor_email: str | None = None
    invoice_id: UUID | None = None
    # Joined from the referenced invoice (if it still exists) so the UI can show
    # a human label like "Acme Supply #INV-1042" instead of a raw id.
    invoice_vendor_name: str | None = None
    invoice_number: str | None = None
    action: str
    before: dict[str, Any] | None = None
    after: dict[str, Any] | None = None
    message: str | None = None


class AuditLogListResponse(BaseModel):
    logs: list[AuditLogOut]
    total: int
    page: int
    page_size: int
