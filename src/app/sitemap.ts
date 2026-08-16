import type { MetadataRoute } from "next"
import { db } from "@/lib/db"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXTAUTH_URL || "https://www.codingclubnitanp.in"

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/team`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/events`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/resources`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ]

  // Dynamic blog posts
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const blogs = await db.blog.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    })
    blogPages = blogs.map((b) => ({
      url: `${siteUrl}/blog/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  } catch {
    // ignore DB errors
  }

  return [...staticPages, ...blogPages]
}
