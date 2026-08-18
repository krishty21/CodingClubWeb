import { getSiteSettings, getEvents } from "@/lib/site-config"
import EventsPage from "@/components/events-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Events",
  description:
    "Join our exciting workshops, contests, and bootcamps designed to enhance your coding skills and connect with fellow developers.",
}

export const revalidate = 3600 // 1 hour

export default async function EventsRoute() {
  const [settings, events] = await Promise.all([getSiteSettings(), getEvents()])
  return <EventsPage events={events} settings={settings} />
}
