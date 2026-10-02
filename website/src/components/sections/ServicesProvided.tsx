import { ScrollReveal } from '@/components/ScrollReveal'
import { services } from '@/data/siteData'
import { scrollToNextSection } from '@/utils/autoScroll'
import { ChevronRightIcon } from '@heroicons/react/24/solid'
import { motion } from 'motion/react'
import { useState } from 'react'

interface ServicesProvidedProps {
  showButton?: boolean
}

export function ServicesProvided({
  showButton = false,
}: ServicesProvidedProps): React.ReactElement {
  const [hoveredService, setHoveredService] = useState<number | null>(null)

  return (
    <section
      id="services-provided"
      className="relative bg-graphite px-8 2xl:px-60 py-section text-slate-300 bg-grid"
    >
      <div className="absolute inset-0 bg-noise" />
      <div className="relative py-block mx-auto container">
        <ScrollReveal>
          <div className="mb-12 w-full md:w-1/2">
            <h2 className="font-display font-bold text-5xl mb-4">Services Provided</h2>
            <p className="mb-6 text-slate-400 text-lg">
              Cambridge Building Group offers a comprehensive suite of construction services
              tailored to meet the diverse needs of our clients. From concept to completion, we
              apply our expertise at every stage of the building process.
            </p>
            {showButton && (
              <button
                type="button"
                onClick={() => scrollToNextSection('markets-we-serve')}
                className="group inline-flex items-center gap-2 bg-amber shadow-lg px-6 py-2.5 font-semibold text-navy hover:scale-105 transition duration-200 cursor-pointer"
              >
                Markets We Serve
                <ChevronRightIcon className="group-hover:rotate-90 transition duration-200 size-4" />
              </button>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={service.id}
                  whileHover={{
                    y: -4,
                    transition: { type: 'spring', stiffness: 400, damping: 25 },
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative overflow-hidden bg-navy shadow-md transition-colors duration-300 ${
                    hoveredService === service.id
                      ? 'border-t-4 border-amber'
                      : 'border-t-4 border-slate-600'
                  }`}
                  onMouseEnter={() => setHoveredService(service.id)}
                  onMouseLeave={() => setHoveredService(null)}
                >
                  <div className="z-10 relative p-6 h-full">
                    <div className="bg-amber/10 mb-4 p-3 rounded-full w-fit">
                      <Icon className="text-amber size-8" />
                    </div>
                    <h3 className="mb-3 font-bold text-slate-200 text-2xl">{service.title}</h3>
                    <p className="text-slate-400">{service.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
