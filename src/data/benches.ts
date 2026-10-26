import type { BoardKind, GuideRig } from './types'

export interface HeroBench {
  board: BoardKind
  name: string
  /** Short switcher chip label. */
  short: string
  blurb: string
  rig: GuideRig
}

/** Bench presets for the home-page viewer. Type-only imports keep three.js out of the main chunk. */
export const HERO_BENCHES: HeroBench[] = [
  { board: 'uno', name: 'Arduino Uno', short: 'Uno', blurb: 'Soil probe + relay', rig: { sensor: 'soil', extras: ['relay'] } },
  { board: 'esp32', name: 'ESP32', short: 'ESP32', blurb: 'Climate node', rig: { sensor: 'bme', extras: ['oled'] } },
  { board: 'nodemcu', name: 'NodeMCU', short: 'Node', blurb: 'Motion alarm', rig: { sensor: 'pir', extras: ['buzzer'] } },
  { board: 'esp32cam', name: 'ESP32-CAM', short: 'CAM', blurb: 'Door camera', rig: { sensor: 'pir', extras: [] } },
  { board: 'uno', name: 'Robot arm', short: 'Arm', blurb: '4-servo arm + gripper', rig: { sensor: 'arm', extras: ['servo'] } },
  { board: 'esp32', name: 'Rover base', short: 'Rover', blurb: '2WD chassis + driver', rig: { sensor: 'chassis', extras: ['l298n', 'sonic'] } },
]
