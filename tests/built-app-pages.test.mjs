import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { registeredAppSlugs, builtAppLandingFiles, appSlugs } from '../scripts/built-app-pages.mjs';

function fixture(t, routes) {
  const root = mkdtempSync(join(tmpdir(), 'pifl-built-inventory-test-'));
  t.after(() => rmSync(root, { recursive: true }));
  for (const route of routes) {
    const file = join(root, 'en', 'apps', route, 'index.html');
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, '<!doctype html><title>Test fixture</title>');
  }
  return root;
}
test('catalog inventory is nonempty and excludes policy-only Tide', () => {
  assert.equal(appSlugs.length, 10);
  assert.ok(appSlugs.includes('pipi-draw'));
  assert.ok(!appSlugs.includes('pipi-tide'));
});
test('registered app parsing rejects empty and duplicate inventory', () => {
  assert.throws(() => registeredAppSlugs(''), /must not be empty/);
  assert.throws(() => registeredAppSlugs("slug: 'a'\nslug: 'a'"), /Duplicate/);
});
test('includes real landings and recognizes unregistered privacy-only routes', (t) => {
  const root = fixture(t, ['pipi-draw', 'pipi-tide/privacy']);
  assert.deepEqual(builtAppLandingFiles(root, 'en', ['pipi-draw']), [join(root, 'en/apps/pipi-draw/index.html')]);
});
test('registered missing landing fails even when its privacy policy exists', (t) => {
  const root = fixture(t, ['pipi-draw/privacy']);
  assert.throws(() => builtAppLandingFiles(root, 'en', ['pipi-draw']), /Missing registered landing/);
});
test('includes an unregistered actual landing so existing validators still inspect it', (t) => {
  const root = fixture(t, ['pipi-draw', 'new-app']);
  assert.equal(builtAppLandingFiles(root, 'en', ['pipi-draw']).length, 2);
});
test('unknown unexplained app folders fail instead of silently skipping', (t) => {
  const root = fixture(t, ['pipi-draw']);
  mkdirSync(join(root, 'en/apps/broken'));
  assert.throws(() => builtAppLandingFiles(root, 'en', ['pipi-draw']), /Unexplained app directory/);
});
test('missing locale and missing catalog inventory are failures', (t) => {
  const root = fixture(t, ['pipi-draw']);
  assert.throws(() => builtAppLandingFiles(root, 'ja', ['pipi-draw']), /Missing registered landing/);
  assert.throws(() => builtAppLandingFiles(root, 'en', []), /inventory is required/);
});
test('both actual built validators use the strict common inventory', () => {
  for (const name of ['check-store-links.mjs', 'check-draw-landing.mjs']) {
    const source = readFileSync(new URL(`../scripts/${name}`, import.meta.url), 'utf8');
    assert.match(source, /builtAppLandingFiles\(dist, lang, appSlugs\)/);
  }
});
