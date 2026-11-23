// Repo checks run by CI (and runnable locally): node tools/check.mjs
//
// 1. Every skill and agent has frontmatter whose name matches its folder/file, and a description.
// 2. Every CLAUDE.md section a skill or agent names exists as a heading in CLAUDE.md.template.
// 3. Every relative link in a skill, reference file or the README resolves to a file.
// 4. No machine-specific absolute paths (a user's home directory) anywhere in the shipped text.
// 5. tools/drift-check.mjs reports a clean copy as clean and catches a changed and a missing file.
//
// Each check prints what it inspected beside its verdict, so a check that looked at nothing is visible.
import fs from 'fs'
import os from 'os'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rel = p => path.relative(REPO, p).replace(/\\/g, '/')
const read = p => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n')
let failures = 0
const fail = msg => { failures++; console.log(`  FAIL ${msg}`) }

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue
    const p = path.join(dir, e.name)
    e.isDirectory() ? walk(p, out) : out.push(p)
  }
  return out
}
const frontmatter = text => {
  const m = text.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return null
  const get = k => (m[1].match(new RegExp(`^${k}:\\s*(.*)$`, 'm')) || [])[1]?.trim()
  // A folded description (`description: >`) continues on the indented lines after it.
  let desc = get('description')
  if (desc === '>' || desc === '|') desc = (m[1].split(`description: ${desc}\n`)[1] || '').split('\n').filter(l => /^\s+\S/.test(l)).join(' ').trim()
  return { name: get('name'), description: desc }
}

// 1. Frontmatter
const skillDirs = fs.readdirSync(path.join(REPO, 'skills'), { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)
const agentFiles = fs.readdirSync(path.join(REPO, 'agents')).filter(f => f.endsWith('.md'))
const units = [
  ...skillDirs.map(d => [path.join(REPO, 'skills', d, 'SKILL.md'), d]),
  ...agentFiles.map(f => [path.join(REPO, 'agents', f), f.replace(/\.md$/, '')]),
]
console.log(`1. frontmatter: ${skillDirs.length} skills + ${agentFiles.length} agents`)
for (const [file, expected] of units) {
  if (!fs.existsSync(file)) { fail(`${rel(file)} missing`); continue }
  const fm = frontmatter(read(file))
  if (!fm) fail(`${rel(file)} has no frontmatter`)
  else {
    if (fm.name !== expected) fail(`${rel(file)} name "${fm.name}" should be "${expected}"`)
    if (!fm.description) fail(`${rel(file)} has no description`)
  }
}

// 2. CLAUDE.md section references
const headings = read(path.join(REPO, 'CLAUDE.md.template')).split('\n')
  .filter(l => /^#{2,3} /.test(l)).map(l => l.replace(/^#+ /, '').trim())
const refs = new Map()
for (const [file] of units) {
  if (!fs.existsSync(file)) continue
  for (const m of read(file).matchAll(/CLAUDE\.md's \**((?:[A-Z][A-Za-z]*\s?)+)/g)) {
    const name = m[1].trim()
    if (!refs.has(name)) refs.set(name, [])
    refs.get(name).push(rel(file))
  }
}
console.log(`2. section references: ${refs.size} distinct (${[...refs.keys()].join(', ')}) against ${headings.length} template headings`)
for (const [name, files] of refs) {
  if (!headings.some(h => h === name || h.startsWith(name))) fail(`"${name}" named by ${files.join(', ')} has no heading in CLAUDE.md.template`)
}

// 3. Relative links
const docs = [...walk(path.join(REPO, 'skills')).filter(f => f.endsWith('.md')), path.join(REPO, 'README.md')]
let links = 0
for (const file of docs) {
  // Drop fenced and inline code first: a link-shaped string inside an example is not a link.
  const text = read(file).replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '')
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = m[1].split('#')[0]
    if (!target || /^[a-z]+:/i.test(target) || target.startsWith('<')) continue
    links++
    if (!fs.existsSync(path.resolve(path.dirname(file), target))) fail(`${rel(file)} links to missing ${m[1]}`)
  }
}
console.log(`3. relative links: ${links} checked in ${docs.length} markdown files`)

// 4. Machine-specific paths
const shipped = walk(REPO).filter(f => /\.(md|mjs|js|json|template|ya?ml|sh)$/.test(f) && !rel(f).startsWith('tools/check.mjs'))
const homePath = /\b[A-Z]:[\\/]Users[\\/][^\\/\s`'"]+|\/Users\/[a-z][\w.-]+\/|\/home\/[a-z][\w.-]+\//
for (const f of shipped) {
  const hit = read(f).split('\n').findIndex(l => homePath.test(l))
  if (hit >= 0) fail(`${rel(f)}:${hit + 1} contains a machine-specific path`)
}
console.log(`4. machine-specific paths: ${shipped.length} files scanned`)

// 5. Drift check self-test
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-'))
const drift = () => {
  try { return { code: 0, out: execFileSync(process.execPath, [path.join(REPO, 'tools/drift-check.mjs'), tmp], { encoding: 'utf8' }) } }
  catch (e) { return { code: e.status, out: e.stdout } }
}
try {
  fs.cpSync(path.join(REPO, 'skills'), path.join(tmp, '.claude/skills'), { recursive: true })
  fs.cpSync(path.join(REPO, 'agents'), path.join(tmp, '.claude/agents'), { recursive: true })
  fs.rmSync(path.join(tmp, '.claude/skills', skillDirs[0]), { recursive: true }) // an uninstalled skill is not drift
  const clean = drift()
  if (clean.code !== 0 || !/differs 0 \+ missing 0/.test(clean.out)) fail(`drift-check on a clean copy: exit ${clean.code}, ${clean.out.trim().split('\n').pop()}`)
  const victim = path.join(tmp, '.claude/skills', skillDirs[1], 'SKILL.md')
  fs.appendFileSync(victim, '\nlocal edit\n')
  const changed = drift()
  if (changed.code !== 1 || !changed.out.includes(`differs  skills/${skillDirs[1]}/SKILL.md`)) fail(`drift-check missed a changed file (exit ${changed.code})`)
  fs.rmSync(victim)
  const missing = drift()
  if (missing.code !== 1 || !missing.out.includes(`missing  skills/${skillDirs[1]}/SKILL.md`)) fail(`drift-check missed a missing file (exit ${missing.code})`)
  console.log(`5. drift-check self-test: clean / changed / missing exits ${clean.code} / ${changed.code} / ${missing.code} (expect 0 / 1 / 1)`)
} finally {
  fs.rmSync(tmp, { recursive: true, force: true })
}

console.log(failures ? `\n${failures} failure(s)` : '\nall checks passed')
process.exit(failures ? 1 : 0)
