/**
 * Hooks for notification settings (the daily review digest) and the manual
 * admin send. All endpoints are admin/owner-gated server-side.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

const SETTINGS_KEY = ["notification-settings"] as const;

export interface NotificationSettings {
  daily_digest_enabled: boolean;
  /** 24h "HH:MM" in `daily_digest_timezone`. */
  daily_digest_time: string;
  daily_digest_timezone: string;
  daily_digest_last_sent_on: string | null;
}

export interface ManualRecipient {
  email: string;
  name?: string | null;
}

export function useNotificationSettings(opts: { enabled?: boolean } = {}) {
  const { request } = useApi();
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: () => request<NotificationSettings>("/api/notifications/settings"),
    enabled: opts.enabled ?? true,
    staleTime: 60_000,
  });
}

export function useUpdateNotificationSettings() {
  const { request } = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<NotificationSettings>) =>
      request<NotificationSettings>("/api/notifications/settings", {
        method: "PATCH",
        body: body as unknown as BodyInit,
      }),
    onSuccess: (data) => {
      qc.setQueryData(SETTINGS_KEY, data);
    },
  });
}

/** Fire the daily digest immediately (admin test/preview). */
export function useRunDigestNow() {
  const { request } = useApi();
  return useMutation({
    mutationFn: () =>
      request<{ recipients: number; pending_users: number; skipped?: string }>(
        "/api/notifications/digest/run",
        { method: "POST" },
      ),
  });
}

/** Send an ad-hoc notification to members, optionally about an invoice. */
export function useSendManualNotification() {
  const { request } = useApi();
  return useMutation({
    mutationFn: (body: {
      recipients: ManualRecipient[];
      message?: string | null;
      invoice_id?: string | null;
    }) =>
      request<{ sent: number; skipped?: string }>("/api/notifications/send", {
        method: "POST",
        body: body as unknown as BodyInit,
      }),
  });
}
