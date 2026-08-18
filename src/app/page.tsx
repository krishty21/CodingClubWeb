import Navigation from "@/components/navigation"
import HeroSection from "@/components/hero-section"
import WhoWeAre from "@/components/who-we-are"
import DomainsSection from "@/components/domains-section"
import UpcomingEvents from "@/components/upcoming-events"
import Footer from "@/components/footer"
import {
  getSiteSettings,
  getHeroStats,
  getPillars,
  getDomains,
  getUpcomingEvents,
} from "@/lib/site-config"

export const revalidate = 3600 // 1 hour

export default async function HomePage() {
  const [settings, stats, pillars, domains, upcomingEvents] = await Promise.all([
    getSiteSettings(),
    getHeroStats(),
    getPillars(),
    getDomains(),
    getUpcomingEvents(),
  ])

  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection settings={settings} stats={stats} />
      <WhoWeAre pillars={pillars} settings={settings} />
      <DomainsSection domains={domains} settings={settings} />
      <UpcomingEvents events={upcomingEvents} settings={settings} />
      <Footer />
    </main>
  )
}
