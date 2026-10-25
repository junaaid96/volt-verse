import * as THREE from 'three'

/**
 * Canvas-drawn textures for the procedural boards — the same technique the
 * reference site uses (no downloaded models or images; everything offline).
 * Units: 1 unit = 1 cm. Canvas top edge = far side (-z).
 */

const PX = 150 // pixels per cm

function makeCanvas(wCm: number, hCm: number) {
  const c = document.createElement('canvas')
  c.width = Math.round(wCm * PX)
  c.height = Math.round(hCm * PX)
  const ctx = c.getContext('2d')!
  return { c, ctx, W: c.width, H: c.height }
}

function finish(c: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** world (cm) -> canvas px */
function mapper(wCm: number, hCm: number, W: number, H: number) {
  return {
    x: (x: number) => ((x + wCm / 2) / wCm) * W,
    z: (z: number) => ((z + hCm / 2) / hCm) * H,
  }
}

export interface StripDef {
  x0: number
  n: number
  z: number
  labelZ: number
  labels: string[]
  pitch?: number
}

export interface PcbOptions {
  bg: string
  strips?: StripDef[]
  texts?: Array<{ x: number; z: number; size: number; text: string; bold?: boolean }>
  rings?: Array<[number, number, number]>
  traces?: boolean
  border?: string
}

export function pcbTexture(wCm: number, hCm: number, o: PcbOptions): THREE.CanvasTexture {
  const { c, ctx, W, H } = makeCanvas(wCm, hCm)
  const { x, z } = mapper(wCm, hCm, W, H)

  ctx.fillStyle = o.bg
  ctx.fillRect(0, 0, W, H)

  if (o.traces) {
    ctx.strokeStyle = 'rgba(0,0,0,0.14)'
    ctx.lineWidth = 3
    let seed = 7
    const rnd = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    for (let i = 0; i < 26; i++) {
      const x1 = rnd() * W
      const y1 = rnd() * H
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x1 + (rnd() - 0.5) * 260, y1)
      ctx.lineTo(x1 + (rnd() - 0.5) * 260, y1 + (rnd() - 0.5) * 260)
      ctx.stroke()
    }
  }

  if (o.border !== 'none') {
    ctx.strokeStyle = o.border ?? 'rgba(255,255,255,0.85)'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.roundRect(14, 14, W - 28, H - 28, 30)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (const s of o.strips ?? []) {
    const pitch = s.pitch ?? 0.254
    // silk outline around the strip
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'
    ctx.lineWidth = 3
    const rx = x(s.x0) - 10
    const rw = pitch * s.n * PX + 20
    const rz = Math.min(z(s.z), z(s.labelZ))
    const rh = Math.abs(z(s.z) - z(s.labelZ)) + 34
    ctx.strokeRect(rx, s.z < s.labelZ ? z(s.z) - 24 : rz, rw, s.z < s.labelZ ? rh : rh)
    for (let i = 0; i < s.n; i++) {
      const label = s.labels[i] ?? ''
      if (!label) continue
      const len = label.length
      ctx.font = `${len > 3 ? '600' : '700'} ${len > 3 ? 17 : 21}px system-ui, sans-serif`
      ctx.fillText(label, x(s.x0 + 0.127 + i * pitch), z(s.labelZ))
    }
  }

  for (const t of o.texts ?? []) {
    ctx.font = `${t.bold === false ? '500' : '700'} ${t.size}px system-ui, sans-serif`
    ctx.fillText(t.text, x(t.x), z(t.z))
  }

  for (const [hx, hz, r] of o.rings ?? []) {
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(x(hx), z(hz), r * PX, 0, Math.PI * 2)
    ctx.stroke()
  }

  return finish(c)
}

// ---------------------------------------------------------------------------
// Arduino Uno top (6.86 x 5.34 cm). Must match the 3D layout in boards.tsx.
// ---------------------------------------------------------------------------

let unoCache: THREE.CanvasTexture | null = null

export function unoTopTexture(): THREE.CanvasTexture {
  if (unoCache) return unoCache
  unoCache = pcbTexture(6.86, 5.34, {
    bg: '#00979d',
    traces: true,
    strips: [
      {
        x0: -2.6, n: 10, z: -2.25, labelZ: -1.9,
        labels: ['D0', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'GND', 'AREF'],
      },
      {
        x0: 0.04, n: 8, z: -2.25, labelZ: -1.9,
        labels: ['D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'GND', '5V'],
      },
      {
        x0: -2.6, n: 8, z: 2.25, labelZ: 1.9,
        labels: ['5V', '3V3', 'GND', 'GND', 'VIN', 'RST', 'IO', ''],
      },
      {
        x0: -0.57, n: 6, z: 2.25, labelZ: 1.9,
        labels: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'],
      },
    ],
    texts: [
      { x: 1.9, z: 1.15, size: 40, text: 'ARDUINO UNO' },
      { x: 1.9, z: 0.72, size: 20, text: 'R3', bold: false },
      { x: -0.2, z: -1.88, size: 19, text: 'DIGITAL' },
      { x: -1.6, z: 1.88, size: 19, text: 'POWER' },
      { x: 1.7, z: 1.88, size: 19, text: 'ANALOG' },
      { x: -1.95, z: -1.1, size: 19, text: 'RESET' },
      { x: -2.85, z: -0.8, size: 19, text: 'USB' },
      { x: -2.85, z: 0.95, size: 19, text: 'POWER' },
      { x: 2.55, z: -0.35, size: 19, text: 'ICSP' },
      { x: 1.1, z: 1.78, size: 16, text: 'ON' },
      { x: 1.5, z: 1.78, size: 16, text: 'L', bold: false },
      { x: -0.68, z: -0.62, size: 16, text: 'TX', bold: false },
      { x: -0.68, z: -0.88, size: 16, text: 'RX', bold: false },
    ],
    rings: [
      [-2.9, -2.15, 0.22],
      [2.9, -2.15, 0.22],
      [-2.9, 2.15, 0.22],
      [2.9, 2.15, 0.22],
    ],
  })
  return unoCache
}

// ---------------------------------------------------------------------------
// ESP32 / NodeMCU tops
// ---------------------------------------------------------------------------

const texCache = new Map<string, THREE.CanvasTexture>()

export function mcuTopTexture(
  key: string,
  wCm: number,
  hCm: number,
  o: PcbOptions,
): THREE.CanvasTexture {
  const hit = texCache.get(key)
  if (hit) return hit
  const t = pcbTexture(wCm, hCm, o)
  texCache.set(key, t)
  return t
}

// ---------------------------------------------------------------------------
// Breadboard top (8.2 x 5.5 cm, 30 cols). Holes must match bench.tsx math.
// ---------------------------------------------------------------------------

export const BB = {
  w: 8.2,
  h: 5.5,
  cols: 30,
  x0: -3.68,
  pitch: 0.254,
  rowsTop: [1.65, 1.35, 1.05, 0.75, 0.45],
  rowsBot: [-0.45, -0.75, -1.05, -1.35, -1.65],
  railZ: [-2.35, -2.05, 2.05, 2.35] as number[],
  railX0: -3.05,
  railN: 25,
}

let bbCache: THREE.CanvasTexture | null = null

export function breadTexture(): THREE.CanvasTexture {
  if (bbCache) return bbCache
  const { c, ctx, W, H } = makeCanvas(BB.w, BB.h)
  const { x, z } = mapper(BB.w, BB.h, W, H)

  ctx.fillStyle = '#f2f3f0'
  ctx.fillRect(0, 0, W, H)

  // center groove
  ctx.fillStyle = '#d7dad6'
  ctx.fillRect(0, z(0.18), W, z(-0.18) - z(0.18))

  // rail lines
  const railCols = ['#2b6cb0', '#c0392b', '#c0392b', '#2b6cb0']
  BB.railZ.forEach((rz, i) => {
    ctx.fillStyle = railCols[i]
    ctx.fillRect(x(-3.6), z(rz) - 4, x(3.6) - x(-3.6), 8)
  })

  const dot = (hx: number, hz: number, r = 5.5) => {
    ctx.fillStyle = '#33373b'
    ctx.beginPath()
    ctx.arc(x(hx), z(hz), r, 0, Math.PI * 2)
    ctx.fill()
  }

  for (let i = 0; i < BB.cols; i++) {
    const hx = BB.x0 + 0.127 + i * BB.pitch
    for (const rz of [...BB.rowsTop, ...BB.rowsBot]) dot(hx, rz)
    // 5-hole group separators
    if (i % 5 === 4 && i < BB.cols - 1) {
      ctx.fillStyle = '#e2e5e1'
      const gx = x(BB.x0 + (i + 1) * BB.pitch)
      ctx.fillRect(gx - 2, z(1.8), 4, z(-1.8) - z(1.8))
    }
  }
  for (let i = 0; i < BB.railN; i++) {
    const hx = BB.railX0 + 0.127 + i * BB.pitch
    for (const rz of BB.railZ) dot(hx, rz, 5)
  }

  // column numbers every 5
  ctx.fillStyle = '#8a8f8c'
  ctx.font = '600 17px system-ui, sans-serif'
  ctx.textAlign = 'center'
  for (let i = 4; i < BB.cols; i += 5) {
    const hx = x(BB.x0 + 0.127 + i * BB.pitch)
    ctx.fillText(String(i + 1), hx, z(0) - 14)
    ctx.fillText(String(i + 1), hx, z(0) + 26)
  }
  ctx.fillStyle = '#c0392b'
  ctx.font = '700 20px system-ui, sans-serif'
  ctx.fillText('+', x(-3.85), z(2.05))
  ctx.fillText('+', x(-3.85), z(-2.05))
  ctx.fillStyle = '#2b6cb0'
  ctx.fillText('−', x(-3.85), z(2.35))
  ctx.fillText('−', x(-3.85), z(-2.35))

  bbCache = finish(c)
  return bbCache
}

// ---------------------------------------------------------------------------
// Self-healing cutting mat (one 10 cm tile, repeated across the bench)
// ---------------------------------------------------------------------------

export interface MatPalette {
  base: string
  minor: string
  major: string
}

const matCache = new Map<string, THREE.CanvasTexture>()

export function matTexture(p: MatPalette, repeat: number): THREE.CanvasTexture {
  const key = `${p.base}|${p.minor}|${p.major}|${repeat}`
  const hit = matCache.get(key)
  if (hit) return hit
  const size = 1024
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')!
  ctx.fillStyle = p.base
  ctx.fillRect(0, 0, size, size)

  // Fine speckle so the surface never reads as flat CG plastic.
  let seed = 11
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.04)'
    ctx.fillRect(rnd() * size, rnd() * size, 2, 2)
  }

  const step = size / 10
  for (let i = 0; i <= 10; i++) {
    const major = i % 5 === 0
    ctx.strokeStyle = major ? p.major : p.minor
    ctx.lineWidth = major ? 3 : 1.5
    const o = i * step
    ctx.beginPath()
    ctx.moveTo(o, 0)
    ctx.lineTo(o, size)
    ctx.moveTo(0, o)
    ctx.lineTo(size, o)
    ctx.stroke()
  }

  const t = finish(c)
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat, repeat)
  matCache.set(key, t)
  return t
}
