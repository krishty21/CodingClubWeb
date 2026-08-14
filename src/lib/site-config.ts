import { db } from "@/lib/db"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

/**
 * Cache for site settings (avoids hitting DB on every component render).
 * TTL: 30 seconds in dev, 5 minutes in production.
 */
let settingsCache: Record<string, string> | null = null
let settingsCacheTime = 0
const TTL = process.env.NODE_ENV === "production" ? 5 * 60 * 1000 : 30 * 1000

/**
 * Fetch all site settings as a key/value map.
 */
export async function getSiteSettings(): Promise<Record<string, string>> {
  const now = Date.now()
  if (settingsCache && now - settingsCacheTime < TTL) {
    return settingsCache
  }
  const rows = await db.siteSetting.findMany()
  const map: Record<string, string> = {}
  for (const row of rows) map[row.key] = row.value
  settingsCache = map
  settingsCacheTime = now
  return map
}

/**
 * Get a single setting value with a default.
 */
export async function getSetting(key: string, defaultValue = ""): Promise<string> {
  const settings = await getSiteSettings()
  return settings[key] ?? defaultValue
}

/**
 * Clear the settings cache (useful after admin updates).
 */
export function clearSettingsCache() {
  settingsCache = null
  settingsCacheTime = 0
}

/**
 * Get a lucide icon by name. Falls back to a default icon if not found.
 */
export function getIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>
  return icons[name] || icons.Code || icons.Circle
}

/**
 * Parse a JSON-encoded array from a setting or DB column.
 */
export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.map((x) => String(x))
  } catch {
    // ignore
  }
  return []
}

// =========================================================
// Higher-level content fetchers
// =========================================================

export async function getHeroStats() {
  const rows = await db.heroStat.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    iconName: r.iconName,
    value: r.value,
    label: r.label,
    description: r.description || "",
    gradient: r.gradient,
  }))
}

export async function getPillars() {
  const rows = await db.pillar.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    iconName: r.iconName,
    colorFrom: r.colorFrom,
    colorTo: r.colorTo,
    features: parseJsonArray(r.features),
  }))
}

export async function getDomains() {
  const rows = await db.domain.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    iconName: r.iconName,
    color: r.color,
  }))
}

export async function getEvents(filter?: { status?: string; type?: string }) {
  const now = new Date()
  const where: any = { isActive: true }
  
  if (filter?.status && filter.status !== "all") {
    if (filter.status === "upcoming") {
      where.status = "upcoming"
      where.date = { gte: now }
    } else if (filter.status === "past") {
      where.OR = [
        { status: "past" },
        { date: { lt: now } }
      ]
    }
  }
  
  if (filter?.type && filter.type !== "All") where.type = filter.type
  
  const rows = await db.event.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { date: "asc" }],
  })
  
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    date: r.date.toISOString(),
    time: r.time,
    location: r.location,
    type: r.type,
    status: (r.status === "past" || r.date < now) ? "past" : "upcoming",
    image: r.image || "",
    registrations: r.registrations,
    maxRegistrations: r.maxRegistrations,
    registrationUrl: r.registrationUrl || "",
  }))
}

export async function getUpcomingEvents() {
  const now = new Date()
  const rows = await db.event.findMany({
    where: { 
      isActive: true, 
      status: "upcoming",
      date: { gte: now }
    },
    orderBy: [{ displayOrder: "asc" }, { date: "asc" }],
  })
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    date: r.date.toISOString(),
    time: r.time,
    location: r.location,
    type: r.type,
    image: r.image || "",
    registrations: r.registrations,
    maxRegistrations: r.maxRegistrations,
  }))
}

export async function getMissionCards() {
  const rows = await db.missionCard.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    iconName: r.iconName,
  }))
}

export async function getResourceItems(category?: string) {
  const where: { isActive?: boolean; category?: string } = { isActive: true }
  if (category) where.category = category
  const rows = await db.resourceItem.findMany({
    where,
    orderBy: { displayOrder: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    category: r.category,
    parentId: r.parentId,
    title: r.title,
    description: r.description || "",
    difficulty: r.difficulty || "",
    duration: r.duration || "",
    topics: parseJsonArray(r.topics),
    tools: parseJsonArray(r.tools),
    toolkitCategory: r.toolkitCategory || "",
    downloads: r.downloads,
    tech: parseJsonArray(r.tech),
    author: r.author || "",
    stars: r.stars,
    github: r.github || "",
    url: r.url || "",
    displayOrder: r.displayOrder,
  }))
}

export async function getFooterSocialLinks() {
  const rows = await db.footerLink.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    platform: r.platform,
    label: r.label,
    url: r.url,
    iconName: r.iconName,
  }))
}

export async function getFooterQuickLinks() {
  const rows = await db.footerQuickLink.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    href: r.href,
  }))
}

export async function getFooterContacts() {
  const rows = await db.footerContact.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    value: r.value,
    iconName: r.iconName,
  }))
}
