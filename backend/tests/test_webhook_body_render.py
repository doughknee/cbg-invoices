from __future__ import annotations

import os
from datetime import UTC, datetime

import pytest
from fastapi import BackgroundTasks

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

from app.routers import webhooks


@pytest.mark.asyncio
async def test_process_inbound_email_renders_short_body_when_no_pdf(monkeypatch: pytest.MonkeyPatch) -> None:
    rendered_called = False
    rejected_called = False

    async def fake_ingest_body_only(**kwargs):
        nonlocal rendered_called
        rendered_called = True
        return {"status": "ok", "invoice_ids": ["abc"], "body_rendered": True}

    async def fake_record_rejected_no_pdf(**kwargs):
        nonlocal rejected_called
        rejected_called = True
        return {"status": "rejected_no_pdf", "invoice_id": "stub"}

    monkeypatch.setattr(webhooks, "_ingest_body_only", fake_ingest_body_only)
    monkeypatch.setattr(webhooks, "_record_rejected_no_pdf", fake_record_rejected_no_pdf)

    result = await webhooks._process_inbound_email(
        session=object(),
        background=BackgroundTasks(),
        provider="resend",
        message_id="msg-1",
        sender="vendor@example.com",
        subject="Invoice 123",
        body_text="Please process invoice 123 for $250 due Friday.",
        body_html=None,
        received_at=datetime.now(UTC),
        attachments=[],
    )

    assert result["status"] == "ok"
    assert rendered_called is True
    assert rejected_called is False
