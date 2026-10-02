import { scrollToNextSection } from '@/utils/autoScroll'
import { ChevronDownIcon, DocumentCheckIcon } from '@heroicons/react/24/solid'
import { Link } from '@tanstack/react-router'
import { motion, useScroll, useTransform } from 'motion/react'
import { useState } from 'react'

interface HomeHeroProps {
  showButton?: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren' as const,
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, transform: 'translateY(24px)' },
  visible: {
    opacity: 1,
    transform: 'translateY(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const statsItemVariants = {
  hidden: { opacity: 0, transform: 'translateY(16px)' },
  visible: {
    opacity: 1,
    transform: 'translateY(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function HomeHero({ showButton: _showButton = false }: HomeHeroProps): React.ReactElement {
  const [skylineVisible, setSkylineVisible] = useState(false)
  const { scrollY } = useScroll()
  const parallaxY = useTransform(scrollY, (v) => -v * 0.3)

  const stats = [
    { value: 'Est. 2015', label: 'Nashville, TN' },
    { value: '120+', label: 'Years Combined Experience' },
    { value: '350+', label: 'Projects Completed' },
  ]

  return (
    <section>
      <div className="relative flex justify-center items-center min-h-[calc(100dvh-5rem)] text-stone">
        {/* Dark background — constrained to the hero area */}
        <div className="absolute inset-0 bg-graphite bg-grid overflow-hidden">
          <div className="absolute inset-0 bg-noise" />
        </div>

        {/* Nashville skyline — blueprint tracing, fades out toward center */}
        <motion.div
          className={`absolute right-0 bottom-0 left-0 z-[1] pointer-events-none transition-all duration-1000 ease-out ${
            skylineVisible ? 'opacity-100 translate-y-[35%]' : 'opacity-0 translate-y-[40%]'
          }`}
          style={{
            y: parallaxY,
            maskImage:
              'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.08) 80%)',
            WebkitMaskImage:
              'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.08) 80%)',
          }}
        >
          <img
            src="/nashville-skyline.svg"
            alt=""
            className="w-full h-auto opacity-[0.25]"
            style={{
              filter: 'brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(5deg) contrast(1.5)',
            }}
            onLoad={() => setSkylineVisible(true)}
          />
        </motion.div>

        {/* Main content */}
        <motion.div
          className="z-10 relative flex flex-col items-center pt-6 pb-20 md:pb-28 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo */}
          <motion.img
            src="/cbg-gear-logo-stone.svg"
            alt="Cambridge Building Group"
            className="mb-4 md:mb-6 w-[160px] sm:w-[200px] md:w-[280px] lg:w-[340px] opacity-80"
            variants={itemVariants}
          />

          {/* Headline */}
          <motion.h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight"
            variants={itemVariants}
          >
            Building Nashville&rsquo;s <span className="text-amber">Future</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="mt-4 max-w-lg text-lg text-slate-400 md:text-xl"
            variants={itemVariants}
          >
            Commercial construction built on communication, integrity, and dedicated craftsmanship.
          </motion.p>

          {/* Stats strip */}
          <motion.div
            className="gap-4 md:gap-10 grid grid-cols-3 mt-8 md:mt-12"
            variants={itemVariants}
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} className="text-center" variants={statsItemVariants}>
                <div className="font-display text-2xl text-amber md:text-3xl lg:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-slate-400 text-xs md:text-sm tracking-wide uppercase">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="flex flex-col gap-4 sm:flex-row mt-8 md:mt-12"
            variants={itemVariants}
          >
            <button
              type="button"
              onClick={() => scrollToNextSection('who-is-cambridge-construction')}
              className="inline-flex items-center gap-2 bg-amber hover:bg-amber/90 px-8 py-3.5 font-semibold text-navy transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              Learn More
              <ChevronDownIcon className="size-4" />
            </button>
            <Link
              to="/contact"
              className="flex justify-center items-center border-2 border-stone/30 hover:border-amber px-8 py-3.5 font-semibold text-stone hover:text-amber transition-all duration-200"
            >
              <DocumentCheckIcon className="mr-2 size-4" />
              Free Quote
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="bottom-8 z-10 absolute">
          <button
            type="button"
            onClick={() => scrollToNextSection('who-is-cambridge-construction')}
            className="flex flex-col items-center gap-2 p-2 text-slate-400 hover:text-amber transition-colors cursor-pointer"
            aria-label="Scroll to content"
          >
            <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
            <ChevronDownIcon className="animate-scroll-pulse size-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
