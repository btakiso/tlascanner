import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkIcon, FileIcon, ShieldIcon } from "lucide-react"

export function ScanOptions() {
  return (
    <section className="py-16 relative z-10">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Choose Your Scan Type
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <ScanOption
            icon={<LinkIcon className="h-8 w-8 text-blue-500" />}
            title="URL Scanner"
            description="Analyze web addresses for potential threats and malicious content."
          />
          <ScanOption
            icon={<FileIcon className="h-8 w-8 text-purple-500" />}
            title="File Scanner"
            description="Upload and scan files to detect malware and security risks."
          />
          <ScanOption
            icon={<ShieldIcon className="h-8 w-8 text-pink-500" />}
            title="CVE Lookup"
            description="Search our database for known vulnerabilities and exposures."
          />
        </div>
      </div>
    </section>
  )
}

function ScanOption({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
        <Button
          variant="outline"
          className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900"
        >
          Start Scan
        </Button>
      </CardContent>
    </Card>
  )
}

