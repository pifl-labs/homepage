import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { apps } from '../src/data/apps.ts';

// Dialogos 1.1.1 (21) was submitted on 2026-11-19 and is waiting for App Store review; 1.1.0 is public.
// App Store Connect was not read for this record (the read-only call was not permitted in that session), so the
// receipt rests on the pipi-thus submission record and the committed store set (main 00af258, set 20261119).
// Only the symposium screen is new in that set; the other screens have the bytes App Store Connect reported for
// the 1.1.0 listing on 2026-11-16, so their WebP files stay.
const root = new URL('../', import.meta.url);
const bytes = p => readFileSync(new URL(p, root));
const json = p => JSON.parse(bytes(p).toString('utf8'));
const sha = b => createHash('sha256').update(b).digest('hex');
const receipt = json('docs/release/dialogos-111-listing-media-20261119.json');
const before = json('docs/release/dialogos-110-listing-media-20261116.json');
const media = json('src/data/app-submission-media.json').dialogos;
const asset = p => bytes(`public${p}`);
const token = u => u.match(/\/thumb\/([^/]+)\//)[1];
const slots = ['home', 'chat_marcus', 'symposium', 'mentor_sheet'];
const set = ['home-20261116', 'chat_marcus-20261116', 'symposium-20261119', 'mentor_sheet-20261116'];
const submitted = ['/assets/apps/dialogos/submission/20261116-1.webp', '/assets/apps/dialogos/submission/20261116-2.webp', '/assets/apps/dialogos/submission/20261119-3.webp'];
const stale = /고대|古代|ancient|네 명|네 현자|四人|four sages|Stoic|스토아|ストア/i;
// The 1.1.0 symposium: both philosophers answered the same worry at once, then one responded to the other.
const oldRound = /응수|같은 고민에|두 철학자가 답하다|두 철학자와 한자리|応じ|同じ悩みに|二人の哲学者が答える|二人の哲学者と同じ席|responds to the other|same worry|Two philosophers, one question|two philosophers at one table/i;
const dims = b => {
  assert.equal(b.toString('ascii', 0, 4), 'RIFF');
  assert.equal(b.toString('ascii', 8, 16), 'WEBPVP8 ');
  assert.equal(b.readUIntBE(23, 3), 0x9d012a);
  return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
};

test('receipt: 1.1.1 (21) submitted, 1.1.0 public, and it says App Store Connect was not read', () => {
  assert.equal(receipt.appStoreConnectRead, false);
  assert.match(receipt.note, /App Store Connect was not read/);
  assert.deepEqual(
    { version: receipt.submission.version, build: receipt.submission.build, state: receipt.submission.state },
    { version: '1.1.1', build: '21', state: 'WAITING_FOR_REVIEW' },
  );
  assert.deepEqual(
    { version: receipt.listingMedia.version, build: receipt.listingMedia.build, state: receipt.listingMedia.state },
    { version: '1.1.1', build: '21', state: 'WAITING_FOR_REVIEW' },
  );
  for (const c of ['KR', 'US', 'JP']) {
    assert.deepEqual(receipt.publicLookup.results[c], { trackId: 6780508628, version: '1.1.0', currentVersionReleaseDate: '2026-11-16T20:21:14Z' }, c);
  }
  assert.match(receipt.pipiThusCommit, /^[0-9a-f]{40}$/);
});

test('receipt: the 1.1.1 set changes only the symposium; unchanged screens carry the 1.1.0 App Store checksums', () => {
  for (const lang of ['ko', 'ja', 'en']) {
    const rows = receipt.screenshots[lang];
    const old = before.screenshots[lang === 'en' ? 'en-US' : lang];
    assert.deepEqual(rows.map(r => r.localSource), slots.map((s, i) => `store_assets/screenshots/20261119/ios/${lang}/0${i + 1}_${s}.png`));
    rows.forEach((r, i) => {
      assert.match(r.md5, /^[0-9a-f]{32}$/);
      assert.equal(r.deliverInputMd5, r.md5, `${lang} ${r.localSource}: fastlane deliver input`);
      assert.deepEqual(r.size, [1320, 2868]);
      assert.equal(r.sameBytesAs20261116, slots[i] !== 'symposium', `${lang} ${slots[i]}`);
      if (r.sameBytesAs20261116) assert.equal(r.md5, old[i].sourceFileChecksum, `${lang} ${slots[i]}: same as the 1.1.0 upload`);
      else assert.notEqual(r.md5, old[i].sourceFileChecksum, `${lang} ${slots[i]}: new screen`);
    });
  }
});

test('new WebPs are the recorded bytes, made from the new symposium screens by the 2026-11-16 rule', () => {
  assert.deepEqual(Object.keys(receipt.derived).sort(), [
    '/assets/apps/dialogos/en/symposium-20261119.webp',
    '/assets/apps/dialogos/ja/symposium-20261119.webp',
    '/assets/apps/dialogos/ko/symposium-20261119.webp',
    '/assets/apps/dialogos/submission/20261119-3.webp',
  ]);
  const rule = path => before.derived[path.includes('/submission/') ? '/assets/apps/dialogos/submission/20261116-3.webp' : '/assets/apps/dialogos/ko/symposium-20261116.webp'].method;
  for (const [path, row] of Object.entries(receipt.derived)) {
    const b = asset(path);
    assert.equal(sha(b), row.sha256, path);
    assert.deepEqual(dims(b), row.size, path);
    assert.deepEqual(row.size, path.includes('/submission/') ? [331, 719] : [540, 1169], path);
    assert.equal(row.method, rule(path), path);
    const lang = path.includes('/submission/') ? 'en' : path.split('/')[4];
    assert.equal(row.from, `store_assets/screenshots/20261119/ios/${lang}/03_symposium.png`, path);
  }
});

test('kept WebPs are unchanged and re-derive from the 1.1.1 set to the same bytes', () => {
  assert.equal(Object.keys(receipt.kept).length, 11);
  for (const [path, row] of Object.entries(receipt.kept)) {
    assert.equal(sha(asset(path)), row.sha256, path);
    assert.equal(before.derived[path].sha256, row.sha256, path);
    assert.match(row.from, /^store_assets\/screenshots\/20261119\/ios\/(ko|ja|en)\/0[124]_/, path);
  }
  for (const path of Object.keys(receipt.retired)) assert.equal(existsSync(new URL(`public${path}`, root)), false, path);
});

test('submission media shows the submitted 1.1.1 listing in review, selection screen first', () => {
  assert.equal(media.version, '1.1.1 (21)');
  assert.equal(media.pending, true);
  assert.equal(media.observedAt, '2026-11-19');
  assert.equal(media.previewIndex, 0);
  assert.deepEqual(media.shots.map(s => s.src), submitted);
  assert.deepEqual(media.shots.map(s => s.source), receipt.listingMedia.shotSources);
  // Shots 1-2: the App Store asset URLs of the same bytes in the 1.1.0 listing.
  assert.deepEqual(media.shots.slice(0, 2).map(s => token(s.source)), before.listingMedia.firstThree.slice(0, 2).map(token));
  // Shot 3: the committed pipi-thus file it was made from, pinned to the receipt's commit.
  assert.equal(media.shots[2].source, `https://github.com/pifl-labs/pipi-thus/blob/${receipt.pipiThusCommit}/${receipt.derived[submitted[2]].from}`);
  for (const s of media.shots) assert.ok(receipt.derived[s.src] || receipt.kept[s.src], s.src);
  const labels = JSON.stringify(media.shots.map(s => s.label));
  assert.doesNotMatch(labels, stale);
  assert.doesNotMatch(labels, oldRound);
  assert.deepEqual(['ko', 'ja', 'en'].map(l => media.shots[2].label[l]), ['향연, 한 철학자의 답을 다른 철학자가 이어받다', '饗宴、一人が答え、もう一人が受けて語る', 'Symposium: one answers, the other takes it up']);
});

for (const lang of ['ko', 'ja', 'en']) test(`${lang}: landing fallback shots describe the new symposium round`, () => {
  const app = apps.dialogos;
  const shots = app.content[lang].shots;
  assert.deepEqual(shots.map(s => s.file), set);
  assert.equal(app.heroShot, 'home-20261116');
  for (const file of set) {
    const path = `/assets/apps/dialogos/${lang}/${file}.webp`;
    assert.ok(receipt.derived[path] || receipt.kept[path], path);
  }
  assert.doesNotMatch(JSON.stringify(shots), stale);
  assert.doesNotMatch(JSON.stringify(shots), oldRound);
  const symposium = shots[2];
  assert.match(`${symposium.label} ${symposium.desc}`, { ko: /이어받다.*이어 말하고.*묻습니다/, ja: /受けて語る.*受けて話を続け.*問いかけます/, en: /takes it up.*takes up what he said.*turns to you/ }[lang]);
});

for (const lang of ['ko', 'ja', 'en']) test(`${lang}: built landing shows the 1.1.1 listing in review; home and archive stay as they were`, () => {
  const landing = bytes(`dist/${lang}/apps/dialogos/index.html`).toString('utf8');
  for (const src of submitted) assert.ok(landing.includes(src), `${lang}: ${src}`);
  assert.match(landing, /<meta property="og:image" content="[^"]*\/assets\/apps\/dialogos\/submission\/20261116-1\.webp"/);
  assert.ok(landing.includes('iOS 1.1.1 (21)'));
  assert.ok(!landing.includes('iOS 1.1.0 (20)'));
  assert.ok(landing.includes(media.shots[2].label[lang]), `${lang}: new symposium label`);
  assert.ok(landing.includes({ ko: '심사 중인 화면은', ja: '審査中の画面は', en: 'Screens under review' }[lang]), `${lang}: review notice`);
  assert.doesNotMatch(landing, oldRound);
  assert.doesNotMatch(landing, /dialogos\/submission\/20261116-3|dialogos\/(ko|ja|en)\/symposium-20261116/);
  const home = bytes(`dist/${lang}/index.html`).toString('utf8');
  assert.ok(home.includes(`href="/${lang}/apps/dialogos/"`), `${lang}: catalog card`);
  assert.ok(!home.includes('/assets/apps/dialogos/submission/'), `${lang}: no screenshot on the home card`);
  const archive = bytes(`dist/${lang}/archive/index.html`).toString('utf8');
  assert.ok(!archive.includes('/assets/apps/dialogos/submission/20261119-3.webp'), `${lang}: submission image stays out of the release timeline`);
  assert.match(archive, /data-event-id="dialogos-shared-1.1.0"/);
});
