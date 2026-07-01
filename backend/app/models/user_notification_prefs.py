"""Per-user notification preferences.

One row per Logto user id (the same id used for ``invoice.assigned_to_id``).
An absent row means "all defaults on", so existing users keep today's
behaviour until they explicitly opt out of something.
"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db import Base


class UserNotificationPrefs(Base):
    __tablename__ = "user_notification_prefs"

    # Logto user id. Matches CurrentUser.id and invoice.assigned_to_id.
    user_id: Mapped[str] = mapped_column(String(256), primary_key=True)

    # Email me when an invoice is assigned to me.
    assignment_emails: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    # Include me in the daily "your review queue" digest.
    digest_emails: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
