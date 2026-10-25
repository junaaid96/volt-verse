import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import * as THREE from 'three'
import type { PartKind } from '../../data/types'
import { BB, breadTexture } from './textures'
import type { V3 } from './layout'

export function Breadboard({ position }: { position: V3 }) {
  const map = useMemo(() => breadTexture(), [])
  return (
    <group position={position}>
      <RoundedBox args={[BB.w, 0.9, BB.h]} radius={0.08} smoothness={3} position={[0, 0.45, 0]}>
        <meshPhysicalMaterial color="#eceee9" roughness={0.55} clearcoat={0.15} clearcoatRoughness={0.6} />
      </RoundedBox>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.906, 0]}>
        <planeGeometry args={[BB.w - 0.1, BB.h - 0.1]} />
        <meshStandardMaterial map={map} roughness={0.62} />
      </mesh>
    </group>
  )
}

const leadMat = { color: '#d0d4d8', metalness: 1, roughness: 0.3 } as const

/** Blinking 5 mm LED; a small point light makes it tint the breadboard like a real one. */
export function Led({ a, b, color = '#ff3b30' }: { a: V3; b: V3; color?: string }) {
  const mat = useRef<THREE.MeshPhysicalMaterial>(null!)
  const glow = useRef<THREE.PointLight>(null!)
  const reduce = useReducedMotion()
  useFrame(({ clock }) => {
    if (!mat.current) return
    const on = reduce || clock.elapsedTime % 1.6 < 0.8
    mat.current.emissiveIntensity = on ? 14 : 0.15
    glow.current.intensity = on ? 1.6 : 0
  })
  const mx = (a[0] + b[0]) / 2
  const mz = (a[2] + b[2]) / 2
  const top = a[1] + 0.62
  return (
    <group>
      {[a, b].map((p, i) => (
        <mesh key={i} position={[p[0], p[1] + 0.25, p[2]]}>
          <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
          <meshStandardMaterial {...leadMat} />
        </mesh>
      ))}
      <mesh position={[mx, top - 0.14, mz]}>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 24]} />
        <meshPhysicalMaterial color={color} roughness={0.15} transmission={0.4} thickness={0.2} />
      </mesh>
      <mesh position={[mx, top, mz]}>
        <capsuleGeometry args={[0.17, 0.2, 8, 20]} />
        <meshPhysicalMaterial
          ref={mat}
          color={color}
          emissive={color}
          emissiveIntensity={14}
          toneMapped={false}
          roughness={0.12}
          clearcoat={1}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight ref={glow} position={[mx, top + 0.1, mz]} color={color} intensity={1.6} distance={3} decay={2} />
    </group>
  )
}

export function Resistor({ a, b }: { a: V3; b: V3 }) {
  const dx = b[0] - a[0]
  const dz = b[2] - a[2]
  const len = Math.hypot(dx, dz)
  const ang = Math.atan2(dz, dx)
  const mx = (a[0] + b[0]) / 2
  const mz = (a[2] + b[2]) / 2
  return (
    <group>
      {[a, b].map((p, i) => (
        <mesh key={i} position={[p[0], p[1] + 0.19, p[2]]}>
          <cylinderGeometry args={[0.028, 0.028, 0.38, 8]} />
          <meshStandardMaterial {...leadMat} />
        </mesh>
      ))}
      <group position={[mx, a[1] + 0.42, mz]} rotation-y={-ang}>
        <mesh rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.11, 0.11, Math.min(len, 0.7), 12]} />
          <meshStandardMaterial color="#d9b98c" roughness={0.6} />
        </mesh>
        {[-0.18, -0.06, 0.06, 0.2].map((o, i) => (
          <mesh key={i} position={[o, 0, 0]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.115, 0.115, 0.07, 12]} />
            <meshStandardMaterial
              color={['#c0392b', '#1a1a1a', '#c0392b', '#c9a227'][i]}
              roughness={0.5}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// Jumper wires (static per composition → cached curves/geometries, no leaks).
const curveCache = new Map<string, THREE.CatmullRomCurve3>()
const tubeCache = new Map<string, THREE.TubeGeometry>()

function wireCurve(points: V3[]): THREE.CatmullRomCurve3 {
  const key = JSON.stringify(points)
  const hit = curveCache.get(key)
  if (hit) return hit
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
  curveCache.set(key, curve)
  return curve
}

function wireTube(points: V3[]): THREE.TubeGeometry {
  const key = JSON.stringify(points)
  const hit = tubeCache.get(key)
  if (hit) return hit
  const g = new THREE.TubeGeometry(wireCurve(points), 64, 0.042, 10)
  tubeCache.set(key, g)
  return g
}

/** Dupont jumper end: black housing sitting on the pin it plugs into. */
function DupontEnd({ at }: { at: V3 }) {
  return (
    <mesh position={[at[0], at[1] + 0.22, at[2]]}>
      <boxGeometry args={[0.2, 0.44, 0.2]} />
      <meshStandardMaterial color="#121315" roughness={0.45} />
    </mesh>
  )
}

export function Wire({ points, color }: { points: V3[]; color: string }) {
  const geo = useMemo(() => wireTube(points), [points])
  return (
    <group>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color={color} roughness={0.38} clearcoat={0.5} clearcoatRoughness={0.35} />
      </mesh>
      <DupontEnd at={points[0]} />
      <DupontEnd at={points[points.length - 1]} />
    </group>
  )
}

/**
 * Glowing charge pulses travelling along a wire. `direction` follows conventional
 * current: +1 from the first point to the last, -1 back towards the board.
 */
export function FlowPulses({
  points,
  direction = 1,
  color = '#ffd84d',
  count = 4,
}: {
  points: V3[]
  direction?: 1 | -1
  color?: string
  count?: number
}) {
  const curve = useMemo(() => wireCurve(points), [points])
  const refs = useRef<Array<THREE.Mesh | null>>([])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  // Over-range (HDR) colour so the bloom pass picks the pulses up.
  const hdr = useMemo(() => new THREE.Color(color).multiplyScalar(6), [color])
  useFrame(({ clock }) => {
    const base = (clock.elapsedTime * 0.35) % 1
    refs.current.forEach((m, i) => {
      if (!m) return
      let t = (base + i / count) % 1
      if (direction < 0) t = 1 - t
      curve.getPointAt(t, tmp)
      m.position.copy(tmp)
    })
  })
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m
          }}
        >
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshBasicMaterial color={hdr} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// One sensor module per scene kind (wire-lead points live in layout.ts).
// ---------------------------------------------------------------------------

export function Sensor({ kind }: { kind: PartKind }) {
  switch (kind) {
    case 'soil':
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[3.0, 0.12, 1.0]} />
            <meshStandardMaterial color="#14532d" roughness={0.55} />
          </mesh>
          <mesh position={[-1.2, 0.13, 0]}>
            <boxGeometry args={[0.6, 0.03, 0.8]} />
            <meshStandardMaterial color="#c8ccd0" metalness={0.8} roughness={0.4} />
          </mesh>
          <mesh position={[1.2, 0.18, 0]}>
            <boxGeometry args={[0.5, 0.25, 0.4]} />
            <meshStandardMaterial color="#f2f3f0" roughness={0.6} />
          </mesh>
        </group>
      )
    case 'pir':
      return (
        <group>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[1.7, 0.5, 1.3]} />
            <meshStandardMaterial color="#eef0ec" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.5, 0]} scale={[1, 0.75, 1]}>
            <sphereGeometry args={[0.55, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.85} roughness={0.3} />
          </mesh>
        </group>
      )
    case 'bme':
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.95, 0.12, 0.95]} />
            <meshStandardMaterial color="#5b2d8e" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.4, 0.08, 0.4]} />
            <meshStandardMaterial color="#c8ccd0" metalness={0.85} roughness={0.35} />
          </mesh>
        </group>
      )
    case 'max':
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[0.95, 0.12, 0.95]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.5, 0.1, 0.5]} />
            <meshStandardMaterial color="#101216" roughness={0.4} />
          </mesh>
          <mesh position={[-0.18, 0.23, 0]}>
            <boxGeometry args={[0.12, 0.04, 0.12]} />
            <meshStandardMaterial color="#e5484d" emissive="#e5484d" emissiveIntensity={1.5} />
          </mesh>
          <mesh position={[0.18, 0.23, 0]}>
            <boxGeometry args={[0.12, 0.04, 0.12]} />
            <meshStandardMaterial color="#2fd35f" emissive="#2fd35f" emissiveIntensity={1.2} />
          </mesh>
        </group>
      )
    case 'sonic':
      return (
        <group>
          <mesh position={[0, 0.075, 0]}>
            <boxGeometry args={[4.5, 0.15, 2.0]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.55} />
          </mesh>
          {[-1.1, 1.1].map((tx, i) => (
            <mesh key={i} position={[tx, 0.4, 0]}>
              <cylinderGeometry args={[0.4, 0.4, 0.5, 20]} />
              <meshStandardMaterial color="#c8ccd0" metalness={0.85} roughness={0.35} />
            </mesh>
          ))}
          <mesh position={[0, 0.2, -0.6]}>
            <boxGeometry args={[0.5, 0.12, 0.3]} />
            <meshStandardMaterial color="#c8ccd0" metalness={0.85} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.2, 0.85]}>
            <boxGeometry args={[1.3, 0.12, 0.25]} />
            <meshStandardMaterial color="#15171a" roughness={0.6} />
          </mesh>
        </group>
      )
    case 'relay':
      return (
        <group>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.6, 1.0, 1.2]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[1.2, 0.15, 0.9]} />
            <meshStandardMaterial color="#15171a" roughness={0.6} />
          </mesh>
          {[-0.4, 0, 0.4].map((sx, i) => (
            <mesh key={i} position={[sx, 1.16, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.08, 10]} />
              <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[0.55, 0.7, 0.61]}>
            <boxGeometry args={[0.18, 0.12, 0.04]} />
            <meshStandardMaterial color="#e5484d" emissive="#e5484d" emissiveIntensity={1.3} />
          </mesh>
        </group>
      )
    case 'level':
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[3.0, 0.12, 1.2]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.55} />
          </mesh>
          {[-0.4, -0.2, 0, 0.2, 0.4].map((sz, i) => (
            <mesh key={i} position={[-0.1, 0.13, sz]}>
              <boxGeometry args={[2.4, 0.03, 0.1]} />
              <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[1.2, 0.18, 0]}>
            <boxGeometry args={[0.5, 0.25, 0.4]} />
            <meshStandardMaterial color="#f2f3f0" roughness={0.6} />
          </mesh>
        </group>
      )
    case 'keypad':
      return (
        <group>
          <mesh position={[0, 0.175, 0]}>
            <boxGeometry args={[2.6, 0.35, 2.0]} />
            <meshStandardMaterial color="#23262b" roughness={0.55} />
          </mesh>
          {[-0.75, -0.25, 0.25, 0.75].map((bx) =>
            [-0.55, 0, 0.55].map((bz) => (
              <mesh key={`${bx}${bz}`} position={[bx, 0.4, bz]}>
                <boxGeometry args={[0.42, 0.12, 0.42]} />
                <meshStandardMaterial color="#3a3f45" roughness={0.5} />
              </mesh>
            )),
          )}
        </group>
      )
    case 'rc522':
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[3.0, 0.12, 4.5]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.55} />
          </mesh>
          {/* antenna traces */}
          {[-1.7, 1.7].map((az, i) => (
            <mesh key={i} position={[0, 0.13, az]}>
              <boxGeometry args={[2.4, 0.02, 0.08]} />
              <meshStandardMaterial color="#e8ecf0" roughness={0.4} />
            </mesh>
          ))}
          {[-1.1, 1.1].map((ax, i) => (
            <mesh key={i} position={[ax, 0.13, 0]}>
              <boxGeometry args={[0.08, 0.02, 3.5]} />
              <meshStandardMaterial color="#e8ecf0" roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[0, 0.2, 2.0]}>
            <boxGeometry args={[1.6, 0.12, 0.25]} />
            <meshStandardMaterial color="#15171a" roughness={0.6} />
          </mesh>
          {[-0.63, -0.21, 0.21, 0.63].map((px, i) => (
            <mesh key={i} position={[px, 0.32, 2.0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
              <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )
    case 'mq':
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[1.6, 0.12, 2.2]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.47, -0.2]}>
            <cylinderGeometry args={[0.55, 0.55, 0.7, 20]} />
            <meshStandardMaterial color="#23262b" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.86, -0.2]}>
            <cylinderGeometry args={[0.5, 0.5, 0.18, 20]} />
            <meshStandardMaterial color="#c8ccd0" metalness={0.85} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.2, 0.9]}>
            <boxGeometry args={[1.2, 0.12, 0.2]} />
            <meshStandardMaterial color="#15171a" roughness={0.6} />
          </mesh>
        </group>
      )
    case 'gps':
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[2.5, 0.12, 2.5]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.17, -0.3]}>
            <boxGeometry args={[1.2, 0.1, 1.2]} />
            <meshStandardMaterial color="#c8ccd0" metalness={0.85} roughness={0.35} />
          </mesh>
          <mesh position={[0.8, 0.15, 0.8]}>
            <boxGeometry args={[0.18, 0.08, 0.18]} />
            <meshStandardMaterial color="#e5484d" emissive="#e5484d" emissiveIntensity={1.4} />
          </mesh>
        </group>
      )
    case 'gsm':
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[2.5, 0.12, 2.3]} />
            <meshStandardMaterial color="#a02323" roughness={0.55} />
          </mesh>
          <mesh position={[-0.2, 0.27, -0.2]}>
            <boxGeometry args={[1.8, 0.3, 1.5]} />
            <meshStandardMaterial color="#c8ccd0" metalness={0.85} roughness={0.35} />
          </mesh>
          <mesh position={[0.95, 0.5, -0.85]}>
            <cylinderGeometry args={[0.12, 0.12, 0.9, 10]} />
            <meshStandardMaterial color="#15171a" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.15, 0.9]}>
            <boxGeometry args={[0.2, 0.08, 0.2]} />
            <meshStandardMaterial color="#2fd35f" emissive="#2fd35f" emissiveIntensity={1.3} />
          </mesh>
        </group>
      )
    case 'pms':
      return (
        <group>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[3.5, 0.8, 2.5]} />
            <meshStandardMaterial color="#23262b" roughness={0.55} />
          </mesh>
          <mesh position={[-0.6, 0.82, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 0.06, 24]} />
            <meshStandardMaterial color="#0c0e10" roughness={0.7} />
          </mesh>
          <mesh position={[-0.6, 0.86, 0]}>
            <torusGeometry args={[0.45, 0.05, 8, 24]} />
            <meshStandardMaterial color="#3a3f45" roughness={0.5} />
          </mesh>
          <mesh position={[1.35, 0.5, 0.7]}>
            <boxGeometry args={[0.5, 0.25, 0.3]} />
            <meshStandardMaterial color="#f2f3f0" roughness={0.6} />
          </mesh>
        </group>
      )
    case 'pzem':
      return (
        <group>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[3.2, 1.1, 2.0]} />
            <meshStandardMaterial color="#17191d" roughness={0.55} />
          </mesh>
          <mesh position={[-0.5, 0.6, 1.01]}>
            <planeGeometry args={[1.8, 0.6]} />
            <meshStandardMaterial color="#0a1a12" emissive="#2fd35f" emissiveIntensity={0.7} />
          </mesh>
          {[-0.6, 0.6].map((sx, i) => (
            <mesh key={i} position={[sx, 1.16, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.1, 10]} />
              <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )
    case 'servo':
      return (
        <group>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[1.3, 1.8, 2.2]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[1.7, 0.15, 2.6]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.86, -0.4]}>
            <cylinderGeometry args={[0.4, 0.4, 0.12, 18]} />
            <meshStandardMaterial color="#f2f3f0" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.35, 1.15]}>
            <boxGeometry args={[0.5, 0.3, 0.25]} />
            <meshStandardMaterial color="#e8a81c" roughness={0.55} />
          </mesh>
        </group>
      )
    case 'oled':
      return (
        <group>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[2.7, 0.25, 1.4]} />
            <meshStandardMaterial color="#1b3a5c" roughness={0.5} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.26, 0]}>
            <planeGeometry args={[2.2, 0.95]} />
            <meshStandardMaterial color="#062a30" emissive="#38e1ff" emissiveIntensity={0.9} />
          </mesh>
        </group>
      )
    case 'buzzer':
      return (
        <group>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.4, 20]} />
            <meshStandardMaterial color="#15171a" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.41, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.03, 12]} />
            <meshStandardMaterial color="#050505" roughness={0.9} />
          </mesh>
        </group>
      )
  }
}

// ---------------------------------------------------------------------------
// Hotspot projector: each frame, pins the DOM labels rendered by
// <HotspotLabels> onto their 3D anchors. Writing transforms through refs keeps
// it off React's render path and needs no extra React roots.
// ---------------------------------------------------------------------------

export function HotspotProjector({
  points,
  elements,
}: {
  points: V3[]
  elements: React.RefObject<Array<HTMLElement | null>>
}) {
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, size }) => {
    points.forEach((p, i) => {
      const el = elements.current[i]
      if (!el) return
      v.set(p[0], p[1], p[2]).project(camera)
      const x = ((v.x + 1) / 2) * size.width
      const y = ((1 - v.y) / 2) * size.height
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      el.style.visibility = v.z < 1 ? 'visible' : 'hidden'
    })
  })
  return null
}
