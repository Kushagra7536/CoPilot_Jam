"use client"

import { useEffect, useMemo, useState } from "react"
import { useCityStore } from "./city-store"
import { useToast } from "@/hooks/use-toast"
import { canNotify } from "./notify"

type Challenge = {
  id: string
  title: string
  description: string
  reward: number
  progress: number // 0..1 (computed externally)
}

export default function ChallengeSystem() {
  const { placements, creditDelta } = useCityStore()
  const { toast } = useToast()
  const [awarded, setAwarded] = useState<Record<string, boolean>>({})
  const [eventTick, setEventTick] = useState(0)

  // Helpers
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

  // Active challenges with computed progress
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

  // Award credits once when progress hits 100%
  useEffect(() => {
    challenges.forEach((ch) => {
      if (ch.progress >= 1 && !awarded[ch.id]) {
        setAwarded((prev) => ({ ...prev, [ch.id]: true }))
        creditDelta(ch.reward)
        if (canNotify(`quest-${ch.id}`, 5000)) {
          toast({
            title: "Challenge completed",
            description: `${ch.title} • +${ch.reward} credits awarded.`,
          })
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenges])

  // Random event ticker every 20-30s
  useEffect(() => {
    let active = true
    function scheduleNext() {
      if (!active) return
      const delay = 20000 + Math.floor(Math.random() * 10000) // 20-30s
      setTimeout(() => {
        if (!active) return
        setEventTick((t) => t + 1)
        scheduleNext()
      }, delay)
    }
    scheduleNext()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (eventTick === 0) return
    // Mitigation helpers
    const shields = (counts["storm-shield"] ?? 0) > 0
    const barriers = (counts["flood-barrier"] ?? 0) > 0
    const purifiers = (counts["air-purifier"] ?? 0) > 0

    // Pick an event
    type EventDef = { title: string; description: string; amount: number }
    const pool: EventDef[] = [
      {
        title: "Government Grant",
        description: "Funding allocated for sustainable infrastructure.",
        amount: 600,
      },
      {
        title: "Maintenance Costs",
        description: "Routine upkeep across city systems.",
        amount: -300,
      },
      {
        title: "Community Donation",
        description: "Civic groups fund local improvements.",
        amount: 400,
      },
      {
        title: "Storm Damage",
        description:
          shields || barriers ? "Storms hit, but defenses reduce impact." : "Storms cause infrastructure damage.",
        amount: shields || barriers ? -120 : -250,
      },
      {
        title: "Air Quality Program",
        description: purifiers ? "Purifiers attract green incentives." : "City invests to improve air quality.",
        amount: purifiers ? 300 : -150,
      },
    ]
    const ev = pool[Math.floor(Math.random() * pool.length)]
    creditDelta(ev.amount)
    if (canNotify("random-event", 45000)) {
      toast({
        title: ev.title,
        description: `${ev.description} ${ev.amount >= 0 ? `+${ev.amount} credits.` : `${ev.amount} credits.`}`,
        variant: ev.amount < 0 ? "destructive" : undefined,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTick])

  const visibleChallenges = challenges.filter((c) => !awarded[c.id] || c.progress < 1)

  return (
    <section aria-live="polite" aria-label="Challenge system updates" className="sr-only">
      {visibleChallenges.map((c) => (
        <div key={c.id}>
          {c.title} {Math.round(c.progress * 100)}%
        </div>
      ))}
    </section>
  )
}
