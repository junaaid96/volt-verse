import { ExternalLink, FileText } from 'lucide-react'
import { getSheets } from '../data/datasheets'

export function SheetsList({ keys }: { keys?: string[] }) {
  const sheets = getSheets(keys)
  if (sheets.length === 0) return null

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {sheets.map((s) => (
        <li key={s.key}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-line bg-card p-3.5 transition-colors hover:border-leaf dark:border-[#2f4234] dark:bg-moss dark:hover:border-leafbright"
          >
            <FileText className="h-5 w-5 shrink-0 text-fog dark:text-[#9bb0a0]" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink dark:text-[#e4ece5]">
                {s.label}
              </span>
              <span className="text-xs text-fog dark:text-[#9bb0a0]">
                {s.kind === 'PDF' ? 'Manufacturer datasheet (PDF)' : s.kind === 'Guide' ? 'Tutorial guide' : 'Official docs'}
              </span>
              <span className="print-only break-all font-mono text-[11px] text-fog">{s.url}</span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-fog dark:text-[#9bb0a0]" />
          </a>
        </li>
      ))}
    </ul>
  )
}
