"""Per-user notification preferences and the QBO reconnect-window helper.

Covers the daily-digest opt-out filter, the assignment-email allow check, and
the pure ``_needs_reconnect`` time math.
"""
from __future__ import annotations

import os
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

from app.models.audit_log import AuditLog
from app.models.invoice import Invoice, InvoiceStatus
from app.models.user_notification_prefs import UserNotificationPrefs
from app.routers.qbo import _needs_reconnect
from app.services import notifications as notif


async def _factory(tmp_path, name: str) -> async_sessionmaker[AsyncSession]:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path}/{name}.db")
    async with engine.begin() as conn:
        await conn.run_sync(Invoice.__table__.create)
        await conn.run_sync(AuditLog.__table__.create)
        await conn.run_sync(UserNotificationPrefs.__table__.create)
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


def _ready_invoice(uid: str, email: str, vendor: str) -> Invoice:
    return Invoice(
        source="upload",
        received_at=datetime.now(UTC),
        pdf_storage_key="k",
        pdf_filename="f.pdf",
        pdf_size_bytes=1,
        status=InvoiceStatus.READY_FOR_REVIEW,
        vendor_name=vendor,
        total_cents=100,
        currency="USD",
        line_items=[],
        assigned_to_id=uid,
        assigned_to_email=email,
        assigned_to_name=uid,
    )


# ---------- daily digest opt-out ----------


@pytest.mark.asyncio
async def test_digest_skips_opted_out_user(tmp_path, monkeypatch: pytest.MonkeyPatch) -> None:
    sent: list[str] = []

    async def fake_send(**kwargs):
        sent.append(kwargs["to"])

    monkeypatch.setattr(notif.email_service, "send_email", fake_send)

    factory = await _factory(tmp_path, "digest")
    async with factory() as session:
        session.add_all(
            [
                _ready_invoice("u1", "u1@x.com", "Acme"),
                _ready_invoice("u2", "u2@x.com", "Globex"),
            ]
        )
        session.add(UserNotificationPrefs(user_id="u2", digest_emails=False))
        await session.commit()

        result = await notif.send_daily_digest(session)
        await session.commit()

    assert sent == ["u1@x.com"]  # u2 opted out
    assert result["recipients"] == 1
    assert result["opted_out"] == 1


# ---------- assignment_emails_allowed ----------


@pytest.mark.asyncio
async def test_assignment_allowed_defaults_true(tmp_path) -> None:
    factory = await _factory(tmp_path, "allow_default")
    async with factory() as session:
        assert await notif.assignment_emails_allowed(session, "nobody") is True


@pytest.mark.asyncio
async def test_assignment_allowed_respects_optout(tmp_path) -> None:
    factory = await _factory(tmp_path, "allow_optout")
    async with factory() as session:
        session.add(UserNotificationPrefs(user_id="u1", assignment_emails=False))
        await session.commit()
        assert await notif.assignment_emails_allowed(session, "u1") is False


@pytest.mark.asyncio
async def test_assignment_allowed_is_read_only(tmp_path) -> None:
    """Checking a missing user must not create a prefs row."""
    factory = await _factory(tmp_path, "allow_readonly")
    async with factory() as session:
        await notif.assignment_emails_allowed(session, "ghost")
        await session.commit()
        assert await session.get(UserNotificationPrefs, "ghost") is None


# ---------- QBO reconnect window ----------


def test_needs_reconnect_when_missing() -> None:
    assert _needs_reconnect(None) is True


def test_needs_reconnect_when_expired() -> None:
    assert _needs_reconnect(datetime.now(UTC) - timedelta(days=1)) is True


def test_needs_reconnect_within_warning_window() -> None:
    assert _needs_reconnect(datetime.now(UTC) + timedelta(days=1)) is True


def test_no_reconnect_when_far_out() -> None:
    assert _needs_reconnect(datetime.now(UTC) + timedelta(days=90)) is False


def test_needs_reconnect_handles_naive_datetime() -> None:
    # SQLAlchemy may hand back tz-naive datetimes; treat them as UTC.
    far_future = (datetime.now(UTC) + timedelta(days=90)).replace(tzinfo=None)
    assert _needs_reconnect(far_future) is False
