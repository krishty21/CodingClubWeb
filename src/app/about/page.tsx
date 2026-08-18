import { getSiteSettings, getMissionCards } from "@/lib/site-config"
import AboutContent from "@/components/about-content"

export const revalidate = 86400 // 1 day

export default async function AboutPage() {
  const [settings, missions] = await Promise.all([getSiteSettings(), getMissionCards()])
  return <AboutContent settings={settings} missions={missions} />
}
