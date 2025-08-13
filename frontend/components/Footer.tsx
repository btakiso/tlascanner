import Link from "next/link"
import { Github, Linkedin } from "lucide-react"
import { Logo } from "./Logo"

export function Footer() {
  return (
    <footer className="bg-background/70 border-t border-border backdrop-blur-md text-muted-foreground py-10 sm:py-12 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 lg:gap-12">
          {/* Brand & Social */}
          <div>
            <Logo className="w-28 sm:w-32 mb-4" />
            <p className="text-sm max-w-xs">
              Advanced security tools for modern threat detection and vulnerability scanning.
            </p>
            <div className="flex space-x-3 mt-4">
              <Link href="https://github.com/btakiso/tlascanner" target="_blank" aria-label="GitHub Repository" className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-2">
                <Github className="h-5 w-5 sm:h-4 sm:w-4" />
              </Link>
              <Link href="#" aria-label="LinkedIn" className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-2" onClick={(e) => e.preventDefault()}>
                <Linkedin className="h-5 w-5 sm:h-4 sm:w-4" />
              </Link>
            </div>
          </div>
          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">Products</h4>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/#url-scanner" className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  URL Scanner
                </Link>
              </li>
              <li>
                <Link href="/#file-scanner" className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  File Scanner
                </Link>
              </li>
              <li>
                <Link href="/#cve-lookup" className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  CVE Lookup
                </Link>
              </li>
            </ul>
          </div>
          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">Company</h4>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">Legal</h4>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <hr className="my-8 border-border sm:hidden" />
        <div className="mt-6 sm:mt-12 text-center">
          <p className="text-xs sm:text-sm leading-tight truncate">&copy; {new Date().getFullYear()} TLAScanner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
