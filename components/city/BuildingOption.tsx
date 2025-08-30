"use client"

import { buildingStats, type BuildingType, useCityStore } from "./city-store"

export default function BuildingOptionComponent({
  type,
  name,
  categoryLabel,
  isActive,
  onClick,
}: {
  type: BuildingType
  name: string
  categoryLabel: string
  isActive: boolean
  onClick: () => void
}) {
  const { credits } = useCityStore()
  const cost = buildingStats[type].cost
  const affordable = credits >= cost

  return (
    <button
      role="option"
      aria-selected={isActive}
      onClick={onClick}
      disabled={!affordable && !isActive}
      className={`w-full rounded-md border p-2 text-left transition ${
        isActive ? "border-[#00FFFF]/60 bg-white/10" : "border-[#00FFFF]/20 hover:border-[#00FFFF]/40 hover:bg-white/5"
      } ${!affordable && !isActive ? "opacity-50 cursor-not-allowed" : ""}`}
      title={!affordable ? "Insufficient credits" : undefined}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-gray-100">{name}</span>
        <span className="text-[10px] text-[#00FFFF]">{cost.toLocaleString()}</span>
      </div>
      <div className="mt-1 text-[10px] text-gray-400">{categoryLabel}</div>
    </button>
  )
}
