import { ScrollReveal } from '@/components/ScrollReveal'
import { milestones } from '@/data/siteData'
import { scrollToNextSection } from '@/utils/autoScroll'
import { CalendarDateRangeIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { Link } from '@tanstack/react-router'
import { useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

interface TrackRecordProps {
  showButton?: boolean
}

export function TrackRecord({ showButton = false }: TrackRecordProps): React.ReactElement {
  const [years, setYears] = useState(0)
  const [projects, setProjects] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 })

  const yearsTarget = 120
  const projectsTarget = 350
  const duration = 2000

  useEffect(() => {
    if (!isInView) return

    const yearsIncrement = yearsTarget / (duration / 50)
    const projectsIncrement = projectsTarget / (duration / 50)

    const yearsInterval = setInterval(() => {
      setYears((prev) => {
        const next = prev + yearsIncrement
        if (next >= yearsTarget) {
          clearInterval(yearsInterval)
          return yearsTarget
        }
        return next
      })
    }, 50)

    const projectsInterval = setInterval(() => {
      setProjects((prev) => {
        const next = prev + projectsIncrement
        if (next >= projectsTarget) {
          clearInterval(projectsInterval)
          return projectsTarget
        }
        return next
      })
    }, 50)

    return () => {
      clearInterval(yearsInterval)
      clearInterval(projectsInterval)
    }
  }, [isInView])

  const stats = [
    { label: 'Years Combined Experience', value: `${Math.floor(years)}+`, animated: true },
    { label: 'Projects Completed', value: `${Math.floor(projects)}+`, animated: true },
    { label: 'Certifications', value: 'LEED, CPM' },
    { label: 'License Status', value: 'Unlimited' },
  ]

  return (
    <section id="track-record" className="relative bg-stone bg-dots px-8 2xl:px-60 py-section">
      <div ref={sectionRef} className="py-block mx-auto container">
        {/* Section header */}
        <ScrollReveal>
          <div className="mb-12 md:mb-16">
            <h2 className="font-display font-bold text-navy text-5xl mb-4">Our Track Record</h2>
            <p className="max-w-2xl text-lg text-slate-700">
              A decade of delivering on our promises. Our combined knowledge ensures each build
              benefits from time-tested wisdom and innovative approaches.
            </p>
          </div>
        </ScrollReveal>

        {/* Stats bar */}
        <ScrollReveal delay={0.1}>
          <div className="gap-6 md:gap-8 grid grid-cols-2 lg:grid-cols-4 mb-16 md:mb-20">
            {stats.map((stat) => (
              <div key={stat.label} className="border-l-2 border-amber pl-5">
                <p className="font-display text-amber text-4xl md:text-5xl mb-2">{stat.value}</p>
                <p className="text-slate-600 text-sm md:text-base tracking-wide uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Milestones timeline */}
        <ScrollReveal delay={0.15}>
          <h3 className="font-display font-bold text-navy text-3xl mb-8">The Building Blocks</h3>
          <ol className="items-start lg:flex border-s-2 lg:border-none border-amber">
            {milestones.map((milestone) => (
              <li key={milestone.id} className="group relative mb-6 lg:mb-0 cursor-pointer">
                <Link to={milestone.link} className="flex items-center lg:block">
                  <div className="flex items-center -ml-5 mr-2 lg:mr-0 lg:ml-0">
                    <div className="z-10 flex justify-center items-center bg-stone group-hover:bg-amber border-2 border-amber rounded-full ring-8 ring-stone transition duration-200 size-10 shrink-0">
                      <CalendarDateRangeIcon className="text-amber group-hover:text-navy transition duration-200 size-5" />
                    </div>
                    <div className="hidden lg:flex bg-amber/30 w-full h-0.5" />
                  </div>
                  <div className="group-hover:border-amber/50 mt-3 lg:pe-2 mr-2 p-4 border-2 border-transparent transition duration-200">
                    <ChevronRightIcon className="top-8 lg:top-18 right-6 absolute hidden group-hover:block text-navy transition duration-200 size-5" />
                    <h4 className="font-semibold text-navy text-lg">{milestone.title}</h4>
                    <time className="block mb-2 font-normal text-slate-600 text-md italic leading-none">
                      {milestone.year}
                    </time>
                    <p className="font-normal text-slate-700 text-base">{milestone.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </ScrollReveal>

        {showButton && (
          <div className="flex justify-center items-center mt-12">
            <button
              type="button"
              onClick={() => scrollToNextSection('services-provided')}
              className="group inline-flex items-center gap-2 bg-navy shadow-lg px-6 py-2.5 border-2 border-navy font-semibold text-slate-300 hover:scale-105 transition duration-200 cursor-pointer"
            >
              Our Services
              <ChevronRightIcon className="group-hover:rotate-90 transition duration-200 size-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
