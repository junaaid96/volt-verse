import { useRef } from 'react'
import { Pause, Play, RotateCcw, StepForward } from 'lucide-react'
import type { SimConfig } from '../data/types'
import type { Override } from './sim/engine'
import { InputsPanel } from './sim/InputsPanel'
import { OutputPanel } from './sim/OutputPanel'
import { Segmented } from './sim/controls'
import { withUnit } from './sim/format'
import { useSimulation, type Simulation, type Speed } from './sim/useSimulation'

const SPEEDS: { value: Speed; label: string }[] = [
  { value: 1, label: '1×' },
  { value: 2, label: '2×' },
  { value: 4, label: '4×' },
]

type OverrideKey = 'auto' | 'on' | 'off'
const toOverride: Record<OverrideKey, Override> = { auto: null, on: true, off: false }
const fromOverride = (o: Override): OverrideKey => (o === null ? 'auto' : o ? 'on' : 'off')

const ghostBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-linelight disabled:opacity-50 dark:border-edge dark:text-foam dark:hover:bg-mosslight'

function Transport({ s }: { s: Simulation }) {
  const { sim } = s
  return (
    <div className="print-hide mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-card px-4 py-3 dark:border-edge dark:bg-moss">
      <button
        type="button"
        onClick={s.togglePlay}
        aria-pressed={s.playing}
        className="inline-flex items-center gap-1.5 rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-leafdeep"
      >
        {s.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {s.playing ? 'Pause' : 'Run'}
      </button>
      <button type="button" onClick={s.stepOnce} disabled={s.ticking} className={ghostBtn} aria-label="Step 0.1 seconds">
        <StepForward className="h-4 w-4" /> Step
      </button>
      <Segmented label="Simulation speed" value={s.speed} options={SPEEDS} onChange={s.setSpeed} />
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <span className="text-xs text-fog dark:text-mist">{sim.actuator}</span>
        <Segmented
          label={`${sim.actuator} override`}
          value={fromOverride(s.settings.override)}
          options={[
            { value: 'auto', label: 'Auto' },
            { value: 'on', label: `Force ${sim.onText}` },
            { value: 'off', label: `Force ${sim.offText}` },
          ]}
          onChange={(k) => s.setOverride(toOverride[k])}
        />
        <button type="button" onClick={s.reset} className={ghostBtn} aria-label="Reset simulator">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function PrintSnapshot({ s }: { s: Simulation }) {
  const { sim, run, settings, extras } = s
  const watchDef = sim.sliders.find((d) => d.id === sim.watch)
  const unit = watchDef?.unit ?? ''
  const value = (id: string, fallback: number) => (id === sim.watch ? run.reading : (extras[id] ?? fallback))
  return (
    <div className="print-only mt-3 rounded-xl border border-line bg-card p-4 text-sm">
      <p>
        <strong>Rule:</strong> {sim.actuator} turns {sim.onText} when {watchDef?.label ?? sim.watch} {sim.inclusive ? (sim.rule === 'below' ? 'drops to' : 'reaches') : `goes ${sim.rule}`}{' '}
        {withUnit(settings.threshold, unit)}
        {settings.band > 0 && <> and releases after a {withUnit(settings.band, unit)} hysteresis band</>}.
      </p>
      <p className="mt-1">
        <strong>Snapshot:</strong>{' '}
        {sim.sliders.map((d) => `${d.label} ${withUnit(value(d.id, d.value), d.unit)}`).join(' · ')} → {sim.actuator}{' '}
        {run.active ? sim.onText : sim.offText}
      </p>
      <p className="mt-1 text-fog">Tip: use the on-screen simulator to sweep values before you build.</p>
    </div>
  )
}

export function Simulator({ sim }: { sim: SimConfig }) {
  const root = useRef<HTMLDivElement>(null)
  const s = useSimulation(sim, root)

  return (
    <div ref={root}>
      <p className="text-sm leading-relaxed text-fog dark:text-mist">{sim.intro}</p>
      <PrintSnapshot s={s} />
      <Transport s={s} />
      <div className="print-hide mt-4 grid gap-4 lg:grid-cols-2">
        <InputsPanel s={s} />
        <OutputPanel s={s} />
      </div>
    </div>
  )
}
