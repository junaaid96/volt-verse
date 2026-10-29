import { AlertTriangle } from 'lucide-react'
import { TRACE_SECONDS, isChattering, ruleLevels, watchRange } from './engine'
import { TraceChart } from './TraceChart'
import { VizPanel } from './VizPanel'
import { fmt, withUnit } from './format'
import type { Simulation } from './useSimulation'

function renderLcdLine(line: string, s: Simulation): string {
  const { sim, run, settings, extras } = s
  return line.replace(/\{(\w+)\}/g, (m, k: string) => {
    if (k === 'act') return run.active ? sim.onText : sim.offText
    if (k === sim.watch) return fmt(run.reading)
    if (k === sim.threshold.id) return fmt(settings.threshold)
    const v = extras[k]
    return v === undefined ? m : fmt(v)
  })
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-paper px-3 py-2 dark:bg-pine">
      <div className="text-[11px] uppercase tracking-wider text-fog dark:text-mist">{label}</div>
      <div className="font-mono text-sm font-semibold tabular-nums text-ink dark:text-foam">{value}</div>
    </div>
  )
}

export function OutputPanel({ s }: { s: Simulation }) {
  const { sim, run, settings } = s
  const watchDef = sim.sliders.find((d) => d.id === sim.watch)
  const unit = watchDef?.unit ?? ''
  const name = watchDef?.label ?? sim.watch
  const { trip, release } = ruleLevels(sim.rule, settings.threshold, settings.band)
  const duty = run.t > 0 ? Math.round((run.activeTime / run.t) * 100) : run.active ? 100 : 0
  const chattering = settings.override === null && isChattering(run)
  const state = run.active ? sim.onText : sim.offText

  return (
    <div className="rounded-xl border border-line bg-card p-5 dark:border-edge dark:bg-moss">
      <div className="lcd" aria-hidden="true">
        {renderLcdLine(sim.lcd[0], s)}
        {'\n'}
        {renderLcdLine(sim.lcd[1], s)}
      </div>

      {sim.viz && <VizPanel s={s} />}

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-fog dark:text-mist">{sim.actuator}</span>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
            run.active ? 'bg-signal text-white' : 'bg-linelight text-fog dark:bg-mosslight dark:text-mist'
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${run.active ? 'bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.7)]' : 'bg-fog/50'}`}
          />
          {state}
          {settings.override !== null && <span className="font-normal opacity-80">(forced)</span>}
        </span>
      </div>
      <p className="sr-only" role="status">
        {sim.actuator} {state}
      </p>

      <div className="mt-4 overflow-hidden rounded-lg border border-linelight dark:border-mosslight">
        <div className="flex items-center justify-between px-3 pt-2 text-[11px] text-fog dark:text-mist">
          <span>
            {sim.barLabel} · last {TRACE_SECONDS}s
          </span>
          <span className="font-mono tabular-nums">t = {run.t.toFixed(1)}s</span>
        </div>
        <TraceChart
          trace={run.trace}
          range={watchRange(sim)}
          trip={trip}
          release={release}
          now={run.t}
          label={`${name} over time against the ${withUnit(trip, unit)} threshold`}
        />
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 pb-2 text-[11px] text-fog dark:text-mist">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-leaf dark:bg-leafbright" /> reading
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0 w-4 border-t-2 border-dashed border-signal" /> trips at {fmt(trip)}
          </span>
          {release !== trip && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0 w-4 border-t-2 border-dotted border-amber dark:border-amberbright" /> releases at{' '}
              {fmt(release)}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-3 rounded-sm bg-signal/25" /> {sim.actuator.toLowerCase()} {sim.onText}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Reading" value={withUnit(run.reading, unit)} />
        <Stat label="Switches" value={String(run.switches)} />
        <Stat label={`${sim.onText} time`} value={`${duty}%`} />
      </div>

      {chattering && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber/40 bg-amber/10 px-3 py-2 text-xs leading-relaxed text-ink dark:text-foam">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber dark:text-amberbright" aria-hidden="true" />
          <span>
            Chatter: the {sim.actuator.toLowerCase()} flipped 4+ times in 5s. On real hardware this wears out relays and
            spams alerts. Widen the hysteresis band to fix it.
          </span>
        </p>
      )}

      <EventLog s={s} unit={unit} />
    </div>
  )
}

function EventLog({ s, unit }: { s: Simulation; unit: string }) {
  const { sim, run } = s
  if (run.events.length === 0) {
    return (
      <p className="mt-3 text-xs text-fog dark:text-mist">
        No switching yet. Push {sim.watch} past the threshold, or press Sweep.
      </p>
    )
  }
  return (
    <ol className="mt-3 space-y-1 font-mono text-xs" aria-label="Switching log">
      {run.events.map((e) => (
        <li key={e.n} className="flex gap-3 text-fog dark:text-mist">
          <span className="w-14 shrink-0 tabular-nums">{e.t.toFixed(1)}s</span>
          <span className={e.active ? 'font-semibold text-signal' : 'text-ink dark:text-foam'}>
            {sim.actuator} {e.active ? sim.onText : sim.offText}
          </span>
          <span>{e.forced ? 'manual' : `@ ${withUnit(e.reading, unit)}`}</span>
        </li>
      ))}
    </ol>
  )
}
