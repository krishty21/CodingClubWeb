import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileText, Eye, Heart } from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import PremiumPageBackground from "@/components/premium-page-background"
import AuthorCard from "@/components/blog/author-card"
import type { Metadata } from "next"

export const revalidate = 300 // 5 mins

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const author = await db.blogAuthor.findUnique({
    where: { id },
    select: { displayName: true, bio: true },
  })
  if (!author) return { title: "Author not found" }
  return {
    title: `${author.displayName} — Coding Club NIT Andhra Pradesh`,
    description: author.bio || `Articles by ${author.displayName}`,
  }
}

export default async function AuthorPage({ params }: PageProps) {
  const { id } = await params
  const author = await db.blogAuthor.findUnique({
    where: { id },
    include: {
      blogs: {
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        include: {
          category: { select: { name: true, slug: true, color: true } },
        },
      },
    },
  })

  if (!author || !author.isApproved) {
    notFound()
  }

  let skills: string[] = []
  try {
    skills = JSON.parse(author.skills || "[]")
  } catch {
    skills = []
  }

  const totalViews = author.blogs.reduce((sum, b) => sum + b.viewCount, 0)
  const totalLikes = author.blogs.reduce((sum, b) => sum + b.likeCount, 0)

  const authorData = {
    id: author.id,
    name: author.displayName,
    bio: author.bio || "",
    avatar: author.avatar || "/placeholder.svg",
    role: author.role || "",
    skills,
    github: author.github || "",
    linkedin: author.linkedin || "",
    twitter: author.twitter || "",
    postCount: author.blogs.length,
    totalViews,
    totalLikes,
  }

  return (
    <main className="min-h-screen relative">
      <PremiumPageBackground />
      <Navigation />

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>

          <AuthorCard author={authorData} />
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-bold text-2xl text-white mb-6">
            Articles by {author.displayName}
          </h2>

          {author.blogs.length === 0 ? (
            <div className="py-12 text-center glass-strong rounded-2xl border border-white/10">
              <FileText className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No articles published yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {author.blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group block blog-card"
                >
                  <div className="glass-strong rounded-2xl border border-white/10 hover:border-[#4A90E2]/30 transition-all duration-500 p-6 flex flex-col sm:flex-row gap-4">
                    {blog.coverImage && (
                      <div className="relative w-full sm:w-32 h-32 sm:h-24 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {blog.category && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                            style={{
                              borderColor: `${blog.category.color}40`,
                              color: blog.category.color,
                              background: `${blog.category.color}15`,
                            }}
                          >
                            {blog.category.name}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatDate(blog.publishedAt?.toISOString() || blog.createdAt.toISOString())}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-lg mb-1 group-hover:text-[#4A90E2] transition-colors line-clamp-1">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-2">{blog.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {blog.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {blog.likeCount}
                        </span>
                        <span>{blog.readTime || "5 min read"}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
