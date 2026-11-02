import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { apps } from '../src/data/apps.ts';

// Each copy change made for the 2026-11-02 sync is paired with the store sentence that supports it.
// Store text comes from the receipt (full Play descriptions, iOS descriptions/notes, Play badges).
const receipt = JSON.parse(readFileSync(new URL('../docs/release/homepage-app-audit-20261102.json', import.meta.url), 'utf8')).apps;
const catalogSrc = readFileSync(new URL('../src/data/app-catalog.ts', import.meta.url), 'utf8');
const catalog = runInNewContext(catalogSrc.slice(catalogSrc.indexOf('export const catalogCopy')).replace(/export const catalogCopy: [^=]+=/, 'const copy =') + '\ncopy');
const seen = (slug) => receipt.find((a) => a.slug === slug);
const store = (slug, platform, lang) => {
  const a = seen(slug);
  return platform === 'ios' ? `${a.ios[lang].description}\n${a.ios[lang].releaseNotes}` : a.android[lang].description;
};
const media = JSON.parse(readFileSync(new URL('../src/data/app-submission-media.json', import.meta.url), 'utf8'));
// Rendered copy only: apps with submission media show those images, so their content.shots labels are not rendered.
const site = (slug, lang) => {
  const { shots, ...rendered } = apps[slug].content[lang];
  return `${JSON.stringify(media[slug] ? rendered : { ...rendered, shots })}\n${catalog[slug][lang]}`;
};

const claims = [
  // Mood Tile: no ads or tracking; lock and backup are free; optional one-time supporter purchase
  ['pipi-log', 'ko', '잠금과 백업을 포함한 모든 기록 기능이 무료', 'android', '기록·잠금·백업 등 모든 기록 기능은 무료'],
  ['pipi-log', 'ko', '광고·추적 없음', 'android', '광고와 추적이 없습니다'],
  ['pipi-log', 'ja', 'ロックとバックアップを含む記録機能はすべて無料', 'android', '記録・ロック・バックアップなど、記録機能はすべて無料'],
  ['pipi-log', 'ja', '広告・トラッキングなし', 'android', '広告もトラッキングもありません'],
  ['pipi-log', 'en', 'No ads or tracking', 'android', 'No ads and no tracking'],
  ['pipi-log', 'en', 'Lifetime Supporter', 'android', 'Lifetime Supporter'],
  // Until That Day 2.0: free 5 dates, one-time Pro, widget layouts, categories
  ['pipi-dday', 'ko', '날짜 5개까지 무료', 'android', '무료: 날짜 5개'],
  ['pipi-dday', 'ko', 'Pro는 한 번 결제', 'android', 'Pro(한 번 결제, 구독 아님)'],
  ['pipi-dday', 'ko', '사진 크게·날짜 크게·여러 일정·진행 막대·달력', 'android', '위젯 모양: 사진 크게, 날짜 크게, 여러 일정, 진행 막대, 달력'],
  ['pipi-dday', 'ja', '日付5件まで無料', 'android', '無料：日付5件'],
  ['pipi-dday', 'ja', '写真・日数・予定一覧・進み具合・カレンダー', 'android', 'ウィジェットの形：写真、日数、予定一覧、進み具合、カレンダー'],
  ['pipi-dday', 'en', '5 dates free', 'android', 'Free: 5 dates'],
  ['pipi-dday', 'en', 'photo, big number, several dates, progress bar or calendar', 'android', 'Widget layouts: photo, big number, several dates, progress bar and calendar'],
  // Sudoku: four courses, 600 puzzles, daily puzzle, both stores
  ['pipi-sudoku', 'ko', '코스 4개, 검증된 퍼즐 600개', 'ios', '코스 4개, 검증된 퍼즐 600개'],
  ['pipi-sudoku', 'ja', '4つのコース・検証済みの600問', 'ios', '4つのコース、検証済みの600問'],
  ['pipi-sudoku', 'en', 'Four courses, 600 verified puzzles', 'ios', '600 VERIFIED PUZZLES IN FOUR COURSES'],
  // Tidewalk: start a crossing, then a notification counts down; 13 sea roads
  ['pipi-tide', 'ko', "'건너가기 시작'이나 '지금 들어가요'를 누르면", 'android', "'건너가기 시작'이나 '지금 들어가요'를 누르면"],
  ['pipi-tide', 'ko', '전국 바닷길 13곳', 'android', '전국 바닷길 13곳'],
  ['pipi-tide', 'en', 'Start crossing', 'android', 'Start crossing'],
  ['pipi-tide', 'en', '13 Korean sea roads', 'android', '13'],
  // Kkachi: a folk painting from your Saju; no sign-up, ads or server; entertainment disclaimer
  ['kkachi', 'ko', '내 사주로 한국 민화 한 폭을 그려 드려요', 'android', '내 사주로 한국 민화 한 폭을 그려 드려요'],
  ['kkachi', 'ko', '회원가입·광고·서버 전송 없이', 'android', '회원가입, 광고, 서버 전송이 없어요'],
  ['kkachi', 'ko', '미래를 예측하거나 보장하지 않아요', 'android', '미래를 예측하거나 보장하지 않으며'],
  ['kkachi', 'ja', '会員登録・広告・サーバー送信なし', 'android', '会員登録、広告、サーバーへの送信はありません'],
  ['kkachi', 'en', 'No sign-up, no ads, nothing sent to a server', 'android', 'No sign-up, no ads, no server.'],
  // Photo Outlines: fourth coloring-page style
  ['pipi-draw', 'ko', '만화풍', 'ios', '원본 느낌 · 동화풍 · 꼬마 캐릭터 · 만화풍'],
  ['pipi-draw', 'ja', 'マンガ風', 'android', '写真らしく・絵本風・ちびキャラ・マンガ風'],
  ['pipi-draw', 'en', 'Digital Comic', 'ios', 'True to Photo, Storybook, Chibi and Digital Comic'],
  // Korean Bridge: the short break comes after the fifth of ten activities
  ['pipi-bridge', 'ko', '다섯 번째 활동 뒤 짧은 쉼', 'android', '5개 뒤에는 눈과 몸을 위한 짧은 쉼'],
  ['pipi-bridge', 'en', 'a short break after the fifth', 'android', 'a short blink-and-stretch break after activity five'],
];

for (const [slug, lang, siteText, platform, storeText] of claims) {
  test(`${slug}/${lang}: "${siteText}" is supported by the ${platform} listing`, () => {
    assert.ok(site(slug, lang).includes(siteText), 'site copy present');
    assert.ok(store(slug, platform, lang).toLowerCase().includes(storeText.toLowerCase()), 'store sentence present');
  });
}

test('stale claims the listings no longer support are gone from all three languages and the built pages', () => {
  for (const lang of ['ko', 'ja', 'en']) {
    const built = readFileSync(new URL(`../dist/${lang}/apps/pipi-dday/index.html`, import.meta.url), 'utf8');
    assert.doesNotMatch(built, /PiPi가 6단계|스킨 6종|スキン6種|6 skins|카테고리 8종|カテゴリー8種|8 categories/, `${lang}: built D-Day page`);
  }
  const all = (slug) => ['ko', 'ja', 'en'].map((l) => site(slug, l)).join('\n');
  assert.doesNotMatch(all('pipi-dday'), /PiPi|스킨 6종|スキン6種|6 skins|카테고리 8종|カテゴリー8種|8 categories|광고 표시에만|広告表示にのみ|only used to show ads/);
  assert.doesNotMatch(all('pipi-log'), /생체인증|生体認証|biometric|with ads/);
  assert.doesNotMatch(all('pipi-sudoku'), /300/);
  assert.doesNotMatch(all('kkachi'), /준비 중|準備中|not publicly released|공개 출시되지 않았|一般公開はまだ/);
  for (const lang of ['ko', 'ja', 'en']) assert.doesNotMatch(store('pipi-dday', 'android', lang), /PiPi/, 'the 2.0 listing never mentions PiPi');
});

test('Play badges match the ads and purchase statements', () => {
  for (const lang of ['ko', 'ja', 'en']) {
    for (const slug of ['pipi-log', 'kkachi']) {
      assert.equal(seen(slug).android[lang].badges.inAppPurchases, true, `${slug}/${lang}: optional purchases disclosed`);
    }
  }
  for (const lang of ['ko', 'en']) {
    for (const slug of ['pipi-log', 'kkachi']) assert.equal(seen(slug).android[lang].badges.containsAds, false, `${slug}/${lang}: no ads badge`);
    assert.equal(seen('pipi-tide').android[lang].badges.containsAds, true, 'Tidewalk shows ads');
  }
  assert.ok(site('kkachi', 'ko').includes('앱 안에 유료 상품이 있어요'));
  assert.ok(site('kkachi', 'en').includes('Offers in-app purchases'));
});
