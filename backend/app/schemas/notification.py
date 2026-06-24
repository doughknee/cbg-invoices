"""Pydantic DTOs for notification settings and manual sends."""
from __future__ import annotations

from datetime import date
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class NotificationSettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    daily_digest_enabled: bool
    daily_digest_time: str
    daily_digest_timezone: str
    daily_digest_last_sent_on: date | None


class NotificationSettingsPatch(BaseModel):
    daily_digest_enabled: bool | None = None
    daily_digest_time: str | None = None
    daily_digest_timezone: str | None = None


class ManualRecipient(BaseModel):
    email: str = Field(min_length=3, max_length=256)
    name: str | None = Field(default=None, max_length=256)


class ManualNotificationRequest(BaseModel):
    recipients: list[ManualRecipient] = Field(min_length=1, max_length=100)
    message: str | None = Field(default=None, max_length=4000)
    invoice_id: UUID | None = None

    @model_validator(mode="after")
    def _require_content(self) -> ManualNotificationRequest:
        if not (self.message and self.message.strip()) and self.invoice_id is None:
            raise ValueError("Provide a message, an invoice, or both.")
        return self
