import { MagicCard } from "./MagicCard"
import { LinkIcon, FileIcon, ShieldIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    title: "URL Scanner",
    description: "Analyze web addresses for potential threats and malicious content.",
    icon: LinkIcon,
    gradientFrom: "#3b82f6",
    gradientTo: "#8b5cf6",
  },
  {
    title: "File Scanner",
    description: "Detect malware and security risks in uploaded files.",
    icon: FileIcon,
    gradientFrom: "#10b981",
    gradientTo: "#3b82f6",
  },
  {
    title: "CVE Lookup",
    description: "Search our database for known vulnerabilities and exposures.",
    icon: ShieldIcon,
    gradientFrom: "#f59e0b",
    gradientTo: "#ef4444",
  },
]

export function FeatureCards() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Our Core Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <MagicCard
              key={index}
              className="p-6 h-full"
              gradientFrom={feature.gradientFrom}
              gradientTo={feature.gradientTo}
            >
              <div className="flex flex-col h-full">
                <feature.icon className="w-12 h-12 mb-4 text-gray-800 dark:text-gray-200" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">{feature.description}</p>
                <Button className="mt-auto bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200">
                  Start Scan
                </Button>
              </div>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  )
}

