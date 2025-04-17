"use client"

import { ThemeProvider } from "next-themes"
import { NavBar } from "@/components/NavBar"
import { Hero } from "@/components/Hero"
import DetailedFeatures from "@/components/DetailedFeatures"
import { MarqueeDemo } from "@/components/MarqueeDemo"
import { Footer } from "@/components/Footer"
import { CyberBackground } from "@/components/CyberBackground"
import { useEffect } from "react"

export default function HomePage() {
  // Fix for scroll position issue when navigating between pages
  // This ensures the page always starts at the top when navigating to the homepage
  // Without this, the page might maintain scroll position from previous page or scroll to bottom
  useEffect(() => {
    // Scroll to top (0,0) coordinates when component mounts
    window.scrollTo(0, 0);
  }, []); // Empty dependency array means this runs once on mount
  
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <CyberBackground />
        <NavBar />
        <main className="flex-grow z-10 pt-16">
          <Hero />
          <DetailedFeatures />
          <MarqueeDemo />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}