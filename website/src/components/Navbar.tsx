import { companyInfo, navItems } from '@/data/siteData'
import { Bars3Icon, PhoneIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { Link, useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'

import type React from 'react'

const NAV_LINKS = Object.values(navItems)

export function Navbar(): React.ReactElement {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => {
      const next = !prev
      document.body.style.overflow = next ? 'hidden' : ''
      return next
    })
  }, [])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
    document.body.style.overflow = ''
  }, [])

  useEffect(() => {
    function handleScroll(): void {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally close menu on route change
  useEffect(() => {
    closeMobileMenu()
  }, [pathname])

  return (
    <header>
      {/* ── Desktop + Mobile Top Bar ──────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
          isScrolled ? 'bg-navy/95 backdrop-blur-md shadow-lg shadow-black/20' : 'bg-navy'
        }`}
      >
        {/* Amber accent line */}
        <div
          className={`absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-amber to-transparent transition-opacity duration-500 ${
            isScrolled ? 'opacity-60' : 'opacity-20'
          }`}
        />

        <div className="flex items-center justify-between px-6 lg:px-12 2xl:px-24 h-20">
          {/* Logo */}
          <Link to="/" className="relative flex items-center" onClick={closeMobileMenu}>
            <img
              src="/cbg-text-logo-twotone.svg"
              alt="Cambridge Building Group"
              className="h-10 w-auto"
            />
          </Link>

          {/* ── Desktop Navigation ───────────────────────────── */}
          <div className="hidden lg:flex items-center gap-10">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map((item) => {
                const isActive =
                  item.link === '/' ? pathname === '/' : pathname.startsWith(item.link)

                return (
                  <li key={item.title}>
                    <Link
                      to={item.link}
                      className="group relative py-2 font-body text-sm font-semibold uppercase tracking-widest text-slate-400 transition-colors duration-300 hover:text-stone"
                    >
                      <span className={isActive ? 'text-stone' : ''}>{item.title}</span>
                      {/* Animated underline — scaleX for compositor-only animation */}
                      <span
                        className={`absolute bottom-0 left-0 h-0.5 w-full bg-amber origin-left transition-transform duration-300 ${
                          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Divider */}
            <div className="h-8 w-px bg-slate-700" />

            {/* Phone */}
            <a
              href={`tel:${companyInfo.phone.replace(/[^\d+]/g, '')}`}
              className="flex items-center gap-2 text-sm text-slate-400 transition-colors duration-300 hover:text-stone"
            >
              <PhoneIcon className="size-4 text-amber" />
              <span className="font-semibold tracking-wide">{companyInfo.phone}</span>
            </a>

            {/* CTA Button */}
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-amber bg-amber px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-navy transition-all duration-300 hover:bg-transparent hover:text-amber"
            >
              Get a Quote
            </Link>
          </div>

          {/* ── Mobile Hamburger ─────────────────────────────── */}
          <button
            type="button"
            className="relative z-60 lg:hidden text-stone p-2"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, transform: 'rotate(-90deg)' }}
                  animate={{ opacity: 1, transform: 'rotate(0deg)' }}
                  exit={{ opacity: 0, transform: 'rotate(90deg)' }}
                  transition={{ duration: 0.2 }}
                >
                  <XMarkIcon className="size-7" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, transform: 'rotate(90deg)' }}
                  animate={{ opacity: 1, transform: 'rotate(0deg)' }}
                  exit={{ opacity: 0, transform: 'rotate(-90deg)' }}
                  transition={{ duration: 0.2 }}
                >
                  <Bars3Icon className="size-7" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ───────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeMobileMenu}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Escape' || e.key === 'Enter') closeMobileMenu()
              }}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-navy bg-grid"
              initial={{ transform: 'translateX(100%)' }}
              animate={{ transform: 'translateX(0%)' }}
              exit={{ transform: 'translateX(100%)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
            >
              {/* Noise overlay */}
              <div className="bg-noise pointer-events-none absolute inset-0" />

              <div className="relative flex h-full flex-col px-8 pt-28 pb-10">
                {/* Nav links */}
                <nav className="flex-1">
                  <ul className="space-y-2">
                    {NAV_LINKS.map((item, i) => {
                      const isActive =
                        item.link === '/' ? pathname === '/' : pathname.startsWith(item.link)

                      return (
                        <motion.li
                          key={item.title}
                          initial={{ opacity: 0, transform: 'translateX(40px)' }}
                          animate={{ opacity: 1, transform: 'translateX(0px)' }}
                          transition={{
                            delay: 0.1 + i * 0.06,
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1] as const,
                          }}
                        >
                          <Link
                            to={item.link}
                            className={`block border-l-2 py-3 pl-5 font-display text-2xl transition-all duration-300 ${
                              isActive
                                ? 'border-amber text-stone'
                                : 'border-transparent text-slate-400 hover:border-amber/50 hover:text-slate-200'
                            }`}
                            onClick={closeMobileMenu}
                          >
                            {item.title}
                          </Link>
                        </motion.li>
                      )
                    })}
                  </ul>
                </nav>

                {/* Bottom section */}
                <motion.div
                  className="border-t border-slate-700/50 pt-8"
                  initial={{ opacity: 0, transform: 'translateY(20px)' }}
                  animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <Link
                    to="/contact"
                    className="mb-8 block w-full border border-amber bg-amber px-5 py-3 text-center text-sm font-bold uppercase tracking-wider text-navy transition-all duration-300 hover:bg-transparent hover:text-amber"
                    onClick={closeMobileMenu}
                  >
                    Get a Free Quote
                  </Link>

                  <div className="space-y-4">
                    <a
                      href={`tel:${companyInfo.phone.replace(/[^\d+]/g, '')}`}
                      className="flex items-center gap-3 text-slate-400 transition-colors duration-300 hover:text-stone"
                    >
                      <PhoneIcon className="size-5 text-amber" />
                      <span className="font-semibold">{companyInfo.phone}</span>
                    </a>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to offset fixed navbar */}
      <div className="h-20" />
    </header>
  )
}
