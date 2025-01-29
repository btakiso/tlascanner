import { Shield, Zap, Lock } from "lucide-react"

export function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          Cutting-Edge Security Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Shield className="h-12 w-12 text-purple-600" />}
            title="Advanced Threat Detection"
            description="Our AI-powered system identifies and neutralizes threats in real-time, keeping your digital assets safe."
          />
          <FeatureCard
            icon={<Zap className="h-12 w-12 text-pink-600" />}
            title="Lightning-Fast Scans"
            description="Perform comprehensive security scans in seconds, not minutes. Speed and security, hand in hand."
          />
          <FeatureCard
            icon={<Lock className="h-12 w-12 text-purple-600" />}
            title="End-to-End Encryption"
            description="Your data is protected with military-grade encryption at every step, ensuring complete privacy."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}

