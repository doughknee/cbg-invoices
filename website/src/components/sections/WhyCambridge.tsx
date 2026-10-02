import { ScrollReveal } from '@/components/ScrollReveal'
import { advantages, safetyMetrics, safetyPractices } from '@/data/siteData'
import { scrollToNextSection } from '@/utils/autoScroll'
import { ChevronRightIcon, ShieldCheckIcon } from '@heroicons/react/24/solid'
import { motion, useMotionTemplate, useSpring, useTransform, useVelocity } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import type { MotionValue } from 'motion/react'
import type React from 'react'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VIEW_GAP = 20
const SPRING_CONFIG = { stiffness: 300, damping: 35 } as const
const HEIGHT_SPRING = { stiffness: 200, damping: 30 } as const
const INDICATOR_SPRING = { stiffness: 600, damping: 40 } as const

// ---------------------------------------------------------------------------
// AdvantageContent — the inner content that slides within the static card
// ---------------------------------------------------------------------------

interface AdvantageContentProps {
  advantage: (typeof advantages)[number]
  index: number
  x: MotionValue<number>
  containerWidth: number
}

function AdvantageContent({
  advantage,
  index,
  x,
  containerWidth,
}: AdvantageContentProps): React.ReactElement {
  const Icon = advantage.icon
  const viewOffset = index * (containerWidth + VIEW_GAP)

  const distance = useTransform(x, (latest) => viewOffset + latest)
  const opacity = useTransform(distance, [-containerWidth, 0, containerWidth], [0, 1, 0])

  const xVelocity = useVelocity(x)
  const blurValue = useTransform(xVelocity, [-2000, 0, 2000], [4, 0, 4])
  const filter = useMotionTemplate`blur(${blurValue}px)`

  return (
    <motion.div
      className="absolute top-0 left-0 w-full p-8 md:p-10"
      style={{
        x: useTransform(x, (latest) => viewOffset + latest),
        opacity,
        filter,
      }}
    >
      {/* Watermark icon — clips to card overflow */}
      <Icon className="-right-6 -bottom-6 absolute text-slate-800 opacity-[0.06] size-48" />
      <div className="z-10 relative">
        <div className="flex items-center mb-6">
          <Icon className="mr-4 text-amber size-8" />
          <h3 className="font-bold text-2xl">{advantage.title}</h3>
        </div>
        <p className="text-lg leading-relaxed max-w-3xl">{advantage.description}</p>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// WhyCambridge
// ---------------------------------------------------------------------------

interface WhyCambridgeProps {
  showButton?: boolean
}

export function WhyCambridge({ showButton = false }: WhyCambridgeProps): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0)
  const innerRef = useRef<HTMLDivElement>(null)
  const viewRefs = useRef<(HTMLDivElement | null)[]>([])
  const [innerWidth, setInnerWidth] = useState(0)
  const [viewHeights, setViewHeights] = useState<number[]>([])

  // Measure inner content area width
  useEffect(() => {
    const el = innerRef.current
    if (!el) return

    const measure = (): void => {
      setInnerWidth(el.getBoundingClientRect().width)
    }
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Measure view heights
  useEffect(() => {
    if (innerWidth === 0) return
    const raf = requestAnimationFrame(() => {
      const heights = viewRefs.current.map((ref) => ref?.getBoundingClientRect().height ?? 0)
      setViewHeights(heights)
    })
    return () => cancelAnimationFrame(raf)
  }, [innerWidth])

  // Spring-driven x position
  const x = useSpring(0, SPRING_CONFIG)

  useEffect(() => {
    if (innerWidth === 0) return
    x.set(-activeIndex * (innerWidth + VIEW_GAP))
  }, [activeIndex, innerWidth, x])

  // Animate content area height — MotionValue applied directly, no React re-renders
  const currentHeight = viewHeights[activeIndex] ?? 120
  const contentHeight = useSpring(currentHeight, HEIGHT_SPRING)

  useEffect(() => {
    contentHeight.set(currentHeight)
  }, [currentHeight, contentHeight])

  return (
    <section
      id="why-cambridge"
      className="relative bg-graphite px-8 2xl:px-60 py-section text-slate-300 bg-grid"
    >
      <div className="absolute inset-0 bg-noise" />
      <div className="relative py-block mx-auto container">
        {/* Header */}
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div className="mb-6 md:mb-0 w-full md:w-1/2">
              <h2 className="font-display font-bold text-5xl mb-4">
                Why <span className="text-amber">Cambridge</span>
              </h2>
              <p className="text-lg text-slate-400">
                What sets Cambridge Building Group apart is our unwavering commitment to excellence,
                innovation, and client satisfaction.
              </p>
            </div>
            {showButton && (
              <button
                type="button"
                onClick={() => scrollToNextSection('leadership')}
                className="group inline-flex items-center gap-2 bg-amber shadow-lg px-6 py-2.5 font-semibold text-navy hover:scale-105 transition duration-200 cursor-pointer"
              >
                Leadership
                <ChevronRightIcon className="group-hover:rotate-90 transition duration-200 size-4" />
              </button>
            )}
          </div>
        </ScrollReveal>

        {/* Advantage tabs with layoutId sliding indicator */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap gap-2 mb-8">
            {advantages.map((adv, index) => {
              const Icon = adv.icon
              const isActive = activeIndex === index
              return (
                <button
                  type="button"
                  key={adv.id}
                  onClick={() => setActiveIndex(index)}
                  className="relative inline-flex items-center gap-2 py-2.5 px-4 transition-colors duration-200 cursor-pointer border border-transparent"
                >
                  {isActive && (
                    <motion.span
                      layoutId="wc-tab-indicator"
                      className="absolute inset-0 bg-amber/10 border border-amber"
                      transition={{ type: 'spring', ...INDICATOR_SPRING }}
                    />
                  )}
                  <span
                    className={`relative z-10 inline-flex items-center gap-2 ${
                      isActive ? 'text-amber font-semibold' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    {adv.title}
                  </span>
                </button>
              )
            })}
          </div>
        </ScrollReveal>

        {/* Static card shell — only inner content slides */}
        <ScrollReveal delay={0.2}>
          <div className="bg-navy shadow-lg border-amber border-l-4 relative overflow-hidden">
            <motion.div
              ref={innerRef}
              className="relative overflow-hidden"
              style={{ height: contentHeight }}
            >
              {/* Hidden clones for height measurement (content only, no card padding) */}
              {advantages.map((adv, index) => (
                <div
                  key={`measure-${adv.id}`}
                  ref={(el) => {
                    viewRefs.current[index] = el
                  }}
                  className="p-8 md:p-10"
                  style={{
                    visibility: 'hidden',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    pointerEvents: 'none',
                  }}
                >
                  <div className="relative">
                    <div className="flex items-center mb-6">
                      <adv.icon className="mr-4 text-amber size-8" />
                      <h3 className="font-bold text-2xl">{adv.title}</h3>
                    </div>
                    <p className="text-lg leading-relaxed max-w-3xl">{adv.description}</p>
                  </div>
                </div>
              ))}

              {/* Visible sliding content views */}
              {innerWidth > 0 &&
                advantages.map((adv, index) => (
                  <AdvantageContent
                    key={adv.id}
                    advantage={adv}
                    index={index}
                    x={x}
                    containerWidth={innerWidth}
                  />
                ))}
            </motion.div>
          </div>
        </ScrollReveal>

        {/* Safety Excellence — always visible, separate from tabs */}
        <ScrollReveal delay={0.25}>
          <div className="mt-12">
            <div className="flex items-center mb-8">
              <ShieldCheckIcon className="mr-4 text-amber size-8" />
              <h3 className="font-display font-bold text-3xl">Safety Excellence</h3>
            </div>
            <p className="text-lg leading-relaxed max-w-3xl mb-8 text-slate-400">
              Safety isn&apos;t just a priority &mdash; it&apos;s a core value ingrained in every
              aspect of our operations. We maintain an unwavering commitment to creating safe work
              environments for our team, clients, and communities.
            </p>

            {/* Metrics */}
            <div className="gap-4 grid grid-cols-2 md:grid-cols-4 mb-8">
              {safetyMetrics.map((metric) => (
                <div key={metric.id} className="bg-navy p-5 border-b-2 border-amber text-center">
                  <p className="font-bold text-amber text-2xl mb-1">{metric.value}</p>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">{metric.label}</p>
                </div>
              ))}
            </div>

            {/* Practices */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2 mb-8">
              {safetyPractices.slice(0, 4).map((practice) => (
                <div key={practice.id} className="bg-navy p-5">
                  <h4 className="font-semibold mb-1">{practice.title}</h4>
                  <p className="text-slate-400 text-sm">{practice.description}</p>
                </div>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="pl-5 border-amber border-l-2 text-slate-400 italic">
              &ldquo;Our safety record is the result of rigorous standards, continuous improvement,
              and a culture where every team member prioritizes safety above all else.&rdquo;
              <footer className="mt-2 text-sm not-italic text-slate-400">
                &mdash; Terry Gilley, Founder &amp; President
              </footer>
            </blockquote>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
