import type { ReactNode } from 'react'
import { fmt } from './format'

interface RangeFieldProps {
  label: ReactNode
  value: number
  display?: ReactNode
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  ariaLabel: string
  hint?: ReactNode
}

export function RangeField({ label, value, display, min, max, step, onChange, ariaLabel, hint }: RangeFieldProps) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink dark:text-foam">{label}</span>
        <strong className="font-mono tabular-nums">{display ?? fmt(value)}</strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        aria-label={ariaLabel}
      />
      {hint && <p className="mt-1 text-xs text-fog dark:text-mist">{hint}</p>}
    </div>
  )
}

interface SegmentedProps<T extends string | number> {
  label: string
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (v: T) => void
}

export function Segmented<T extends string | number>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-lg border border-line bg-paper p-0.5 dark:border-edge dark:bg-pine"
    >
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              on
                ? 'bg-card text-ink shadow-sm dark:bg-moss dark:text-foam'
                : 'text-fog hover:text-ink dark:text-mist dark:hover:text-foam'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
