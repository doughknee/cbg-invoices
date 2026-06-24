import { useMemo, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { memberLabel, useUsers } from "@/lib/users";
import { useSendManualNotification } from "@/lib/notifications";
import type { Invoice } from "@/types";

/**
 * Admin-only: nudge team members about a specific invoice, optionally with a
 * note. The email includes a deep link to this invoice. Recipients are the
 * team members who have an email address.
 */
export function NotifyModal({
  open,
  invoice,
  onClose,
}: {
  open: boolean;
  invoice: Invoice;
  onClose: () => void;
}) {
  const { data, isLoading } = useUsers({ enabled: open });
  const send = useSendManualNotification();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [sentCount, setSentCount] = useState<number | null>(null);

  const members = useMemo(() => (data?.users ?? []).filter((m) => !!m.email), [data]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function close() {
    setSelected(new Set());
    setMessage("");
    setSentCount(null);
    onClose();
  }

  async function handleSend() {
    const recipients = members
      .filter((m) => selected.has(m.id))
      .map((m) => ({ email: m.email as string, name: m.name }));
    if (recipients.length === 0) return;
    const result = await send.mutateAsync({
      recipients,
      message: message.trim() || null,
      invoice_id: invoice.id,
    });
    setSentCount(result.sent);
  }

  const vendor = invoice.vendor_name || "this invoice";

  return (
    <BottomSheet open={open} onClose={close} ariaLabel="Notify team members" maxWidth="max-w-lg">
      <div className="p-4 space-y-4">
        <div>
          <h2 className="font-display text-xl text-navy">Notify about {vendor}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Emails the selected members a link to this invoice, plus your note.
          </p>
        </div>

        {sentCount !== null ? (
          <div className="space-y-4">
            <p className="text-sm text-graphite">
              Sent to {sentCount} member{sentCount === 1 ? "" : "s"}.
            </p>
            <Button onClick={close}>Done</Button>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Recipients
              </p>
              {isLoading ? (
                <p className="text-sm text-slate-500">Loading team…</p>
              ) : members.length === 0 ? (
                <p className="text-sm text-slate-500">No team members with an email yet.</p>
              ) : (
                <ul className="divide-y divide-stone/60 border border-slate-200 max-h-56 overflow-y-auto">
                  {members.map((m) => (
                    <li key={m.id}>
                      <label className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-amber/5">
                        <input
                          type="checkbox"
                          checked={selected.has(m.id)}
                          onChange={() => toggle(m.id)}
                          className="h-4 w-4 accent-amber"
                        />
                        <span>{memberLabel(m)}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Message (optional)
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Add a note…"
                className="block w-full p-3 border border-slate-300 bg-stone/50 text-graphite text-sm focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber placeholder:text-slate-400"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSend} loading={send.isPending} disabled={selected.size === 0}>
                Send notification
              </Button>
              <Button variant="ghost" type="button" onClick={close}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
