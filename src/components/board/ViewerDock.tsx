import type { ReactNode } from 'react'
import {
  Focus,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Tags,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

export type DockAction = 'rotateLeft' | 'rotateRight' | 'zoomIn' | 'zoomOut' | 'reset'

export interface DockToggles {
  labels: boolean
  flow: boolean
  spin: boolean
  fullscreen: boolean
}

function DockButton({
  label,
  onClick,
  pressed,
  className = '',
  children,
}: {
  label: string
  onClick: () => void
  pressed?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={`dock-btn ${pressed ? 'dock-btn-on' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

const Divider = () => <span className="mx-0.5 h-5 w-px bg-line dark:bg-edge" aria-hidden="true" />

export function ViewerDock({
  toggles,
  onAction,
  onToggle,
}: {
  toggles: DockToggles
  onAction: (a: DockAction) => void
  onToggle: (t: keyof DockToggles) => void
}) {
  const icon = 'h-[18px] w-[18px]'
  return (
    <div
      role="toolbar"
      aria-label="3D view controls"
      className="print-hide absolute inset-x-0 bottom-3 z-30 mx-auto flex w-max max-w-[calc(100%-1.5rem)] items-center gap-0.5 rounded-2xl border border-line/80 bg-card/85 p-1 shadow-[0_8px_30px_-12px_rgba(20,40,28,0.35)] backdrop-blur-md dark:border-edge dark:bg-moss/85"
    >
      <DockButton label="Turn left" onClick={() => onAction('rotateLeft')} className="max-sm:hidden">
        <RotateCcw className={icon} />
      </DockButton>
      <DockButton label="Turn right" onClick={() => onAction('rotateRight')} className="max-sm:hidden">
        <RotateCw className={icon} />
      </DockButton>
      <Divider />
      <DockButton label="Zoom out" onClick={() => onAction('zoomOut')}>
        <ZoomOut className={icon} />
      </DockButton>
      <DockButton label="Zoom in" onClick={() => onAction('zoomIn')}>
        <ZoomIn className={icon} />
      </DockButton>
      <DockButton label="Reset view" onClick={() => onAction('reset')}>
        <Focus className={icon} />
      </DockButton>
      <Divider />
      <DockButton label="Show part labels" pressed={toggles.labels} onClick={() => onToggle('labels')}>
        <Tags className={icon} />
      </DockButton>
      <DockButton label="Show current flow" pressed={toggles.flow} onClick={() => onToggle('flow')}>
        <Zap className={icon} />
      </DockButton>
      <DockButton label="Auto-rotate" pressed={toggles.spin} onClick={() => onToggle('spin')}>
        {toggles.spin ? <Pause className={icon} /> : <Play className={icon} />}
      </DockButton>
      <DockButton
        label="Full screen"
        pressed={toggles.fullscreen}
        onClick={() => onToggle('fullscreen')}
        className="max-sm:hidden"
      >
        {toggles.fullscreen ? <Minimize2 className={icon} /> : <Maximize2 className={icon} />}
      </DockButton>
    </div>
  )
}
