import { useEffect, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { lookHome } from './cameraPose'
import type { CameraHome } from './layout'

const IDLE_RESUME_MS = 3500
const AUTO_ROTATE_SPEED = 0.12 // rad/s
const { ACTION } = CameraControlsImpl

/**
 * Damped orbit camera. Flies in on mount (or when the bench changes), refits on
 * resize, and slowly turntables while idle. `lastInputRef` holds the time of the
 * last user or dock interaction; the turntable waits until things have been idle
 * for a moment so it never snaps an in-flight camera transition.
 *
 * Inline, the wheel and one-finger swipes are left to the page so the canvas never
 * traps scrolling; two fingers orbit/zoom. Full screen gets every gesture.
 */
export function CameraRig({
  controlsRef,
  lastInputRef,
  home,
  autoRotate,
  animate,
  expanded,
}: {
  controlsRef: RefObject<CameraControlsImpl | null>
  lastInputRef: RefObject<number>
  home: CameraHome
  autoRotate: boolean
  animate: boolean
  expanded: boolean
}) {
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height))

  useEffect(() => {
    const c = controlsRef.current
    if (!c) return
    lastInputRef.current = performance.now()
    if (animate) void lookHome(c, home, false, 1.6)
    void lookHome(c, home, animate)
  }, [controlsRef, lastInputRef, home, animate])

  // Keep the bench framed when the stage changes shape (resize / full screen).
  // Skips the first run so it never cancels the fly-in above.
  const prevAspect = useRef(aspect)
  useEffect(() => {
    const c = controlsRef.current
    if (!c || prevAspect.current === aspect) return
    prevAspect.current = aspect
    void c.dollyTo(c.getDistanceToFitSphere(home.radius), true)
  }, [controlsRef, home, aspect])

  useEffect(() => {
    const c = controlsRef.current
    if (!c) return
    c.mouseButtons.wheel = expanded ? ACTION.DOLLY : ACTION.NONE
    c.touches.one = expanded ? ACTION.TOUCH_ROTATE : ACTION.NONE
    c.touches.two = ACTION.TOUCH_DOLLY_ROTATE
  }, [controlsRef, expanded])

  useFrame((_, delta) => {
    const c = controlsRef.current
    if (!c || !autoRotate) return
    if (performance.now() - lastInputRef.current < IDLE_RESUME_MS) return
    void c.rotate(delta * AUTO_ROTATE_SPEED, 0, false)
  })

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      smoothTime={0.35}
      minDistance={4}
      maxDistance={34}
      minPolarAngle={0.15}
      maxPolarAngle={1.38}
      onControlStart={() => {
        lastInputRef.current = Number.POSITIVE_INFINITY
      }}
      onControlEnd={() => {
        lastInputRef.current = performance.now()
      }}
    />
  )
}
