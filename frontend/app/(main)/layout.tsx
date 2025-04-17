"use client";

import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { CyberBackground } from "@/components/CyberBackground";
import { useEffect } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fix for scroll position issue when navigating between pages
  // This ensures all pages in the (main) route group always start at the top when navigating to them
  // Without this, the page might maintain scroll position from previous page or scroll to bottom
  useEffect(() => {
    // Scroll to top (0,0) coordinates when component mounts
    window.scrollTo(0, 0);
  }, []); // Empty dependency array means this runs once on mount
  return (
    <div className="min-h-screen">
      {/* Cyber Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
        <CyberBackground />
      </div>

      {/* Content */}
      <div className="relative flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 pt-24">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
