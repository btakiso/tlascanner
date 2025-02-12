import { NavBar } from "@/components/NavBar"
import { Footer } from "@/components/Footer"
import { CyberBackground } from "@/components/CyberBackground"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <CyberBackground />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 container mx-auto px-4 mt-24 pb-6 space-y-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
