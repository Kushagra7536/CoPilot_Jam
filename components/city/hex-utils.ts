export type Axial = { q: number; r: number }

export function axialKey(a: Axial) {
  return `${a.q}:${a.r}`
}

export function axialToPixel(a: Axial, size: number) {
  // pointy-top orientation
  const x = size * Math.sqrt(3) * (a.q + a.r / 2) + size * 1.5
  const y = size * (3 / 2) * a.r + size * 1.5
  return { x, y }
}

export function hexPolygonPoints(cx: number, cy: number, size: number) {
  const pts: [number, number][] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30) // pointy-top
    const x = cx + size * Math.cos(angle)
    const y = cy + size * Math.sin(angle)
    pts.push([x, y])
  }
  return pts.map((p) => p.join(",")).join(" ")
}

export function hexDistance(a: Axial, b: Axial) {
  // axial distance
  const x1 = a.q
  const z1 = a.r
  const y1 = -x1 - z1
  const x2 = b.q
  const z2 = b.r
  const y2 = -x2 - z2
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2), Math.abs(z1 - z2))
}
