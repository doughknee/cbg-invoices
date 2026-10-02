import { ScrollReveal } from '@/components/ScrollReveal'
import { ContactCTA } from '@/components/sections/ContactCTA'
import { MarketsWeServe } from '@/components/sections/MarketsWeServe'
import {
  ArrowRightIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentIcon,
  CogIcon,
  CubeIcon,
  CurrencyDollarIcon,
  HomeModernIcon,
  SwatchIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/solid'
import { Link, createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import type React from 'react'

type HeroIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>

export const Route = createFileRoute('/services')({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: 'Construction Services | Nashville Commercial Builder - Cambridge' },
      {
        name: 'description',
        content:
          'Commercial, hospitality, industrial, multifamily, and select residential construction services from Cambridge Building Group in Nashville, Tennessee.',
      },
      {
        property: 'og:title',
        content: 'Construction Services | Nashville Commercial Builder - Cambridge',
      },
      {
        property: 'og:description',
        content:
          'Commercial, hospitality, industrial, multifamily, and select residential construction services from Cambridge Building Group in Nashville, Tennessee.',
      },
      { property: 'og:url', content: 'https://cambridgebg.com/services' },
    ],
    links: [{ rel: 'canonical', href: 'https://cambridgebg.com/services' }],
  }),
})

interface ServiceItem {
  id: number
  icon: HeroIcon
  title: string
  description: string
  details: string[]
}

interface AdditionalServiceItem {
  id: number
  icon: HeroIcon
  title: string
  description: string
}

const services: ServiceItem[] = [
  {
    id: 1,
    icon: BuildingOfficeIcon,
    title: 'Commercial Construction',
    description:
      'From office buildings to retail spaces, we deliver commercial properties that balance functionality, aesthetics, and long-term value. Our approach encompasses everything from ground-up construction to tenant improvements.',
    details: [
      'Office Buildings & Corporate Campuses',
      'Light Industrial',
      'Retail & Restaurant Spaces',
      'Medical Facilities & Healthcare Centers',
      'Hospitality & Entertainment Venues',
      'Financial Institutions & Banks',
    ],
  },
  {
    id: 2,
    icon: HomeModernIcon,
    title: 'Luxury Residential',
    description:
      'We create distinctive homes that reflect the unique vision and lifestyle of each client. Our attention to detail and commitment to quality craftsmanship ensures residential spaces that are both beautiful and enduring.',
    details: [
      'Custom Luxury Homes',
      'Executive Estates & Properties',
      'High-End Multi-Family Developments',
      'Vacation & Second Homes',
      'Residential Community Planning',
    ],
  },
  {
    id: 3,
    icon: BuildingLibraryIcon,
    title: 'Historic Renovation',
    description:
      'Our specialized team expertly blends preservation techniques with modern functionality to breathe new life into historic structures while maintaining their architectural integrity and cultural significance.',
    details: [
      'Landmark Building Restoration',
      'Adaptive Reuse Projects',
      'Historical Facade Preservation',
      'Period Detail Reconstruction',
      'Heritage Building Modernization',
    ],
  },
  {
    id: 4,
    icon: WrenchScrewdriverIcon,
    title: 'Design-Build Solutions',
    description:
      'Our integrated design-build approach streamlines the construction process, reducing costs and timelines while maintaining superior quality through collaborative problem-solving and unified vision.',
    details: [
      'Single-Source Project Delivery',
      'Integrated Design & Construction Teams',
      'Early Cost Certainty & Budgeting',
      'Accelerated Project Timelines',
      'Collaborative Problem-Solving',
    ],
  },
  {
    id: 5,
    icon: BuildingStorefrontIcon,
    title: 'Tenant Improvements',
    description:
      'We transform existing commercial spaces to meet the unique needs of businesses, creating environments that enhance productivity, reflect brand identity, and optimize operational efficiency.',
    details: [
      'Office Space Reconfigurations',
      'Retail & Restaurant Buildouts',
      'Commercial Interior Renovations',
      'Workspace Modernization',
      'Brand-Aligned Design Implementation',
    ],
  },
  {
    id: 6,
    icon: CogIcon,
    title: 'Pre-Construction Services',
    description:
      'Our comprehensive pre-construction services include budgeting, scheduling, value engineering, and constructability reviews to identify potential challenges early and establish a solid foundation for project success.',
    details: [
      'Project Feasibility Analysis',
      'Comprehensive Budget Development',
      'Cost Optimization',
      'Schedule Development & Planning',
      'Constructability & Risk Assessment',
    ],
  },
]

const additionalServices: AdditionalServiceItem[] = [
  {
    id: 7,
    icon: SwatchIcon,
    title: 'Sustainable Construction',
    description:
      'Environmentally responsible building practices that reduce operational costs and environmental impact while creating healthier spaces.',
  },
  {
    id: 8,
    icon: BuildingOffice2Icon,
    title: 'Industrial & Manufacturing',
    description:
      'Specialized construction for manufacturing facilities, warehouses, and industrial spaces optimized for operational efficiency.',
  },
  {
    id: 9,
    icon: CubeIcon,
    title: 'Modular & Prefabrication',
    description:
      'Innovative off-site construction methods that improve quality control, reduce waste, and accelerate project timelines.',
  },
  {
    id: 10,
    icon: ClipboardDocumentIcon,
    title: 'Construction Management',
    description:
      'Expert oversight of all aspects of the construction process, ensuring quality, timeliness, and cost-effectiveness.',
  },
]

const processSteps = [
  {
    num: 1,
    title: 'Initial Consultation',
    text: 'We begin by understanding your vision, requirements, and objectives. This collaborative discussion forms the foundation for our partnership.',
  },
  {
    num: 2,
    title: 'Planning & Design',
    text: 'Our team develops detailed plans and designs that align with your goals, timeline, and budget, incorporating your feedback throughout the process.',
  },
  {
    num: 3,
    title: 'Preconstruction',
    text: 'We conduct thorough site assessments, obtain necessary permits, finalize budgets, and establish detailed schedules to prepare for construction.',
  },
  {
    num: 4,
    title: 'Construction',
    text: 'Our Skilled Project Managers and Trade Partners execute the plan with precision, maintaining constant communication and providing regular updates.',
  },
  {
    num: 5,
    title: 'Project Completion',
    text: 'We conduct thorough quality inspections, address any final details, and ensure your complete satisfaction before formal project handover.',
  },
  {
    num: 6,
    title: 'Ongoing Support',
    text: 'Our relationship continues beyond project completion with warranties, maintenance support, and assistance for future needs.',
  },
]

const projectPromises = [
  {
    icon: CalendarDaysIcon,
    title: 'Timeline Transparency',
    text: 'Detailed scheduling with regular updates so you always know where your project stands.',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Budget Certainty',
    text: 'Accurate cost estimates upfront with proactive communication on any changes.',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Single Point of Contact',
    text: 'One dedicated project manager who knows every detail of your build.',
  },
]

function ServicesPage(): React.ReactElement {
  const [activeService, setActiveService] = useState<number | null>(null)

  function toggleService(id: number): void {
    setActiveService(activeService === id ? null : id)
  }

  return (
    <div>
      {/* Page Header */}
      <section className="relative h-[50vh] flex items-end bg-graphite overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-noise" />
        <div className="absolute inset-0 z-0 opacity-15 bg-[url('/services-header.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-graphite via-graphite/60 to-transparent" />
        <div className="relative z-10 px-8 2xl:px-60 pb-12 w-full">
          <motion.p
            initial={{ opacity: 0, transform: 'translateY(20px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
            className="font-display text-amber text-lg tracking-widest uppercase mb-2"
          >
            What We Do
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, transform: 'translateY(20px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
            className="font-display text-5xl md:text-7xl text-stone mb-4"
          >
            Our Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, transform: 'translateY(20px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-xl text-slate-400 max-w-2xl"
          >
            Comprehensive construction solutions tailored to your unique vision and requirements.
          </motion.p>
        </div>
      </section>

      {/* ── LIGHT: Services Overview ──────────── */}
      <div className="slant-bottom">
        <section className="py-section px-8 2xl:px-60 bg-stone bg-dots">
          <div className="py-block mx-auto container">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto text-center mb-14">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-navy mb-6">
                  What We <span className="text-amber">Offer</span>
                </h2>
                <p className="text-lg text-slate-700">
                  Cambridge Building Group provides a full spectrum of construction services, from
                  initial concept and planning through completion and beyond. Our integrated
                  approach ensures seamless project delivery and exceptional results.
                </p>
              </div>
            </ScrollReveal>

            {/* Main Services Accordion */}
            <div className="space-y-8">
              {services.map((service) => {
                const Icon = service.icon
                return (
                  <ScrollReveal key={service.id} delay={service.id * 0.05}>
                    <div className="border-l-2 border-amber pl-6">
                      <button
                        type="button"
                        className="w-full cursor-pointer text-left"
                        onClick={() => toggleService(service.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Icon className="size-6 text-amber mr-4" />
                            <h3 className="text-xl md:text-2xl font-bold text-navy">
                              {service.title}
                            </h3>
                          </div>
                          <ArrowRightIcon
                            className={`size-5 text-amber transition-transform duration-300 shrink-0 ml-4 ${
                              activeService === service.id ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </button>
                      <AnimatePresence initial={false}>
                        {activeService === service.id && (
                          <motion.div
                            key={`service-${service.id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4">
                              <p className="text-slate-700 mb-5 leading-relaxed">
                                {service.description}
                              </p>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {service.details.map((detail) => (
                                  <li key={detail} className="flex items-center">
                                    <span className="w-2 h-2 bg-amber rounded-full mr-3 shrink-0" />
                                    <span className="text-slate-700">{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ── DARK: Additional Expertise ──────────── */}
      <div className="slant-both">
        <section className="py-section px-8 2xl:px-60 bg-graphite bg-grid text-slate-300 relative">
          <div className="absolute inset-0 bg-noise" />
          <div className="relative py-block mx-auto container">
            <ScrollReveal>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-10 text-center">
                Additional <span className="text-amber">Expertise</span>
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {additionalServices.map((service) => {
                const Icon = service.icon
                return (
                  <ScrollReveal key={service.id} delay={service.id * 0.05}>
                    <motion.div
                      whileHover={{
                        y: -4,
                        transition: { type: 'spring', stiffness: 400, damping: 25 },
                      }}
                      className="bg-navy p-6 shadow-lg border-t-4 border-amber h-full"
                    >
                      <div className="bg-amber/10 p-2.5 rounded-full w-fit mb-4">
                        <Icon className="size-6 text-amber" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                      <p className="text-slate-400">{service.description}</p>
                    </motion.div>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ── LIGHT: Markets We Serve ──────────── */}
      <div className="slant-both">
        <MarketsWeServe />
      </div>

      {/* ── DARK: Our Process ──────────── */}
      <div className="slant-both">
        <section className="relative py-section px-8 2xl:px-60 bg-graphite bg-grid text-slate-300">
          <div className="absolute inset-0 bg-noise" />
          <div className="relative py-block mx-auto container">
            <ScrollReveal>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-10 text-center">
                Our <span className="text-amber">Process</span>
              </h2>
            </ScrollReveal>
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[17px] top-0 bottom-0 w-px bg-amber/30" />

                <div className="space-y-10">
                  {processSteps.map((step) => (
                    <ScrollReveal key={step.num} delay={step.num * 0.05}>
                      <div className="relative pl-14">
                        <div className="absolute left-0 top-0 w-9 h-9 bg-amber text-navy rounded-full flex items-center justify-center font-bold text-sm">
                          {step.num}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                        <p className="text-slate-400 leading-relaxed">{step.text}</p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── LIGHT: Project Promise ──────────── */}
      <div className="slant-both">
        <section className="py-section px-8 2xl:px-60 bg-stone bg-dots">
          <div className="py-block mx-auto container">
            <ScrollReveal>
              <div className="text-center mb-10">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-navy mb-4">
                  Our Project <span className="text-amber">Promise</span>
                </h2>
                <p className="text-lg text-slate-700 max-w-2xl mx-auto">
                  When you build with Cambridge, you get more than a contractor &mdash; you get a
                  partner invested in your project&apos;s success.
                </p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {projectPromises.map((promise) => {
                const Icon = promise.icon
                return (
                  <ScrollReveal key={promise.title} delay={0.1}>
                    <div className="border-l-2 border-amber pl-6">
                      <Icon className="size-8 text-amber mb-3" />
                      <h3 className="text-xl font-bold text-navy mb-2">{promise.title}</h3>
                      <p className="text-slate-700">{promise.text}</p>
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>
            <ScrollReveal delay={0.2}>
              <div className="text-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-navy shadow-lg px-8 py-3.5 font-semibold text-stone hover:scale-105 transition duration-200"
                >
                  Start Your Project
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>

      {/* ── DARK: Contact CTA ──────────── */}
      <div className="slant-top">
        <ContactCTA />
      </div>
    </div>
  )
}
