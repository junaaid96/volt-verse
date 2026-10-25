/**
 * Writes every guide sketch to <outDir>/<slug>__<id>/<slug>__<id>.ino and a manifest.json
 * mapping each sketch to its Arduino FQBN, then reports versions a supported board has no sketch for.
 * Add-on sketches are combined with their base the way the guide notes tell students to.
 *
 * Usage: npx tsx scripts/extract-sketches.ts [outDir]
 */
import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { projects } from '../src/data/projects'
import { BOARD_ORDER } from '../src/data/guideView'
import type { BoardKind, Project } from '../src/data/types'

const FQBN: Record<BoardKind, string> = {
  uno: 'arduino:avr:uno',
  esp32: 'esp32:esp32:esp32',
  nodemcu: 'esp8266:esp8266:nodemcuv2',
  esp32cam: 'esp32:esp32:esp32cam',
}

/** Add-ons that only build merged with a base sketch; `above` = pasted before the base. */
const ADD_ONS: Record<string, { base: string; above?: boolean }> = {
  'home-automation/b': { base: 'a' },
  'home-automation/b-nodemcu': { base: 'a-nodemcu' },
  'rfid-attendance/b': { base: 'a' },
  'rfid-attendance/b-nodemcu': { base: 'a-nodemcu' },
  'smart-door-lock/b': { base: 'a', above: true },
}

/** Sketches that replace the main tab of an Arduino core example and keep its other files. */
const EXAMPLE_TABS: Record<string, string> = {
  'esp32cam-security/b': 'packages/esp32/hardware/esp32/*/libraries/ESP32/examples/Camera/CameraWebServer',
}

interface ManifestEntry {
  dir: string
  slug: string
  id: string
  board: BoardKind
  fqbn: string
}

const arduinoData = () => execSync('arduino-cli config get directories.data').toString().trim()

function exampleDir(pattern: string): string {
  const [before, after] = pattern.split('/*/')
  const root = join(arduinoData(), before)
  const version = readdirSync(root).sort().at(-1)
  if (!version) throw new Error(`No core installed under ${root}`)
  return join(root, version, after)
}

function sketchSource(project: Project, id: string): string {
  const key = `${project.slug}/${id}`
  const code = project.code.find((c) => c.id === id)!.code
  const addOn = ADD_ONS[key]
  if (!addOn) return code
  const base = project.code.find((c) => c.id === addOn.base)
  if (!base) throw new Error(`${key}: base sketch "${addOn.base}" not found`)
  return addOn.above ? `${code}\n${base.code}\n` : `${base.code}\n${code}\n`
}

const outDir = process.argv[2] ?? '.sketch-check'
rmSync(outDir, { recursive: true, force: true })

const manifest: ManifestEntry[] = projects.flatMap((project) =>
  project.code.map((variant) => {
    const key = `${project.slug}/${variant.id}`
    const name = `${project.slug}__${variant.id}`.replace(/[^A-Za-z0-9_]/g, '_')
    const dir = join(outDir, name)
    mkdirSync(dir, { recursive: true })
    if (EXAMPLE_TABS[key]) {
      const src = exampleDir(EXAMPLE_TABS[key])
      if (!existsSync(src)) throw new Error(`${key}: example not found at ${src}`)
      for (const file of readdirSync(src).filter((f) => !f.endsWith('.ino'))) copyFileSync(join(src, file), join(dir, file))
    }
    writeFileSync(join(dir, `${name}.ino`), sketchSource(project, variant.id))
    return { dir, slug: project.slug, id: variant.id, board: variant.board, fqbn: FQBN[variant.board] }
  }),
)
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2))

const gaps = projects.flatMap((project) =>
  BOARD_ORDER.filter((board) => project.support[board].ok).flatMap((board) =>
    project.options
      .filter((o) => !project.code.some((c) => c.board === board && (!c.versions || c.versions.includes(o.id))))
      .map((o) => `${project.slug}: ${board} has no sketch for version "${o.id}"`),
  ),
)

console.log(`Extracted ${manifest.length} sketches to ${outDir}`)
console.log(gaps.length ? `Missing sketches:\n  ${gaps.join('\n  ')}` : 'Every supported board/version has a sketch.')
