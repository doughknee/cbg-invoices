import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { HeadContent, Link, Outlet, createRootRoute, useRouterState } from '@tanstack/react-router'
import { MotionConfig, motion } from 'motion/react'

function NotFound(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-32 text-center bg-stone">
      <h1 className="font-display text-7xl font-bold text-navy mb-4">404</h1>
      <p className="text-xl text-slate-600 mb-2">Page Not Found</p>
      <p className="text-slate-500 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-amber px-6 py-3 font-semibold text-navy hover:scale-105 transition duration-200"
      >
        Back to Home
      </Link>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { title: 'Cambridge Building Group | Nashville Commercial Construction' },
      {
        name: 'description',
        content:
          'Cambridge Building Group is a Nashville-based commercial construction company specializing in hospitality, industrial, multifamily, and select residential projects.',
      },
      { property: 'og:type', content: 'website' },
      {
        property: 'og:title',
        content: 'Cambridge Building Group | Nashville Commercial Construction',
      },
      {
        property: 'og:description',
        content:
          'Nashville-based commercial construction company specializing in hospitality, industrial, multifamily, and select residential projects.',
      },
      { property: 'og:site_name', content: 'Cambridge Building Group' },
      { property: 'og:image', content: 'https://cambridgebg.com/og-image.png' },
      { property: 'og:url', content: 'https://cambridgebg.com/' },
    ],
  }),
})

function RootLayout(): React.ReactElement {
  const key = useRouterState({ select: (s) => s.location.pathname })

  return (
    <MotionConfig reducedMotion="user">
      <HeadContent />
      <div>
        <Navbar />
        <main>
          <div className="bg-stone">
            <motion.div
              key={key}
              initial={{ opacity: 0, transform: 'translateY(12px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}
