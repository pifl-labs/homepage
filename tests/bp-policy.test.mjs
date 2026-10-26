import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// 혈압 기록(pipi-bp) 개인정보처리방침·소비자 건강 정보 처리방침의 빌드 결과(dist/)를 검사한다.
// npm run build 뒤에 실행해야 하며, dist/ 가 없으면 이유를 남기고 건너뛴다.
// 앱 사실 근거는 pipi_bp 앱 코드(광고 SDK 없음·Firebase Analytics 만·앱 안 링크 app_config.dart)다.
const SITE = 'https://pifl-labs.com';
const PAGES = ['privacy', 'consumer-health-data'];
const LOCALES = ['ko', 'en', 'ja'];
const file = (prefix, page) => new URL(`../dist/${prefix ? `${prefix}/` : ''}apps/pipi-bp/${page}/index.html`, import.meta.url);
const skip = !existsSync(file('ko', 'privacy')) && 'dist/ 가 없습니다 — npm run build 뒤에 실행하세요';
const read = (prefix, page) => readFileSync(file(prefix, page), 'utf8');
const main = html => html.match(/<main class="legal-page">([\s\S]*?)<\/main>/)?.[1] ?? '';
const url = (locale, page) => `${SITE}/${locale}/apps/pipi-bp/${page}/`;
const canonical = html => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const alternates = html => Object.fromEntries(
  [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(m => [m[1], m[2]]),
);
const EFFECTIVE = { ko: '2026년 10월 26일', en: 'October 26, 2026', ja: '2026年10月26日', '': 'October 26, 2026' };

for (const page of PAGES) {
  for (const locale of LOCALES) {
    test(`${locale} ${page}: own canonical, ko/en/ja hreflang and x-default /ko/`, { skip }, () => {
      const html = read(locale, page);
      assert.match(html, new RegExp(`<html lang="${locale}"`));
      assert.equal(canonical(html), url(locale, page));
      assert.deepEqual(alternates(html), {
        en: url('en', page),
        ko: url('ko', page),
        ja: url('ja', page),
        'x-default': url('ko', page),
      });
    });
  }

  test(`unprefixed ${page} renders English with the /en/ canonical`, { skip }, () => {
    const html = read('', page);
    assert.match(html, /<html lang="en"/);
    assert.equal(canonical(html), url('en', page));
    assert.equal(alternates(html)['x-default'], url('ko', page));
  });

  test(`${page}: effective date, obfuscated email only, no ad-era or stale facts`, { skip }, () => {
    for (const prefix of [...LOCALES, '']) {
      const body = main(read(prefix, page));
      assert.ok(body.includes(EFFECTIVE[prefix]), `${prefix || 'root'} ${page}: 시행일 2026-10-26`);
      assert.doesNotMatch(body, /mailto:/i);
      assert.match(body, /data-email-user="privacy" data-email-domain="pifl-labs\.com"/);
      // 2026-10-26 대표 결정으로 광고를 없앴다 — 광고 SDK·동의 양식·옛 분류 기준·옛 주소가 남으면 안 된다.
      assert.doesNotMatch(body, /AdMob|UMP|User Messaging Platform|AHA 2017|2017 ACC\/AHA|아란서길|Aranseo/);
    }
  });
}

test('each privacy page links to the separate consumer health data page in the same locale, and back', { skip }, () => {
  for (const prefix of [...LOCALES, '']) {
    const base = prefix ? `/${prefix}` : '';
    const privacy = main(read(prefix, 'privacy'));
    const chd = main(read(prefix, 'consumer-health-data'));
    assert.ok(privacy.includes(`href="${base}/apps/pipi-bp/consumer-health-data/"`), `${prefix || 'root'} privacy → CHD`);
    assert.ok(chd.includes(`href="${base}/apps/pipi-bp/privacy/"`), `${prefix || 'root'} CHD → privacy`);
  }
});

// RCW 19.373.020·.040: 범주·목적·출처·공유·권리 행사·이의 제기(45일, 워싱턴주 법무장관 연락처)가 있어야 한다.
test('consumer health data pages carry the WA MHMDA rights, timelines and AG contact', { skip }, () => {
  for (const prefix of [...LOCALES, '']) {
    const body = main(read(prefix, 'consumer-health-data'));
    assert.match(body, /RCW 19\.373/);
    assert.match(body, /45/);
    assert.ok(body.includes('https://www.atg.wa.gov/file-complaint'), `${prefix || 'root'}: AG complaint link`);
    assert.match(body, /Firebase Analytics/);
  }
});

// pipi_bp 180643e 부터 Analytics readings_bucket 은 앱에 직접 적은 기록만 센다(!r.isImported).
// "건강 앱 기록도 기록 수 구간에 센다"는 옛 설명이 다시 들어오면 안 된다.
test('no page says the readings range counts Health app readings', { skip }, () => {
  const stale = [
    /건강 앱에서 읽은 기록(?:의 개수)?도 (?:함께 )?(?:셈|셉)/,
    /also counts readings read from the Health app|this count includes readings from Apple Health/i,
    /ヘルスケアから読み取った記録(?:の件数)?も(?:含まれ|数え)/,
  ];
  for (const page of PAGES) {
    for (const prefix of [...LOCALES, '']) {
      const body = main(read(prefix, page));
      for (const re of stale) assert.doesNotMatch(body, re, `${prefix || 'root'} ${page}`);
    }
  }
});

// pipi_bp feat/analytics-consent 부터 사용 통계는 opt-in(기본 꺼짐)이고 설정 › 개인정보 스위치로 끄고 켠다.
// "앱 안에 끄는 설정이 없다(앱을 지워야 멈춘다)"는 옛 설명이 다시 들어오면 안 되고, 스위치 안내는 있어야 한다.
test('usage statistics are described as opt-in with an in-app switch, never as impossible to turn off', { skip }, () => {
  const stale = [/끄는 설정이 없/, /no in-app (?:setting|switch)|does not have an in-app switch/i, /オフにする設定が(?:ない|ありません)/];
  const SWITCH = { ko: /사용 통계 보내기/, en: /Share usage statistics/, ja: /利用統計の送信スイッチ/, '': /Share usage statistics/ };
  for (const page of PAGES) {
    for (const prefix of [...LOCALES, '']) {
      const body = main(read(prefix, page));
      for (const re of stale) assert.doesNotMatch(body, re, `${prefix || 'root'} ${page}`);
      assert.match(body, SWITCH[prefix], `${prefix || 'root'} ${page}: 설정 스위치 안내`);
    }
  }
});
