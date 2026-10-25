import type { BoardKind, GuideRig, PartKind, SceneKind } from '../../data/types'
import { BB } from './textures'

export type { BoardKind, GuideRig, PartKind } from '../../data/types'

/**
 * Pure data + math for the board viewer. Kept free of components so the
 * file never trips fast-refresh rules and stays easy to unit-check.
 */

export type V3 = [number, number, number]

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

// --- bench composition per board ----------------------------------------------

export const BENCH_LAYOUTS: Record<BoardKind, { board: V3; bb: V3; sensor: V3 }> = {
  uno: { board: [-3.9, 0, 0.2], bb: [3.9, 0, 0.3], sensor: [3.0, 0, 4.4] },
  esp32: { board: [-3.3, 0, 0.2], bb: [3.6, 0, 0.3], sensor: [2.8, 0, 4.4] },
  nodemcu: { board: [-3.2, 0, 0.2], bb: [3.6, 0, 0.3], sensor: [2.8, 0, 4.4] },
  esp32cam: { board: [-3.0, 0, 0.2], bb: [3.6, 0, 0.3], sensor: [2.8, 0, 4.4] },
}

/** Labelled hotspots in board-local coords (offset by the board position at render). */
export const BOARD_HOTSPOTS: Record<BoardKind, Array<{ at: V3; text: string }>> = {
  uno: [
    { at: [0.7, 0.75, 0.1], text: 'ATmega328P' },
    { at: [-2.85, 0.95, -1.55], text: 'USB port' },
    { at: [-2.7, 0.95, 1.55], text: 'Power jack' },
    { at: [1.437, 1.05, -2.25], text: 'Digital pins' },
    { at: [0.1, 1.05, 2.25], text: 'Analog pins' },
  ],
  esp32: [
    { at: [-1.55, 0.5, 0], text: 'ESP32 · 3V3 logic' },
    { at: [2.3, 0.4, 0], text: 'Micro-USB' },
  ],
  nodemcu: [
    { at: [-1.4, 0.5, 0], text: 'ESP8266 · 3V3 logic' },
    { at: [0.3, 0.8, -1.05], text: 'D0-D8 + A0' },
    { at: [2.1, 0.4, 0], text: 'Micro-USB' },
  ],
  esp32cam: [
    { at: [-1.2, 0.7, -0.4], text: 'OV2640 camera' },
    { at: [0.2, 0.3, 0.5], text: 'Flash LED' },
    { at: [-1.273, 0.4, 1.0], text: 'UART + 5V' },
  ],
}

export interface CameraHome {
  /** Viewing direction (camera position relative to target; only the direction matters). */
  direction: V3
  target: V3
  /** Radius of the bench's bounding sphere; the camera distance is fitted to it per aspect ratio. */
  radius: number
}

export const CAMERA_HOME: Record<BoardKind, CameraHome> = {
  uno: { direction: [7.5, 7.2, 11.5], target: [0.4, 0.3, 2.0], radius: 6.2 },
  esp32: { direction: [6.4, 6.4, 9.6], target: [0.4, 0.3, 2.0], radius: 5.5 },
  nodemcu: { direction: [6.4, 6.4, 9.6], target: [0.4, 0.3, 2.0], radius: 5.5 },
  esp32cam: { direction: [6.2, 6.2, 9.3], target: [0.4, 0.3, 2.0], radius: 5.2 },
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
