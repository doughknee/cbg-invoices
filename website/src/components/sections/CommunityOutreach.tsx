import { ScrollReveal } from '@/components/ScrollReveal'
import { impactStats, initiatives } from '@/data/siteData'
import { HeartIcon } from '@heroicons/react/24/solid'
import { useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

interface CommunityOutreachProps {
  variant?: 'light' | 'dark'
}

interface AnimatedStat {
  id: number
  value: number
  target: number
  label: string
}

export function CommunityOutreach({
  variant = 'light',
}: CommunityOutreachProps): React.ReactElement {
  const isDark = variant === 'dark'
  const [stats, setStats] = useState<AnimatedStat[]>(
    impactStats.map((stat) => ({ ...stat, value: 0 })),
  )
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 })

  // biome-ignore lint/correctness/useExhaustiveDependencies: animation runs once when in view
  useEffect(() => {
    if (!isInView) return

    const duration = 2000
    const intervals: ReturnType<typeof setInterval>[] = []

    for (const [index, stat] of stats.entries()) {
      const increment = stat.target / (duration / 50)

      const interval = setInterval(() => {
        setStats((prev) =>
          prev.map((s, i) => {
            if (i !== index) return s
            const next = s.value + increment
            if (next >= s.target) {
              clearInterval(interval)
              return { ...s, value: s.target }
            }
            return { ...s, value: next }
          }),
        )
      }, 50)

      intervals.push(interval)
    }

    return () => {
      for (const interval of intervals) clearInterval(interval)
    }
  }, [isInView])

  function formatValue(value: number): string {
    return Math.floor(value).toLocaleString()
  }

  return (
    <section
      id="community-outreach"
      className={`relative px-8 2xl:px-60 py-section ${
        isDark ? 'bg-graphite bg-grid text-slate-300' : 'bg-stone bg-dots'
      }`}
    >
      {isDark && <div className="absolute inset-0 bg-noise" />}
      <div className={`py-block mx-auto container ${isDark ? 'relative' : ''}`}>
        <ScrollReveal>
          <div className="mb-12">
            <div className="flex items-center mb-4">
              <HeartIcon className="mr-4 size-10 text-amber" />
              <h2
                className={`font-display font-bold text-5xl ${isDark ? 'text-stone' : 'text-navy'}`}
              >
                Community Impact
              </h2>
            </div>
            <p className={`text-lg max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              At Cambridge Building Group, we believe in building more than structures &mdash; we
              build communities. Our commitment to social responsibility drives us to give back.
            </p>
          </div>
        </ScrollReveal>

        {/* Impact Statistics */}
        <ScrollReveal delay={0.1}>
          <div ref={sectionRef} className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-12">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className={`shadow-lg p-8 border-amber border-b-2 text-center ${
                  isDark ? 'bg-navy' : 'bg-white'
                }`}
              >
                <p className="mb-2 font-display text-amber text-5xl">{formatValue(stat.value)}</p>
                <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Community Initiatives */}
        <ScrollReveal delay={0.15}>
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
            {initiatives.map((initiative) => {
              const Icon = initiative.icon
              return (
                <div
                  key={initiative.id}
                  className={`group relative shadow-lg p-6 border-amber border-l-4 overflow-hidden ${
                    isDark ? 'bg-navy' : 'bg-white'
                  }`}
                >
                  <Icon
                    className={`-right-6 -bottom-6 absolute opacity-50 size-32 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 ${
                      isDark ? 'text-slate-700' : 'text-slate-200'
                    }`}
                  />
                  <div className="z-10 relative">
                    <span className="inline-block bg-amber/10 mb-3 px-3 py-1 font-semibold text-amber text-sm">
                      {initiative.category}
                    </span>
                    <h4
                      className={`mb-3 font-bold text-xl ${isDark ? 'text-slate-200' : 'text-navy'}`}
                    >
                      {initiative.title}
                    </h4>
                    <p className={`mb-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                      {initiative.description}
                    </p>
                    <div
                      className={`pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
                    >
                      <p className={`font-semibold text-sm ${isDark ? 'text-amber' : 'text-navy'}`}>
                        Impact: {initiative.impact}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
