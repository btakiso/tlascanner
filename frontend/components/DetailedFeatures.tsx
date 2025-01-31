"use client"

import { URLScanner } from "./features/URLScanner"
import { FileScanner } from "./features/FileScanner"
import { CVELookup } from "./features/CVELookup"

export default function DetailedFeatures() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-20 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Our Core Features
        </h2>
        <div className="space-y-32">
          <URLScanner />
          <FileScanner />
          <CVELookup />
        </div>
      </div>
    </section>
  )
}