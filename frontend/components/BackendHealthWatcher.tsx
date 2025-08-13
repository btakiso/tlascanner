"use client"

import { useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { config } from "@/app/config"

const HEALTH_CHECK_INTERVAL_MS = 30000
const REQUEST_TIMEOUT_MS = 6000

export default function BackendHealthWatcher() {
  const { toast } = useToast()
  const [isBackendDown, setIsBackendDown] = useState(false)
  const isCheckingRef = useRef(false)

  async function checkHealth() {
    if (isCheckingRef.current) return
    isCheckingRef.current = true

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(`${config.API_URL}/api/health`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      })

      let backendIsDown = true
      if (response.ok) {
        try {
          const data = await response.json()
          backendIsDown = !(data && (data.message === "OK" || data.status === "ok"))
        } catch {
          backendIsDown = false
        }
      }

      if (response.status >= 500) {
        backendIsDown = true
      }

      setIsBackendDown((prev) => {
        if (!prev && backendIsDown) {
          toast({
            variant: "destructive",
            title: "Backend unavailable",
            description: "We couldn't reach the server. Some features may not work.",
            action: (
              <ToastAction altText="Retry now" onClick={checkHealth}>
                Retry
              </ToastAction>
            ),
          })
        }
        if (prev && !backendIsDown) {
          toast({
            title: "Backend is back online",
            description: "Connection to the server has been restored.",
          })
        }
        return backendIsDown
      })
    } catch {
      setIsBackendDown((prev) => {
        if (!prev) {
          toast({
            variant: "destructive",
            title: "Backend unreachable",
            description: "Network error while contacting the server.",
            action: (
              <ToastAction altText="Retry now" onClick={checkHealth}>
                Retry
              </ToastAction>
            ),
          })
        }
        return true
      })
    } finally {
      clearTimeout(timeoutId)
      isCheckingRef.current = false
    }
  }

  useEffect(() => {
    checkHealth()
    const intervalId = setInterval(checkHealth, HEALTH_CHECK_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [])

  return null
}


