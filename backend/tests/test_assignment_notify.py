"""Assignment-notification helpers — the decision, formatting, and templates.

The send path (notify_assignment) is thin glue over the well-tested email
service; the branching logic lives in should_notify, which is what we cover.
"""
from __future__ import annotations

import os

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")

from app.services import assignment_notify as an

# ---------- should_notify ----------


def test_should_notify_new_assignee() -> None:
    assert an.should_notify(
        new_assignee_id="u2", previous_assignee_id=None, actor_id="u1", to_email="u2@x.com"
    )


def test_should_notify_reassign_to_different_person() -> None:
    assert an.should_notify(
        new_assignee_id="u3", previous_assignee_id="u2", actor_id="u1", to_email="u3@x.com"
    )


def test_should_notify_skips_self_assignment() -> None:
    assert not an.should_notify(
        new_assignee_id="u1", previous_assignee_id=None, actor_id="u1", to_email="u1@x.com"
    )


def test_should_notify_skips_reassign_to_same_person() -> None:
    assert not an.should_notify(
        new_assignee_id="u2", previous_assignee_id="u2", actor_id="u1", to_email="u2@x.com"
    )


def test_should_notify_skips_without_email() -> None:
    assert not an.should_notify(
        new_assignee_id="u2", previous_assignee_id=None, actor_id="u1", to_email=None
    )


# ---------- amount formatting ----------


def test_format_amount_usd() -> None:
    assert an._format_amount(123456, "USD") == "$1,234.56"


def test_format_amount_none() -> None:
    assert an._format_amount(None, "USD") == "—"


def test_format_amount_non_usd() -> None:
    assert an._format_amount(100000, "EUR") == "EUR 1,000.00"


# ---------- templates ----------


def test_templates_include_details_and_escape_html() -> None:
    kwargs = dict(
        to_name="Pat",
        actor_label="boss@example.com",
        vendor="Acme & Co",
        invoice_number="INV-1",
        amount="$10.00",
        due="2026-07-01",
        link="https://portal.example.com/invoices/abc",
    )
    html = an._html(**kwargs)
    text = an._text(**kwargs)

    # deep link + amount present in both
    assert "https://portal.example.com/invoices/abc" in html
    assert "https://portal.example.com/invoices/abc" in text
    assert "$10.00" in html and "$10.00" in text
    # html escapes free text; plaintext does not
    assert "Acme &amp; Co" in html
    assert "Acme & Co" in text
