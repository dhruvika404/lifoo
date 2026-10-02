#!/usr/bin/env node
/**
 * PreToolUse hook for Write/Edit.
 * Blocks writes that contain likely secrets, and refuses to write .env files.
 * Admin-web-specific: this app talks to MinIO/S3 from the browser and stores
 * auth tokens in cookies, so AWS-style keys, JWTs, and NEXT_PUBLIC_* vars that
 * embed credentials are the realistic leak vectors.
 */

const fs = require('fs');
const event = JSON.parse(fs.readFileSync(0, 'utf8'));

const filePath = event?.tool_input?.file_path || '';
const content = event?.tool_input?.content || event?.tool_input?.new_string || '';

const PATTERNS = [
  { name: 'AWS/MinIO access key ID', re: /AKIA[0-9A-Z]{16}/g },
  {
    name: 'AWS/MinIO secret key',
    re: /(?<![A-Za-z0-9])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9])/g,
    hint: 'looks like an S3-style secret access key (lib/minio-client.ts must only read env vars)',
  },
  {
    name: 'JWT (possible session token)',
    re: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
    hint: 'looks like a JWT; access/refresh tokens live only in cookies via utils/auth.ts, never in source',
  },
  { name: 'Generic sk- API key', re: /(?<![A-Za-z0-9])sk[-_](?:ant-|live_|test_)?[A-Za-z0-9\-_]{20,}/g },
  {
    name: 'Cookie/session secret assignment',
    re: /(JWT_SECRET|JWT_PUBLIC_KEY|SESSION_SECRET|COOKIE_SECRET|AUTH_SECRET|NEXTAUTH_SECRET|MINIO_ACCESS_KEY|MINIO_SECRET_KEY|S3_SECRET_ACCESS_KEY|DATABASE_URL)\s*[:=]\s*["'][^"'\s]{8,}/g,
  },
  {
    name: 'NEXT_PUBLIC_ var embedding a credential',
    re: /NEXT_PUBLIC_[A-Z0-9_]*(SECRET|TOKEN|KEY|PASSWORD|CREDENTIAL)[A-Z0-9_]*\s*[:=]\s*["'][^"'\s]{8,}["']/g,
    hint: 'NEXT_PUBLIC_* is shipped to every browser. Reading process.env.NEXT_PUBLIC_* is fine; assigning a literal value is not.',
  },
  {
    name: 'axios baseURL with inline credentials',
    re: /baseURL\s*:\s*["'`]https?:\/\/[^"'`\s/]*:[^"'`\s@]+@/g,
    hint: 'user:pass@ in a baseURL leaks credentials; use NEXT_PUBLIC_API_URL like services/api.ts does',
  },
];

if (/\.env(?:\.|$)/.test(filePath) && !/\.env\.example$/.test(filePath)) {
  console.error(
    JSON.stringify({
      decision: 'block',
      reason: `Refusing to write ${filePath}. .env files are managed manually by developers (and gitignored via .env*). Use .env.example for documented placeholders.`,
    }),
  );
  process.exit(2);
}

const findings = [];
for (const p of PATTERNS) {
  const m = content.match(p.re);
  if (m && m.length) findings.push({ name: p.name, hint: p.hint, sample: m[0].slice(0, 20) + '…' });
}

if (findings.length > 0) {
  console.error(
    JSON.stringify({
      decision: 'block',
      reason:
        `Likely secret detected in proposed change:\n` +
        findings
          .map((f) => `  - ${f.name}${f.hint ? ` (${f.hint})` : ''}: ${f.sample}`)
          .join('\n') +
        `\nReference an environment variable (process.env.NEXT_PUBLIC_* for browser-safe config) instead of inlining the value.`,
    }),
  );
  process.exit(2);
}

process.exit(0);
