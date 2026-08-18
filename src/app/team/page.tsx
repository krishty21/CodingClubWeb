import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import PremiumPageBackground from "@/components/premium-page-background"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { db } from "@/lib/db"
import { getSiteSettings, parseJsonArray } from "@/lib/site-config"
import MemberGrid from "@/components/member-grid"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the passionate leaders driving innovation and entrepreneurship at Coding Club, NIT Andhra Pradesh. Our team of secretaries, joint secretaries, executive members, and volunteers.",
  openGraph: {
    title: "Our Team | Coding Club NITAP",
    description:
      "Meet the passionate leaders driving innovation and entrepreneurship at Coding Club, NIT Andhra Pradesh.",
  },
}

export const revalidate = 86400 // 1 day

// Mirrors the MemberGrid's TeamMemberData interface.
// `position` is intentionally omitted — we display `category` under the name instead.
interface TeamMember {
  name: string
  category?: string
  image: string
  bio?: string
  skills?: string[]
  social?: {
    github?: string
    linkedin?: string
    twitter?: string
  }
}

/**
 * Fetch team members from the database and group by category.
 */
async function getTeamMembers(): Promise<{
  coreCommittee: TeamMember[]
  jointSecretaries: TeamMember[]
  executiveMembers: TeamMember[]
  volunteers: TeamMember[]
}> {
  const rows = await db.teamMember.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { displayOrder: "asc" }, { name: "asc" }],
    include: { socialLinks: true },
  })

  const toMember = (m: (typeof rows)[number]): TeamMember => ({
    name: m.name,
    // Display the member's category (e.g. "Secretary", "Volunteer") under their name.
    // The legacy `position` field is intentionally NOT surfaced to the UI.
    category: m.category || undefined,
    image: m.profileImage || "/placeholder.svg",
    bio: m.bio || undefined,
    skills: (() => {
      try {
        return JSON.parse(m.strengths || "[]") as string[]
      } catch {
        return []
      }
    })(),
    social: m.socialLinks?.length
      ? {
          github: m.socialLinks.find((s) => s.platform === "github")?.url || undefined,
          linkedin: m.socialLinks.find((s) => s.platform === "linkedin")?.url || undefined,
          twitter: m.socialLinks.find((s) => s.platform === "twitter")?.url || undefined,
        }
      : undefined,
  })

  const result = {
    coreCommittee: [] as TeamMember[],
    jointSecretaries: [] as TeamMember[],
    executiveMembers: [] as TeamMember[],
    volunteers: [] as TeamMember[],
  }

  for (const row of rows) {
    const m = toMember(row)
    switch (row.category) {
      case "Secretary":
        result.coreCommittee.push(m)
        break
      case "Joint Secretary":
        result.jointSecretaries.push(m)
        break
      case "Executive Member":
        result.executiveMembers.push(m)
        break
      case "Volunteer":
        result.volunteers.push(m)
        break
    }
  }

  return result
}

export default async function TeamPage() {
  const [teamMembers, settings] = await Promise.all([getTeamMembers(), getSiteSettings()])

  const faculty = {
    name: settings.faculty_advisor_name || "Dr. K. Himabindu",
    position: settings.faculty_advisor_position || "Faculty Advisor",
    department: settings.faculty_advisor_department || "Computer Science & Engineering",
    image: settings.faculty_advisor_image || "/placeholder.svg",
    bio: settings.faculty_advisor_bio || "",
    email: settings.faculty_advisor_email || "",
    expertise: parseJsonArray(settings.faculty_advisor_expertise),
  }

  const heroTitle = settings.team_hero_title || "Our Team"
  const heroDescription =
    settings.team_hero_description ||
    "Meet the passionate leaders driving innovation and entrepreneurship at NIT Andhra Pradesh."

  return (
    <main className="min-h-screen relative">
      <PremiumPageBackground />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-heading font-bold text-5xl sm:text-6xl lg:text-7xl mb-6">
            <span className="gradient-text-premium">{heroTitle}</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {heroDescription}
          </p>
        </div>
      </section>

      {/* Faculty Advisor */}
      <section className="px-4 sm:px-6 lg:px-8 mb-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-center mb-12">
            <span className="gradient-text">
              {settings.about_faculty_title_highlight || "Faculty Advisor"}
            </span>
          </h2>
          <div className="glass-strong rounded-3xl p-8 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
            <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-2xl opacity-30" />
                <img
                  src={faculty.image || "/placeholder.svg"}
                  alt={faculty.name}
                  className="relative w-48 h-48 rounded-full object-cover ring-4 ring-white/10"
                />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h3 className="font-heading font-bold text-2xl text-white mb-2">{faculty.name}</h3>
                <p className="text-blue-400 font-semibold mb-1">{faculty.position}</p>
                <p className="text-gray-400 mb-4">{faculty.department}</p>
                <p className="text-gray-300 mb-6 leading-relaxed">{faculty.bio}</p>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                  {faculty.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-500/10 text-blue-300 rounded-full text-sm border border-blue-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <Button
                  asChild
                  className="bg-blue-500 hover:bg-blue-600 cursor-pointer btn-premium"
                >
                  <a href={`mailto:${faculty.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Contact
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <TeamSection title="Secretary" members={teamMembers.coreCommittee} />
      <TeamSection title="Joint Secretaries" members={teamMembers.jointSecretaries} />
      <TeamSection title="Executive Members" members={teamMembers.executiveMembers} />
      <TeamSection title="Volunteers" members={teamMembers.volunteers} />

      <Footer />
    </main>
  )
}

function TeamSection({ title, members }: { title: string; members: TeamMember[] }) {
  if (members.length === 0) return null
  return (
    <section className="px-4 sm:px-6 lg:px-8 mb-20 relative z-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-heading font-bold text-3xl sm:text-4xl text-center mb-12">
          <span className="gradient-text">{title}</span>
        </h2>
        <MemberGrid members={members} />
      </div>
    </section>
  )
}
