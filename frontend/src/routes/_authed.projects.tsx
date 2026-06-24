import { createFileRoute } from "@tanstack/react-router";
import { ArrowPathIcon, FolderIcon } from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/layout/AppShell";
import { useMobileAppBar } from "@/components/layout/MobileAppBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useProjects } from "@/lib/invoices";
import { useQboStatus, useSyncProjects } from "@/lib/qbo";
import { formatRelative } from "@/lib/format";
import type { Project } from "@/types";

export const Route = createFileRoute("/_authed/projects")({
  component: ProjectsPage,
});

const COLUMNS: Column<Project>[] = [
  {
    key: "name",
    header: "Project",
    primary: true,
    className: "font-semibold text-navy",
    render: (p) => p.display_name,
  },
  { key: "type", header: "Type", render: (p) => p.qbo_type },
  { key: "qbo", header: "QBO ID", className: "font-mono text-xs", render: (p) => p.qbo_id },
  {
    key: "synced",
    header: "Synced",
    align: "right",
    render: (p) => formatRelative(p.last_synced_at),
  },
];

function ProjectsPage() {
  const { data, isLoading, error, refetch } = useProjects();
  const sync = useSyncProjects();
  const qbo = useQboStatus();
  const connected = qbo.data?.connected ?? false;
  const source = qbo.data?.project_source ?? "Customer";

  useMobileAppBar({
    title: "Projects",
    action: connected ? (
      <button
        type="button"
        onClick={() => sync.mutate()}
        disabled={sync.isPending}
        className="inline-flex items-center gap-1.5 min-h-[36px] px-3 text-xs font-bold uppercase tracking-wider text-navy hover:text-amber disabled:opacity-50"
        aria-label="Sync projects"
      >
        <ArrowPathIcon className={`h-4 w-4 ${sync.isPending ? "animate-spin" : ""}`} />
        Sync
      </button>
    ) : null,
  });

  const lastSync = qbo.data?.last_project_sync_at
    ? formatRelative(qbo.data.last_project_sync_at)
    : "never";
  const projects = data?.projects ?? [];

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle={`Synced from QBO ${source.toLowerCase()}s — last ${lastSync}.`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => sync.mutate()}
            loading={sync.isPending}
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
          <LoadingState message="Loading projects…" />
        ) : error ? (
          <ErrorState
            title="Couldn't load projects"
            message={(error as Error).message}
            onRetry={() => void refetch()}
          />
        ) : projects.length === 0 ? (
          <EmptyState
            Icon={FolderIcon}
            title="No projects synced yet"
            body={
              connected
                ? `Tap Sync to pull every active QuickBooks ${source.toLowerCase()}.`
                : "Connect QuickBooks on the Settings page first."
            }
            cta={
              connected ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => sync.mutate()}
                  loading={sync.isPending}
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Sync from QuickBooks
                </Button>
              ) : undefined
            }
          />
        ) : (
          <DataTable columns={COLUMNS} rows={projects} getRowKey={(p) => p.id} />
        )}
      </Card>
    </>
  );
}
