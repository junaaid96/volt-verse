import { useEffect, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import type { SimConfig } from '../data/types'

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

export function Simulator({ sim }: { sim: SimConfig }) {
  const [vals, setVals] = useState<Record<string, number>>(() => ({
    ...Object.fromEntries(sim.sliders.map((s) => [s.id, s.value])),
    [sim.threshold.id]: sim.threshold.value,
  }))
  const [manual, setManual] = useState<boolean | null>(null)
  const [running, setRunning] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearInterval(timer.current)
    },
    [],
  )

  const watched = vals[sim.watch] ?? 0
  const thr = vals[sim.threshold.id] ?? sim.threshold.value
  const autoActive = sim.rule === 'below' ? watched < thr : watched > thr
  const active = manual ?? autoActive

  const watchDef = sim.sliders.find((s) => s.id === sim.watch)
  const span = (watchDef?.max ?? 100) - (watchDef?.min ?? 0)
  const barPct = span <= 0 ? 0 : Math.min(100, Math.max(0, ((watched - (watchDef?.min ?? 0)) / span) * 100))

  const runDemo = () => {
    if (running) return
    setManual(null)
    setRunning(true)
    const steps = 40
    let i = 0
    setVals((v) => ({ ...v, [sim.demoSlider]: sim.demoFrom }))
    timer.current = window.setInterval(() => {
      i += 1
      const val = sim.demoFrom + ((sim.demoTo - sim.demoFrom) * i) / steps
      setVals((v) => ({ ...v, [sim.demoSlider]: Math.round(val * 10) / 10 }))
      if (i >= steps) {
        if (timer.current !== null) window.clearInterval(timer.current)
        timer.current = null
        setRunning(false)
      }
    }, 90)
  }

  const renderLine = (line: string) =>
    line.replace(/\{(\w+)\}/g, (_m, k: string) => {
      if (k === 'act') return active ? sim.onText : sim.offText
      const v = vals[k]
      return v === undefined ? `{${k}}` : fmt(v)
    })

  const set = (id: string, v: number) => setVals((prev) => ({ ...prev, [id]: v }))

  return (
    <div>
      <p className="text-sm leading-relaxed text-fog dark:text-[#9bb0a0]">{sim.intro}</p>
      {/* Print: static snapshot of the rule and current values */}
      <div className="print-only mt-3 rounded-xl border border-line bg-card p-4 text-sm">
        <p>
          <strong>Rule:</strong> {sim.actuator} turns {sim.onText} when {watchDef?.label ?? sim.watch}{' '}
          goes {sim.rule} {fmt(thr)}
          {watchDef?.unit ?? ''}.
        </p>
        <p className="mt-1">
          <strong>Snapshot:</strong>{' '}
          {sim.sliders.map((s) => `${s.label} ${fmt(vals[s.id] ?? s.value)}${s.unit}`).join(' · ')} →{' '}
          {sim.actuator} {active ? sim.onText : sim.offText}
        </p>
        <p className="mt-1 text-fog">Tip: use the on-screen simulator to sweep values before you build.</p>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="print-hide rounded-xl border border-line bg-card p-5 dark:border-[#2f4234] dark:bg-moss">
          {sim.sliders.map((s) => (
            <div key={s.id} className="mb-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-ink dark:text-[#e4ece5]">{s.label}</span>
                <strong className="font-mono">
                  {fmt(vals[s.id] ?? s.value)}
                  {s.unit}
                </strong>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={[s.min, s.max, s.value].every(Number.isInteger) ? 1 : 0.1}
                value={vals[s.id] ?? s.value}
                onChange={(e) => set(s.id, parseFloat(e.target.value))}
                className="w-full"
                aria-label={s.label}
              />
            </div>
          ))}
          <div className="mb-4 border-t border-linelight pt-4 dark:border-[#24352a]">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-semibold text-ink dark:text-[#e4ece5]">{sim.threshold.label}</span>
              <strong className="font-mono">
                {fmt(thr)}
                {sim.threshold.unit}
              </strong>
            </div>
            <input
              type="range"
              min={sim.threshold.min}
              max={sim.threshold.max}
              step={[sim.threshold.min, sim.threshold.max, sim.threshold.value].every(Number.isInteger) ? 1 : 0.1}
              value={thr}
              onChange={(e) => set(sim.threshold.id, parseFloat(e.target.value))}
              className="w-full"
              aria-label={sim.threshold.label}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={runDemo}
              disabled={running}
              className="inline-flex items-center gap-1.5 rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#186a3c] disabled:opacity-60"
            >
              <Play className="h-4 w-4" />
              {running ? 'Running…' : 'Run demo sweep'}
            </button>
            <button
              type="button"
              onClick={() => setManual((m) => (m === null ? !autoActive : !m))}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-linelight dark:border-[#2f4234] dark:text-[#e4ece5] dark:hover:bg-[#24352a]"
            >
              Manual {sim.actuator.toLowerCase()}: {manual === null ? 'auto' : manual ? 'forced ON' : 'forced OFF'}
            </button>
            {manual !== null && (
              <button
                type="button"
                onClick={() => setManual(null)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-fog hover:underline dark:text-[#9bb0a0]"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Back to auto
              </button>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-card p-5 dark:border-[#2f4234] dark:bg-moss">
          <div className="lcd" aria-live="polite">
            {renderLine(sim.lcd[0])}
            {'\n'}
            {renderLine(sim.lcd[1])}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-fog dark:text-[#9bb0a0]">{sim.actuator}</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold print:border print:border-black print:bg-white print:text-black ${
                active ? 'bg-signal text-white' : 'bg-linelight text-fog dark:bg-[#24352a] dark:text-[#9bb0a0]'
              }`}
            >
              {active ? sim.onText : sim.offText}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-fog dark:text-[#9bb0a0]">{sim.barLabel}</span>
            <span className="font-mono text-xs">
              {fmt(watched)} / {fmt(thr)} {watchDef?.unit ?? ''}
            </span>
          </div>
          <div className="mt-1 h-3.5 overflow-hidden rounded-full bg-linelight dark:bg-[#24352a]">
            <div
              className={`h-full rounded-full transition-all ${active ? 'bg-signal' : 'bg-leaf dark:bg-leafbright'}`}
              style={{ width: `${barPct}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-fog dark:text-[#9bb0a0]">
            {manual !== null ? (
              <>Manual override active — the rule is bypassed until you go back to auto.</>
            ) : active ? (
              <>
                Rule hit: {watchDef?.label ?? sim.watch} is {sim.rule} {fmt(thr)}
                {watchDef?.unit ?? ''} → {sim.actuator} {sim.onText}.
              </>
            ) : (
              <>
                Within limits: {watchDef?.label ?? sim.watch} has not crossed {fmt(thr)}
                {watchDef?.unit ?? ''} → {sim.actuator} {sim.offText}.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
