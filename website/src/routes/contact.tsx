import { ScrollReveal } from '@/components/ScrollReveal'
import {
  ChevronDownIcon,
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/solid'
import { Link, createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: 'Contact Cambridge Building Group | Free Construction Quote' },
      {
        name: 'description',
        content:
          'Get in touch with Cambridge Building Group for a free consultation on your next commercial construction project in Nashville, Tennessee.',
      },
      {
        property: 'og:title',
        content: 'Contact Cambridge Building Group | Free Construction Quote',
      },
      {
        property: 'og:description',
        content:
          'Get in touch with Cambridge Building Group for a free consultation on your next commercial construction project in Nashville, Tennessee.',
      },
      { property: 'og:url', content: 'https://cambridgebg.com/contact' },
    ],
    links: [{ rel: 'canonical', href: 'https://cambridgebg.com/contact' }],
  }),
})

const projectTypes = [
  { value: 'commercial', label: 'Commercial Construction' },
  { value: 'residential', label: 'Luxury Residential' },
  { value: 'renovation', label: 'Historic Renovation' },
  { value: 'design-build', label: 'Design-Build Project' },
  { value: 'tenant-improvements', label: 'Tenant Improvements' },
  { value: 'pre-construction', label: 'Pre-Construction Services' },
  { value: 'other', label: 'Other/Not Sure' },
]

const budgetRanges = [
  { value: 'under-500k', label: 'Under $500K' },
  { value: '500k-1m', label: '$500K - $1M' },
  { value: '1m-5m', label: '$1M - $5M' },
  { value: '5m-10m', label: '$5M - $10M' },
  { value: 'over-10m', label: 'Over $10M' },
  { value: 'not-sure', label: 'Not Sure Yet' },
]

const timeframeOptions = [
  { value: 'immediate', label: 'Immediate (1-3 months)' },
  { value: 'soon', label: 'Soon (3-6 months)' },
  { value: 'planning', label: 'Planning Phase (6-12 months)' },
  { value: 'future', label: 'Future Consideration (1+ years)' },
  { value: 'not-sure', label: 'Not Sure Yet' },
]

const faqs = [
  {
    question: 'What types of projects does Cambridge Building Group handle?',
    answer:
      'Cambridge Building Group specializes in commercial construction, luxury residential projects, historic renovations, design-build solutions, and tenant improvements. Our experienced team can handle projects of various sizes and complexities across multiple sectors.',
  },
  {
    question: 'How do I request a quote for my project?',
    answer:
      'You can request a quote by filling out our contact form on this page, calling our main office, or sending an email with your project details. Our team will get back to you within 24 hours to discuss your project requirements and schedule an initial consultation.',
  },
  {
    question: 'Do you offer pre-construction services?',
    answer:
      'Yes, we provide comprehensive pre-construction services including budgeting, scheduling, cost sensitivity, and constructability reviews. These services help identify potential challenges early and establish a solid foundation for project success.',
  },
  {
    question: 'What geographic areas do you serve?',
    answer:
      'Cambridge Building Group serves the Southeastern United States. We have the capacity to take on projects throughout Tennessee and Georgia.',
  },
  {
    question: 'How do you ensure quality and safety on your projects?',
    answer:
      'Quality and safety are core values at Cambridge Building Group. We maintain rigorous quality control processes, comprehensive safety protocols, regular inspections, and ongoing training for all team members. Our impressive safety record and quality outcomes reflect our unwavering commitment to excellence.',
  },
]

interface ContactFormState {
  name: string
  email: string
  phone: string
  company: string
  projectType: string
  budget: string
  timeframe: string
  message: string
  privacy: boolean
}

const initialFormState: ContactFormState = {
  name: '',
  email: '',
  phone: '',
  company: '',
  projectType: '',
  budget: '',
  timeframe: '',
  message: '',
  privacy: false,
}

function ContactPage(): React.ReactElement {
  const [form, setForm] = useState<ContactFormState>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void {
    const { id, value, type } = e.target
    if (type === 'checkbox') {
      setForm((prev) => ({
        ...prev,
        [id]: (e.target as HTMLInputElement).checked,
      }))
    } else {
      setForm((prev) => ({ ...prev, [id]: value }))
    }
  }

  function submitForm(e: React.FormEvent): void {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setForm(initialFormState)
    }, 1500)
  }

  function toggleFaq(index: number): void {
    setActiveFaq(activeFaq === index ? null : index)
  }

  return (
    <div>
      {/* Hero Header */}
      <section className="relative h-[50vh] flex items-end bg-graphite overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-noise" />
        <div className="absolute inset-0 z-0 opacity-15 bg-[url('/contact-header.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-graphite via-graphite/60 to-transparent" />
        <div className="relative z-10 px-8 2xl:px-60 pb-12 w-full">
          <motion.p
            initial={{ opacity: 0, transform: 'translateY(20px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
            className="font-display text-amber text-lg tracking-widest uppercase mb-2"
          >
            Get in Touch
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, transform: 'translateY(20px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
            className="font-display text-5xl md:text-7xl text-stone mb-4"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, transform: 'translateY(20px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-xl text-slate-400 max-w-2xl"
          >
            Let&apos;s discuss your project and transform your vision into reality.
          </motion.p>
        </div>
      </section>

      {/* ── LIGHT: Contact Details + Form ──────────── */}
      <div className="slant-bottom">
        <section className="bg-stone bg-dots px-8 2xl:px-60 py-section">
          <div className="py-block mx-auto container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Details */}
              <ScrollReveal>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-navy mb-6">
                  Let&apos;s <span className="text-amber">Talk</span>
                </h2>
                <p className="text-slate-700 text-lg mb-8">
                  Whether you&apos;re ready to start a new project, need information about our
                  services, or have questions about working with us, we&apos;re here to help.
                </p>

                <div className="space-y-5 mb-8">
                  <div className="flex items-start">
                    <div className="bg-amber/10 p-2.5 rounded-full mr-4 shrink-0">
                      <MapPinIcon className="size-5 text-amber" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy mb-0.5">Nashville Headquarters</h3>
                      <p className="text-slate-700">PO Box: 160036, Nashville, TN 37216</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-amber/10 p-2.5 rounded-full mr-4 shrink-0">
                      <PhoneIcon className="size-5 text-amber" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy mb-0.5">Phone</h3>
                      <p className="text-slate-700">(615) 747-7007</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-amber/10 p-2.5 rounded-full mr-4 shrink-0">
                      <EnvelopeIcon className="size-5 text-amber" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy mb-0.5">Email</h3>
                      <p className="text-slate-700">info@cambridgebg.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-amber/10 p-2.5 rounded-full mr-4 shrink-0">
                      <ClockIcon className="size-5 text-amber" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy mb-0.5">Business Hours</h3>
                      <p className="text-slate-700">Monday &ndash; Friday: 8am &ndash; 5pm CST</p>
                    </div>
                  </div>
                </div>

                {/* Response promise */}
                <div className="border-l-2 border-amber pl-6">
                  <p className="text-slate-700 leading-relaxed">
                    <span className="font-semibold text-navy">24-hour response guarantee.</span>{' '}
                    Every inquiry receives a personal response from our team within one business day
                    &mdash; not an auto-reply.
                  </p>
                </div>
              </ScrollReveal>

              {/* Contact Form */}
              <ScrollReveal delay={0.1}>
                <div className="border-l-2 border-amber pl-8">
                  <h2 className="font-display text-2xl font-bold text-navy mb-6">
                    Request a Consultation
                  </h2>

                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, transform: 'translateY(20px)' }}
                      animate={{ opacity: 1, transform: 'translateY(0px)' }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
                      className="bg-amber/10 p-5 border-l-4 border-amber"
                    >
                      <p className="font-semibold text-navy mb-1">Thank you for reaching out.</p>
                      <p className="text-slate-700">
                        We&apos;ve received your inquiry and will get back to you within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={submitForm} className="space-y-5">
                      {/* Name */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block mb-1 font-medium text-slate-700 text-sm"
                        >
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          className="p-3 border border-slate-300 bg-stone/50 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber w-full text-navy"
                          placeholder="Your Name"
                        />
                      </div>

                      {/* Email & Phone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label
                            htmlFor="email"
                            className="block mb-1 font-medium text-slate-700 text-sm"
                          >
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="p-3 border border-slate-300 bg-stone/50 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber w-full text-navy"
                            placeholder="Your Email"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="phone"
                            className="block mb-1 font-medium text-slate-700 text-sm"
                          >
                            Phone
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className="p-3 border border-slate-300 bg-stone/50 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber w-full text-navy"
                            placeholder="Your Phone Number"
                          />
                        </div>
                      </div>

                      {/* Company */}
                      <div>
                        <label
                          htmlFor="company"
                          className="block mb-1 font-medium text-slate-700 text-sm"
                        >
                          Company/Organization
                        </label>
                        <input
                          type="text"
                          id="company"
                          value={form.company}
                          onChange={handleChange}
                          className="p-3 border border-slate-300 bg-stone/50 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber w-full text-navy"
                          placeholder="Your Company Name"
                        />
                      </div>

                      {/* Project Type & Budget */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label
                            htmlFor="projectType"
                            className="block mb-1 font-medium text-slate-700 text-sm"
                          >
                            Project Type
                          </label>
                          <select
                            id="projectType"
                            value={form.projectType}
                            onChange={handleChange}
                            className="p-3 border border-slate-300 bg-stone/50 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber w-full text-navy"
                          >
                            <option value="" disabled>
                              Select Project Type
                            </option>
                            {projectTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="budget"
                            className="block mb-1 font-medium text-slate-700 text-sm"
                          >
                            Budget Range
                          </label>
                          <select
                            id="budget"
                            value={form.budget}
                            onChange={handleChange}
                            className="p-3 border border-slate-300 bg-stone/50 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber w-full text-navy"
                          >
                            <option value="" disabled>
                              Select Budget Range
                            </option>
                            {budgetRanges.map((budget) => (
                              <option key={budget.value} value={budget.value}>
                                {budget.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Timeframe */}
                      <div>
                        <label
                          htmlFor="timeframe"
                          className="block mb-1 font-medium text-slate-700 text-sm"
                        >
                          Project Timeframe
                        </label>
                        <select
                          id="timeframe"
                          value={form.timeframe}
                          onChange={handleChange}
                          className="p-3 border border-slate-300 bg-stone/50 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber w-full text-navy"
                        >
                          <option value="" disabled>
                            Select Timeframe
                          </option>
                          {timeframeOptions.map((time) => (
                            <option key={time.value} value={time.value}>
                              {time.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Message */}
                      <div>
                        <label
                          htmlFor="message"
                          className="block mb-1 font-medium text-slate-700 text-sm"
                        >
                          Project Details *
                        </label>
                        <textarea
                          id="message"
                          value={form.message}
                          onChange={handleChange}
                          required
                          rows={4}
                          className="p-3 border border-slate-300 bg-stone/50 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber w-full text-navy"
                          placeholder="Tell us about your project and any specific requirements"
                        />
                      </div>

                      {/* Privacy Policy */}
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="privacy"
                            type="checkbox"
                            checked={form.privacy}
                            onChange={handleChange}
                            required
                            className="border-slate-300 focus:ring-amber w-4 h-4 text-amber accent-amber"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="privacy" className="text-slate-700">
                            I agree to the{' '}
                            <Link
                              to="/privacy-policy"
                              className="text-amber hover:underline font-medium"
                              target="_blank"
                            >
                              Privacy Policy
                            </Link>{' '}
                            and consent to being contacted about my inquiry.
                          </label>
                        </div>
                      </div>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={isSubmitting ? {} : { scale: 1.02 }}
                        whileTap={isSubmitting ? {} : { scale: 0.97 }}
                        className="flex justify-center items-center bg-navy hover:bg-amber disabled:opacity-70 shadow px-4 py-3 w-full font-semibold text-stone transition-colors duration-200 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Sending...' : 'Submit Request'}
                      </motion.button>
                    </form>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </div>

      {/* ── DARK: FAQ ──────────── */}
      <div className="slant-top">
        <section className="relative bg-graphite bg-grid text-slate-300 px-8 2xl:px-60 py-section">
          <div className="absolute inset-0 bg-noise" />
          <div className="relative py-block mx-auto container">
            <ScrollReveal>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-center">
                Frequently Asked <span className="text-amber">Questions</span>
              </h2>
              <p className="text-slate-400 text-center max-w-2xl mx-auto mb-10">
                Answers to the questions we hear most from clients considering a new project.
              </p>
            </ScrollReveal>

            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: index used for active state tracking
                <ScrollReveal key={index} delay={index * 0.05}>
                  <div className="bg-navy overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="flex justify-between items-center p-5 w-full text-left cursor-pointer group"
                    >
                      <h3 className="font-semibold text-stone text-lg pr-4">{faq.question}</h3>
                      <ChevronDownIcon
                        className={`size-5 text-amber shrink-0 transition-transform duration-200 ${
                          activeFaq === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {activeFaq === index && (
                        <motion.div
                          // biome-ignore lint/suspicious/noArrayIndexKey: FAQ items are static, index is stable
                          key={`faq-${index}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-slate-700">
                            <p className="text-slate-400 leading-relaxed pt-4">{faq.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
