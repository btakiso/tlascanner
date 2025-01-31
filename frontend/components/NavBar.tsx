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
import { ChevronDown, Globe, FileSearch, Database, ExternalLink } from "lucide-react"

export function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-white/10 group"
              >
                Products 
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-[280px] p-2 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 rounded-[20px] border-none shadow-lg shadow-black/10 dark:shadow-white/10"
            >
              <DropdownMenuItem asChild className="py-3 px-4 focus:bg-gray-100/90 dark:focus:bg-gray-800/90 rounded-[16px] cursor-pointer my-1 transition-all duration-200 hover:scale-[0.98]">
                <Link href="/url-scanner" className="flex items-start gap-3">
                  <Globe className="h-5 w-5 mt-0.5 text-blue-500" />
                  <div>
                    <div className="font-medium mb-0.5">URL Scanner</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Scan websites for vulnerabilities</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="py-3 px-4 focus:bg-gray-100/90 dark:focus:bg-gray-800/90 rounded-[16px] cursor-pointer my-1 transition-all duration-200 hover:scale-[0.98]">
                <Link href="/file-scanner" className="flex items-start gap-3">
                  <FileSearch className="h-5 w-5 mt-0.5 text-purple-500" />
                  <div>
                    <div className="font-medium mb-0.5">File Scanner</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Analyze files for security threats</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="py-3 px-4 focus:bg-gray-100/90 dark:focus:bg-gray-800/90 rounded-[16px] cursor-pointer my-1 transition-all duration-200 hover:scale-[0.98]">
                <Link href="/cve-lookup" className="flex items-start gap-3">
                  <Database className="h-5 w-5 mt-0.5 text-emerald-500" />
                  <div>
                    <div className="font-medium mb-0.5">CVE Lookup</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Search known vulnerabilities</div>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="ghost" 
            asChild 
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-white/10"
          >
            <Link href="/about">About</Link>
          </Button>
          <div className="w-px h-6 bg-gray-200/20 dark:bg-gray-700/20" />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
