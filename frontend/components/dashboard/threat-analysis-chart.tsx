"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { APIResponse } from "@/types/security"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface ThreatAnalysisProps {
  data: APIResponse;
}

export function ThreatAnalysisChart({ data }: ThreatAnalysisProps) {
  // Transform the data for the chart
  const chartData = [
    {
      name: "Files",
      value: data.virusTotal.malwareDetections,
      label: "Detected Malware"
    },
    {
      name: "Vulnerabilities",
      value: data.nvd.criticalCVEs,
      label: "Critical Issues"
    },
    {
      name: "Signatures",
      value: data.malwareBazaar.maliciousFiles,
      label: "Malicious Signatures"
    }
  ]

  return (
    <Card className="col-span-3 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardHeader>
        <CardTitle>Threat Analysis</CardTitle>
        <CardDescription>
          Overview of threats detected across all sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {payload[0].payload.label}
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="value"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
