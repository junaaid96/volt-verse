import { isIntegerRange, ruleLevels, watchRange, type SignalSource } from './engine'
import { RangeField, Segmented } from './controls'
import { fmt, withUnit } from './format'
import type { Simulation } from './useSimulation'

const SOURCES: { value: SignalSource; label: string }[] = [
  { value: 'hold', label: 'Hold' },
  { value: 'sweep', label: 'Sweep' },
  { value: 'wander', label: 'Wander' },
]

const SOURCE_HINT: Record<SignalSource, string> = {
  hold: 'Drag to set the sensor by hand.',
  sweep: 'Ramps between the demo limits and back.',
  wander: 'Drifts like a real room or field would.',
}

export function InputsPanel({ s }: { s: Simulation }) {
  const { sim, settings, run } = s
  const watchDef = sim.sliders.find((d) => d.id === sim.watch)
  const range = watchRange(sim)
  const unit = watchDef?.unit ?? ''
  const thrDef = sim.threshold
  const span = range.max - range.min
  const thrStep = isIntegerRange(thrDef.min, thrDef.max, thrDef.value) ? 1 : 0.1
  const defaultBandMax = range.integer ? Math.max(1, Math.round(span * 0.3)) : Math.round(span * 3) / 10
  const bandMax = Math.max(defaultBandMax, sim.band ?? 0)
  const { release } = ruleLevels(sim.rule, settings.threshold, settings.band)
  const op = sim.rule === 'below' ? (sim.inclusive ? '≤' : '<') : sim.inclusive ? '≥' : '>'
  const releaseOp = sim.rule === 'below' ? '>' : '<'

  return (
    <div className="rounded-xl border border-line bg-card p-5 dark:border-edge dark:bg-moss">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-fog dark:text-mist">
          Sensor input
        </h3>
        <Segmented label="Signal source" value={settings.source} options={SOURCES} onChange={s.setSource} />
      </div>

      <RangeField
        label={<span className="font-semibold">{watchDef?.label ?? sim.watch}</span>}
        value={run.base}
        display={
          <>
            {withUnit(run.base, unit)}
            {settings.noise > 0 && (
              <span className="ml-2 text-xs font-normal text-fog dark:text-mist">
                reads {fmt(run.reading)}
              </span>
            )}
          </>
        }
        min={range.min}
        max={range.max}
        step={range.integer ? 1 : 0.1}
        onChange={s.drag}
        ariaLabel={watchDef?.label ?? sim.watch}
        hint={SOURCE_HINT[settings.source]}
      />

      {sim.sliders
        .filter((d) => d.id !== sim.watch)
        .map((d) => (
          <RangeField
            key={d.id}
            label={d.label}
            value={s.extras[d.id] ?? d.value}
            display={withUnit(s.extras[d.id] ?? d.value, d.unit)}
            min={d.min}
            max={d.max}
            step={isIntegerRange(d.min, d.max, d.value) ? 1 : 0.1}
            onChange={(v) => s.setExtra(d.id, v)}
            ariaLabel={d.label}
          />
        ))}

      <div className="mt-5 border-t border-linelight pt-4 dark:border-[#24352a]">
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-fog dark:text-mist">
          Firmware rule
        </h3>
        <p className="mb-4 rounded-lg bg-paper px-3 py-2 font-mono text-xs leading-relaxed text-ink dark:bg-pine dark:text-foam">
          {sim.actuator} {sim.onText} when {sim.watch} {op} {fmt(settings.threshold)}
          {settings.band > 0 && (
            <>
              <br />
              {sim.actuator} {sim.offText} when {sim.watch} {releaseOp} {fmt(release)}
            </>
          )}
        </p>
        <RangeField
          label={<span className="font-semibold">{thrDef.label}</span>}
          value={settings.threshold}
          display={withUnit(settings.threshold, thrDef.unit)}
          min={thrDef.min}
          max={thrDef.max}
          step={thrStep}
          onChange={s.setThreshold}
          ariaLabel={thrDef.label}
        />
        <RangeField
          label="Hysteresis band"
          value={settings.band}
          display={settings.band > 0 ? withUnit(settings.band, unit) : 'off'}
          min={0}
          max={bandMax}
          step={range.integer ? 1 : 0.1}
          onChange={s.setBand}
          ariaLabel="Hysteresis band"
          hint="Gap between switching on and off. Stops relay chatter when the reading hovers at the line."
        />
        <RangeField
          label="Sensor noise"
          value={settings.noise}
          display={settings.noise > 0 ? `±${withUnit(Math.round(settings.noise * span * 10) / 10, unit)}` : 'clean'}
          min={0}
          max={0.15}
          step={0.005}
          onChange={s.setNoise}
          ariaLabel="Sensor noise"
        />
      </div>
    </div>
  )
}
