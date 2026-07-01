"""Notification settings + manual send. Admin/owner only."""
from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.deps import CurrentUser, get_current_user
from app.schemas.notification import (
    ManualNotificationRequest,
    NotificationSettingsOut,
    NotificationSettingsPatch,
    UserNotificationPrefsOut,
    UserNotificationPrefsPatch,
)
from app.services import logto_admin
from app.services import notifications as notif

log = logging.getLogger(__name__)
router = APIRouter(tags=["notifications"])


async def _require_admin(user: CurrentUser) -> None:
    role = await logto_admin.user_app_role(user.id) or "member"
    if role not in {"owner", "admin"}:
        raise HTTPException(
            status_code=403, detail="Only admins and owners can manage notifications"
        )


@router.get("/settings", response_model=NotificationSettingsOut)
async def get_notification_settings(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    await _require_admin(user)
    cfg = await notif.get_or_create_settings(session)
    await session.commit()
    return NotificationSettingsOut.model_validate(cfg)


@router.patch("/settings", response_model=NotificationSettingsOut)
async def patch_notification_settings(
    body: NotificationSettingsPatch,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    await _require_admin(user)
    cfg = await notif.get_or_create_settings(session)
    updates = body.model_dump(exclude_unset=True)

    if updates.get("daily_digest_time") is not None:
        try:
            cfg.daily_digest_time = notif.validate_time(updates["daily_digest_time"])
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    if updates.get("daily_digest_timezone") is not None:
        try:
            cfg.daily_digest_timezone = notif.validate_timezone(updates["daily_digest_timezone"])
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
    if updates.get("daily_digest_enabled") is not None:
        cfg.daily_digest_enabled = updates["daily_digest_enabled"]

    await session.commit()
    return NotificationSettingsOut.model_validate(cfg)


# ---------- Per-user preferences (self-serve, no admin gate) ----------


@router.get("/preferences", response_model=UserNotificationPrefsOut)
async def get_my_preferences(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    """Return the caller's own notification preferences (any authenticated user)."""
    prefs = await notif.get_user_prefs(session, user.id)
    await session.commit()
    return UserNotificationPrefsOut.model_validate(prefs)


@router.patch("/preferences", response_model=UserNotificationPrefsOut)
async def patch_my_preferences(
    body: UserNotificationPrefsPatch,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    """Update the caller's own notification preferences."""
    prefs = await notif.get_user_prefs(session, user.id)
    updates = body.model_dump(exclude_unset=True)
    if "assignment_emails" in updates:
        prefs.assignment_emails = updates["assignment_emails"]
    if "digest_emails" in updates:
        prefs.digest_emails = updates["digest_emails"]
    await session.commit()
    return UserNotificationPrefsOut.model_validate(prefs)


@router.post("/send")
async def send_manual_notification(
    body: ManualNotificationRequest,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    await _require_admin(user)
    result = await notif.send_manual_notification(
        session,
        actor_label=user.email or user.name or "An admin",
        recipients=[(r.email, r.name) for r in body.recipients],
        message=body.message,
        invoice_id=body.invoice_id,
    )
    await session.commit()
    return result


@router.post("/digest/run")
async def run_daily_digest_now(
    user: Annotated[CurrentUser, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    """Fire the daily digest immediately — for admins to test/preview."""
    await _require_admin(user)
    result = await notif.send_daily_digest(session)
    await session.commit()
    return result
