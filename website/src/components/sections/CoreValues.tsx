import { ScrollReveal } from '@/components/ScrollReveal'
import { coreValues } from '@/data/siteData'
import { scrollToNextSection } from '@/utils/autoScroll'
import { ChevronRightIcon } from '@heroicons/react/24/solid'
import { motion, useMotionTemplate, useSpring, useTransform, useVelocity } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import type { MotionValue } from 'motion/react'
import type React from 'react'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VIEW_GAP = 16
const SPRING_CONFIG = { stiffness: 300, damping: 35 } as const
const HEIGHT_SPRING = { stiffness: 200, damping: 30 } as const
const INDICATOR_SPRING = { stiffness: 600, damping: 40 } as const

// ---------------------------------------------------------------------------
// ValueContent — slides vertically within the static card
// ---------------------------------------------------------------------------

interface ValueContentProps {
  value: (typeof coreValues)[number]
  index: number
  y: MotionValue<number>
  containerHeight: number
}

function ValueContent({ value, index, y, containerHeight }: ValueContentProps): React.ReactElement {
  const Icon = value.icon
  const viewOffset = index * (containerHeight + VIEW_GAP)

  const distance = useTransform(y, (latest) => viewOffset + latest)
  const opacity = useTransform(distance, [-containerHeight, 0, containerHeight], [0, 1, 0])

  const yVelocity = useVelocity(y)
  const blurValue = useTransform(yVelocity, [-2000, 0, 2000], [4, 0, 4])
  const filter = useMotionTemplate`blur(${blurValue}px)`

  return (
    <motion.div
      className="absolute top-0 left-0 w-full p-8"
      style={{
        y: useTransform(y, (latest) => viewOffset + latest),
        opacity,
        filter,
      }}
    >
      {/* Watermark icon */}
      <Icon className="-right-10 -bottom-10 absolute text-slate-800 opacity-[0.06] size-60" />

      <div className="z-10 relative">
        <div className="flex items-center mb-6">
          <Icon className="mr-4 text-amber size-10" />
          <div>
            <h3 className="font-bold text-3xl">{value.title}</h3>
            <p className="text-slate-400 text-xl italic">{value.tagline}</p>
          </div>
        </div>

        <div
          className="text-lg leading-relaxed"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted static content from data file
          dangerouslySetInnerHTML={{ __html: value.description }}
        />

        <div className="mt-8 pt-6 border-slate-700 border-t">
          <h4 className="mb-3 font-semibold text-xl">How We Apply This Value:</h4>
          <div className="flex items-start">
            <span className="bg-amber/20 mr-3 p-1 rounded-full">
              <ChevronRightIcon className="text-amber size-4" />
            </span>
            <p className="text-slate-300">
              {value.application ||
                'This core value guides our approach to every project, influencing how we interact with clients, collaborate with partners, and deliver our services.'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// CoreValues
// ---------------------------------------------------------------------------

interface CoreValuesProps {
  showButton?: boolean
}

export function CoreValues({ showButton = false }: CoreValuesProps): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0)
  const innerRef = useRef<HTMLDivElement>(null)
  const viewRefs = useRef<(HTMLDivElement | null)[]>([])
  const [viewHeights, setViewHeights] = useState<number[]>([])

  // Measure view heights after mount and on resize
  useEffect(() => {
    const el = innerRef.current
    if (!el) return

    let rafId = 0

    const measure = (): void => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const heights = viewRefs.current.map((ref) => ref?.getBoundingClientRect().height ?? 0)
        setViewHeights(heights)
      })
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(el)

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  // Use the largest view height as the "page size" for the y spring
  const maxHeight = Math.max(...viewHeights, 200)

  // Spring-driven y position
  const y = useSpring(0, SPRING_CONFIG)

  useEffect(() => {
    if (maxHeight <= 200) return
    y.set(-activeIndex * (maxHeight + VIEW_GAP))
  }, [activeIndex, maxHeight, y])

  // Animate container height — MotionValue applied directly, no React re-renders
  const currentHeight = viewHeights[activeIndex] ?? 300
  const animatedHeight = useSpring(currentHeight, HEIGHT_SPRING)

  useEffect(() => {
    animatedHeight.set(currentHeight)
  }, [currentHeight, animatedHeight])

  return (
    <section
      id="core-values"
      className="relative bg-graphite px-8 2xl:px-60 py-section text-slate-300 bg-grid"
    >
      <div className="absolute inset-0 bg-noise" />
      <div className="relative py-block mx-auto container">
        <ScrollReveal>
          <div className="mx-auto mb-12 w-full md:w-1/3 text-left md:text-center">
            <h2 className="font-display font-bold text-5xl mb-4">Our Core Values</h2>
            <p className="text-lg text-slate-400">
              The guiding principles that shape our work and define our legacy.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="gap-8 grid grid-cols-1 lg:grid-cols-5">
            {/* Values Navigation - Sidebar with layoutId sliding indicator */}
            <div className="lg:col-span-1 flex flex-col space-y-2">
              {coreValues.map((value, index) => {
                const Icon = value.icon
                const isActive = activeIndex === index
                return (
                  <button
                    type="button"
                    key={`nav-${value.id}`}
                    onClick={() => setActiveIndex(index)}
                    className="relative flex items-center p-4 text-left transition-colors duration-200 cursor-pointer"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="cv-tab-indicator"
                        className="absolute inset-0 bg-navy border-l-4 border-amber shadow-md"
                        transition={{ type: 'spring', ...INDICATOR_SPRING }}
                      />
                    )}
                    <Icon
                      className={`relative z-10 size-5 mr-3 ${
                        isActive ? 'text-amber' : 'text-slate-500'
                      }`}
                    />
                    <span
                      className={`relative z-10 font-semibold ${
                        isActive ? 'text-slate-200' : 'text-slate-400'
                      }`}
                    >
                      {value.title}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Static card shell — only inner content slides vertically */}
            <div className="lg:col-span-4">
              <div className="relative bg-navy shadow-lg border-amber border-l-4 overflow-hidden">
                <motion.div
                  ref={innerRef}
                  className="relative overflow-hidden"
                  style={{ height: animatedHeight }}
                >
                  {/* Hidden clones for height measurement */}
                  {coreValues.map((value, index) => (
                    <div
                      key={`measure-${value.id}`}
                      ref={(el) => {
                        viewRefs.current[index] = el
                      }}
                      className="p-8"
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
                          <value.icon className="mr-4 text-amber size-10" />
                          <div>
                            <h3 className="font-bold text-3xl">{value.title}</h3>
                            <p className="text-slate-400 text-xl italic">{value.tagline}</p>
                          </div>
                        </div>
                        <div
                          className="text-lg leading-relaxed"
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted static content from data file
                          dangerouslySetInnerHTML={{ __html: value.description }}
                        />
                        <div className="mt-8 pt-6 border-slate-700 border-t">
                          <h4 className="mb-3 font-semibold text-xl">How We Apply This Value:</h4>
                          <div className="flex items-start">
                            <span className="bg-amber/20 mr-3 p-1 rounded-full">
                              <ChevronRightIcon className="text-amber size-4" />
                            </span>
                            <p className="text-slate-300">
                              {value.application ||
                                'This core value guides our approach to every project.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Visible sliding content views — vertical */}
                  {maxHeight > 200 &&
                    coreValues.map((value, index) => (
                      <ValueContent
                        key={value.id}
                        value={value}
                        index={index}
                        y={y}
                        containerHeight={maxHeight}
                      />
                    ))}
                </motion.div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {showButton && (
          <div className="flex justify-center items-center mt-12">
            <button
              type="button"
              onClick={() => scrollToNextSection('track-record')}
              className="group inline-flex items-center gap-2 bg-amber shadow-lg px-6 py-2.5 font-semibold text-navy hover:scale-105 transition duration-200 cursor-pointer"
            >
              Track Record
              <ChevronRightIcon className="group-hover:rotate-90 transition duration-200 size-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
