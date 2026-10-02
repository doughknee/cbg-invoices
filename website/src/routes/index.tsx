import { ContactCTA } from '@/components/sections/ContactCTA'
import { CoreValues } from '@/components/sections/CoreValues'
import { HomeHero } from '@/components/sections/HomeHero'
import { LeadershipBios } from '@/components/sections/LeadershipBios'
import { MarketsWeServe } from '@/components/sections/MarketsWeServe'
import { Network } from '@/components/sections/Network'
import { RecognitionImpact } from '@/components/sections/RecognitionImpact'
import { ServicesProvided } from '@/components/sections/ServicesProvided'
import { TrackRecord } from '@/components/sections/TrackRecord'
import { WhoIsCC } from '@/components/sections/WhoIsCC'
import { WhyCambridge } from '@/components/sections/WhyCambridge'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () => ({
    meta: [
      { title: 'Cambridge Building Group | Nashville Commercial Construction' },
      {
        name: 'description',
        content:
          'Nashville-based commercial construction company with over a decade of excellence in hospitality, industrial, multifamily, and select residential projects.',
      },
      {
        property: 'og:title',
        content: 'Cambridge Building Group | Nashville Commercial Construction',
      },
      {
        property: 'og:description',
        content:
          'Nashville-based commercial construction company with over a decade of excellence in hospitality, industrial, multifamily, and select residential projects.',
      },
      { property: 'og:url', content: 'https://cambridgebg.com/' },
    ],
    links: [{ rel: 'canonical', href: 'https://cambridgebg.com/' }],
  }),
})

function HomePage(): React.ReactElement {
  return (
    <div>
      {/* Hero Section */}
      <HomeHero />

      {/* First section: flat top, slanted bottom */}
      <div className="slant-bottom">
        <WhoIsCC showButton />
      </div>

      {/* Middle sections: full parallelogram (slanted top + bottom) */}
      <div className="slant-both">
        <CoreValues showButton />
      </div>

      <div className="slant-both">
        <TrackRecord showButton />
      </div>

      <div className="slant-both">
        <ServicesProvided showButton />
      </div>

      <div className="slant-both">
        <MarketsWeServe showButton />
      </div>

      <div className="slant-both">
        <WhyCambridge showButton />
      </div>

      <div className="slant-both">
        <LeadershipBios />
      </div>

      <div className="slant-both">
        <RecognitionImpact />
      </div>

      <div className="slant-both">
        <Network />
      </div>

      {/* Last section: slanted top, flat bottom */}
      <div className="slant-top">
        <ContactCTA />
      </div>
    </div>
  )
}
