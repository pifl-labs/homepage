import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
const block = layout.match(/<script type="application\/ld\+json" set:html=\{JSON\.stringify\(\{([\s\S]*?)\}\)\} \/>/)?.[1];

test('the existing single Organization owns the company profile reference', () => {
  assert.ok(block, 'Expected the existing Organization JSON-LD');
  assert.equal((layout.match(/'@type': 'Organization'/g) ?? []).length, 1);
  assert.match(block, /'@id': 'https:\/\/pifl-labs\.com\/#organization'/);
  assert.match(block, /name: 'PiFl Labs Co\., Ltd\.'/);
  assert.match(block, /url: 'https:\/\/pifl-labs\.com'/);
  assert.match(block, /sameAs: \['https:\/\/github\.com\/pifl-labs'\]/);
});

test('the identity URL is exact, public, untracked and does not guess persona accounts', () => {
  const entries = [...(block?.match(/sameAs: \[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(entries, ['https://github.com/pifl-labs']);
  for (const entry of entries) {
    const url = new URL(entry);
    assert.equal(url.protocol, 'https:');
    assert.equal(url.hostname, 'github.com');
    assert.equal(url.pathname, '/pifl-labs');
    assert.equal(url.username + url.password + url.search + url.hash, '');
  }
});

test('localized descriptions and existing identity properties remain in the shared layout', () => {
  assert.match(block, /description: orgDescription/);
  assert.match(block, /inLanguage: lang/);
  assert.match(block, /knowsLanguage: \['ko', 'en', 'ja'\]/);
  assert.match(block, /logo: 'https:\/\/pifl-labs\.com\/emblem\.png'/);
  assert.match(block, /email: 'hello@pifl-labs\.com'/);
  assert.match(block, /foundingDate: '2026'/);
});
