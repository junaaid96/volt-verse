import type { BoardKind, GuideRig } from './types'

export interface HeroBench {
  board: BoardKind
  name: string
  blurb: string
  rig: GuideRig
}

/** Bench presets for the home-page viewer. Type-only imports keep three.js out of the main chunk. */
export const HERO_BENCHES: HeroBench[] = [
  { board: 'uno', name: 'Arduino Uno', blurb: 'Soil probe + relay', rig: { sensor: 'soil', extras: ['relay'] } },
  { board: 'esp32', name: 'ESP32', blurb: 'Climate node', rig: { sensor: 'bme', extras: ['oled'] } },
  { board: 'nodemcu', name: 'NodeMCU', blurb: 'Motion alarm', rig: { sensor: 'pir', extras: ['buzzer'] } },
  { board: 'esp32cam', name: 'ESP32-CAM', blurb: 'Door camera', rig: { sensor: 'pir', extras: [] } },
]
