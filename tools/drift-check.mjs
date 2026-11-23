// Compares a project's installed workflow files against this repo.
//
//   node tools/drift-check.mjs <project-root>
//
// Checks every file under skills/ and agents/ here against <project-root>/.claude/,
// ignoring line endings. Project-specific facts belong in the project's CLAUDE.md,
// so any difference is a real change: port it here or bring the project back in line.
// Exit 1 when anything differs or is missing.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const project = process.argv[2]
if (!project) { console.error('usage: node tools/drift-check.mjs <project-root>'); process.exit(2) }
const target = path.join(path.resolve(project), '.claude')
if (!fs.existsSync(target)) { console.error(`no .claude/ under ${project}`); process.exit(2) }

const files = []
const walk = rel => {
  for (const e of fs.readdirSync(path.join(REPO, rel), { withFileTypes: true })) {
    const r = path.join(rel, e.name)
    if (e.isDirectory()) { if (e.name !== 'node_modules') walk(r) } else files.push(r)
  }
}
walk('skills'); walk('agents')

// A skill the project chose not to install is not drift; a file missing from an
// installed skill is. (A skill's unit is its directory, an agent's is its file.)
const unit = rel => rel.split(path.sep).slice(0, 2).join(path.sep)
const read = f => fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n')
const same = [], differs = [], missing = [], notInstalled = new Set()
for (const rel of files) {
  const theirs = path.join(target, rel)
  if (!fs.existsSync(path.join(target, unit(rel)))) notInstalled.add(unit(rel).replace(/\\/g, '/'))
  else if (!fs.existsSync(theirs)) missing.push(rel)
  else (read(path.join(REPO, rel)) === read(theirs) ? same : differs).push(rel)
}
const skipped = files.length - same.length - differs.length - missing.length
for (const f of differs) console.log(`differs  ${f.replace(/\\/g, '/')}`)
for (const f of missing) console.log(`missing  ${f.replace(/\\/g, '/')}`)
if (notInstalled.size) console.log(`not installed (fine): ${[...notInstalled].join(', ')}`)
console.log(`inspected ${files.length} = same ${same.length} + differs ${differs.length} + missing ${missing.length} + not installed ${skipped}`)
process.exit(same.length === 0 || differs.length || missing.length ? 1 : 0)
