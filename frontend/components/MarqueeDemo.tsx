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
    <div className="flex-none w-[350px]">
      <div className="group relative p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
        {/* Top row with icon and type/id */}
        <div className="flex items-center gap-3 mb-2">
          <div className={cn(
            "p-2 rounded-xl shadow-inner",
            type === "CVE" && "bg-blue-500/10",
            type === "Malware" && "bg-red-500/10",
            type === "Threat" && "bg-amber-500/10"
          )}>
            <Icon className={cn(
              "w-5 h-5",
              type === "CVE" && "text-blue-400",
              type === "Malware" && "text-red-400",
              type === "Threat" && "text-amber-400"
            )} />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">{type}</span>
            <span className="text-xs text-muted-foreground/80 ml-2">{id}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground mb-1">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground">
          {description}
        </p>

        {/* Bottom row with severity and date */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-0.5 text-xs font-medium rounded-full",
            severity === "Critical" && "bg-red-500/10 text-red-400",
            severity === "High" && "bg-orange-500/10 text-orange-400",
            severity === "Medium" && "bg-yellow-500/10 text-yellow-400"
          )}>
            {severity}
          </span>
          <span className="text-xs text-muted-foreground/80">
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
    <div className="relative flex h-[320px] sm:h-[400px] md:h-[450px] w-full flex-col items-center overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />
      
      <div className="relative z-10 w-full py-1 sm:py-2 overflow-x-auto">
        <div className="animate-marquee-reverse flex gap-2 px-2 sm:px-4 min-w-[320px]">
          {[...firstRow, ...firstRow, ...firstRow].map((update, i) => (
            <SecurityCard key={`${update.id}-${i}`} {...update} />
          ))}
        </div>
      </div>
      <div className="relative z-10 w-full py-1 sm:py-2 overflow-x-auto">
        <div className="animate-marquee flex gap-2 px-2 sm:px-4 min-w-[320px]">
          {[...secondRow, ...secondRow, ...secondRow].map((update, i) => (
            <SecurityCard key={`${update.id}-${i}`} {...update} />
          ))}
        </div>
      </div>
      {/* Left fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-20"></div>
      {/* Right fade */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-20"></div>
    </div>
  )
}
