import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="font-mono text-sm text-fog dark:text-mist">404</p>
      <h1 className="font-display mt-2 text-3xl font-bold text-ink dark:text-foam">
        This circuit is empty
      </h1>
      <p className="mt-2 text-sm text-fog dark:text-mist">
        The guide you asked for doesn&apos;t exist — or lives on a track that hasn&apos;t opened yet.
      </p>
      <Link
        to="/projects"
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-leaf px-5 py-2.5 font-semibold text-white hover:bg-leafdeep"
      >
        <ArrowLeft className="h-4 w-4" /> Back to guides
      </Link>
    </div>
  )
}
