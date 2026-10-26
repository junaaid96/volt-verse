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
    case 'chassis':
      return (
        <group>
          {/* 65 mm wheels with tread ribs */}
          {[-3.5, 3.5].map((wx) => (
            <group key={wx} position={[wx, 1.6, 0]}>
              <mesh rotation-z={Math.PI / 2}>
                <cylinderGeometry args={[1.6, 1.6, 0.8, 28]} />
                <meshStandardMaterial color="#17191d" roughness={0.9} />
              </mesh>
              <mesh rotation-z={Math.PI / 2} position={[wx > 0 ? 0.41 : -0.41, 0, 0]}>
                <cylinderGeometry args={[0.65, 0.65, 0.06, 20]} />
                <meshStandardMaterial color="#e8c81c" roughness={0.5} />
              </mesh>
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * Math.PI * 2
                return (
                  <mesh key={i} position={[0, Math.cos(a) * 1.58, Math.sin(a) * 1.58]} rotation-x={-a}>
                    <boxGeometry args={[0.82, 0.1, 0.3]} />
                    <meshStandardMaterial color="#23262b" roughness={0.9} />
                  </mesh>
                )
              })}
            </group>
          ))}
          {/* TT gear motors + shafts */}
          {[-2.3, 2.3].map((mx) => (
            <group key={mx} position={[mx, 1.7, 0]}>
              <mesh>
                <boxGeometry args={[1.6, 1.3, 2.2]} />
                <meshStandardMaterial color="#e8c81c" roughness={0.55} />
              </mesh>
              <mesh position={[0, 0, -1.7]} rotation-x={Math.PI / 2}>
                <cylinderGeometry args={[0.55, 0.55, 1.4, 16]} />
                <meshStandardMaterial color="#c8ccd0" metalness={0.85} roughness={0.35} />
              </mesh>
              <mesh position={[mx > 0 ? 1.1 : -1.1, -0.1, 0]} rotation-z={Math.PI / 2}>
                <cylinderGeometry args={[0.18, 0.18, 0.8, 10]} />
                <meshStandardMaterial color="#9aa0a6" metalness={0.9} roughness={0.3} />
              </mesh>
            </group>
          ))}
          {/* double-deck plates on brass standoffs */}
          <mesh position={[0, 2.45, 0]}>
            <boxGeometry args={[6.0, 0.15, 4.4]} />
            <meshStandardMaterial color="#17191d" roughness={0.5} />
          </mesh>
          {[[-2.6, -1.8], [2.6, -1.8], [-2.6, 1.8], [2.6, 1.8]].map(([sx, sz], i) => (
            <mesh key={i} position={[sx, 2.95, sz]}>
              <cylinderGeometry args={[0.12, 0.12, 1.0, 10]} />
              <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[0, 3.45, 0]}>
            <boxGeometry args={[6.0, 0.15, 4.4]} />
            <meshStandardMaterial color="#23262b" roughness={0.5} />
          </mesh>
          {/* caster ball */}
          <mesh position={[0, 1.5, 2.5]}>
            <boxGeometry args={[0.5, 1.6, 0.4]} />
            <meshStandardMaterial color="#9aa0a6" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.55, 2.85]}>
            <sphereGeometry args={[0.55, 16, 12]} />
            <meshStandardMaterial color="#e8ecf0" roughness={0.35} />
          </mesh>
        </group>
      )
    case 'l298n':
      return (
        <group>
          <mesh position={[0, 0.075, 0]}>
            <boxGeometry args={[4.3, 0.15, 4.3]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.55} />
          </mesh>
          <mesh position={[0, 1.2, -0.2]}>
            <boxGeometry args={[2.6, 2.1, 2.0]} />
            <meshStandardMaterial color="#c8ccd0" metalness={0.85} roughness={0.35} />
          </mesh>
          {[-0.8, -0.4, 0, 0.4, 0.8].map((fx) => (
            <mesh key={fx} position={[fx, 1.2, -0.2]}>
              <boxGeometry args={[0.08, 2.2, 2.1]} />
              <meshStandardMaterial color="#9aa0a6" metalness={0.85} roughness={0.4} />
            </mesh>
          ))}
          {[[-1.35, -1.55], [1.35, -1.55], [0, 1.55]].map(([tx, tz], i) => (
            <mesh key={i} position={[tx, 0.45, tz]}>
              <boxGeometry args={i < 2 ? [1.3, 0.6, 0.9] : [1.8, 0.6, 0.9]} />
              <meshStandardMaterial color="#1e5fb8" roughness={0.5} />
            </mesh>
          ))}
          {[-0.5, 0.5].map((jx) => (
            <mesh key={jx} position={[jx, 0.3, 1.0]}>
              <boxGeometry args={[0.25, 0.3, 0.25]} />
              <meshStandardMaterial color="#15171a" roughness={0.6} />
            </mesh>
          ))}
          <mesh position={[1.7, 0.25, 1.0]}>
            <boxGeometry args={[0.2, 0.1, 0.2]} />
            <meshStandardMaterial color="#e5484d" emissive="#e5484d" emissiveIntensity={1.4} />
          </mesh>
          <mesh position={[-1.7, 0.5, 1.0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.8, 14]} />
            <meshStandardMaterial color="#1a2a6b" roughness={0.45} />
          </mesh>
        </group>
      )
    case 'ir':
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[3.2, 0.12, 1.4]} />
            <meshStandardMaterial color="#15171a" roughness={0.55} />
          </mesh>
          <mesh position={[-0.6, 0.3, 0.3]}>
            <cylinderGeometry args={[0.26, 0.3, 0.35, 14]} />
            <meshStandardMaterial color="#e8ecf0" roughness={0.25} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0.6, 0.3, 0.3]}>
            <cylinderGeometry args={[0.26, 0.3, 0.35, 14]} />
            <meshStandardMaterial color="#7a1010" roughness={0.3} />
          </mesh>
          <mesh position={[1.15, 0.2, -0.35]}>
            <boxGeometry args={[0.45, 0.28, 0.45]} />
            <meshStandardMaterial color="#e8ecf0" roughness={0.5} />
          </mesh>
          <mesh position={[-1.15, 0.16, -0.35]}>
            <boxGeometry args={[0.18, 0.08, 0.18]} />
            <meshStandardMaterial color="#2fd35f" emissive="#2fd35f" emissiveIntensity={1.3} />
          </mesh>
          {[-0.25, 0, 0.25].map((px) => (
            <mesh key={px} position={[px, 0.25, -0.55]}>
              <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
              <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )
    case 'hc05':
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[2.8, 0.12, 1.5]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.55} />
          </mesh>
          <mesh position={[-0.3, 0.28, 0]}>
            <boxGeometry args={[1.5, 0.32, 1.0]} />
            <meshStandardMaterial color="#c8ccd0" metalness={0.85} roughness={0.35} />
          </mesh>
          <mesh position={[1.0, 0.25, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.25, 12]} />
            <meshStandardMaterial color="#15171a" roughness={0.5} />
          </mesh>
          <mesh position={[0.35, 0.18, 0.45]}>
            <boxGeometry args={[0.16, 0.08, 0.16]} />
            <meshStandardMaterial color="#2b6fe8" emissive="#2b6fe8" emissiveIntensity={1.6} />
          </mesh>
          {[-1.05, -0.63, -0.21, 0.21, 0.63, 1.05].map((px) => (
            <mesh key={px} position={[px, 0.22, -0.6]}>
              <cylinderGeometry args={[0.05, 0.05, 0.28, 8]} />
              <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )
    case 'mpu':
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[2.1, 0.12, 1.6]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.15, 0.1]}>
            <boxGeometry args={[0.55, 0.12, 0.55]} />
            <meshStandardMaterial color="#3a3f45" roughness={0.4} />
          </mesh>
          <mesh position={[0.7, 0.16, 0.45]}>
            <boxGeometry args={[0.16, 0.08, 0.16]} />
            <meshStandardMaterial color="#2fd35f" emissive="#2fd35f" emissiveIntensity={1.3} />
          </mesh>
          {[-0.9, -0.64, -0.38, -0.12, 0.14, 0.4, 0.66, 0.9].map((px) => (
            <mesh key={px} position={[px, 0.22, -0.62]}>
              <cylinderGeometry args={[0.045, 0.045, 0.28, 8]} />
              <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )
    case 'flame':
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[3.2, 0.12, 1.4]} />
            <meshStandardMaterial color="#a02323" roughness={0.55} />
          </mesh>
          <mesh position={[-0.6, 0.3, 0.3]}>
            <cylinderGeometry args={[0.26, 0.3, 0.35, 14]} />
            <meshStandardMaterial color="#101216" roughness={0.3} />
          </mesh>
          <mesh position={[0.6, 0.3, 0.3]}>
            <cylinderGeometry args={[0.26, 0.3, 0.35, 14]} />
            <meshStandardMaterial color="#3a2020" roughness={0.25} transparent opacity={0.9} />
          </mesh>
          <mesh position={[1.15, 0.2, -0.35]}>
            <boxGeometry args={[0.45, 0.28, 0.45]} />
            <meshStandardMaterial color="#e8ecf0" roughness={0.5} />
          </mesh>
          <mesh position={[-1.15, 0.16, -0.35]}>
            <boxGeometry args={[0.18, 0.08, 0.18]} />
            <meshStandardMaterial color="#e5484d" emissive="#e5484d" emissiveIntensity={1.4} />
          </mesh>
          {[-0.45, -0.15, 0.15, 0.45].map((px) => (
            <mesh key={px} position={[px, 0.25, -0.55]}>
              <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
              <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )
    case 'arm':
      // Scaled to hold the gripper inside the default frame.
      return (
        <group scale={0.85}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[1.5, 1.6, 0.4, 24]} />
            <meshStandardMaterial color="#23262b" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[1.0, 1.0, 0.7, 20]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[1.3, 1.5, 1.3]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
          </mesh>
          <mesh position={[0, 2.95, 0.36]} rotation-x={0.3}>
            <boxGeometry args={[0.55, 2.4, 1.0]} />
            <meshStandardMaterial color="#b9d2ea" roughness={0.4} />
          </mesh>
          <mesh position={[0, 4.09, 0.71]}>
            <boxGeometry args={[1.0, 1.0, 1.3]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
          </mesh>
          <mesh position={[0.52, 4.09, 0.71]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.32, 0.32, 0.1, 16]} />
            <meshStandardMaterial color="#f2f3f0" roughness={0.5} />
          </mesh>
          <mesh position={[0, 4.86, 1.18]} rotation-x={0.55}>
            <boxGeometry args={[0.45, 1.8, 0.8]} />
            <meshStandardMaterial color="#b9d2ea" roughness={0.4} />
          </mesh>
          <mesh position={[0, 5.62, 1.65]} rotation-x={0.55}>
            <cylinderGeometry args={[0.28, 0.28, 0.5, 14]} />
            <meshStandardMaterial color="#f2f3f0" roughness={0.5} />
          </mesh>
          <mesh position={[0, 5.85, 1.78]}>
            <boxGeometry args={[0.5, 0.25, 0.6]} />
            <meshStandardMaterial color="#23262b" roughness={0.5} />
          </mesh>
          <mesh position={[-0.25, 6.25, 1.86]} rotation-z={0.22}>
            <boxGeometry args={[0.12, 0.8, 0.35]} />
            <meshStandardMaterial color="#c8ccd0" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[0.25, 6.25, 1.86]} rotation-z={-0.22}>
            <boxGeometry args={[0.12, 0.8, 0.35]} />
            <meshStandardMaterial color="#c8ccd0" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      )
    case 'lcd':
      return (
        <group>
          <mesh position={[0, 0.075, 0]}>
            <boxGeometry args={[7.0, 0.15, 2.8]} />
            <meshStandardMaterial color="#17468f" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[6.6, 0.5, 2.2]} />
            <meshStandardMaterial color="#c8ccd0" metalness={0.85} roughness={0.35} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.66, 0]}>
            <planeGeometry args={[5.8, 1.6]} />
            <meshStandardMaterial color="#0a2540" emissive="#bfe3ff" emissiveIntensity={0.55} />
          </mesh>
          {[-0.42, 0.42].map((lz) => (
            <mesh key={lz} rotation-x={-Math.PI / 2} position={[0, 0.67, lz]}>
              <planeGeometry args={[5.0, 0.22]} />
              <meshStandardMaterial color="#dfeeff" emissive="#dfeeff" emissiveIntensity={0.5} />
            </mesh>
          ))}
          {[-0.45, -0.15, 0.15, 0.45].map((px) => (
            <mesh key={px} position={[px, 0.3, -1.25]}>
              <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
              <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )
    case 'dht':
      return (
        <group>
          <mesh position={[0, 0.26, 0.1]}>
            <boxGeometry args={[1.6, 0.45, 1.0]} />
            <meshStandardMaterial color="#f2f3f0" roughness={0.5} />
          </mesh>
          {[-0.3, 0, 0.3].map((vz) => (
            <mesh key={vz} position={[0, 0.5, vz + 0.1]}>
              <boxGeometry args={[1.2, 0.03, 0.12]} />
              <meshStandardMaterial color="#9aa0a6" roughness={0.6} />
            </mesh>
          ))}
          {[-0.45, -0.15, 0.15, 0.45].map((px) => (
            <mesh key={px} position={[px, 0.2, -0.45]}>
              <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
              <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )
    case 'rain':
      return (
        <group>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[5.4, 0.12, 4.0]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.55} />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} position={[0, 0.13, -1.75 + i * 0.5]}>
              <boxGeometry args={[5.0, 0.03, 0.15]} />
              <meshStandardMaterial color="#c8ccd0" metalness={0.85} roughness={0.35} />
            </mesh>
          ))}
          {[-2.4, 2.4].map((bx) => (
            <mesh key={bx} position={[bx, 0.13, 0]}>
              <boxGeometry args={[0.15, 0.03, 3.6]} />
              <meshStandardMaterial color="#c8ccd0" metalness={0.85} roughness={0.35} />
            </mesh>
          ))}
          <mesh position={[1.8, 0.25, -1.6]}>
            <boxGeometry args={[0.9, 0.35, 0.5]} />
            <meshStandardMaterial color="#f2f3f0" roughness={0.6} />
          </mesh>
          {[-2.0, -1.7].map((px) => (
            <mesh key={px} position={[px, 0.22, -1.7]}>
              <cylinderGeometry args={[0.05, 0.05, 0.28, 8]} />
              <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )
    case 'solenoid':
      return (
        <group>
          <mesh position={[0, 0.075, 0]}>
            <boxGeometry args={[3.0, 0.15, 2.8]} />
            <meshStandardMaterial color="#23262b" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[2.0, 1.5, 1.7]} />
            <meshStandardMaterial color="#9aa0a6" metalness={0.85} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.9, 1.3]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.32, 0.32, 1.4, 16]} />
            <meshStandardMaterial color="#d5d9dd" metalness={1} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.9, 0.7]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.42, 0.42, 0.2, 16]} />
            <meshStandardMaterial color="#5a6068" metalness={0.85} roughness={0.4} />
          </mesh>
          {[[-0.25, '#c0392b'], [0.25, '#15171a']].map(([wx, col], i) => (
            <mesh key={i} position={[wx as number, 1.85, -0.5]} rotation-x={0.5}>
              <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
              <meshStandardMaterial color={col as string} roughness={0.5} />
            </mesh>
          ))}
          {[[-1.3, -1.2], [1.3, -1.2], [-1.3, 1.2], [1.3, 1.2]].map(([sx, sz], i) => (
            <mesh key={i} position={[sx, 0.18, sz]}>
              <cylinderGeometry args={[0.12, 0.12, 0.08, 10]} />
              <meshStandardMaterial color="#0c0e10" roughness={0.7} />
            </mesh>
          ))}
        </group>
      )
    case 'solar':
      return (
        <group position={[0, 0.9, 0]} rotation-x={0.3}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[7.0, 0.2, 5.0]} />
            <meshStandardMaterial color="#c8ccd0" metalness={0.7} roughness={0.4} />
          </mesh>
          {[-2.25, 0, 2.25].map((cx) =>
            [-1.2, 1.2].map((cz) => (
              <mesh key={`${cx}${cz}`} position={[cx, 0.12, cz]}>
                <boxGeometry args={[2.1, 0.04, 2.2]} />
                <meshStandardMaterial color="#12336b" metalness={0.4} roughness={0.35} />
              </mesh>
            )),
          )}
          {[-1.2, 1.2].map((bz) => (
            <mesh key={bz} position={[0, 0.14, bz]}>
              <boxGeometry args={[6.6, 0.03, 0.1]} />
              <meshStandardMaterial color="#e8ecf0" metalness={0.8} roughness={0.35} />
            </mesh>
          ))}
          <mesh position={[0, -0.25, -1.5]}>
            <boxGeometry args={[1.6, 0.3, 1.0]} />
            <meshStandardMaterial color="#15171a" roughness={0.6} />
          </mesh>
        </group>
      )
    case 'pump':
      return (
        <group>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[3.0, 0.3, 2.4]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.55} />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <boxGeometry args={[3.2, 2.0, 2.6]} />
            <meshStandardMaterial color="#eef2f6" roughness={0.45} />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <boxGeometry args={[3.25, 0.35, 2.65]} />
            <meshStandardMaterial color="#1e5fb8" roughness={0.5} />
          </mesh>
          <mesh position={[0.7, 2.5, 0]}>
            <cylinderGeometry args={[0.42, 0.5, 0.9, 16]} />
            <meshStandardMaterial color="#1e5fb8" roughness={0.5} />
          </mesh>
          <mesh position={[0.7, 2.96, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.04, 16]} />
            <meshStandardMaterial color="#0c0e10" roughness={0.8} />
          </mesh>
          <mesh position={[-0.9, 2.4, -0.8]} rotation-x={-0.4}>
            <cylinderGeometry args={[0.07, 0.07, 1.0, 8]} />
            <meshStandardMaterial color="#15171a" roughness={0.6} />
          </mesh>
          {[[-1.3, -1.0], [1.3, -1.0], [-1.3, 1.0], [1.3, 1.0]].map(([fx, fz], i) => (
            <mesh key={i} position={[fx, 0.06, fz]}>
              <cylinderGeometry args={[0.18, 0.22, 0.12, 10]} />
              <meshStandardMaterial color="#15171a" roughness={0.7} />
            </mesh>
          ))}
        </group>
      )
    case 'lamp':
      return (
        <group>
          <mesh position={[-0.6, 0.075, -0.3]}>
            <boxGeometry args={[1.2, 0.15, 1.2]} />
            <meshStandardMaterial color="#23262b" roughness={0.55} />
          </mesh>
          <mesh position={[-0.6, 2.2, -0.3]}>
            <cylinderGeometry args={[0.15, 0.18, 4.2, 12]} />
            <meshStandardMaterial color="#23262b" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0.0, 4.2, -0.3]}>
            <boxGeometry args={[1.4, 0.15, 0.15]} />
            <meshStandardMaterial color="#23262b" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0.5, 4.1, -0.3]}>
            <boxGeometry args={[0.9, 0.25, 0.5]} />
            <meshStandardMaterial color="#17191d" roughness={0.5} />
          </mesh>
          <mesh position={[0.5, 3.95, -0.3]}>
            <boxGeometry args={[0.5, 0.12, 0.3]} />
            <meshStandardMaterial color="#ffd84d" emissive="#ffd84d" emissiveIntensity={1.8} />
          </mesh>
          <mesh position={[0.5, 2.8, -0.3]}>
            <cylinderGeometry args={[0.25, 0.8, 2.2, 16, 1, true]} />
            <meshStandardMaterial
              color="#ffd84d"
              emissive="#ffd84d"
              emissiveIntensity={0.35}
              transparent
              opacity={0.1}
              depthWrite={false}
              side={2}
            />
          </mesh>
        </group>
      )
    case 'tank':
      return (
        <group>
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[2.0, 1.6, 2.6, 24]} />
            <meshStandardMaterial color="#17468f" roughness={0.5} />
          </mesh>
          <mesh position={[0, 2.62, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[1.95, 0.12, 10, 28]} />
            <meshStandardMaterial color="#1e5fb8" roughness={0.5} />
          </mesh>
          <mesh position={[0, 2.2, 0]}>
            <cylinderGeometry args={[1.85, 1.85, 0.1, 24]} />
            <meshStandardMaterial color="#4aa8e0" roughness={0.15} metalness={0.1} />
          </mesh>
          <mesh position={[0, 2.78, 0]}>
            <boxGeometry args={[4.0, 0.15, 0.5]} />
            <meshStandardMaterial color="#9aa0a6" metalness={0.7} roughness={0.4} />
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
  labels,
  elements,
  order,
}: {
  points: V3[]
  labels: string[]
  elements: React.RefObject<Array<HTMLElement | null>>
  /** Display priority: indices placed first win collisions. */
  order: number[]
}) {
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, size }) => {
    // Greedy declutter: place chips in priority order and hide any chip whose
    // box would overlap an already-placed one, so labels never stack into an
    // unreadable band over the hardware.
    const placed: Array<{ x0: number; y0: number; x1: number; y1: number }> = []
    const overlaps = (a: (typeof placed)[number], b: (typeof placed)[number], pad: number) =>
      a.x0 < b.x1 + pad && a.x1 + pad > b.x0 && a.y0 < b.y1 + pad && a.y1 + pad > b.y0
    order.forEach((i) => {
      const el = elements.current[i]
      if (!el) return
      const p = points[i]
      v.set(p[0], p[1], p[2]).project(camera)
      const x = ((v.x + 1) / 2) * size.width
      const y = ((1 - v.y) / 2) * size.height
      // Longest chip is ~190px; flip it left of the dot near the right edge.
      const flipped = x > size.width - 200
      const w = 22 + labels[i].length * 7.8
      const box = { x0: flipped ? x - w : x, y0: y - 13, x1: flipped ? x : x + w, y1: y + 13 }
      // The anchor dot stays on screen; the flip keeps the text inside.
      const onScreen = v.z < 1 && x > -4 && x < size.width + 4 && y > -14 && y < size.height + 14
      const blocked = placed.some((r) => overlaps(r, box, 5))
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      el.style.visibility = onScreen && !blocked ? 'visible' : 'hidden'
      el.firstElementChild?.classList.toggle('hotspot-flip', flipped)
      if (onScreen && !blocked) placed.push(box)
    })
  })
  return null
}
