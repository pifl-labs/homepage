import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {archiveEvents} from '../src/data/archive.mjs';
import {publicArchiveEvents} from '../src/data/archive-public.mjs';
import {releaseHighlights} from '../src/data/archive-release-highlights-20261117.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const sources = JSON.parse(read('public/archive-release-notes-20261117.json')).records;
const enriched = archiveEvents.filter(event => event.contentEvidence);
const event = id => archiveEvents.find(e => e.id === id);
const sha = text => createHash('sha256').update(text).digest('hex');

test('all 27 current observations and 10 previously vague historical releases have sourced highlights', () => {
  assert.equal(enriched.length, 37);
  assert.equal(sources.length, enriched.length);
  assert.equal(new Set(sources.map(s => s.id)).size, sources.length);
  for (const e of enriched) {
    const source = sources.find(s => s.id === e.id);
    assert.ok(source, e.id);
    for (const key of ['app', 'version', 'platform']) assert.equal(source[key], e[key], e.id + '/' + key);
    assert.equal(source.kind, e.contentEvidence.kind);
    assert.equal(source.notesSha256, sha(source.notes));
    assert.ok(source.notes.length > 40);
    for (const lang of ['ko', 'ja', 'en']) {
      assert.ok(e.title[lang] && e.summary[lang]);
      assert.doesNotMatch(e.summary[lang], /상세.*미확인|変更内容は未確認|detailed changes are not established|detailed feature changes remain unverified/i);
    }
    if (source.kind === 'store-release-notes') {
      assert.equal(source.sourceUrl, e.url);
      assert.ok(['apps.apple.com', 'play.google.com'].includes(new URL(source.sourceUrl).hostname));
      assert.ok(source.capturedAt.startsWith('2026-11-17'));
      if (e.platform === 'android') assert.ok(source.versionCheckedAt);
    } else {
      assert.match(source.reference, /^[a-f0-9]{40}$/);
      assert.match(source.documentSha256, /^[a-f0-9]{64}$/);
      assert.ok(source.path.startsWith('docs/release/') || source.path.endsWith('/release_notes.txt'));
    }
  }
  assert.equal(enriched.filter(e => e.id.endsWith('-observed-20261117')).length, 27);
  assert.equal(new Set(enriched.map(e => `${e.app}@${e.version}${e.app === 'pipi-tide' ? '@' + e.platform : ''}`)).size, Object.keys(releaseHighlights).length);
});

test('platforms and evidence types are not collapsed into assumed release parity', () => {
  const ios = event('pipi-hello-ios-observed-20261117');
  const android = event('pipi-hello-android-observed-20261117');
  assert.equal(ios.version, '1.1.1');
  assert.equal(android.version, '1.1.0');
  assert.match(ios.summary.ko, /헷갈린 글자/);
  assert.match(android.summary.ko, /그림책/);
  assert.doesNotMatch(android.summary.ko, /헷갈린 글자/);
  assert.equal(event('pipi-tide-ios-observed-20261117').contentEvidence.kind, 'version-release-document');
  assert.equal(event('pipi-tide-android-observed-20261117').contentEvidence.kind, 'store-release-notes');
  assert.doesNotMatch(event('pipi-tide-android-observed-20261117').summary.en, /Dynamic Island|Lock Screen/);
  assert.match(event('pipi-draw-ios-observed-20261117').summary.en, /without changing screens/);
  assert.match(event('pipi-words-public').summary.en, /no automatic grading/);
  assert.match(event('pipi-bp-android-observed-20261117').summary.en, /does not measure blood pressure/);
});

test('enrichment never turns submissions and approvals into feature releases', () => {
  for (const e of archiveEvents.filter(e => ['approved', 'submitted', 'asset'].includes(e.kind))) assert.equal(e.contentEvidence, undefined, e.id);
  for (const e of enriched) {
    assert.equal(e.timeBasis, e.kind === 'released' ? 'public-store-update' : 'observation-date');
    assert.equal(e.contentEvidence.checkedAt, '2026-11-17');
  }
  assert.equal(event('pipi-words-public').date, '2026-10-05');
  assert.equal(event('focus-121').region, 'JP · US');
  assert.equal(event('focus-120').region, 'KR');
  const publicEvidence = JSON.parse(read('public/archive-evidence.json'));
  assert.deepEqual(publicEvidence.events, publicArchiveEvents);
});

test('public evidence contains no mail bodies, console identifiers or local filesystem paths', () => {
  const raw = read('public/archive-release-notes-20261117.json');
  assert.doesNotMatch(raw, /Received:|Message-ID:|Authorization:|Bearer |\/Users\/|review_information|WAITING_FOR_REVIEW|submissionId|message_ids/);
});

for (const lang of ['ko','ja','en']) test(`${lang}: rendered summaries and traceable evidence replace boilerplate`, () => {
  const html = read(`dist/${lang}/archive/index.html`);
  assert.equal((html.match(/href="\/archive-release-notes-20261117.json"/g) || []).length, 37);
  assert.doesNotMatch(html, /이 기록의 상세 기능 변경 내용은 미확인입니다|この記録の詳しい機能変更は未確認|detailed feature changes remain unverified/);
  assert.ok(html.includes(event('pipi-focus-ios-observed-20261117').title[lang]));
});
