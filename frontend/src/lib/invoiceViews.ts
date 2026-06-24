/**
 * The invoice queue's filter "views" (the pills). Shared between the queue
 * page and the sidebar jump-nav so both stay in sync, and persisted in the
 * URL (?view=) so the sidebar can drive the active filter.
 */
export type InvoiceView = "needs_review" | "mine" | "ready_to_post" | "triage" | "all";

export const INVOICE_VIEWS: { key: InvoiceView; label: string }[] = [
  { key: "needs_review", label: "Needs review" },
  { key: "mine", label: "Assigned to me" },
  { key: "ready_to_post", label: "Ready to post" },
  { key: "triage", label: "Triage" },
  { key: "all", label: "All" },
];

const KEYS = INVOICE_VIEWS.map((v) => v.key);

export function isInvoiceView(value: unknown): value is InvoiceView {
  return typeof value === "string" && (KEYS as string[]).includes(value);
}

/** Members start on their own work; admins on the unassigned review pile. */
export function defaultInvoiceView(isAdmin: boolean): InvoiceView {
  return isAdmin ? "needs_review" : "mine";
}
