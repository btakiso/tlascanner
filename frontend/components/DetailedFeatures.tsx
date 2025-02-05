"use client"

import { URLScanner } from "./features/URLScanner"
import { FileScanner } from "./features/FileScanner"
import { CVELookup } from "./features/CVELookup"

export default function DetailedFeatures() {
  return (
    <section className="relative py-20">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/20" />
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-20 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Our Core Features
        </h2>
        <div className="space-y-32">
          <div id="url-scanner" className="scroll-mt-20">
            <URLScanner />
          </div>
          <div id="file-scanner" className="scroll-mt-20">
            <FileScanner />
          </div>
          <div id="cve-lookup" className="scroll-mt-20">
            <CVELookup />
          </div>
        </div>
      </div>
    </section>
  )
}