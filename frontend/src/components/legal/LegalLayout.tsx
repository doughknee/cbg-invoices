import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface LegalLayoutProps {
  title: string;
  updatedOn: string;
  children: ReactNode;
}

export function LegalLayout({ title, updatedOn, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-stone text-graphite">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone/80 pb-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber">
              Cambridge Invoice Portal
            </div>
            <h1 className="mt-3 font-display text-4xl text-navy sm:text-5xl">{title}</h1>
            <p className="mt-3 text-sm text-slate-600">Last updated {updatedOn}</p>
          </div>
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center justify-center border-2 border-navy px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
          >
            Back to welcome screen
          </Link>
        </div>

        <div className="mt-8 space-y-8 text-sm leading-7 text-graphite [&_a]:text-navy [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-navy [&_li]:ml-5 [&_li]:list-disc [&_p]:max-w-3xl [&_strong]:text-navy">
          {children}
        </div>
      </div>
    </div>
  );
}
