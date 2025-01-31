import { cn } from "@/lib/utils"
import { Marquee } from "@/components/ui/marquee"
import { AlertTriangle, Bug, Shield, WormIcon as Virus } from "lucide-react"

const securityUpdates = [
  {
    type: "CVE",
    id: "CVE-2024-23456",
    title: "Critical RCE in OpenSSL",
    severity: "Critical",
    date: "2024-01-28",
    description: "Remote code execution vulnerability in OpenSSL affecting versions < 3.0.1",
    icon: Bug,
  },
  {
    type: "Malware",
    id: "MAL-2024-089",
    title: "New Ransomware Strain",
    severity: "High",
    date: "2024-01-27",
    description: "New ransomware variant targeting cloud storage systems detected",
    icon: Virus,
  },
  {
    type: "CVE",
    id: "CVE-2024-22222",
    title: "Linux Kernel Vulnerability",
    severity: "High",
    date: "2024-01-26",
    description: "Privilege escalation vulnerability in Linux kernel versions 5.4 through 6.1",
    icon: AlertTriangle,
  },
  {
    type: "Threat",
    id: "THREAT-2024-001",
    title: "APT Group Activity",
    severity: "Medium",
    date: "2024-01-25",
    description: "New APT group targeting financial institutions with sophisticated phishing campaigns",
    icon: Shield,
  },
  {
    type: "CVE",
    id: "CVE-2024-21111",
    title: "Apache Struts Flaw",
    severity: "Critical",
    date: "2024-01-24",
    description: "Authentication bypass vulnerability in Apache Struts 2.5.x through 2.5.30",
    icon: Bug,
  },
  {
    type: "Malware",
    id: "MAL-2024-088",
    title: "Cryptojacking Campaign",
    severity: "Medium",
    date: "2024-01-23",
    description: "Large-scale cryptojacking campaign targeting unpatched Jenkins servers",
    icon: Virus,
  },
]

function SecurityCard({
  type,
  id,
  title,
  severity,
  date,
  description,
  icon: Icon,
}: {
  type: string
  id: string
  title: string
  severity: string
  date: string
  description: string
  icon: React.ElementType
}) {
  return (
    <div className={cn(
      "relative min-w-[350px] max-w-[350px] cursor-pointer rounded-xl border p-4 mx-2 bg-white dark:bg-gray-900",
      "hover:shadow-md transition-shadow duration-200"
    )}>
      <div className="space-y-3">
        {/* Top row with icon and ID */}
        <div className="flex items-center gap-2">
          <Icon className={cn(
            "h-5 w-5",
            severity === "Critical" && "text-red-600",
            severity === "High" && "text-orange-600",
            severity === "Medium" && "text-yellow-600"
          )} />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {type} • {id}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-medium text-gray-900 dark:text-white">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>

        {/* Bottom row with severity and date */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-0.5 text-xs font-medium rounded-full",
            severity === "Critical" && "bg-red-100 text-red-700",
            severity === "High" && "bg-orange-100 text-orange-700",
            severity === "Medium" && "bg-yellow-100 text-yellow-700"
          )}>
            {severity}
          </span>
          <span className="text-xs text-gray-500">
            {date}
          </span>
        </div>
      </div>
    </div>
  )
}

const firstRow = securityUpdates.slice(0, securityUpdates.length / 2);
const secondRow = securityUpdates.slice(securityUpdates.length / 2);

export function MarqueeDemo() {
  return (
    <div className="relative flex h-[450px] w-full flex-col items-center overflow-hidden rounded-lg bg-background">
      <div className="w-full py-2">
        <div className="animate-marquee-reverse flex gap-2 px-4">
          {[...firstRow, ...firstRow, ...firstRow].map((update, i) => (
            <SecurityCard key={`${update.id}-${i}`} {...update} />
          ))}
        </div>
      </div>
      <div className="w-full py-2">
        <div className="animate-marquee flex gap-2 px-4">
          {[...secondRow, ...secondRow, ...secondRow].map((update, i) => (
            <SecurityCard key={`${update.id}-${i}`} {...update} />
          ))}
        </div>
      </div>
      {/* Left fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent"></div>
      {/* Right fade */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent"></div>
    </div>
  )
}
