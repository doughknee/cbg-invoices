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

/** The current user's own notification preferences. */
export interface UserNotificationPrefs {
  assignment_emails: boolean;
  digest_emails: boolean;
}

const PREFS_KEY = ["notification-preferences"] as const;

export function useMyNotificationPrefs() {
  const { request } = useApi();
  return useQuery({
    queryKey: PREFS_KEY,
    queryFn: () =>
      request<UserNotificationPrefs>("/api/notifications/preferences"),
    staleTime: 60_000,
  });
}

export function useUpdateMyNotificationPrefs() {
  const { request } = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<UserNotificationPrefs>) =>
      request<UserNotificationPrefs>("/api/notifications/preferences", {
        method: "PATCH",
        body: body as unknown as BodyInit,
      }),
    onSuccess: (data) => {
      qc.setQueryData(PREFS_KEY, data);
    },
  });
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
      request<{
        recipients: number;
        pending_users: number;
        opted_out?: number;
        skipped?: string;
      }>("/api/notifications/digest/run", { method: "POST" }),
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
