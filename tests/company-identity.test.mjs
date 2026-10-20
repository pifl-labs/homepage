import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
const block = layout.match(/<script type="application\/ld\+json" set:html=\{JSON\.stringify\(\{([\s\S]*?)\}\)\} \/>/)?.[1];
const companyProfiles = [
  'https://github.com/pifl-labs',
  'https://play.google.com/store/apps/dev?id=8852533891626306957',
  'https://apps.apple.com/us/developer/pifl-labs-co-ltd/id1893574694',
];

test('the existing single Organization owns the company profile reference', () => {
  assert.ok(block, 'Expected the existing Organization JSON-LD');
  assert.equal((layout.match(/'@type': 'Organization'/g) ?? []).length, 1);
  assert.match(block, /'@id': 'https:\/\/pifl-labs\.com\/#organization'/);
  assert.match(block, /name: 'PiFl Labs Co\., Ltd\.'/);
  assert.match(block, /url: 'https:\/\/pifl-labs\.com'/);
  assert.equal((block.match(/sameAs:/g) ?? []).length, 1);
});

test('company profile URLs are exact, public, untracked and not app or persona pages', () => {
  const entries = [...(block?.match(/sameAs: \[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(entries, companyProfiles);
  assert.equal(new Set(entries).size, entries.length);
  for (const entry of entries) {
    const url = new URL(entry);
    assert.equal(url.protocol, 'https:');
    assert.equal(url.username + url.password + url.hash, '');
    if (url.hostname === 'play.google.com') {
      assert.equal(url.pathname, '/store/apps/dev');
      // The exact developer ID is required, not a tracking parameter or an app ID.
      assert.deepEqual([...url.searchParams], [['id', '8852533891626306957']]);
    } else {
      assert.equal(url.search, '');
      assert.ok(
        (url.hostname === 'github.com' && url.pathname === '/pifl-labs') ||
        (url.hostname === 'apps.apple.com' && url.pathname === '/us/developer/pifl-labs-co-ltd/id1893574694'),
      );
    }
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
