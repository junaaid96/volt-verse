import { useMemo } from 'react'
import * as THREE from 'three'
import { mcuTopTexture, unoTopTexture } from './textures'

/**
 * Realistic procedural boards (1 unit = 1 cm). Silkscreen comes from the
 * canvas textures; every label position here must match textures.ts.
 */

export const PCB_TOP = 0.18

// Rounded-rect PCB blanks, shared across mounts.
const extrudeCache = new Map<string, THREE.ExtrudeGeometry>()

function pcbGeometry(w: number, h: number, r = 0.2): THREE.ExtrudeGeometry {
  const key = `${w}x${h}x${r}`
  const hit = extrudeCache.get(key)
  if (hit) return hit
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0)
  s.lineTo(x + w, y + h - r)
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2)
  s.lineTo(x + r, y + h)
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI)
  s.lineTo(x, y + r)
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.16,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 1,
    curveSegments: 10,
  })
  extrudeCache.set(key, geo)
  return geo
}

// Solder mask is a thin glossy lacquer over FR4: rough base + clearcoat.
const solderMask = { roughness: 0.6, clearcoat: 0.7, clearcoatRoughness: 0.28 } as const

function Pcb({ w, h, color }: { w: number; h: number; color: string }) {
  const geo = useMemo(() => pcbGeometry(w, h), [w, h])
  return (
    <mesh geometry={geo} rotation-x={-Math.PI / 2}>
      <meshPhysicalMaterial color={color} {...solderMask} />
    </mesh>
  )
}

function Silk({ w, h, map }: { w: number; h: number; map: THREE.Texture }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, PCB_TOP + 0.006, 0]}>
      <planeGeometry args={[w, h]} />
      <meshPhysicalMaterial map={map} {...solderMask} />
    </mesh>
  )
}

const PITCH = 0.254

function HeaderStrip({
  x0,
  n,
  z,
  h = 0.85,
  gold = false,
}: {
  x0: number
  n: number
  z: number
  h?: number
  gold?: boolean
}) {
  const len = n * PITCH + 0.12
  const cx = x0 + (n * PITCH) / 2
  return (
    <group>
      <mesh position={[cx, PCB_TOP + h / 2, z]}>
        <boxGeometry args={[len, h, 0.3]} />
        <meshStandardMaterial color="#15171a" roughness={0.6} />
      </mesh>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={[x0 + 0.127 + i * PITCH, PCB_TOP + h + 0.005, z]}>
          <boxGeometry args={[0.13, 0.03, 0.15]} />
          {gold ? (
            <meshStandardMaterial {...goldMat} />
          ) : (
            <meshStandardMaterial color="#050505" roughness={0.9} />
          )}
        </mesh>
      ))}
    </group>
  )
}

const silver = { color: '#d5d9dd', roughness: 0.26, metalness: 1 } as const
const goldMat = { color: '#e0b34a', roughness: 0.24, metalness: 1 } as const
const blackPlastic = { color: '#17191d', roughness: 0.5 } as const

/** USB-B cable leaving the Uno's port and draping off the bench. */
function UsbCable() {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        [-4.2, PCB_TOP + 0.425, -1.55],
        [-5.2, PCB_TOP + 0.4, -1.6],
        [-6.2, 0.25, -2.4],
        [-7.4, 0.12, -4.2],
        [-8.6, 0.12, -6.8],
      ].map((p) => new THREE.Vector3(...(p as [number, number, number]))),
    )
    return new THREE.TubeGeometry(curve, 64, 0.16, 12)
  }, [])
  return (
    <group>
      <mesh position={[-3.85, PCB_TOP + 0.425, -1.55]}>
        <boxGeometry args={[0.7, 0.7, 0.95]} />
        <meshStandardMaterial color="#2a2d31" roughness={0.5} />
      </mesh>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color="#2a2d31" roughness={0.45} clearcoat={0.3} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Arduino Uno R3 (6.86 x 5.34)
// ---------------------------------------------------------------------------

export function ArduinoUno() {
  const map = useMemo(() => unoTopTexture(), [])
  return (
    <group>
      <Pcb w={6.86} h={5.34} color="#00979d" />
      <Silk w={6.86} h={5.34} map={map} />

      <HeaderStrip x0={-2.6} n={10} z={-2.25} />
      <HeaderStrip x0={0.04} n={8} z={-2.25} />
      <HeaderStrip x0={-2.6} n={8} z={2.25} />
      <HeaderStrip x0={-0.57} n={6} z={2.25} />

      {/* ATmega328P + socket */}
      <mesh position={[0.7, PCB_TOP + 0.125, 0.1]}>
        <boxGeometry args={[3.7, 0.25, 1.0]} />
        <meshStandardMaterial {...blackPlastic} />
      </mesh>
      <mesh position={[0.7, PCB_TOP + 0.25 + 0.2, 0.1]}>
        <boxGeometry args={[3.5, 0.4, 0.76]} />
        <meshStandardMaterial color="#23262b" roughness={0.5} />
      </mesh>
      <mesh position={[-0.85, PCB_TOP + 0.66, 0.1]}>
        <cylinderGeometry args={[0.07, 0.07, 0.03, 12]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.6} />
      </mesh>

      {/* USB-B */}
      <mesh position={[-2.85, PCB_TOP + 0.425, -1.55]}>
        <boxGeometry args={[1.3, 0.85, 1.15]} />
        <meshStandardMaterial {...silver} />
      </mesh>
      <UsbCable />
      {/* ATmega16U2 serial converter */}
      <mesh position={[-1.55, PCB_TOP + 0.06, -0.85]}>
        <boxGeometry args={[0.7, 0.12, 0.7]} />
        <meshStandardMaterial color="#101216" roughness={0.45} />
      </mesh>
      {/* 500mA polyfuse */}
      <mesh position={[-2.5, PCB_TOP + 0.14, -0.85]}>
        <boxGeometry args={[0.4, 0.28, 0.3]} />
        <meshStandardMaterial color="#d8b93a" roughness={0.5} />
      </mesh>

      {/* Barrel jack */}
      <mesh position={[-2.7, PCB_TOP + 0.45, 1.55]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.45, 0.45, 1.1, 20]} />
        <meshStandardMaterial {...blackPlastic} />
      </mesh>
      <mesh position={[-3.26, PCB_TOP + 0.45, 1.55]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.2, 0.2, 0.06, 16]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>

      {/* Crystal, reset, regulator, diode */}
      <mesh position={[0.7, PCB_TOP + 0.125, -1.0]}>
        <boxGeometry args={[0.5, 0.25, 0.4]} />
        <meshStandardMaterial {...silver} />
      </mesh>
      <mesh position={[-1.95, PCB_TOP + 0.1, -1.55]}>
        <boxGeometry args={[0.62, 0.2, 0.62]} />
        <meshStandardMaterial color="#9aa0a6" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[-1.95, PCB_TOP + 0.26, -1.55]}>
        <boxGeometry args={[0.34, 0.14, 0.34]} />
        <meshStandardMaterial color="#d8dcde" roughness={0.5} />
      </mesh>
      <mesh position={[-2.9, PCB_TOP + 0.14, -0.15]}>
        <boxGeometry args={[0.7, 0.28, 1.0]} />
        <meshStandardMaterial {...blackPlastic} />
      </mesh>
      <mesh position={[-1.3, PCB_TOP + 0.1, 0.9]}>
        <boxGeometry args={[0.4, 0.2, 0.25]} />
        <meshStandardMaterial {...blackPlastic} />
      </mesh>

      {/* Electrolytic caps */}
      {[
        [-2.2, 0.5],
        [-2.2, -0.4],
      ].map(([cx, cz], i) => (
        <group key={i} position={[cx, 0, cz]}>
          <mesh position={[0, PCB_TOP + 0.325, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.65, 16]} />
            <meshStandardMaterial color="#1a2a6b" roughness={0.45} />
          </mesh>
          <mesh position={[0, PCB_TOP + 0.66, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.05, 16]} />
            <meshStandardMaterial {...silver} />
          </mesh>
        </group>
      ))}

      {/* ICSP 2x3 */}
      <mesh position={[2.55, PCB_TOP + 0.14, -0.95]}>
        <boxGeometry args={[0.85, 0.28, 0.6]} />
        <meshStandardMaterial {...blackPlastic} />
      </mesh>
      {[-0.254, 0, 0.254].map((dx) =>
        [-0.127, 0.127].map((dz, j) => (
          <mesh key={`${dx}${j}`} position={[2.55 + dx, PCB_TOP + 0.4, -0.95 + dz]}>
            <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
            <meshStandardMaterial {...goldMat} />
          </mesh>
        )),
      )}

      {/* LEDs: ON + L by the headers, TX/RX by the 16U2 */}
      {[
        [1.1, 2.02, '#2fd35f', 1.4],
        [1.5, 2.02, '#e8c81c', 1.4],
        [-1.05, -0.62, '#e8c81c', 1.0],
        [-1.05, -0.88, '#e8c81c', 1.0],
      ].map(([lx, lz, col, glow], i) => (
        <mesh key={i} position={[lx as number, PCB_TOP + 0.07, lz as number]}>
          <boxGeometry args={[0.32, 0.14, 0.18]} />
          <meshStandardMaterial
            color={col as string}
            emissive={col as string}
            emissiveIntensity={glow as number}
          />
        </mesh>
      ))}

      {/* Mounting holes */}
      {[
        [-2.9, -2.15],
        [2.9, -2.15],
        [-2.9, 2.15],
        [2.9, 2.15],
      ].map(([hx, hz], i) => (
        <group key={i} position={[hx, PCB_TOP, hz]}>
          <mesh rotation-x={-Math.PI / 2}>
            <torusGeometry args={[0.16, 0.05, 10, 20]} />
            <meshStandardMaterial {...silver} />
          </mesh>
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.2, 14]} />
            <meshStandardMaterial color="#0c0e10" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// ESP32 DevKit / NodeMCU
// ---------------------------------------------------------------------------

interface McuLayout {
  w: number
  h: number
  bg: string
  title: string
  canX: number
  left: string[]
  right: string[]
  usbX: number
  btnX: number
  ledPos: [number, number]
  ledColor: string
  btnLabels: [string, string]
  x0: number
  stripZ: number
}

const ESP32_LAYOUT: McuLayout = {
  w: 5.2,
  h: 2.8,
  bg: '#14161a',
  title: 'ESP32 DEVKIT',
  canX: -1.55,
  left: ['3V3', 'EN', 'VP', 'VN', 'D34', 'D35', 'D32', 'D33', 'D25', 'D26', 'D27', 'D14', 'D12', 'GND', 'VIN'],
  right: ['D23', 'D22', 'D21', 'D19', 'D18', 'D5', 'TX2', 'RX2', 'D4', 'D2', 'D15', 'GND', 'CLK', '3V3', '5V'],
  usbX: 2.3,
  btnX: 1.45,
  ledPos: [0.3, -0.6],
  ledColor: '#e5484d',
  btnLabels: ['EN', 'BOOT'],
  x0: -2.1,
  stripZ: 1.2,
}

const NODEMCU_LAYOUT: McuLayout = {
  w: 4.9,
  h: 2.6,
  bg: '#17468f',
  title: 'NodeMCU',
  canX: -1.4,
  left: ['A0', 'GND', 'VU', 'S3', 'S2', 'S1', 'SC', 'S0', 'SK', 'GND', '3V3', 'EN', 'RST', 'GND', 'VIN'],
  right: ['D0', 'D1', 'D2', 'D3', 'D4', '3V3', 'GND', 'D5', 'D6', 'D7', 'D8', 'RX', 'TX', 'GND', 'VIN'],
  usbX: 2.1,
  btnX: 1.3,
  ledPos: [0.2, -0.62],
  ledColor: '#2b6fe8',
  btnLabels: ['RST', 'FLASH'],
  x0: -1.95,
  stripZ: 1.05,
}

function McuBoard({ layout, texKey }: { layout: McuLayout; texKey: string }) {
  const map = useMemo(
    () =>
      mcuTopTexture(texKey, layout.w, layout.h, {
        bg: layout.bg,
        strips: [
          { x0: layout.x0, n: 15, z: layout.stripZ, labelZ: layout.stripZ - 0.35, labels: layout.left },
          { x0: layout.x0, n: 15, z: -layout.stripZ, labelZ: -layout.stripZ + 0.35, labels: layout.right },
        ],
        texts: [
          { x: 0.4, z: 0, size: 30, text: layout.title },
          { x: layout.btnX, z: 0.18, size: 16, text: layout.btnLabels[0] },
          { x: layout.btnX, z: -0.18, size: 16, text: layout.btnLabels[1] },
        ],
      }),
    [texKey, layout],
  )
  return (
    <group>
      <Pcb w={layout.w} h={layout.h} color={layout.bg} />
      <Silk w={layout.w} h={layout.h} map={map} />

      <HeaderStrip x0={layout.x0} n={15} z={layout.stripZ} h={0.6} gold />
      <HeaderStrip x0={layout.x0} n={15} z={-layout.stripZ} h={0.6} gold />

      {/* RF shield can */}
      <mesh position={[layout.canX, PCB_TOP + 0.15, 0]}>
        <boxGeometry args={[1.9, 0.3, layout.h - 0.3]} />
        <meshStandardMaterial {...silver} />
      </mesh>

      {/* micro-USB */}
      <mesh position={[layout.usbX, PCB_TOP + 0.16, 0]}>
        <boxGeometry args={[0.8, 0.32, 0.6]} />
        <meshStandardMaterial {...silver} />
      </mesh>
      <mesh position={[layout.usbX + 0.41, PCB_TOP + 0.16, 0]}>
        <boxGeometry args={[0.04, 0.18, 0.4]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.8} />
      </mesh>

      {/* EN + BOOT buttons */}
      {[0.55, -0.55].map((bz, i) => (
        <mesh key={i} position={[layout.btnX, PCB_TOP + 0.12, bz]}>
          <boxGeometry args={[0.45, 0.25, 0.35]} />
          <meshStandardMaterial {...blackPlastic} />
        </mesh>
      ))}

      {/* power LED + decoupling caps */}
      <mesh position={[layout.ledPos[0], PCB_TOP + 0.06, layout.ledPos[1]]}>
        <boxGeometry args={[0.3, 0.12, 0.18]} />
        <meshStandardMaterial
          color={layout.ledColor}
          emissive={layout.ledColor}
          emissiveIntensity={1.2}
        />
      </mesh>
      {[
        [-0.3, 0.7],
        [-0.3, -0.7],
      ].map(([cx, cz], i) => (
        <mesh key={i} position={[cx, PCB_TOP + 0.12, cz]}>
          <cylinderGeometry args={[0.12, 0.12, 0.25, 12]} />
          <meshStandardMaterial {...silver} />
        </mesh>
      ))}
    </group>
  )
}

export function Esp32Dev() {
  return <McuBoard layout={ESP32_LAYOUT} texKey="esp32" />
}

export function NodeMcu() {
  return <McuBoard layout={NODEMCU_LAYOUT} texKey="nodemcu" />
}

// ---------------------------------------------------------------------------
// ESP32-CAM (4.0 x 2.5)
// ---------------------------------------------------------------------------

export function Esp32Cam() {
  const map = useMemo(
    () =>
      mcuTopTexture('esp32cam', 4.0, 2.7, {
        bg: '#14161a',
        strips: [
          {
            x0: -1.4, n: 8, z: 1.0, labelZ: 0.68,
            labels: ['5V', 'GND', '14', '13', '15', '2', '4', 'GND'],
          },
        ],
        texts: [
          { x: -0.6, z: 0.42, size: 26, text: 'ESP32-CAM' },
          { x: 0.9, z: 0.42, size: 15, text: 'AI', bold: false },
        ],
      }),
    [],
  )
  return (
    <group>
      <Pcb w={4.0} h={2.7} color="#14161a" />
      <Silk w={4.0} h={2.7} map={map} />

      {/* pin holes row */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[-1.4 + 0.127 + i * PITCH, PCB_TOP + 0.01, 1.0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.05, 12]} />
          <meshStandardMaterial {...goldMat} />
        </mesh>
      ))}

      {/* camera module */}
      <mesh position={[-1.2, PCB_TOP + 0.11, -0.4]}>
        <boxGeometry args={[0.95, 0.22, 0.95]} />
        <meshStandardMaterial {...silver} />
      </mesh>
      <mesh position={[-1.2, PCB_TOP + 0.36, -0.4]}>
        <cylinderGeometry args={[0.3, 0.32, 0.28, 20]} />
        <meshStandardMaterial color="#101216" roughness={0.4} />
      </mesh>
      <mesh position={[-1.2, PCB_TOP + 0.51, -0.4]}>
        <cylinderGeometry args={[0.2, 0.2, 0.03, 20]} />
        <meshStandardMaterial color="#0a2a4f" roughness={0.05} metalness={0.6} />
      </mesh>

      {/* RF can + flash + status LEDs */}
      <mesh position={[0.9, PCB_TOP + 0.14, -0.5]}>
        <boxGeometry args={[1.6, 0.28, 1.2]} />
        <meshStandardMaterial {...silver} />
      </mesh>
      <mesh position={[0.2, PCB_TOP + 0.06, 0.5]}>
        <boxGeometry args={[0.35, 0.12, 0.35]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[1.2, PCB_TOP + 0.06, 0.75]}>
        <boxGeometry args={[0.25, 0.12, 0.15]} />
        <meshStandardMaterial color="#e5484d" emissive="#e5484d" emissiveIntensity={1.1} />
      </mesh>
    </group>
  )
}
