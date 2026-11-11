import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';

// Run after the build, like the other test:built checks. Missing artifacts fail.
const script = readFileSync(new URL('../public/script.js', import.meta.url));
const hash = createHash('sha256').update(script).digest('hex').slice(0, 12);
const scriptUrl = `/script.js?v=${hash}`;
const dist = new URL('../dist/', import.meta.url);
assert.deepEqual(readFileSync(new URL('script.js', dist)), script);
const pages = readdirSync(dist, { recursive: true }).filter(file => file.endsWith('.html'));
const sharedPages = [];
for (const page of pages) {
  const html = readFileSync(new URL(page, dist), 'utf8');
  const sources = [...html.matchAll(/<script\b[^>]*\bsrc="(\/script\.js(?:\?[^"\s]*)?)"[^>]*>/g)].map(match => match[1]);
  if (sources.length === 0) continue;
  assert.deepEqual(sources, [scriptUrl], page);
  sharedPages.push(page);
}
for (const locale of ['ko', 'en', 'ja']) {
  assert.ok(sharedPages.includes(`${locale}/index.html`), `${locale} home`);
  assert.ok(sharedPages.includes(`${locale}/apps/pipi-words/index.html`), `${locale} Words landing`);
}
console.log(`PASS: ${sharedPages.length} shared-layout pages load ${scriptUrl}; built script bytes match source.`);
