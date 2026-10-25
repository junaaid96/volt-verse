import type { SimConfig } from '../../data/types'

/** Where the watched signal comes from on each tick. */
export type SignalSource = 'hold' | 'sweep' | 'wander'

/** Manual override of the actuator; `null` means the rule decides. */
export type Override = boolean | null

export interface SimSettings {
  source: SignalSource
  /** Sensor noise as a fraction of the watched slider's span (0–0.2). */
  noise: number
  /** Deadband between trip and release points, in watched units. 0 = plain threshold. */
  band: number
  threshold: number
  override: Override
}

export interface Sample {
  t: number
  reading: number
  active: boolean
}

export interface SwitchEvent {
  /** 1-based switch number; unique per run. */
  n: number
  t: number
  active: boolean
  reading: number
  forced: boolean
}

export interface SimState {
  t: number
  /** Value the physical world is at (what the slider shows). */
  base: number
  /** What the firmware sees: base + noise, quantised like the slider. */
  reading: number
  active: boolean
  ruleActive: boolean
  trace: Sample[]
  events: SwitchEvent[]
  switches: number
  activeTime: number
  seed: number
}

export interface WatchRange {
  min: number
  max: number
  integer: boolean
}

export const TICK_SECONDS = 0.1
export const TRACE_SECONDS = 24
const TRACE_LENGTH = Math.round(TRACE_SECONDS / TICK_SECONDS)
const EVENT_LIMIT = 6
const SWEEP_PERIOD_SECONDS = 14
const CHATTER_WINDOW_SECONDS = 5
const CHATTER_LIMIT = 4

export const isIntegerRange = (...values: number[]) => values.every(Number.isInteger)

export function watchRange(sim: SimConfig): WatchRange {
  const def = sim.sliders.find((s) => s.id === sim.watch)
  const min = def?.min ?? 0
  const max = def?.max ?? 100
  return { min, max, integer: isIntegerRange(min, max, def?.value ?? 0) }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export function quantise(v: number, range: WatchRange): number {
  const c = clamp(v, range.min, range.max)
  return range.integer ? Math.round(c) : Math.round(c * 10) / 10
}

/** Deterministic PRNG (mulberry32) so runs are reproducible and testable. */
export function nextRandom(seed: number): [value: number, seed: number] {
  const s = (seed + 0x6d2b79f5) | 0
  let r = Math.imul(s ^ (s >>> 15), 1 | s)
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
  return [((r ^ (r >>> 14)) >>> 0) / 4294967296, s]
}

/** Trip point and release point for the current rule. */
export function ruleLevels(rule: SimConfig['rule'], threshold: number, band: number) {
  return { trip: threshold, release: rule === 'below' ? threshold + band : threshold - band }
}

/**
 * Threshold rule with optional hysteresis — the same shape firmware uses:
 * trip past the threshold, release only once the reading clears the band.
 */
export function evaluateRule(
  rule: SimConfig['rule'],
  reading: number,
  threshold: number,
  band: number,
  wasActive: boolean,
  inclusive = false,
): boolean {
  const holding = wasActive && band > 0
  const { release } = ruleLevels(rule, threshold, band)
  if (rule === 'below') return holding ? reading <= release : inclusive ? reading <= threshold : reading < threshold
  return holding ? reading >= release : inclusive ? reading >= threshold : reading > threshold
}

function sweepValue(sim: SimConfig, t: number): number {
  const phase = (t % SWEEP_PERIOD_SECONDS) / SWEEP_PERIOD_SECONDS
  const tri = phase < 0.5 ? phase * 2 : 2 - phase * 2
  return sim.demoFrom + (sim.demoTo - sim.demoFrom) * tri
}

function nextBase(sim: SimConfig, s: SimState, source: SignalSource, range: WatchRange): [number, number] {
  if (source === 'sweep') return [sweepValue(sim, s.t + TICK_SECONDS), s.seed]
  if (source === 'hold') return [s.base, s.seed]
  const [r, seed] = nextRandom(s.seed)
  const span = range.max - range.min
  const centre = (sim.demoFrom + sim.demoTo) / 2
  const pull = (centre - s.base) * 0.01
  return [clamp(s.base + pull + (r - 0.5) * span * 0.03, range.min, range.max), seed]
}

export function createState(sim: SimConfig, base: number, settings: SimSettings): SimState {
  const range = watchRange(sim)
  const reading = quantise(base, range)
  const ruleActive = evaluateRule(sim.rule, reading, settings.threshold, settings.band, false, sim.inclusive)
  const active = settings.override ?? ruleActive
  return {
    t: 0,
    base,
    reading,
    active,
    ruleActive,
    trace: [{ t: 0, reading, active }],
    events: [],
    switches: 0,
    activeTime: 0,
    seed: 0x5eed,
  }
}

interface Input {
  base: number
  reading: number
  seed: number
  dt: number
}

/** Run the rule on a new reading and record the outcome. `dt = 0` updates the latest sample in place. */
function commit(sim: SimConfig, s: SimState, settings: SimSettings, input: Input): SimState {
  const { base, reading, seed, dt } = input
  const ruleActive = evaluateRule(sim.rule, reading, settings.threshold, settings.band, s.ruleActive, sim.inclusive)
  const active = settings.override ?? ruleActive
  const t = Math.round((s.t + dt) * 10) / 10
  const flipped = active !== s.active
  const sample = { t, reading, active }
  const trace = dt > 0 ? [...s.trace, sample].slice(-TRACE_LENGTH) : [...s.trace.slice(0, -1), sample]

  return {
    t,
    base,
    reading,
    active,
    ruleActive,
    trace,
    events: flipped
      ? [{ n: s.switches + 1, t, active, reading, forced: settings.override !== null }, ...s.events].slice(0, EVENT_LIMIT)
      : s.events,
    switches: s.switches + (flipped ? 1 : 0),
    activeTime: s.activeTime + (active ? dt : 0),
    seed,
  }
}

/** Advance the simulation by one tick. Pure: returns a new state. */
export function step(sim: SimConfig, s: SimState, settings: SimSettings): SimState {
  const range = watchRange(sim)
  const [base, seedAfterBase] = nextBase(sim, s, settings.source, range)
  const [r, seed] = nextRandom(seedAfterBase)
  const noise = (r - 0.5) * 2 * settings.noise * (range.max - range.min)
  return commit(sim, s, settings, { base, reading: quantise(base + noise, range), seed, dt: TICK_SECONDS })
}

/** Apply a change without advancing time (slider drag, threshold edit, override). */
export function settle(sim: SimConfig, s: SimState, settings: SimSettings, base = s.base): SimState {
  const reading = base === s.base ? s.reading : quantise(base, watchRange(sim))
  return commit(sim, s, settings, { base, reading, seed: s.seed, dt: 0 })
}

/** Too many relay flips in a short window — what hysteresis exists to prevent. */
export function isChattering(s: SimState): boolean {
  const recent = s.events.filter((e) => !e.forced && s.t - e.t <= CHATTER_WINDOW_SECONDS)
  return recent.length >= CHATTER_LIMIT
}
