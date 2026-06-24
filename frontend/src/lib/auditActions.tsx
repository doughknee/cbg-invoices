/**
 * Human-readable descriptions for audit-log actions.
 *
 * The raw `action` strings (e.g. "invoice_approved", "qbo_bill_created") are
 * developer-facing. This maps each one to a plain-English verb phrase, an
 * icon, a colour tone, and a category so the activity log reads like a
 * sentence: "{actor} {phrase} {invoice}{suffix}".
 */
import type { ComponentType, SVGProps } from "react";
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  ArrowUturnLeftIcon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  HandRaisedIcon,
  LinkIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserMinusIcon,
  UserPlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export type AuditTone = "navy" | "green" | "red" | "amber" | "blue" | "slate";
export type AuditCategory =
  | "Invoice"
  | "Review"
  | "QuickBooks"
  | "Processing"
  | "Notifications"
  | "Settings"
  | "Other";

export interface ActionInfo {
  /** Verb phrase rendered as "{actor} {phrase}". */
  phrase: string;
  /** Trailing words after the (optional) invoice reference. */
  suffix?: string;
  /** Whether to render the invoice reference after the phrase. */
  invoiceObject: boolean;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: AuditTone;
  category: AuditCategory;
  /** Short label for the activity filter dropdown. */
  filterLabel: string;
  /** Show the entry's message in the simple view (reason / target). */
  showMessage?: boolean;
  /** Performed automatically by the system rather than a person. */
  system?: boolean;
}

const MAP: Record<string, ActionInfo> = {
  // ── Invoice lifecycle ──
  invoice_uploaded: { phrase: "uploaded", invoiceObject: true, Icon: ArrowUpTrayIcon, tone: "blue", category: "Invoice", filterLabel: "Uploaded" },
  email_received: { phrase: "received", suffix: " by email", invoiceObject: true, Icon: EnvelopeIcon, tone: "blue", category: "Invoice", filterLabel: "Received by email", system: true },
  email_rejected_no_pdf: { phrase: "ignored an email with no PDF attached", invoiceObject: false, Icon: EnvelopeIcon, tone: "slate", category: "Processing", filterLabel: "Email ignored (no PDF)", system: true },
  invoice_edited: { phrase: "edited", invoiceObject: true, Icon: PencilSquareIcon, tone: "slate", category: "Invoice", filterLabel: "Edited" },
  triage_routed: { phrase: "flagged", suffix: " for triage", invoiceObject: true, Icon: ExclamationTriangleIcon, tone: "amber", category: "Processing", filterLabel: "Flagged for triage", system: true },
  triage_promoted: { phrase: "promoted", suffix: " to the review queue", invoiceObject: true, Icon: CheckCircleIcon, tone: "amber", category: "Invoice", filterLabel: "Promoted from triage" },

  // ── Reading / extraction ──
  extraction_started: { phrase: "started reading", invoiceObject: true, Icon: SparklesIcon, tone: "slate", category: "Processing", filterLabel: "Reading started", system: true },
  extraction_completed: { phrase: "finished reading", invoiceObject: true, Icon: SparklesIcon, tone: "slate", category: "Processing", filterLabel: "Reading finished", system: true },
  extraction_failed: { phrase: "couldn't read", invoiceObject: true, Icon: ExclamationTriangleIcon, tone: "red", category: "Processing", filterLabel: "Reading failed", system: true },
  invoice_reextract_requested: { phrase: "re-ran reading on", invoiceObject: true, Icon: ArrowPathIcon, tone: "slate", category: "Processing", filterLabel: "Re-read requested" },
  invoice_stamp_failed: { phrase: "couldn't stamp the PDF for", invoiceObject: true, Icon: ExclamationTriangleIcon, tone: "red", category: "Processing", filterLabel: "Stamp failed", system: true },

  // ── Review / approvals ──
  invoice_assigned: { phrase: "assigned", invoiceObject: true, Icon: UserPlusIcon, tone: "navy", category: "Review", filterLabel: "Assigned", showMessage: true },
  invoice_unassigned: { phrase: "unassigned", invoiceObject: true, Icon: UserMinusIcon, tone: "slate", category: "Review", filterLabel: "Unassigned" },
  invoice_claimed: { phrase: "claimed", invoiceObject: true, Icon: HandRaisedIcon, tone: "navy", category: "Review", filterLabel: "Claimed" },
  invoice_approved: { phrase: "approved", invoiceObject: true, Icon: CheckCircleIcon, tone: "green", category: "Review", filterLabel: "Approved" },
  invoice_approved_and_post_requested: { phrase: "approved", suffix: " and sent it to QuickBooks", invoiceObject: true, Icon: CheckCircleIcon, tone: "green", category: "Review", filterLabel: "Approved & posted" },
  invoice_unapproved: { phrase: "reopened", suffix: " for edits", invoiceObject: true, Icon: ArrowUturnLeftIcon, tone: "amber", category: "Review", filterLabel: "Reopened" },
  invoice_rejected: { phrase: "rejected", invoiceObject: true, Icon: XCircleIcon, tone: "red", category: "Review", filterLabel: "Rejected", showMessage: true },

  // ── QuickBooks ──
  invoice_post_requested: { phrase: "sent", suffix: " to QuickBooks", invoiceObject: true, Icon: PaperAirplaneIcon, tone: "navy", category: "QuickBooks", filterLabel: "Sent to QuickBooks" },
  qbo_bill_created: { phrase: "created a bill in QuickBooks for", invoiceObject: true, Icon: DocumentTextIcon, tone: "navy", category: "QuickBooks", filterLabel: "Bill created", system: true },
  qbo_bill_attached: { phrase: "attached the PDF in QuickBooks for", invoiceObject: true, Icon: PaperClipIcon, tone: "navy", category: "QuickBooks", filterLabel: "PDF attached", system: true },
  qbo_post_failed: { phrase: "failed to post", suffix: " to QuickBooks", invoiceObject: true, Icon: ExclamationTriangleIcon, tone: "red", category: "QuickBooks", filterLabel: "Post failed", system: true },
  qbo_connected: { phrase: "connected QuickBooks", invoiceObject: false, Icon: LinkIcon, tone: "green", category: "QuickBooks", filterLabel: "Connected QuickBooks" },
  qbo_disconnected: { phrase: "disconnected QuickBooks", invoiceObject: false, Icon: LinkIcon, tone: "red", category: "QuickBooks", filterLabel: "Disconnected QuickBooks" },
  qbo_oauth_initiated: { phrase: "started connecting QuickBooks", invoiceObject: false, Icon: LinkIcon, tone: "slate", category: "QuickBooks", filterLabel: "Connect started" },
  qbo_sync_vendors: { phrase: "synced vendors from QuickBooks", invoiceObject: false, Icon: ArrowPathIcon, tone: "navy", category: "QuickBooks", filterLabel: "Synced vendors" },
  qbo_sync_projects: { phrase: "synced projects from QuickBooks", invoiceObject: false, Icon: ArrowPathIcon, tone: "navy", category: "QuickBooks", filterLabel: "Synced projects" },

  // ── Settings ──
  qbo_default_expense_account_changed: { phrase: "changed the default expense account", invoiceObject: false, Icon: Cog6ToothIcon, tone: "amber", category: "Settings", filterLabel: "Default account changed" },
  qbo_project_source_changed: { phrase: "changed the project source", invoiceObject: false, Icon: Cog6ToothIcon, tone: "amber", category: "Settings", filterLabel: "Project source changed" },
  sender_trusted: { phrase: "trusted an email sender", invoiceObject: false, Icon: ShieldCheckIcon, tone: "green", category: "Settings", filterLabel: "Sender trusted", showMessage: true },
  sender_untrusted: { phrase: "stopped trusting an email sender", invoiceObject: false, Icon: ShieldCheckIcon, tone: "red", category: "Settings", filterLabel: "Sender untrusted", showMessage: true },

  // ── Notifications ──
  assignment_notified: { phrase: "emailed the assignee about", invoiceObject: true, Icon: BellIcon, tone: "blue", category: "Notifications", filterLabel: "Assignee emailed", system: true },
  assignment_notify_failed: { phrase: "couldn't email the assignee about", invoiceObject: true, Icon: BellIcon, tone: "red", category: "Notifications", filterLabel: "Assignee email failed", system: true },
  daily_digest_sent: { phrase: "sent the daily digest", invoiceObject: false, Icon: BellIcon, tone: "blue", category: "Notifications", filterLabel: "Daily digest sent", system: true },
  manual_notification_sent: { phrase: "sent a notification about", invoiceObject: true, Icon: BellIcon, tone: "blue", category: "Notifications", filterLabel: "Notification sent", showMessage: true },

  // ── Legacy short aliases ──
  approve: { phrase: "approved", invoiceObject: true, Icon: CheckCircleIcon, tone: "green", category: "Review", filterLabel: "Approved" },
  unapprove: { phrase: "reopened", suffix: " for edits", invoiceObject: true, Icon: ArrowUturnLeftIcon, tone: "amber", category: "Review", filterLabel: "Reopened" },
};

function humanize(action: string): string {
  return action.replace(/_/g, " ");
}

export function describeAction(action: string): ActionInfo {
  return (
    MAP[action] ?? {
      phrase: humanize(action),
      invoiceObject: false,
      Icon: ClockIcon,
      tone: "slate",
      category: "Other",
      filterLabel: humanize(action),
    }
  );
}

export const TONE_CIRCLE: Record<AuditTone, string> = {
  navy: "bg-navy/10 text-navy",
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber/20 text-[#7a5114]",
  blue: "bg-blue-50 text-blue-700",
  slate: "bg-slate-100 text-slate-600",
};

const FILTER_CATEGORIES: AuditCategory[] = [
  "Invoice",
  "Review",
  "QuickBooks",
  "Processing",
  "Notifications",
  "Settings",
];

/** Activity-filter options, grouped by category, for a grouped <select>. */
export function filterOptionsByCategory(): {
  category: AuditCategory;
  options: { value: string; label: string }[];
}[] {
  const groups = new Map<AuditCategory, { value: string; label: string }[]>();
  for (const [value, info] of Object.entries(MAP)) {
    if (value === "approve" || value === "unapprove") continue; // legacy dupes
    const list = groups.get(info.category) ?? [];
    list.push({ value, label: info.filterLabel });
    groups.set(info.category, list);
  }
  return FILTER_CATEGORIES.filter((c) => groups.has(c)).map((category) => ({
    category,
    options: (groups.get(category) ?? []).sort((a, b) => a.label.localeCompare(b.label)),
  }));
}
