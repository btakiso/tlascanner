import { LinkIcon, FileIcon, ShieldIcon } from "lucide-react"

export function FeatureHighlights() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<LinkIcon className="h-8 w-8 text-[#26C6DA]" />}
            title="URL Scanner"
            description="Quickly analyze web addresses for potential threats and vulnerabilities."
          />
          <FeatureCard
            icon={<FileIcon className="h-8 w-8 text-[#26C6DA]" />}
            title="File Scanner"
            description="Detect malware and security risks in uploaded files with advanced analysis."
          />
          <FeatureCard
            icon={<ShieldIcon className="h-8 w-8 text-[#26C6DA]" />}
            title="CVE Lookup"
            description="Access a comprehensive database of known vulnerabilities and exposures."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

