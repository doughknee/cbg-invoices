import { ScrollReveal } from '@/components/ScrollReveal'
import { awards, impactStats, initiatives } from '@/data/siteData'
import { ChevronRightIcon, HeartIcon, TrophyIcon } from '@heroicons/react/24/solid'
import { Link } from '@tanstack/react-router'
import { useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

interface RecognitionImpactProps {
  showButton?: boolean
}

interface AnimatedStat {
  id: number
  value: number
  target: number
  label: string
}

export function RecognitionImpact({
  showButton: _showButton = false,
}: RecognitionImpactProps): React.ReactElement {
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

  return (
    <section
      id="recognition-impact"
      className="relative bg-graphite px-8 2xl:px-60 py-section text-slate-300 bg-grid"
    >
      <div className="absolute inset-0 bg-noise" />
      <div className="relative py-block mx-auto container">
        {/* Awards zone */}
        <ScrollReveal>
          <div className="flex items-center mb-8">
            <TrophyIcon className="mr-4 text-amber size-10" />
            <h2 className="font-display font-bold text-5xl">Recognition &amp; Impact</h2>
          </div>
          <p className="max-w-2xl mb-12 text-lg text-slate-400">
            Our commitment to excellence is recognized through industry memberships, and our
            dedication to community drives meaningful impact where we live and work.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-16 md:mb-20">
            {awards.map((award) => (
              <div
                key={award.id}
                className="group bg-navy shadow-lg p-6 border-t-4 border-amber relative overflow-hidden"
              >
                <div className="top-0 right-0 absolute bg-amber px-4 py-1.5 font-semibold text-navy text-sm">
                  {award.year}
                </div>
                <div className="pt-4">
                  <h3 className="font-bold text-slate-200 text-xl mb-2">{award.title}</h3>
                  <p className="text-slate-400 text-sm italic mb-3">{award.organization}</p>
                  <p className="text-slate-300">{award.description}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Community Impact zone */}
        <ScrollReveal delay={0.15}>
          <div className="flex items-center mb-8">
            <HeartIcon className="mr-4 text-amber size-8" />
            <h3 className="font-display font-bold text-3xl">Community Impact</h3>
          </div>
        </ScrollReveal>

        {/* Impact Stats */}
        <ScrollReveal delay={0.2}>
          <div ref={sectionRef} className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-12">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="bg-navy shadow-lg p-8 border-b-2 border-amber text-center"
              >
                <p className="font-display text-amber text-5xl mb-3">{Math.floor(stat.value)}</p>
                <p className="text-slate-300 text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Initiatives */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-12">
          {initiatives.map((initiative) => {
            const Icon = initiative.icon
            return (
              <div
                key={initiative.id}
                className="group relative bg-navy shadow-lg p-6 border-amber border-l-4 overflow-hidden"
              >
                <Icon className="-right-6 -bottom-6 absolute opacity-30 text-slate-700 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 size-32" />
                <div className="z-10 relative">
                  <span className="inline-block bg-amber/10 mb-3 px-3 py-1 font-semibold text-amber text-sm">
                    {initiative.category}
                  </span>
                  <h4 className="mb-3 font-bold text-slate-200 text-xl">{initiative.title}</h4>
                  <p className="mb-4 text-slate-400 text-sm">{initiative.description}</p>
                  <div className="pt-3 border-slate-700 border-t">
                    <p className="font-semibold text-amber text-sm">Impact: {initiative.impact}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="flex md:flex-row flex-col justify-between items-center bg-navy shadow-lg p-8 border-amber border-l-4">
          <div className="mb-6 md:mb-0">
            <h3 className="mb-2 font-bold text-slate-200 text-2xl">
              Join Us in Making a Difference
            </h3>
            <p className="text-slate-400">
              Learn more about our community initiatives and how you can get involved.
            </p>
          </div>
          <Link
            to="/about"
            className="group flex items-center bg-amber shadow-lg px-6 py-3 font-semibold text-navy hover:scale-105 transition duration-200"
          >
            Community Programs
            <ChevronRightIcon className="ml-2 group-hover:translate-x-1 transition-transform duration-200 size-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
