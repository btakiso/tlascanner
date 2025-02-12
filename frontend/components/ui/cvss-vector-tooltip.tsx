'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface CVSSMetric {
  key: string;
  name: string;
  description: string;
}

const CVSS_METRICS: { [key: string]: CVSSMetric } = {
  AV: { key: 'AV', name: 'Attack Vector', description: 'How the vulnerability can be exploited' },
  AC: { key: 'AC', name: 'Attack Complexity', description: 'Conditions beyond attacker\'s control required for exploit' },
  PR: { key: 'PR', name: 'Privileges Required', description: 'Level of privileges needed for exploit' },
  UI: { key: 'UI', name: 'User Interaction', description: 'Requirements for user participation' },
  S: { key: 'S', name: 'Scope', description: 'Ability to affect resources beyond security scope' },
  C: { key: 'C', name: 'Confidentiality', description: 'Impact on information access and disclosure' },
  I: { key: 'I', name: 'Integrity', description: 'Impact on information trustworthiness and veracity' },
  A: { key: 'A', name: 'Availability', description: 'Impact on resource accessibility' },
};

const VALUE_MEANINGS: { [key: string]: { [value: string]: string } } = {
  AV: { N: 'Network', A: 'Adjacent', L: 'Local', P: 'Physical' },
  AC: { L: 'Low', H: 'High' },
  PR: { N: 'None', L: 'Low', H: 'High' },
  UI: { N: 'None', R: 'Required' },
  S: { U: 'Unchanged', C: 'Changed' },
  C: { N: 'None', L: 'Low', H: 'High' },
  I: { N: 'None', L: 'Low', H: 'High' },
  A: { N: 'None', L: 'Low', H: 'High' },
};

interface Props {
  vector: string;
}

export function CVSSVectorTooltip({ vector }: Props) {
  const vectorParts = vector.split('/').reduce((acc: { [key: string]: string }, part: string) => {
    const [metric, value] = part.split(':');
    acc[metric] = value;
    return acc;
  }, {});

  return (
    <div className="flex items-center gap-2">
      <code className="text-sm bg-background/30 rounded px-2 py-1">{vector}</code>
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <div className="space-y-2">
              {Object.entries(vectorParts).map(([metric, value]) => {
                const metricInfo = CVSS_METRICS[metric];
                const valueMeaning = VALUE_MEANINGS[metric]?.[value];
                
                if (!metricInfo) return null;

                return (
                  <div key={metric} className="grid grid-cols-[100px,1fr] gap-2">
                    <div className="font-medium">{metricInfo.name}:</div>
                    <div className="text-muted-foreground">
                      {valueMeaning || value}
                    </div>
                  </div>
                );
              })}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
