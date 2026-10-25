import type { GuideRig, PartKind, SceneKind } from '../../data/types'
import { BB } from './textures'

export type { GuideRig, PartKind } from '../../data/types'

/**
 * Pure data + math for the board viewer. Kept free of components so the
 * file never trips fast-refresh rules and stays easy to unit-check.
 */

export type V3 = [number, number, number]
export type BoardKind = 'uno' | 'esp32' | 'nodemcu' | 'esp32cam'

export interface BoardPort {
  pos: V3
  color: string
  label: string
}

export interface BoardDef {
  w: number
  h: number
  ports: BoardPort[]
}

/** Pick the viewer board from the project's primary controller. */
export function boardFor(boards: string[]): BoardKind {
  const b = (boards[0] ?? '').toLowerCase()
  if (b.includes('cam')) return 'esp32cam'
  if (b.includes('esp32')) return 'esp32'
  if (b.includes('8266') || b.includes('nodemcu')) return 'nodemcu'
  return 'uno'
}

export const UNO_DEF: BoardDef = {
  w: 6.86,
  h: 5.34,
  ports: [
    { pos: [-2.473, 1.05, 2.25], color: '#d43a2e', label: '5V' },
    { pos: [-1.965, 1.05, 2.25], color: '#22252a', label: 'GND' },
    { pos: [1.437, 1.05, -2.25], color: '#e8a81c', label: 'D13' },
  ],
}

export const ESP32_DEF: BoardDef = {
  w: 5.2,
  h: 2.8,
  ports: [
    { pos: [-1.973, 0.8, 1.2], color: '#d43a2e', label: '3V3' },
    { pos: [1.329, 0.8, 1.2], color: '#22252a', label: 'GND' },
    { pos: [-1.973, 0.8, -1.2], color: '#e8a81c', label: 'D23' },
  ],
}

export const NODEMCU_DEF: BoardDef = {
  w: 4.9,
  h: 2.6,
  ports: [
    { pos: [-0.553, 0.8, -1.05], color: '#d43a2e', label: '3V3' },
    { pos: [-0.299, 0.8, -1.05], color: '#22252a', label: 'GND' },
    { pos: [-0.807, 0.8, -1.05], color: '#e8a81c', label: 'D4' },
  ],
}

export const CAM_DEF: BoardDef = {
  w: 4.0,
  h: 2.7,
  ports: [
    { pos: [-1.273, 0.4, 1.0], color: '#d43a2e', label: '5V' },
    { pos: [-1.019, 0.4, 1.0], color: '#22252a', label: 'GND' },
    { pos: [0.251, 0.4, 1.0], color: '#e8a81c', label: 'IO4' },
  ],
}

// --- breadboard hole math (must match textures.ts) ---------------------------

export const BB_TOP = 0.92

type RowId = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j'
const ROW_Z: Record<RowId, number> = {
  a: 1.65, b: 1.35, c: 1.05, d: 0.75, e: 0.45,
  f: -0.45, g: -0.75, h: -1.05, i: -1.35, j: -1.65,
}

export const holeX = (col: number) => BB.x0 + 0.127 + col * BB.pitch
export const hole = (col: number, row: RowId): V3 => [holeX(col), BB_TOP, ROW_Z[row]]
/** rail: 0 = far blue, 1 = far red, 2 = near red, 3 = near blue */
export const railHole = (col: number, rail: 0 | 1 | 2 | 3): V3 => [
  BB.railX0 + 0.127 + col * BB.pitch,
  BB_TOP,
  BB.railZ[rail],
]

export function arc(a: V3, b: V3, lift = 1.1): V3[] {
  return [
    a,
    [a[0], a[1] + lift * 0.7, a[2]],
    [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + lift, (a[2] + b[2]) / 2],
    [b[0], b[1] + lift * 0.7, b[2]],
    b,
  ]
}

/** Wire-lead points on each part module (part-local coords). */
export const SENSOR_LEADS: Record<PartKind, [V3, V3]> = {
  soil: [[1.2, 0.32, 0.12], [1.2, 0.32, -0.12]],
  pir: [[-0.3, 0.6, -0.65], [0.3, 0.6, -0.65]],
  bme: [[-0.3, 0.22, 0.3], [0.3, 0.22, 0.3]],
  max: [[-0.3, 0.22, 0.3], [0.3, 0.22, 0.3]],
  sonic: [[-0.4, 0.4, 1.0], [0.4, 0.4, 1.0]],
  relay: [[-0.2, 1.12, 0.3], [0.4, 1.12, 0.3]],
  level: [[1.2, 0.32, 0.15], [1.2, 0.32, -0.15]],
  keypad: [[-0.5, 0.55, -1.0], [0.5, 0.55, -1.0]],
  rc522: [[-0.5, 0.3, 2.0], [0.5, 0.3, 2.0]],
  mq: [[-0.4, 0.3, 0.9], [0.4, 0.3, 0.9]],
  gps: [[-0.6, 0.25, 1.0], [0.6, 0.25, 1.0]],
  gsm: [[-0.6, 0.3, 0.9], [0.6, 0.3, 0.9]],
  pms: [[1.2, 0.6, 0.7], [1.5, 0.6, 0.7]],
  pzem: [[-0.6, 1.2, 0], [0.6, 1.2, 0]],
  servo: [[-0.15, 0.5, 1.15], [0.15, 0.5, 1.15]],
  oled: [[-0.8, 0.35, 0.5], [0.8, 0.35, 0.5]],
  buzzer: [[-0.2, 0.5, 0.4], [0.2, 0.5, 0.4]],
}

export const SENSOR_NAMES: Record<PartKind, string> = {
  soil: 'Capacitive soil probe',
  pir: 'PIR motion sensor',
  bme: 'BME280 climate',
  max: 'MAX30102 vitals',
  sonic: 'HC-SR04 ultrasonic',
  relay: 'Relay switch',
  level: 'Water level probe',
  keypad: '4×4 keypad',
  rc522: 'RC522 RFID reader',
  mq: 'MQ gas sensor',
  gps: 'NEO-6M GPS',
  gsm: 'SIM800L GSM',
  pms: 'PMS5003 dust sensor',
  pzem: 'PZEM energy meter',
  servo: 'SG90 servo',
  oled: 'OLED display',
  buzzer: 'Buzzer',
}

const SCENE_DEFAULT: Record<SceneKind, PartKind> = {
  field: 'soil',
  home: 'pir',
  climate: 'bme',
  health: 'max',
  city: 'sonic',
  energy: 'relay',
  water: 'level',
  secure: 'keypad',
}

export const defaultRigForScene = (scene: SceneKind): GuideRig => ({
  sensor: SCENE_DEFAULT[scene],
  extras: [],
})
