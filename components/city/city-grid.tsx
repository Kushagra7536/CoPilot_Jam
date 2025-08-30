"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { axialKey, axialToPixel, hexPolygonPoints, hexDistance, type Axial } from "./hex-utils"
import { useCityStore } from "./city-store"
import { buildingCatalog, buildingStats } from "./city-store"
import { useToast } from "@/hooks/use-toast"
import { canNotify } from "./notify"

export default function CityGrid() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState(24) // hex radius in px; will be responsive
  const [hoverKey, setHoverKey] = useState<string | null>(null)
  const {
    selectedBuilding,
    selectedRotation,
    placements,
    placeBuilding,
    removeBuilding,
    pulseInvalid,
    rotateSelected,
    canPlaceAt,
    upgradeBuilding,
  } = useCityStore()
  const { toast } = useToast()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const DPR = Math.min(2, window.devicePixelRatio || 1)
    const measure = () => {
      const { width } = el.getBoundingClientRect()
      // fit ~8 columns of pointy-top hexes
      const proposed = Math.max(16, Math.floor((width - 24) / (8 * Math.sqrt(3))))
      setSize(proposed)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const tiles: Axial[] = useMemo(() => {
    const list: Axial[] = []
    for (let r = 0; r < 8; r++) {
      for (let q = 0; q < 8; q++) list.push({ q, r })
    }
    return list
  }, [])

  const centers = useMemo(() => {
    return tiles.map((t) => {
      const { x, y } = axialToPixel(t, size)
      return { key: axialKey(t), x, y, t }
    })
  }, [tiles, size])

  const width = useMemo(() => {
    if (centers.length === 0) return 0
    const xs = centers.map((c) => c.x)
    return Math.max(...xs) + size * 2
  }, [centers, size])

  const height = useMemo(() => {
    if (centers.length === 0) return 0
    const ys = centers.map((c) => c.y)
    return Math.max(...ys) + size * 2
  }, [centers, size])

  const connectionLines = useMemo(() => {
    // connect buildings within distance <= 2 (avoid duplicates)
    const placed = Object.entries(placements)
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = []
    for (let i = 0; i < placed.length; i++) {
      const [k1] = placed[i]
      const c1 = centers.find((c) => c.key === k1)
      if (!c1) continue
      for (let j = i + 1; j < placed.length; j++) {
        const [k2] = placed[j]
        const c2 = centers.find((c) => c.key === k2)
        if (!c2) continue
        if (hexDistance(c1.t, c2.t) <= 2) {
          lines.push({ x1: c1.x, y1: c1.y, x2: c2.x, y2: c2.y })
        }
      }
    }
    return lines
  }, [placements, centers])

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

  const synergyFlows = useMemo(() => {
    const placed = Object.entries(placements)
    const lines: { x1: number; y1: number; x2: number; y2: number; kind: "water" | "transit" | "research" }[] = []
    for (let i = 0; i < placed.length; i++) {
      const [k1, p1] = placed[i]
      const c1 = centers.find((c) => c.key === k1)
      if (!c1) continue
      for (let j = i + 1; j < placed.length; j++) {
        const [k2, p2] = placed[j]
        const c2 = centers.find((c) => c.key === k2)
        if (!c2) continue
        if (hexDistance(c1.t, c2.t) > 2) continue

        const a = p1.type
        const b = p2.type
        const match = (t1: string, t2: string) => (a === t1 && b === t2) || (a === t2 && b === t1)

        if (match("vertical-farm", "water-recycler")) {
          lines.push({ x1: c1.x, y1: c1.y, x2: c2.x, y2: c2.y, kind: "water" })
        } else if (match("transport-node", "residential-tower") || match("transport-node", "community-center")) {
          lines.push({ x1: c1.x, y1: c1.y, x2: c2.x, y2: c2.y, kind: "transit" })
        } else if (match("research-lab", "ai-hub") || match("research-lab", "quantum-computer")) {
          lines.push({ x1: c1.x, y1: c1.y, x2: c2.x, y2: c2.y, kind: "research" })
        }
      }
    }
    return lines
  }, [placements, centers])

  function getSynergyMessages(key: string, type: string) {
    const neighbors = neighborKeysFromKey(key)
    const msgs: string[] = []
    for (const nk of neighbors) {
      const p = placements[nk]
      if (!p) continue
      const nType = p.type
      if (
        (type === "research-lab" && (nType === "ai-hub" || nType === "quantum-computer")) ||
        (nType === "research-lab" && (type === "ai-hub" || type === "quantum-computer"))
      ) {
        msgs.push("Research Network Boost: Innovation increases.")
      }
      if (
        (type === "vertical-farm" && nType === "water-recycler") ||
        (nType === "vertical-farm" && type === "water-recycler")
      ) {
        msgs.push("Resource Loop: Water recycling supports vertical farming.")
      }
      if (
        (type === "transport-node" && (nType === "residential-tower" || nType === "community-center")) ||
        (nType === "transport-node" && (type === "residential-tower" || type === "community-center"))
      ) {
        msgs.push("Mobility Synergy: Better access improves well-being.")
      }
      if (
        (type === "air-purifier" && nType === "residential-tower") ||
        (nType === "air-purifier" && type === "residential-tower")
      ) {
        msgs.push("Clean Air: Purifiers improve nearby homes' air quality.")
      }
    }
    return msgs
  }

  const handleClick = (key: string, withUpgrade = false) => {
    const occupied = Boolean(placements[key])
    if (withUpgrade && occupied) {
      const current = placements[key]
      if (canNotify("upgrade", 4000)) {
        toast({
          title: "Upgrade",
          description: `Upgrading ${buildingCatalog[current.type].name} to level ${current.level + 1}...`,
        })
      }
      upgradeBuilding(key)
      return
    }
    if (!selectedBuilding) return
    const test = canPlaceAt(key, selectedBuilding)
    if (!test.ok) {
      pulseInvalid(key)
      const reasonKey = test.reason === "insufficient-credits" ? "invalid-credits" : "invalid-safety"
      if (canNotify(reasonKey, 5000)) {
        if (test.reason === "insufficient-credits") {
          toast({
            title: "Insufficient credits",
            description: "You need more credits to place this building.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Safety clearance",
            description: "Fusion Plants cannot be adjacent to residential or civic buildings.",
            variant: "destructive",
          })
        }
      }
      return
    }
    const synergies = getSynergyMessages(key, selectedBuilding)
    placeBuilding(key)
    if (synergies.length && canNotify("synergy", 10000)) {
      const extra = synergies.length > 1 ? ` (+${synergies.length - 1} more)` : ""
      toast({
        title: "Synergy detected",
        description: `${synergies[0]}${extra}`,
      })
    }
  }

  const handleContextMenu = (e: React.MouseEvent, key: string) => {
    e.preventDefault()
    if (placements[key]) removeBuilding(key)
  }

  const onWheel = (e: React.WheelEvent) => {
    if (!selectedBuilding) return
    e.preventDefault()
    rotateSelected(e.deltaY > 0 ? 1 : -1)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") rotateSelected(1)
      if (e.key === "e" || e.key === "E") rotateSelected(-1)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [rotateSelected])

  return (
    <div ref={containerRef} className="relative aspect-square w-full" onWheel={onWheel} tabIndex={0}>
      <svg
        role="region"
        aria-label="Interactive city grid 8 by 8 hexes"
        width="100%"
        height="100%"
        viewBox={`0 0 ${Math.max(width, 10)} ${Math.max(height, 10)}`}
        className="rounded-lg"
      >
        {/* Connection lines */}
        <g stroke="#00FFFF" strokeOpacity="0.25">
          {connectionLines.map((l, i) => (
            <line key={i} {...l} strokeWidth="1.5" />
          ))}
        </g>

        <g strokeLinecap="round">
          {synergyFlows.map((l, i) => (
            <line
              key={`flow-${i}`}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              className={`flow-line ${l.kind === "water" ? "flow-water" : l.kind === "transit" ? "flow-transit" : "flow-research"}`}
              strokeWidth="2"
            />
          ))}
        </g>

        {/* Hex tiles */}
        <g>
          {centers.map(({ key, x, y, t }) => {
            const poly = hexPolygonPoints(x, y, size)
            const occupied = Boolean(placements[key])
            const isHover = hoverKey === key
            const isValidHover = Boolean(
              selectedBuilding && !occupied && isHover && canPlaceAt(key, selectedBuilding).ok,
            )
            const invalidReason =
              selectedBuilding && isHover && (!canPlaceAt(key, selectedBuilding).ok || occupied)
                ? canPlaceAt(key, selectedBuilding).reason
                : undefined
            const isInvalidHover = Boolean(
              selectedBuilding && isHover && (!canPlaceAt(key, selectedBuilding).ok || occupied),
            )

            return (
              <g
                key={key}
                onMouseEnter={() => setHoverKey(key)}
                onMouseLeave={() => setHoverKey((k) => (k === key ? null : k))}
                onClick={(e) => handleClick(key, e.shiftKey)}
                onContextMenu={(e) => handleContextMenu(e, key)}
                className="cursor-pointer transition-all duration-300"
              >
                {/* base cell */}
                <polygon points={poly} fill="rgba(0,0,0,0.25)" stroke="rgba(0,255,255,0.2)" strokeWidth={1} />
                {isValidHover && (
                  <polygon
                    points={poly}
                    fill="rgba(0,255,255,0.08)"
                    stroke="#00FFFF"
                    strokeOpacity="0.9"
                    strokeWidth={1}
                    style={{ filter: "drop-shadow(0 0 8px rgba(0,255,255,0.6))" }}
                  />
                )}
                {/* invalid hover */}
                {isInvalidHover && (
                  <polygon
                    points={poly}
                    fill="transparent"
                    stroke="#ef4444"
                    strokeOpacity="0.9"
                    strokeWidth={1.5}
                    style={{ filter: "drop-shadow(0 0 10px rgba(239,68,68,0.7))" }}
                  />
                )}
                {/* occupied outline */}
                {occupied && (
                  <polygon
                    points={poly}
                    fill="rgba(0,128,255,0.08)"
                    stroke="#0080FF"
                    strokeOpacity="0.7"
                    strokeWidth={1.5}
                    style={{ filter: "drop-shadow(0 0 8px rgba(0,128,255,0.6))" }}
                  />
                )}

                {/* ghost preview glyph with rotation */}
                {isValidHover && selectedBuilding && (
                  <g transform={`translate(${x}, ${y}) rotate(${selectedRotation * 60})`}>
                    <polygon
                      points={`${-4},${-2} 0,${-Math.max(8, size * 0.45)} 4,-2`}
                      fill="rgba(0,255,255,0.6)"
                      style={{ filter: "drop-shadow(0 0 6px rgba(0,255,255,0.6))" }}
                    />
                  </g>
                )}

                {/* invalid shake on click */}
                <polygon
                  points={poly}
                  className={`pointer-events-none fill-transparent ${
                    isHover && selectedBuilding && occupied ? "shake-once" : ""
                  }`}
                />

                {/* placement glyph including level rings */}
                {occupied && (
                  <g transform={`translate(${x}, ${y}) rotate(${(placements[key]?.rotation ?? 0) * 60})`}>
                    <circle
                      r={Math.max(8, size * 0.42)}
                      fill="rgba(0,0,0,0.45)"
                      stroke="#00FFFF"
                      strokeOpacity="0.35"
                    />
                    {/* level rings */}
                    {Array.from({ length: placements[key]?.level ?? 1 }).map((_, i) => (
                      <circle
                        key={i}
                        r={Math.max(10 + i * 2, size * 0.45 + i * 2)}
                        fill="none"
                        stroke="#00FFFF"
                        strokeOpacity={0.15 - i * 0.03}
                      />
                    ))}
                    <text
                      x="0"
                      y="4"
                      fontSize={Math.max(10, size * 0.45)}
                      textAnchor="middle"
                      fill="#00FFFF"
                      style={{ fontWeight: 600, filter: "drop-shadow(0 0 6px rgba(0,255,255,0.6))" }}
                    >
                      {placements[key]?.abbr}
                    </text>
                    <title>
                      {(() => {
                        const p = placements[key]!
                        const info = buildingCatalog[p.type]
                        const s = buildingStats[p.type]
                        return `${info.name} · Lv.${p.level} · E:${s.energy} Pop:${s.population} Env:${s.env} Happy:${s.happiness}`
                      })()}
                    </title>
                  </g>
                )}
                {/* invalid reason title for accessibility */}
                {isInvalidHover && invalidReason && (
                  <title>
                    {invalidReason === "insufficient-credits" ? "Insufficient credits" : "Safety clearance"}
                  </title>
                )}
              </g>
            )
          })}
        </g>

        {/* influence rings */}
        <g>
          {Object.entries(placements).map(([key, p]) => {
            const c = centers.find((c) => c.key === key)
            if (!c) return null
            const radius = size * 2.6 // default influence radius
            return (
              <circle
                key={key}
                cx={c.x}
                cy={c.y}
                r={radius}
                fill="none"
                stroke="#00FFFF"
                strokeOpacity="0.15"
                strokeDasharray="4 6"
                className="animate-pulse"
              />
            )
          })}
        </g>
      </svg>

      <style jsx>{`
        .shake-once {
          animation: shake 0.3s ease-out;
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
          100% { transform: translateX(0); }
        }
        .flow-line {
          stroke-dasharray: 4 6;
          animation: dash 2s linear infinite;
          opacity: 0.7;
        }
        .flow-water { stroke: #00FFFF; }
        .flow-transit { stroke: #0080FF; animation-duration: 1.5s; }
        .flow-research { stroke: #00FFFF; opacity: 0.5; animation-duration: 2.5s; }
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
      `}</style>
    </div>
  )
}
