"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCityStore } from "./city-store"

type Challenge = {
  id: string
  title: string
  description: string
  reward: number
  progress: number // 0..1
}

export default function QuestsPanel({ onClose }: { onClose: () => void }) {
  const { placements } = useCityStore()

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    Object.values(placements).forEach((p) => {
      c[p.type] = (c[p.type] ?? 0) + 1
    })
    return c
  }, [placements])

  function neighborKeysFromKey(key: string) {
    const [qs, rs] = key.split(":")
    const q = Number.parseInt(qs, 10)
    const r = Number.parseInt(rs, 10)
    const dirs = [
      [1, 0],
      [1, -1],
      [0, -1],
      [-1, 0],
      [-1, 1],
      [0, 1],
    ]
    return dirs.map(([dq, dr]) => `${q + dq}:${r + dr}`)
  }

  const hasResearchNetwork = useMemo(() => {
    for (const [k, p] of Object.entries(placements)) {
      if (p.type !== "research-lab") continue
      const neighbors = neighborKeysFromKey(k)
      for (const nk of neighbors) {
        const np = placements[nk]
        if (!np) continue
        if (np.type === "ai-hub" || np.type === "quantum-computer") return true
      }
    }
    return false
  }, [placements])

  const challenges: Challenge[] = useMemo(() => {
    const solarGoal = 3
    const solarHave = Math.min(counts["solar-array"] ?? 0, solarGoal)
    const solarProgress = solarHave / solarGoal

    const reqRT = Math.min(1, counts["residential-tower"] ?? 0)
    const reqCC = Math.min(1, counts["community-center"] ?? 0)
    const popProgress = (reqRT + reqCC) / 2

    const researchProgress = hasResearchNetwork ? 1 : 0

    return [
      {
        id: "renewables-kickstart",
        title: "Kickstart Renewables",
        description: "Place 3 Solar Arrays",
        reward: 500,
        progress: solarProgress,
      },
      {
        id: "grow-population",
        title: "Grow Population",
        description: "Place 1 Residential Tower and 1 Community Center",
        reward: 800,
        progress: popProgress,
      },
      {
        id: "research-network",
        title: "Research Network",
        description: "Connect a Research Lab to an AI Hub or Quantum Computer",
        reward: 700,
        progress: researchProgress,
      },
    ]
  }, [counts, hasResearchNetwork])

  const active = challenges.filter((c) => c.progress < 1)
  const completed = challenges.filter((c) => c.progress >= 1)

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Quests"
      className="fixed inset-x-0 bottom-16 z-40 mx-auto w-full max-w-5xl rounded-t-xl border border-[#00FFFF]/20 bg-black/60 p-4 shadow-lg shadow-[#0080FF]/10 backdrop-blur-md md:p-6"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-cyan-300">Quests</h2>
        <Button
          variant="ghost"
          className="rounded-md border border-[#00FFFF]/30 bg-white/5 px-2 py-1 text-xs text-gray-200 hover:bg-white/10"
          onClick={onClose}
        >
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section aria-labelledby="active-quests">
          <h3 id="active-quests" className="text-xs font-medium text-cyan-300">
            Active
          </h3>
          <div className="mt-2 space-y-3">
            {active.length === 0 && <p className="text-sm text-muted-foreground">No active quests.</p>}
            {active.map((c) => (
              <Card key={c.id} className="bg-white/5 border-white/10 backdrop-blur">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-foreground/90">{c.title}</p>
                    <span className="text-xs text-cyan-300">+{c.reward} cr</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-300/80">{c.description}</p>
                  <div className="mt-3 h-2 w-full rounded bg-white/10">
                    <div
                      className="h-2 rounded bg-[#00FFFF]"
                      style={{ width: `${Math.round(c.progress * 100)}%`, boxShadow: "0 0 8px rgba(0,255,255,0.6)" }}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(c.progress * 100)}
                      role="progressbar"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="completed-quests">
          <h3 id="completed-quests" className="text-xs font-medium text-cyan-300">
            Completed
          </h3>
          <div className="mt-2 space-y-3">
            {completed.length === 0 && <p className="text-sm text-muted-foreground">No completed quests yet.</p>}
            {completed.map((c) => (
              <Card key={c.id} className="bg-white/5 border-white/10 backdrop-blur">
                <div className="p-4 flex items-center justify-between">
                  <p className="text-foreground/90">{c.title}</p>
                  <span className="text-xs text-cyan-300">+{c.reward} cr</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
