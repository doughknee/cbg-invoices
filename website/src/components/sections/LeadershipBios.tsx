import { ScrollReveal } from '@/components/ScrollReveal'
import { leadershipTeam } from '@/data/siteData'
import { ChevronRightIcon } from '@heroicons/react/24/solid'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import type React from 'react'

interface LeadershipBiosProps {
  showButton?: boolean
}

export function LeadershipBios({
  showButton: _showButton = false,
}: LeadershipBiosProps): React.ReactElement {
  const [activeMobile, setActiveMobile] = useState<number | null>(null)

  function toggleMobile(id: number): void {
    setActiveMobile(activeMobile === id ? null : id)
  }

  return (
    <section id="leadership" className="relative bg-stone px-8 2xl:px-60 py-section">
      <div className="py-block mx-auto container">
        <ScrollReveal>
          <div className="mb-14 max-w-2xl">
            <h2 className="font-display font-bold text-navy text-5xl mb-4">
              Our <span className="text-amber">Leadership</span>
            </h2>
            <p className="text-slate-700 text-lg">
              Cambridge Building Group is led by experienced industry professionals combining
              diverse expertise and a shared commitment to excellence.
            </p>
          </div>
        </ScrollReveal>

        {/* Desktop — each person is a self-contained column */}
        <div className="hidden md:grid md:grid-cols-2 gap-12">
          {leadershipTeam.map((leader, index) => (
            <ScrollReveal key={leader.id} delay={index * 0.1}>
              <div className="flex items-center gap-5 mb-6">
                <div className="w-36 aspect-[4/3] overflow-hidden bg-slate-200 shrink-0">
                  <motion.img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover object-top"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />
                </div>
                <div>
                  <h3 className="font-display font-bold text-navy text-4xl leading-tight">
                    {leader.name}
                  </h3>
                  <p className="text-amber text-lg">{leader.title}</p>
                </div>
              </div>

              <div className="border-l-2 border-amber pl-6">
                <p className="mb-4 font-display text-navy text-lg italic leading-relaxed">
                  {leader.bio.split('.')[0]}.
                </p>
                <p className="mb-6 text-slate-700 leading-relaxed">
                  {leader.bio.split('.').slice(1).join('.').trim()}
                </p>

                <h4 className="mb-2 font-semibold text-navy">Education</h4>
                <p className="mb-5 text-slate-600">{leader.education}</p>

                <h4 className="mb-2 font-semibold text-navy">Experience</h4>
                <ul className="text-slate-600 space-y-1">
                  {leader.experience.map((item) => (
                    <li key={item} className="flex items-start">
                      <span className="bg-amber mt-2 mr-2 rounded-full w-1.5 h-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {leader.linkedIn && (
                  <a
                    href={leader.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-navy transition-colors duration-300 hover:text-amber"
                  >
                    <img src="/linkedin.svg" alt="" className="size-4" />
                    Connect on LinkedIn
                  </a>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Mobile — compact with expandable bio */}
        <div className="md:hidden space-y-8">
          {leadershipTeam.map((leader) => (
            <div key={`mobile-${leader.id}`}>
              <button
                type="button"
                className="w-full text-left cursor-pointer"
                onClick={() => toggleMobile(leader.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-16 overflow-hidden bg-slate-200 shrink-0">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-navy text-xl">{leader.name}</h3>
                    <p className="text-amber">{leader.title}</p>
                  </div>
                  <ChevronRightIcon
                    className={`size-5 text-navy shrink-0 transition-transform duration-200 ${
                      activeMobile === leader.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>
              <AnimatePresence initial={false}>
                {activeMobile === leader.id && (
                  <motion.div
                    key={`bio-${leader.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                    className="overflow-hidden"
                  >
                    <div className="border-l-2 border-amber pl-5 mt-4">
                      <p className="mb-4 text-slate-700 leading-relaxed">{leader.bio}</p>
                      <h4 className="mb-1 font-semibold text-navy">Education</h4>
                      <p className="mb-4 text-slate-600">{leader.education}</p>
                      <h4 className="mb-1 font-semibold text-navy">Experience</h4>
                      <ul className="text-slate-600 space-y-1">
                        {leader.experience.map((item) => (
                          <li key={item} className="flex items-start">
                            <span className="bg-amber mt-2 mr-2 rounded-full w-1.5 h-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      {leader.linkedIn && (
                        <a
                          href={leader.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-navy transition-colors duration-300 hover:text-amber"
                        >
                          <img src="/linkedin.svg" alt="" className="size-4" />
                          Connect on LinkedIn
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
