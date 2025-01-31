"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AnimatedSpanProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedSpan = ({
  children,
  delay = 0,
  className,
}: AnimatedSpanProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!isVisible) return null;

  return (
    <div className={cn("grid text-sm font-normal tracking-tight opacity-100", className)}>
      {children}
    </div>
  );
};

interface TypingAnimationProps {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
}

export const TypingAnimation = ({
  children,
  className,
  duration = 60,
  delay = 0,
}: TypingAnimationProps) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      let i = 0;
      const typingEffect = setInterval(() => {
        if (i < children.length) {
          setDisplayedText(prev => children.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingEffect);
        }
      }, duration);

      return () => clearInterval(typingEffect);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [children, duration, delay]);

  return (
    <span className={cn("text-sm font-normal tracking-tight", className)}>
      {displayedText}
    </span>
  );
};

interface TerminalProps {
  children: React.ReactNode;
  className?: string;
}

export const Terminal = ({ children, className }: TerminalProps) => {
  return (
    <div
      className={cn(
        "z-0 h-full max-h-[500px] w-full max-w-lg rounded-xl border border-border bg-background",
        className,
      )}
    >
      <div className="flex flex-col gap-y-2 border-b border-border p-4">
        <div className="flex flex-row gap-x-2">
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
        </div>
      </div>
      <pre className="p-4">
        <code className="grid gap-y-1 overflow-auto">{children}</code>
      </pre>
    </div>
  );
};
