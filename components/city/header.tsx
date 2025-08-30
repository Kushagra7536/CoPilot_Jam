export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#00FFFF]/20 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <h1 className="text-pretty text-xl font-semibold tracking-wide md:text-2xl">
          <span className="pr-2 text-[#00FFFF]">Neo-City</span>
          <span className="text-[#0080FF]">Climate Planner</span> <span className="text-gray-400">2070</span>
        </h1>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-lg border border-[#00FFFF]/30 bg-white/5 px-3 py-1.5 text-xs text-gray-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#00FFFF]" aria-hidden />
            Demo Ready
          </span>
        </div>
      </div>
    </header>
  )
}
