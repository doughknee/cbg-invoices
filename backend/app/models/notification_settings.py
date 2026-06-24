"""Singleton settings for outbound notifications (the daily review digest).

One row (id=1), mirroring QboToken's singleton pattern. Created lazily with
defaults the first time the settings are read.
"""
from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db import Base


class NotificationSettings(Base):
    __tablename__ = "notification_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)

    daily_digest_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    # 24h "HH:MM", interpreted in `daily_digest_timezone`.
    daily_digest_time: Mapped[str] = mapped_column(String(5), nullable=False, default="07:30")
    daily_digest_timezone: Mapped[str] = mapped_column(
        String(64), nullable=False, default="America/Chicago"
    )
    # Date (in the configured tz) the digest last went out — guards against a
    # restart re-sending after the daily fire time has passed.
    daily_digest_last_sent_on: Mapped[date | None] = mapped_column(Date, nullable=True)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
