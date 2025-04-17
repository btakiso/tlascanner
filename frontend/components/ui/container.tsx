import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "container mx-auto px-4 md:px-6 max-w-7xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
