"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import PremiumPageBackground from "@/components/premium-page-background"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, Filter, Grid, List } from "lucide-react"
import { motion } from "framer-motion"
import { useSpotlight } from "@/hooks/use-magnetic"

interface EventItem {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: string
  status: string
  image: string
  registrations: number
  maxRegistrations: number
  registrationUrl: string
}

interface EventsPageProps {
  events: EventItem[]
  settings: {
    events_hero_title?: string
    events_hero_description?: string
  }
}

const eventTypes = ["All", "Workshop", "Contest", "Bootcamp", "Hackathon", "Webinar"]

const typeColors: Record<string, string> = {
  Workshop: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Contest: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Bootcamp: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Hackathon: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Webinar: "bg-purple-500/20 text-purple-300 border-purple-500/30",
}

export default function EventsPage({ events, settings }: EventsPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filterType, setFilterType] = useState("All")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredEvents = events.filter((event) => {
    const typeMatch = filterType === "All" || event.type === filterType
    const statusMatch = filterStatus === "all" || event.status === filterStatus
    return typeMatch && statusMatch
  })

  const heroTitle = settings.events_hero_title || "Events"
  const heroDescription =
    settings.events_hero_description ||
    "Join our exciting workshops, contests, and bootcamps designed to enhance your coding skills and connect with fellow developers."

  return (
    <main className="min-h-screen relative">
      <PremiumPageBackground />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading font-bold text-5xl sm:text-6xl lg:text-7xl mb-6"
          >
            <span className="gradient-text-premium">{heroTitle}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            {heroDescription}
          </motion.p>
        </div>
      </section>

      {/* Filters and View Toggle */}
      <section className="px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="glass-strong rounded-2xl p-6 mb-8 border border-white/10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-200 font-medium">Filter by:</span>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="glass border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500/50 input-premium"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type} className="bg-gray-900">
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="glass border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500/50 input-premium"
                >
                  <option value="all" className="bg-gray-900">All Events</option>
                  <option value="upcoming" className="bg-gray-900">Upcoming</option>
                  <option value="past" className="bg-gray-900">Past Events</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-blue-500" : "border-white/10 text-gray-300"}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-blue-500" : "border-white/10 text-gray-300"}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid/List */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 glass-strong rounded-2xl border border-white/10">
              <h4 className="font-heading font-semibold text-xl text-white mb-2">No Events Found</h4>
              <p className="text-gray-400">Try adjusting your filters.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <EventGridCard key={event.id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map((event, index) => (
                <EventListCard key={event.id} event={event} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

function EventGridCard({ event, index }: { event: EventItem; index: number }) {
  const { ref, pos } = useSpotlight<HTMLDivElement>()
  const typeClass = typeColors[event.type] || "bg-gray-500/20 text-gray-300 border-gray-500/30"

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
    >
      <div
        ref={ref}
        className="group relative h-full glass-strong rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500 spotlight-card"
        style={
          {
            "--spotlight-x": `${pos.x}%`,
            "--spotlight-y": `${pos.y}%`,
          } as React.CSSProperties
        }
      >
        <div className="relative h-52 overflow-hidden">
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${typeClass}`}>
              {event.type}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs border backdrop-blur-md ${
                event.status === "upcoming"
                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                  : "bg-gray-500/20 text-gray-400 border-gray-500/30"
              }`}
            >
              {event.status}
            </span>
          </div>
        </div>
        <div className="p-6 relative z-10">
          <h3 className="font-heading font-bold text-xl text-white mb-2">{event.title}</h3>
          <p className="text-gray-400 mb-4 text-sm line-clamp-2">{event.description}</p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-300 text-sm">
              <Calendar className="h-4 w-4 mr-2 text-blue-400" />
              {new Date(event.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <Clock className="h-4 w-4 mr-2 text-blue-400" />
              {event.time}
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <MapPin className="h-4 w-4 mr-2 text-blue-400" />
              {event.location}
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <Users className="h-4 w-4 mr-2 text-blue-400" />
              {event.registrations}/{event.maxRegistrations} registered
            </div>
          </div>
          <div className="mb-4">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (event.registrations / event.maxRegistrations) * 100)}%`,
                }}
              />
            </div>
          </div>
          {event.registrationUrl ? (
            <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 btn-premium" disabled={event.status === "past"}>
                {event.status === "past" ? "Event Completed" : "Register Now"}
              </Button>
            </a>
          ) : (
            <Button className="w-full bg-blue-500 hover:bg-blue-600 btn-premium" disabled={event.status === "past"}>
              {event.status === "past" ? "Event Completed" : "Register Now"}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function EventListCard({ event, index }: { event: EventItem; index: number }) {
  const typeClass = typeColors[event.type] || "bg-gray-500/20 text-gray-300 border-gray-500/30"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      className="group glass-strong rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <img
          src={event.image || "/placeholder.svg"}
          alt={event.title}
          className="w-full lg:w-48 h-32 object-cover rounded-xl"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${typeClass}`}>
                {event.type}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs border backdrop-blur-md ${
                  event.status === "upcoming"
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                }`}
              >
                {event.status}
              </span>
            </div>
            {event.registrationUrl ? (
              <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-blue-500 hover:bg-blue-600 btn-premium" disabled={event.status === "past"}>
                  {event.status === "past" ? "Completed" : "Register"}
                </Button>
              </a>
            ) : (
              <Button className="bg-blue-500 hover:bg-blue-600 btn-premium" disabled={event.status === "past"}>
                {event.status === "past" ? "Completed" : "Register"}
              </Button>
            )}
          </div>
          <h3 className="font-heading font-bold text-2xl text-white mb-2">{event.title}</h3>
          <p className="text-gray-400 mb-4">{event.description}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center text-gray-300 text-sm">
              <Calendar className="h-4 w-4 mr-2 text-blue-400" />
              {new Date(event.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <Clock className="h-4 w-4 mr-2 text-blue-400" />
              {event.time}
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <MapPin className="h-4 w-4 mr-2 text-blue-400" />
              {event.location}
            </div>
            <div className="flex items-center text-gray-300 text-sm">
              <Users className="h-4 w-4 mr-2 text-blue-400" />
              {event.registrations}/{event.maxRegistrations}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
