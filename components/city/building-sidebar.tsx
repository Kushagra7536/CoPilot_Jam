"use client"

import { useState } from "react"
import { useCityStore, buildingCatalog, type BuildingType, categories } from "./city-store"
import SidebarFooterComponent from "./SidebarFooter"
import BuildingOptionComponent from "./BuildingOption"

export default function BuildingSidebar() {
  const [active, setActive] = useState<keyof typeof categories>("defense")
  const { selectedBuilding, selectBuilding, clearSelection, credits } = useCityStore()

  const activeBuildings = Object.entries(buildingCatalog).filter(([, b]) => b.category === active) as [
    BuildingType,
    (typeof buildingCatalog)[BuildingType],
  ][]

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-200">Building Palette</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={clearSelection}
            className="rounded-md border border-[#00FFFF]/30 px-2 py-1 text-xs text-gray-200 hover:bg-white/10"
            aria-label="Clear selection"
          >
            Deselect
          </button>
        </div>
      </div>

      <nav className="grid grid-cols-2 gap-2" aria-label="Building categories">
        {(Object.keys(categories) as (keyof typeof categories)[]).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`rounded-lg border px-2 py-2 text-left text-xs transition-colors ${
              active === key ? "border-[#00FFFF]/50 bg-white/10" : "border-[#00FFFF]/20 hover:bg-white/5"
            }`}
            style={active === key ? { boxShadow: "0 0 16px rgba(0,255,255,0.15)" } : undefined}
          >
            <span className="block font-medium text-gray-100">{categories[key].label}</span>
            <span className="block text-[10px] text-gray-400">{categories[key].count} types</span>
          </button>
        ))}
      </nav>

      <div className="mt-1 grow rounded-lg border border-[#00FFFF]/20 bg-black/30 p-2">
        <ul className="grid grid-cols-2 gap-2 text-xs" role="listbox" aria-label="Buildings">
          {activeBuildings.map(([key, b]) => {
            const isActive = selectedBuilding === key
            return (
              <li key={key}>
                <BuildingOptionComponent
                  type={key}
                  name={b.name}
                  categoryLabel={b.categoryLabel}
                  isActive={isActive}
                  onClick={() => (isActive ? clearSelection() : selectBuilding(key))}
                />
              </li>
            )
          })}
        </ul>
        <SidebarFooterComponent />
      </div>
    </div>
  )
}
