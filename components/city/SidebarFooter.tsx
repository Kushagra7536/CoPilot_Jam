"use client"

import { useCityStore } from "./city-store"

export default function SidebarFooterComponent() {
  const { selectedBuilding, selectedRotation } = useCityStore()
  return (
    <div className="mt-3 rounded-md border border-[#00FFFF]/20 bg-black/30 p-2 text-[10px] text-gray-300">
      <div className="flex items-center justify-between">
        <span>Selected:</span>
        <span className="font-semibold text-[#00FFFF]">{selectedBuilding ?? "None"}</span>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span>Rotation:</span>
        <span className="font-semibold text-gray-200">{selectedRotation * 60}°</span>
      </div>
      <div className="mt-2 text-gray-400">Wheel/R,E to rotate • Shift+Click to upgrade • Right-click to remove</div>
    </div>
  )
}
