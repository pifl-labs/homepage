#!/usr/bin/env node
import { appIconSrc } from "../src/data/app-icons.mjs";
/** Assert built store-transition copy and cross-platform release/identity contracts. No network. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
// Expected release facts come from the latest public receipt, not from hand-typed versions.
const receipt = JSON.parse(readFileSync(new URL('../docs/release/homepage-app-audit-20261102.json', import.meta.url), 'utf8')).apps;
const seen = (slug) => receipt.find((a) => a.slug === slug);
const laterLogIOS = JSON.parse(readFileSync(new URL('../docs/release/log-ios-public-20261106.json', import.meta.url), 'utf8'));
const laterBridgeIOS = JSON.parse(readFileSync(new URL('../docs/release/bridge-ios-public-20261111.json', import.meta.url), 'utf8'));
const laterVoyageAndroid = JSON.parse(readFileSync(new URL('../docs/release/voyage-android-public-20261113.json', import.meta.url), 'utf8'));
const laterVoyageIOS = JSON.parse(readFileSync(new URL('../docs/release/voyage-ios-public-20261113.json', import.meta.url), 'utf8'));
const laterIOS = { 'pipi-log': laterLogIOS, 'pipi-bridge': laterBridgeIOS, 'pipi-word-voyage': laterVoyageIOS };
const laterAndroid = { 'pipi-word-voyage': laterVoyageAndroid };
const iosRecord = slug => laterIOS[slug]?.apps.find(r=>r.lang==='en').app ?? seen(slug).ios.en;
const androidRecord = slug => laterAndroid[slug]?.apps.find(r=>r.lang==='en').app ?? seen(slug).android.en;
const iosVersion = (slug) => iosRecord(slug).version;
const androidVersion = (slug) => androidRecord(slug).version;
const shared = (slug) => (iosVersion(slug) === androidVersion(slug) ? iosVersion(slug) : undefined);
const iosDay = (slug) => iosRecord(slug).currentVersionReleaseDate.slice(0, 10);
const playDay = (slug) => new Date(`${androidRecord(slug).updatedDisplay} UTC`).toISOString().slice(0, 10);
const latestDay = (slug) => [iosDay(slug), playDay(slug)].sort().at(-1);
const { liveApps, formatDate } = await import('../src/data/apps.ts');
// Expected observation days come from the receipt, so a wrong checkedAt in apps.ts cannot set its own expectation.
const observationDates = [...new Set(liveApps.filter(app=>app.release).flatMap((app) => {
  assert.ok(seen(app.slug), `${app.slug}: versioned app requires its own receipt`);
  return [seen(app.slug).observedAt, ...(laterIOS[app.slug] ? [laterIOS[app.slug].observedAt] : []), ...(laterAndroid[app.slug] ? [laterAndroid[app.slug].observedAt] : [])];
}))].sort();
const observationRange = [observationDates[0], observationDates.at(-1)].filter((d, i, all) => i === 0 || d !== all[0]);
const versionToken = (prefix, version) => new RegExp(`(?:^|[^\\w.])${prefix}v${version.replace(/\./g, '\\.')}(?![\\w.])`);
function expectVersionLabel(html, slug, where) {
  const common = shared(slug);
  if (common) {
    assert.match(html, versionToken('', common), `${where}: one shared verified version`);
    assert.ok(!html.includes('iOS v') && !html.includes('Android v'), `${where}: no per-platform label for a shared version`);
  } else {
    assert.match(html, versionToken('iOS ', iosVersion(slug)), `${where}: iOS version stays separate`);
    assert.match(html, versionToken('Android ', androidVersion(slug)), `${where}: Android version stays separate`);
  }
}
const names = {
  ko: ['집중항해: 포모도로 타이머', '기존 PiPi Focus'],
  ja: ['集中航海：ポモドーロタイマー', '旧名 PiPi Focus'],
  en: ['Pomodoro at Sea: Focus Timer', 'Previously PiPi Focus'],
};
const unchanged = {
  'pipi-draw': ['밑그림: 사진으로 만드는 색칠공부', '下絵づくり：写真をぬりえに変換', 'Photo Outlines: Coloring Book'],
  'pipi-words': ['단어루틴: JLPT·TOPIK 단어장', 'ことば習慣：韓国語・TOPIK単語帳', 'Vocab Routine: JLPT & TOPIK'],
  'pipi-dday': ['그날까지: 디데이·기념일 위젯', 'その日まで：カウントダウン', 'Until That Day: Countdown'],
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
  const fleetNoteHTML = home.match(/class="fleet-note"[^>]*>(.*?)<\/p>/s)?.[1];
  const fleetNote = fleetNoteHTML?.replace(/<[^>]*>/g, '');
  assert.equal((fleetNoteHTML?.match(/<time datetime="2026-[^"]+" style="white-space: nowrap">/g) ?? []).length, observationRange.length, `${lang}: each full observation date remains a short semantic unit`);
  // Mixed observation days render as a range; a single re-check of every app renders one date.
  for (const date of observationRange) assert.ok(fleetNote.includes(formatDate(date, lang)), `${lang}: observation ${date} shown`);
  if (observationRange.length === 2) assert.ok(fleetNote.includes(' – '), `${lang}: mixed observation dates must not look all freshly verified`);
  const detailSchema = appSchema(detail);
  const homeItems = schemas(home).find(s => s['@type'] === 'ItemList').itemListElement.map(e => e.item);
  const bridge = read(lang, 'apps/pipi-bridge');
  const bridgeSchema = appSchema(bridge);
  const bridgeItem = homeItems.find(a => a.url.endsWith('/pipi-bridge/'));
  assert.ok(bridgeItem && bridgeSchema, `${lang}: Bridge is in public catalog`);
  assert.ok(home.includes(`href="/${lang}/apps/pipi-bridge/"`), `${lang}: Bridge is linked from homepage`);
  assert.ok(bridge.includes('https://apps.apple.com/app/id6801205183'), `${lang}: Bridge Apple destination`);
  assert.ok(bridge.includes('com.pifl.pipi.bridge'), `${lang}: Bridge Play destination`);
  assert.equal(bridgeSchema.softwareVersion, shared('pipi-bridge'), `${lang}: shared version only when both stores verify it`);
  assert.equal(bridgeItem.softwareVersion, shared('pipi-bridge'), `${lang}: homepage schema follows the same rule`);
  const bridgeFleetRow = home.match(/<li class="fleet-row">(?:(?!<\/li>).)*Korean Bridge(?:(?!<\/li>).)*<\/li>/s)?.[0];
  assert.ok(bridgeFleetRow, `${lang}: Bridge maintenance row`);
  assert.ok(bridgeFleetRow.includes(`v${iosVersion('pipi-bridge')}`), `${lang}: verified version is visible`);
  assert.equal(bridgeFleetRow.includes('fleet-both'), Boolean(shared('pipi-bridge')), `${lang}: both-store label only for verified equal versions`);
  const focusItem = homeItems.find(a => a.url.endsWith('/pipi-focus/'));
  for (const item of [detailSchema, focusItem]) {
    assert.equal(item.name, name);
    assert.equal(item.alternateName, 'PiPi Focus');
    assert.equal(item.softwareVersion, shared('pipi-focus'), `${lang}: shared version only when both stores verify it`);
    assert.equal(item.dateModified, latestDay('pipi-focus'));
    assert.equal(item.datePublished, undefined);
  }
  assert.ok(detail.includes(`<title>${name} —`), `${lang}: title`);
  assert.ok(detail.includes(alias) && home.includes(alias), `${lang}: discoverable old name`);
  // 2026-11-02: Draw's Korean and Japanese Google Play names differ from its App Store names; every other app matches.
  assert.equal(notices(home).length, lang === 'en' ? 0 : 1, `${lang}: store-name notice only where the stores differ`);
  assert.equal(notices(detail).length, 0, `${lang}: no stale hero/final CTA transition notice`);
  assert.doesNotMatch(detail, /PiPi Focus: (?:해적 포모도로|海賊ポモドーロ|Pirate Pomodoro)/);
  const release = detail.match(/class="app-rel-line"[^>]*>(.*?)<\/p>/s)?.[1];
  expectVersionLabel(release, 'pipi-focus', `${lang}/pipi-focus`);
  assert.doesNotMatch(release, /v1\.2\.0|v1\.0\.16/);
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
    assert.equal(notices(html).length, slug === 'pipi-draw' && lang !== 'en' ? 2 : 0, `${lang}/${slug}: exact platform name notices`);
    assert.equal(appSchema(html).softwareVersion, shared(slug), `${lang}/${slug}: shared version only when both stores verify it`);
    expectVersionLabel(html.match(/class="app-rel-line"[^>]*>(.*?)<\/p>/s)?.[1] ?? '', slug, `${lang}/${slug}`);
  }
  const log = read(lang, 'apps/pipi-log');
  const logSchema = appSchema(log);
  const logItem = homeItems.find(a => a.url.endsWith('/pipi-log/'));
  for (const item of [logSchema, logItem]) {
    assert.equal(item.name, logNames[index], `${lang}: Log public store name`);
    assert.equal(item.alternateName, 'PiPi Log', `${lang}: searchable former name`);
    assert.equal(item.softwareVersion, shared('pipi-log'), `${lang}: shared version only when both stores verify it`);
    assert.equal(item.dateModified, latestDay('pipi-log'), `${lang}: public store update date`);
  }
  assert.ok(log.includes(`class="app-id-name"`), `${lang}: Log landing identity`);
  assert.ok(log.includes(logNames[index]), `${lang}: Log landing visible name`);
  expectVersionLabel(log.match(/class="app-rel-line"[^>]*>(.*?)<\/p>/s)?.[1] ?? '', 'pipi-log', `${lang}/pipi-log`);
  if (lang === 'ja') {
    assert.match(log, /<span class="ja-reading-unit"[^>]*>登録不要。<\/span><span class="ja-reading-unit"[^>]*>日記と写真<\/span>/, 'ja: Log lede keeps short reading units intact');
  }
  assert.equal(notices(log).length, 0, `${lang}: same name on both stores`);
  for (const staleClaim of ['통신은 광고 표시에만', '通信は広告表示にのみ', 'network is only used to show ads', 'everything stays on your device']) {
    assert.ok(!log.includes(staleClaim), `${lang}: no misleading Log network/storage claim: ${staleClaim}`);
  }
  // 2026-11-02 listings: no ads or tracking; lock, backup and every journaling feature are free; store payments use the network.
  assert.ok(log.includes(['잠금과 백업을 포함한 모든 기록 기능이 무료', 'ロックとバックアップを含む記録機能はすべて無料', 'Lock, backup and every other journaling feature are free'][index]), `${lang}: Log free lock disclosed`);
  assert.ok(log.includes(['스토어 결제에는 네트워크를 사용합니다', 'ストア決済にはネットワークを使います', 'store payments use the network'][index]), `${lang}: Log store-payment network use disclosed`);
  for (const paid of ['프리미엄에서는 생체인증', 'プレミアム購入後は生体認証', 'Premium adds biometric lock', '프리미엄 생체인증', 'プレミアムの生体認証', 'Free download with ads']) {
    assert.ok(!log.includes(paid), `${lang}: no stale paid-lock or ads claim: ${paid}`);
  }
  const voyage = read(lang, 'apps/pipi-word-voyage');
  const voyageSchema = appSchema(voyage);
  const voyageItem = homeItems.find(a => a.url.endsWith('/pipi-word-voyage/'));
  for (const item of [voyageSchema, voyageItem]) {
    assert.equal(item.name, voyageNames[index], `${lang}: public Voyage listing name`);
    assert.equal(item.alternateName, 'PiPi Word Voyage', `${lang}: old name remains searchable`);
    assert.equal(item.softwareVersion, shared('pipi-word-voyage'), `${lang}: shared version only when both stores verify it`);
    assert.equal(item.dateModified, latestDay('pipi-word-voyage'), `${lang}: latest public store update date`);
  }
  expectVersionLabel(voyage.match(/class="app-rel-line"[^>]*>(.*?)<\/p>/s)?.[1] ?? '', 'pipi-word-voyage', `${lang}/pipi-word-voyage`);
  assert.equal(notices(voyage).length, 0, `${lang}: stores have the same localized listing name`);
  assert.ok(!voyage.includes(`/assets/apps/pipi-word-voyage/${lang}/home.webp`), `${lang}: stale old-name home shot hidden`);
  assert.ok(!voyage.includes(`/assets/apps/pipi-word-voyage/${lang}/logbook.webp`), `${lang}: misleading all-words shot hidden`);
  for (const shot of [1, 2, 3]) {
    assert.ok(voyage.includes(`/assets/apps/pipi-word-voyage/submission/20261023-${shot}.webp`), `${lang}: current listing screenshot ${shot}`);
  }
  assert.ok(voyage.includes(`${seen('pipi-word-voyage').listingMedia.version} (${seen('pipi-word-voyage').listingMedia.build})`), `${lang}: attached listing build identified`);
  for (const oldClaim of [
    '표준국어대사전을 바탕으로 검증한 낱말만', '발견한 모든 낱말', '통신은 광고 표시에만',
    '標準国語大辞典で検証した単語だけ', '発見したすべての単語', '通信は広告表示にのみ使用',
    'Every word is validated', 'Every word you discover', 'network is only used to show ads',
  ]) assert.ok(!voyage.includes(oldClaim), `${lang}: no unverified claim: ${oldClaim}`);
  assert.ok(voyage.includes('com.pifl.pipi.wordvoyage'), `${lang}: Google Play destination retained`);
  assert.ok(voyage.includes('id6788949612'), `${lang}: App Store destination retained`);
  // Split versions (Words: iOS 1.0.14, Android 1.1.0) never collapse into one; equal verified versions are shared.
  const words = read(lang, 'apps/pipi-words');
  expectVersionLabel(words.match(/class="app-rel-line"[^>]*>(.*?)<\/p>/s)?.[1] ?? '', 'pipi-words', `${lang}/pipi-words`);
  assert.ok(!Object.hasOwn(appSchema(words), 'softwareVersion'));
  assert.equal(homeItems.find(a => a.url.endsWith('/pipi-hello/')).softwareVersion, shared('pipi-hello'));
  assert.equal(appSchema(read(lang, 'apps/pipi-draw')).softwareVersion, shared('pipi-draw'));
  // Apps public on one platform only (or with differing versions) never get a shared version or both-store label.
  const fleetRows = [...home.matchAll(/<li class="fleet-row">(.*?)<\/li>/gs)].map((m) => m[1]);
  for (const slug of ['pipi-tide', 'kkachi', 'pipi-words']) {
    const page = read(lang, `apps/${slug}`);
    assert.ok(!Object.hasOwn(appSchema(page), 'softwareVersion'), `${lang}/${slug}: no shared softwareVersion`);
    assert.ok(!Object.hasOwn(homeItems.find((a) => a.url.endsWith(`/${slug}/`)), 'softwareVersion'), `${lang}/${slug}: home schema has no shared version`);
    const row = fleetRows.find((r) => r.includes(`href="/${lang}/apps/${slug}/"`));
    assert.ok(row && !row.includes('fleet-both'), `${lang}/${slug}: no both-store label`);
    if (slug !== 'pipi-words') {
      const line = page.match(/class="app-rel-line"[^>]*>(.*?)<\/p>/s)?.[1] ?? '';
      assert.match(line, versionToken('Android ', androidVersion(slug)), `${lang}/${slug}: Android-only label`);
      assert.ok(!line.includes('iOS v') && !page.includes('href="https://apps.apple.com/'), `${lang}/${slug}: no iOS version or App Store link`);
      assert.equal(appSchema(page).operatingSystem, 'Android', `${lang}/${slug}: Android only`);
    }
  }
  checked++;
}
console.log(`PASS: ${checked} locales — Focus, Word Voyage, and Log public names/versions; aliases, store destinations; 4 additional app identities and receipt-derived version labels checked.`);
