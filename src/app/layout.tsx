import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Manrope } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import SessionProviderWrapper from "@/components/session-provider"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
})

const siteUrl = process.env.NEXTAUTH_URL || "https://www.codingclubnitanp.in"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Coding Club, NIT Andhra Pradesh — Innovate. Code. Excel.",
    template: "%s | Coding Club NITAP",
  },
  description:
    "The official website of Coding Club, NIT Andhra Pradesh. Empowering students through technology, innovation, and collaborative learning. Join our community of developers, participate in workshops, contests, and hackathons.",
  keywords: [
    "Coding Club",
    "NIT Andhra Pradesh",
    "NITAP",
    "programming",
    "web development",
    "competitive programming",
    "machine learning",
    "open source",
    "hackathon",
    "student community",
  ],
  authors: [{ name: "Coding Club, NIT Andhra Pradesh" }],
  creator: "Coding Club, NIT Andhra Pradesh",
  publisher: "Coding Club, NIT Andhra Pradesh",
  generator: "Next.js",
  applicationName: "Coding Club NITAP",
  category: "technology",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Coding Club, NIT Andhra Pradesh",
    title: "Coding Club, NIT Andhra Pradesh — Innovate. Code. Excel.",
    description:
      "The official website of Coding Club, NIT Andhra Pradesh. Empowering students through technology, innovation, and collaborative learning.",
    images: [
      {
        url: "/images/coding-club-logo.png",
        width: 1200,
        height: 630,
        alt: "Coding Club, NIT Andhra Pradesh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coding Club, NIT Andhra Pradesh",
    description:
      "The official website of Coding Club, NIT Andhra Pradesh. Empowering students through technology, innovation, and collaborative learning.",
    images: ["/images/coding-club-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: "/images/coding-club-logo.png", type: "image/png" },
    ],
    apple: [{ url: "/images/coding-club-logo.png" }],
  },
  manifest: "/manifest.webmanifest",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0F1E" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${manrope.variable} dark antialiased`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  )
}
