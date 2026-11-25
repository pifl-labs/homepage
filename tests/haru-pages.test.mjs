import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// 하루의 계절 지원(/apps/haru/)·개인정보처리방침(/apps/haru/privacy/) 빌드 결과(dist/)를 검사한다.
// npm run build 뒤에 실행해야 하며, 빌드 전이라 dist/ 가 없으면 이유를 남기고 건너뛴다.
// 출시 전 앱이라 스토어 링크가 없고, 홈 카탈로그(apps.ts)에도 올리지 않는다.
const SITE = 'https://pifl-labs.com';
const PAGES = { support: '', privacy: 'privacy/' };
const LOCALES = ['ko', 'en', 'ja'];
const file = (prefix, page) => new URL(`../dist/${prefix ? `${prefix}/` : ''}apps/haru/${PAGES[page]}index.html`, import.meta.url);
const skip = !existsSync(file('ko', 'privacy')) && 'dist/ 가 없습니다 — npm run build 뒤에 실행하세요';
const read = (prefix, page) => readFileSync(file(prefix, page), 'utf8');
const url = (locale, page) => `${SITE}/${locale}/apps/haru/${PAGES[page]}`;
const canonical = html => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const alternates = html => Object.fromEntries(
  [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(m => [m[1], m[2]]),
);
// 본문(<main>)만, Astro 의 스코프 속성(data-astro-cid-*)을 걷어 낸 글로 본다. 머리·푸터(회사 JSON-LD 의 스토어 개발자 주소 등)는 빼고.
const main = html => (html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '').replace(/ data-astro-cid-[\w-]+/g, '');
const hrefs = html => [...main(html).matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(m => m[1]);

for (const page of Object.keys(PAGES)) {
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
      assert.match(html, /<main id="main"/, 'skip link target');
    });
  }

  test(`unprefixed ${page} renders English with the /en/ canonical`, { skip }, () => {
    const html = read('', page);
    assert.match(html, /<html lang="en"/);
    assert.equal(canonical(html), url('en', page));
    assert.equal(alternates(html)['x-default'], url('ko', page));
  });

  test(`${page}: emails stay obfuscated and no store link exists before launch`, { skip }, () => {
    for (const prefix of [...LOCALES, '']) {
      const html = read(prefix, page);
      assert.doesNotMatch(html, /mailto:/i);
      assert.match(html, /data-email-user="privacy" data-email-domain="pifl-labs\.com"/);
      assert.match(html, /data-email-user="support" data-email-domain="pifl-labs\.com"/);
      assert.doesNotMatch(main(html), /apps\.apple\.com|play\.google\.com|data-store-link/);
      assert.doesNotMatch(html, /data-store-link|application\/ld\+json"[^>]*>[^<]*SoftwareApplication/);
    }
  });
}

test('support and privacy link to each other in the same locale', { skip }, () => {
  for (const locale of LOCALES) {
    assert.ok(hrefs(read(locale, 'support')).includes(`/${locale}/apps/haru/privacy/`), `${locale} support → privacy`);
    assert.ok(hrefs(read(locale, 'privacy')).includes(`/${locale}/apps/haru/`), `${locale} privacy → support`);
    assert.ok(hrefs(read(locale, 'privacy')).includes(`/${locale}/privacy/`), `${locale} privacy → company policy`);
  }
});

// 앱 화면 문구는 한국어 그대로(앱이 한국어 전용) — 세 언어 모두 사용자가 앱에서 찾을 글자를 보여 준다.
test('support pages state the sales model and the exact in-app labels', { skip }, () => {
  for (const prefix of [...LOCALES, '']) {
    const html = main(read(prefix, 'support'));
    for (const text of ['₩5,500', '새 꿈 묶음', '구매 복원', '더 고운 그림을 받을게요', '받기', '나중에']) {
      assert.ok(html.includes(text), `${prefix || 'root'} support: ${text}`);
    }
  }
});

test('privacy pages carry the verified facts in every locale', { skip }, () => {
  const retention = { ko: '<strong>2년</strong>', en: '<strong>2 years</strong>', ja: '<strong>2年</strong>' };
  const effective = { ko: '2026년 11월 25일', en: 'November 25, 2026', ja: '2026年11月25日' };
  for (const locale of LOCALES) {
    const html = read(locale, 'privacy');
    const body = main(html);
    assert.ok(html.includes(effective[locale]), `${locale}: effective date`);
    assert.ok(body.includes(retention[locale]), `${locale}: 2-year retention`);
    assert.ok(body.includes('https://packs.pifl-labs.com'), `${locale}: pack host`);
    for (const event of ['open', 'season', 'ending', 'run2', 'pack', 'pay_view', 'pay_done', 'pay_cancel']) {
      assert.ok(body.includes(`(${event})`) || body.includes(`（${event}）`), `${locale}: event ${event}`);
    }
    for (const label of ['플레이 기록 보내기', '구매 복원']) assert.ok(body.includes(label), `${locale}: ${label}`);
    assert.ok(body.includes('Cloudflare, Inc.'), `${locale}: Cloudflare processor`);
    assert.ok(/Google LLC[ （(]+Google Workspace/.test(body), `${locale}: Google Workspace processor`);
    assert.ok(body.includes('IPv6'), `${locale}: IP handling for rate limits`);
  }
});

test('Haru stays off the homepage catalog before launch', () => {
  const apps = readFileSync(new URL('../src/data/apps.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(apps, /slug: 'haru'/);
});

test('built homepages do not link to Haru before launch', { skip }, () => {
  for (const locale of LOCALES) {
    const home = readFileSync(new URL(`../dist/${locale}/index.html`, import.meta.url), 'utf8');
    assert.doesNotMatch(home, /\/apps\/haru\//, `${locale} home`);
  }
});

test('localized Haru pages are in the sitemap; unprefixed copies are not', { skip }, () => {
  const sitemap = readFileSync(new URL('../dist/sitemap-0.xml', import.meta.url), 'utf8');
  for (const locale of LOCALES) {
    for (const page of Object.keys(PAGES)) assert.ok(sitemap.includes(`<loc>${url(locale, page)}</loc>`), url(locale, page));
  }
  assert.ok(!sitemap.includes(`<loc>${SITE}/apps/haru/`), 'unprefixed copies stay out');
});
