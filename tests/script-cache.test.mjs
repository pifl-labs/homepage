import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const script = readFileSync(new URL('../public/script.js', import.meta.url));
const hash = createHash('sha256').update(script).digest('hex').slice(0, 12);
const scriptUrl = `/script.js?v=${hash}`;
const scriptSources = html => [...html.matchAll(/<script\b[^>]*\bsrc="(\/script\.js(?:\?[^"\s]*)?)"[^>]*>/g)].map(match => match[1]);

test('the shared layout requests the current script bytes without changing its loading order', () => {
  const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
  assert.deepEqual(scriptSources(layout), [scriptUrl]);
  assert.ok(layout.includes(`<script is:inline src="${scriptUrl}"></script>`));
  assert.ok(layout.indexOf('<Footer lang={lang} />') < layout.indexOf(`src="${scriptUrl}"`));
  assert.ok(layout.indexOf(`src="${scriptUrl}"`) < layout.indexOf('src="/store-links.js"'));
});

test('the built script check is required by the separate built-artifact command', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.ok(pkg.scripts['test:built'].split(' && ').includes('node scripts/check-script-cache.mjs'));
});
