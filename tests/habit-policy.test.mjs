import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// 습관 트래커(pipi-habit, 스토어 영문명 Habit Tracker: Goals & Routine) 개인정보처리방침의 빌드 결과(dist/)를 검사한다.
// npm run build 뒤에 실행해야 하며, dist/ 가 없으면 이유를 남기고 건너뛴다.
// 앱 사실 근거는 pipi_habit 의 docs/release/_app-facts.md(feat/release-required, 2026-10-27)와 앱 코드다:
// AdMob(배너·전면·보상형)+UMP+iOS ATT, Firebase Analytics 만(광고 ID 수집 끔, iOS IDFV 는 기본 수집),
// Pro 비소모성 1회 구매(com.pifl.pipi.habit.pro, 서버 영수증 검증 없음), 서버·계정·백업·동기화 없음.
const SITE = 'https://pifl-labs.com';
const LOCALES = ['ko', 'en', 'ja'];
const PREFIXES = [...LOCALES, ''];
const file = prefix => new URL(`../dist/${prefix ? `${prefix}/` : ''}apps/pipi-habit/privacy/index.html`, import.meta.url);
const skip = !existsSync(file('ko')) && 'dist/ 가 없습니다 — npm run build 뒤에 실행하세요';
const read = prefix => readFileSync(file(prefix), 'utf8');
const main = html => html.match(/<main class="legal-page">([\s\S]*?)<\/main>/)?.[1] ?? '';
const url = locale => `${SITE}/${locale}/apps/pipi-habit/privacy/`;
const canonical = html => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const alternates = html => Object.fromEntries(
  [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(m => [m[1], m[2]]),
);
const name = prefix => prefix || 'root';
const EFFECTIVE = { ko: '2026년 10월 27일', en: 'October 27, 2026', ja: '2026年10月27日', '': 'October 27, 2026' };

for (const locale of LOCALES) {
  test(`${locale}: own canonical, ko/en/ja hreflang and x-default /ko/`, { skip }, () => {
    const html = read(locale);
    assert.match(html, new RegExp(`<html lang="${locale}"`));
    assert.equal(canonical(html), url(locale));
    assert.deepEqual(alternates(html), { en: url('en'), ko: url('ko'), ja: url('ja'), 'x-default': url('ko') });
  });
}

test('unprefixed path renders English with the /en/ canonical', { skip }, () => {
  const html = read('');
  assert.match(html, /<html lang="en"/);
  assert.equal(canonical(html), url('en'));
  assert.equal(alternates(html)['x-default'], url('ko'));
});

test('effective date, obfuscated privacy email only, current company address', { skip }, () => {
  for (const prefix of PREFIXES) {
    const body = main(read(prefix));
    assert.ok(body.includes(EFFECTIVE[prefix]), `${name(prefix)}: 시행일 2026-10-27`);
    assert.doesNotMatch(body, /mailto:/i);
    assert.doesNotMatch(body, /andrew\.kim/i);
    assert.match(body, /data-email-user="privacy" data-email-domain="pifl-labs\.com"/);
    assert.match(body, /죽성서길 59|59 Jukseongseo-gil/, `${name(prefix)}: 법인 주소`);
    assert.doesNotMatch(body, /아란서길|Aranseo/);
  }
});

// 앱은 광고·분석을 위해 네트워크를 쓴다 — "광고 없음/추적 없음/수집 없음" 류 문장이 들어오면 안 되고,
// AdMob·UMP·ATT·Firebase Analytics 와 iOS IDFV·도시 수준 위치(App Store 라벨 범위)가 적혀 있어야 한다.
test('ads, consent and analytics are disclosed; no "no ads / no tracking" claims', { skip }, () => {
  const city = { ko: '도시·지역·국가', ja: '市区町村・地域・国', en: 'city, region, country', '': 'city, region, country' };
  const adChoices = { ko: '광고 개인정보 선택', ja: '広告のプライバシー設定', en: 'Ad privacy choices', '': 'Ad privacy choices' };
  const stale = /shows no ads|contains no advertising SDK|광고를 보여 주지 않으며|광고 SDK를 포함하지 않|広告を表示せず|広告SDKを含みません/;
  for (const prefix of PREFIXES) {
    const body = main(read(prefix));
    for (const re of [/AdMob/, /User Messaging Platform/, /App Tracking Transparency/, /Firebase Analytics/, /IDFV/, /IDFA\/AAID/]) {
      assert.match(body, re, `${name(prefix)}: ${re}`);
    }
    assert.ok(body.includes(city[prefix]), `${name(prefix)}: 도시 수준 위치`);
    assert.ok(body.includes(adChoices[prefix]), `${name(prefix)}: 앱 설정 '광고 개인정보 선택' 라벨`);
    assert.doesNotMatch(body, stale, `${name(prefix)}: 광고 없음 류 문장`);
  }
});

test('Pro is a one-time purchase without server receipt validation', { skip }, () => {
  const noServerCheck = {
    ko: /회사 서버에서 영수증을 검증하지 않습니다/,
    en: /we do not verify receipts on any server of ours/,
    ja: /当社のサーバーでレシートを検証することもありません/,
    '': /we do not verify receipts on any server of ours/,
  };
  for (const prefix of PREFIXES) {
    const body = main(read(prefix));
    assert.ok(body.includes('com.pifl.pipi.habit.pro'), `${name(prefix)}: 상품 ID`);
    assert.match(body, noServerCheck[prefix], `${name(prefix)}: 서버 영수증 검증 없음`);
    assert.doesNotMatch(body, /subscription (?:plan|price)|구독료|定期購読/i);
  }
});

test('U.S. state privacy and GDPR (EEA/UK/CH) sections are present', { skip }, () => {
  for (const prefix of PREFIXES) {
    const body = main(read(prefix));
    assert.match(body, /CCPA\/CPRA/, `${name(prefix)}: 미국 주법`);
    assert.match(body, /GDPR/, `${name(prefix)}: GDPR`);
    assert.match(body, /policies\.google\.com\/technologies\/partner-sites/, `${name(prefix)}: Google 파트너 정책 링크`);
  }
});

test('policy links stay inside the same locale; general policy cross-link present', { skip }, () => {
  for (const prefix of PREFIXES) {
    const base = prefix ? `/${prefix}` : '';
    const body = main(read(prefix));
    assert.ok(body.includes(`href="${base}/privacy"`), `${name(prefix)}: 통합 방침 링크`);
    for (const other of LOCALES.filter(l => l !== prefix)) {
      assert.ok(!body.includes(`href="/${other}/`), `${name(prefix)}: 다른 로케일(${other}) 링크 없음`);
    }
  }
});

// 대표 규칙(2026-10-27): 앱 전용 법적 링크는 사이트 공용 푸터에 넣지 않는다.
test('the shared site footer does not link the app policy', { skip }, () => {
  for (const locale of LOCALES) {
    const html = readFileSync(new URL(`../dist/${locale}/index.html`, import.meta.url), 'utf8');
    const footer = html.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? '';
    assert.ok(footer.length > 0, `${locale}: footer 존재`);
    assert.ok(!footer.includes('pipi-habit'), `${locale}: 공용 푸터에 pipi-habit 링크 없음`);
  }
});
