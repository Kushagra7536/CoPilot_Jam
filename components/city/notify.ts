const lastShown = new Map<string, number>()

export function canNotify(key: string, minIntervalMs = 4000) {
  const now = Date.now()
  const last = lastShown.get(key) ?? 0
  if (now - last < minIntervalMs) return false
  lastShown.set(key, now)
  return true
}
