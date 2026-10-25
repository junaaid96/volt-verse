import type { WireBoard } from '../data/types'

const WIRE_COLORS = ['#1e7a46', '#b7791f', '#2470b7', '#a83a2a', '#0e7c7b', '#8a5a33']

export function WiringDiagram({ board }: { board: WireBoard }) {
  const rowH = 38
  const pad = 14
  const W = 680
  const H = board.pins.length * rowH + pad * 2
  const midLeft = 318
  const midRight = 362

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={`Wiring map for ${board.board}`}
        className="rounded-lg border border-linelight bg-paper dark:border-[#24352a] dark:bg-pine"
      >
        <text x={pad} y={pad - 2} fontSize="11" fill="#55645a" fontWeight="600">
          FROM · module side
        </text>
        <text x={W - pad} y={pad - 2} fontSize="11" fill="#55645a" fontWeight="600" textAnchor="end">
          TO · {board.board}
        </text>
        {board.pins.map((p, i) => {
          const y = pad + 8 + i * rowH + rowH / 2
          const color = WIRE_COLORS[i % WIRE_COLORS.length]
          return (
            <g key={i}>
              <rect x={pad} y={y - 13} width={midLeft - pad - 6} height={26} rx={7} fill="none" stroke={color} strokeWidth={1.5} />
              <text x={pad + 10} y={y + 4} fontSize="11.5" fill="currentColor" className="fill-ink dark:fill-[#e4ece5]">
                {p.from.length > 38 ? `${p.from.slice(0, 37)}…` : p.from}
                <title>{p.from}</title>
              </text>
              <rect x={midRight + 6} y={y - 13} width={W - midRight - 6 - pad} height={26} rx={7} fill={color} opacity={0.14} />
              <text x={midRight + 16} y={y + 4} fontSize="11.5" fontWeight="600" fill={color}>
                {p.to.length > 38 ? `${p.to.slice(0, 37)}…` : p.to}
                <title>{p.to}</title>
              </text>
              <path d={`M ${midLeft} ${y} C ${midLeft + 14} ${y}, ${midRight - 14} ${y}, ${midRight} ${y}`} stroke={color} strokeWidth={2.5} fill="none" />
              <circle cx={midLeft} cy={y} r={3.5} fill={color} />
              <circle cx={midRight} cy={y} r={3.5} fill={color} />
            </g>
          )
        })}
      </svg>
      <div className="mt-3 overflow-x-auto rounded-lg border border-line dark:border-[#2f4234]">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="bg-linelight text-left dark:bg-[#24352a]">
              <th className="px-4 py-2 font-semibold text-fog dark:text-[#9bb0a0]">From</th>
              <th className="px-4 py-2 font-semibold text-fog dark:text-[#9bb0a0]">To ({board.board})</th>
            </tr>
          </thead>
          <tbody>
            {board.pins.map((p, i) => (
              <tr key={i} className="border-t border-linelight dark:border-[#24352a]">
                <td className="px-4 py-2 font-mono text-[13px] text-ink dark:text-[#e4ece5]">{p.from}</td>
                <td className="px-4 py-2 font-mono text-[13px] font-semibold text-leaf dark:text-leafbright">{p.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
