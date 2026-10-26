import { useEffect, useReducer, useRef, useState, type RefObject } from 'react'
import type { SimConfig } from '../../data/types'
import {
  TICK_SECONDS,
  createState,
  settle,
  step,
  type Override,
  type SignalSource,
  type SimSettings,
  type SimState,
} from './engine'

export type Speed = 1 | 2 | 4

interface Model {
  sim: SimConfig
  settings: SimSettings
  run: SimState
  /** Values of the sliders the rule does not watch (shown on the LCD only). */
  extras: Record<string, number>
}

type Action =
  | { type: 'tick'; count: number }
  | { type: 'drag'; value: number }
  | { type: 'extra'; id: string; value: number }
  | { type: 'settings'; patch: Partial<SimSettings> }
  | { type: 'reset' }

function initialModel(sim: SimConfig): Model {
  const settings: SimSettings = {
    // Illustrated sims sweep on load so the live view moves at once;
    // classic trace-only sims stay manual until the user picks a source.
    source: sim.viz ? 'sweep' : 'hold',
    noise: 0,
    band: sim.band ?? 0,
    threshold: sim.threshold.value,
    override: null,
  }
  const watched = sim.sliders.find((s) => s.id === sim.watch)?.value ?? 0
  return {
    sim,
    settings,
    run: createState(sim, watched, settings),
    extras: Object.fromEntries(sim.sliders.filter((s) => s.id !== sim.watch).map((s) => [s.id, s.value])),
  }
}

function reducer(m: Model, a: Action): Model {
  switch (a.type) {
    case 'tick': {
      let run = m.run
      for (let i = 0; i < a.count; i++) run = step(m.sim, run, m.settings)
      return { ...m, run }
    }
    case 'drag': {
      const settings = { ...m.settings, source: 'hold' as const }
      return { ...m, settings, run: settle(m.sim, m.run, settings, a.value) }
    }
    case 'extra':
      return { ...m, extras: { ...m.extras, [a.id]: a.value } }
    case 'settings': {
      const settings = { ...m.settings, ...a.patch }
      return { ...m, settings, run: settle(m.sim, m.run, settings) }
    }
    case 'reset':
      return initialModel(m.sim)
  }
}

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** Pauses the loop while the simulator is scrolled out of view. */
function useInView(ref: RefObject<HTMLElement | null>): boolean {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return inView
}

export function useSimulation(sim: SimConfig, container: RefObject<HTMLElement | null>) {
  const [model, dispatch] = useReducer(reducer, sim, initialModel)
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  const [speed, setSpeed] = useState<Speed>(1)
  const inView = useInView(container)
  const ticking = playing && inView

  const simRef = useRef(sim)
  useEffect(() => {
    if (simRef.current !== sim) {
      simRef.current = sim
      dispatch({ type: 'reset' })
    }
  }, [sim])

  useEffect(() => {
    if (!ticking) return
    const id = window.setInterval(() => dispatch({ type: 'tick', count: speed }), TICK_SECONDS * 1000)
    return () => window.clearInterval(id)
  }, [ticking, speed])

  const patch = (p: Partial<SimSettings>) => dispatch({ type: 'settings', patch: p })

  return {
    ...model,
    playing,
    speed,
    ticking,
    togglePlay: () => setPlaying((p) => !p),
    stepOnce: () => dispatch({ type: 'tick', count: 1 }),
    setSpeed,
    drag: (value: number) => dispatch({ type: 'drag', value }),
    setExtra: (id: string, value: number) => dispatch({ type: 'extra', id, value }),
    setThreshold: (threshold: number) => patch({ threshold }),
    setBand: (band: number) => patch({ band }),
    setNoise: (noise: number) => patch({ noise }),
    setSource: (source: SignalSource) => {
      patch({ source })
      if (source !== 'hold') setPlaying(true)
    },
    setOverride: (override: Override) => patch({ override }),
    reset: () => dispatch({ type: 'reset' }),
  }
}

export type Simulation = ReturnType<typeof useSimulation>
