import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/layout/AppShell";
import { useMobileAppBar } from "@/components/layout/MobileAppBar";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuditLog } from "@/lib/audit";
import { useMe, useUsers } from "@/lib/users";
import { describeAction, filterOptionsByCategory, TONE_CIRCLE } from "@/lib/auditActions";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { AuditLogEntry } from "@/types";

export const Route = createFileRoute("/_authed/audit")({
  component: AuditPage,
});

const VIEW_KEY = "audit:view";
const PAGE_SIZE = 50;
const SELECT_CLASS =
  "h-10 w-full border border-slate-300 bg-white px-3 text-sm text-graphite focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber";

function AuditPage() {
  useMobileAppBar({ title: "Activity" });
  const me = useMe();
  const isAdmin = me.data?.role === "owner" || me.data?.role === "admin";

  const [detailed, setDetailed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(VIEW_KEY) === "detailed";
    } catch {
      return false;
    }
  });
  function setView(next: boolean) {
    setDetailed(next);
    try {
      localStorage.setItem(VIEW_KEY, next ? "detailed" : "simple");
    } catch {
      /* ignore */
    }
  }

  const [actor, setActor] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);

  // Only admins can read the team roster; members fall back to email labels.
  const usersQ = useUsers({ enabled: isAdmin });
  const users = usersQ.data?.users ?? [];
  const nameById = new Map(users.map((u) => [u.id, u.name || u.email || u.id]));

  const { data, isLoading, error, refetch } = useAuditLog({
    actor_id: actor || undefined,
    action: action || undefined,
    page,
    page_size: PAGE_SIZE,
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const days = groupByDay(logs);
  const actionGroups = filterOptionsByCategory();
  const hasFilters = !!actor || !!action;

  function actorName(entry: AuditLogEntry): string {
    if (entry.actor_id === "system") return "System";
    return nameById.get(entry.actor_id) ?? entry.actor_email ?? "Someone";
  }

  return (
    <>
      <PageHeader
        title="Activity"
        accent="Log"
        subtitle="A plain-English record of everything that's happened — who did what, and when."
      />

      {/* Controls */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <label className="flex-1 min-w-0">
            <span className="sr-only">Filter by person</span>
            <select
              value={actor}
              onChange={(e) => {
                setActor(e.target.value);
                setPage(1);
              }}
              className={SELECT_CLASS}
            >
              <option value="">Everyone</option>
              <option value="system">System (automatic)</option>
              {users.length > 0 && (
                <optgroup label="Team">
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email || u.id}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </label>
          <label className="flex-1 min-w-0">
            <span className="sr-only">Filter by activity</span>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              className={SELECT_CLASS}
            >
              <option value="">All activity</option>
              {actionGroups.map((g) => (
                <optgroup key={g.category} label={g.category}>
                  {g.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setActor("");
                setAction("");
                setPage(1);
              }}
              className="h-10 px-3 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-navy whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
        <ViewToggle detailed={detailed} onChange={setView} />
      </div>

      <Card accent="top">
        {isLoading ? (
          <LoadingState message="Loading activity…" />
        ) : error ? (
          <ErrorState
            title="Couldn't load the activity log"
            message={(error as Error).message}
            onRetry={() => void refetch()}
          />
        ) : logs.length === 0 ? (
          <EmptyState
            Icon={ClipboardDocumentListIcon}
            title={hasFilters ? "No matching activity" : "Nothing here yet"}
            body={
              hasFilters
                ? "Nothing matches these filters. Try clearing them."
                : "Actions across the app — uploads, reviews, QuickBooks posts — show up here."
            }
          />
        ) : (
          <>
            {days.map((day) => (
              <div key={day.key}>
                <div className="px-4 py-2 bg-stone/40 border-b border-stone/60 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  {day.label}
                </div>
                <ul className="divide-y divide-stone/60">
                  {day.entries.map((entry) => (
                    <AuditItem
                      key={entry.id}
                      entry={entry}
                      actorName={actorName(entry)}
                      detailed={detailed}
                    />
                  ))}
                </ul>
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-stone/60 text-sm">
                <span className="text-slate-500">
                  Page {page} of {totalPages} · {total} events
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 border border-slate-300 disabled:opacity-40 hover:border-navy"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 border border-slate-300 disabled:opacity-40 hover:border-navy"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </>
  );
}

function ViewToggle({
  detailed,
  onChange,
}: {
  detailed: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="inline-flex flex-shrink-0 border border-slate-300 text-xs font-bold uppercase tracking-wider self-start">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn("px-3 py-2", !detailed ? "bg-navy text-stone" : "bg-white text-slate-600 hover:text-navy")}
      >
        Simple
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "px-3 py-2 border-l border-slate-300",
          detailed ? "bg-navy text-stone" : "bg-white text-slate-600 hover:text-navy",
        )}
      >
        Detailed
      </button>
    </div>
  );
}

function invoiceLabel(entry: AuditLogEntry): string {
  if (entry.invoice_vendor_name && entry.invoice_number) {
    return `${entry.invoice_vendor_name} #${entry.invoice_number}`;
  }
  if (entry.invoice_vendor_name) return entry.invoice_vendor_name;
  if (entry.invoice_number) return `#${entry.invoice_number}`;
  return "an invoice";
}

function messageLine(entry: AuditLogEntry): string | null {
  if (!entry.message) return null;
  switch (entry.action) {
    case "invoice_assigned":
      return `to ${entry.message}`;
    case "invoice_rejected":
      return `Reason: ${entry.message}`;
    default:
      return entry.message;
  }
}

function AuditItem({
  entry,
  actorName,
  detailed,
}: {
  entry: AuditLogEntry;
  actorName: string;
  detailed: boolean;
}) {
  const info = describeAction(entry.action);
  const message = info.showMessage ? messageLine(entry) : null;

  return (
    <li className="px-4 py-3">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "flex-shrink-0 inline-flex h-8 w-8 items-center justify-center",
            TONE_CIRCLE[info.tone],
          )}
        >
          <info.Icon className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-graphite leading-snug">
            <span className="font-semibold text-navy">{actorName}</span> {info.phrase}
            {info.invoiceObject && (
              <>
                {" "}
                {entry.invoice_id ? (
                  <Link
                    to="/invoices/$id"
                    params={{ id: entry.invoice_id }}
                    className="font-medium text-navy underline underline-offset-2 hover:text-amber"
                  >
                    {invoiceLabel(entry)}
                  </Link>
                ) : (
                  <span className="text-slate-500">{invoiceLabel(entry)}</span>
                )}
              </>
            )}
            {info.suffix}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            <time dateTime={entry.created_at} title={formatDateTime(entry.created_at)}>
              {formatRelative(entry.created_at)}
            </time>
            {info.system && (
              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                · automatic
              </span>
            )}
          </p>
          {message && (
            <p className="mt-1 text-xs text-slate-600 break-words border-l-2 border-stone pl-2">
              {message}
            </p>
          )}
          {detailed && <DetailBlock entry={entry} />}
        </div>
      </div>
    </li>
  );
}

function DetailBlock({ entry }: { entry: AuditLogEntry }) {
  const [open, setOpen] = useState(false);
  const hasDiff =
    (entry.before && Object.keys(entry.before).length > 0) ||
    (entry.after && Object.keys(entry.after).length > 0);

  return (
    <div className="mt-2 border-t border-stone/50 pt-2 space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-500">
        <span>
          action <span className="text-graphite">{entry.action}</span>
        </span>
        <span>
          actor <span className="text-graphite">{entry.actor_id}</span>
        </span>
        {entry.invoice_id && (
          <span>
            invoice <span className="text-graphite">{entry.invoice_id}</span>
          </span>
        )}
      </div>
      {hasDiff && (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-[11px] font-semibold uppercase tracking-wider text-navy hover:text-amber"
          >
            {open ? "Hide" : "Show"} before / after
          </button>
          {open && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DiffPane title="Before" data={entry.before} tone="red" />
              <DiffPane title="After" data={entry.after} tone="green" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DiffPane({
  title,
  data,
  tone,
}: {
  title: string;
  data: Record<string, unknown> | null;
  tone: "red" | "green";
}) {
  const borderClass = tone === "red" ? "border-red-300" : "border-green-300";
  const labelClass = tone === "red" ? "text-red-700" : "text-green-700";
  return (
    <div className={cn("border bg-stone/40 p-3", borderClass)}>
      <div className={cn("text-xs font-bold uppercase tracking-widest mb-2", labelClass)}>
        {title}
      </div>
      {!data || Object.keys(data).length === 0 ? (
        <div className="text-xs text-slate-500 italic">(nothing)</div>
      ) : (
        <pre className="text-xs font-mono text-graphite whitespace-pre-wrap break-words overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

interface DayGroup {
  key: string;
  label: string;
  entries: AuditLogEntry[];
}

function groupByDay(logs: AuditLogEntry[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const entry of logs) {
    const d = new Date(entry.created_at);
    const key = d.toDateString();
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.entries.push(entry);
    } else {
      groups.push({ key, label: dayLabel(d), entries: [entry] });
    }
  }
  return groups;
}

function dayLabel(d: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
