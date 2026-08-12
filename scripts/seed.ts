/**
 * Database initialization / seed script.
 * Run with: bun run scripts/seed.ts
 *
 * This script:
 *   - Ensures the three roles exist (SUPER_ADMIN, MEMBER, BLOG_AUTHOR)
 *   - Adds the INITIAL_SUPER_ADMIN_ROLL_NUMBER to approved_roll_numbers
 *   - Seeds blog categories, default tags
 *   - Seeds the team members from the original hardcoded data
 *   - Seeds the blog posts from the original hardcoded data
 *   - Creates a placeholder "System Author" for blog posts whose original author isn't a registered user
 *
 * Idempotent: re-running it will not duplicate data.
 */

import { PrismaClient } from "@prisma/client"
import { ROLES } from "../src/lib/rbac"
import { TEAM_DATA, FACULTY_ADVISOR, TEAM_SECTION_LABELS } from "../src/lib/team-data"
import { BLOG_DATA } from "../src/lib/blog-data"
import { slugify } from "../src/lib/storage"
import {
  SITE_SETTINGS,
  HERO_STATS,
  PILLARS,
  DOMAINS,
  EVENTS,
  MISSION_CARDS,
  RESOURCE_ROADMAPS,
  RESOURCE_TOOLKITS,
  RESOURCE_PROJECTS,
  RESOURCE_LINK_CATEGORIES,
  FOOTER_SOCIAL_LINKS,
  FOOTER_QUICK_LINKS,
  FOOTER_CONTACTS,
} from "../src/lib/site-content"

const db = new PrismaClient()

const SUPER_ADMIN_ROLL = process.env.INITIAL_SUPER_ADMIN_ROLL_NUMBER || "000001"

async function ensureRoles(): Promise<Record<string, string>> {
  const roleMap: Record<string, string> = {}
  for (const name of Object.values(ROLES)) {
    const role = await db.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} role` },
    })
    roleMap[name] = role.id
  }
  return roleMap
}

async function seedCategories(): Promise<Record<string, string>> {
  const categories = [
    { name: "Web Development", slug: "web-development" },
    { name: "Interview Experience", slug: "interview-experience" },
    { name: "Machine Learning", slug: "machine-learning" },
    { name: "DSA Concepts", slug: "dsa-concepts" },
    { name: "Project Walkthrough", slug: "project-walkthrough" },
    { name: "Latest Tech", slug: "latest-tech" },
  ]
  const catMap: Record<string, string> = {}
  for (const cat of categories) {
    const row = await db.blogCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    catMap[cat.name] = row.id
    catMap[cat.slug] = row.id
  }
  return catMap
}

async function seedTags(): Promise<Record<string, string>> {
  const allTags = new Set<string>()
  for (const post of BLOG_DATA) {
    for (const t of post.tags) allTags.add(t)
  }
  const tagMap: Record<string, string> = {}
  for (const name of allTags) {
    const slug = slugify(name)
    const row = await db.blogTag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    })
    tagMap[name] = row.id
  }
  return tagMap
}

async function seedBlogAuthors(): Promise<Record<string, string>> {
  // Create one BlogAuthor per unique authorName from BLOG_DATA
  const authorMap: Record<string, string> = {}
  const seen = new Set<string>()
  for (const post of BLOG_DATA) {
    if (seen.has(post.authorName)) continue
    seen.add(post.authorName)
    const author = await db.blogAuthor.findFirst({
      where: { displayName: post.authorName },
    })
    if (author) {
      authorMap[post.authorName] = author.id
    } else {
      const newAuthor = await db.blogAuthor.create({
        data: {
          displayName: post.authorName,
          bio: post.authorBio,
          avatar: post.authorAvatar,
          isApproved: true,
        },
      })
      authorMap[post.authorName] = newAuthor.id
    }
  }
  return authorMap
}

async function seedBlogs(catMap: Record<string, string>, tagMap: Record<string, string>, authorMap: Record<string, string>) {
  for (const post of BLOG_DATA) {
    const existing = await db.blog.findUnique({ where: { slug: post.slug } })
    if (existing) {
      // Update tags and basic fields but keep id
      await db.blog.update({
        where: { id: existing.id },
        data: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.image,
          authorId: authorMap[post.authorName] || null,
          categoryId: catMap[post.category] || null,
          published: true,
          featured: post.featured,
          readTime: post.readTime,
          publishedAt: new Date(post.publishedAt),
        },
      })
      // Rebuild tags
      await db.blogTagMap.deleteMany({ where: { blogId: existing.id } })
      for (const t of post.tags) {
        const tagId = tagMap[t]
        if (tagId) {
          await db.blogTagMap.create({ data: { blogId: existing.id, tagId } })
        }
      }
    } else {
      const blog = await db.blog.create({
        data: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.image,
          authorId: authorMap[post.authorName] || null,
          categoryId: catMap[post.category] || null,
          published: true,
          featured: post.featured,
          readTime: post.readTime,
          publishedAt: new Date(post.publishedAt),
        },
      })
      for (const t of post.tags) {
        const tagId = tagMap[t]
        if (tagId) {
          await db.blogTagMap.create({ data: { blogId: blog.id, tagId } })
        }
      }
    }
  }
}

async function seedTeamMembers() {
  // Find the faculty advisor user (or create a placeholder user record)
  // Team members without an associated user account get a synthetic user record.
  let order = 0
  for (const [sectionKey, members] of Object.entries(TEAM_DATA)) {
    const category = TEAM_SECTION_LABELS[sectionKey] || "Member"
    for (const m of members) {
      order += 1
      const existing = await db.teamMember.findFirst({
        where: { name: m.name },
      })
      if (existing) {
        // Update
        await db.teamMember.update({
          where: { id: existing.id },
          data: {
            bio: m.bio || null,
            profileImage: m.image,
            strengths: JSON.stringify(m.skills || []),
            displayOrder: order,
            isActive: true,
            category,
          },
        })
        // Rebuild social links
        await db.socialLink.deleteMany({ where: { teamMemberId: existing.id } })
        if (m.social) {
          if (m.social.github) {
            await db.socialLink.create({
              data: { teamMemberId: existing.id, platform: "github", url: m.social.github },
            })
          }
          if (m.social.linkedin) {
            await db.socialLink.create({
              data: { teamMemberId: existing.id, platform: "linkedin", url: m.social.linkedin },
            })
          }
          if (m.social.twitter) {
            await db.socialLink.create({
              data: { teamMemberId: existing.id, platform: "twitter", url: m.social.twitter },
            })
          }
        }
      } else {
        // Create placeholder user record (no email - they haven't logged in)
        const placeholderEmail = `placeholder+${slugify(m.name)}@local`
        const user = await db.user.create({
          data: {
            email: placeholderEmail,
            name: m.name,
            isActive: false,
          },
        })
        const tm = await db.teamMember.create({
          data: {
            userId: user.id,
            name: m.name,
            bio: m.bio || null,
            profileImage: m.image,
            strengths: JSON.stringify(m.skills || []),
            displayOrder: order,
            isActive: true,
            category,
          },
        })
        if (m.social) {
          if (m.social.github) {
            await db.socialLink.create({
              data: { teamMemberId: tm.id, platform: "github", url: m.social.github },
            })
          }
          if (m.social.linkedin) {
            await db.socialLink.create({
              data: { teamMemberId: tm.id, platform: "linkedin", url: m.social.linkedin },
            })
          }
          if (m.social.twitter) {
            await db.socialLink.create({
              data: { teamMemberId: tm.id, platform: "twitter", url: m.social.twitter },
            })
          }
        }
      }
    }
  }
}

// =========================================================
// DYNAMIC CONTENT SEEDERS
// =========================================================

async function seedSiteSettings() {
  for (const [key, value] of Object.entries(SITE_SETTINGS)) {
    await db.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  }
}

async function seedHeroStats() {
  for (const stat of HERO_STATS) {
    const existing = await db.heroStat.findFirst({
      where: { label: stat.label },
    })
    if (existing) {
      await db.heroStat.update({
        where: { id: existing.id },
        data: {
          iconName: stat.iconName,
          value: stat.value,
          description: stat.description || null,
          gradient: stat.gradient,
          displayOrder: stat.displayOrder,
          isActive: true,
        },
      })
    } else {
      await db.heroStat.create({
        data: {
          iconName: stat.iconName,
          value: stat.value,
          label: stat.label,
          description: stat.description || null,
          gradient: stat.gradient,
          displayOrder: stat.displayOrder,
        },
      })
    }
  }
}

async function seedPillars() {
  for (const p of PILLARS) {
    const existing = await db.pillar.findFirst({ where: { title: p.title } })
    if (existing) {
      await db.pillar.update({
        where: { id: existing.id },
        data: {
          description: p.description,
          iconName: p.iconName,
          colorFrom: p.colorFrom,
          colorTo: p.colorTo,
          features: p.features,
          displayOrder: p.displayOrder,
          isActive: true,
        },
      })
    } else {
      await db.pillar.create({ data: p })
    }
  }
}

async function seedDomains() {
  for (const d of DOMAINS) {
    const existing = await db.domain.findFirst({ where: { title: d.title } })
    if (existing) {
      await db.domain.update({
        where: { id: existing.id },
        data: {
          description: d.description,
          iconName: d.iconName,
          color: d.color,
          displayOrder: d.displayOrder,
          isActive: true,
        },
      })
    } else {
      await db.domain.create({ data: d })
    }
  }
}

async function seedEvents() {
  for (const e of EVENTS) {
    const existing = await db.event.findFirst({ where: { title: e.title } })
    const data = {
      description: e.description,
      date: new Date(e.date),
      time: e.time,
      location: e.location,
      type: e.type,
      status: e.status,
      image: e.image || null,
      registrations: e.registrations,
      maxRegistrations: e.maxRegistrations,
      displayOrder: e.displayOrder,
      isActive: true,
    }
    if (existing) {
      await db.event.update({ where: { id: existing.id }, data })
    } else {
      await db.event.create({ data: { title: e.title, ...data } })
    }
  }
}

async function seedMissionCards() {
  for (const m of MISSION_CARDS) {
    const existing = await db.missionCard.findFirst({ where: { title: m.title } })
    if (existing) {
      await db.missionCard.update({
        where: { id: existing.id },
        data: {
          description: m.description,
          iconName: m.iconName,
          displayOrder: m.displayOrder,
          isActive: true,
        },
      })
    } else {
      await db.missionCard.create({ data: m })
    }
  }
}

async function seedResources() {
  // Roadmaps
  for (const r of RESOURCE_ROADMAPS) {
    const existing = await db.resourceItem.findFirst({ where: { category: "roadmap", title: r.title } })
    const data = {
      description: r.description,
      difficulty: r.difficulty || null,
      duration: r.duration || null,
      topics: JSON.stringify(r.topics),
      url: r.url || null,
    }
    if (existing) {
      await db.resourceItem.update({ where: { id: existing.id }, data })
    } else {
      await db.resourceItem.create({ data: { category: "roadmap", title: r.title, ...data } })
    }
  }
  // Toolkits
  for (const t of RESOURCE_TOOLKITS) {
    const existing = await db.resourceItem.findFirst({ where: { category: "toolkit", title: t.title } })
    const data = {
      description: t.description,
      tools: JSON.stringify(t.tools),
      toolkitCategory: t.toolkitCategory,
      downloads: t.downloads,
    }
    if (existing) {
      await db.resourceItem.update({ where: { id: existing.id }, data })
    } else {
      await db.resourceItem.create({ data: { category: "toolkit", title: t.title, ...data } })
    }
  }
  // Projects
  for (const p of RESOURCE_PROJECTS) {
    const existing = await db.resourceItem.findFirst({ where: { category: "project", title: p.title } })
    const data = {
      description: p.description,
      tech: JSON.stringify(p.tech),
      author: p.author,
      stars: p.stars,
      github: p.github,
    }
    if (existing) {
      await db.resourceItem.update({ where: { id: existing.id }, data })
    } else {
      await db.resourceItem.create({ data: { category: "project", title: p.title, ...data } })
    }
  }
  // Link categories + nested links
  let linkOrder = 0
  for (const cat of RESOURCE_LINK_CATEGORIES) {
    let catRow = await db.resourceItem.findFirst({ where: { category: "link_category", title: cat.title } })
    if (!catRow) {
      catRow = await db.resourceItem.create({
        data: { category: "link_category", title: cat.title, displayOrder: linkOrder++ },
      })
    } else {
      await db.resourceItem.update({
        where: { id: catRow.id },
        data: { displayOrder: linkOrder++, isActive: true },
      })
    }
    // Delete existing child links and recreate
    await db.resourceItem.deleteMany({ where: { category: "link", parentId: catRow.id } })
    let childOrder = 0
    for (const link of cat.resources) {
      await db.resourceItem.create({
        data: {
          category: "link",
          parentId: catRow.id,
          title: link.name,
          description: link.description,
          url: link.url,
          displayOrder: childOrder++,
        },
      })
    }
  }
}

async function seedFooter() {
  // Social links
  for (const s of FOOTER_SOCIAL_LINKS) {
    await db.footerLink.upsert({
      where: { platform: s.platform },
      update: {
        label: s.label,
        url: s.url,
        iconName: s.iconName,
        displayOrder: s.displayOrder,
        isActive: true,
      },
      create: s,
    })
  }
  // Quick links
  for (const q of FOOTER_QUICK_LINKS) {
    const existing = await db.footerQuickLink.findFirst({ where: { label: q.label } })
    if (existing) {
      await db.footerQuickLink.update({
        where: { id: existing.id },
        data: { href: q.href, displayOrder: q.displayOrder, isActive: true },
      })
    } else {
      await db.footerQuickLink.create({ data: q })
    }
  }
  // Contacts
  for (const c of FOOTER_CONTACTS) {
    const existing = await db.footerContact.findFirst({ where: { label: c.label } })
    if (existing) {
      await db.footerContact.update({
        where: { id: existing.id },
        data: { value: c.value, iconName: c.iconName, displayOrder: c.displayOrder, isActive: true },
      })
    } else {
      await db.footerContact.create({ data: c })
    }
  }
}

async function main() {
  console.log("→ Ensuring roles exist...")
  await ensureRoles()
  console.log("  ✓ Roles ensured")

  console.log(`→ Whitelisting initial super admin roll number ${SUPER_ADMIN_ROLL}...`)
  await db.approvedRollNumber.upsert({
    where: { rollNumber: SUPER_ADMIN_ROLL },
    update: {},
    create: {
      rollNumber: SUPER_ADMIN_ROLL,
      email: `${SUPER_ADMIN_ROLL}@student.nitandhra.ac.in`,
      notes: "Bootstrapped super admin (initial).",
    },
  })
  console.log("  ✓ Initial super admin whitelisted")

  console.log("→ Whitelisting bootstrap coding@nitandhra.ac.in (roll CODING)...")
  await db.approvedRollNumber.upsert({
    where: { rollNumber: "CODING" },
    update: {},
    create: {
      rollNumber: "CODING",
      email: "coding@nitandhra.ac.in",
      notes: "Bootstrap super-admin email (coding@nitandhra.ac.in).",
    },
  })
  console.log("  ✓ coding@nitandhra.ac.in whitelisted")

  console.log("→ Whitelisting legacy super admin roll numbers (424161, 424157)...")
  for (const roll of ["424161", "424157"]) {
    await db.approvedRollNumber.upsert({
      where: { rollNumber: roll },
      update: {},
      create: {
        rollNumber: roll,
        email: `${roll}@student.nitandhra.ac.in`,
        notes: "Hardcoded super admin (legacy).",
      },
    })
  }
  console.log("  ✓ Legacy super admins whitelisted")

  console.log("→ Seeding blog categories...")
  const catMap = await seedCategories()
  console.log(`  ✓ ${Object.keys(catMap).length / 2} categories`)

  console.log("→ Seeding blog tags...")
  const tagMap = await seedTags()
  console.log(`  ✓ ${Object.keys(tagMap).length} tags`)

  console.log("→ Seeding blog authors...")
  const authorMap = await seedBlogAuthors()
  console.log(`  ✓ ${Object.keys(authorMap).length} authors`)

  console.log("→ Seeding blogs...")
  await seedBlogs(catMap, tagMap, authorMap)
  console.log(`  ✓ ${BLOG_DATA.length} blogs`)

  console.log("→ Seeding team members...")
  await seedTeamMembers()
  const total = Object.values(TEAM_DATA).reduce((acc, arr) => acc + arr.length, 0)
  console.log(`  ✓ ${total} team members`)

  console.log("→ Seeding site settings...")
  await seedSiteSettings()
  console.log(`  ✓ ${Object.keys(SITE_SETTINGS).length} site settings`)

  console.log("→ Seeding hero stats...")
  await seedHeroStats()
  console.log(`  ✓ ${HERO_STATS.length} hero stats`)

  console.log("→ Seeding pillars (Who We Are)...")
  await seedPillars()
  console.log(`  ✓ ${PILLARS.length} pillars`)

  console.log("→ Seeding domains...")
  await seedDomains()
  console.log(`  ✓ ${DOMAINS.length} domains`)

  console.log("→ Seeding events...")
  await seedEvents()
  console.log(`  ✓ ${EVENTS.length} events`)

  console.log("→ Seeding mission cards (About page)...")
  await seedMissionCards()
  console.log(`  ✓ ${MISSION_CARDS.length} mission cards`)

  console.log("→ Seeding resource items...")
  await seedResources()
  const totalResources = RESOURCE_ROADMAPS.length + RESOURCE_TOOLKITS.length + RESOURCE_PROJECTS.length + RESOURCE_LINK_CATEGORIES.length + RESOURCE_LINK_CATEGORIES.reduce((acc, c) => acc + c.resources.length, 0)
  console.log(`  ✓ ${totalResources} resource items`)

  console.log("→ Seeding footer content...")
  await seedFooter()
  console.log(`  ✓ footer content (social links, quick links, contacts)`)

  console.log("\n✅ Seed complete.")
  console.log("\nNext steps:")
  console.log("  1. Sign in with Google using an approved @student.nitandhra.ac.in email.")
  console.log("  2. The first whitelisted roll number will receive MEMBER role by default.")
  console.log(`  3. Roll number ${SUPER_ADMIN_ROLL} (initial) receives SUPER_ADMIN automatically.`)
  console.log("  4. Visit /dashboard/admin > Content tab to edit any visible content on the site.")
}

main()
  .catch((err) => {
    console.error("Seed failed:", err)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
