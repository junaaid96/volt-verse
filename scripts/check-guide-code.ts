/**
 * Guards the guide code pairing in selectGuide: a board that has its own port of a
 * sketch must not also be shown another board's port, while boards with no port must
 * still get a foreign sketch as a porting starting point.
 *
 * Usage: npx tsx scripts/check-guide-code.ts
 */
import { projects } from '../src/data/projects'
import { BOARD_ORDER, selectGuide } from '../src/data/guideView'

const familyOf = (id: string) => id.replace(/-(esp32cam|esp32|nodemcu|uno)$/, '')
const failures: string[] = []
const check = (ok: boolean, msg: string) => {
  if (!ok) failures.push(msg)
}

const ids = (slug: string, version: string, board: (typeof BOARD_ORDER)[number]) =>
  selectGuide(projects.find((p) => p.slug === slug)!, { version, board }).code.map((c) => c.id)

// Air-quality version A: each board sees only its own port of the AQI reader.
check(JSON.stringify(ids('air-quality-node', 'a', 'esp32')) === JSON.stringify(['a']), 'air-quality A+esp32 shows only [a]')
check(JSON.stringify(ids('air-quality-node', 'a', 'uno')) === JSON.stringify(['a-uno']), 'air-quality A+uno shows only [a-uno]')
check(
  JSON.stringify(ids('air-quality-node', 'a', 'nodemcu')) === JSON.stringify(['a-nodemcu']),
  'air-quality A+nodemcu shows only [a-nodemcu]',
)

// New native Uno ports pair with their own family, not a foreign one.
check(
  JSON.stringify(ids('iot-weather-station', 'a', 'uno')) === JSON.stringify(['a-uno']),
  'weather A+uno shows only [a-uno]',
)
check(
  JSON.stringify(ids('health-monitor', 'a', 'uno')) === JSON.stringify(['a-uno']),
  'health A+uno shows only [a-uno]',
)

// Boards with no port keep the foreign sketch as a starting point…
check(
  JSON.stringify(ids('air-quality-node', 'b', 'nodemcu')) === JSON.stringify(['a', 'b']),
  'air-quality B+nodemcu still points at the ESP32 sketches',
)
// …including add-on families another board never ported (vehicle a-uno's note points at it).
check(
  ids('vehicle-tracker', 'b', 'uno').includes('b'),
  "vehicle-tracker B+uno still shows the ESP32 'b' sketch",
)

// Invariant over every guide/version/board: shown sketches cover the version, the board's
// own come first, and no foreign sketch duplicates an own sketch's family.
for (const project of projects) {
  for (const option of project.options) {
    for (const board of BOARD_ORDER) {
      const code = selectGuide(project, { version: option.id, board }).code
      const own = code.filter((c) => c.board === board)
      const foreign = code.filter((c) => c.board !== board)
      for (const c of code) {
        check(!c.versions || c.versions.includes(option.id), `${project.slug} ${option.id}+${board}: "${c.id}" covers the version`)
      }
      check(
        code.slice(0, own.length).every((c) => c.board === board),
        `${project.slug} ${option.id}+${board}: own sketches come first`,
      )
      const ownFamilies = new Set(own.map((c) => familyOf(c.id)))
      for (const c of foreign) {
        check(!ownFamilies.has(familyOf(c.id)), `${project.slug} ${option.id}+${board}: foreign "${c.id}" duplicates an own family`)
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`FAILED:\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
console.log('All guide code pairings look right.')
