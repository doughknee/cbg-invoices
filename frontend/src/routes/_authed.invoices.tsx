import { createFileRoute } from "@tanstack/react-router";
import { InvoiceQueue } from "@/components/invoices/InvoiceQueue";
import { isInvoiceView, type InvoiceView } from "@/lib/invoiceViews";

export const Route = createFileRoute("/_authed/invoices")({
  component: InvoicesPage,
  validateSearch: (search: Record<string, unknown>): { view?: InvoiceView } => ({
    view: isInvoiceView(search.view) ? search.view : undefined,
  }),
});

function InvoicesPage() {
  // The queue owns its header, mobile app bar, and upload affordances.
  return <InvoiceQueue />;
}
