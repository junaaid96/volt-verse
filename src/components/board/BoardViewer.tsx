import { Suspense, useEffect, useRef, type ReactNode } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { SafeCanvas } from '../SafeCanvas'
import { ArduinoUno, Esp32Cam, Esp32Dev, NodeMcu } from './boards'
import { Breadboard, Callout, Led, Resistor, Sensor, Wire } from './bench'
import {
  CAM_DEF,
  ESP32_DEF,
  NODEMCU_DEF,
  SENSOR_LEADS,
  SENSOR_NAMES,
  UNO_DEF,
  arc,
  hole,
  railHole,
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

const LAYOUTS: Record<BoardKind, { board: V3; bb: V3; sensor: V3 }> = {
  uno: { board: [-3.9, 0, 0.2], bb: [3.9, 0, 0.3], sensor: [3.0, 0, 4.4] },
  esp32: { board: [-3.3, 0, 0.2], bb: [3.6, 0, 0.3], sensor: [2.8, 0, 4.4] },
  nodemcu: { board: [-3.2, 0, 0.2], bb: [3.6, 0, 0.3], sensor: [2.8, 0, 4.4] },
  esp32cam: { board: [-3.0, 0, 0.2], bb: [3.6, 0, 0.3], sensor: [2.8, 0, 0.4 + 4.0] },
}

// Callouts in board-local coords (offset by the board position at render).
const CALLOUTS: Record<BoardKind, Array<{ from: V3; to: V3; text: string }>> = {
  uno: [
    { from: [0.7, 0.75, 0.1], to: [-0.1, 3.0, 1.9], text: 'ATmega328P runs your code' },
    { from: [-2.85, 0.6, -1.55], to: [-4.4, 1.8, -1.3], text: 'USB · 5V in' },
    { from: [1.437, 1.05, -2.25], to: [2.7, 2.4, -2.8], text: 'D0–D13 digital pins' },
  ],
  esp32: [
    { from: [-1.55, 0.5, 0], to: [-2.6, 2.5, 0.5], text: 'ESP32 · Wi-Fi + Bluetooth' },
    { from: [-1.973, 0.8, 1.2], to: [-3.1, 1.4, 2.7], text: '3V3 logic only!' },
    { from: [2.3, 0.4, 0], to: [3.7, 2.3, 0.7], text: 'USB serial + power' },
  ],
  nodemcu: [
    { from: [-1.4, 0.5, 0], to: [-2.5, 2.5, 0.4], text: 'ESP8266 · Wi-Fi' },
    { from: [-0.553, 0.8, -1.05], to: [0.8, 2.3, -2.5], text: 'D0–D8 + A0' },
    { from: [2.1, 0.4, 0], to: [3.5, 2.2, 0.9], text: 'USB serial + power' },
  ],
  esp32cam: [
    { from: [-1.2, 0.6, -0.4], to: [-2.5, 2.5, 0.1], text: 'OV2640 camera' },
    { from: [0.2, 0.3, 0.5], to: [1.5, 2.1, 2.1], text: 'Flash LED' },
    { from: [-1.273, 0.4, 1.0], to: [-2.9, 1.2, 2.9], text: 'UART + 5V' },
  ],
}

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]

// Smaller boards get a closer camera so details stay readable.
const CAM_POS: Record<BoardKind, [number, number, number]> = {
  uno: [7.5, 6.5, 10.5],
  esp32: [6.2, 5.4, 8.7],
  nodemcu: [6.2, 5.4, 8.7],
  esp32cam: [6.0, 5.2, 8.4],
}

/** Procedural studio reflections — no HDR download needed. */
function StudioEnv() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = new RoomEnvironment()
    const rt = pmrem.fromScene(env, 0.04)
    scene.environment = rt.texture
    return () => {
      scene.environment = null
      rt.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

/** Shadow flags for every mesh in the rig, without touching sprites/lines. */
function Shadowed({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null!)
  useEffect(() => {
    ref.current.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
    })
  }, [])
  return <group ref={ref}>{children}</group>
}

function Rig({ board, rig }: { board: BoardKind; rig: GuideRig }) {
  const { Cmp, def } = BOARDS[board]
  const L = LAYOUTS[board]
  const [pwr, gnd, sig] = def.ports

  const ledA = add(L.bb, hole(14, 'e'))
  const ledB = add(L.bb, hole(14, 'f'))
  const resA = add(L.bb, hole(18, 'e'))
  const resB = add(L.bb, hole(14, 'e'))

  const parts: Array<{ kind: PartKind; pos: V3 }> = [
    ...(rig.sensor ? [{ kind: rig.sensor, pos: L.sensor }] : []),
    ...(rig.extras ?? []).map((kind, i) => ({
      kind,
      pos: [L.sensor[0] - 2.8 * (i + 1), 0, L.sensor[2] + 0.4] as V3,
    })),
  ]

  return (
    <Shadowed>
      <group position={L.board}>
        <Cmp />
      </group>
      <Breadboard position={L.bb} />

      {/* demo circuit: signal -> resistor -> LED -> ground rail */}
      <Led a={ledA} b={ledB} />
      <Resistor a={resA} b={resB} />
      <Wire points={arc(add(L.board, pwr.pos), add(L.bb, railHole(4, 2)), 1.2)} color={pwr.color} />
      <Wire points={arc(add(L.board, gnd.pos), add(L.bb, railHole(4, 3)), 1.2)} color={gnd.color} />
      <Wire points={arc(add(L.board, sig.pos), add(L.bb, hole(18, 'e')), 1.3)} color={sig.color} />
      <Wire
        points={arc(add(L.bb, railHole(10, 3)), add(L.bb, hole(10, 'f')), 0.5)}
        color="#2470b7"
      />

      {/* this guide's modules, wired to the rails */}
      {parts.map((p, i) => {
        const leads = SENSOR_LEADS[p.kind]
        const col = 20 + i * 2
        const top: V3 = [
          p.pos[0] + (leads[0][0] + leads[1][0]) / 2,
          p.pos[1] + Math.max(leads[0][1], leads[1][1]) + 0.15,
          p.pos[2] + (leads[0][2] + leads[1][2]) / 2,
        ]
        return (
          <group key={`${p.kind}-${i}`}>
            <group position={p.pos}>
              <Sensor kind={p.kind} />
            </group>
            <Wire
              points={arc(add(L.bb, railHole(col, 2)), add(p.pos, leads[0]), 0.9)}
              color="#d43a2e"
            />
            <Wire
              points={arc(add(L.bb, railHole(col, 3)), add(p.pos, leads[1]), 0.9)}
              color="#22252a"
            />
            <Callout
              from={top}
              to={[top[0] + (i === 0 ? 0.8 : -1.5), top[1] + 1.7, top[2] + 1.3]}
              text={SENSOR_NAMES[p.kind]}
            />
          </group>
        )
      })}

      {CALLOUTS[board].map((c, i) => (
        <Callout key={i} from={add(L.board, c.from)} to={add(L.board, c.to)} text={c.text} />
      ))}
      <Callout
        from={[L.bb[0] - 1.5, 0.95, L.bb[2] + 1.2]}
        to={[L.bb[0] - 2.2, 2.3, L.bb[2] + 3.2]}
        text="Solderless breadboard"
      />
    </Shadowed>
  )
}

export function BoardViewer({
  board,
  rig,
  className = 'h-[240px] w-full',
  label,
}: {
  board: BoardKind
  rig: GuideRig
  className?: string
  label: string
}) {
  const reduce = useReducedMotion()
  return (
    <div className={`relative ${className}`}>
      <SafeCanvas label={label} camera={{ position: CAM_POS[board], fov: 36 }}>
        <StudioEnv />
        <hemisphereLight args={['#ffffff', '#8a9a8f', 0.75]} />
        <directionalLight
          position={[6, 9, 5]}
          intensity={1.7}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-camera-near={1}
          shadow-camera-far={30}
          shadow-bias={-0.0002}
          shadow-normalBias={0.02}
        />
        <directionalLight position={[-6, 4, -3]} intensity={0.45} />
        <Suspense fallback={null}>
          <Rig board={board} rig={rig} />
        </Suspense>
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <shadowMaterial opacity={0.22} />
        </mesh>
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.1}
          autoRotate={!reduce}
          autoRotateSpeed={0.7}
          minDistance={5}
          maxDistance={24}
          minPolarAngle={0.15}
          maxPolarAngle={1.42}
          target={[0, 0.3, 0.5]}
          enablePan
        />
      </SafeCanvas>
      <span className="print-hide pointer-events-none absolute bottom-2 right-3 text-[11px] text-fog dark:text-[#9bb0a0]">
        drag to orbit · scroll to zoom
      </span>
    </div>
  )
}
