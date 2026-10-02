import { ScrollReveal } from '@/components/ScrollReveal'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy-policy')({
  component: PrivacyPolicyPage,
  head: () => ({
    meta: [
      { title: 'Privacy Policy | Cambridge Building Group' },
      {
        name: 'description',
        content:
          'Privacy policy for Cambridge Building Group — how we collect, use, and protect your personal data.',
      },
      { property: 'og:url', content: 'https://cambridgebg.com/privacy-policy' },
    ],
    links: [{ rel: 'canonical', href: 'https://cambridgebg.com/privacy-policy' }],
  }),
})

function PrivacyPolicyPage(): React.ReactElement {
  return (
    <div className="bg-stone">
      {/* Hero */}
      <section className="relative bg-graphite bg-grid px-8 2xl:px-60 py-section text-slate-300 overflow-hidden">
        <div className="absolute inset-0 bg-noise" />
        <div className="relative py-block mx-auto container">
          <ScrollReveal>
            <p className="text-amber text-sm font-semibold uppercase tracking-widest mb-3">Legal</p>
            <h1 className="font-display text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              How Cambridge Building Group collects, uses, and protects your personal information.
            </p>
            <p className="text-slate-500 text-sm mt-4">Last updated: February 20, 2026</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Content */}
      <section className="bg-stone bg-dots px-8 2xl:px-60 py-section">
        <div className="py-block mx-auto container max-w-3xl">
          <div className="space-y-10 text-slate-700 leading-relaxed">
            <ScrollReveal>
              <div>
                <h2 className="font-display text-2xl font-bold text-navy mb-4">
                  Information We Collect
                </h2>
                <p className="mb-4">
                  When you use our website, we may collect the following personal information that
                  you voluntarily provide through our contact forms:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Company or organization name</li>
                  <li>Project details, including type, budget range, and timeframe</li>
                </ul>
                <p className="mt-4">
                  We do not collect information automatically through cookies, tracking pixels, or
                  similar technologies beyond what is standard for web hosting (such as server
                  access logs that may include your IP address, browser type, and pages visited).
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div>
                <h2 className="font-display text-2xl font-bold text-navy mb-4">
                  How We Use Your Information
                </h2>
                <p className="mb-4">
                  The personal information you provide is used solely for the following purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Responding to your inquiries and contact form submissions</li>
                  <li>Providing project consultations and estimates</li>
                  <li>Communicating with you about potential or ongoing projects</li>
                  <li>Improving our website and services</li>
                </ul>
                <p className="mt-4">
                  We do not sell, rent, or share your personal information with third parties for
                  marketing purposes.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div>
                <h2 className="font-display text-2xl font-bold text-navy mb-4">Data Retention</h2>
                <p>
                  We retain your personal information only for as long as necessary to fulfill the
                  purposes outlined in this policy, or as required by law. Contact form submissions
                  are retained for the duration of any business relationship and a reasonable period
                  thereafter.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div>
                <h2 className="font-display text-2xl font-bold text-navy mb-4">Data Protection</h2>
                <p>
                  We take reasonable measures to protect your personal information from unauthorized
                  access, alteration, disclosure, or destruction. However, no method of transmission
                  over the internet or electronic storage is completely secure, and we cannot
                  guarantee absolute security.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div>
                <h2 className="font-display text-2xl font-bold text-navy mb-4">
                  Third-Party Links
                </h2>
                <p>
                  Our website may contain links to third-party websites, such as our LinkedIn
                  profile. We are not responsible for the privacy practices or content of these
                  external sites. We encourage you to review the privacy policies of any third-party
                  sites you visit.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div>
                <h2 className="font-display text-2xl font-bold text-navy mb-4">Your Rights</h2>
                <p className="mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Request access to the personal information we hold about you</li>
                  <li>Request correction of inaccurate personal information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Withdraw consent for us to contact you</li>
                </ul>
                <p className="mt-4">
                  To exercise any of these rights, please contact us using the information below.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div>
                <h2 className="font-display text-2xl font-bold text-navy mb-4">
                  Changes to This Policy
                </h2>
                <p>
                  We may update this privacy policy from time to time. Any changes will be posted on
                  this page with an updated revision date. We encourage you to review this policy
                  periodically.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div>
                <h2 className="font-display text-2xl font-bold text-navy mb-4">Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about this privacy policy or our data practices, please
                  contact us:
                </p>
                <div className="border-l-2 border-amber pl-6 space-y-1">
                  <p className="font-semibold text-navy">Cambridge Building Group LLC</p>
                  <p>PO Box 160036, Nashville, TN 37216</p>
                  <p>
                    Email:{' '}
                    <a href="mailto:info@cambridgebg.com" className="text-amber hover:underline">
                      info@cambridgebg.com
                    </a>
                  </p>
                  <p>Phone: (615) 747-7007</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  )
}
