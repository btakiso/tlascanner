export function ValueProposition() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold mb-4">Why Choose TLAScanner?</h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-[#26C6DA] mr-2" />
                Real-time threat intelligence
              </li>
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-[#26C6DA] mr-2" />
                Trusted by cybersecurity experts
              </li>
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-[#26C6DA] mr-2" />
                Easy to use without login
              </li>
              <li className="flex items-center">
                <CheckIcon className="h-5 w-5 text-[#26C6DA] mr-2" />
                Comprehensive vulnerability database
              </li>
            </ul>
          </div>
          <div className="md:w-1/2">
            <img
              src="/placeholder.svg?height=300&width=400"
              alt="TLAScanner Dashboard"
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

