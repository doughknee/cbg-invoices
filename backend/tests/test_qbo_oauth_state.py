"""QBO OAuth callback state validation (CSRF guard).

`qbo_connect` records each generated `state` as a `qbo_oauth_initiated`
audit entry; the callback only proceeds if the returned state matches a
recent one. These exercise `_oauth_state_is_valid` directly.
"""
from __future__ import annotations

import os
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

from app.models.audit_log import AuditLog
from app.routers import qbo


async def _session_factory(tmp_path, name: str) -> async_sessionmaker[AsyncSession]:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path}/{name}.db")
    async with engine.begin() as conn:
        await conn.run_sync(AuditLog.__table__.create)
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


def _initiated(state: str, *, created_at: datetime) -> AuditLog:
    return AuditLog(
        actor_id="user-1",
        action="qbo_oauth_initiated",
        message=state,
        created_at=created_at,
    )


@pytest.mark.asyncio
async def test_valid_recent_state_passes(tmp_path) -> None:
    factory = await _session_factory(tmp_path, "valid")
    async with factory() as session:
        session.add(_initiated("abc123", created_at=datetime.now(UTC)))
        await session.commit()

    async with factory() as session:
        assert await qbo._oauth_state_is_valid(session, "abc123") is True


@pytest.mark.asyncio
async def test_unknown_state_rejected(tmp_path) -> None:
    factory = await _session_factory(tmp_path, "unknown")
    async with factory() as session:
        session.add(_initiated("abc123", created_at=datetime.now(UTC)))
        await session.commit()

    async with factory() as session:
        assert await qbo._oauth_state_is_valid(session, "not-the-state") is False


@pytest.mark.asyncio
async def test_missing_state_rejected(tmp_path) -> None:
    factory = await _session_factory(tmp_path, "missing")
    async with factory() as session:
        assert await qbo._oauth_state_is_valid(session, None) is False
        assert await qbo._oauth_state_is_valid(session, "") is False


@pytest.mark.asyncio
async def test_expired_state_rejected(tmp_path) -> None:
    factory = await _session_factory(tmp_path, "expired")
    async with factory() as session:
        stale = datetime.now(UTC) - (qbo.OAUTH_STATE_TTL + timedelta(minutes=1))
        session.add(_initiated("stale", created_at=stale))
        await session.commit()

    async with factory() as session:
        assert await qbo._oauth_state_is_valid(session, "stale") is False
