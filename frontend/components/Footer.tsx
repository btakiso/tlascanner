import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md text-gray-600 dark:text-gray-300 py-12 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">TLAScanner</h3>
            <p className="text-sm">Advanced Malware and Vulnerability Scanner</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">Products</h4>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/url-scanner" className="hover:text-blue-500 dark:hover:text-blue-400">
                  URL Scanner
                </Link>
              </li>
              <li>
                <Link href="/file-scanner" className="hover:text-blue-500 dark:hover:text-blue-400">
                  File Scanner
                </Link>
              </li>
              <li>
                <Link href="/cve-lookup" className="hover:text-blue-500 dark:hover:text-blue-400">
                  CVE Lookup
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">Company</h4>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/about" className="hover:text-blue-500 dark:hover:text-blue-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-500 dark:hover:text-blue-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-gray-100">Legal</h4>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/privacy" className="hover:text-blue-500 dark:hover:text-blue-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-500 dark:hover:text-blue-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-sm text-center text-gray-500 dark:text-gray-400">
          &copy; 2025 TLAScanner. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

