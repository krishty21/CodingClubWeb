import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Eye, Calendar } from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import PremiumPageBackground from "@/components/premium-page-background"
import ArticleContent from "@/components/blog/article-content"
import ArticleActions from "@/components/blog/article-actions"
import RelatedArticles from "@/components/blog/related-articles"
import AuthorCard from "@/components/blog/author-card"
import { generateToc, type TocItem } from "@/lib/blog-utils"
import type { Metadata } from "next"

export const revalidate = 300 // 5 mins

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * generateMetadata — per-post SEO
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const blog = await db.blog.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      author: { select: { displayName: true } },
    },
  })

  if (!blog) return { title: "Article not found" }

  return {
    title: `${blog.title} — Coding Club NIT Andhra Pradesh`,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: "article",
      publishedTime: blog.publishedAt?.toISOString(),
      authors: [blog.author?.displayName || "Coding Club"],
      images: blog.coverImage ? [{ url: blog.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: blog.coverImage ? [blog.coverImage] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const blog = await db.blog.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          displayName: true,
          bio: true,
          avatar: true,
          role: true,
          skills: true,
          github: true,
          linkedin: true,
          twitter: true,
        },
      },
      category: { select: { name: true, slug: true, color: true } },
      tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      bookmarks: { select: { id: true } },
      likes: { select: { id: true } },
    },
  })

  if (!blog || !blog.published) {
    notFound()
  }

  // Increment view count fire-and-forget (dedup would require cookie/IP — left as a future enhancement)
  db.blog
    .update({
      where: { id: blog.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {})

  // Generate table of contents from article content (auto-detects markdown vs HTML)
  const toc = generateToc(blog.content)

  // Parse author skills
  let authorSkills: string[] = []
  try {
    authorSkills = JSON.parse(blog.author?.skills || "[]")
  } catch {
    authorSkills = []
  }

  // Serialize blog for client component
  const articleData = {
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt,
    content: blog.content,
    coverImage: blog.coverImage || "/placeholder.svg",
    publishedAt: blog.publishedAt?.toISOString() || blog.createdAt.toISOString(),
    readTime: blog.readTime || "5 min read",
    viewCount: blog.viewCount,
    likeCount: blog.likeCount,
    bookmarkCount: blog.bookmarkCount,
    category: blog.category
      ? { name: blog.category.name, slug: blog.category.slug, color: blog.category.color }
      : null,
    tags: blog.tags.map((tm) => tm.tag.name),
    author: blog.author
      ? {
          id: blog.author.id,
          name: blog.author.displayName,
          bio: blog.author.bio || "",
          avatar: blog.author.avatar || "/placeholder.svg",
          role: blog.author.role || "",
          skills: authorSkills,
          github: blog.author.github || "",
          linkedin: blog.author.linkedin || "",
          twitter: blog.author.twitter || "",
        }
      : null,
  }

  return (
    <main className="min-h-screen relative">
      <PremiumPageBackground />
      <Navigation />

      {/* Reading progress bar (client) */}
      <ArticleActions slug={blog.slug} />

      {/* Cover image */}
      <section className="pt-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>

          {/* Category */}
          {blog.category && (
            <Link
              href={`/blog?category=${blog.category.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full text-xs font-semibold glass-strong border"
              style={{
                borderColor: `${blog.category.color}40`,
                color: blog.category.color,
                background: `${blog.category.color}15`,
              }}
            >
              {blog.category.name}
            </Link>
          )}

          {/* Title */}
          <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg text-gray-300 mb-6 max-w-3xl">{blog.excerpt}</p>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
            {blog.author && (
              <div className="flex items-center gap-2">
                <img
                  src={blog.author.avatar || "/placeholder.svg"}
                  alt={blog.author.displayName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
                />
                <span className="text-white font-medium">{blog.author.displayName}</span>
              </div>
            )}
            <span className="w-1 h-1 bg-gray-500 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(blog.publishedAt?.toISOString() || blog.createdAt.toISOString())}
            </span>
            <span className="w-1 h-1 bg-gray-500 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {blog.readTime || "5 min read"}
            </span>
            <span className="w-1 h-1 bg-gray-500 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {blog.viewCount} views
            </span>
          </div>
        </div>
      </section>

      {/* Cover image */}
      {blog.coverImage && (
        <section className="relative z-10 mb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* Main reading area */}
      <section className="relative z-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
            {/* Article body */}
            <div className="min-w-0">
              <ArticleContent content={blog.content} toc={toc} />

              {/* Tags */}
              {blog.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tm) => (
                      <span
                        key={tm.tag.id}
                        className="px-3 py-1 rounded-md bg-white/5 text-gray-300 text-xs font-medium border border-white/10 hover:border-[#4A90E2]/40 hover:text-[#4A90E2] transition-colors"
                      >
                        #{tm.tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Author card */}
              {articleData.author && (
                <div className="mt-12">
                  <AuthorCard author={articleData.author} />
                </div>
              )}

              {/* Related articles */}
              <div className="mt-16">
                <RelatedArticles slug={blog.slug} />
              </div>
            </div>

            {/* Sidebar: Table of Contents */}
            <aside className="hidden lg:block">
              {toc.length > 0 && (
                <div className="sticky top-24">
                  <div className="glass-strong rounded-xl border border-white/10 p-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      On this page
                    </h4>
                    <nav className="space-y-0.5">
                      {toc.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={`toc-link ${item.level === 3 ? "toc-h3" : ""}`}
                        >
                          {item.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
