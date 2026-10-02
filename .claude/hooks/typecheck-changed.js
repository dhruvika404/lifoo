#!/usr/bin/env node
/**
 * Stop hook: typecheck before the agent finishes, so it can self-correct.
 * Only runs when .ts/.tsx files changed this turn. `npm run lint` does not
 * typecheck and there is no test runner, so `npx tsc --noEmit` is the only
 * automated correctness gate in this repo.
 * Uses execFileSync (no shell) for all subprocess calls.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');

let event = {};
try {
  event = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}
if (!event?.transcript_path) process.exit(0);
if (!fs.existsSync('node_modules')) process.exit(0); // deps not installed; nothing to run

try {
  const changed = execFileSync('git', ['diff', '--name-only'], { encoding: 'utf8' })
    .split('\n')
    .filter((f) => /\.(ts|tsx)$/.test(f));
  if (changed.length === 0) process.exit(0);

  console.error(`Typechecking (${changed.length} changed TS files)…`);
  execFileSync('npx', ['tsc', '--noEmit'], { stdio: 'inherit' });
} catch {
  console.error(
    JSON.stringify({
      decision: 'block',
      reason: 'npx tsc --noEmit failed. Fix the type errors above before finishing.',
    }),
  );
  process.exit(2);
}

process.exit(0);
