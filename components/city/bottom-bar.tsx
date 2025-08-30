"use client"

import { useState } from "react"
import { useCityStore, SCENARIOS, scenarioToReducerPlacements } from "./city-store"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import QuestsPanel from "./quests-panel" // import quests panel

export default function BottomBar() {
  const { applyScenario, saveToLocal, loadFromLocal, clearSave, clearGrid } = useCityStore()
  const { toast } = useToast()
  const [currentScenario, setCurrentScenario] = useState<string | null>(null)
  const [showQuests, setShowQuests] = useState(false) // panel toggle

  function handleApplyScenario(id: string) {
    const s = SCENARIOS.find((x) => x.id === id)
    if (!s) return
    applyScenario({ credits: s.credits, placements: scenarioToReducerPlacements(s.placements) })
    setCurrentScenario(s.name)
    toast({
      title: "Scenario applied",
      description: `${s.name} loaded with ${s.credits} starting credits.`,
    })
  }

  function handleSave() {
    saveToLocal()
    toast({ title: "Saved", description: "Your city has been saved to this browser." })
  }

  function handleLoad() {
    loadFromLocal()
    toast({ title: "Loaded", description: "Loaded your last saved city from this browser." })
  }

  function handleClear() {
    clearSave()
    clearGrid() // clearGrid is also called when clearing save
    toast({ title: "Cleared", description: "Cleared the saved city data in this browser." })
  }

  function handleClearGrid() {
    clearGrid()
    toast({
      title: "Grid cleared",
      description: "All placements have been removed. Credits are unchanged.",
    })
  }

  return (
    <>
      <footer className="sticky bottom-0 z-10 border-t border-[#00FFFF]/20 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-md border border-[#00FFFF]/30 bg-white/5 px-2 py-1 text-gray-200">
              Scenario: <span className="text-[#00FFFF]">{currentScenario ? currentScenario : "None selected"}</span>
            </span>
            <span className="hidden text-xs text-gray-400 md:inline">Choose a scenario or load a save</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Scenario select */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-lg border border-[#00FFFF]/30 bg-white/5 px-3 py-1.5 text-sm text-gray-200 hover:bg-white/10"
                >
                  Scenario Select
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56 border-[#00FFFF]/20 bg-black/60 backdrop-blur">
                {SCENARIOS.map((s) => (
                  <DropdownMenuItem
                    key={s.id}
                    onClick={() => handleApplyScenario(s.id)}
                    className="cursor-pointer text-gray-200 focus:bg-white/10"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-[#00FFFF]">{s.name}</span>
                      <span className="text-xs text-gray-300/80">{s.description}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Persistence controls */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-lg border border-[#00FFFF]/30 bg-white/5 px-3 py-1.5 text-sm text-gray-200 hover:bg-white/10"
                >
                  Persistence
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44 border-[#00FFFF]/20 bg-black/60 backdrop-blur">
                <DropdownMenuItem onClick={handleSave} className="cursor-pointer text-gray-200 focus:bg-white/10">
                  Save
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLoad} className="cursor-pointer text-gray-200 focus:bg-white/10">
                  Load
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClear} className="cursor-pointer text-gray-200 focus:bg-white/10">
                  Clear Save
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              className="rounded-lg border border-[#00FFFF]/30 bg-white/5 px-3 py-1.5 text-sm text-gray-200 hover:bg-white/10"
              onClick={() => setShowQuests(true)}
            >
              Quests
            </Button>

            <Button
              // use ghost with red accents to match palette and glass style
              variant="ghost"
              className="rounded-lg border border-red-500/40 bg-white/5 px-3 py-1.5 text-sm text-red-200 hover:bg-red-500/10"
              onClick={handleClearGrid}
            >
              Clear Grid
            </Button>

            {/* Keep Screenshot button (not implemented) */}
            <Button
              variant="ghost"
              className="rounded-lg border border-[#00FFFF]/30 bg-white/5 px-3 py-1.5 text-sm text-gray-200 hover:bg-white/10"
              onClick={() =>
                toast({
                  title: "Screenshot",
                  description: "Use your system screenshot tool for now.",
                })
              }
            >
              Screenshot
            </Button>
          </div>
        </div>
      </footer>

      {showQuests && <QuestsPanel onClose={() => setShowQuests(false)} />}
    </>
  )
}
