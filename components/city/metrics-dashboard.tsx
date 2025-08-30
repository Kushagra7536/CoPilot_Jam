"use client"

import { useCityStore } from "./city-store"

function MetricBar({
  label,
  value,
  tone = "neutral",
  suffix = "%",
}: {
  label: string
  value: number
  tone?: "good" | "warn" | "bad" | "neutral"
  suffix?: string
}) {
  const width = Math.max(0, Math.min(100, value))
  const color =
    tone === "bad" ? "#ef4444" : tone === "good" ? "#00FFFF" : tone === "warn" ? "rgba(229,231,235,0.9)" : "#0080FF"
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">
          {width}
          {suffix}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}, #00FFFF)`,
            boxShadow: tone === "bad" ? "0 0 10px rgba(239,68,68,0.45)" : "0 0 12px rgba(0,128,255,0.35)",
          }}
          aria-hidden
        />
      </div>
    </div>
  )
}

export default function MetricsDashboard() {
  const { credits, metrics } = useCityStore()

  const aqTone = metrics.airQuality < 40 ? "bad" : metrics.airQuality < 70 ? "warn" : "good"
  const wsTone = metrics.waterSecurity < 40 ? "bad" : metrics.waterSecurity < 70 ? "warn" : "good"
  const cb0to100 = Math.round((metrics.carbonBalance + 100) / 2)
  const cbTone = cb0to100 < 40 ? "bad" : cb0to100 < 70 ? "warn" : "good"
  const crTone = metrics.climateResilience < 35 ? "bad" : metrics.climateResilience < 65 ? "warn" : "good"
  const egTone = metrics.energyGrid < 40 ? "bad" : metrics.energyGrid < 70 ? "warn" : "good"
  const fsTone = metrics.foodSecurity < 40 ? "bad" : metrics.foodSecurity < 70 ? "warn" : "good"

  return (
    <div className="flex h-full flex-col gap-3">
      <h2 className="text-sm font-medium text-gray-200">City Metrics</h2>

      <section
        aria-label="Environmental Health"
        className="space-y-3 rounded-lg border border-[#00FFFF]/20 bg-white/5 p-3"
      >
        <h3 className="text-xs font-medium text-gray-300">Environmental Health</h3>
        <MetricBar label="Air Quality" value={metrics.airQuality} tone={aqTone as any} />
        <MetricBar label="Water Security" value={metrics.waterSecurity} tone={wsTone as any} />
        <MetricBar label="Carbon Balance" value={cb0to100} tone={cbTone as any} />
        <MetricBar label="Climate Resilience" value={metrics.climateResilience} tone={crTone as any} />
      </section>

      <section
        aria-label="Resource Management"
        className="space-y-3 rounded-lg border border-[#00FFFF]/20 bg-white/5 p-3"
      >
        <h3 className="text-xs font-medium text-gray-300">Resource Management</h3>
        <MetricBar label="Energy Grid" value={metrics.energyGrid} tone={egTone as any} />
        <MetricBar label="Food Security" value={metrics.foodSecurity} tone={fsTone as any} />
        <MetricBar label="Population Utilization" value={metrics.populationUtilization} />
        <div className="flex items-center justify-between rounded-md border border-[#00FFFF]/20 bg-black/30 px-3 py-2 text-xs">
          <span className="text-gray-300">Credits</span>
          <span className="font-semibold text-[#00FFFF]">{credits.toLocaleString()}</span>
        </div>
      </section>

      <section aria-label="City Performance" className="space-y-3 rounded-lg border border-[#00FFFF]/20 bg-white/5 p-3">
        <h3 className="text-xs font-medium text-gray-300">City Performance</h3>
        <MetricBar label="Happiness Index" value={metrics.happinessIndex} />
        <MetricBar label="Efficiency Rating" value={metrics.efficiency} />
        <MetricBar label="Innovation Score" value={metrics.innovation} />
        <MetricBar label="Sustainability Rank" value={metrics.sustainability} />
      </section>

      <div className="mt-auto flex items-center justify-between rounded-lg border border-[#00FFFF]/20 bg-black/30 px-3 py-2 text-xs">
        <span className="text-gray-300">Alerts</span>
        <span className="inline-flex items-center gap-2">
          <span className="rounded-md border border-[#ef4444]/40 bg-[#ef4444]/10 px-2 py-0.5 text-[#ef4444]">
            {metrics.alerts.red} critical
          </span>
          <span className="rounded-md border border-[#00FFFF]/30 bg-white/5 px-2 py-0.5 text-gray-300">
            {metrics.alerts.yellow} warnings
          </span>
          <span className="rounded-md border border-[#00FFFF]/30 bg-white/5 px-2 py-0.5 text-gray-300">
            {metrics.alerts.green} good
          </span>
        </span>
      </div>
    </div>
  )
}
