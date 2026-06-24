import { createFileRoute } from "@tanstack/react-router";
import { InvoiceQueue } from "@/components/invoices/InvoiceQueue";

export const Route = createFileRoute("/_authed/invoices")({
  component: InvoicesPage,
});

function InvoicesPage() {
  // The queue owns its header, mobile app bar, and upload affordances.
  return <InvoiceQueue />;
}
