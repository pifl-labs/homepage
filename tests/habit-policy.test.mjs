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

// pipi_habit feat/release-required 32bef63(앱 PR #4)부터 Firebase Analytics 수집은 기본 꺼짐이고, GDPR 적용 지역(TCF gdprApplies=1)에서는
// UMP 목적 1(기기 저장소 접근) 동의 시에만, 그 밖 지역은 수집, 지역 모름은 끔, Pro 는 GDPR·지역 모름이면 끔. 판정 전 이벤트는 메모리 보류 후 끔이면 버린다.
// "앱 안에 끄는 설정이 없다(앱을 지워야 멈춘다)"를 지역 구분 없이 단정하던 옛 문장이 다시 들어오면 안 된다.
test('usage statistics: off by default, GDPR regions only with Purpose 1 consent, Pro conservative, withdrawal via Ad privacy choices', { skip }, () => {
  const rules = {
    ko: [/수집은 기본으로 꺼져/, /'기기에 정보 저장 및\/또는 접근'\(목적 1\)에 동의한 경우에만 수집/, /이 동의를 철회하면 수집을 멈춥니다/,
      /지역을 확인할 수 없으면 수집하지 않습니다/, /Pro 이용자에게는 광고 동의 창을 보여 주지 않으므로, GDPR 적용 지역이거나 지역을 확인할 수 없으면 수집하지 않습니다/,
      /기기 메모리에만 잠시 두었다가, 수집하지 않기로 정해지면 버림/, /저장소 접근 동의\(목적 1\)를 철회하면 이용 통계 수집이 멈춥니다/],
    en: [/Collection is off by default/, /consent to "Store and\/or access information on a device" \(Purpose 1\)/, /withdrawing that consent in Settings › Ad privacy choices stops collection/,
      /If the region cannot be determined, they are not collected/, /Pro users are not shown the consent form, so for them usage statistics are not collected in GDPR regions or when the region cannot be determined/,
      /held only in your device's memory and discarded if collection stays off/, /\(Purpose 1\) in Settings › Ad privacy choices stops usage statistics/],
    ja: [/収集は初期設定でオフです/, /「端末への情報の保存・アクセス」\(目的1\)に同意した場合にのみ収集/, /この同意を撤回すると収集を停止します/,
      /地域を確認できない場合は収集しません/, /Proのユーザーには同意画面を表示しないため、GDPRが適用される地域の場合や地域を確認できない場合は収集しません/,
      /端末のメモリにのみ一時的に保持し、収集しないと決まった場合は破棄します/, /\(目的1\)への同意を撤回すると、利用統計の収集が止まります/],
  };
  rules[''] = rules.en;
  const stale = [
    /앱 안에는 이용 통계를 끄는 설정이 없습니다/,
    /이용 통계는 앱을 쓰는 동안 자동으로 전송되며 앱 안에서 따로 끌 수 없으므로/,
    /The App has no setting to turn off usage statistics/,
    /usage statistics are sent automatically while you use the App and cannot be turned off/,
    /本アプリには利用統計をオフにする設定はありません/,
    /利用統計はアプリの利用中に自動で送信され/,
  ];
  for (const prefix of PREFIXES) {
    const body = main(read(prefix));
    for (const re of rules[prefix]) assert.match(body, re, `${name(prefix)}: ${re}`);
    for (const re of stale) assert.doesNotMatch(body, re, `${name(prefix)}: 옛 문장 ${re}`);
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
