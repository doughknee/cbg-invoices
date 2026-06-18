from __future__ import annotations

import os
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

from app.routers import invoices


def test_ensure_review_assignee_allows_assigned_user() -> None:
    invoice = SimpleNamespace(assigned_to_id="user-1")
    user = SimpleNamespace(id="user-1")

    invoices._ensure_review_assignee(invoice, user, action="approve")


def test_ensure_review_assignee_rejects_unassigned_invoice() -> None:
    invoice = SimpleNamespace(assigned_to_id=None)
    user = SimpleNamespace(id="user-1")

    with pytest.raises(HTTPException) as exc_info:
        invoices._ensure_review_assignee(invoice, user, action="approve")

    assert exc_info.value.status_code == 409
    assert "must be assigned" in exc_info.value.detail.lower()


def test_ensure_review_assignee_rejects_non_assignee() -> None:
    invoice = SimpleNamespace(assigned_to_id="user-2")
    user = SimpleNamespace(id="user-1")

    with pytest.raises(HTTPException) as exc_info:
        invoices._ensure_review_assignee(invoice, user, action="post to qbo")

    assert exc_info.value.status_code == 403
    assert "assigned user" in exc_info.value.detail.lower()


# ---------- reject guard ----------
# Reject stays open on unassigned invoices (triaging junk) but is locked to
# the assignee once someone owns the invoice.


def test_ensure_can_reject_allows_unassigned_invoice() -> None:
    invoice = SimpleNamespace(assigned_to_id=None)
    user = SimpleNamespace(id="user-1")

    invoices._ensure_can_reject(invoice, user)  # should not raise


def test_ensure_can_reject_allows_own_assignment() -> None:
    invoice = SimpleNamespace(assigned_to_id="user-1")
    user = SimpleNamespace(id="user-1")

    invoices._ensure_can_reject(invoice, user)  # should not raise


def test_ensure_can_reject_blocks_other_users_assignment() -> None:
    invoice = SimpleNamespace(assigned_to_id="user-2")
    user = SimpleNamespace(id="user-1")

    with pytest.raises(HTTPException) as exc_info:
        invoices._ensure_can_reject(invoice, user)

    assert exc_info.value.status_code == 403
    assert "assigned to someone else" in exc_info.value.detail.lower()


# ---------- admin gate ----------


@pytest.mark.asyncio
async def test_require_admin_allows_admin(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_role(_user_id: str) -> str:
        return "admin"

    monkeypatch.setattr(invoices.logto_admin, "user_app_role", fake_role)
    await invoices._require_admin(SimpleNamespace(id="user-1"), action="trust a sender domain")


@pytest.mark.asyncio
async def test_require_admin_blocks_member(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_role(_user_id: str) -> str:
        return "member"

    monkeypatch.setattr(invoices.logto_admin, "user_app_role", fake_role)
    with pytest.raises(HTTPException) as exc_info:
        await invoices._require_admin(SimpleNamespace(id="user-1"), action="trust a sender domain")

    assert exc_info.value.status_code == 403
    assert "admins and owners" in exc_info.value.detail.lower()
