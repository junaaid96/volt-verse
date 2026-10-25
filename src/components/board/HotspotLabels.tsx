import type { RefObject } from 'react'

/**
 * DOM layer for 3D hotspot labels. Positions are written every frame by
 * <HotspotProjector> inside the canvas; text stays crisp at any zoom and
 * pointer-events are off so labels never block orbiting.
 */
export function HotspotLabels({
  labels,
  elements,
}: {
  labels: string[]
  elements: RefObject<Array<HTMLElement | null>>
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      {labels.map((text, i) => (
        <div
          key={`${text}-${i}`}
          ref={(el) => {
            elements.current[i] = el
          }}
          className="absolute left-0 top-0 will-change-transform"
          style={{ visibility: 'hidden' }}
        >
          <div className="hotspot">
            <span className="hotspot-dot" />
            <span className="hotspot-label">{text}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
