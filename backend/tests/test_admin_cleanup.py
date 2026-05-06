from __future__ import annotations

import os

import pytest

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

from app.services import admin_cleanup


class _FakeSession:
    def __init__(self) -> None:
        self.table_names: list[str] = []

    async def execute(self, statement) -> None:
        self.table_names.append(statement.table.name)

    async def flush(self) -> None:
        return None


@pytest.mark.asyncio
async def test_purge_operational_data_excludes_coding_options() -> None:
    session = _FakeSession()

    await admin_cleanup.purge_operational_data(session)

    assert session.table_names == [
        "audit_logs",
        "access_requests",
        "invoices",
        "trusted_sender_domains",
        "qbo_tokens",
        "vendors",
        "projects",
    ]
    assert "coding_options" not in session.table_names
