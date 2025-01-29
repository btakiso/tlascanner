import { cn } from "@/lib/utils"
import { Marquee } from "@/components/Marquee"
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

const SecurityCard = ({
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
}) => {
  return (
    <figure
      className={cn(
        "relative w-[400px] shrink-0 cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "rounded-full p-2",
            severity === "Critical"
              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              : severity === "High"
                ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium dark:text-white">{type}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{id}</span>
          </div>
          <h3 className="font-semibold dark:text-white">{title}</h3>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            severity === "Critical"
              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              : severity === "High"
                ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
          )}
        >
          {severity}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{date}</span>
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </figure>
  )
}

export function MarqueeDemo() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Latest Security Threats
        </h2>
        <div className="relative">
          <Marquee className="mb-6" pauseOnHover>
            {securityUpdates.slice(0, 3).map((update) => (
              <SecurityCard key={update.id} {...update} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover>
            {securityUpdates.slice(3).map((update) => (
              <SecurityCard key={update.id} {...update} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-gray-900"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-gray-900"></div>
        </div>
      </div>
    </section>
  )
}

