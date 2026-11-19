import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { apps } from '../src/data/apps.ts';
import { archiveMedia } from '../src/data/archive.mjs';

// Dialogos 1.1.0 (20) was submitted on 2026-11-16 and is waiting for App Store review.
// The receipt is a read-only App Store Connect listing: the committed pipi-thus store set has the
// checksums App Store Connect reports, and every WebP here is derived from those exact files.
const root = new URL('../', import.meta.url);
const bytes = p => readFileSync(new URL(p, root));
const json = p => JSON.parse(bytes(p).toString('utf8'));
const sha = b => createHash('sha256').update(b).digest('hex');
const receipt = json('docs/release/dialogos-110-listing-media-20261116.json');
const media = json('src/data/app-submission-media.json').dialogos;
const asset = p => bytes(`public${p}`);
const token = u => u.match(/\/thumb\/([^/]+)\//)[1];
const set = ['home', 'chat_marcus', 'symposium', 'mentor_sheet'].map(s => `${s}-20261116`);
const stale = /고대|古代|ancient|네 명|네 현자|四人|four sages|Stoic|스토아|ストア/i;
// Lossy WebP (VP8): the frame header carries the pixel size.
const dims = b => {
  assert.equal(b.toString('ascii', 0, 4), 'RIFF');
  assert.equal(b.toString('ascii', 8, 16), 'WEBPVP8 ');
  assert.equal(b.readUIntBE(23, 3), 0x9d012a);
  return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
};

test('receipt: 1.1.0 (20) in review, listing images are the committed store set', () => {
  assert.deepEqual(
    { version: receipt.listingMedia.version, build: receipt.listingMedia.build, state: receipt.listingMedia.state },
    { version: '1.1.0', build: '20', state: 'WAITING_FOR_REVIEW' },
  );
  for (const locale of ['ko', 'ja', 'en-US']) {
    const rows = receipt.screenshots[locale];
    assert.deepEqual(rows.map(r => r.fileName), ['iphone_0_home.png', 'iphone_1_chat_marcus.png', 'iphone_2_symposium.png', 'iphone_3_mentor_sheet.png']);
    for (const r of rows) {
      assert.equal(r.localMd5, r.sourceFileChecksum, `${locale} ${r.fileName}`);
      assert.deepEqual([r.width, r.height], [1320, 2868]);
      assert.match(r.templateUrl, /^https:\/\/is\d-ssl\.mzstatic\.com\/image\/thumb\/[^/]+\/\{w\}x\{h\}bb\.\{f\}$/);
    }
  }
  assert.deepEqual(receipt.listingMedia.firstThree, receipt.screenshots['en-US'].slice(0, 3).map(r => r.templateUrl));
});

test('every derived WebP is the recorded bytes at the recorded size', () => {
  assert.equal(Object.keys(receipt.derived).length, 15);
  for (const [path, row] of Object.entries(receipt.derived)) {
    const b = asset(path);
    assert.equal(sha(b), row.sha256, path);
    assert.deepEqual(dims(b), row.size, path);
    assert.deepEqual(row.size, path.includes('/submission/') ? [331, 719] : [540, 1169], path);
  }
});

test('submission media shows the submitted 1.1.0 listing, selection screen first', () => {
  assert.equal(media.version, '1.1.0 (20)');
  assert.equal(media.pending, true);
  assert.equal(media.observedAt, '2026-11-16');
  assert.equal(media.previewIndex, 0);
  assert.deepEqual(media.shots.map(s => s.src), [1, 2, 3].map(i => `/assets/apps/dialogos/submission/20261116-${i}.webp`));
  assert.deepEqual(media.shots.map(s => token(s.source)), receipt.listingMedia.firstThree.map(token));
  for (const s of media.shots) assert.ok(receipt.derived[s.src], s.src);
  assert.doesNotMatch(JSON.stringify(media.shots.map(s => s.label)), stale);
  assert.deepEqual(['ko', 'ja', 'en'].map(l => media.shots[2].label[l]), ['향연, 두 철학자와 한자리에서', '饗宴、二人の哲学者と同じ席で', 'Symposium: two philosophers at one table']);
});

for (const lang of ['ko', 'ja', 'en']) test(`${lang}: landing fallback shots and hero follow the same set`, () => {
  const app = apps.dialogos;
  assert.deepEqual(app.content[lang].shots.map(s => s.file), set);
  assert.equal(app.heroShot, set[0]);
  for (const file of set) assert.ok(receipt.derived[`/assets/apps/dialogos/${lang}/${file}.webp`], `${lang}/${file}`);
  assert.doesNotMatch(JSON.stringify(app.content[lang].shots), stale);
});

test('dated archive images and the 2026-10-23 store previews keep their recorded bytes', () => {
  const recorded = Object.fromEntries(json('docs/verification/2026-10-23-archive/asset-hashes.json').map(a => [a.path, a.sha256]));
  const { oldShot, newShot } = archiveMedia.dialogos;
  assert.equal(newShot, '/assets/apps/dialogos/submission/20261116-1.webp');
  assert.equal(archiveMedia.dialogos.screenObservedAt, '2026-11-16');
  assert.equal(oldShot, '/assets/apps/dialogos/en/home.webp');
  for (const p of [oldShot, '/assets/apps/dialogos/submission/20261023-1.webp']) assert.equal(sha(asset(p)), recorded[p], p);
  const preview = json('docs/release/homepage-app-audit-20261023.json').find(a => a.slug === 'dialogos').previewSha256;
  for (const lang of ['ko', 'ja', 'en']) assert.equal(sha(asset(`/assets/apps/dialogos/${lang}/store-preview.webp`)), preview[lang], lang);
});

for (const lang of ['ko', 'ja', 'en']) test(`${lang}: built landing and catalog keep Dialogos images outside release records`, () => {
  const landing = bytes(`dist/${lang}/apps/dialogos/index.html`).toString('utf8');
  for (const i of [1, 2, 3]) assert.ok(landing.includes(`/assets/apps/dialogos/submission/20261116-${i}.webp`), `${lang}: shot ${i}`);
  assert.match(landing, /<meta property="og:image" content="[^"]*\/assets\/apps\/dialogos\/submission\/20261116-1\.webp"/);
  assert.ok(landing.includes('iOS 1.1.0 (20)'));
  assert.doesNotMatch(landing, /dialogos\/submission\/20261023-|dialogos\/(ko|ja|en)\/(home|chat_marcus|chat_socrates|onboarding)\.webp/);
  const home = bytes(`dist/${lang}/index.html`).toString('utf8');
  // 2026-11-19: home cards no longer carry screenshots; the submitted set stays on the app page.
  assert.ok(home.includes(`href="/${lang}/apps/dialogos/"`), `${lang}: catalog card`);
  assert.ok(!home.includes('/assets/apps/dialogos/submission/'), `${lang}: no screenshot on the home card`);
  const archive = bytes(`dist/${lang}/archive/index.html`).toString('utf8');
  assert.ok(!archive.includes('/assets/apps/dialogos/submission/20261116-1.webp'), `${lang}: submission image stays out of the release timeline`);
  assert.match(archive,/data-event-id="dialogos-shared-1.1.0"/);
});

test('no built page points at a missing Dialogos image', () => {
  const pages = [];
  const walk = dir => { for (const n of readdirSync(dir)) { const p = `${dir}/${n}`; statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && pages.push(p); } };
  walk(new URL('dist', root).pathname);
  let seen = 0;
  for (const p of pages) for (const [m] of readFileSync(p, 'utf8').matchAll(/\/assets\/apps\/dialogos\/[^"'\s)]+\.webp/g)) {
    seen += 1;
    assert.ok(existsSync(new URL(`public${m}`, root)), `${p}: ${m}`);
  }
  assert.ok(seen > 0);
});
