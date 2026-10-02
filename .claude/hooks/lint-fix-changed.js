#!/usr/bin/env node
/**
 * PostToolUse hook for Write/Edit.
 * Runs `npx eslint --fix` on the changed .ts/.tsx file (this repo has ESLint 9
 * flat config in eslint.config.mjs, no prettier). Silent when clean, never blocks.
 * Uses execFileSync (no shell) to avoid any command-injection surface.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');

const event = JSON.parse(fs.readFileSync(0, 'utf8'));
const filePath = event?.tool_input?.file_path;
if (!filePath) process.exit(0);
if (!/\.(ts|tsx)$/.test(filePath)) process.exit(0);
if (!fs.existsSync('node_modules')) process.exit(0); // deps not installed; skip silently

try {
  execFileSync('npx', ['eslint', '--fix', filePath], { stdio: 'pipe' });
} catch (err) {
  // Unfixable lint errors are surfaced by the Stop typecheck/review pass, not here.
  console.error(`eslint --fix skipped for ${filePath}: ${String(err.message).slice(0, 200)}`);
}

process.exit(0);
