"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScanEvent } from "@/types/security"
import { Shield, AlertTriangle, FileText, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityFeedProps {
  events: ScanEvent[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'clean':
      return 'text-green-500 bg-green-50 dark:bg-green-900/10'
    case 'malicious':
      return 'text-red-500 bg-red-50 dark:bg-red-900/10'
    case 'warning':
      return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
    default:
      return 'text-gray-500 bg-gray-50 dark:bg-gray-900/10'
  }
}

const getIcon = (type: string) => {
  switch (type) {
    case 'URL':
      return <Globe className="w-4 h-4" />
    case 'FILE':
      return <FileText className="w-4 h-4" />
    case 'CVE':
      return <AlertTriangle className="w-4 h-4" />
    default:
      return <Shield className="w-4 h-4" />
  }
}

const getRelativeTime = (timestamp: string) => {
  const now = new Date().getTime()
  const time = new Date(timestamp).getTime()
  const diff = now - time

  // Convert to seconds
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 60) {
    return 'Just now'
  }
  
  // Convert to minutes
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }
  
  // Convert to hours
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }
  
  // Convert to days
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <Card className="col-span-4 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center space-x-4 rounded-lg border p-4 transition-all hover:bg-accent/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            >
              <div className={cn(
                "p-2 rounded-full",
                getStatusColor(event.status)
              )}>
                {getIcon(event.type)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {event.type} Analysis Result
                </p>
                <p className="text-sm text-muted-foreground">
                  {event.details}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {getRelativeTime(event.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
