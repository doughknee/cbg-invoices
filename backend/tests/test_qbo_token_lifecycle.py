"""Disconnect preserves QBO config; status reflects auth + expense-account state.

Regression: disconnecting deleted the whole qbo_tokens row, wiping
default_expense_account_id. Reconnecting then left it unset and every post
failed with "No default expense account configured". Disconnect now keeps the
row and nulls only the OAuth fields.
"""
from __future__ import annotations

import os
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

from app.models.qbo_token import QboToken
from app.routers import qbo as qbo_router
from app.services import qbo_client


async def _factory(tmp_path, name: str) -> async_sessionmaker[AsyncSession]:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path}/{name}.db")
    async with engine.begin() as conn:
        await conn.run_sync(QboToken.__table__.create)
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


def _connected_token() -> QboToken:
    now = datetime.now(UTC)
    return QboToken(
        id=1,
        realm_id="realm-123",
        access_token="access",
        refresh_token="refresh",
        expires_at=now + timedelta(hours=1),
        refresh_expires_at=now + timedelta(days=90),
        project_source="Class",
        default_expense_account_id="acct-77",
    )


@pytest.mark.asyncio
async def test_disconnect_preserves_config_and_nulls_auth(tmp_path) -> None:
    factory = await _factory(tmp_path, "revoke")
    async with factory() as session:
        session.add(_connected_token())
        await session.commit()

        await qbo_client.revoke_token(session)
        await session.commit()

        row = await session.get(QboToken, 1)
        assert row is not None  # row kept, not deleted
        assert row.access_token is None
        assert row.refresh_token is None
        assert row.realm_id is None
        # Durable config survives for the next reconnect.
        assert row.default_expense_account_id == "acct-77"
        assert row.project_source == "Class"


@pytest.mark.asyncio
async def test_ensure_fresh_token_raises_when_disconnected(tmp_path) -> None:
    factory = await _factory(tmp_path, "fresh")
    async with factory() as session:
        session.add(_connected_token())
        await session.commit()
        await qbo_client.revoke_token(session)
        await session.commit()

        with pytest.raises(qbo_client.QboNotConnectedError):
            await qbo_client.ensure_fresh_token(session)


@pytest.mark.asyncio
async def test_status_disconnected_after_revoke(tmp_path) -> None:
    factory = await _factory(tmp_path, "status_off")
    async with factory() as session:
        session.add(_connected_token())
        await session.commit()
        await qbo_client.revoke_token(session)
        await session.commit()

        status = await qbo_router.qbo_status(SimpleNamespace(id="u1"), session)
        assert status.connected is False


@pytest.mark.asyncio
async def test_status_flags_missing_expense_account(tmp_path, monkeypatch) -> None:
    factory = await _factory(tmp_path, "status_acct")
    async with factory() as session:
        tok = _connected_token()
        tok.default_expense_account_id = None
        session.add(tok)
        await session.commit()

        # Deterministic: no saved account and no env fallback.
        fake = SimpleNamespace(qbo_environment="sandbox", qbo_default_expense_account_id="")
        monkeypatch.setattr(qbo_router, "get_settings", lambda: fake)
        status = await qbo_router.qbo_status(SimpleNamespace(id="u1"), session)
        assert status.connected is True
        assert status.needs_expense_account is True


@pytest.mark.asyncio
async def test_status_expense_account_ok_when_set(tmp_path) -> None:
    factory = await _factory(tmp_path, "status_ok")
    async with factory() as session:
        session.add(_connected_token())  # has default_expense_account_id
        await session.commit()

        status = await qbo_router.qbo_status(SimpleNamespace(id="u1"), session)
        assert status.needs_expense_account is False
