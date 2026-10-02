import { ScrollReveal } from '@/components/ScrollReveal'
import { CalendarIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/solid'
import { motion } from 'motion/react'
import { useState } from 'react'

import type React from 'react'

interface ContactCTAProps {
  showButton?: boolean
}

export function ContactCTA({
  showButton: _showButton = false,
}: ContactCTAProps): React.ReactElement {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  function submitForm(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
  }
  return (
    <section
      id="contact-cta"
      className="relative bg-graphite px-8 2xl:px-60 py-section text-slate-300 bg-grid"
    >
      <div className="absolute inset-0 bg-noise" />
      <div className="relative py-block mx-auto container">
        <ScrollReveal>
          <div className="items-center gap-12 grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="font-display mb-4 font-bold text-5xl">
                Ready to Build Something <span className="text-amber">Extraordinary</span>?
              </h2>
              <p className="mb-6 text-xl text-slate-400">
                Let&apos;s transform your vision into reality. Contact Cambridge Building Group
                today for a consultation and experience the difference that expertise, dedication,
                and craftsmanship can make.
              </p>
              <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mt-8">
                <div className="flex items-center">
                  <PhoneIcon className="mr-4 text-amber size-8" />
                  <div>
                    <p className="text-slate-400 text-sm">Call Us Directly</p>
                    <p className="font-semibold text-lg">(615) 747-7007</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="mr-4 text-amber size-8" />
                  <div>
                    <p className="text-slate-400 text-sm">Email Us</p>
                    <p className="font-semibold text-lg">info@cambridgebg.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-navy shadow-lg p-8 border-amber border-l-4">
              <h3 className="mb-4 font-bold text-2xl">Schedule a Consultation</h3>
              <p className="mb-6 text-slate-400">
                Fill out the form below and our team will contact you within 24 hours.
              </p>
              {isSubmitted ? (
                <div className="py-8 text-center">
                  <p className="text-lg font-semibold text-amber mb-2">Thank you!</p>
                  <p className="text-slate-400">
                    We&apos;ve received your inquiry and will be in touch within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={submitForm} className="space-y-4">
                  <div>
                    <label
                      htmlFor="cta-name"
                      className="block mb-1 font-medium text-slate-400 text-sm"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="cta-name"
                      required
                      className="bg-slate-700 p-3 border border-slate-600 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber w-full text-slate-300 transition-colors"
                      placeholder="Your Name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cta-email"
                      className="block mb-1 font-medium text-slate-400 text-sm"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="cta-email"
                      required
                      className="bg-slate-700 p-3 border border-slate-600 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber w-full text-slate-300 transition-colors"
                      placeholder="Your Email"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cta-phone"
                      className="block mb-1 font-medium text-slate-400 text-sm"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="cta-phone"
                      className="bg-slate-700 p-3 border border-slate-600 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber w-full text-slate-300 transition-colors"
                      placeholder="Your Phone"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cta-message"
                      className="block mb-1 font-medium text-slate-400 text-sm"
                    >
                      Project Details
                    </label>
                    <textarea
                      id="cta-message"
                      rows={4}
                      required
                      className="bg-slate-700 p-3 border border-slate-600 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber w-full text-slate-300 transition-colors"
                      placeholder="Tell us about your project"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex justify-center items-center bg-amber hover:bg-amber/90 shadow-lg px-6 py-3 w-full font-semibold text-navy transition-colors duration-200 disabled:opacity-60"
                  >
                    {isSubmitting ? 'Sending...' : 'Schedule Consultation'}
                    {!isSubmitting && <CalendarIcon className="ml-2 size-5" />}
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
