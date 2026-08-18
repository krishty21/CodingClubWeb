import { db } from "@/lib/db"
import { getSiteSettings } from "@/lib/site-config"
import BlogClient from "./blog-client"
import { Suspense } from "react"
import BlogLoading from "./loading"

export const revalidate = 300 // 5 mins

export const metadata = {
  title: "Blog — Coding Club NIT Andhra Pradesh",
  description:
    "Insights, tutorials, and stories from the Coding Club NIT Andhra Pradesh community. Learn from fellow developers and share your knowledge.",
  openGraph: {
    title: "Blog — Coding Club NIT Andhra Pradesh",
    description:
      "Insights, tutorials, and stories from the Coding Club NIT Andhra Pradesh community.",
  },
}

export default async function BlogPage() {
  const settings = await getSiteSettings()

  const heroTitle = settings.blog_hero_title || "Stories, Ideas & Code"
  const heroDescription =
    settings.blog_hero_description ||
    "Insights, tutorials, and experiences from our coding community. Learn from fellow developers and share your knowledge."

  // Fetch everything in parallel for SSR
  const [blogs, categories, tags, trending] = await Promise.all([
    db.blog.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            bio: true,
            role: true,
          },
        },
        category: { select: { name: true, slug: true, color: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
      },
    }),
    db.blogCategory.findMany({
      where: { blogs: { some: { published: true } } },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        iconName: true,
        _count: { select: { blogs: { where: { published: true } } } },
      },
    }),
    db.blogTag.findMany({
      where: { blogs: { some: { blog: { published: true } } } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    // Trending: top 5 by engagement score
    db.blog.findMany({
      where: { published: true },
      orderBy: [{ viewCount: "desc" }, { likeCount: "desc" }],
      take: 5,
      include: {
        author: { select: { displayName: true, avatar: true, role: true } },
        category: { select: { name: true, slug: true, color: true } },
      },
    }),
  ])

  // Format blogs for client
  const formattedBlogs = blogs.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    coverImage: p.coverImage || "/placeholder.svg",
    publishedAt: p.publishedAt?.toISOString() || p.createdAt.toISOString(),
    readTime: p.readTime || "5 min read",
    featured: p.featured,
    viewCount: p.viewCount,
    likeCount: p.likeCount,
    bookmarkCount: p.bookmarkCount,
    author: {
      id: p.author?.id || "",
      name: p.author?.displayName || "Coding Club",
      avatar: p.author?.avatar || "/placeholder.svg",
      bio: p.author?.bio || "",
      role: p.author?.role || "",
    },
    category: p.category
      ? { name: p.category.name, slug: p.category.slug, color: p.category.color || "#4A90E2" }
      : null,
    tags: p.tags.map((tm) => tm.tag.name),
  }))

  const formattedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    color: c.color || "#4A90E2",
    iconName: c.iconName || "Hash",
    count: c._count.blogs,
  }))

  const formattedTags = tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug }))

  const formattedTrending = trending.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    coverImage: p.coverImage || "/placeholder.svg",
    publishedAt: p.publishedAt?.toISOString() || p.createdAt.toISOString(),
    readTime: p.readTime || "5 min read",
    viewCount: p.viewCount,
    likeCount: p.likeCount,
    author: {
      name: p.author?.displayName || "Coding Club",
      avatar: p.author?.avatar || "/placeholder.svg",
      role: p.author?.role || "",
    },
    category: p.category
      ? { name: p.category.name, slug: p.category.slug, color: p.category.color || "#4A90E2" }
      : null,
  }))

  return (
    <Suspense fallback={<BlogLoading />}>
      <BlogClient
        blogs={formattedBlogs}
        categories={formattedCategories}
        tags={formattedTags}
        trending={formattedTrending}
        heroTitle={heroTitle}
        heroDescription={heroDescription}
      />
    </Suspense>
  )
}
