import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowTrendingUpIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/layout/AppShell";
import { useMobileAppBar } from "@/components/layout/MobileAppBar";
import { Card } from "@/components/ui/Card";
import { markReleaseSeen, RELEASES, type ReleaseSection } from "@/lib/releases";

export const Route = createFileRoute("/_authed/whats-new")({
  component: WhatsNewPage,
});

const SECTION_META: Record<ReleaseSection["kind"], { label: string; Icon: typeof SparklesIcon }> = {
  new: { label: "New", Icon: SparklesIcon },
  improved: { label: "Improvements", Icon: ArrowTrendingUpIcon },
};

function WhatsNewPage() {
  useMobileAppBar({ title: "What's new" });
  // Visiting the page clears the "new" badge in the nav.
  useEffect(() => {
    markReleaseSeen();
  }, []);

  return (
    <>
      <PageHeader
        title="What's"
        accent="New"
        subtitle="The latest features in the portal, in plain English."
      />

      <div className="max-w-3xl space-y-12">
        {RELEASES.map((release) => (
          <article key={release.version}>
            {/* Release hero */}
            <div className="relative overflow-hidden bg-navy text-stone border-t-4 border-amber p-6 mb-6">
              <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" aria-hidden />
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-amber text-navy px-2 py-0.5">
                    v{release.version}
                  </span>
                  <span className="text-xs text-stone/60">{release.date}</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl leading-tight">
                  {release.headline}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-stone/70 leading-relaxed">
                  {release.summary}
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {release.sections.map((section) => (
                <Section key={section.kind} section={section} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function Section({ section }: { section: ReleaseSection }) {
  const meta = SECTION_META[section.kind];
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <meta.Icon className="h-5 w-5 text-amber" aria-hidden />
        <h3 className="font-display text-xl text-navy">{meta.label}</h3>
      </div>
      <div className="space-y-3">
        {section.items.map((item) => (
          <Card key={item.title} accent="left" className="flex items-start gap-4 p-4">
            <span
              aria-hidden
              className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center bg-navy text-amber"
            >
              <item.Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h4 className="font-semibold text-navy">{item.title}</h4>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{item.body}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
