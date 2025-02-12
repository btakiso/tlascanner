"use client";

import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { CyberBackground } from "@/components/CyberBackground";

export default function ScanResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
