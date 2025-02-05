import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"
import { Logo } from "./Logo"

export function Footer() {
  return (
    <footer className="bg-background/70 border-t border-border backdrop-blur-md text-muted-foreground py-12 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Logo className="w-32 mb-4" />
            <p className="text-sm">
              Advanced security tools for modern threat detection and vulnerability scanning.
            </p>
            <div className="flex space-x-4 mt-4">
              <Link href="https://github.com/btakiso/tlascanner" target="_blank" className="hover:text-primary transition-colors">
                <Github className="h-4 w-4" />
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <Linkedin className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">Products</h4>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/#url-scanner" className="hover:text-primary transition-colors">
                  URL Scanner
                </Link>
              </li>
              <li>
                <Link href="/#file-scanner" className="hover:text-primary transition-colors">
                  File Scanner
                </Link>
              </li>
              <li>
                <Link href="/#cve-lookup" className="hover:text-primary transition-colors">
                  CVE Lookup
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">Company</h4>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} TLAScanner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
