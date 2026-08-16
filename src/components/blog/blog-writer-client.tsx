"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import DOMPurify from "dompurify"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import {
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  X,
  Eye,
  Edit3,
  Columns,
  Save,
  Send,
  Loader2,
  Tag,
  Hash,
  Clock,
  Globe,
  Settings,
  Heart,
  Bookmark,
  Share2,
  MessageSquare,
  Sparkles,
  CheckCircle,
} from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import PremiumPageBackground from "@/components/premium-page-background"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TipTapEditor } from "@/components/blog/tiptap-editor"

export interface BlogCategory {
  id: string
  name: string
  slug: string
  color: string
}

export interface BlogWriterProps {
  initialData?: {
    id?: string
    title?: string
    slug?: string
    excerpt?: string
    content?: string
    coverImage?: string
    categoryId?: string
    tags?: string[]
    published?: boolean
    readTime?: string
    featured?: boolean
  }
  categories: BlogCategory[]
  user: {
    id: string
    name: string
    image: string
    roles: string[]
  }
}

type ViewMode = "edit" | "split" | "preview"

export default function BlogWriterClient({ initialData, categories, user }: BlogWriterProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState(initialData?.title || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "")
  const [content, setContent] = useState(initialData?.content || "<p>Start writing your story here...</p>")
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "")
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || "")
  const [tags, setTags] = useState<string[]>(initialData?.tags || ["WebDev", "Coding"])
  const [tagInput, setTagInput] = useState("")
  const [readTime, setReadTime] = useState(initialData?.readTime || "3 min read")
  const [featured, setFeatured] = useState(initialData?.featured || false)

  const [viewMode, setViewMode] = useState<ViewMode>("split")
  const [showSettings, setShowSettings] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug)

  const isAdmin = user.roles.includes("ADMIN") || user.roles.includes("SUPER_ADMIN")

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && title.trim()) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
      setSlug(generated)
    }
  }, [title, autoSlug])

  // Clean text word count calculation
  const wordCount = useMemo(() => {
    const plainText = content.replace(/<[^>]*>/g, " ").trim()
    return plainText ? plainText.split(/\s+/).length : 0
  }, [content])

  useEffect(() => {
    const minutes = Math.max(1, Math.ceil(wordCount / 200))
    setReadTime(`${minutes} min read`)
  }, [wordCount])

  // TipTap / Clipboard image upload helper
  const handleImageUploadForTipTap = useCallback(async (file: File): Promise<string> => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size must be under 5MB.",
        variant: "destructive",
      })
      throw new Error("File too large")
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("subdir", "blog")

    const res = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Failed to upload image")
    }

    const { url } = await res.json()
    toast({
      title: "Image Uploaded",
      description: "Image inserted into article successfully.",
    })
    return url
  }, [toast])

  // Cover Image Banner Upload Handler
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const url = await handleImageUploadForTipTap(file)
      setCoverImage(url)
    } catch (err) {
      toast({
        title: "Cover Upload Failed",
        description: err instanceof Error ? err.message : "Failed to upload cover banner.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Tag Management
  const addTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "")
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }

  const removeTag = (t: string) => {
    setTags(tags.filter((x) => x !== t))
  }

  // Active Category details for preview
  const activeCategoryObj = useMemo(() => {
    return categories.find((c) => c.id === categoryId) || categories[0] || null
  }, [categories, categoryId])

  // Save / Publish submit handler
  const handleSave = async (shouldPublish: boolean) => {
    if (!title.trim()) {
      toast({ title: "Title Required", description: "Please enter an article title.", variant: "destructive" })
      return
    }
    if (!excerpt.trim()) {
      toast({ title: "Excerpt Required", description: "Please provide a short summary excerpt.", variant: "destructive" })
      return
    }
    if (!content.trim() || content === "<p></p>") {
      toast({ title: "Content Required", description: "Article content cannot be empty.", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        id: initialData?.id,
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content,
        coverImage: coverImage || null,
        categoryId: categoryId || null,
        tags,
        readTime,
        featured,
        published: shouldPublish,
      }

      const method = initialData?.id ? "PUT" : "POST"
      const endpoint = initialData?.id ? `/api/admin/blogs?id=${initialData.id}` : "/api/admin/blogs"

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save blog post")
      }

      const result = await res.json()

      toast({
        title: shouldPublish ? "Article Published! 🎉" : "Draft Saved! 💾",
        description: shouldPublish
          ? "Your article is live on the Coding Club blog."
          : "Your article draft has been saved successfully.",
      })

      if (shouldPublish) {
        router.push(`/blog/${result.slug}`)
      } else {
        router.push("/blog")
      }
    } catch (err) {
      toast({
        title: "Action Failed",
        description: err instanceof Error ? err.message : "Failed to save article.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen relative flex flex-col bg-[#0b0f17] text-white">
      <PremiumPageBackground />
      <Navigation />

      {/* Action Header Bar */}
      <section className="pt-24 pb-4 px-4 sm:px-8 lg:px-12 border-b border-white/10 relative z-0 backdrop-blur-md bg-black/40">
        <div className="max-w-[1750px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Back Link & Word Counter */}
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-300 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Blogs</span>
            </Link>
            <div className="h-4 w-[1px] bg-white/15 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 font-medium">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{readTime}</span>
            </div>
          </div>

          {/* Middle: View Mode Tabs */}
          <div className="flex items-center bg-white/5 border border-white/10 p-1.5 rounded-xl">
            <button
              onClick={() => setViewMode("edit")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                viewMode === "edit" ? "bg-[#4A90E2] text-white shadow-md font-semibold" : "text-gray-300 hover:text-white"
              }`}
            >
              <span>Write</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                viewMode === "split" ? "bg-[#4A90E2] text-white shadow-md font-semibold" : "text-gray-300 hover:text-white"
              }`}
            >
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                viewMode === "preview" ? "bg-[#4A90E2] text-white shadow-md font-semibold" : "text-gray-300 hover:text-white"
              }`}
            >
              <span>Reader Preview</span>
            </button>
          </div>

          {/* Right: Settings Drawer & Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-xl border border-white/10 text-gray-200 hover:text-white transition-all ${
                showSettings ? "bg-white/15 border-white/20" : "bg-white/5 hover:bg-white/10"
              }`}
              title="Post Settings"
            >
              <span className="text-xs sm:text-sm font-medium px-2">Settings</span>
            </button>

            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => handleSave(false)}
              className="border-white/20 text-white hover:bg-white/10 text-xs sm:text-sm font-medium py-2.5 px-4"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              Save Draft
            </Button>

            <Button
              disabled={isSaving}
              onClick={() => handleSave(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold py-2.5 px-5 shadow-lg shadow-blue-500/25"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              Publish Article
            </Button>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="flex-1 max-w-[1750px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Canvas Area */}
        <div className={`transition-all duration-300 ${showSettings ? "lg:col-span-9" : "lg:col-span-12"}`}>
          <div className="glass-strong border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Cover Image Upload Area */}
            <div className="space-y-2">
              <div className="relative group rounded-xl overflow-hidden border-2 border-dashed border-white/15 bg-white/5 hover:border-[#4A90E2]/50 transition-all min-h-[160px] flex items-center justify-center">
                {coverImage ? (
                  <div className="relative w-full h-64 sm:h-80">
                    <Image
                      src={coverImage}
                      alt="Cover Preview"
                      fill
                      className="object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label className="cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 text-white">
                        <Upload className="w-4 h-4" />
                        <span>Change Cover</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setCoverImage("")}
                        className="bg-red-500/30 hover:bg-red-500/50 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 text-red-200"
                      >
                        <X className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center p-6 text-center w-full">
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-[#4A90E2] animate-spin mb-2" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-sm font-medium text-gray-200">
                      {isUploading ? "Uploading cover banner..." : "Upload Cover Banner Image"}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">Paste image from clipboard or upload PNG, JPG, WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Title Input */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title..."
                className="w-full text-3xl sm:text-4xl lg:text-5xl font-heading font-bold bg-transparent border-b border-transparent focus:border-white/20 text-white placeholder:text-gray-600 focus:outline-none transition-all py-2"
              />
            </div>

            {/* Subtitle / Excerpt */}
            <div>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Title subtitle or short teaser summary..."
                className="w-full text-base sm:text-lg text-gray-300 bg-transparent border-b border-transparent focus:border-white/20 placeholder:text-gray-500 focus:outline-none py-1 transition-all"
              />
            </div>

            {/* Editor Workspace: Split, Write, or Preview */}
            <div className={`grid gap-6 ${viewMode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
              {/* WYSIWYG TipTap Editor (Paste & Drop supported) */}
              {viewMode !== "preview" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                    <span>WYSIWYG Rich Editor (Supports pasting text & clipboard images)</span>
                  </div>
                  <TipTapEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Tell your story... (Paste text, code, or images directly)"
                    onImageUpload={handleImageUploadForTipTap}
                  />
                </div>
              )}

              {/* Medium-Style Reader Live Preview */}
              {viewMode !== "edit" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                    <span>Medium Reader Preview</span>
                  </div>
                  <div className="min-h-[500px] p-6 sm:p-8 bg-[#0e131f] border border-white/10 rounded-xl overflow-y-auto shadow-2xl">
                    {/* Medium Author Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
                      <div className="flex items-center gap-3">
                        <Image
                          src={user.image || "/placeholder.svg"}
                          alt={user.name}
                          width={44}
                          height={44}
                          className="rounded-full ring-2 ring-blue-500/30 object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm">{user.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              Author
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <span>{readTime}</span>
                            <span>•</span>
                            <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center gap-3 text-gray-400">
                        <button className="hover:text-pink-400 transition-colors p-1.5 rounded-full hover:bg-white/5">
                          <Heart className="w-4 h-4" />
                        </button>
                        <button className="hover:text-blue-400 transition-colors p-1.5 rounded-full hover:bg-white/5">
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button className="hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/5">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Medium Title & Subtitle Preview */}
                    <div className="mb-6">
                      {activeCategoryObj && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium mb-4">
                          <Hash className="w-3 h-3" />
                          <span>{activeCategoryObj.name}</span>
                        </div>
                      )}
                      <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white leading-tight mb-3">
                        {title.trim() || "Untitled Story"}
                      </h1>
                      {excerpt.trim() && (
                        <p className="text-lg text-gray-300 leading-relaxed font-light mb-6 border-l-2 border-blue-500/50 pl-4 py-1">
                          {excerpt}
                        </p>
                      )}
                    </div>

                    {/* Medium Hero Banner Preview */}
                    {coverImage && (
                      <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden mb-8 border border-white/10 shadow-lg">
                        <Image
                          src={coverImage}
                          alt={title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Medium Body Article Content */}
                    <div className="prose prose-invert prose-lg max-w-none tiptap-content leading-relaxed space-y-4">
                      {content.trim() && content !== "<p></p>" ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw, rehypeHighlight]}
                        >
                          {DOMPurify.sanitize(content)}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-gray-500 italic">Start writing to see live formatted Medium preview...</p>
                      )}
                    </div>

                    {/* Medium Footer Tags */}
                    {tags.length > 0 && (
                      <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap gap-2">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Post Settings Drawer */}
        {showSettings && (
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-strong border border-white/10 rounded-2xl p-6 space-y-6 sticky top-28">
              <h3 className="font-heading font-semibold text-lg text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <Settings className="w-4 h-4 text-[#4A90E2]" />
                <span>Post Settings</span>
              </h3>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#4A90E2]" />
                  <span>Category</span>
                </Label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/50"
                >
                  <option value="" disabled className="bg-[#0b0f17]">Select a Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0b0f17]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Input */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#4A90E2]" />
                  <span>Tags</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    placeholder="Add tag and press Enter..."
                    className="bg-white/5 border-white/10 text-xs text-white placeholder:text-gray-500"
                  />
                  <Button type="button" onClick={addTag} size="sm" className="bg-white/10 hover:bg-white/20 text-xs">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs px-2.5 py-1 flex items-center gap-1.5"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* URL Slug */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#4A90E2]" />
                    <span>Custom URL Permalink</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => setAutoSlug(!autoSlug)}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    {autoSlug ? "Custom" : "Auto"}
                  </button>
                </div>
                <Input
                  type="text"
                  value={slug}
                  disabled={autoSlug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="my-custom-blog-slug"
                  className="bg-white/5 border-white/10 text-xs text-white font-mono placeholder:text-gray-500"
                />
                <p className="text-[11px] text-gray-400 truncate">/blog/{slug || "..."}</p>
              </div>

              {/* Read Time */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#4A90E2]" />
                  <span>Estimated Read Time</span>
                </Label>
                <Input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="e.g. 5 min read"
                  className="bg-white/5 border-white/10 text-xs text-white"
                />
              </div>

              {/* Admin Featured Option */}
              {isAdmin && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-200">Feature this article</span>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Author Badge */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                <Image
                  src={user.image || "/placeholder.svg"}
                  alt={user.name}
                  width={36}
                  height={36}
                  className="rounded-full ring-2 ring-blue-500/30 object-cover"
                />
                <div className="truncate">
                  <p className="text-xs font-medium text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-gray-400">Author</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
