import { memo } from 'react'
import { TRACE_SECONDS, type Sample, type WatchRange } from './engine'

interface TraceChartProps {
  trace: Sample[]
  range: WatchRange
  trip: number
  release: number
  now: number
  label: string
}

const W = 600
const H = 170
const PAD_X = 6
const PAD_Y = 10

interface Span {
  from: number
  to: number
}

function activeSpans(trace: Sample[]): Span[] {
  const spans: Span[] = []
  trace.forEach((s, i) => {
    if (!s.active) return
    const open = i > 0 && trace[i - 1].active
    if (open) spans[spans.length - 1].to = s.t
    else spans.push({ from: s.t, to: s.t })
  })
  return spans
}

function TraceChartView({ trace, range, trip, release, now, label }: TraceChartProps) {
  const start = Math.max(0, now - TRACE_SECONDS)
  const x = (t: number) => PAD_X + ((t - start) / TRACE_SECONDS) * (W - PAD_X * 2)
  const span = range.max - range.min || 1
  const y = (v: number) => PAD_Y + (1 - (v - range.min) / span) * (H - PAD_Y * 2)

  const points = trace.map((s) => `${x(s.t).toFixed(1)},${y(s.reading).toFixed(1)}`).join(' ')
  const last = trace[trace.length - 1]
  const bandTop = y(Math.max(trip, release))
  const bandBottom = y(Math.min(trip, release))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={label}>
      {activeSpans(trace).map((s) => (
        <rect
          key={s.from}
          x={x(s.from)}
          y={0}
          width={Math.max(2, x(s.to) - x(s.from))}
          height={H}
          className="fill-signal/12 dark:fill-signal/25"
        />
      ))}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={0} x2={W} y1={PAD_Y + f * (H - PAD_Y * 2)} y2={PAD_Y + f * (H - PAD_Y * 2)} className="stroke-linelight dark:stroke-mosslight" />
      ))}
      {release !== trip && (
        <rect x={0} y={bandTop} width={W} height={Math.max(1, bandBottom - bandTop)} className="fill-amber/15 dark:fill-amberbright/15" />
      )}
      <line x1={0} x2={W} y1={y(trip)} y2={y(trip)} strokeDasharray="6 4" strokeWidth={1.5} className="stroke-signal" />
      {release !== trip && (
        <line x1={0} x2={W} y1={y(release)} y2={y(release)} strokeDasharray="2 4" strokeWidth={1.5} className="stroke-amber dark:stroke-amberbright" />
      )}
      <polyline
        points={points}
        fill="none"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="stroke-leaf dark:stroke-leafbright"
      />
      {last && (
        <circle
          cx={x(last.t)}
          cy={y(last.reading)}
          r={4.5}
          className={last.active ? 'fill-signal' : 'fill-leaf dark:fill-leafbright'}
        />
      )}
    </svg>
  )
}

export const TraceChart = memo(TraceChartView)
