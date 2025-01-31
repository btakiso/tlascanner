"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface LogoProps {
  className?: string
}

export function Logo({ className = "" }: LogoProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push("/")
  }

  return (
    <div 
      onClick={handleClick}
      className={`flex items-center gap-2.5 transition-transform duration-300 hover:-translate-y-0.5 cursor-pointer group ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.2,
          ease: [0, 0.71, 0.2, 1.01]
        }}
        whileHover={{ scale: 1.1 }}
        className="relative"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 blur-xl rounded-full" />
        
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transform-gpu relative"
        >
          {/* Shield Base with double layer effect */}
          <motion.path
            d="M20 2L4 9V20C4 30 20 38 20 38C20 38 36 30 36 20V9L20 2Z"
            className="fill-blue-500/20 dark:fill-blue-500/20"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          />
          <motion.path
            d="M20 2L4 9V20C4 30 20 38 20 38C20 38 36 30 36 20V9L20 2Z"
            className="stroke-blue-500/50 dark:stroke-blue-400/50"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          />
          
          {/* Scanning Lines with pulse effect */}
          <motion.path
            d="M12 20H28"
            className="stroke-blue-500 dark:stroke-blue-400"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{
              duration: 1.5,
              delay: 0.5,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
          <motion.path
            d="M15 15H25"
            className="stroke-blue-600 dark:stroke-blue-500"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{
              duration: 1.5,
              delay: 0.3,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
          <motion.path
            d="M10 25H30"
            className="stroke-blue-400 dark:stroke-blue-300"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{
              duration: 1.5,
              delay: 0.7,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>
      
      {/* Logo Text */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center gap-0.5"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="relative text-2xl font-['Rubik_Glitch'] bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200 hover:scale-110 transition-transform duration-300"
          whileHover={{
            textShadow: [
              "0 0 8px rgba(96, 165, 250, 0.5)",
              "0 0 12px rgba(96, 165, 250, 0.6)",
              "0 0 8px rgba(96, 165, 250, 0.5)"
            ],
            transition: {
              duration: 1,
              repeat: Infinity
            }
          }}
        >
          TLA
          {/* Cyber decoration */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500/30 rounded-full animate-ping" />
        </motion.span>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative"
        >
          <motion.span 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-xl font-['Rubik_Dirt'] bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 dark:from-purple-400 dark:via-purple-300 dark:to-blue-300 hover:scale-110 transition-transform duration-300 inline-block"
            whileHover={{
              textShadow: [
                "0 0 8px rgba(147, 51, 234, 0.5)",
                "0 0 12px rgba(147, 51, 234, 0.6)",
                "0 0 8px rgba(147, 51, 234, 0.5)"
              ],
              transition: {
                duration: 1,
                repeat: Infinity
              }
            }}
          >
            Scanner
          </motion.span>
          
          {/* Animated underline with enhanced gradient */}
          <motion.div 
            className="absolute -bottom-1 left-0 w-full h-[2px] rounded-full"
            style={{
              background: "linear-gradient(90deg, #60A5FA 0%, #818CF8 25%, #C084FC 50%, #818CF8 75%, #60A5FA 100%)",
              backgroundSize: "200% 100%",
              animation: "gradient 3s linear infinite"
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          />
          
          {/* Cyber decorations */}
          <div className="absolute -bottom-3 left-1/2 w-1 h-1 bg-purple-500/30 rounded-full animate-ping" />
          <div className="absolute -bottom-3 right-1/2 w-1 h-1 bg-blue-500/30 rounded-full animate-ping [animation-delay:0.5s]" />
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
