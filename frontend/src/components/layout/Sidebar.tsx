import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLogto } from "@logto/react";
import {
  DocumentTextIcon,
  ClockIcon,
  Cog6ToothIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/cn";
import { postSignOutUri, useUser } from "@/lib/auth";
import { useMe } from "@/lib/users";
import { useAccessRequests } from "@/lib/accessRequests";
import { useQboStatus } from "@/lib/qbo";
import { SETTINGS_SECTIONS } from "@/lib/settingsSections";

interface NavItem {
  to: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const NAV: NavItem[] = [
  { to: "/invoices", label: "Invoices", Icon: DocumentTextIcon },
  { to: "/team", label: "Team", Icon: UsersIcon },
  { to: "/audit", label: "Activity", Icon: ClockIcon },
  { to: "/settings", label: "Settings", Icon: Cog6ToothIcon },
];

/**
 * Desktop-only sidebar. The mobile-drawer pattern was retired in favor
 * of the BottomTabBar — this component is hidden below `md`.
 */
export function Sidebar() {
  const { pathname } = useLocation();
  const me = useMe();
  const canManage = me.data?.role === "owner" || me.data?.role === "admin";
  // Only admins+ get the access-requests query (others would 403)
  const reqQuery = useAccessRequests({ enabled: canManage });
  const pendingCount = reqQuery.data?.pending_count ?? 0;

  // While on Settings, expand a jump-nav of the page's sections. The "sync"
  // section only exists once QuickBooks is connected.
  const onSettings = pathname.startsWith("/settings");
  const qboConnected = useQboStatus().data?.connected ?? false;
  const settingsSections = SETTINGS_SECTIONS.filter((s) => !s.requiresQbo || qboConnected);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    if (!onSettings) return;
    const els = SETTINGS_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActiveSection(top.target.id);
      },
      { rootMargin: "-10% 0px -70% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [onSettings, qboConnected]);

  function jumpToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  }

  return (
    <aside
      className="hidden md:flex md:relative md:flex-shrink-0 md:w-60 bg-graphite bg-grid bg-noise text-stone overflow-hidden"
      aria-label="Primary navigation"
    >
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-stone/10">
          <div className="text-xs font-bold uppercase tracking-widest text-amber">
            Cambridge
          </div>
          <div className="font-display text-xl text-stone leading-tight mt-0.5">
            Invoice Portal
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          <ul className="space-y-0.5">
            {NAV.map(({ to, label, Icon }) => {
              const active = pathname === to || pathname.startsWith(`${to}/`);
              const showBadge = to === "/team" && pendingCount > 0;
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={cn(
                      "flex items-center gap-3 px-6 py-2.5 text-sm transition-colors",
                      "border-l-2",
                      active
                        ? "border-amber text-stone bg-white/5"
                        : "border-transparent text-slate-400 hover:text-stone hover:bg-white/5",
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{label}</span>
                    {showBadge && (
                      <span
                        className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 bg-amber text-navy text-[10px] font-bold tracking-wider"
                        aria-label={`${pendingCount} pending request${pendingCount === 1 ? "" : "s"}`}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </Link>

                  {to === "/settings" && active && settingsSections.length > 0 && (
                    <ul className="mt-0.5 mb-1">
                      {settingsSections.map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => jumpToSection(s.id)}
                            className={cn(
                              "w-full text-left pl-14 pr-6 py-1.5 text-xs transition-colors border-l-2",
                              activeSection === s.id
                                ? "border-amber text-stone"
                                : "border-transparent text-slate-500 hover:text-stone hover:bg-white/5",
                            )}
                          >
                            {s.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <AccountCard />

        <div className="px-6 py-3 text-[11px] text-slate-500 border-t border-stone/10">
          <div className="font-mono">v0.1.0</div>
        </div>
      </div>
    </aside>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Account card at the bottom of the sidebar — shows who you're signed in as
// plus a sign-out action.
// ──────────────────────────────────────────────────────────────────────────

function AccountCard() {
  const user = useUser();
  const me = useMe();
  const { signOut } = useLogto();

  const role = me.data?.role ?? null;
  const name = user?.name?.trim() || user?.email || "Signed in";
  const email = user?.email ?? null;

  const initials = computeInitials(name, email);

  return (
    <div className="px-4 pt-3 pb-3 border-t border-stone/10 bg-black/20">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex-shrink-0 inline-flex items-center justify-center h-9 w-9 bg-amber text-navy text-xs font-bold tracking-wider"
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-stone truncate leading-tight">
            {name}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {role && <RolePill role={role} />}
            {email && email !== name && (
              <div className="text-[11px] text-slate-400 truncate">{email}</div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void signOut(postSignOutUri())}
        className="mt-3 w-full inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-stone py-1.5 border border-stone/15 hover:border-amber transition-colors"
      >
        <ArrowRightOnRectangleIcon className="h-3.5 w-3.5" />
        Sign out
      </button>
    </div>
  );
}

function RolePill({ role }: { role: "owner" | "admin" | "member" }) {
  const cls: Record<typeof role, string> = {
    owner: "bg-amber/25 text-amber",
    admin: "bg-white/10 text-stone",
    member: "bg-white/5 text-slate-400",
  };
  return (
    <span
      className={cn(
        "inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5",
        cls[role],
      )}
    >
      {role}
    </span>
  );
}

function computeInitials(name: string, email: string | null): string {
  const source = name || email || "?";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
