export type Difficulty = 'Basic' | 'Medium' | 'Advanced'

export type SceneKind =
  | 'field'
  | 'home'
  | 'climate'
  | 'health'
  | 'city'
  | 'energy'
  | 'water'
  | 'secure'

/** 3D part models available to the board viewer. */
export type PartKind =
  | 'soil' | 'pir' | 'bme' | 'max' | 'sonic' | 'relay' | 'level' | 'keypad'
  | 'rc522' | 'mq' | 'gps' | 'gsm' | 'pms' | 'pzem' | 'servo' | 'oled' | 'buzzer'

/** Per-guide 3D composition: primary wired module + optional extras. */
export interface GuideRig {
  sensor: PartKind | null
  extras?: PartKind[]
}

export interface Category {
  id: string
  name: string
  tagline: string
  description: string
  /** lucide icon name key rendered by CategoryIcon */
  icon: string
  status: 'live' | 'soon'
  /** planned project count for upcoming categories */
  planned?: number
}

export interface BuildOption {
  id: string
  title: string
  level: string
  blurb: string
  points: string[]
  weeks: string
  cost: string
}

export interface Part {
  name: string
  qty: string
  role: string
  price: string
}

export interface WirePin {
  from: string
  to: string
}

export interface WireBoard {
  id: string
  label: string
  board: string
  pins: WirePin[]
}

export interface BuildStep {
  title: string
  detail: string
}

export interface CodeVariant {
  id: string
  label: string
  note: string
  code: string
}

export interface SimSlider {
  id: string
  label: string
  unit: string
  min: number
  max: number
  value: number
}

export interface SimThreshold {
  id: string
  label: string
  unit: string
  min: number
  max: number
  value: number
}

/**
 * Generic threshold-rule simulator. Placeholders like {soil} in lcd lines
 * are replaced with live slider values; {act} becomes the actuator state.
 */
export interface SimConfig {
  intro: string
  sliders: SimSlider[]
  threshold: SimThreshold
  /** primary slider the rule watches */
  watch: string
  rule: 'below' | 'above'
  actuator: string
  onText: string
  offText: string
  lcd: [string, string]
  /** which slider the auto demo sweeps */
  demoSlider: string
  demoFrom: number
  demoTo: number
  barLabel: string
}

export interface Tip {
  title: string
  detail: string
}

export interface Datasheet {
  key: string
  label: string
  url: string
  /** PDF = manufacturer datasheet, Guide = tutorial, Docs = official docs */
  kind: 'PDF' | 'Guide' | 'Docs'
}

export interface Project {
  slug: string
  categoryId: string
  title: string
  tagline: string
  difficulty: Difficulty
  weeks: string
  cost: string
  boards: string[]
  skills: string[]
  scene: SceneKind
  updated: string
  featured?: boolean
  /** keys into the datasheet registry (src/data/datasheets.ts) */
  sheets?: string[]
  /** unique 3D composition; falls back to the scene default when omitted */
  rig?: GuideRig
  options: BuildOption[]
  parts: Part[]
  wiring: WireBoard[]
  steps: BuildStep[]
  simulator: SimConfig
  code: CodeVariant[]
  tips: Tip[]
}
