"""Helpers for one-time operational data cleanup in production."""
from __future__ import annotations

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.access_request import AccessRequest
from app.models.audit_log import AuditLog
from app.models.invoice import Invoice
from app.models.project import Project
from app.models.qbo_token import QboToken
from app.models.trusted_sender_domain import TrustedSenderDomain
from app.models.vendor import Vendor


async def purge_operational_data(session: AsyncSession) -> None:
    """Delete operational rows while preserving auth users and coding options."""
    for model in (
        AuditLog,
        AccessRequest,
        Invoice,
        TrustedSenderDomain,
        QboToken,
        Vendor,
        Project,
    ):
        await session.execute(delete(model))
    await session.flush()
