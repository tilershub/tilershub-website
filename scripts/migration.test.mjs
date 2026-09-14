import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { migrationRedirect } from '../src/lib/migration.js'
const cases = [["/blog/a?utm_source=old", "https://tilershub.lk/blog/a?utm_source=old"], ["/estimator/", "https://tilershub.lk/estimator/"], ["/guides/a", "https://tilershub.lk/guides/a"], ["/join-tilershub?district=Colombo", "https://wedahub.lk/join-wedahub?district=Colombo"], ["/providers/someone", null], ["/blogger", null], ["/", null]]
for (const [path, destination] of cases) test(path, () => assert.equal(migrationRedirect(new URL(path, 'https://wedahub.lk')), destination))
test('redirect destination ignores the incoming host', () => {
  const output = migrationRedirect(new URL(cases[0][0], 'https://untrusted.example'))
  assert.equal(output, cases[0][1])
})
test('deployment is explicit during the split', () => {
 const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8')
 assert.match(workflow, /workflow_dispatch/); assert.doesNotMatch(workflow, /branches: \[main\]/)
})
