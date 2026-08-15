"use client"

import { Suspense, useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Code, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { IconByName } from "@/lib/icon-client"
import dynamic from "next/dynamic"

// Lazy-load the 3D component so it never ships in the SSR bundle.
const Hero3DLazy = dynamic(() => import("@/components/hero-3d"), {
  ssr: false,
  loading: () => null,
})

interface HeroStat {
  id: string
  iconName: string
  value: string
  label: string
  description: string
  gradient: string
}

interface HeroSectionProps {
  settings: {
    hero_title_line_1?: string
    hero_title_line_2?: string
    hero_subtitle?: string
    hero_description?: string
    hero_cta_primary_label?: string
    hero_cta_primary_href?: string
    hero_cta_secondary_label?: string
    hero_cta_secondary_href?: string
  }
  stats: HeroStat[]
}

export default function HeroSection({ settings, stats }: HeroSectionProps) {
  const primaryHref = settings.hero_cta_primary_href || "#domains"
  const secondaryHref = settings.hero_cta_secondary_href || "/events"
  const primaryLabel = settings.hero_cta_primary_label || "Explore Projects"
  const secondaryLabel = settings.hero_cta_secondary_label || "Upcoming Events"

  const isPrimaryInternal = primaryHref.startsWith("/") || primaryHref.startsWith("#")
  const isSecondaryInternal = secondaryHref.startsWith("/") || secondaryHref.startsWith("#")

  // Lazy-load the 3D hero only on capable devices (after mount to avoid hydration mismatch)
  const [show3D, setShow3D] = useState(false)
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const isMobile = window.matchMedia("(max-width: 768px)").matches
    if (!prefersReduced && !isMobile) {
      // Defer to next tick to avoid hydration mismatch
      const t = setTimeout(() => setShow3D(true), 0)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0B1121] via-[#050A15] to-[#02040A] pt-24">
      {/* Premium animated background layers */}
      <div className="absolute inset-0 premium-bg" aria-hidden />
      <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" aria-hidden />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: "2s" }}
        aria-hidden
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse"
        style={{ animationDelay: "4s" }}
        aria-hidden
      />

      {/* 3D Background (lazy-loaded) */}
      {show3D && (
        <Suspense fallback={null}>
          <Hero3DLazy />
        </Suspense>
      )}

      {/* Floating particles */}
      <FloatingParticles />

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" aria-hidden />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="space-y-4 animate-slide-in-up"
        >
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold font-heading leading-tight tracking-tight py-2">
            <span className="block text-shimmer pb-3">
              {settings.hero_title_line_1 || "Coding Club"}
            </span>
            <span className="block bg-gradient-to-r from-gray-100 via-gray-300 to-gray-500 bg-clip-text text-transparent pb-3">
              {settings.hero_title_line_2 || "NIT Andhra Pradesh"}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-blue-400 font-semibold tracking-wide"
          >
            {settings.hero_subtitle || "From Code to Creativity, We Build It All"}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            {settings.hero_description ||
              "Empowering students through technology, innovation, and collaborative learning. Join NIT Andhra Pradesh's premier coding community where passion meets purpose."}
          </motion.p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {isPrimaryInternal ? (
            <Link href={primaryHref}>
              <Button
                size="lg"
                className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/50 btn-premium btn-shimmer"
              >
                <Code className="mr-2 h-5 w-5" />
                {primaryLabel}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
          ) : (
            <Button
              size="lg"
              asChild
              className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/50 btn-premium btn-shimmer"
            >
              <a href={primaryHref} target="_blank" rel="noopener noreferrer">
                <Code className="mr-2 h-5 w-5" />
                {primaryLabel}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </Button>
          )}
          {isSecondaryInternal ? (
            <Link href={secondaryHref}>
              <Button
                size="lg"
                variant="outline"
                className="glass border-white/20 text-white px-8 py-3 text-lg font-semibold rounded-xl hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 btn-premium btn-shimmer"
              >
                <Calendar className="mr-2 h-5 w-5" />
                {secondaryLabel}
              </Button>
            </Link>
          ) : (
            <Button
              size="lg"
              variant="outline"
              asChild
              className="glass border-white/20 text-white px-8 py-3 text-lg font-semibold rounded-xl hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 btn-premium btn-shimmer"
            >
              <a href={secondaryHref} target="_blank" rel="noopener noreferrer">
                <Calendar className="mr-2 h-5 w-5" />
                {secondaryLabel}
              </a>
            </Button>
          )}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full pb-12"
        >
          {stats.map((stat, index) => {
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group relative card-premium rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-500 overflow-hidden"
              >
                {/* Spotlight effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />

                <div className="relative z-10">
                  <div
                    className={`flex items-center justify-center w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <IconByName name={stat.iconName} className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-100 font-medium mt-2">{stat.label}</div>
                  {stat.description && (
                    <div className="text-sm text-gray-400 mt-1">{stat.description}</div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        aria-hidden
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1.5">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
        </div>
      </motion.div>
    </section>
  )
}

/**
 * Floating particle elements for ambient depth.
 * Uses a deterministic seed (useMemo with empty deps) so SSR and client
 * produce identical output — avoids hydration mismatch.
 * Particles only animate after mount.
 */
function FloatingParticles() {
  // Deterministic pseudo-random based on index — same on server and client
  const particles = useMemo(() => {
    const seed = (i: number) => {
      // Simple LCG seeded by index — deterministic across SSR & client
      const x = Math.sin(i * 9999.7) * 10000
      return x - Math.floor(x)
    }
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      // Round to 2 decimals to avoid SSR vs client floating-point precision mismatch
      size: Math.round((seed(i) * 2.5 + 1) * 100) / 100,
      x: Math.round(seed(i + 100) * 10000) / 100,
      y: Math.round(seed(i + 200) * 10000) / 100,
      delay: Math.round(seed(i + 300) * 500) / 100,
      duration: Math.round((seed(i + 400) * 10 + 12) * 100) / 100,
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white/30"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
