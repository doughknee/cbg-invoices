from __future__ import annotations

import os
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

from app.routers import invoices


def _patch_role(monkeypatch: pytest.MonkeyPatch, role: str) -> None:
    async def fake_role(_user_id: str) -> str:
        return role

    monkeypatch.setattr(invoices.logto_admin, "user_app_role", fake_role)


# ---------- review guard (approve / post / unapprove) ----------
# Admins/owners act on any invoice; members only on invoices assigned to them.


@pytest.mark.asyncio
async def test_ensure_can_review_admin_allows_any(monkeypatch: pytest.MonkeyPatch) -> None:
    _patch_role(monkeypatch, "admin")
    admin = SimpleNamespace(id="admin-1")
    # Unassigned, and assigned-to-someone-else — both fine for an admin.
    await invoices._ensure_can_review(
        SimpleNamespace(assigned_to_id=None), admin, action="approve"
    )
    await invoices._ensure_can_review(
        SimpleNamespace(assigned_to_id="user-2"), admin, action="approve"
    )


@pytest.mark.asyncio
async def test_ensure_can_review_member_allows_own(monkeypatch: pytest.MonkeyPatch) -> None:
    _patch_role(monkeypatch, "member")
    await invoices._ensure_can_review(
        SimpleNamespace(assigned_to_id="user-1"), SimpleNamespace(id="user-1"), action="approve"
    )


@pytest.mark.asyncio
async def test_ensure_can_review_member_blocks_unassigned(monkeypatch: pytest.MonkeyPatch) -> None:
    _patch_role(monkeypatch, "member")
    with pytest.raises(HTTPException) as exc_info:
        await invoices._ensure_can_review(
            SimpleNamespace(assigned_to_id=None), SimpleNamespace(id="user-1"), action="approve"
        )
    assert exc_info.value.status_code == 403
    assert "assigned user" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_ensure_can_review_member_blocks_other(monkeypatch: pytest.MonkeyPatch) -> None:
    _patch_role(monkeypatch, "member")
    with pytest.raises(HTTPException) as exc_info:
        await invoices._ensure_can_review(
            SimpleNamespace(assigned_to_id="user-2"),
            SimpleNamespace(id="user-1"),
            action="post to qbo",
        )
    assert exc_info.value.status_code == 403


# ---------- reject guard ----------
# Admins reject anything; members only their own assigned invoices (so triage,
# which is unassigned, is an admin responsibility).


@pytest.mark.asyncio
async def test_ensure_can_reject_admin_allows_any(monkeypatch: pytest.MonkeyPatch) -> None:
    _patch_role(monkeypatch, "owner")
    await invoices._ensure_can_reject(
        SimpleNamespace(assigned_to_id=None), SimpleNamespace(id="admin-1")
    )


@pytest.mark.asyncio
async def test_ensure_can_reject_member_allows_own(monkeypatch: pytest.MonkeyPatch) -> None:
    _patch_role(monkeypatch, "member")
    await invoices._ensure_can_reject(
        SimpleNamespace(assigned_to_id="user-1"), SimpleNamespace(id="user-1")
    )


@pytest.mark.asyncio
async def test_ensure_can_reject_member_blocks_unassigned(monkeypatch: pytest.MonkeyPatch) -> None:
    _patch_role(monkeypatch, "member")
    with pytest.raises(HTTPException) as exc_info:
        await invoices._ensure_can_reject(
            SimpleNamespace(assigned_to_id=None), SimpleNamespace(id="user-1")
        )
    assert exc_info.value.status_code == 403


@pytest.mark.asyncio
async def test_ensure_can_reject_member_blocks_other(monkeypatch: pytest.MonkeyPatch) -> None:
    _patch_role(monkeypatch, "member")
    with pytest.raises(HTTPException) as exc_info:
        await invoices._ensure_can_reject(
            SimpleNamespace(assigned_to_id="user-2"), SimpleNamespace(id="user-1")
        )
    assert exc_info.value.status_code == 403


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


# ---------- negative-amount guard ----------
# `not total_cents` only catches missing/zero totals; a negative is truthy and
# would otherwise post a negative bill to QBO.


def test_ensure_amounts_nonnegative_allows_positive_and_none() -> None:
    invoices._ensure_amounts_nonnegative(
        SimpleNamespace(total_cents=1000, subtotal_cents=900, tax_cents=100)
    )
    invoices._ensure_amounts_nonnegative(
        SimpleNamespace(total_cents=None, subtotal_cents=None, tax_cents=None)
    )


def test_ensure_amounts_nonnegative_rejects_negative_total() -> None:
    inv = SimpleNamespace(total_cents=-500, subtotal_cents=None, tax_cents=None)

    with pytest.raises(HTTPException) as exc_info:
        invoices._ensure_amounts_nonnegative(inv)

    assert exc_info.value.status_code == 400
    assert "negative" in exc_info.value.detail.lower()
    assert "total" in exc_info.value.detail.lower()


def test_ensure_amounts_nonnegative_rejects_negative_subtotal_and_tax() -> None:
    inv = SimpleNamespace(total_cents=100, subtotal_cents=-1, tax_cents=-2)

    with pytest.raises(HTTPException) as exc_info:
        invoices._ensure_amounts_nonnegative(inv)

    assert exc_info.value.status_code == 400
    assert "subtotal" in exc_info.value.detail.lower()
    assert "tax" in exc_info.value.detail.lower()


def test_ensure_approvable_rejects_negative_total() -> None:
    # vendor + total set so we reach the negative check rather than the
    # missing-field checks; a negative total is truthy so it slips past
    # `not total_cents`.
    inv = SimpleNamespace(
        status=invoices.InvoiceStatus.READY_FOR_REVIEW,
        vendor_name="Acme",
        vendor_id=None,
        total_cents=-500,
        subtotal_cents=None,
        tax_cents=None,
    )

    with pytest.raises(HTTPException) as exc_info:
        invoices._ensure_approvable(inv)

    assert exc_info.value.status_code == 400
    assert "negative" in exc_info.value.detail.lower()
