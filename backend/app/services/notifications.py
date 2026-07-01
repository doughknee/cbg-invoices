"""Outbound notifications beyond the per-assignment email.

* Daily digest — a once-a-day "here's your review queue" email to each user
  who has ready-for-review invoices assigned to them. On/off, time, and
  timezone are configurable (NotificationSettings); an in-process loop fires
  it (the app deliberately avoids Redis/Celery).
* Manual send — an admin nudges members about a specific invoice and/or with
  a free-form note.

All sends are best-effort and audited.
"""
from __future__ import annotations

import asyncio
import logging
from datetime import datetime
from html import escape
from uuid import UUID
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db import AsyncSessionLocal
from app.models.invoice import Invoice, InvoiceStatus
from app.models.notification_settings import NotificationSettings
from app.models.user_notification_prefs import UserNotificationPrefs
from app.services import audit
from app.services import email as email_service

log = logging.getLogger(__name__)

DIGEST_TICK_SECONDS = 60
DEFAULT_TIMEZONE = "America/Chicago"


# ──────────────────────────────────────────────────────────────────────────
# Settings
# ──────────────────────────────────────────────────────────────────────────


async def get_or_create_settings(session: AsyncSession) -> NotificationSettings:
    row = await session.get(NotificationSettings, 1)
    if row is None:
        row = NotificationSettings(id=1)
        session.add(row)
        await session.flush()
    return row


# ──────────────────────────────────────────────────────────────────────────
# Per-user preferences
# ──────────────────────────────────────────────────────────────────────────


async def get_user_prefs(session: AsyncSession, user_id: str) -> UserNotificationPrefs:
    """Fetch (or lazily create) a user's notification preferences row."""
    row = await session.get(UserNotificationPrefs, user_id)
    if row is None:
        row = UserNotificationPrefs(user_id=user_id)
        session.add(row)
        await session.flush()
    return row


async def assignment_emails_allowed(session: AsyncSession, user_id: str) -> bool:
    """Whether ``user_id`` wants assignment emails. Defaults on (no row → True).

    Read-only: never creates a row, so a plain assignment doesn't write prefs.
    """
    row = await session.get(UserNotificationPrefs, user_id)
    return True if row is None else row.assignment_emails


async def digest_opted_out_user_ids(session: AsyncSession) -> set[str]:
    """User ids that have turned the daily digest off."""
    stmt = select(UserNotificationPrefs.user_id).where(
        UserNotificationPrefs.digest_emails.is_(False)
    )
    return set((await session.execute(stmt)).scalars().all())


def validate_time(value: str) -> str:
    """Accept a 24-hour ``HH:MM`` string; raise ValueError otherwise."""
    try:
        datetime.strptime(value, "%H:%M")  # noqa: DTZ007 — parsing a time, not a moment
    except ValueError as exc:
        raise ValueError("Time must be HH:MM (24-hour), e.g. 07:30") from exc
    return value


def validate_timezone(value: str) -> str:
    try:
        ZoneInfo(value)
    except (ZoneInfoNotFoundError, ValueError) as exc:
        raise ValueError(f"Unknown timezone: {value!r}") from exc
    return value


def _money(total_cents: int | None, currency: str | None) -> str:
    if total_cents is None:
        return "—"
    cur = (currency or "USD").upper()
    amount = f"{total_cents / 100:,.2f}"
    return f"${amount}" if cur == "USD" else f"{cur} {amount}"


def _link(base_url: str, invoice_id: UUID) -> str:
    return f"{base_url.rstrip('/')}/invoices/{invoice_id}"


# ──────────────────────────────────────────────────────────────────────────
# Daily digest
# ──────────────────────────────────────────────────────────────────────────


async def _pending_by_assignee(session: AsyncSession) -> dict[str, dict]:
    """Map assignee email → {name, invoices[]} for ready-for-review invoices."""
    stmt = select(Invoice).where(
        Invoice.status == InvoiceStatus.READY_FOR_REVIEW,
        Invoice.assigned_to_email.is_not(None),
    )
    rows = (await session.execute(stmt)).scalars().all()
    grouped: dict[str, dict] = {}
    for inv in rows:
        bucket = grouped.setdefault(
            inv.assigned_to_email,
            {
                "name": inv.assigned_to_name,
                "user_id": inv.assigned_to_id,
                "invoices": [],
            },
        )
        bucket["invoices"].append(inv)
    return grouped


async def send_daily_digest(session: AsyncSession) -> dict:
    """Email each assignee a digest of their ready-for-review queue.

    Best-effort: a failed individual send is logged and skipped. Returns
    ``{"recipients": n, "pending_users": m}``. Caller commits (for the audit
    row). Does not touch ``last_sent`` — that's the scheduler's job.
    """
    app = get_settings()
    grouped = await _pending_by_assignee(session)
    opted_out = await digest_opted_out_user_ids(session)
    sent = 0
    skipped_opt_out = 0
    for email_addr, bucket in grouped.items():
        if bucket.get("user_id") in opted_out:
            skipped_opt_out += 1
            continue
        invoices = bucket["invoices"]
        try:
            await email_service.send_email(
                to=email_addr,
                subject=f"Your invoice review queue ({len(invoices)} pending)",
                html=_digest_html(bucket["name"], invoices, app.app_base_url),
                text=_digest_text(bucket["name"], invoices, app.app_base_url),
            )
            sent += 1
        except email_service.EmailNotConfigured:
            log.info("Daily digest skipped — RESEND_API_KEY not set")
            return {"recipients": 0, "pending_users": len(grouped), "skipped": "not_configured"}
        except email_service.EmailError:
            log.exception("Digest email failed for %s", email_addr)

    await audit.record_system(
        session,
        action="daily_digest_sent",
        message=(
            f"recipients={sent} pending_users={len(grouped)} "
            f"opted_out={skipped_opt_out}"
        ),
    )
    return {
        "recipients": sent,
        "pending_users": len(grouped),
        "opted_out": skipped_opt_out,
    }


async def _maybe_send_digest(session: AsyncSession) -> None:
    """Fire the digest once per day after the configured local time."""
    cfg = await get_or_create_settings(session)
    if not cfg.daily_digest_enabled:
        return
    try:
        tz = ZoneInfo(cfg.daily_digest_timezone)
    except (ZoneInfoNotFoundError, ValueError):
        tz = ZoneInfo(DEFAULT_TIMEZONE)
    now_local = datetime.now(tz)
    target = datetime.strptime(cfg.daily_digest_time, "%H:%M").time()  # noqa: DTZ007
    if now_local.time() < target:
        return
    if cfg.daily_digest_last_sent_on == now_local.date():
        return  # already sent today

    log.info("Firing daily digest for %s (%s)", now_local.date(), cfg.daily_digest_timezone)
    await send_daily_digest(session)
    cfg.daily_digest_last_sent_on = now_local.date()
    await session.commit()


async def digest_scheduler_loop() -> None:
    """Background loop started in the app lifespan. Ticks every minute and
    fires the digest at most once per day. Survives transient errors."""
    log.info("Daily digest scheduler started (tick=%ss)", DIGEST_TICK_SECONDS)
    while True:
        try:
            async with AsyncSessionLocal() as session:
                await _maybe_send_digest(session)
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("Digest scheduler tick failed")
        await asyncio.sleep(DIGEST_TICK_SECONDS)


# ──────────────────────────────────────────────────────────────────────────
# Manual send
# ──────────────────────────────────────────────────────────────────────────


async def send_manual_notification(
    session: AsyncSession,
    *,
    actor_label: str,
    recipients: list[tuple[str, str | None]],
    message: str | None,
    invoice_id: UUID | None,
) -> dict:
    """Send an ad-hoc notification to ``recipients`` (email, name) tuples.

    Optionally references an invoice (deep link + details) and/or carries a
    free-form ``message``. Best-effort + audited.
    """
    app = get_settings()
    invoice = await session.get(Invoice, invoice_id) if invoice_id else None
    link = _link(app.app_base_url, invoice_id) if invoice else None

    sent = 0
    for email_addr, name in recipients:
        try:
            await email_service.send_email(
                to=email_addr,
                subject=_manual_subject(invoice),
                html=_manual_html(name, actor_label, message, invoice, link),
                text=_manual_text(name, actor_label, message, invoice, link),
            )
            sent += 1
        except email_service.EmailNotConfigured:
            return {"sent": 0, "skipped": "not_configured"}
        except email_service.EmailError:
            log.exception("Manual notification failed for %s", email_addr)

    await audit.record_system(
        session,
        action="manual_notification_sent",
        invoice_id=invoice_id,
        message=f"by={actor_label} recipients={sent}",
    )
    return {"sent": sent}


# ──────────────────────────────────────────────────────────────────────────
# Templates
# ──────────────────────────────────────────────────────────────────────────


def _shell(title: str, body: str) -> str:
    return f"""\
<!doctype html>
<html>
<body style="margin:0;padding:0;background:#ede5d8;font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#1b2830;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ede5d8;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-top:4px solid #c8923c;">
        <tr><td style="padding:32px 32px 12px 32px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#c8923c;">Cambridge Building Group</div>
          <div style="font-family:'DM Serif Display',Georgia,serif;font-size:26px;color:#0b1b25;line-height:1.2;margin-top:4px;">{title}</div>
        </td></tr>
        {body}
      </table>
    </td></tr>
  </table>
</body>
</html>
"""


def _invoice_rows_html(invoices: list[Invoice], base_url: str) -> str:
    rows = ""
    for inv in invoices:
        vendor = escape(inv.vendor_name or "an invoice")
        number = f' &middot; #{escape(inv.invoice_number)}' if inv.invoice_number else ""
        amount = escape(_money(inv.total_cents, inv.currency))
        rows += (
            '<tr>'
            f'<td style="padding:8px 0;border-bottom:1px solid #ede5d8;font-size:14px;">'
            f'<a href="{_link(base_url, inv.id)}" style="color:#0b1b25;text-decoration:none;font-weight:600;">{vendor}</a>'
            f'<span style="color:#64748b;font-size:12px;">{number}</span></td>'
            f'<td style="padding:8px 0;border-bottom:1px solid #ede5d8;font-size:14px;text-align:right;font-weight:600;white-space:nowrap;">{amount}</td>'
            '</tr>'
        )
    return rows


def _digest_html(name: str | None, invoices: list[Invoice], base_url: str) -> str:
    greeting = f"Hi {escape(name)}," if name else "Hi,"
    count = len(invoices)
    body = f"""
        <tr><td style="padding:0 32px 12px 32px;font-size:14px;line-height:1.55;">
          <p style="margin:0 0 12px 0;">{greeting}</p>
          <p style="margin:0 0 14px 0;">You have <strong>{count}</strong> invoice{'s' if count != 1 else ''} waiting for your review.</p>
        </td></tr>
        <tr><td style="padding:0 32px 20px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">{_invoice_rows_html(invoices, base_url)}</table>
        </td></tr>
        <tr><td align="center" style="padding:0 32px 28px 32px;">
          <a href="{base_url.rstrip('/')}/invoices" style="display:inline-block;background:#c8923c;color:#0b1b25;text-decoration:none;padding:12px 22px;font-weight:700;font-size:14px;">Open the review queue &rarr;</a>
        </td></tr>
        <tr><td style="padding:18px 32px;border-top:1px solid #ede5d8;font-size:11px;color:#94a3b8;">Daily review reminder from the Cambridge Invoice Portal.</td></tr>
    """
    return _shell("Your review queue", body)


def _digest_text(name: str | None, invoices: list[Invoice], base_url: str) -> str:
    greeting = f"Hi {name}," if name else "Hi,"
    lines = [
        f"{greeting}",
        "",
        f"You have {len(invoices)} invoice(s) waiting for your review:",
        "",
    ]
    for inv in invoices:
        number = f" #{inv.invoice_number}" if inv.invoice_number else ""
        lines.append(
            f"- {inv.vendor_name or 'an invoice'}{number} — "
            f"{_money(inv.total_cents, inv.currency)} — {_link(base_url, inv.id)}"
        )
    lines += ["", f"Open the review queue: {base_url.rstrip('/')}/invoices", ""]
    return "\n".join(lines)


def _manual_subject(invoice: Invoice | None) -> str:
    if invoice is not None:
        vendor = invoice.vendor_name or "an invoice"
        return f"Please review: {vendor}"
    return "A note from the Cambridge Invoice Portal"


def _manual_html(
    name: str | None,
    actor_label: str,
    message: str | None,
    invoice: Invoice | None,
    link: str | None,
) -> str:
    greeting = f"Hi {escape(name)}," if name else "Hi,"
    parts = [
        '<tr><td style="padding:0 32px 12px 32px;font-size:14px;line-height:1.55;">',
        f'<p style="margin:0 0 12px 0;">{greeting}</p>',
        f'<p style="margin:0 0 14px 0;"><strong>{escape(actor_label)}</strong> sent you a notification.</p>',
    ]
    if message:
        safe = escape(message).replace("\n", "<br>")
        parts.append(
            f'<div style="margin:0 0 14px 0;padding:12px 14px;background:#f6f1e8;border-left:3px solid #c8923c;font-size:14px;">{safe}</div>'
        )
    parts.append("</td></tr>")
    if invoice is not None and link:
        vendor = escape(invoice.vendor_name or "an invoice")
        amount = escape(_money(invoice.total_cents, invoice.currency))
        number = f" &middot; #{escape(invoice.invoice_number)}" if invoice.invoice_number else ""
        parts.append(
            '<tr><td style="padding:0 32px 8px 32px;font-size:13px;color:#64748b;">Invoice</td></tr>'
            f'<tr><td style="padding:0 32px 16px 32px;font-size:15px;font-weight:600;">{vendor}{number} — {amount}</td></tr>'
            '<tr><td align="center" style="padding:0 32px 28px 32px;">'
            f'<a href="{link}" style="display:inline-block;background:#c8923c;color:#0b1b25;text-decoration:none;padding:12px 22px;font-weight:700;font-size:14px;">Review invoice &rarr;</a>'
            "</td></tr>"
        )
    parts.append(
        '<tr><td style="padding:18px 32px;border-top:1px solid #ede5d8;font-size:11px;color:#94a3b8;">Sent from the Cambridge Invoice Portal.</td></tr>'
    )
    return _shell("A notification for you", "".join(parts))


def _manual_text(
    name: str | None,
    actor_label: str,
    message: str | None,
    invoice: Invoice | None,
    link: str | None,
) -> str:
    greeting = f"Hi {name}," if name else "Hi,"
    lines = [greeting, "", f"{actor_label} sent you a notification."]
    if message:
        lines += ["", message]
    if invoice is not None and link:
        number = f" #{invoice.invoice_number}" if invoice.invoice_number else ""
        lines += [
            "",
            f"Invoice: {invoice.vendor_name or 'an invoice'}{number} — "
            f"{_money(invoice.total_cents, invoice.currency)}",
            f"Review it: {link}",
        ]
    lines.append("")
    return "\n".join(lines)
