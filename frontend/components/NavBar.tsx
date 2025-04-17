"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import { Logo } from "./Logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Link2, FileSearch, Database, ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

import { Menu } from "lucide-react"

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [scrolled])

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className={cn(
          "flex items-center justify-between transition-all duration-300 w-full",
          scrolled ? "h-16" : "h-20"
        )}>
          {/* Hamburger for mobile */}
          <button
            className="lg:hidden flex items-center justify-center p-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            type="button"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link 
            href="/" 
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
              scrolled 
                ? "bg-background/60 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-blue-500/10 hover:text-blue-500 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 dark:shadow-primary/10" 
                : "bg-background/20 backdrop-blur-sm hover:bg-blue-500/10 hover:text-blue-500 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/5"
            )}
          >
            <Logo />
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2" aria-label="Main navigation">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "rounded-full transition-all duration-300",
                    scrolled 
                      ? "bg-background/60 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-blue-500/10 hover:text-blue-500 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 dark:shadow-primary/10" 
                      : "bg-background/20 backdrop-blur-sm hover:bg-blue-500/10 hover:text-blue-500 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/5"
                  )}
                >
                  Products 
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-[280px] p-2 backdrop-blur-sm bg-white/40 dark:bg-gray-900/40 rounded-[20px] border-none shadow-lg shadow-black/5 dark:shadow-white/5"
              >
                <DropdownMenuItem asChild className="py-2.5 px-4 focus:bg-blue-100 dark:focus:bg-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-800/60 rounded-[16px] cursor-pointer my-1 transition-all duration-200 hover:scale-[0.98] group">
                  <Link href="/#url-scanner" className="flex items-start gap-3" scroll={false}>
                    <Link2 className="h-4 w-4 mt-0.5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-medium mb-0.5 text-sm">URL Scanner</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Scan websites for vulnerabilities</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-2.5 px-4 focus:bg-blue-100 dark:focus:bg-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-800/60 rounded-[16px] cursor-pointer my-1 transition-all duration-200 hover:scale-[0.98] group">
                  <Link href="/#file-scanner" className="flex items-start gap-3" scroll={false}>
                    <FileSearch className="h-4 w-4 mt-0.5 text-purple-500 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-medium mb-0.5 text-sm">File Scanner</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Analyze files for security threats</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-2.5 px-4 focus:bg-blue-100 dark:focus:bg-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-800/60 rounded-[16px] cursor-pointer my-1 transition-all duration-200 hover:scale-[0.98] group">
                  <Link href="/#cve-lookup" className="flex items-start gap-3" scroll={false}>
                    <Database className="h-4 w-4 mt-0.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-medium mb-0.5 text-sm">CVE Database</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Search known vulnerabilities</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/about">
              <Button 
                variant="ghost" 
                className={cn(
                  "rounded-full transition-all duration-300",
                  scrolled 
                    ? "bg-background/60 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-blue-500/10 hover:text-blue-500 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 dark:shadow-primary/10" 
                    : "bg-background/20 backdrop-blur-sm hover:bg-blue-500/10 hover:text-blue-500 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/5"
                )}
              >
                About
              </Button>
            </Link>
            <ThemeToggle 
              className={cn(
                "rounded-full transition-all duration-300",
                scrolled 
                  ? "bg-background/60 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-blue-500/10 hover:text-blue-500 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 dark:shadow-primary/10" 
                  : "bg-background/20 backdrop-blur-sm hover:bg-blue-500/10 hover:text-blue-500 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/5"
              )}
            />
          </nav>
        </div>
        
        {/* Mobile Nav Overlay */}
        <div
          id="mobile-nav-menu"
          role="dialog"
          aria-modal="true"
          className={cn(
            "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex lg:hidden transition-all duration-300",
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          style={{ transitionProperty: 'opacity, pointer-events' }}
          tabIndex={-1}
          onClick={() => setMobileOpen(false)}
        >
          <nav
            className={cn(
              "bg-background w-11/12 max-w-xs h-full shadow-xl border-r border-border flex flex-col py-8 px-6 gap-6 overflow-y-auto focus:outline-none",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
              "transition-transform duration-300"
            )}
            aria-label="Mobile navigation"
            onClick={e => e.stopPropagation()}
          >
            <Link href="/" className="flex items-center gap-2 mb-6 px-2 py-1 rounded-full focus-visible:ring-2 focus-visible:ring-primary" aria-label="Home">
              <Logo />
            </Link>
            <Link href="/#url-scanner" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary transition-all text-base font-medium" onClick={() => setMobileOpen(false)}>
              <Link2 className="h-5 w-5 text-blue-500" />
              URL Scanner
            </Link>
            <Link href="/#file-scanner" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary transition-all text-base font-medium" onClick={() => setMobileOpen(false)}>
              <FileSearch className="h-5 w-5 text-purple-500" />
              File Scanner
            </Link>
            <Link href="/#cve-lookup" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary transition-all text-base font-medium" onClick={() => setMobileOpen(false)}>
              <Database className="h-5 w-5 text-emerald-500" />
              CVE Database
            </Link>
            <Link href="/about" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary transition-all text-base font-medium" onClick={() => setMobileOpen(false)}>
              About Us
            </Link>
            <Link href="/contact" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary transition-all text-base font-medium" onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
