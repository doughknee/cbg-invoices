import { companyInfo, footerLinks, socialLinks } from '@/data/siteData'
import { ClockIcon, EnvelopeIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/solid'
import { Link } from '@tanstack/react-router'

import type React from 'react'

const currentYear = new Date().getFullYear()

interface ContactDetailProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  children: React.ReactNode
  href?: string
}

function ContactDetail({ icon: Icon, children, href }: ContactDetailProps): React.ReactElement {
  const content = (
    <span className="flex items-start gap-3 text-slate-400 transition-colors duration-300 group-hover:text-slate-200">
      <Icon className="mt-0.5 size-4 shrink-0 text-amber" />
      <span>{children}</span>
    </span>
  )

  if (href) {
    return (
      <a href={href} className="group">
        {content}
      </a>
    )
  }

  return <div className="group">{content}</div>
}

interface FooterColumnProps {
  title: string
  links: { name: string; url: string }[]
}

function FooterColumn({ title, links }: FooterColumnProps): React.ReactElement {
  return (
    <div>
      <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-amber">{title}</h3>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              to={link.url}
              className="relative inline-block py-1.5 text-slate-400 transition-colors duration-300 hover:text-stone"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer(): React.ReactElement {
  return (
    <footer className="relative bg-navy bg-grid">
      {/* Noise overlay */}
      <div className="bg-noise pointer-events-none absolute inset-0" />

      {/* Amber accent line at top */}
      <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-amber to-transparent opacity-40" />

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="relative px-8 pt-20 pb-12 lg:px-12 2xl:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            {/* Company Info — spans 4 cols */}
            <div className="lg:col-span-4">
              <Link to="/" className="inline-block">
                <img
                  src="/cbg-text-logo-twotone.svg"
                  alt="Cambridge Building Group"
                  className="mb-6 w-[160px] opacity-80"
                />
              </Link>
              <p className="mb-8 max-w-sm leading-relaxed text-slate-400">{companyInfo.tagline}</p>

              <div className="space-y-4">
                <ContactDetail icon={MapPinIcon}>{companyInfo.address}</ContactDetail>
                <ContactDetail
                  icon={PhoneIcon}
                  href={`tel:${companyInfo.phone.replace(/[^\d+]/g, '')}`}
                >
                  {companyInfo.phone}
                </ContactDetail>
                <ContactDetail icon={EnvelopeIcon} href={`mailto:${companyInfo.email}`}>
                  {companyInfo.email}
                </ContactDetail>
                <ContactDetail icon={ClockIcon}>{companyInfo.hours}</ContactDetail>
              </div>
            </div>

            {/* Link columns — 2 cols each */}
            <div className="lg:col-span-2 lg:col-start-6">
              <FooterColumn title="About" links={footerLinks.about} />
            </div>

            <div className="lg:col-span-2">
              <FooterColumn title="Services" links={footerLinks.services} />
            </div>

            <div className="lg:col-span-2">
              <FooterColumn title="Connect" links={footerLinks.connect} />

              {/* Social links */}
              <div className="mt-8">
                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-amber">
                  Follow Us
                </h4>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex size-11 items-center justify-center border border-slate-700 text-slate-400 transition-all duration-300 hover:border-amber hover:text-amber"
                    >
                      <span className="sr-only">{social.name}</span>
                      <img
                        src={social.icon}
                        alt={social.name}
                        className="size-5 opacity-60 transition-opacity duration-300 hover:opacity-100"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────── */}
      <div className="relative border-t border-slate-800 px-8 py-6 lg:px-12 2xl:px-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-slate-400">
            &copy; {currentYear} {companyInfo.name}
            <span className="ml-2 text-slate-400">All rights reserved.</span>
          </p>
          <Link
            to="/privacy-policy"
            className="text-sm text-slate-400 transition-colors duration-300 hover:text-slate-300"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
