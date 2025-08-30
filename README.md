# Climate Planner Simulator

An interactive, cyberpunk‑themed city planning simulator. Build on an 8×8 hex grid, balance credits and climate metrics, complete quests, react to dynamic events, and save/load scenarios — all in a fast, demo‑ready web app.

## Overview

- Core loop: place buildings → metrics update in real time → complete quests → handle events → iterate layouts.
- Visual language: dark cyberpunk theme with glassy panels and neon accents (strict 5‑color palette).
- Interaction model: smooth SVG hex grid, hover validity, rotation/upgrade mechanics, animated flows, and streamlined notifications.
- Persistence: localStorage auto‑save plus manual Save/Load/Clear; scenario presets with curated starting layouts.

## Key Features

- Hex Grid Builder
  - Pointy‑top 8×8 SVG hex grid with hover highlight and valid/invalid preview.
  - Placement with cost checks, rotation (R/E keys or mouse wheel), upgrades (Shift+Click), right‑click removal.
  - Rules: e.g., safety buffers (like Fusion Plants near residential/social), influence rings and connection lines.
- Live Metrics Dashboard
  - Credits and environmental/resilience indicators (energy, air/water, food, carbon, happiness, etc.).
  - Metrics derive from placements and update instantly; threshold‑based color accents for clarity.
- Dynamic Interactions
  - Animated resource/synergy flows between relevant structures.
  - Accessible tooltips on placed buildings; noisy toasts throttled to keep focus on visuals.
- Quests and Events
  - Quests live in a dedicated “Quests” tab (Active/Completed) with progress and rewards.
  - Toast “pop up” on quest completion; periodic random events with mitigation logic.
- Scenarios and Persistence
  - Scenario presets (e.g., Coastal Defense, Desert Solar Oasis, Windy Highlands, Dense Urban Core, Island Microgrid, Post‑Disaster Recovery).
  - Save/Load/Clear Save via localStorage; Clear Grid wipes the current layout without touching the stored snapshot.
  - Auto‑load once on first mount; debounced auto‑save after changes.
- Controls and UX
  - Click to place, right‑click to remove, R/E or mouse wheel to rotate, Shift+Click to upgrade.
  - Minimalist toast policy: important only (invalid placement, quest complete, significant events).

## App Flow

1) Pick a building in the sidebar and rotate if needed.  
2) Hover grid cells to preview validity; click to place (credits and rules validated).  
3) Watch dashboard metrics adjust; synergy lines animate context.  
4) Track goals in the Quests tab; completion awards credits and shows a toast.  
5) Periodic events may trigger; adapt your layout for resilience.  
6) Use Scenario Select to switch presets; Save/Load/Clear Save manage persistence; Clear Grid resets placements only.

## Architecture

- Next.js (App Router, “next‑lite” runtime in v0) + React + TypeScript.
- Tailwind CSS v4 + shadcn/ui for accessible, consistent UI.
- SVG grid rendering for crisp visuals and performant highlights/animations.
- Central state: components/city/city-store.tsx (single source of truth)
  - Core actions: place/remove/upgrade, setSelected/setRotation, creditDelta
  - Scenarios + persistence: applyScenario, saveToLocal, loadFromLocal, clearSave, clearGrid
  - Derived metrics computed from placements; persisted fields: { credits, placements }.
- Notifications: shadcn Toaster with rate limiting to reduce noise.

### Notable Components (components/city/)
- app/page.tsx — app shell wiring all panels
- header.tsx — top app bar
- building-sidebar.tsx — building catalog and selection
- city-grid.tsx — interactive SVG hex grid
- metrics-dashboard.tsx — live metrics
- bottom-bar.tsx — scenario select, persistence controls, Quests entry, clear grid, screenshot placeholder
- challenge-system.tsx — quest tracking/completion + event ticker
- quests-panel.tsx — slide‑up UI for Active/Completed quests
- event-notifications.tsx — Toaster integration
- city-store.tsx — state, reducer/actions, metrics
- hex-utils.ts — hex math helpers
- notify.ts — toast throttling helpers

## Persistence Details

- Storage: localStorage key `neoCitySaveV1`.
- Save: writes `{ credits, placements }` only; metrics recompute on load.
- Load: restores credits/placements and recalculates metrics.
- Clear Save: removes the saved snapshot (and typically clears placements); credits persist unless a scenario changes.
- Clear Grid: wipes placements in memory now; does not touch the saved snapshot.

## Screenshot Button

- Current behavior: placeholder toast (use your OS/browser screenshot tool).
- Optional upgrade: wire `html-to-image` to capture the grid container and download a PNG.

## Theming

- Color palette (3–5 colors): electric blue (#0080FF), cyan (#00FFFF), near‑black background, neutral gray, and alert red (#EF4444).
- Solid colors, no heavy gradients; glassmorphism panels; WCAG‑aware contrast.

## Tech Stack

- Next.js (App Router, next‑lite), React, TypeScript
- Tailwind CSS v4, shadcn/ui
- SVG for grid
- LocalStorage for client‑side persistence


