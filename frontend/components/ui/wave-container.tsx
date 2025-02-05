import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WaveContainerProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function WaveContainer({
  children,
  className,
  color = "34,197,94", // default emerald color
}: WaveContainerProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl min-h-[40px] min-w-[40px] bg-gradient-to-br from-[rgba(var(--color),0.2)] to-[rgba(var(--color),0.1)]", className)}
      style={{
        "--color": color
      } as any}
    >
      <div className="relative z-10 bg-[rgba(var(--color),0.3)] backdrop-blur-sm rounded-2xl">{children}</div>
      <div className="absolute inset-0 z-[1]">
        {/* Base water fill with gradient */}
        <div className={`absolute inset-0 backdrop-blur-sm bg-gradient-to-b rounded-2xl`} 
          style={{
            background: `linear-gradient(to bottom, rgba(${color},0.5), rgba(${color},0.7))`
          }}
        />

        {/* Animated wave */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          initial={{ y: "100%" }}
          animate={{
            y: ["100%", "-100%"]
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "linear",
          }}
        >
          <svg
            viewBox="0 0 400 400"
            className="w-[200%] h-full absolute left-0"
          >
            <motion.path
              d="M0 200 
                 Q 50 150, 100 200 
                 T 200 200 
                 T 300 200 
                 T 400 200 
                 V 400 
                 H 0 
                 Z"
              className="fill-current"
              style={{
                fill: `rgba(${color},0.4)`,
              }}
              animate={{
                x: [0, -400]
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: "linear"
              }}
            />
          </svg>
        </motion.div>

        {/* Second wave with different timing */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          initial={{ y: "100%" }}
          animate={{
            y: ["100%", "-100%"]
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "linear",
          }}
        >
          <svg
            viewBox="0 0 400 400"
            className="w-[200%] h-full absolute left-0"
          >
            <motion.path
              d="M0 200 
                 Q 50 150, 100 200 
                 T 200 200 
                 T 300 200 
                 T 400 200 
                 V 400 
                 H 0 
                 Z"
              className="fill-current"
              style={{
                fill: `rgba(${color},0.5)`,
              }}
              animate={{
                x: [0, -400]
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "linear"
              }}
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
