import { ScrollReveal } from '@/components/ScrollReveal'
import { scrollToNextSection } from '@/utils/autoScroll'
import { ChevronRightIcon } from '@heroicons/react/24/solid'

interface WhoIsCCProps {
  showButton?: boolean
}

export function WhoIsCC({ showButton = false }: WhoIsCCProps): React.ReactElement {
  return (
    <section className="relative px-8 2xl:px-60 py-section" id="who-is-cambridge-construction">
      <div className="mx-auto py-block container">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <ScrollReveal direction="left" className="w-full lg:w-1/2">
            <img
              src="/cambridge-team.jpg"
              alt="Cambridge Building Group Team"
              className="shadow-lg rounded-sm w-full"
            />
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.15} className="w-full lg:w-1/2">
            <h2 className="font-display font-bold text-navy text-4xl md:text-5xl mb-6">
              <span className="text-amber italic">Who is</span> Cambridge Building Group?
            </h2>
            <div className="pl-5 border-amber border-l-2">
              <p className="mb-4 text-slate-700 text-lg leading-relaxed">
                Cambridge Building Group is a premier building company renowned for its innovative
                designs and unwavering commitment to quality. With decades of combined experience,
                our team of experts transforms visions into structures that inspire and endure.
              </p>
              <p className="mb-6 text-slate-700 text-lg leading-relaxed">
                From modern commercial developments to timeless residential masterpieces, we
                prioritize safety, sustainability, and community enrichment. Our approach blends
                cutting&#8209;edge technology with traditional craftsmanship to deliver projects
                that not only meet but exceed expectations.
              </p>
              {showButton && (
                <button
                  type="button"
                  onClick={() => scrollToNextSection('core-values')}
                  className="group inline-flex items-center gap-2 bg-navy shadow-lg px-6 py-2.5 border-2 border-navy font-semibold text-slate-300 hover:scale-105 transition duration-200 cursor-pointer"
                >
                  Our Values
                  <ChevronRightIcon className="group-hover:rotate-90 transition duration-200 size-4" />
                </button>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
