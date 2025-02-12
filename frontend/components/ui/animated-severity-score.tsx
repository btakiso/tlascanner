'use client';

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface Props {
  score: number;
  className?: string;
}

export function AnimatedSeverityScore({ score, className }: Props) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest * 10) / 10);
  
  useEffect(() => {
    const animation = animate(count, score, { duration: 1 });
    return animation.stop;
  }, [score]);

  const getSeverityColor = (score: number) => {
    if (score >= 9.0) return "text-red-500";
    if (score >= 7.0) return "text-orange-500";
    if (score >= 4.0) return "text-yellow-500";
    return "text-blue-500";
  };

  return (
    <div className={`flex items-baseline gap-1 ${className}`}>
      <motion.span className={`text-3xl font-bold ${getSeverityColor(score)}`}>
        {rounded}
      </motion.span>
      <span className="text-muted-foreground">/10</span>
    </div>
  );
}
