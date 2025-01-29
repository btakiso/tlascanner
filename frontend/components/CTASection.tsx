import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to Secure Your Digital Future?</h2>
        <p className="text-xl mb-8">Join thousands of companies that trust TLAScanner for their cybersecurity needs.</p>
        <Button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
          Start Your Free Trial
        </Button>
      </div>
    </section>
  )
}

