import { watchRange } from './engine'
import { fmt, withUnit } from './format'
import type { Simulation } from './useSimulation'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function useNorm(s: Simulation) {
  const range = watchRange(s.sim)
  const span = range.max - range.min || 1
  const norm = (v: number) => clamp01((v - range.min) / span)
  return { range, norm: norm(s.run.reading), thr: norm(s.settings.threshold) }
}

function Pill({ x, y, text, on }: { x: number; y: number; text: string; on: boolean }) {
  const w = Math.max(64, text.length * 7.5 + 20)
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - 11}
        width={w}
        height={22}
        rx={11}
        className={on ? 'fill-signal' : 'fill-linelight dark:fill-[#24352a]'}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        className={on ? 'fill-white' : 'fill-fog dark:fill-mist'}
      >
        {text}
      </text>
    </g>
  )
}

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-linelight dark:border-[#24352a]">
      <div className="px-3 pt-2 text-[11px] text-fog dark:text-mist">{label}</div>
      <svg
        viewBox="0 0 320 132"
        className="h-36 w-full"
        role="img"
        aria-label={label}
        preserveAspectRatio="xMidYMid meet"
      >
        {children}
      </svg>
    </div>
  )
}

/** Top-down 2WD bot with a live obstacle + sonar arcs. */
function RoverViz({ s }: { s: Simulation }) {
  const { sim, run } = s
  const { norm } = useNorm(s)
  const ox = 150 + norm * 130 // obstacle slides away as clearance grows
  const tilt = run.active ? -10 : 0
  const state = run.active ? sim.onText : sim.offText
  return (
    <Frame label={`Live view · ${sim.actuator}: ${state}`}>
      <line x1={8} y1={112} x2={312} y2={112} className="stroke-line dark:stroke-edge" strokeWidth={2} />
      <g transform={`rotate(${tilt} 70 80)`}>
        <rect x={34} y={58} width={72} height={44} rx={10} className="fill-card stroke-line dark:fill-moss dark:stroke-edge" strokeWidth={2} />
        <rect x={28} y={62} width={10} height={20} rx={3} className="fill-ink dark:fill-foam" />
        <rect x={102} y={62} width={10} height={20} rx={3} className="fill-ink dark:fill-foam" />
        <rect x={28} y={88} width={10} height={20} rx={3} className="fill-ink dark:fill-foam" />
        <rect x={102} y={88} width={10} height={20} rx={3} className="fill-ink dark:fill-foam" />
        <circle cx={70} cy={80} r={9} className={run.active ? 'fill-signal' : 'fill-leaf dark:fill-leafbright'} />
      </g>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M ${118 + i * 12} 62 A 26 26 0 0 1 ${118 + i * 12} 98`}
          fill="none"
          className="stroke-signal"
          strokeWidth={2}
          opacity={0.75 - i * 0.22}
        />
      ))}
      <rect x={ox} y={48} width={26} height={64} rx={4} className="fill-amber dark:fill-amberbright" opacity={0.85} />
      <text x={ox + 13} y={40} textAnchor="middle" fontSize={10} className="fill-fog dark:fill-mist font-mono">
        {withUnit(run.reading, sim.sliders.find((d) => d.id === sim.watch)?.unit ?? '')}
      </text>
      <Pill x={248} y={20} text={`${sim.actuator} ${state}`} on={run.active} />
    </Frame>
  )
}

/** Line track with the robot's lateral error. */
function LineViz({ s }: { s: Simulation }) {
  const { sim, run } = s
  const { range } = useNorm(s)
  const span = range.max - range.min || 1
  const off = ((run.reading - (range.max + range.min) / 2) / (span / 2)) * 118
  const state = run.active ? sim.onText : sim.offText
  return (
    <Frame label={`Live view · Steering: ${state}`}>
      <rect x={8} y={40} width={304} height={52} rx={8} className="fill-paper stroke-line dark:fill-pine dark:stroke-edge" strokeWidth={2} />
      <rect x={154} y={40} width={12} height={52} className="fill-ink dark:fill-foam" />
      <rect x={8} y={40} width={26} height={52} className="fill-signal" opacity={0.18} />
      <rect x={286} y={40} width={26} height={52} className="fill-signal" opacity={0.18} />
      <g>
        <rect x={160 + off - 17} y={52} width={34} height={28} rx={7} className="fill-card stroke-ink dark:fill-moss dark:stroke-foam" strokeWidth={2} />
        <circle cx={160 + off - 8} cy={80} r={4} className="fill-leaf dark:fill-leafbright" />
        <circle cx={160 + off + 8} cy={80} r={4} className="fill-leaf dark:fill-leafbright" />
      </g>
      <text x={160} y={110} textAnchor="middle" fontSize={10} className="fill-fog dark:fill-mist font-mono">
        error {fmt(run.reading)}
      </text>
      <Pill x={160} y={20} text={run.active ? '◀ LEFT' : 'RIGHT ▶'} on={run.active} />
    </Frame>
  )
}

/** Side-view arm: forearm follows the wrist slider, claw follows grip. */
function ArmViz({ s }: { s: Simulation }) {
  const { sim, run, extras } = s
  const second = sim.sliders.find((d) => d.id !== sim.watch)
  const grip = second ? (extras[second.id] ?? second.value) : 50
  const wristDeg = run.reading
  const fore = -20 - (wristDeg / 180) * 100 // forearm sweeps with the wrist joint
  const claw = 6 + (grip / 100) * 30
  const jx = 100
  const jy = 108
  const ex = jx + 54 * Math.cos((-55 * Math.PI) / 180)
  const ey = jy + 54 * Math.sin((-55 * Math.PI) / 180)
  const wrist = { x: ex, y: ey }
  const tip = {
    x: wrist.x + 44 * Math.cos((fore * Math.PI) / 180),
    y: wrist.y + 44 * Math.sin((fore * Math.PI) / 180),
  }
  return (
    <Frame label={`Live view · Joint: ${run.active ? sim.onText : sim.offText}`}>
      <line x1={8} y1={112} x2={312} y2={112} className="stroke-line dark:stroke-edge" strokeWidth={2} />
      <rect x={jx - 22} y={jy - 6} width={44} height={18} rx={4} className="fill-ink dark:fill-foam" />
      <line x1={jx} y1={jy} x2={ex} y2={ey} className="stroke-leaf dark:stroke-leafbright" strokeWidth={9} strokeLinecap="round" />
      <circle cx={jx} cy={jy} r={7} className="fill-card stroke-ink dark:fill-moss dark:stroke-foam" strokeWidth={2} />
      <line x1={wrist.x} y1={wrist.y} x2={tip.x} y2={tip.y} className="stroke-leaf dark:stroke-leafbright" strokeWidth={7} strokeLinecap="round" />
      <circle cx={wrist.x} cy={wrist.y} r={6} className="fill-card stroke-ink dark:fill-moss dark:stroke-foam" strokeWidth={2} />
      <line
        x1={tip.x}
        y1={tip.y}
        x2={tip.x + 20 * Math.cos(((fore - claw) * Math.PI) / 180)}
        y2={tip.y + 20 * Math.sin(((fore - claw) * Math.PI) / 180)}
        className="stroke-signal"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <line
        x1={tip.x}
        y1={tip.y}
        x2={tip.x + 20 * Math.cos(((fore + claw) * Math.PI) / 180)}
        y2={tip.y + 20 * Math.sin(((fore + claw) * Math.PI) / 180)}
        className="stroke-signal"
        strokeWidth={4}
        strokeLinecap="round"
      />
      {run.active && <circle cx={wrist.x} cy={wrist.y} r={12} fill="none" className="stroke-signal" strokeWidth={2} strokeDasharray="4 3" />}
      <text x={272} y={60} textAnchor="middle" fontSize={10} className="fill-fog dark:fill-mist font-mono">
        {fmt(wristDeg)}°
      </text>
      <Pill x={248} y={100} text={`${sim.actuator} ${run.active ? sim.onText : sim.offText}`} on={run.active} />
    </Frame>
  )
}

/** Tank / bin fill with the threshold mark. */
function TankViz({ s }: { s: Simulation }) {
  const { sim, run } = s
  const { norm, thr } = useNorm(s)
  const H = 84
  const fillH = Math.max(2, norm * H)
  const thrY = 108 - thr * H
  return (
    <Frame label={`Live view · ${sim.actuator}: ${run.active ? sim.onText : sim.offText}`}>
      <rect x={110} y={24} width={100} height={H + 8} rx={6} className="fill-paper stroke-line dark:fill-pine dark:stroke-edge" strokeWidth={2} />
      <rect
        x={114}
        y={112 - fillH}
        width={92}
        height={fillH}
        rx={3}
        className={run.active ? 'fill-signal' : 'fill-leaf dark:fill-leafbright'}
        opacity={0.8}
      />
      <line x1={104} y1={thrY} x2={216} y2={thrY} className="stroke-amber dark:stroke-amberbright" strokeWidth={2} strokeDasharray="5 3" />
      <text x={222} y={thrY + 4} fontSize={10} className="fill-fog dark:fill-mist font-mono">
        {fmt(s.settings.threshold)}
      </text>
      <text x={160} y={122} textAnchor="middle" fontSize={10} className="fill-fog dark:fill-mist font-mono">
        {withUnit(run.reading, sim.sliders.find((d) => d.id === sim.watch)?.unit ?? '')}
      </text>
      <Pill x={52} y={66} text={run.active ? sim.onText : sim.offText} on={run.active} />
    </Frame>
  )
}

/** Needle gauge with a red zone past the threshold. */
function GaugeViz({ s }: { s: Simulation }) {
  const { sim, run } = s
  const { range, norm, thr } = useNorm(s)
  const centerZero = range.min < 0 && range.max > 0
  const ang = (t: number) => 180 - t * 180
  const polar = (cx: number, cy: number, r: number, deg: number) => ({
    x: cx + r * Math.cos((deg * Math.PI) / 180),
    y: cy - r * Math.sin((deg * Math.PI) / 180),
  })
  const cx = 110
  const cy = 108
  const R = 72
  const nPt = polar(cx, cy, R, ang(norm))
  const tPt = polar(cx, cy, R, ang(thr))
  const tIn = polar(cx, cy, R - 16, ang(thr))
  const zeroX = centerZero ? polar(cx, cy, R, ang((0 - range.min) / (range.max - range.min))).x : null
  return (
    <Frame label={`Live view · ${sim.actuator}: ${run.active ? sim.onText : sim.offText}`}>
      <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" className="stroke-line dark:stroke-edge" strokeWidth={10} strokeLinecap="round" />
      <path
        d={sim.rule === 'below' ? `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${tPt.x} ${tPt.y}` : `M ${tPt.x} ${tPt.y} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
        fill="none"
        className="stroke-signal"
        strokeWidth={10}
        strokeLinecap="round"
        opacity={0.75}
      />
      <line x1={tIn.x} y1={tIn.y} x2={tPt.x} y2={tPt.y} className="stroke-amber dark:stroke-amberbright" strokeWidth={3} />
      {zeroX !== null && <line x1={zeroX} y1={cy - R - 4} x2={zeroX} y2={cy - R + 6} className="stroke-fog dark:stroke-mist" strokeWidth={2} />}
      <line x1={cx} y1={cy} x2={nPt.x} y2={nPt.y} className="stroke-ink dark:stroke-foam" strokeWidth={3} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={7} className="fill-ink dark:fill-foam" />
      <text x={cx} y={cy - R - 8} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-ink dark:fill-foam font-mono">
        {withUnit(run.reading, sim.sliders.find((d) => d.id === sim.watch)?.unit ?? '')}
      </text>
      <Pill x={252} y={66} text={run.active ? sim.onText : sim.offText} on={run.active} />
      <text x={252} y={92} textAnchor="middle" fontSize={10} className="fill-fog dark:fill-mist">
        trips {fmt(s.settings.threshold)}
      </text>
    </Frame>
  )
}

/** Access badge: green pass vs red flag. */
function LockViz({ s }: { s: Simulation }) {
  const { sim, run } = s
  const { norm } = useNorm(s)
  const flagged = run.active
  return (
    <Frame label={`Live view · ${sim.actuator}: ${flagged ? sim.onText : sim.offText}`}>
      <rect x={40} y={30} width={130} height={76} rx={10} className="fill-card stroke-line dark:fill-moss dark:stroke-edge" strokeWidth={2} />
      <rect x={54} y={46} width={34} height={26} rx={3} className="fill-amber dark:fill-amberbright" opacity={0.8} />
      <rect x={96} y={50} width={60} height={7} rx={3.5} className="fill-linelight dark:fill-[#24352a]" />
      <rect x={96} y={62} width={44} height={7} rx={3.5} className="fill-linelight dark:fill-[#24352a]" />
      <rect x={54} y={84} width={102 * norm} height={8} rx={4} className={flagged ? 'fill-signal' : 'fill-leaf dark:fill-leafbright'} />
      <circle cx={238} cy={68} r={30} className={flagged ? 'fill-signal' : 'fill-leaf dark:fill-leafbright'} opacity={0.15} />
      {flagged ? (
        <text x={238} y={79} textAnchor="middle" fontSize={30} fontWeight={800} className="fill-signal">
          !
        </text>
      ) : (
        <path d="M 224 68 l 10 10 l 20 -22" fill="none" className="stroke-leaf dark:stroke-leafbright" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      )}
      <text x={238} y={112} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-ink dark:fill-foam">
        {flagged ? sim.onText : sim.offText}
      </text>
    </Frame>
  )
}

/** Lamp post with glow + rays when lit. */
function LampViz({ s }: { s: Simulation }) {
  const { sim, run } = s
  const lit = run.active
  return (
    <Frame label={`Live view · ${sim.actuator}: ${lit ? sim.onText : sim.offText}`}>
      <line x1={8} y1={112} x2={312} y2={112} className="stroke-line dark:stroke-edge" strokeWidth={2} />
      <rect x={96} y={46} width={10} height={66} rx={4} className="fill-ink dark:fill-foam" />
      <rect x={96} y={40} width={52} height={10} rx={5} className="fill-ink dark:fill-foam" />
      {lit && <circle cx={140} cy={66} r={30} className="fill-amberbright" opacity={0.25} />}
      <path d="M 126 50 L 154 50 L 148 62 L 132 62 Z" className="fill-ink dark:fill-foam" />
      <ellipse cx={140} cy={64} rx={8} ry={4} className={lit ? 'fill-amberbright' : 'fill-fog dark:fill-mist'} />
      {lit &&
        [-40, -20, 0, 20, 40].map((a) => (
          <line
            key={a}
            x1={140 + 22 * Math.sin((a * Math.PI) / 180)}
            y1={66 + 22 * Math.cos((a * Math.PI) / 180)}
            x2={140 + 34 * Math.sin((a * Math.PI) / 180)}
            y2={66 + 34 * Math.cos((a * Math.PI) / 180)}
            className="stroke-amberbright"
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
      <text x={140} y={108} textAnchor="middle" fontSize={10} className="fill-fog dark:fill-mist font-mono">
        {withUnit(run.reading, sim.sliders.find((d) => d.id === sim.watch)?.unit ?? '')}
      </text>
      <Pill x={248} y={66} text={lit ? sim.onText : sim.offText} on={lit} />
    </Frame>
  )
}

/** Padlock: shackle snaps shut while lockout is armed. */
function PadlockViz({ s }: { s: Simulation }) {
  const { sim, run } = s
  const armed = run.active
  const fails = Math.round(run.reading)
  const maxFails = Math.max(1, Math.round(watchRange(sim).max))
  const dots = Math.min(8, maxFails)
  return (
    <Frame label={`Live view · ${sim.actuator}: ${armed ? sim.onText : sim.offText}`}>
      <rect x={108} y={58} width={64} height={52} rx={10} className={armed ? 'fill-amber dark:fill-amberbright' : 'fill-leaf dark:fill-leafbright'} opacity={0.9} />
      <circle cx={140} cy={80} r={7} className="fill-card dark:fill-moss" />
      <rect x={137} y={80} width={6} height={14} rx={3} className="fill-card dark:fill-moss" />
      {armed ? (
        <path d="M 120 60 V 46 a 20 20 0 0 1 40 0 V 60" fill="none" className="stroke-ink dark:stroke-foam" strokeWidth={7} />
      ) : (
        <path d="M 120 60 V 46 a 20 20 0 0 1 39 6" fill="none" className="stroke-ink dark:stroke-foam" strokeWidth={7} strokeLinecap="round" />
      )}
      {Array.from({ length: dots }, (_, i) => (
        <circle
          key={i}
          cx={56 + i * 16}
          cy={120}
          r={5}
          className={i < fails ? 'fill-signal' : 'fill-linelight stroke-line dark:fill-[#24352a] dark:stroke-edge'}
        />
      ))}
      <text x={48} y={104} fontSize={10} className="fill-fog dark:fill-mist">
        fails {fails}
      </text>
      <Pill x={248} y={66} text={armed ? sim.onText : sim.offText} on={armed} />
      <text x={248} y={92} textAnchor="middle" fontSize={10} className="fill-fog dark:fill-mist">
        trips {fmt(s.settings.threshold)}
      </text>
    </Frame>
  )
}

/** Rover with a gripper that opens/closes on the Grip state. */
function GripViz({ s }: { s: Simulation }) {
  const { sim, run } = s
  const { norm } = useNorm(s)
  const shut = run.active
  const ox = 196 + norm * 84 // object block slides with measured distance
  const jaw = shut ? 3 : 30 // claw half-angle: near-closed vs wide open
  return (
    <Frame label={`Live view · ${sim.actuator}: ${shut ? sim.onText : sim.offText}`}>
      <line x1={8} y1={112} x2={312} y2={112} className="stroke-line dark:stroke-edge" strokeWidth={2} />
      <rect x={30} y={62} width={66} height={40} rx={10} className="fill-card stroke-line dark:fill-moss dark:stroke-edge" strokeWidth={2} />
      <rect x={24} y={66} width={10} height={18} rx={3} className="fill-ink dark:fill-foam" />
      <rect x={92} y={66} width={10} height={18} rx={3} className="fill-ink dark:fill-foam" />
      <rect x={24} y={88} width={10} height={18} rx={3} className="fill-ink dark:fill-foam" />
      <rect x={92} y={88} width={10} height={18} rx={3} className="fill-ink dark:fill-foam" />
      <line x1={96} y1={82} x2={150} y2={82} className="stroke-leaf dark:stroke-leafbright" strokeWidth={8} strokeLinecap="round" />
      <line
        x1={150}
        y1={82}
        x2={150 + 30 * Math.cos((jaw * Math.PI) / 180)}
        y2={82 - 30 * Math.sin((jaw * Math.PI) / 180)}
        className="stroke-signal"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <line
        x1={150}
        y1={82}
        x2={150 + 30 * Math.cos((jaw * Math.PI) / 180)}
        y2={82 + 30 * Math.sin((jaw * Math.PI) / 180)}
        className="stroke-signal"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <rect x={ox} y={66} width={24} height={32} rx={4} className="fill-amber dark:fill-amberbright" opacity={0.85} />
      <text x={ox + 12} y={58} textAnchor="middle" fontSize={10} className="fill-fog dark:fill-mist font-mono">
        {withUnit(run.reading, sim.sliders.find((d) => d.id === sim.watch)?.unit ?? '')}
      </text>
      <Pill x={248} y={20} text={`${sim.actuator} ${shut ? sim.onText : sim.offText}`} on={shut} />
    </Frame>
  )
}

/** Parking slots + barrier gate + waiting queue. */
function SlotsViz({ s }: { s: Simulation }) {
  const { sim, run, extras } = s
  const free = Math.round(run.reading)
  const queue = Math.round(extras['queue'] ?? 0)
  const open = run.active
  return (
    <Frame label={`Live view · Gate: ${open ? sim.onText : sim.offText}`}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={20 + i * 44}
            y={44}
            width={38}
            height={52}
            rx={5}
            className={i < 4 - free ? 'fill-linelight stroke-line dark:fill-[#24352a] dark:stroke-edge' : 'fill-paper stroke-leaf dark:fill-pine dark:stroke-leafbright'}
            strokeWidth={2}
            strokeDasharray={i < 4 - free ? '' : '5 3'}
          />
          {i < 4 - free && (
            <rect x={28 + i * 44} y={58} width={22} height={24} rx={5} className="fill-ink dark:fill-foam" opacity={0.75} />
          )}
        </g>
      ))}
      <rect x={212} y={48} width={10} height={48} rx={3} className="fill-ink dark:fill-foam" />
      <line
        x1={217}
        y1={52}
        x2={open ? 252 : 292}
        y2={open ? 22 : 52}
        className={open ? 'stroke-leaf dark:stroke-leafbright' : 'stroke-signal'}
        strokeWidth={7}
        strokeLinecap="round"
      />
      {Array.from({ length: Math.min(3, queue) }, (_, i) => (
        <rect key={i} x={232 + i * 26} y={76} width={20} height={14} rx={4} className="fill-amber dark:fill-amberbright" opacity={0.85} />
      ))}
      {queue > 3 && (
        <text x={312} y={88} textAnchor="end" fontSize={10} className="fill-fog dark:fill-mist font-mono">
          +{queue - 3}
        </text>
      )}
      <text x={108} y={112} textAnchor="middle" fontSize={10} className="fill-fog dark:fill-mist">
        {free} free · {queue} waiting
      </text>
      <Pill x={262} y={20} text={open ? sim.onText : sim.offText} on={open} />
    </Frame>
  )
}

export function VizPanel({ s }: { s: Simulation }) {
  switch (s.sim.viz) {
    case 'rover':
      return <RoverViz s={s} />
    case 'line':
      return <LineViz s={s} />
    case 'arm':
      return <ArmViz s={s} />
    case 'tank':
      return <TankViz s={s} />
    case 'gauge':
      return <GaugeViz s={s} />
    case 'lock':
      return <LockViz s={s} />
    case 'lamp':
      return <LampViz s={s} />
    case 'slots':
      return <SlotsViz s={s} />
    case 'padlock':
      return <PadlockViz s={s} />
    case 'grip':
      return <GripViz s={s} />
    default:
      return null
  }
}
