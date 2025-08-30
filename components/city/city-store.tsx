"use client"

import React from "react"

import type { ReactNode } from "react"
import { createContext, useCallback, useContext, useMemo, useReducer } from "react"

export type Category = "defense" | "energy" | "tech" | "social"
export type BuildingType =
  | "flood-barrier"
  | "air-purifier"
  | "storm-shield"
  | "heat-sink"
  | "fusion-plant"
  | "solar-array"
  | "vertical-farm"
  | "water-recycler"
  | "ai-hub"
  | "transport-node"
  | "research-lab"
  | "quantum-computer"
  | "residential-tower"
  | "community-center"
  | "medical-center"
  | "cultural-district"

export const categories: Record<Category, { label: string; count: number }> = {
  defense: { label: "Climate Defense", count: 4 },
  energy: { label: "Energy & Resources", count: 4 },
  tech: { label: "Technology", count: 4 },
  social: { label: "Housing & Social", count: 4 },
}

// limited color palette: #0080FF, #00FFFF, neutrals, and red elsewhere
const BLUE = "#0080FF"
const CYAN = "#00FFFF"

export const buildingCatalog: Record<
  BuildingType,
  { name: string; abbr: string; category: Category; categoryLabel: string; accent: string }
> = {
  "flood-barrier": {
    name: "Flood Barriers",
    abbr: "FB",
    category: "defense",
    categoryLabel: "Climate Defense",
    accent: CYAN,
  },
  "air-purifier": {
    name: "Air Purifiers",
    abbr: "AP",
    category: "defense",
    categoryLabel: "Climate Defense",
    accent: CYAN,
  },
  "storm-shield": {
    name: "Storm Shields",
    abbr: "SS",
    category: "defense",
    categoryLabel: "Climate Defense",
    accent: BLUE,
  },
  "heat-sink": { name: "Heat Sinks", abbr: "HS", category: "defense", categoryLabel: "Climate Defense", accent: BLUE },

  "fusion-plant": {
    name: "Fusion Plants",
    abbr: "FP",
    category: "energy",
    categoryLabel: "Energy & Resources",
    accent: BLUE,
  },
  "solar-array": {
    name: "Solar Arrays",
    abbr: "SA",
    category: "energy",
    categoryLabel: "Energy & Resources",
    accent: CYAN,
  },
  "vertical-farm": {
    name: "Vertical Farms",
    abbr: "VF",
    category: "energy",
    categoryLabel: "Energy & Resources",
    accent: CYAN,
  },
  "water-recycler": {
    name: "Water Recyclers",
    abbr: "WR",
    category: "energy",
    categoryLabel: "Energy & Resources",
    accent: BLUE,
  },

  "ai-hub": { name: "AI Coordination Hubs", abbr: "AI", category: "tech", categoryLabel: "Technology", accent: CYAN },
  "transport-node": {
    name: "Transport Nodes",
    abbr: "TN",
    category: "tech",
    categoryLabel: "Technology",
    accent: BLUE,
  },
  "research-lab": { name: "Research Labs", abbr: "RL", category: "tech", categoryLabel: "Technology", accent: BLUE },
  "quantum-computer": {
    name: "Quantum Computers",
    abbr: "QC",
    category: "tech",
    categoryLabel: "Technology",
    accent: CYAN,
  },

  "residential-tower": {
    name: "Residential Towers",
    abbr: "RT",
    category: "social",
    categoryLabel: "Housing & Social",
    accent: CYAN,
  },
  "community-center": {
    name: "Community Centers",
    abbr: "CC",
    category: "social",
    categoryLabel: "Housing & Social",
    accent: BLUE,
  },
  "medical-center": {
    name: "Medical Centers",
    abbr: "MC",
    category: "social",
    categoryLabel: "Housing & Social",
    accent: BLUE,
  },
  "cultural-district": {
    name: "Cultural Districts",
    abbr: "CD",
    category: "social",
    categoryLabel: "Housing & Social",
    accent: CYAN,
  },
}

export type BuildingStats = {
  cost: number
  energy: number // positive = production, negative = consumption
  population: number // positive = capacity, negative = staff requirement
  env: number // positive improves environment, negative pollutes
  happiness: number // delta
  maxLevel?: number
  upgradeMultiplier?: number // cost multiplier per level
}

export const buildingStats: Record<BuildingType, BuildingStats> = {
  "flood-barrier": { cost: 300, energy: -1, population: 0, env: 2, happiness: 0, maxLevel: 3, upgradeMultiplier: 1.4 },
  "air-purifier": { cost: 250, energy: -2, population: -2, env: 4, happiness: 1, maxLevel: 3, upgradeMultiplier: 1.4 },
  "storm-shield": { cost: 450, energy: -3, population: -3, env: 1, happiness: 1, maxLevel: 2, upgradeMultiplier: 1.5 },
  "heat-sink": { cost: 280, energy: -2, population: -1, env: 2, happiness: 1, maxLevel: 3, upgradeMultiplier: 1.3 },

  "fusion-plant": {
    cost: 900,
    energy: 20,
    population: -10,
    env: -2,
    happiness: -1,
    maxLevel: 2,
    upgradeMultiplier: 1.6,
  },
  "solar-array": { cost: 220, energy: 5, population: -1, env: 3, happiness: 0, maxLevel: 3, upgradeMultiplier: 1.3 },
  "vertical-farm": { cost: 400, energy: -3, population: 30, env: 3, happiness: 1, maxLevel: 3, upgradeMultiplier: 1.4 },
  "water-recycler": { cost: 260, energy: -1, population: 0, env: 4, happiness: 0, maxLevel: 3, upgradeMultiplier: 1.3 },

  "ai-hub": { cost: 500, energy: -4, population: -5, env: 1, happiness: 1, maxLevel: 2, upgradeMultiplier: 1.5 },
  "transport-node": {
    cost: 420,
    energy: -3,
    population: -4,
    env: 1,
    happiness: 2,
    maxLevel: 3,
    upgradeMultiplier: 1.4,
  },
  "research-lab": { cost: 480, energy: -5, population: -8, env: 2, happiness: 1, maxLevel: 2, upgradeMultiplier: 1.5 },
  "quantum-computer": {
    cost: 650,
    energy: -10,
    population: -4,
    env: 1,
    happiness: 2,
    maxLevel: 2,
    upgradeMultiplier: 1.7,
  },

  "residential-tower": {
    cost: 520,
    energy: -4,
    population: 200,
    env: -1,
    happiness: 2,
    maxLevel: 3,
    upgradeMultiplier: 1.4,
  },
  "community-center": {
    cost: 300,
    energy: -2,
    population: 0,
    env: 0,
    happiness: 4,
    maxLevel: 3,
    upgradeMultiplier: 1.3,
  },
  "medical-center": {
    cost: 380,
    energy: -3,
    population: -6,
    env: 1,
    happiness: 3,
    maxLevel: 3,
    upgradeMultiplier: 1.4,
  },
  "cultural-district": {
    cost: 450,
    energy: -4,
    population: -4,
    env: 0,
    happiness: 5,
    maxLevel: 2,
    upgradeMultiplier: 1.5,
  },
}

type Placement = { type: BuildingType; abbr: string; rotation: number; level: number }

type Totals = {
  energy: number
  energyProd: number
  energyCons: number
  populationCapacity: number
  populationDemand: number
  envScore: number
  happiness: number
  counts: Record<string, number>
}

function applyTotals(placements: Record<string, Placement>): Totals {
  let energy = 0
  let energyProd = 0
  let energyCons = 0
  let popCap = 0
  let popDem = 0
  let env = 0
  let happy = 0
  const counts: Record<string, number> = {}

  for (const p of Object.values(placements)) {
    const s = buildingStats[p.type]
    const levelMult = 1 + (p.level - 1) * 0.25
    const e = s.energy * levelMult
    energy += e
    if (e > 0) energyProd += e
    if (e < 0) energyCons += Math.abs(e)
    if (s.population >= 0) popCap += s.population * levelMult
    else popDem += Math.abs(s.population) * levelMult
    env += s.env * levelMult
    happy += s.happiness * levelMult
    counts[p.type] = (counts[p.type] ?? 0) + 1
  }

  return {
    energy: Math.round(energy),
    energyProd: Math.round(energyProd),
    energyCons: Math.round(energyCons),
    populationCapacity: Math.round(popCap),
    populationDemand: Math.round(popDem),
    envScore: Math.round(env),
    happiness: Math.round(happy),
    counts,
  }
}

type State = {
  selectedBuilding: BuildingType | null
  selectedRotation: number // 0..5
  credits: number
  energy: number
  energyProd: number
  energyCons: number
  populationCapacity: number
  populationDemand: number
  envScore: number
  happiness: number
  placements: Record<string, Placement>
  invalidPulse: Record<string, number>
}

type Action =
  | { type: "select"; payload: BuildingType | null }
  | { type: "rotate"; payload: { stepDelta: number } }
  | { type: "place"; payload: { key: string; type: BuildingType } }
  | { type: "remove"; payload: { key: string } }
  | { type: "upgrade"; payload: { key: string } }
  | { type: "pulse-invalid"; payload: { key: string } }
  | { type: "recompute" }
  | { type: "credit-delta"; payload: { amount: number } }
  | { type: "apply-scenario"; payload: { placements: Record<string, Placement>; credits: number } }
  | { type: "load-state"; payload: { placements: Record<string, Placement>; credits: number } }
  | { type: "clear-grid" }

const initialState: State = {
  selectedBuilding: null,
  selectedRotation: 0,
  credits: 12500,
  energy: 0,
  energyProd: 0,
  energyCons: 0,
  populationCapacity: 0,
  populationDemand: 0,
  envScore: 0,
  happiness: 0,
  placements: {},
  invalidPulse: {},
}

function reducer(state: State, action: Action): State {
  switch ((action as Action).type) {
    case "select":
      return { ...state, selectedBuilding: (action as any).payload }
    case "rotate": {
      const next = (state.selectedRotation + (action as any).payload.stepDelta + 6) % 6
      return { ...state, selectedRotation: next }
    }
    case "place": {
      const { key, type } = (action as any).payload
      if (state.placements[key]) return state
      const base = buildingStats[type]
      const cost = Math.round(base.cost) // level 1
      if (state.credits < cost) return state
      const abbr = buildingCatalog[type].abbr
      const nextPlacements = {
        ...state.placements,
        [key]: { type, abbr, rotation: state.selectedRotation, level: 1 },
      }
      const totals = applyTotals(nextPlacements)
      return {
        ...state,
        credits: state.credits - cost,
        placements: nextPlacements,
        energy: totals.energy,
        energyProd: totals.energyProd,
        energyCons: totals.energyCons,
        populationCapacity: totals.populationCapacity,
        populationDemand: totals.populationDemand,
        envScore: totals.envScore,
        happiness: totals.happiness,
      }
    }
    case "remove": {
      const { key } = (action as any).payload
      const p = state.placements[key]
      if (!p) return state
      const base = buildingStats[p.type]
      // refund 50% of cumulative cost (approx): base * sum(mult per level)
      let cumulative = 0
      let cost = base.cost
      const mult = base.upgradeMultiplier ?? 1.4
      for (let lvl = 1; lvl <= p.level; lvl++) {
        cumulative += cost
        cost = Math.round(cost * mult)
      }
      const refund = Math.round(cumulative * 0.5)
      const next = { ...state.placements }
      delete next[key]
      const totals = applyTotals(next)
      return { ...state, credits: state.credits + refund, placements: next, ...totals }
    }
    case "upgrade": {
      const { key } = (action as any).payload
      const p = state.placements[key]
      if (!p) return state
      const base = buildingStats[p.type]
      const maxLevel = base.maxLevel ?? 3
      if (p.level >= maxLevel) return state
      const mult = base.upgradeMultiplier ?? 1.4
      // compute upgrade cost: base * mult^(currentLevel-1)
      const upgradeCost = Math.round(base.cost * Math.pow(mult, p.level))
      if (state.credits < upgradeCost) return state
      const next = {
        ...state.placements,
        [key]: { ...p, level: p.level + 1 },
      }
      const totals = applyTotals(next)
      return { ...state, credits: state.credits - upgradeCost, placements: next, ...totals }
    }
    case "pulse-invalid":
      return { ...state, invalidPulse: { ...state.invalidPulse, [((action as any).payload as any).key]: Date.now() } }
    case "recompute": {
      const totals = applyTotals(state.placements)
      return {
        ...state,
        energy: totals.energy,
        energyProd: totals.energyProd,
        energyCons: totals.energyCons,
        populationCapacity: totals.populationCapacity,
        populationDemand: totals.populationDemand,
        envScore: totals.envScore,
        happiness: totals.happiness,
      }
    }
    case "credit-delta": {
      const next = Math.max(0, state.credits + (action as any).payload.amount)
      return { ...state, credits: next }
    }
    case "apply-scenario": {
      const { placements, credits } = (action as any).payload
      const totals = applyTotals(placements)
      return {
        ...state,
        credits,
        placements,
        energy: totals.energy,
        energyProd: totals.energyProd,
        energyCons: totals.energyCons,
        populationCapacity: totals.populationCapacity,
        populationDemand: totals.populationDemand,
        envScore: totals.envScore,
        happiness: totals.happiness,
      }
    }
    case "load-state": {
      const { placements, credits } = (action as any).payload
      const totals = applyTotals(placements)
      return {
        ...state,
        credits,
        placements,
        energy: totals.energy,
        energyProd: totals.energyProd,
        energyCons: totals.energyCons,
        populationCapacity: totals.populationCapacity,
        populationDemand: totals.populationDemand,
        envScore: totals.envScore,
        happiness: totals.happiness,
      }
    }
    case "clear-grid": {
      const nextPlacements: Record<string, Placement> = {}
      const totals = applyTotals(nextPlacements)
      return {
        ...state,
        placements: nextPlacements,
        invalidPulse: {},
        energy: totals.energy,
        energyProd: totals.energyProd,
        energyCons: totals.energyCons,
        populationCapacity: totals.populationCapacity,
        populationDemand: totals.populationDemand,
        envScore: totals.envScore,
        happiness: totals.happiness,
      }
    }
    default:
      return state
  }
}

// Derived metrics (0-100 normalizations) for dashboard
export type DerivedMetrics = {
  airQuality: number
  waterSecurity: number
  carbonBalance: number // -100..100 visualized as 0..100
  climateResilience: number
  energyGrid: number
  foodSecurity: number
  populationUtilization: number
  happinessIndex: number
  efficiency: number
  innovation: number
  sustainability: number
  alerts: { red: number; yellow: number; green: number }
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x))
}

function deriveMetrics(state: State): DerivedMetrics {
  const { energy, energyProd, energyCons, envScore, populationCapacity, populationDemand, happiness, placements } =
    state

  const counts = Object.values(placements).reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] ?? 0) + 1
    return acc
  }, {})

  // Air Quality: tied to envScore and air purifiers
  const purifierBoost = (counts["air-purifier"] ?? 0) * 6
  const airQuality = Math.round(clamp01((envScore + purifierBoost + 20) / 100) * 100)

  // Water Security: water recyclers and vertical farms contribute; demand from population
  const waterCapacity = (counts["water-recycler"] ?? 0) * 120 + (counts["vertical-farm"] ?? 0) * 40
  const waterNeeds = Math.max(50, populationCapacity * 0.3 + populationDemand * 0.2)
  const waterSecurity = Math.round(clamp01(waterCapacity / (waterNeeds || 1)) * 100)

  // Carbon Balance: positive if net renewable-heavy; approximate from envScore and energy
  const carbonRaw = envScore + Math.min(energy, 50) - (counts["fusion-plant"] ?? 0) * 5
  const carbonBalance = Math.max(-100, Math.min(100, Math.round(carbonRaw)))

  // Climate Resilience: flood barriers, storm shields, heat sinks, envScore baseline
  const resilience =
    (counts["flood-barrier"] ?? 0) * 8 +
    (counts["storm-shield"] ?? 0) * 10 +
    (counts["heat-sink"] ?? 0) * 6 +
    envScore * 0.5
  const climateResilience = Math.round(clamp01((resilience + 20) / 100) * 100)

  // Energy Grid: production vs consumption
  const energyGrid = Math.round(clamp01(energyProd / (energyCons || 1) / 1.5) * 100)

  // Food Security: vertical farms vs demand
  const foodCapacity = (counts["vertical-farm"] ?? 0) * 160
  const foodNeeds = Math.max(100, populationCapacity * 0.5)
  const foodSecurity = Math.round(clamp01(foodCapacity / (foodNeeds || 1)) * 100)

  // Population utilization: demand satisfied by capacity
  const popUtil = Math.round(clamp01((populationCapacity - populationDemand) / (populationCapacity || 1)) * 100)

  // Happiness Index from happiness score and civics
  const civicBoost =
    (counts["community-center"] ?? 0) * 4 + (counts["cultural-district"] ?? 0) * 5 + (counts["medical-center"] ?? 0) * 3
  const happinessIndex = Math.round(clamp01((happiness * 6 + civicBoost + 30) / 100) * 100)

  // Efficiency: synergy proxy from AI, research, transport and energy balance
  const synergy =
    (counts["ai-hub"] ?? 0) * 8 + (counts["research-lab"] ?? 0) * 6 + (counts["transport-node"] ?? 0) * 4 + energy * 1.5
  const efficiency = Math.round(clamp01((50 + synergy) / 150) * 100)

  // Innovation: research and quantum
  const innovation = Math.round(
    clamp01(((counts["research-lab"] ?? 0) * 12 + (counts["quantum-computer"] ?? 0) * 18) / 100) * 100,
  )

  // Sustainability: blend air, water, carbon, energy balance, food
  const sustainability = Math.round(
    clamp01((airQuality + waterSecurity + (carbonBalance + 100) / 2 + energyGrid + foodSecurity) / (5 * 100)) * 100,
  )

  // Alerts
  const checks = [
    { val: airQuality, red: 40, yellow: 70 },
    { val: waterSecurity, red: 40, yellow: 70 },
    { val: (carbonBalance + 100) / 2, red: 40, yellow: 70 },
    { val: climateResilience, red: 35, yellow: 65 },
    { val: energyGrid, red: 40, yellow: 70 },
    { val: foodSecurity, red: 40, yellow: 70 },
  ]
  let red = 0,
    yellow = 0,
    green = 0
  for (const c of checks) {
    if (c.val < c.red) red++
    else if (c.val < c.yellow) yellow++
    else green++
  }

  return {
    airQuality,
    waterSecurity,
    carbonBalance,
    climateResilience,
    energyGrid,
    foodSecurity,
    populationUtilization: popUtil,
    happinessIndex,
    efficiency,
    innovation,
    sustainability,
    alerts: { red, yellow, green },
  }
}

const CityStoreContext = createContext<{
  selectedBuilding: BuildingType | null
  selectedRotation: number
  credits: number
  energy: number
  energyProd: number
  energyCons: number
  populationCapacity: number
  populationDemand: number
  envScore: number
  happiness: number
  placements: Record<string, Placement>
  selectBuilding: (t: BuildingType) => void
  clearSelection: () => void
  rotateSelected: (delta: number) => void
  placeBuilding: (key: string) => void
  removeBuilding: (key: string) => void
  upgradeBuilding: (key: string) => void
  pulseInvalid: (key: string) => void
  canPlaceAt: (key: string, type: BuildingType) => { ok: boolean; reason?: string }
  metrics: DerivedMetrics
  creditDelta: (amount: number) => void
  applyScenario: (data: { placements: Record<string, Placement>; credits: number }) => void
  saveToLocal: () => void
  loadFromLocal: () => void
  clearSave: () => void
  clearGrid: () => void
}>({
  selectedBuilding: null,
  selectedRotation: 0,
  credits: 0,
  energy: 0,
  energyProd: 0,
  energyCons: 0,
  populationCapacity: 0,
  populationDemand: 0,
  envScore: 0,
  happiness: 0,
  placements: {},
  selectBuilding: () => {},
  clearSelection: () => {},
  rotateSelected: () => {},
  placeBuilding: () => {},
  removeBuilding: () => {},
  upgradeBuilding: () => {},
  pulseInvalid: () => {},
  canPlaceAt: () => ({ ok: true }),
  metrics: {
    airQuality: 0,
    waterSecurity: 0,
    carbonBalance: 0,
    climateResilience: 0,
    energyGrid: 0,
    foodSecurity: 0,
    populationUtilization: 0,
    happinessIndex: 0,
    efficiency: 0,
    innovation: 0,
    sustainability: 0,
    alerts: { red: 0, yellow: 0, green: 0 },
  },
  creditDelta: () => {},
  applyScenario: () => {},
  saveToLocal: () => {},
  loadFromLocal: () => {},
  clearSave: () => {},
  clearGrid: () => {},
})

export function CityStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const selectBuilding = useCallback((t: BuildingType) => dispatch({ type: "select", payload: t }), [])
  const clearSelection = useCallback(() => dispatch({ type: "select", payload: null }), [])
  const rotateSelected = useCallback((delta: number) => dispatch({ type: "rotate", payload: { stepDelta: delta } }), [])
  const placeBuilding = useCallback(
    (key: string) => {
      if (!state.selectedBuilding) return
      // placement validation pre-check is done by canPlaceAt, but enforce here
      const test = canPlaceAtImpl(state, key, state.selectedBuilding)
      if (!test.ok) return
      dispatch({ type: "place", payload: { key, type: state.selectedBuilding } })
    },
    [state.selectedBuilding, state],
  )
  const removeBuilding = useCallback((key: string) => dispatch({ type: "remove", payload: { key } }), [])
  const upgradeBuilding = useCallback((key: string) => dispatch({ type: "upgrade", payload: { key } }), [])
  const pulseInvalid = useCallback((key: string) => dispatch({ type: "pulse-invalid", payload: { key } }), [])
  const creditDelta = useCallback((amount: number) => dispatch({ type: "credit-delta", payload: { amount } }), [])
  const clearGrid = useCallback(() => dispatch({ type: "clear-grid" }), [])

  const canPlaceAtImpl = useCallback((s: State, key: string, type: BuildingType): { ok: boolean; reason?: string } => {
    if (s.placements[key]) return { ok: false, reason: "occupied" }
    // credits check
    const base = buildingStats[type]
    if (s.credits < base.cost) return { ok: false, reason: "insufficient-credits" }
    // safety clearance: fusion-plant must not be adjacent (distance 1) to social or residential
    if (type === "fusion-plant") {
      // If any neighbor within distance 1 is social or residential tower
      const neighborKeys = neighborKeysFromKey(key)
      for (const nk of neighborKeys) {
        const p = s.placements[nk]
        if (!p) continue
        if (
          p.type === "residential-tower" ||
          p.type === "community-center" ||
          p.type === "medical-center" ||
          p.type === "cultural-district"
        ) {
          return { ok: false, reason: "safety-clearance" }
        }
      }
    }
    return { ok: true }
  }, [])

  // helper: compute neighbor axial keys (distance 1) for our 8x8 grid key "q:r"
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

  const applyScenario = useCallback(
    (data: { placements: Record<string, Placement>; credits: number }) =>
      dispatch({ type: "apply-scenario", payload: data }),
    [],
  )
  const saveKey = "neoCitySaveV1"

  const saveToLocal = useCallback(() => {
    try {
      const payload = {
        version: 1,
        credits: state.credits,
        placements: state.placements,
      }
      localStorage.setItem(saveKey, JSON.stringify(payload))
    } catch {}
  }, [state.credits, state.placements])

  const loadFromLocal = useCallback(() => {
    try {
      const raw = localStorage.getItem(saveKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as { version: number; credits: number; placements: Record<string, Placement> }
      if (!parsed || typeof parsed.credits !== "number" || typeof parsed.placements !== "object") return
      dispatch({ type: "load-state", payload: { credits: parsed.credits, placements: parsed.placements } })
    } catch {}
  }, [])

  const clearSave = useCallback(() => {
    try {
      localStorage.removeItem(saveKey)
    } catch {}
  }, [])

  React.useEffect(() => {
    // attempt to load once on first mount
    try {
      const raw = localStorage.getItem(saveKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as { version: number; credits: number; placements: Record<string, Placement> }
      if (!parsed) return
      dispatch({ type: "load-state", payload: { credits: parsed.credits, placements: parsed.placements } })
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    const t = setTimeout(() => {
      try {
        const payload = {
          version: 1,
          credits: state.credits,
          placements: state.placements,
        }
        localStorage.setItem(saveKey, JSON.stringify(payload))
      } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [state.credits, state.placements])

  const value = useMemo(
    () => ({
      selectedBuilding: state.selectedBuilding,
      selectedRotation: state.selectedRotation,
      credits: state.credits,
      energy: state.energy,
      energyProd: state.energyProd,
      energyCons: state.energyCons,
      populationCapacity: state.populationCapacity,
      populationDemand: state.populationDemand,
      envScore: state.envScore,
      happiness: state.happiness,
      placements: state.placements,
      selectBuilding,
      clearSelection,
      rotateSelected,
      placeBuilding,
      removeBuilding,
      upgradeBuilding,
      pulseInvalid,
      canPlaceAt: (key: string, type: BuildingType) => canPlaceAtImpl(state, key, type),
      metrics: deriveMetrics(state),
      creditDelta,
      applyScenario,
      saveToLocal,
      loadFromLocal,
      clearSave,
      clearGrid,
    }),
    [
      state,
      selectBuilding,
      clearSelection,
      rotateSelected,
      placeBuilding,
      removeBuilding,
      upgradeBuilding,
      pulseInvalid,
      canPlaceAtImpl,
      creditDelta,
      applyScenario,
      saveToLocal,
      loadFromLocal,
      clearSave,
      clearGrid,
    ],
  )

  return <CityStoreContext.Provider value={value}>{children}</CityStoreContext.Provider>
}

export function useCityStore() {
  return useContext(CityStoreContext)
}

export type ScenarioPreset = {
  id: string
  name: string
  description: string
  credits: number
  placements: Record<string, { type: BuildingType; rotation?: number; level?: number }>
}

export const SCENARIOS: ScenarioPreset[] = [
  {
    id: "eco-start",
    name: "Eco Start",
    description: "Renewables and water ready to grow.",
    credits: 13500,
    placements: {
      "1:1": { type: "solar-array" },
      "2:1": { type: "solar-array" },
      "1:2": { type: "solar-array" },
      "2:2": { type: "water-recycler" },
      "3:2": { type: "vertical-farm" },
    },
  },
  {
    id: "defense-first",
    name: "Defense First",
    description: "Storm shields and barriers active.",
    credits: 14000,
    placements: {
      "0:0": { type: "flood-barrier" },
      "7:0": { type: "flood-barrier" },
      "0:7": { type: "flood-barrier" },
      "7:7": { type: "flood-barrier" },
      "3:3": { type: "storm-shield" },
    },
  },
  {
    id: "society-transit",
    name: "Society & Transit",
    description: "Housing and access front-loaded.",
    credits: 13000,
    placements: {
      "4:4": { type: "residential-tower" },
      "4:5": { type: "community-center" },
      "3:5": { type: "transport-node" },
    },
  },
  {
    id: "coastal-defense",
    name: "Coastal Defense",
    description: "Shoreline fortified with surge protection and water readiness.",
    credits: 14500,
    placements: {
      "0:1": { type: "flood-barrier" },
      "1:0": { type: "flood-barrier" },
      "7:6": { type: "flood-barrier" },
      "6:7": { type: "flood-barrier" },
      "3:2": { type: "storm-shield" },
      "2:4": { type: "water-recycler" },
    },
  },
  {
    id: "desert-solar-oasis",
    name: "Desert Solar Oasis",
    description: "High solar input with essential water and food loops.",
    credits: 15000,
    placements: {
      "2:2": { type: "solar-array" },
      "3:2": { type: "solar-array" },
      "4:2": { type: "solar-array" },
      "3:3": { type: "solar-array" },
      "2:3": { type: "water-recycler" },
      "4:3": { type: "vertical-farm" },
    },
  },
  {
    id: "windy-highlands",
    name: "Windy Highlands",
    description: "Resilient plateau grid with transit and research support.",
    credits: 13800,
    placements: {
      "1:5": { type: "storm-shield" },
      "2:5": { type: "solar-array" },
      "3:5": { type: "transport-node" },
      "2:4": { type: "research-lab" },
    },
  },
  {
    id: "dense-urban-core",
    name: "Dense Urban Core",
    description: "Vertical housing backed by health and mobility services.",
    credits: 12500,
    placements: {
      "4:4": { type: "residential-tower" },
      "5:4": { type: "residential-tower" },
      "4:5": { type: "community-center" },
      "5:5": { type: "medical-center" },
      "3:4": { type: "transport-node" },
    },
  },
  {
    id: "island-microgrid",
    name: "Island Microgrid",
    description: "Self-reliant microgrid with AI coordination.",
    credits: 14200,
    placements: {
      "1:6": { type: "solar-array" },
      "2:6": { type: "solar-array" },
      "1:7": { type: "water-recycler" },
      "2:7": { type: "vertical-farm" },
      "3:6": { type: "ai-hub" },
    },
  },
  {
    id: "post-disaster-recovery",
    name: "Post-Disaster Recovery",
    description: "Emergency stabilization with defense and care networks.",
    credits: 11000,
    placements: {
      "0:3": { type: "storm-shield" },
      "0:4": { type: "flood-barrier" },
      "1:3": { type: "medical-center" },
      "1:4": { type: "community-center" },
      "2:4": { type: "water-recycler" },
    },
  },
]

// Export scenarioToReducerPlacements so BottomBar can import it
export function scenarioToReducerPlacements(
  src: ScenarioPreset["placements"],
): Record<string, { type: BuildingType; abbr: string; rotation: number; level: number }> {
  const out: Record<string, { type: BuildingType; abbr: string; rotation: number; level: number }> = {}
  for (const [key, v] of Object.entries(src)) {
    out[key] = {
      type: v.type,
      abbr: buildingCatalog[v.type].abbr,
      rotation: v.rotation ?? 0,
      level: v.level ?? 1,
    }
  }
  return out
}
