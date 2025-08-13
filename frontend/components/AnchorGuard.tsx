"use client"

import { useEffect } from "react"

export default function AnchorGuard() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target) return
      const anchor = target.closest('a') as HTMLAnchorElement | null
      if (!anchor) return
      const rawHref = anchor.getAttribute('href') || ''
      if (rawHref === '#' || rawHref.trim() === '') {
        e.preventDefault()
      }
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])
  return null
}


