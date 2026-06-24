import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowPathIcon,
  BuildingOffice2Icon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/layout/AppShell";
import { useMobileAppBar } from "@/components/layout/MobileAppBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChips, type FilterChip } from "@/components/ui/FilterChips";
import { LoadingState } from "@/components/ui/LoadingState";
import { useProjects, useVendors } from "@/lib/invoices";
import { useQboStatus, useSyncProjects, useSyncVendors } from "@/lib/qbo";
import { formatRelative } from "@/lib/format";

export const Route = createFileRoute("/_authed/quickbooks")({
  component: QuickBooksPage,
});

type Filter = "all" | "vendor" | "project";

interface Row {
  id: string;
  kind: "vendor" | "project";
  name: string;
  type: string;
  email: string | null;
  qbo_id: string | null;
  synced: string | null;
}

const COLUMNS: Column<Row>[] = [
  {
    key: "name",
    header: "Name",
    primary: true,
    className: "font-semibold text-navy",
    render: (r) => r.name,
  },
  { key: "type", header: "Type", render: (r) => r.type },
  { key: "email", header: "Email", render: (r) => r.email ?? "—" },
  { key: "qbo", header: "QBO ID", className: "font-mono text-xs", render: (r) => r.qbo_id ?? "—" },
  { key: "synced", header: "Synced", align: "right", render: (r) => formatRelative(r.synced) },
];

function QuickBooksPage() {
  const navigate = useNavigate();
  const vendorsQ = useVendors();
  const projectsQ = useProjects();
  const qbo = useQboStatus();
  const syncVendors = useSyncVendors();
  const syncProjects = useSyncProjects();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  useMobileAppBar({
    title: "QuickBooks",
    action: (
      <button
        type="button"
        onClick={() =>
          navigate({ to: "/settings", search: { qbo_connected: undefined, qbo_error: undefined } })
        }
        className="inline-flex items-center min-h-[36px] px-3 text-xs font-bold uppercase tracking-wider text-navy hover:text-amber"
        aria-label="Back to settings"
      >
        ← Settings
      </button>
    ),
  });

  const rows: Row[] = useMemo(() => {
    const v: Row[] = (vendorsQ.data?.vendors ?? []).map((x) => ({
      id: `v-${x.id}`,
      kind: "vendor",
      name: x.display_name,
      type: "Vendor",
      email: x.email,
      qbo_id: x.qbo_id,
      synced: x.last_synced_at,
    }));
    const p: Row[] = (projectsQ.data?.projects ?? []).map((x) => ({
      id: `p-${x.id}`,
      kind: "project",
      name: x.display_name,
      type: x.qbo_type,
      email: null,
      qbo_id: x.qbo_id,
      synced: x.last_synced_at,
    }));
    return [...v, ...p].sort((a, b) => a.name.localeCompare(b.name));
  }, [vendorsQ.data, projectsQ.data]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      vendor: rows.filter((r) => r.kind === "vendor").length,
      project: rows.filter((r) => r.kind === "project").length,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.kind !== filter) return false;
      if (!needle) return true;
      return (
        r.name.toLowerCase().includes(needle) ||
        (r.email?.toLowerCase().includes(needle) ?? false) ||
        (r.qbo_id?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [rows, filter, query]);

  const chips: FilterChip<Filter>[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "vendor", label: "Vendors", count: counts.vendor },
    { key: "project", label: "Projects", count: counts.project },
  ];

  const isLoading = vendorsQ.isLoading || projectsQ.isLoading;
  const error = vendorsQ.error || projectsQ.error;
  const connected = qbo.data?.connected ?? false;
  const syncing = syncVendors.isPending || syncProjects.isPending;

  function syncAll() {
    syncVendors.mutate();
    syncProjects.mutate();
  }

  return (
    <>
      <PageHeader
        title="Vendors & projects"
        subtitle="Read-only reference data synced from QuickBooks."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={syncAll}
            loading={syncing}
            disabled={!connected}
            title={connected ? "Sync from QBO" : "Connect QBO in Settings first"}
          >
            <ArrowPathIcon className="h-4 w-4" />
            Sync
          </Button>
        }
      />

      <Card accent="top">
        {isLoading ? (
          <LoadingState message="Loading records…" />
        ) : error ? (
          <ErrorState
            title="Couldn't load records"
            message={(error as Error).message}
            onRetry={() => {
              void vendorsQ.refetch();
              void projectsQ.refetch();
            }}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            Icon={BuildingOffice2Icon}
            title="Nothing synced yet"
            body={
              connected
                ? "Tap Sync to pull vendors and projects from QuickBooks."
                : "Connect QuickBooks on the Settings page first."
            }
            cta={
              connected ? (
                <Button variant="secondary" size="sm" onClick={syncAll} loading={syncing}>
                  <ArrowPathIcon className="h-4 w-4" />
                  Sync from QuickBooks
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="px-4 py-3 border-b border-stone/60 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <FilterChips chips={chips} active={filter} onChange={setFilter} />
              <div className="relative sm:w-64">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, email, QBO ID…"
                  aria-label="Search vendors and projects"
                  className="h-9 w-full border border-slate-300 bg-stone/50 pl-8 pr-3 text-sm text-graphite focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber placeholder:text-slate-400"
                />
              </div>
            </div>
            {filtered.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-500">
                No matches for “{query}”.
              </p>
            ) : (
              <DataTable columns={COLUMNS} rows={filtered} getRowKey={(r) => r.id} />
            )}
          </>
        )}
      </Card>
    </>
  );
}
