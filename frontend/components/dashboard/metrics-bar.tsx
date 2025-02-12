"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Globe, FileText, ShieldAlert, AlertTriangle } from "lucide-react"
import { AggregatedMetrics } from "@/types/security"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  variant?: 'default' | 'warning' | 'danger';
}

const MetricCard = ({ label, value, icon, trend, variant = 'default' }: MetricCardProps) => {
  const variants = {
    default: 'bg-card hover:bg-card/80',
    warning: 'bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-50/80',
    danger: 'bg-red-50 dark:bg-red-900/10 hover:bg-red-50/80'
  }

  return (
    <Card className={cn(
      "transition-all duration-200 ease-in-out cursor-pointer bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60",
      variants[variant]
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-full bg-primary/10">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <h3 className="text-2xl font-bold">{value.toLocaleString()}</h3>
            </div>
          </div>
          {trend && (
            <div className={cn(
              "text-sm font-medium",
              trend > 0 ? "text-green-600" : "text-red-600"
            )}>
              {trend > 0 ? "+" : ""}{trend}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface MetricsBarProps {
  metrics: AggregatedMetrics
}

export function MetricsBar({ metrics }: MetricsBarProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Web Resources Analyzed"
        value={metrics.totalUrlsScanned}
        icon={<Globe className="w-4 h-4" />}
      />
      <MetricCard
        label="Files Scanned"
        value={metrics.totalFilesAnalyzed}
        icon={<FileText className="w-4 h-4" />}
      />
      <MetricCard
        label="Security Threats"
        value={metrics.maliciousDetections}
        icon={<ShieldAlert className="w-4 h-4" />}
        variant="danger"
        trend={12}
      />
      <MetricCard
        label="Critical Issues"
        value={metrics.criticalCVEs}
        icon={<AlertTriangle className="w-4 h-4" />}
        variant="warning"
      />
    </div>
  )
}
