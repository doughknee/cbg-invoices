"""Email the assignee when an invoice is assigned to them.

Runs as a BackgroundTask so a slow or failed send never blocks the assignment
itself. Opens its own session to read the invoice and record the outcome in
the audit log. Best-effort throughout — mirrors the invite-email flow.
"""
from __future__ import annotations

import logging
from html import escape
from uuid import UUID

from app.config import get_settings
from app.db import AsyncSessionLocal
from app.models.invoice import Invoice
from app.services import audit
from app.services import email as email_service

log = logging.getLogger(__name__)


def should_notify(
    *,
    new_assignee_id: str,
    previous_assignee_id: str | None,
    actor_id: str,
    to_email: str | None,
) -> bool:
    """Whether to email the assignee.

    Only when the assignment actually changed to a *different* person, we have
    somewhere to send it, and the assigner isn't assigning to themselves.
    """
    if not to_email:
        return False
    if new_assignee_id == actor_id:
        return False  # no point emailing yourself
    return new_assignee_id != previous_assignee_id


def _format_amount(total_cents: int | None, currency: str | None) -> str:
    if total_cents is None:
        return "—"
    cur = (currency or "USD").upper()
    amount = f"{total_cents / 100:,.2f}"
    return f"${amount}" if cur == "USD" else f"{cur} {amount}"


async def notify_assignment(
    *,
    invoice_id: UUID,
    to_email: str,
    to_name: str | None,
    actor_label: str,
) -> None:
    """Send the 'assigned to you' email and audit the outcome. Best-effort."""
    settings = get_settings()
    async with AsyncSessionLocal() as session:
        invoice = await session.get(Invoice, invoice_id)
        if invoice is None:
            log.warning("Assignment notify: invoice %s no longer exists", invoice_id)
            return

        vendor = invoice.vendor_name or "an invoice"
        amount = _format_amount(invoice.total_cents, invoice.currency)
        due = invoice.due_date.isoformat() if invoice.due_date else None
        link = f"{settings.app_base_url.rstrip('/')}/invoices/{invoice_id}"
        subject = f"Invoice assigned to you: {vendor}"

        try:
            await email_service.send_email(
                to=to_email,
                subject=subject,
                html=_html(
                    to_name=to_name,
                    actor_label=actor_label,
                    vendor=vendor,
                    invoice_number=invoice.invoice_number,
                    amount=amount,
                    due=due,
                    link=link,
                ),
                text=_text(
                    to_name=to_name,
                    actor_label=actor_label,
                    vendor=vendor,
                    invoice_number=invoice.invoice_number,
                    amount=amount,
                    due=due,
                    link=link,
                ),
            )
        except email_service.EmailNotConfigured:
            log.info("Assignment notify skipped (RESEND_API_KEY unset) for %s", invoice_id)
            return
        except email_service.EmailError:
            log.exception("Assignment email failed for invoice %s", invoice_id)
            await audit.record_system(
                session,
                action="assignment_notify_failed",
                invoice_id=invoice_id,
                message=f"to={to_email}",
            )
            await session.commit()
            return

        await audit.record_system(
            session,
            action="assignment_notified",
            invoice_id=invoice_id,
            message=f"to={to_email}",
        )
        await session.commit()


# ──────────────────────────────────────────────────────────────────────────
# Templates
# ──────────────────────────────────────────────────────────────────────────


def _text(
    *,
    to_name: str | None,
    actor_label: str,
    vendor: str,
    invoice_number: str | None,
    amount: str,
    due: str | None,
    link: str,
) -> str:
    greeting = f"Hi {to_name}," if to_name else "Hi,"
    number_line = f"Invoice #: {invoice_number}\n" if invoice_number else ""
    due_line = f"Due: {due}\n" if due else ""
    return (
        f"{greeting}\n\n"
        f"{actor_label} assigned an invoice to you in the Cambridge Invoice Portal.\n\n"
        f"Vendor: {vendor}\n"
        f"{number_line}"
        f"Amount: {amount}\n"
        f"{due_line}\n"
        f"Review it here:\n{link}\n"
    )


def _detail_row(label: str, value: str) -> str:
    return (
        '<tr>'
        f'<td style="padding:4px 0;font-size:12px;color:#64748b;width:96px;">{escape(label)}</td>'
        f'<td style="padding:4px 0;font-size:14px;color:#1b2830;font-weight:600;">{escape(value)}</td>'
        '</tr>'
    )


def _html(
    *,
    to_name: str | None,
    actor_label: str,
    vendor: str,
    invoice_number: str | None,
    amount: str,
    due: str | None,
    link: str,
) -> str:
    greeting = f"Hi {escape(to_name)}," if to_name else "Hi,"
    rows = _detail_row("Vendor", vendor)
    if invoice_number:
        rows += _detail_row("Invoice #", invoice_number)
    rows += _detail_row("Amount", amount)
    if due:
        rows += _detail_row("Due", due)
    return f"""\
<!doctype html>
<html>
<body style="margin:0;padding:0;background:#ede5d8;font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#1b2830;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ede5d8;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-top:4px solid #c8923c;">
          <tr>
            <td style="padding:32px 32px 12px 32px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#c8923c;">
                Cambridge Building Group
              </div>
              <div style="font-family:'DM Serif Display',Georgia,serif;font-size:28px;color:#0b1b25;line-height:1.2;margin-top:4px;">
                An invoice was assigned to you
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 12px 32px;font-size:14px;line-height:1.55;color:#1b2830;">
              <p style="margin:0 0 14px 0;">{greeting}</p>
              <p style="margin:0 0 14px 0;"><strong>{escape(actor_label)}</strong> assigned an invoice to you for review.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 20px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #ede5d8;border-bottom:1px solid #ede5d8;padding:8px 0;">
                {rows}
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 32px 28px 32px;">
              <a href="{link}" style="display:inline-block;background:#c8923c;color:#0b1b25;text-decoration:none;padding:12px 22px;font-weight:700;font-size:14px;letter-spacing:0.02em;">
                Review invoice &rarr;
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;border-top:1px solid #ede5d8;font-size:11px;color:#94a3b8;">
              You're receiving this because the invoice was assigned to you in the Cambridge Invoice Portal.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
