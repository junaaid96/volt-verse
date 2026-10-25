import * as THREE from 'three'
import type { CameraControlsImpl } from '@react-three/drei'
import type { CameraHome } from './layout'

const dir = new THREE.Vector3()

/**
 * Move the camera to the bench's home pose, with the distance fitted so the
 * whole bench is visible at the canvas's current aspect ratio.
 * `zoomOutFactor` > 1 starts the camera further back (used for the fly-in).
 */
export function lookHome(
  c: CameraControlsImpl,
  home: CameraHome,
  animate: boolean,
  zoomOutFactor = 1,
): Promise<void> {
  const [tx, ty, tz] = home.target
  const dist = c.getDistanceToFitSphere(home.radius) * zoomOutFactor
  dir.set(...home.direction).normalize().multiplyScalar(dist)
  return c.setLookAt(tx + dir.x, ty + dir.y, tz + dir.z, tx, ty, tz, animate)
}
