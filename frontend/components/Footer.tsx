import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-background/70 border-t border-border backdrop-blur-md text-muted-foreground py-12 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">TLAScanner</h3>
            <p className="text-sm">Advanced Malware and Vulnerability Scanner</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">Products</h4>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/url-scanner" className="hover:text-primary transition-colors">
                  URL Scanner
                </Link>
              </li>
              <li>
                <Link href="/file-scanner" className="hover:text-primary transition-colors">
                  File Scanner
                </Link>
              </li>
              <li>
                <Link href="/cve-lookup" className="hover:text-primary transition-colors">
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
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-sm text-center">
          <p>&copy; {new Date().getFullYear()} TLAScanner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
