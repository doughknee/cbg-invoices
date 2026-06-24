import { useCallback, useMemo, useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpTrayIcon, InboxIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/layout/AppShell";
import { useMobileAppBar } from "@/components/layout/MobileAppBar";
import { useMe } from "@/lib/users";
import { useInvoices, type ListParams } from "@/lib/invoices";
import { useQboStatus } from "@/lib/qbo";
import { useUploadQueue } from "@/lib/upload";
import type { Invoice, InvoiceStatus } from "@/types";
import { QueueRejectModal, QueueRow } from "./QueueRow";
import { UploadDropOverlay, UploadTaskCard } from "./UploadTasks";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { FilterChips } from "@/components/ui/FilterChips";

/**
 * The queue is a work inbox, not a tour of workflow stages. The filter pills
 * answer "what needs me?" — and every row carries its own next action, so the
 * detail page is for careful review, not routine clicks. Upload is a secondary
 * action (header button + drag-anywhere), not a permanent box hogging the top.
 */
const ACTIVE: InvoiceStatus[] = ["ready_for_review", "extraction_failed", "received", "extracting"];

type PillKey = "needs_review" | "mine" | "ready_to_post" | "triage" | "all";

interface Pill {
  key: PillKey;
  label: string;
  params: Pick<ListParams, "status" | "assigned">;
}

const PILLS: Pill[] = [
  { key: "needs_review", label: "Needs review", params: { status: ACTIVE, assigned: "false" } },
  { key: "mine", label: "Assigned to me", params: { status: ACTIVE, assigned: "mine" } },
  { key: "ready_to_post", label: "Ready to post", params: { status: ["approved"] } },
  { key: "triage", label: "Triage", params: { status: ["needs_triage"] } },
  { key: "all", label: "All", params: {} },
];

const EMPTY: Record<PillKey, { title: string; body: string }> = {
  needs_review: {
    title: "Inbox is clear",
    body: "Nothing waiting to be picked up. Drop a PDF anywhere, or have a vendor email your inbound address.",
  },
  mine: { title: "Nothing assigned to you", body: "Invoices assigned to you show up here." },
  ready_to_post: {
    title: "Nothing to post",
    body: "Approved invoices waiting to go to QuickBooks land here.",
  },
  triage: {
    title: "Nothing needs triage",
    body: "Ambiguous documents — statements, quotes, encrypted PDFs — land here for a quick decision.",
  },
  all: { title: "No invoices yet", body: "Everything you upload or receive by email shows up here." },
};

export function InvoiceQueue() {
  const me = useMe();
  const qbo = useQboStatus();
  const qboConnected = qbo.data?.connected ?? false;
  const [active, setActive] = useState<PillKey>("needs_review");
  const [q, setQ] = useState("");
  const [rejecting, setRejecting] = useState<Invoice | null>(null);

  // ── Upload: a secondary action, not a permanent dropzone ──────────────────
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { tasks, enqueue, dismiss } = useUploadQueue();
  const hasActiveUpload = tasks.some((t) => t.stage.kind !== "done" && t.stage.kind !== "error");

  const openPicker = useCallback(() => fileInput.current?.click(), []);
  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    enqueue(Array.from(e.target.files ?? []));
    e.target.value = "";
  }

  // Memoized so the mobile-app-bar effect doesn't re-fire every render.
  const mobileUploadAction = useMemo(
    () => (
      <button
        type="button"
        onClick={openPicker}
        className="inline-flex items-center gap-1.5 min-h-[36px] px-2 text-xs font-bold uppercase tracking-wider text-navy hover:text-amber"
      >
        <ArrowUpTrayIcon className="h-4 w-4" aria-hidden />
        Upload
      </button>
    ),
    [openPicker],
  );
  useMobileAppBar({ title: "Invoices", action: mobileUploadAction });

  const pill = PILLS.find((p) => p.key === active) ?? PILLS[0];

  // Lightweight count-only queries drive the pill badges.
  const cNeed = useInvoices({ status: ACTIVE, assigned: "false", page_size: 1 });
  const cMine = useInvoices({ status: ACTIVE, assigned: "mine", page_size: 1 });
  const cPost = useInvoices({ status: ["approved"], page_size: 1 });
  const cTriage = useInvoices({ status: ["needs_triage"], page_size: 1 });
  const counts: Record<PillKey, number | undefined> = {
    needs_review: cNeed.data?.total,
    mine: cMine.data?.total,
    ready_to_post: cPost.data?.total,
    triage: cTriage.data?.total,
    all: undefined,
  };

  const { data, isLoading, error, refetch } = useInvoices({
    ...pill.params,
    q: q || undefined,
    page_size: 100,
  });
  const invoices = data?.invoices ?? [];
  const total = data?.total ?? 0;

  const chips = PILLS.map((p) => ({ key: p.key, label: p.label, count: counts[p.key] }));
  const empty = q
    ? { title: "No matches", body: `Nothing matches “${q}”. Try a different term.` }
    : EMPTY[active];
  const emptyCta =
    !q && (active === "needs_review" || active === "all") ? (
      <Button variant="secondary" size="sm" onClick={openPicker}>
        <ArrowUpTrayIcon className="h-4 w-4" aria-hidden />
        Upload a PDF
      </Button>
    ) : undefined;

  const uploadButton = (
    <Button variant="secondary" size="sm" onClick={openPicker} loading={hasActiveUpload}>
      <ArrowUpTrayIcon className="h-4 w-4" aria-hidden />
      Upload PDF
    </Button>
  );

  return (
    <div
      className="relative space-y-5"
      onDragEnter={(e) => {
        if (e.dataTransfer?.types?.includes("Files")) {
          e.preventDefault();
          setDragOver(true);
        }
      }}
      onDragOver={(e) => {
        if (dragOver) e.preventDefault();
      }}
    >
      <input
        ref={fileInput}
        type="file"
        accept="application/pdf"
        multiple
        className="sr-only"
        onChange={onFileChange}
      />

      <PageHeader title="Invoices" actions={uploadButton} />

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <FilterChips chips={chips} active={active} onChange={setActive} />
        </div>
        <div className="relative flex-shrink-0 w-40 sm:w-64">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            aria-label="Search invoices"
            className="block w-full h-9 pl-8 pr-3 text-sm bg-white border border-slate-300 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
          />
        </div>
      </div>

      <AnimatePresence>
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-2"
          >
            {tasks.map((t) => (
              <UploadTaskCard key={t.id} task={t} onDismiss={() => dismiss(t.id)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Card accent="top">
        {isLoading ? (
          <LoadingState message="Loading invoices…" />
        ) : error ? (
          <ErrorState
            title="Couldn't load invoices"
            message={(error as Error).message}
            onRetry={() => void refetch()}
          />
        ) : invoices.length === 0 ? (
          <EmptyState Icon={InboxIcon} title={empty.title} body={empty.body} cta={emptyCta} />
        ) : (
          <ul className="divide-y divide-stone/60">
            {invoices.map((inv) => (
              <QueueRow
                key={inv.id}
                invoice={inv}
                me={me.data ?? null}
                qboConnected={qboConnected}
                onReject={setRejecting}
              />
            ))}
          </ul>
        )}
        {data && total > invoices.length && (
          <div className="px-4 py-3 text-xs text-slate-500 border-t border-stone/60">
            Showing {invoices.length} of {total} — refine with search.
          </div>
        )}
      </Card>

      <AnimatePresence>
        {dragOver && (
          <UploadDropOverlay onDrop={enqueue} onLeave={() => setDragOver(false)} />
        )}
      </AnimatePresence>

      {rejecting && <QueueRejectModal invoice={rejecting} onClose={() => setRejecting(null)} />}
    </div>
  );
}
