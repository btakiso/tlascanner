'use client';

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  severity: string;
  score: number;
  className?: string;
}

export function SeverityBadge({ severity, score, className }: Props) {
  const getSeverityColor = (score: number) => {
    if (score >= 9.0) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (score >= 7.0) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    if (score >= 4.0) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

  return (
    <Badge
      className={cn(
        "relative px-3 py-1 text-sm font-medium border",
        getSeverityColor(score),
        className
      )}
    >
      {/* Pulsing background for critical vulnerabilities */}
      {score >= 9.0 && (
        <span className="absolute inset-0 rounded-full animate-pulse bg-red-500/10" />
      )}
      <span className="relative">
        {severity} {score}
      </span>
    </Badge>
  );
}
