import { ScrollReveal } from '@/components/ScrollReveal'
import { markets } from '@/data/siteData'
import { scrollToNextSection } from '@/utils/autoScroll'
import { ChevronRightIcon, MapPinIcon } from '@heroicons/react/24/solid'
import { useMemo } from 'react'

interface MarketsWeServeProps {
  showButton?: boolean
}

export function MarketsWeServe({ showButton = false }: MarketsWeServeProps): React.ReactElement {
  const geographic = useMemo(() => markets.filter((m) => m.id <= 3), [])
  const sectors = useMemo(
    () => markets.filter((m) => m.id > 3).sort((a, b) => b.projects - a.projects),
    [],
  )
  const maxProjects = useMemo(() => Math.max(...sectors.map((s) => s.projects)), [sectors])

  return (
    <section id="markets-we-serve" className="relative bg-stone bg-dots px-8 2xl:px-60 py-section">
      <div className="py-block mx-auto container">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14">
            <div className="mb-6 md:mb-0 max-w-2xl">
              <h2 className="font-display font-bold text-navy text-5xl mb-4">
                Markets We <span className="text-amber">Serve</span>
              </h2>
              <p className="text-lg text-slate-700">
                Rooted in Nashville, growing across the Southeast &mdash; with deep expertise across
                the sectors that shape how communities live and work.
              </p>
            </div>
            {showButton && (
              <button
                type="button"
                onClick={() => scrollToNextSection('why-cambridge')}
                className="group inline-flex items-center gap-2 bg-navy shadow-lg px-6 py-2.5 border-2 border-navy font-semibold text-slate-300 hover:scale-105 transition duration-200 cursor-pointer"
              >
                Our Advantage
                <ChevronRightIcon className="group-hover:rotate-90 transition duration-200 size-4" />
              </button>
            )}
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* ── Geographic Presence ── */}
          <ScrollReveal direction="left">
            <div>
              <h3 className="font-display text-2xl font-bold text-navy mb-8">Where We Build</h3>

              {/* Tennessee — primary market, prominent */}
              {geographic[0] && (
                <div className="border-l-2 border-amber pl-6 mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPinIcon className="size-5 text-amber shrink-0" />
                    <h4 className="font-bold text-navy text-xl">{geographic[0].title}</h4>
                    <span className="font-display text-amber text-lg">
                      {geographic[0].projects} projects
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{geographic[0].description}</p>
                </div>
              )}

              {/* Expanding states */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {geographic.slice(1).map((market) => (
                  <div key={market.id} className="border-l-2 border-slate-300 pl-5">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPinIcon className="size-4 text-slate-400 shrink-0" />
                      <h4 className="font-semibold text-navy">{market.title}</h4>
                    </div>
                    <p className="text-xs uppercase tracking-widest text-amber font-semibold mb-2">
                      Expanding
                    </p>
                    <p className="text-slate-600 text-sm leading-relaxed">{market.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* ── Sector Expertise ── */}
          <ScrollReveal direction="right" delay={0.1}>
            <div>
              <h3 className="font-display text-2xl font-bold text-navy mb-8">Sector Expertise</h3>

              <div className="space-y-6">
                {sectors.map((sector) => {
                  const barWidth =
                    maxProjects > 0 ? Math.max((sector.projects / maxProjects) * 100, 6) : 6
                  return (
                    <div key={sector.id}>
                      <div className="flex justify-between items-baseline mb-1.5">
                        <h4 className="font-bold text-navy">{sector.title}</h4>
                        <span className="font-display text-amber text-lg tabular-nums">
                          {sector.projects}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 mb-2">
                        <div
                          className="h-full w-full origin-left bg-amber transition-transform duration-700"
                          style={{ transform: `scaleX(${barWidth / 100})` }}
                        />
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{sector.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
