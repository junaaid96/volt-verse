import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

function SceneFallback({ label }: { label: string }) {
  return (
    <div className="labgrid flex h-full w-full items-center justify-center rounded-xl" role="img" aria-label={label}>
      <svg width="120" height="80" viewBox="0 0 120 80" aria-hidden="true" className="opacity-60">
        <circle cx="60" cy="40" r="10" fill="none" strokeWidth="2" className="stroke-leaf" />
        <circle cx="20" cy="15" r="5" className="fill-amber" />
        <circle cx="100" cy="15" r="5" className="fill-signal" />
        <circle cx="20" cy="65" r="5" className="fill-signal" />
        <circle cx="100" cy="65" r="5" className="fill-amber" />
        <path d="M25 18 52 34M95 18 68 34M25 62 52 46M95 62 68 46" strokeWidth="1.5" className="stroke-leaf" />
      </svg>
    </div>
  )
}

class SceneErrorBoundary extends Component<{ children: ReactNode; label: string }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return <SceneFallback label={this.props.label} />
    return this.props.children
  }
}

/** Stop the render loop while the canvas is scrolled out of view (saves GPU + battery). */
function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '120px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, inView }
}

export function SafeCanvas({
  children,
  label,
  dpr = [1, 1.75],
  camera = { position: [0, 0.6, 7], fov: 45 },
}: {
  children: ReactNode
  label: string
  dpr?: number | [number, number]
  camera?: { position: [number, number, number]; fov: number }
}) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const [ready, setReady] = useState(false)
  return (
    <SceneErrorBoundary label={label}>
      <div ref={ref} className="relative h-full w-full">
        {!ready && (
          <div className="labgrid absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <span className="bench-loading">Assembling the bench</span>
          </div>
        )}
        <Suspense fallback={<SceneFallback label={label} />}>
          <Canvas
            dpr={dpr}
            camera={camera}
            shadows="percentage"
            frameloop={inView ? 'always' : 'never'}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.NeutralToneMapping
              requestAnimationFrame(() => setReady(true))
            }}
            aria-label={label}
            role="img"
            className={`transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
          >
            {children}
          </Canvas>
        </Suspense>
      </div>
    </SceneErrorBoundary>
  )
}
