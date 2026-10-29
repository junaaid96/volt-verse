import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { BoardKind, CodeVariant } from '../data/types'
import { BOARD_NAMES } from '../data/guideView'

function Sketch({ variant }: { variant: CodeVariant }) {
  const lines = variant.code.split('\n').length
  return (
    <div className="mt-2 overflow-hidden rounded-lg border-4 border-codeborder print:rounded-md print:border print:border-[#666]">
      <div className="flex items-center justify-between bg-codebg px-3 py-1.5 text-[11px] text-mist print:bg-[#eee] print:text-[#333]">
        <span className="font-mono">
          {variant.label} · {lines} lines
        </span>
        <span className="font-mono">Arduino / C++</span>
      </div>
      <pre className="codeblock max-h-[480px] overflow-auto bg-codebg p-4 text-codetext print:bg-white print:text-[#111]">
        <code>{variant.code}</code>
      </pre>
    </div>
  )
}

function PortNotice({ from, to }: { from: BoardKind; to: BoardKind }) {
  const target = BOARD_NAMES[to]
  return (
    <p role="note" className="mt-3 rounded-xl border border-amber/50 bg-amber/10 p-3 text-sm leading-relaxed text-fog dark:text-mist">
      This sketch is written for the <strong className="text-ink dark:text-foam">{BOARD_NAMES[from]}</strong>. On the {target}, change the
      pin numbers to match the {target} wiring map in section 3 and install the {target} board package before flashing.
    </p>
  )
}

export function CodeBlock({ variants, board }: { variants: CodeVariant[]; board: BoardKind }) {
  const [id, setId] = useState<string>(variants[0]?.id ?? '')
  const [copied, setCopied] = useState(false)
  const current = variants.find((v) => v.id === id) ?? variants[0]
  if (!current) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(current.code)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = current.code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div>
      {/* Screen: tabbed single sketch */}
      <div className="print-hide">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Code versions">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={v.id === current.id}
              onClick={() => setId(v.id)}
              className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                v.id === current.id
                  ? 'border-leaf bg-leaf text-white'
                  : 'border-line bg-card text-ink hover:border-leaf dark:border-edge dark:bg-moss dark:text-foam'
              }`}
            >
              {v.label}
              {v.board !== board && <span className="ml-1.5 text-xs opacity-75">({BOARD_NAMES[v.board]})</span>}
            </button>
          ))}
        </div>
        {current.board !== board && <PortNotice from={current.board} to={board} />}
        <p className="mt-3 text-sm leading-relaxed text-fog dark:text-mist">{current.note}</p>
        <Sketch variant={current} />
        <button
          type="button"
          onClick={copy}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-linelight dark:border-edge dark:bg-moss dark:text-foam dark:hover:bg-mosslight"
        >
          {copied ? <Check className="h-4 w-4 text-leaf" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
      {/* Print: every sketch stacked with its note */}
      <div className="print-only">
        {variants.map((v) => (
          <div key={v.id} className="mb-4">
            <h4 className="font-bold">{v.label}</h4>
            <p className="text-sm text-fog">{v.note}</p>
            <Sketch variant={v} />
          </div>
        ))}
      </div>
    </div>
  )
}
