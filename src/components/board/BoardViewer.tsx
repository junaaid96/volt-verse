import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { PerformanceMonitor, type CameraControlsImpl } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import * as THREE from 'three'
import { SafeCanvas } from '../SafeCanvas'
import { useTheme } from '../../hooks/theme'
import { ArduinoUno, Esp32Cam, Esp32Dev, NodeMcu } from './boards'
import { Breadboard, FlowPulses, HotspotProjector, Led, Resistor, Sensor, Wire } from './bench'
import { HotspotLabels } from './HotspotLabels'
import { CameraRig } from './CameraRig'
import { lookHome } from './cameraPose'
import { Stage } from './Stage'
import { STAGE_THEMES } from './stageThemes'
import { ViewerDock, type DockAction, type DockToggles } from './ViewerDock'
import {
  BENCH_LAYOUTS,
  BOARD_HOTSPOTS,
  CAMERA_HOME,
  CAM_DEF,
  ESP32_DEF,
  NODEMCU_DEF,
  SENSOR_LEADS,
  SENSOR_NAMES,
  UNO_DEF,
  arc,
  hole,
  layoutRig,
  railHole,
  rigFitBoost,
  type BoardDef,
  type BoardKind,
  type GuideRig,
  type PartKind,
  type V3,
} from './layout'

const BOARDS: Record<BoardKind, { Cmp: () => React.JSX.Element; def: BoardDef }> = {
  uno: { Cmp: ArduinoUno, def: UNO_DEF },
  esp32: { Cmp: Esp32Dev, def: ESP32_DEF },
  nodemcu: { Cmp: NodeMcu, def: NODEMCU_DEF },
  esp32cam: { Cmp: Esp32Cam, def: CAM_DEF },
}

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]

interface WireSpec {
  points: V3[]
  color: string
  /** Conventional current direction along `points` (+1 forward, -1 reverse). */
  flow: 1 | -1
}

/** Shadow flags for every mesh in the rig, without touching DOM hotspots. */
function Shadowed({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null!)
  useEffect(() => {
    ref.current.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
  })
  return <group ref={ref}>{children}</group>
}

function useBenchWires(board: BoardKind, parts: Array<{ kind: PartKind; pos: V3 }>): WireSpec[] {
  return useMemo(() => {
    const L = BENCH_LAYOUTS[board]
    const [pwr, gnd, sig] = BOARDS[board].def.ports
    const wires: WireSpec[] = [
      { points: arc(add(L.board, pwr.pos), add(L.bb, railHole(4, 2)), 1.2), color: pwr.color, flow: 1 },
      { points: arc(add(L.board, gnd.pos), add(L.bb, railHole(4, 3)), 1.2), color: gnd.color, flow: -1 },
      { points: arc(add(L.board, sig.pos), add(L.bb, hole(18, 'e')), 1.3), color: sig.color, flow: 1 },
      { points: arc(add(L.bb, railHole(10, 3)), add(L.bb, hole(10, 'f')), 0.5), color: '#2470b7', flow: -1 },
    ]
    parts.forEach((p, i) => {
      const leads = SENSOR_LEADS[p.kind]
      const col = 20 + i * 2
      wires.push(
        { points: arc(add(L.bb, railHole(col, 2)), add(p.pos, leads[0]), 0.9), color: '#d43a2e', flow: 1 },
        { points: arc(add(L.bb, railHole(col, 3)), add(p.pos, leads[1]), 0.9), color: '#22252a', flow: -1 },
      )
    })
    return wires
  }, [board, parts])
}

type BenchPart = { kind: PartKind; pos: V3 }

function useBenchParts(board: BoardKind, rig: GuideRig): BenchPart[] {
  const rigKey = JSON.stringify(rig)
  return useMemo(() => layoutRig(board, JSON.parse(rigKey) as GuideRig), [board, rigKey])
}

function useHotspots(board: BoardKind, parts: BenchPart[]): Array<{ at: V3; text: string }> {
  return useMemo(() => {
    const L = BENCH_LAYOUTS[board]
    return [
      ...BOARD_HOTSPOTS[board].map((h) => ({ at: add(L.board, h.at), text: h.text })),
      ...parts.map((p) => {
        const leads = SENSOR_LEADS[p.kind]
        const top: V3 = [p.pos[0], p.pos[1] + Math.max(leads[0][1], leads[1][1]) + 0.2, p.pos[2]]
        return { at: top, text: SENSOR_NAMES[p.kind] }
      }),
      { at: [L.bb[0] + 1.8, 0.95, L.bb[2] - 1.2] as V3, text: 'Breadboard' },
    ]
  }, [board, parts])
}

function Rig({ board, parts, showFlow }: { board: BoardKind; parts: BenchPart[]; showFlow: boolean }) {
  const { Cmp } = BOARDS[board]
  const L = BENCH_LAYOUTS[board]
  const wires = useBenchWires(board, parts)

  return (
    <>
      <Shadowed>
        <group position={L.board}>
          <Cmp />
        </group>
        <Breadboard position={L.bb} />
        {/* demo circuit: signal -> resistor -> LED -> ground rail */}
        <Led a={add(L.bb, hole(14, 'e'))} b={add(L.bb, hole(14, 'f'))} />
        <Resistor a={add(L.bb, hole(18, 'e'))} b={add(L.bb, hole(14, 'e'))} />
        {wires.map((w, i) => (
          <Wire key={i} points={w.points} color={w.color} />
        ))}
        {parts.map((p, i) => (
          <group key={`${p.kind}-${i}`} position={p.pos}>
            <Sensor kind={p.kind} />
          </group>
        ))}
      </Shadowed>

      {showFlow && wires.map((w, i) => <FlowPulses key={i} points={w.points} direction={w.flow} />)}
    </>
  )
}

function useFullscreen(target: React.RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false)
  useEffect(() => {
    const onChange = () => setActive(document.fullscreenElement === target.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [target])
  const toggle = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void target.current?.requestFullscreen?.()
  }, [target])
  return { active, toggle }
}

export function BoardViewer({
  board,
  rig,
  className = 'h-[240px] w-full',
  label,
  showDock = true,
}: {
  board: BoardKind
  rig: GuideRig
  className?: string
  label: string
  showDock?: boolean
}) {
  const reduce = useReducedMotion() ?? false
  const { theme } = useTheme()
  const container = useRef<HTMLDivElement>(null)
  const controls = useRef<CameraControlsImpl | null>(null)
  const lastInput = useRef(0)
  const fullscreen = useFullscreen(container)
  const [highQuality, setHighQuality] = useState(true)
  const [toggles, setToggles] = useState({ labels: true, flow: false, spin: !reduce })

  // Widen the fit for oversized rigs (chassis, panels); memo keeps the
  // camera fly-in from retriggering on unrelated renders.
  const rigKey = JSON.stringify(rig)
  const home = useMemo(() => {
    const base = CAMERA_HOME[board]
    const boost = rigFitBoost(JSON.parse(rigKey) as GuideRig)
    return { ...base, radius: Math.min(base.radius + boost, 7.2) }
  }, [board, rigKey])
  const stageTheme = STAGE_THEMES[theme === 'dark' ? 'dark' : 'light']
  const parts = useBenchParts(board, rig)
  const hotspots = useHotspots(board, parts)
  const hotspotPoints = useMemo(() => hotspots.map((h) => h.at), [hotspots])
  const hotspotEls = useRef<Array<HTMLElement | null>>([])
  // Label priority for decluttering: rig parts first, then breadboard, then board pins.
  const labelOrder = useMemo(() => {
    const nb = BOARD_HOTSPOTS[board].length
    const partIdx = Array.from({ length: parts.length }, (_, k) => nb + k)
    const pinIdx = Array.from({ length: nb }, (_, i) => i)
    return [...partIdx, nb + parts.length, ...pinIdx]
  }, [board, parts])

  const onAction = useCallback(
    (a: DockAction) => {
      const c = controls.current
      if (!c) return
      lastInput.current = performance.now()
      const smooth = !reduce
      if (a === 'rotateLeft') void c.rotate(-Math.PI / 4, 0, smooth)
      else if (a === 'rotateRight') void c.rotate(Math.PI / 4, 0, smooth)
      else if (a === 'zoomIn') void c.dolly(2.5, smooth)
      else if (a === 'zoomOut') void c.dolly(-2.5, smooth)
      else void lookHome(c, home, smooth)
    },
    [home, reduce],
  )

  const onToggle = useCallback(
    (t: keyof DockToggles) => {
      if (t === 'fullscreen') fullscreen.toggle()
      else setToggles((s) => ({ ...s, [t]: !s[t] }))
    },
    [fullscreen],
  )

  return (
    <div ref={container} className={`viewer relative ${className}`}>
      <SafeCanvas label={label} dpr={highQuality ? [1, 1.75] : 1} camera={{ position: home.direction, fov: 32 }}>
        <PerformanceMonitor onDecline={() => setHighQuality(false)} />
        <Stage theme={stageTheme} sceneKey={`${board}-${JSON.stringify(rig)}`} effects={highQuality} />
        <Suspense fallback={null}>
          <Rig board={board} parts={parts} showFlow={toggles.flow} />
        </Suspense>
        {toggles.labels && (
          <HotspotProjector
            points={hotspotPoints}
            labels={hotspots.map((h) => h.text)}
            elements={hotspotEls}
            order={labelOrder}
          />
        )}
        <CameraRig
          controlsRef={controls}
          lastInputRef={lastInput}
          home={home}
          autoRotate={toggles.spin}
          animate={!reduce}
          expanded={fullscreen.active}
        />
      </SafeCanvas>
      {toggles.labels && <HotspotLabels labels={hotspots.map((h) => h.text)} elements={hotspotEls} />}
      {showDock && (
        <ViewerDock
          toggles={{ ...toggles, fullscreen: fullscreen.active }}
          onAction={onAction}
          onToggle={onToggle}
        />
      )}
    </div>
  )
}
