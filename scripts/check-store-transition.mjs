#!/usr/bin/env node
import { appIconSrc } from "../src/data/app-icons.mjs";
/** Assert built store-transition copy and cross-platform release/identity contracts. No network. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const names = {
  ko: ['집중항해: 포모도로 타이머', '기존 PiPi Focus'],
  ja: ['集中航海：ポモドーロタイマー', '旧名 PiPi Focus'],
  en: ['Pomodoro at Sea: Focus Timer', 'Previously PiPi Focus'],
};
const unchanged = {
  'pipi-draw': ['밑그림: 사진으로 만드는 색칠공부', '下絵づくり：写真をぬりえに変換', 'Photo Outlines: Coloring Book'],
  'pipi-words': ['단어루틴: JLPT·TOPIK 단어장', 'ことば習慣：韓国語・TOPIK単語帳', 'Vocab Routine: JLPT & TOPIK'],
  'pipi-dday': ['디데이 카운트다운 위젯 - 그날까지', 'Dデイ カウントダウン ウィジェット - その日まで', 'D-Day Widget - Until That Day'],
  'pipi-hello': ['말놀이 새싹: 어린이 일본어', 'ハングルの芽：子どもの韓国語', 'KanaSprout: Japanese for Kids'],
};
const voyageNames = ['낱말항해: 한글 단어 퍼즐', 'ハングル航海：韓国語の単語パズル', 'Hangul Voyage: Korean Puzzle'];
const logNames = ['기분 한 칸: 날씨 감정일기', '気分のひとこま：感情日記', 'Mood Tile: Daily Journal'];
function read(lang, page = '') { return readFileSync(join(dist, lang, page, 'index.html'), 'utf8'); }
function schemas(html) {
  return [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
}
function appSchema(html) { return schemas(html).find(s => s['@type'] === 'SoftwareApplication'); }
function notices(html) { return [...html.matchAll(/<p\b[^>]*class="app-store-name-note[^>]*>(.*?)<\/p>/gs)].map(m => m[1]); }
let checked = 0;
for (const [index, [lang, [name, alias]]] of Object.entries(names).entries()) {
  const home = read(lang);
  const detail = read(lang, 'apps/pipi-focus');
  const fleetNote = home.match(/class="fleet-note"[^>]*>(.*?)<\/p>/s)?.[1];
  // A newly published app can advance the latest check without re-verifying old apps.
  const observationRange = lang === 'en'
    ? fleetNote.match(/Sep 21, 2026 – ([A-Z][a-z]+ \d{1,2}, 2026)/)
    : fleetNote.match(/2026\.09\.21 – (2026\.\d{2}\.\d{2})/);
  assert.ok(observationRange, `${lang}: mixed observation dates must not look all freshly verified`);
  assert.notEqual(observationRange[1], lang === 'en' ? 'Aug 23, 2026' : '2026.08.23');
  const detailSchema = appSchema(detail);
  const homeItems = schemas(home).find(s => s['@type'] === 'ItemList').itemListElement.map(e => e.item);
  const bridge = read(lang, 'apps/pipi-bridge');
  const bridgeSchema = appSchema(bridge);
  const bridgeItem = homeItems.find(a => a.url.endsWith('/pipi-bridge/'));
  assert.ok(bridgeItem && bridgeSchema, `${lang}: Bridge is in public catalog`);
  assert.ok(home.includes(`href="/${lang}/apps/pipi-bridge/"`), `${lang}: Bridge is linked from homepage`);
  assert.ok(bridge.includes('https://apps.apple.com/app/id6801205183'), `${lang}: Bridge Apple destination`);
  assert.ok(bridge.includes('com.pifl.pipi.bridge'), `${lang}: Bridge Play destination`);
  assert.equal(bridgeSchema.softwareVersion, undefined, `${lang}: unverified Android version must not become a shared version`);
  assert.equal(bridgeItem.softwareVersion, undefined, `${lang}: homepage schema must not claim shared version`);
  const bridgeFleetRow = home.match(/<li class="fleet-row">(?:(?!<\/li>).)*Korean Bridge(?:(?!<\/li>).)*<\/li>/s)?.[0];
  assert.ok(bridgeFleetRow, `${lang}: Bridge maintenance row`);
  assert.ok(bridgeFleetRow.includes('v1.0.0'), `${lang}: verified iOS version is visible`);
  assert.ok(!bridgeFleetRow.includes('fleet-both'), `${lang}: no unverified both-store equality claim`);
  const focusItem = homeItems.find(a => a.url.endsWith('/pipi-focus/'));
  for (const item of [detailSchema, focusItem]) {
    assert.equal(item.name, name);
    assert.equal(item.alternateName, 'PiPi Focus');
    assert.equal(item.softwareVersion, undefined, `${lang}: do not generalize iOS version`);
    assert.equal(item.dateModified, '2026-10-05');
    assert.equal(item.datePublished, '2026-05-15');
  }
  assert.ok(detail.includes(`<title>${name} —`), `${lang}: title`);
  assert.ok(detail.includes(alias) && home.includes(alias), `${lang}: discoverable old name`);
  assert.equal(notices(home).length, lang === 'ja' ? 3 : 2, `${lang}: no stale home transition notice after both stores match`);
  assert.equal(notices(detail).length, 0, `${lang}: no stale hero/final CTA transition notice`);
  assert.doesNotMatch(detail, /PiPi Focus: (?:해적 포모도로|海賊ポモドーロ|Pirate Pomodoro)/);
  const release = detail.match(/class="app-rel-line"[^>]*>(.*?)<\/p>/s)?.[1];
  assert.ok(release.includes('iOS v1.0.16'), `${lang}: visible verified iOS-only version`);
  assert.doesNotMatch(detail, /v1\.0\.11|iOS v1\.0\.13/);
  const links = [...detail.matchAll(/<a\b[^>]*data-store-link="([^"]+)"[^>]*>/gs)];
  assert.equal(links.length, 4);
  for (const [i, match] of links.entries()) {
    assert.equal(match[1], i % 2 === 0 ? 'https://apps.apple.com/app/pipi-focus-pirate-pomodoro/id6762258878' : 'https://play.google.com/store/apps/details?id=com.pifl.pipi.focus');
    assert.ok(match[0].includes(name), `${lang}: accessible destination name`);
  }
  assert.ok(detail.includes(`href="https://pifl-labs.com/${lang}/apps/pipi-focus/"`), `${lang}: canonical retained`);
  assert.ok(detail.includes(`src="${appIconSrc("pipi-focus")}"`), `${lang}: approved versioned icon path used`);
  for (const [slug, expectedNames] of Object.entries(unchanged)) {
    const html = read(lang, `apps/${slug}`);
    assert.equal(appSchema(html).name, expectedNames[index], `${lang}/${slug}: no premature rename`);
    assert.equal(notices(html).length, slug === 'pipi-hello' ? 0 : slug === 'pipi-draw' ? (lang === 'ja' ? 2 : 0) : 2, `${lang}/${slug}: exact platform name notices`);
    assert.equal(appSchema(html).softwareVersion, undefined);
    assert.ok(!html.includes('Android v'));
    const iosVersions = { 'pipi-hello': '1.0.8', 'pipi-words': '1.0.11', 'pipi-dday': '1.1.3', 'pipi-draw': '1.1.0' };
    assert.ok(html.includes(`iOS v${iosVersions[slug]}`), `${lang}/${slug}: verified iOS version is labelled`);
  }
  const log = read(lang, 'apps/pipi-log');
  const logSchema = appSchema(log);
  const logItem = homeItems.find(a => a.url.endsWith('/pipi-log/'));
  for (const item of [logSchema, logItem]) {
    assert.equal(item.name, logNames[index], `${lang}: Log public store name`);
    assert.equal(item.alternateName, 'PiPi Log', `${lang}: searchable former name`);
    assert.equal(item.softwareVersion, '1.0.10', `${lang}: both public stores at v1.0.10`);
    assert.equal(item.dateModified, '2026-09-23', `${lang}: public store update date`);
  }
  assert.ok(log.includes(`class="app-id-name"`), `${lang}: Log landing identity`);
  assert.ok(log.includes(logNames[index]), `${lang}: Log landing visible name`);
  assert.ok(log.includes('v1.0.10'), `${lang}: Log landing visible version`);
  if (lang === 'ja') {
    assert.match(log, /<span class="ja-reading-unit"[^>]*>登録不要。<\/span><span class="ja-reading-unit"[^>]*>日記と写真<\/span>/, 'ja: Log lede keeps short reading units intact');
  }
  assert.equal(notices(log).length, 0, `${lang}: same name on both stores`);
  for (const staleClaim of ['통신은 광고 표시에만', '通信は広告表示にのみ', 'network is only used to show ads', 'everything stays on your device']) {
    assert.ok(!log.includes(staleClaim), `${lang}: no misleading Log network/storage claim: ${staleClaim}`);
  }
  assert.ok(log.includes(['인앱 결제', 'アプリ内購入', 'in-app purchases'][index]), `${lang}: Log purchase network use disclosed`);
  assert.ok(log.includes(['프리미엄에서는 생체인증', 'プレミアム購入後は生体認証', 'Premium adds biometric lock'][index]), `${lang}: Log biometric lock disclosed as paid`);
  const voyage = read(lang, 'apps/pipi-word-voyage');
  const voyageSchema = appSchema(voyage);
  const voyageItem = homeItems.find(a => a.url.endsWith('/pipi-word-voyage/'));
  for (const item of [voyageSchema, voyageItem]) {
    assert.equal(item.name, voyageNames[index], `${lang}: public Voyage listing name`);
    assert.equal(item.alternateName, 'PiPi Word Voyage', `${lang}: old name remains searchable`);
    assert.equal(item.softwareVersion, '1.0.7', `${lang}: both publicly verified store versions`);
    assert.equal(item.dateModified, '2026-09-23', `${lang}: both public store update dates`);
  }
  assert.ok(voyage.includes('v1.0.7'), `${lang}: visible release version`);
  assert.equal(notices(voyage).length, 0, `${lang}: stores have the same localized listing name`);
  assert.ok(!voyage.includes(`/assets/apps/pipi-word-voyage/${lang}/home.webp`), `${lang}: stale old-name home shot hidden`);
  assert.ok(!voyage.includes(`/assets/apps/pipi-word-voyage/${lang}/logbook.webp`), `${lang}: misleading all-words shot hidden`);
  for (const shot of ['game', 'voyage', 'daily']) {
    assert.ok(voyage.includes(`/assets/apps/pipi-word-voyage/${lang}/${shot}.webp`), `${lang}: factual ${shot} shot retained`);
  }
  for (const oldClaim of [
    '표준국어대사전을 바탕으로 검증한 낱말만', '발견한 모든 낱말', '통신은 광고 표시에만',
    '標準国語大辞典で検証した単語だけ', '発見したすべての単語', '通信は広告表示にのみ使用',
    'Every word is validated', 'Every word you discover', 'network is only used to show ads',
  ]) assert.ok(!voyage.includes(oldClaim), `${lang}: no unverified claim: ${oldClaim}`);
  assert.ok(voyage.includes('com.pifl.pipi.wordvoyage'), `${lang}: Google Play destination retained`);
  assert.ok(voyage.includes('id6788949612'), `${lang}: App Store destination retained`);
  // Existing split-version app: preserve the source snapshot without collapsing it to one version.
  const hello = read(lang, 'apps/pipi-hello');
  assert.ok(hello.includes('iOS v1.0.8'));
  assert.ok(!hello.includes('Android v'));
  assert.ok(!Object.hasOwn(appSchema(hello), 'softwareVersion'));
  assert.ok(!Object.hasOwn(homeItems.find(a => a.url.endsWith('/pipi-hello/')), 'softwareVersion'));
  // Equal-platform versions still carry their existing shared version.
  assert.equal(appSchema(read(lang, 'apps/pipi-draw')).softwareVersion, undefined);
  checked++;
}
console.log(`PASS: ${checked} locales — Focus, Word Voyage, and Log public names/versions; aliases, store destinations; 4 additional app identities and iOS-only version labels checked.`);
