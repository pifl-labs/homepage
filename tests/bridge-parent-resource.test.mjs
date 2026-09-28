import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/components/AppLanding.astro', import.meta.url), 'utf8');

test('only English Bridge landing exposes the already-public optional family activity', () => {
  assert.match(source, /app\.slug === 'pipi-bridge' && lang === 'en'/);
  assert.match(source, /https:\/\/pipi-worlds\.com\/en\/learn\/korean-school-help-phrase\//);
  assert.match(source, /No app or sign-up needed\./);
  assert.match(source, /aria-labelledby="bridge-resource-title"/);
});
