export function Testimonials() {
  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          Trusted by Industry Leaders
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <TestimonialCard
            quote="TLAScanner has revolutionized our approach to cybersecurity. It's an indispensable tool for our team."
            author="Jane Doe"
            position="CTO, TechCorp"
          />
          <TestimonialCard
            quote="The speed and accuracy of TLAScanner are unmatched. It's like having a cybersecurity expert on call 24/7."
            author="John Smith"
            position="Head of IT, Global Innovations"
          />
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ quote, author, position }: { quote: string; author: string; position: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <p className="text-lg mb-4 italic">"{quote}"</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{position}</p>
      </div>
    </div>
  )
}

