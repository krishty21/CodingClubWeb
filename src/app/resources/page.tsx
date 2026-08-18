import ResourcesContent from "@/components/resources-content"
import { getSiteSettings, getResourceItems } from "@/lib/site-config"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Curated learning roadmaps, development toolkits, club projects, and curated links to accelerate your coding journey.",
}

export const revalidate = 3600 // 1 hour

export default async function ResourcesPage() {
  const [settings, allItems] = await Promise.all([getSiteSettings(), getResourceItems()])

  const roadmaps = allItems.filter((i) => i.category === "roadmap")
  const toolkits = allItems.filter((i) => i.category === "toolkit")
  const projects = allItems.filter((i) => i.category === "project")
  const linkCategoryItems = allItems.filter((i) => i.category === "link_category")
  const linkItems = allItems.filter((i) => i.category === "link")

  const linkCategories = linkCategoryItems.map((cat) => ({
    id: cat.id,
    title: cat.title,
    links: linkItems
      .filter((l) => l.parentId === cat.id)
      .map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        url: l.url,
      })),
  }))

  return (
    <main className="min-h-screen relative">
      <ResourcesContent
        roadmaps={roadmaps}
        toolkits={toolkits}
        projects={projects}
        linkCategories={linkCategories}
        settings={settings}
      />
    </main>
  )
}
