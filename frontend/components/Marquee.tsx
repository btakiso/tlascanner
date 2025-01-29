import { cn } from "@/lib/utils"
import type { ComponentPropsWithoutRef } from "react"

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  children: React.ReactNode
}

export function Marquee({ className, reverse = false, pauseOnHover = false, children, ...props }: MarqueeProps) {
  return (
    <div {...props} className={cn("relative flex overflow-hidden", className)}>
      <div
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {children}
      </div>
    </div>
  )
}

