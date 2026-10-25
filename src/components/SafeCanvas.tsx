import { Component, Suspense, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'

function SceneFallback({ label }: { label: string }) {
  return (
    <div className="labgrid flex h-full w-full items-center justify-center rounded-xl" role="img" aria-label={label}>
      <svg width="120" height="80" viewBox="0 0 120 80" aria-hidden="true" className="opacity-60">
        <circle cx="60" cy="40" r="10" fill="none" stroke="#1e7a46" strokeWidth="2" />
        <circle cx="20" cy="15" r="5" fill="#b7791f" />
        <circle cx="100" cy="15" r="5" fill="#2470b7" />
        <circle cx="20" cy="65" r="5" fill="#2470b7" />
        <circle cx="100" cy="65" r="5" fill="#b7791f" />
        <path d="M25 18 52 34M95 18 68 34M25 62 52 46M95 62 68 46" stroke="#1e7a46" strokeWidth="1.5" />
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

export function SafeCanvas({
  children,
  label,
  camera = { position: [0, 0.6, 7], fov: 45 },
}: {
  children: ReactNode
  label: string
  camera?: { position: [number, number, number]; fov: number }
}) {
  return (
    <SceneErrorBoundary label={label}>
      <Suspense fallback={<SceneFallback label={label} />}>
        <Canvas
          dpr={[1, 1.75]}
          camera={camera}
          shadows
          gl={{ antialias: true, alpha: true }}
          aria-label={label}
        >
          {children}
        </Canvas>
      </Suspense>
    </SceneErrorBoundary>
  )
}
