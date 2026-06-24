import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface Column<T> {
  /** Stable identifier for the column. */
  key: string;
  header: string;
  align?: "left" | "right";
  /** The prominent column shown as the title in the mobile card view. The
   *  first column is used when none is marked. */
  primary?: boolean;
  /** Extra classes applied to the value (desktop `<td>` + mobile value). */
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
}

/**
 * Responsive data table shared across the management screens. Renders a styled
 * table on md+ and a one-card-per-row list (primary value as the title, the
 * rest as labelled fields) on mobile, so both stay readable and on-brand.
 */
export function DataTable<T>({ columns, rows, getRowKey }: DataTableProps<T>) {
  const primary = columns.find((c) => c.primary) ?? columns[0];
  const secondary = columns.filter((c) => c.key !== primary.key);

  return (
    <>
      {/* Desktop */}
      <table className="hidden md:table w-full border-collapse">
        <thead>
          <tr className="bg-stone/50 border-b border-stone/60 text-[11px] font-bold uppercase tracking-widest text-amber">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn("px-4 py-2.5", c.align === "right" ? "text-right" : "text-left")}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone/60">
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="transition-colors hover:bg-amber/5">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-4 py-3 text-sm text-slate-600",
                    c.align === "right" ? "text-right" : "text-left",
                    c.className,
                  )}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile */}
      <ul className="md:hidden divide-y divide-stone/60">
        {rows.map((row) => (
          <li key={getRowKey(row)} className="px-4 py-3">
            <div className="font-semibold text-navy truncate">{primary.render(row)}</div>
            {secondary.length > 0 && (
              <dl className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {secondary.map((c) => (
                  <div key={c.key} className="flex items-baseline gap-1.5">
                    <dt className="text-slate-400">{c.header}</dt>
                    <dd className={cn("text-slate-600", c.className)}>{c.render(row)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
