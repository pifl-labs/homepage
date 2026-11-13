import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { onRequest } from '../functions/_middleware.ts';
import { apps, appList } from '../src/data/apps.ts';

// 간밤(Yesternight, com.pifl.pipi.dream) 앱 페이지 셋과 개인정보처리방침 다섯 쪽.
// 이 여덟 주소는 앱 안(pipi_dream AppInfo.privacyPolicyUrls)과 App Store·Play 콘솔에 글자 그대로 들어간다 —
// 리다이렉트 없이 200 이어야 한다(같은 회사 앱이 302+301 넘김 때문에 Play 사전 검사에서 처리방침 404 를 맞았다).
const SITE = 'https://pifl-labs.com';
const LANDINGS = { ko: '/ko/apps/pipi-dream/', en: '/en/apps/pipi-dream/', ja: '/ja/apps/pipi-dream/' };
const POLICIES = {
  ko: '/ko/apps/pipi-dream/privacy/',
  en: '/en/apps/pipi-dream/privacy/',
  ja: '/ja/apps/pipi-dream/privacy/',
  'zh-Hans': '/en/apps/pipi-dream/privacy/zh-hans/',
  'zh-Hant': '/en/apps/pipi-dream/privacy/zh-hant/',
};
const PATHS = [...Object.values(LANDINGS), ...Object.values(POLICIES)];
const NAMES = { ko: '간밤: 말로 남기는 꿈 일기', en: 'Yesternight: Dream Journal', ja: 'ゆうべ：話して残す夢日記' };

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const dist = (path) => new URL(`../dist${path}index.html`, import.meta.url);
const skip = !existsSync(dist(POLICIES.ko)) && 'dist/ 가 없습니다 — npm run build 뒤에 실행하세요';
const built = (path) => readFileSync(dist(path), 'utf8');
const source = (lang) => read(`../src/components/pipi-dream/policy/${lang}.html`);
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const canonical = (html) => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const alternates = (html) => Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]));

// pipi_dream site/privacy/<lang>.html(2026-11-13, 시행일 2026-11-01)을 바이트 그대로 복사했다. 원본이 바뀌면 다시 복사하고 이 값을 고친다.
const SOURCE_SHA256 = {
  ko: 'b33121ad3795369a716542fb38f9e610443a9fed77bc929a077e98637ac9e5f5',
  en: '9d461b951eb5c5a7fa8474d74ffc6bc25b09bab9b6f93464f02c34a7ca810be4',
  ja: '5d647c2d2bbcc07c8b46e13e4a685d053c51ee5ef0763929d1466bc4292a49c6',
  'zh-Hans': '391d2060f376b44a0b92b852a9fd41af9bd5968ee2bfcb02391c4a4e8a13368e',
  'zh-Hant': '499afca6cbb0ea7c04c558161e98ed1cf5b6b7f94ccb03fe8676b0e4fb9f9001',
};

test('policy copies are the app repository pages byte for byte', () => {
  for (const [lang, sha] of Object.entries(SOURCE_SHA256)) {
    assert.equal(createHash('sha256').update(source(lang)).digest('hex'), sha, lang);
  }
});

test('Cloudflare middleware serves all eight addresses directly for any browser language or cookie', async () => {
  for (const path of PATHS) {
    for (const headers of [{}, { 'accept-language': 'ko' }, { 'accept-language': 'en-US,en;q=0.9' }, { 'accept-language': 'ja' }, { 'accept-language': 'zh-CN' }, { cookie: 'pref-lang=ja' }]) {
      let nextCalls = 0;
      const passthrough = new Response('page');
      const res = await onRequest({ request: new Request(`${SITE}${path}`, { headers }), next: async () => { nextCalls++; return passthrough; } });
      assert.equal(nextCalls, 1, `${path} ${JSON.stringify(headers)}`);
      assert.equal(res, passthrough, path);
    }
  }
});

test('no _redirects rule matches the eight addresses (with or without the trailing slash)', () => {
  const rules = read('../public/_redirects').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => l.split(/\s+/)[0]);
  assert.ok(rules.length > 0);
  for (const from of rules) {
    const re = new RegExp(`^${from.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/:[A-Za-z]+/g, '[^/]+')}$`);
    for (const path of PATHS) for (const p of [path, path.slice(0, -1)]) assert.doesNotMatch(p, re, `${from} catches ${p}`);
  }
});

for (const [lang, path] of Object.entries(POLICIES)) {
  test(`${lang} policy: source wording, links and contact carried over unchanged`, { skip }, () => {
    const html = built(path);
    const main = source(lang).match(/<main>\n([\s\S]*?)\n\s*<\/main>/)[1];
    const heading = main.match(/<h1>([^<]+)<\/h1>/)[1];
    const article = html.match(/<article class="legal-card"[^>]*>([\s\S]*?)<\/article>/)[1];
    const hero = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1];
    assert.equal(text(hero), heading);
    const shown = text(article).replaceAll('privacy (at) pifl-labs.com', 'privacy@pifl-labs.com');
    assert.equal(shown, text(main.replace(/<h1>[^<]+<\/h1>/, '')));
    // 쪽 사이 언어 고르기 — 다섯 직접 주소와 hreflang 그대로
    const nav = [...article.matchAll(/<a href="([^"]+)" lang="([^"]+)" hreflang="([^"]+)"/g)].map((m) => [m[1], m[3]]);
    assert.deepEqual(nav, Object.entries(POLICIES).map(([l, p]) => [`${SITE}${p}`, l]));
    assert.match(article, new RegExp(`hreflang="${lang}" aria-current="page"`));
    assert.doesNotMatch(html, /mailto:/i);
    assert.equal((article.match(/data-email-user="privacy" data-email-domain="pifl-labs\.com"/g) ?? []).length, 2);
  });
}

for (const lang of ['ko', 'en', 'ja']) {
  test(`${lang} policy: own canonical, ko/en/ja hreflang, indexable`, { skip }, () => {
    const html = built(POLICIES[lang]);
    assert.match(html, new RegExp(`<html lang="${lang}"`));
    assert.equal(canonical(html), `${SITE}${POLICIES[lang]}`);
    assert.deepEqual(alternates(html), { ko: `${SITE}${POLICIES.ko}`, en: `${SITE}${POLICIES.en}`, ja: `${SITE}${POLICIES.ja}`, 'x-default': `${SITE}${POLICIES.ko}` });
    assert.doesNotMatch(html, /name="robots"/);
  });
}

for (const lang of ['zh-Hans', 'zh-Hant']) {
  test(`${lang} policy: noindex page under /en/ with its own canonical and document language`, { skip }, () => {
    const html = built(POLICIES[lang]);
    assert.match(html, /<html lang="en"/);
    assert.match(html, /<meta name="robots" content="noindex,follow">/);
    assert.equal(canonical(html), `${SITE}${POLICIES[lang]}`);
    assert.deepEqual(alternates(html), { [lang]: `${SITE}${POLICIES[lang]}` });
    assert.match(html, new RegExp(`<main id="main" class="legal-page dream-policy" lang="${lang}"`));
  });
}

test('sitemap lists the indexed pages and leaves out the two Chinese policies', { skip }, () => {
  const xml = read('../dist/sitemap-0.xml');
  for (const path of [...Object.values(LANDINGS), POLICIES.ko, POLICIES.en, POLICIES.ja]) assert.ok(xml.includes(`<loc>${SITE}${path}</loc>`), path);
  assert.doesNotMatch(xml, /pipi-dream\/privacy\/zh-han/);
});

for (const [lang, path] of Object.entries(LANDINGS)) {
  test(`${lang} landing: unreleased app with its store name, policy link and support contact`, { skip }, () => {
    const html = built(path);
    assert.ok(html.includes(NAMES[lang]));
    assert.match(html, /class="app-soon-pill"/);
    assert.doesNotMatch(html, /data-store-link=/);
    assert.ok(html.includes(`href="/${lang}/apps/pipi-dream/privacy/"`));
    assert.match(html, /data-email-user="support" data-email-domain="pifl-labs\.com"/);
    assert.doesNotMatch(html, /mailto:/i);
    const app = JSON.parse(html.match(/<script type="application\/ld\+json">(\{"@context":"https:\/\/schema\.org","@type":"SoftwareApplication"[\s\S]*?)<\/script>/)[1]);
    assert.equal(app.name, NAMES[lang]);
    assert.equal(app.offers, undefined);
    assert.equal(app.installUrl, undefined);
  });
}

test('registered for its landing only; not yet in the homepage catalog', () => {
  const dream = apps['pipi-dream'];
  assert.equal(dream.status, 'soon');
  assert.deepEqual(dream.stores, {});
  assert.equal(appList.some((a) => a.slug === 'pipi-dream'), false);
});
