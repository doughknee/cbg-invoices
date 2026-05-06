from __future__ import annotations

import os

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

from app.models.project import Project
from app.models.qbo_token import QboToken
from app.models.trusted_sender_domain import TrustedSenderDomain
from app.models.vendor import Vendor
from app.services import qbo_sync


async def _make_session_factory(tmp_path, name: str) -> async_sessionmaker[AsyncSession]:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path}/{name}.db")
    async with engine.begin() as conn:
        await conn.run_sync(Vendor.__table__.create)
        await conn.run_sync(Project.__table__.create)
        await conn.run_sync(QboToken.__table__.create)
        await conn.run_sync(TrustedSenderDomain.__table__.create)
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest.mark.asyncio
async def test_sync_vendors_marks_missing_rows_inactive(tmp_path, monkeypatch: pytest.MonkeyPatch) -> None:
    session_factory = await _make_session_factory(tmp_path, "vendors")

    async with session_factory() as session:
        session.add_all(
            [
                Vendor(qbo_id="stale", display_name="Stale Vendor", email="stale@example.com", active=True),
                Vendor(qbo_id="keep", display_name="Keep Vendor", email="old@example.com", active=False),
            ]
        )
        await session.commit()

    async def fake_qbo_query(_session: AsyncSession, sql: str):
        assert sql == "SELECT * FROM Vendor"
        return [
            {
                "Id": "keep",
                "DisplayName": "Keep Vendor Updated",
                "PrimaryEmailAddr": {"Address": "keep@example.com"},
                "Active": True,
            }
        ]

    async def fake_sync_from_vendor_emails(_session: AsyncSession):
        return {"added": 0, "kept": 0, "removed": 0}

    monkeypatch.setattr(qbo_sync.qbo_client, "qbo_query", fake_qbo_query)
    monkeypatch.setattr(qbo_sync.trusted_domains, "sync_from_vendor_emails", fake_sync_from_vendor_emails)

    async with session_factory() as session:
        count = await qbo_sync.sync_vendors(session)
        await session.commit()

    assert count == 1

    async with session_factory() as session:
        stale = await session.get(Vendor, (await session.execute(Vendor.__table__.select().where(Vendor.qbo_id == "stale"))).first()[0])
        keep = await session.get(Vendor, (await session.execute(Vendor.__table__.select().where(Vendor.qbo_id == "keep"))).first()[0])

    assert stale is not None and stale.active is False
    assert keep is not None and keep.active is True
    assert keep.display_name == "Keep Vendor Updated"
    assert keep.email == "keep@example.com"
    assert keep.last_synced_at is not None


@pytest.mark.asyncio
async def test_sync_projects_marks_missing_rows_inactive(tmp_path, monkeypatch: pytest.MonkeyPatch) -> None:
    session_factory = await _make_session_factory(tmp_path, "projects")

    async with session_factory() as session:
        session.add_all(
            [
                Project(qbo_id="gone", qbo_type="Customer", display_name="Gone Project", active=True),
                Project(qbo_id="keep", qbo_type="Customer", display_name="Old Name", active=False),
            ]
        )
        await session.commit()

    async def fake_qbo_query(_session: AsyncSession, sql: str):
        assert sql == "SELECT * FROM Customer"
        return [
            {
                "Id": "keep",
                "DisplayName": "Live Project",
                "ParentRef": {"value": "parent-1"},
                "Active": True,
            }
        ]

    monkeypatch.setattr(qbo_sync.qbo_client, "qbo_query", fake_qbo_query)

    async with session_factory() as session:
        count = await qbo_sync.sync_projects(session)
        await session.commit()

    assert count == 1

    async with session_factory() as session:
        stale_row = (await session.execute(Project.__table__.select().where(Project.qbo_id == "gone"))).mappings().one()
        keep_row = (await session.execute(Project.__table__.select().where(Project.qbo_id == "keep"))).mappings().one()

    assert stale_row["active"] is False
    assert keep_row["active"] is True
    assert keep_row["display_name"] == "Live Project"
    assert keep_row["parent_qbo_id"] == "parent-1"
