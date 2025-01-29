"use client"

import { ThemeProvider } from "next-themes"
import { NavBar } from "@/components/NavBar"
import { Hero } from "@/components/Hero"
import DetailedFeatures from "@/components/DetailedFeatures"
import { MarqueeDemo } from "@/components/MarqueeDemo"
import { Footer } from "@/components/Footer"
import { CyberBackground } from "@/components/CyberBackground"

export default function HomePage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-950">
        <CyberBackground />
        <NavBar />
        <main className="flex-grow z-10">
          <Hero />
          <DetailedFeatures />
          <MarqueeDemo />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

