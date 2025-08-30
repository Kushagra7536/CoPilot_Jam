import Header from "@/components/city/header"
import BuildingSidebar from "@/components/city/building-sidebar"
import CityGrid from "@/components/city/city-grid"
import MetricsDashboard from "@/components/city/metrics-dashboard"
import BottomBar from "@/components/city/bottom-bar"
import ChallengeSystem from "@/components/city/challenge-system"
import EventNotifications from "@/components/city/event-notifications"
import ParticlesBackground from "@/components/city/particles-background"
import { CityStoreProvider } from "@/components/city/city-store"

export default function Page() {
  return (
    <CityStoreProvider>
      <main className="relative min-h-screen text-gray-200">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1020] via-[#0b1020] to-black" />
          <div className="absolute inset-0 opacity-[0.08] [background:repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,255,255,0.06)_3px,rgba(255,255,255,0.06)_4px)]" />
          <ParticlesBackground />
        </div>

        <Header />

        <section
          aria-label="City planner workspace"
          className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-12"
        >
          <aside
            aria-label="Building palette"
            className="md:col-span-3 rounded-xl border border-[#00FFFF]/20 bg-white/5 p-3 backdrop-blur-md shadow-lg shadow-[#0080FF]/10"
          >
            <BuildingSidebar />
          </aside>

          <section
            aria-label="City grid"
            className="md:col-span-6 rounded-xl border border-[#00FFFF]/20 bg-white/5 p-3 backdrop-blur-md shadow-lg shadow-[#0080FF]/10"
          >
            <CityGrid />
          </section>

          <aside
            aria-label="Metrics dashboard"
            className="md:col-span-3 rounded-xl border border-[#00FFFF]/20 bg-white/5 p-3 backdrop-blur-md shadow-lg shadow-[#0080FF]/10"
          >
            <MetricsDashboard />
          </aside>
        </section>

        <BottomBar />
        <ChallengeSystem />
        <EventNotifications />
      </main>
    </CityStoreProvider>
  )
}
