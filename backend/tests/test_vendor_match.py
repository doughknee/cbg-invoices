"""Vendor fuzzy-matching precision.

Regression: WRatio scored the unrelated pair
"VannGo Luxury Mobile Restrooms & Portables (Outside Sales)" vs
"Cathryne & David Hall" at 85.5 — just over the auto-assign cutoff — so an
invoice was silently assigned the wrong QBO vendor. token_set_ratio scores that
pair ~28 while keeping genuine matches above the threshold.
"""
from __future__ import annotations

import os

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

from app.models.vendor import Vendor
from app.services import extraction


async def _factory(tmp_path, name: str) -> async_sessionmaker[AsyncSession]:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path}/{name}.db")
    async with engine.begin() as conn:
        await conn.run_sync(Vendor.__table__.create)
    return async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def _add(session: AsyncSession, *names: str) -> dict[str, object]:
    ids: dict[str, object] = {}
    for i, n in enumerate(names):
        v = Vendor(qbo_id=f"q{i}", display_name=n, email=f"v{i}@x.com", active=True)
        session.add(v)
        await session.flush()
        ids[n] = v.id
    await session.commit()
    return ids


@pytest.mark.asyncio
async def test_unrelated_vendor_is_not_matched(tmp_path) -> None:
    """The reported bug: VannGo invoice must NOT match 'Cathryne & David Hall'."""
    factory = await _factory(tmp_path, "unrelated")
    async with factory() as session:
        await _add(session, "Cathryne & David Hall", "Gulf States Engineering, Inc.")
        got = await extraction._match_vendor(
            session, "VannGo Luxury Mobile Restrooms & Portables (Outside Sales)"
        )
        assert got is None  # no confident match → leave for manual pick


@pytest.mark.asyncio
async def test_real_vendor_still_matches(tmp_path) -> None:
    factory = await _factory(tmp_path, "real")
    async with factory() as session:
        ids = await _add(
            session,
            "Cathryne & David Hall",
            "VannGo Luxury Mobile Restrooms & Portables",
        )
        got = await extraction._match_vendor(
            session, "VannGo Luxury Mobile Restrooms & Portables (Outside Sales)"
        )
        assert got == ids["VannGo Luxury Mobile Restrooms & Portables"]


@pytest.mark.asyncio
async def test_abbreviations_and_suffixes_match(tmp_path) -> None:
    factory = await _factory(tmp_path, "abbrev")
    async with factory() as session:
        ids = await _add(session, "Structural Services, LLC")
        got = await extraction._match_vendor(session, "Structural Services")
        assert got == ids["Structural Services, LLC"]


@pytest.mark.asyncio
async def test_no_vendors_returns_none(tmp_path) -> None:
    factory = await _factory(tmp_path, "empty")
    async with factory() as session:
        assert await extraction._match_vendor(session, "Anything") is None
