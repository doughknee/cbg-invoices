import { ScrollReveal } from '@/components/ScrollReveal'
import { CommunityOutreach } from '@/components/sections/CommunityOutreach'
import { ContactCTA } from '@/components/sections/ContactCTA'
import { LeadershipBios } from '@/components/sections/LeadershipBios'
import { milestones, safetyMetrics } from '@/data/siteData'
import {
  CalendarDateRangeIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/solid'
import { createFileRoute } from '@tanstack/react-router'
import { motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: 'About Cambridge Building Group | Nashville General Contractor' },
      {
        name: 'description',
        content:
          'Learn about Cambridge Building Group — our mission, leadership team, core values, community impact, and over a decade of Nashville construction excellence.',
      },
      {
        property: 'og:title',
        content: 'About Cambridge Building Group | Nashville General Contractor',
      },
      {
        property: 'og:description',
        content:
          'Learn about Cambridge Building Group — our mission, leadership team, core values, community impact, and over a decade of Nashville construction excellence.',
      },
      { property: 'og:url', content: 'https://cambridgebg.com/about' },
    ],
    links: [{ rel: 'canonical', href: 'https://cambridgebg.com/about' }],
  }),
})

const missionVision = {
  mission:
    'To transform the built environment through exceptional craftsmanship, innovative solutions, and unwavering integrity.',
  vision:
    'To be the most trusted name in construction, recognized for creating spaces that inspire, endure, and enhance the communities we serve.',
}

const approachPillars = [
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Communication First',
    description:
      'We maintain transparent, timely dialogue with clients, partners, and trade teams from the first handshake through final walkthrough. No surprises, no guesswork \u2014 just clear expectations and consistent follow-through.',
    detail:
      'Our project managers provide regular updates, address concerns promptly, and keep all stakeholders aligned so decisions happen faster and problems get solved before they become costly.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Built on Integrity',
    description:
      'Honest pricing. Realistic timelines. Straightforward answers. We built this company on the principle that doing the right thing \u2014 even when nobody is watching \u2014 is what separates good builders from great ones.',
    detail:
      'That means we will tell you if a specification needs adjusting, if a schedule is at risk, or if there is a better way to achieve what you are after.',
  },
  {
    icon: WrenchScrewdriverIcon,
    title: 'Relentless Standards',
    description:
      'Quality is not a phase of the project \u2014 it is the entire project. From foundation to finish, every detail is held to the same uncompromising standard regardless of project size.',
    detail:
      'We leverage RedTeam Go for bid management, Microsoft Project for scheduling, and Bluebeam Revu for plan coordination to ensure nothing falls through the cracks.',
  },
]

const byTheNumbers = [
  { target: 10, suffix: '+', label: 'Years Building Nashville', duration: 1500 },
  { target: 80, suffix: '+', label: 'Years Combined Leadership', duration: 2000 },
  { target: 350, suffix: '+', label: 'Projects Completed', duration: 2500 },
  { target: 40, suffix: '+', label: 'Homes Rebuilt for Neighbors', duration: 1800 },
]

const principles = [
  {
    title: 'People First',
    text: 'We prioritize the well-being, development, and safety of our team members and everyone we work with.',
  },
  {
    title: 'Collaborative Spirit',
    text: 'We believe in the power of teamwork and partnership to achieve exceptional results.',
  },
  {
    title: 'Continuous Learning',
    text: 'We embrace opportunities to learn, grow, and evolve both as individuals and as an organization.',
  },
  {
    title: 'Community Connection',
    text: 'We actively engage with and contribute to the communities where we live and work.',
  },
]

function AnimatedCounter({
  target,
  suffix,
  duration,
}: { target: number; suffix: string; duration: number }): React.ReactElement {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  // biome-ignore lint/correctness/useExhaustiveDependencies: animation runs once when in view
  useEffect(() => {
    if (!isInView) return

    const increment = target / (duration / 30)
    const interval = setInterval(() => {
      setValue((prev) => {
        const next = prev + increment
        if (next >= target) {
          clearInterval(interval)
          return target
        }
        return next
      })
    }, 30)

    return () => clearInterval(interval)
  }, [isInView])

  return (
    <div ref={ref} className="font-display text-amber text-4xl md:text-5xl lg:text-6xl">
      {Math.floor(value)}
      {suffix}
    </div>
  )
}

function AboutPage(): React.ReactElement {
  return (
    <div>
      {/* Hero Header */}
      <section className="relative h-[50vh] flex items-end bg-graphite overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-noise" />
        <div className="absolute inset-0 z-0 opacity-15 bg-[url('/about-header.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-graphite via-graphite/60 to-transparent" />
        <div className="relative z-10 px-8 2xl:px-60 pb-12 w-full">
          <motion.p
            initial={{ opacity: 0, transform: 'translateY(20px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
            className="font-display text-amber text-lg tracking-widest uppercase mb-2"
          >
            Our Story
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, transform: 'translateY(20px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
            className="font-display text-5xl md:text-7xl text-stone mb-4"
          >
            About Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, transform: 'translateY(20px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-xl text-slate-400 max-w-2xl"
          >
            Building excellence through innovation, integrity, and dedicated craftsmanship since
            2015.
          </motion.p>
        </div>
      </section>

      {/* ── LIGHT: Mission & Vision + Our Approach ──────────── */}
      <div className="slant-bottom">
        <section className="bg-stone bg-dots px-8 2xl:px-60 py-section">
          <div className="py-block mx-auto container">
            {/* Mission & Vision */}
            <ScrollReveal>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-navy mb-8">
                Mission &amp; <span className="text-amber">Vision</span>
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
              <ScrollReveal delay={0.1}>
                <div className="border-l-2 border-amber pl-6">
                  <h3 className="text-xl font-semibold text-navy mb-3">Mission</h3>
                  <p className="text-slate-700 leading-relaxed">{missionVision.mission}</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <div className="border-l-2 border-amber pl-6">
                  <h3 className="text-xl font-semibold text-navy mb-3">Vision</h3>
                  <p className="text-slate-700 leading-relaxed">{missionVision.vision}</p>
                </div>
              </ScrollReveal>
            </div>

            {/* Our Approach */}
            <ScrollReveal>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-navy mb-4">
                Our <span className="text-amber">Approach</span>
              </h2>
              <p className="text-slate-700 max-w-2xl mb-8">
                Three principles guide every project we take on. They are not marketing language
                &mdash; they are how we run our business, every day, on every job site.
              </p>
            </ScrollReveal>
            <div className="space-y-10">
              {approachPillars.map((pillar, index) => {
                const Icon = pillar.icon
                return (
                  <ScrollReveal key={pillar.title} delay={0.1 + index * 0.08}>
                    <div className="border-l-2 border-amber pl-6">
                      <div className="flex items-center mb-3">
                        <Icon className="size-5 text-amber mr-3" />
                        <h3 className="font-bold text-navy text-lg">{pillar.title}</h3>
                      </div>
                      <p className="text-slate-700 leading-relaxed mb-2">{pillar.description}</p>
                      <p className="text-slate-600 leading-relaxed">{pillar.detail}</p>
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ── DARK: Our Journey (Numbers + Milestones unified) ──────────── */}
      <div className="slant-both">
        <section className="relative bg-graphite bg-grid text-slate-300 px-8 2xl:px-60 py-section">
          <div className="absolute inset-0 bg-noise" />
          <div className="relative py-block mx-auto container">
            <ScrollReveal>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Our <span className="text-amber">Journey</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mb-10">
                A decade of growth, hundreds of projects, and a team that keeps raising the bar.
              </p>
            </ScrollReveal>

            {/* Stat band — ambient counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
              {byTheNumbers.map((stat) => (
                <ScrollReveal key={stat.label}>
                  <div className="bg-navy p-6 border-b-2 border-amber text-center">
                    <AnimatedCounter
                      target={stat.target}
                      suffix={stat.suffix}
                      duration={stat.duration}
                    />
                    <p className="mt-2 text-slate-400 text-xs md:text-sm uppercase tracking-wide">
                      {stat.label}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Milestones Timeline */}
            <ScrollReveal delay={0.1}>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-600 lg:hidden" />
                <div className="hidden lg:block absolute top-5 left-0 right-0 h-px bg-slate-600" />

                <ol className="lg:flex lg:gap-6">
                  {milestones.map((milestone) => (
                    <li
                      key={milestone.id}
                      className="relative mb-10 lg:mb-0 lg:flex-1 pl-14 lg:pl-0"
                    >
                      <div className="absolute left-1 lg:static flex items-center lg:mb-4">
                        <div className="z-10 flex items-center justify-center size-9 rounded-full bg-graphite border-2 border-amber shrink-0">
                          <CalendarDateRangeIcon className="size-4 text-amber" />
                        </div>
                        <div className="hidden lg:block flex-1 h-px bg-slate-600 ml-3" />
                      </div>
                      <div className="bg-navy p-5 border-amber border-l-4 lg:border-l-0 lg:border-t-4">
                        <time className="block mb-1 font-display text-amber text-lg">
                          {milestone.year}
                        </time>
                        <h3 className="text-base font-semibold mb-2">{milestone.title}</h3>
                        <p className="text-slate-400 leading-relaxed">{milestone.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>

      {/* ── LIGHT: Culture & Safety ──────────── */}
      <div className="slant-both">
        <section className="bg-stone bg-dots px-8 2xl:px-60 py-section">
          <div className="py-block mx-auto container max-w-4xl">
            <ScrollReveal>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-navy mb-6">
                Our <span className="text-amber">Culture</span>
              </h2>
              <div className="space-y-5 mb-10">
                <p className="text-slate-700 leading-relaxed">
                  Our team combines nearly a century of collective industry knowledge with a genuine
                  desire to build something that matters &mdash; for our clients, for Nashville, and
                  for the communities that trust us with their most important projects.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  We foster an environment where innovation thrives, ideas are valued, and
                  continuous improvement is pursued. Every team member is empowered to contribute
                  their unique perspective &mdash; because the best buildings are built by people
                  who care about the outcome.
                </p>
              </div>
            </ScrollReveal>

            {/* Principles — simple list, no card */}
            <ScrollReveal delay={0.1}>
              <ul className="space-y-5 mb-12">
                {principles.map((principle) => (
                  <li key={principle.title} className="border-l-2 border-amber pl-5">
                    <h4 className="font-semibold text-navy mb-1">{principle.title}</h4>
                    <p className="text-slate-600 leading-relaxed">{principle.text}</p>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            {/* Safety — inline within the light section */}
            <ScrollReveal delay={0.15}>
              <div className="flex items-center mb-5">
                <ShieldCheckIcon className="size-6 text-amber mr-3" />
                <h3 className="font-display font-bold text-navy text-xl">
                  Safety Is Culture, Not a Department
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {safetyMetrics.map((metric) => (
                  <div key={metric.id} className="border-l-2 border-amber pl-4 py-1">
                    <p className="font-display text-amber text-2xl">{metric.value}</p>
                    <p className="text-slate-600 text-xs uppercase tracking-wide">{metric.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>

      {/* ── DARK: Community Impact ──────────── */}
      <div className="slant-both">
        <CommunityOutreach variant="dark" />
      </div>

      {/* ── LIGHT: Leadership ──────────── */}
      <div className="slant-both">
        <LeadershipBios />
      </div>

      {/* ── DARK: Contact CTA ──────────── */}
      <div className="slant-top">
        <ContactCTA />
      </div>
    </div>
  )
}
