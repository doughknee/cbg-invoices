import { createFileRoute } from "@tanstack/react-router";
import { ArrowPathIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/layout/AppShell";
import { useMobileAppBar } from "@/components/layout/MobileAppBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useVendors } from "@/lib/invoices";
import { useQboStatus, useSyncVendors } from "@/lib/qbo";
import { formatRelative } from "@/lib/format";
import type { Vendor } from "@/types";

export const Route = createFileRoute("/_authed/vendors")({
  component: VendorsPage,
});

const COLUMNS: Column<Vendor>[] = [
  {
    key: "name",
    header: "Vendor",
    primary: true,
    className: "font-semibold text-navy",
    render: (v) => v.display_name,
  },
  { key: "email", header: "Email", render: (v) => v.email ?? "—" },
  { key: "qbo", header: "QBO ID", className: "font-mono text-xs", render: (v) => v.qbo_id ?? "—" },
  {
    key: "synced",
    header: "Synced",
    align: "right",
    render: (v) => formatRelative(v.last_synced_at),
  },
];

function VendorsPage() {
  const { data, isLoading, error, refetch } = useVendors();
  const sync = useSyncVendors();
  const qbo = useQboStatus();
  const connected = qbo.data?.connected ?? false;

  useMobileAppBar({
    title: "Vendors",
    action: connected ? (
      <button
        type="button"
        onClick={() => sync.mutate()}
        disabled={sync.isPending}
        className="inline-flex items-center gap-1.5 min-h-[36px] px-3 text-xs font-bold uppercase tracking-wider text-navy hover:text-amber disabled:opacity-50"
        aria-label="Sync vendors"
      >
        <ArrowPathIcon className={`h-4 w-4 ${sync.isPending ? "animate-spin" : ""}`} />
        Sync
      </button>
    ) : null,
  });

  const lastSync = qbo.data?.last_vendor_sync_at
    ? formatRelative(qbo.data.last_vendor_sync_at)
    : "never";
  const vendors = data?.vendors ?? [];

  return (
    <>
      <PageHeader
        title="Vendors"
        subtitle={`Synced from QuickBooks — last ${lastSync}.`}
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
          <LoadingState message="Loading vendors…" />
        ) : error ? (
          <ErrorState
            title="Couldn't load vendors"
            message={(error as Error).message}
            onRetry={() => void refetch()}
          />
        ) : vendors.length === 0 ? (
          <EmptyState
            Icon={BuildingOffice2Icon}
            title="No vendors synced yet"
            body={
              connected
                ? "Tap Sync to pull every active vendor from QuickBooks. Takes a few seconds."
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
          <DataTable columns={COLUMNS} rows={vendors} getRowKey={(v) => v.id} />
        )}
      </Card>
    </>
  );
}
