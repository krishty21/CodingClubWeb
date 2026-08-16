"use client"

import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import { injectHeadingIds, generateTocFromMarkdown, type TocItem } from "@/lib/blog-utils"
import DOMPurify from "dompurify"

interface ArticleContentProps {
  content: string
  toc: TocItem[]
}

/**
 * ArticleContent — renders article content with:
 *   - Markdown support (via react-markdown + remark-gfm + rehype-raw + rehype-highlight)
 *   - HTML support (TipTap output is HTML — passes through rehype-raw)
 *   - Click-to-zoom on images
 *   - Copy button on code blocks
 *   - Language label on code blocks
 *   - Active TOC link highlighting on scroll
 *
 * The content can be either:
 *   - Plain markdown (old seeded posts)
 *   - HTML (TipTap editor output for new posts)
 * React-markdown handles both: HTML passes through via rehype-raw, and
 * markdown is converted to HTML.
 */
export default function ArticleContent({ content, toc }: ArticleContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [activeHeadingId, setActiveHeadingId] = useState("")

  // Click-to-zoom on images + code block copy buttons (after render)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Image click-to-zoom
    const images = container.querySelectorAll("img")
    const imageHandlers: Array<{ img: HTMLImageElement; handler: (e: Event) => void }> = []
    images.forEach((img) => {
      const handler = (e: Event) => {
        e.preventDefault()
        setZoomedImage((img as HTMLImageElement).src)
      }
      img.addEventListener("click", handler)
      ;(img as HTMLElement).style.cursor = "zoom-in"
      imageHandlers.push({ img: img as HTMLImageElement, handler })
    })

    // Code block: add copy button + language label
    const codeBlocks = container.querySelectorAll("pre")
    const buttons: HTMLButtonElement[] = []
    codeBlocks.forEach((pre) => {
      // Skip if already wrapped
      if (pre.parentElement?.classList.contains("code-block-wrapper")) {
        // Re-add the copy button if missing
        const existingBtn = pre.querySelector(".code-block-copy-btn")
        if (existingBtn) return
      }

      // Wrap in a relative container if not already
      if (!pre.parentElement?.classList.contains("code-block-wrapper")) {
        const wrapper = document.createElement("div")
        wrapper.className = "code-block-wrapper"
        pre.parentNode?.insertBefore(wrapper, pre)
        wrapper.appendChild(pre)
      }

      // Language label
      const code = pre.querySelector("code")
      if (code) {
        const langClass = Array.from(code.classList).find((c) => c.startsWith("language-"))
        if (langClass && !pre.querySelector(".code-block-lang-label")) {
          const langName = langClass.replace("language-", "").toUpperCase()
          const label = document.createElement("div")
          label.className = "code-block-lang-label"
          label.textContent = langName
          pre.appendChild(label)
        }
      }

      // Copy button
      if (!pre.querySelector(".code-block-copy-btn")) {
        const btn = document.createElement("button")
        btn.className = "code-block-copy-btn"
        btn.textContent = "Copy"
        btn.setAttribute("aria-label", "Copy code to clipboard")
        btn.addEventListener("click", () => {
          const text = pre.querySelector("code")?.textContent || ""
          navigator.clipboard.writeText(text).then(() => {
            btn.textContent = "Copied!"
            setTimeout(() => {
              btn.textContent = "Copy"
            }, 2000)
          })
        })
        pre.appendChild(btn)
        buttons.push(btn)
      }
    })

    return () => {
      imageHandlers.forEach(({ img, handler }) => img.removeEventListener("click", handler))
      buttons.forEach((b) => b.remove())
    }
  }, [content])

  // Active TOC link highlighting on scroll
  useEffect(() => {
    if (toc.length === 0) return

    const container = containerRef.current
    if (!container) return

    const headings = container.querySelectorAll("h2[id], h3[id]")
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveHeadingId(visible[0].target.id)
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: [0, 1],
      },
    )

    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [toc, content])

  // Close zoomed image on Esc
  useEffect(() => {
    if (!zoomedImage) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomedImage(null)
    }
    window.addEventListener("keydown", onEsc)
    return () => window.removeEventListener("keydown", onEsc)
  }, [zoomedImage])

  return (
    <>
      <div ref={containerRef} className="article-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, [rehypeHighlight, { detect: true, ignoreMissing: true }]]}
          components={{
            // Add ids to headings for TOC anchor links
            h2: ({ node, ...props }) => {
              const text = extractText(props.children)
              const id = slugifyHeading(text)
              return <h2 id={id} {...props} />
            },
            h3: ({ node, ...props }) => {
              const text = extractText(props.children)
              const id = slugifyHeading(text)
              return <h3 id={id} {...props} />
            },
            // Open links in new tab
            a: ({ node, ...props }) => (
              <a target="_blank" rel="noopener noreferrer" {...props} />
            ),
          }}
        >
          {DOMPurify.sanitize(content)}
        </ReactMarkdown>
      </div>

      {/* Image zoom overlay */}
      {zoomedImage && (
        <div
          className="image-zoom-overlay"
          onClick={() => setZoomedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed image — click to close"
        >
          <img src={zoomedImage} alt="Zoomed" />
        </div>
      )}

      {/* Active TOC highlight */}
      <ActiveTocScript toc={toc} activeId={activeHeadingId} />
    </>
  )
}

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (Array.isArray(children)) return children.map(extractText).join("")
  if (children && typeof children === "object" && "props" in (children as any)) {
    return extractText((children as any).props.children)
  }
  return ""
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function ActiveTocScript({ toc, activeId }: { toc: TocItem[]; activeId: string }) {
  useEffect(() => {
    if (toc.length === 0) return
    toc.forEach((item) => {
      const link = document.querySelector(`a[href="#${item.id}"]`)
      if (link) {
        if (item.id === activeId) {
          link.classList.add("toc-active")
        } else {
          link.classList.remove("toc-active")
        }
      }
    })
  }, [activeId, toc])

  return null
}
