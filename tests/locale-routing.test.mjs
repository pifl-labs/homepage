import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { onRequest } from '../functions/_middleware.ts';

const ORIGIN = 'https://pifl-labs.com';
const QUERY = '?utm_source=instagram&utm_medium=social&utm_campaign=ig_bio_ko_2609';

async function route(path = '/', headers = {}) {
  return onRequest({ request: new Request(ORIGIN + path, { headers }),
    next: async () => new Response('unchanged', { status: 200, headers: { 'x-original': 'yes' } }) });
}

for (const [label, header, expected] of [
  ['Japanese regional tag', 'ja-JP,en-US;q=0.8,ko;q=0.6', 'ja'],
  ['English regional tag', 'en-GB,ko;q=0.8', 'en'],
  ['Korean regional tag', 'ko-KR,en;q=0.8', 'ko'],
  ['quality over list order', 'ko;q=0.1,ja;q=1', 'ja'],
  ['zero quality excluded', 'ko;q=0,en;q=1', 'en'],
  ['equal quality uses list order', 'ja;q=0.7,en;q=0.7', 'ja'],
  ['default quality is one', 'ko;q=0.5,en', 'en'],
  ['case insensitive tag and quality', 'EN-us;Q=0.8,ja;q=0.3', 'en'],
  ['unsupported language ignored', 'fr-FR,ja;q=0.8', 'ja'],
  ['unsupported prefix not mistaken for English', 'english,ja;q=0.8', 'ja'],
  ['invalid quality ignored', 'ko;q=nope,ja;q=0.8', 'ja'],
  ['out of range quality ignored', 'ko;q=2,en;q=0.8', 'en'],
  ['negative quality ignored', 'ko;q=-1,en;q=0.8', 'en'],
  ['overprecise quality ignored', 'ko;q=0.9999,en;q=0.8', 'en'],
  ['duplicate quality ignored', 'ko;q=0.1;q=1,en;q=0.8', 'en'],
  ['unsupported only retains default', 'fr-FR,de;q=0.8', 'ko'],
  ['wildcard only retains default', '*', 'ko'],
  ['missing header retains default', '', 'ko'],
]) {
  test(`server: ${label}`, async () => {
    const response = await route('/' + QUERY, { 'accept-language': header });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), `${ORIGIN}/${expected}/${QUERY}`);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('set-cookie'), `pref-lang=${expected}; Path=/; Max-Age=31536000; SameSite=Lax`);
  });
}

for (const cookie of ['pref-lang=%E0%A4%A', 'pref-lang=%', 'pref-lang=%FF', 'pref-lang=enough', 'pref-lang=', 'pref-lang=fr', 'not-pref-lang=en', 'pref-lang=ja%3Ben']) {
  test(`invalid cookie safely ignored: ${cookie}`, async () => {
    const response = await route('/apps/pipi-words/' + QUERY, { cookie, 'accept-language': 'ja' });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), `${ORIGIN}/ja/apps/pipi-words/${QUERY}`);
  });
}

for (const cookie of ['pref-lang=en', 'other=1; pref-lang=%65%6E; unrelated=x']) {
  test(`explicit saved locale takes precedence: ${cookie}`, async () => {
    const response = await route('/terms/' + QUERY, { cookie, 'accept-language': 'ja' });
    assert.equal(response.headers.get('location'), `${ORIGIN}/en/terms/${QUERY}`);
  });
}

for (const path of ['/ko', '/ja/', '/en/apps/pipi-draw/', '/ko/apps/pipi-hello/privacy/', '/ja/apps/pipi-bridge/privacy/', '/assets/icon.png', '/store-attribution.mjs', '/.well-known/apple-app-site-association', '/.well-known/assetlinks.json', '/robots.txt', '/sitemap-index.xml', '/go/tiktok/']) {
  test(`explicit locale and static endpoints untouched: ${path}`, async () => {
    const response = await route(path, { cookie: 'pref-lang=%', 'accept-language': 'en' });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'unchanged');
    assert.equal(response.headers.get('x-original'), 'yes');
    assert.equal(response.headers.get('set-cookie'), null);
  });
}

const source = readFileSync(new URL('../public/lang-detect.js', import.meta.url), 'utf8');
function fallback({ cookie = '', languages = ['ja-JP'], language = 'ja-JP', denyRead = false, denyWrite = false, denyNavigator = false } = {}) {
  const redirects = [], writes = [];
  const document = {};
  Object.defineProperty(document, 'cookie', {
    get() { if (denyRead) throw new Error('cookie access denied'); return cookie; },
    set(value) { if (denyWrite) throw new Error('cookie storage denied'); writes.push(value); },
  });
  const navigator = { language };
  Object.defineProperty(navigator, 'languages', { get() { if (denyNavigator) throw new Error('unavailable'); return languages; } });
  runInNewContext(source, { document, navigator, window: { location: { search: QUERY, hash: '#apps', replace: (url) => redirects.push(url) } } });
  return { redirects, writes };
}

for (const [label, options, expected] of [
  ['normal browser preference', {}, 'ja'],
  ['saved preference', { cookie: 'pref-lang=en' }, 'en'],
  ['encoded saved preference', { cookie: 'pref-lang=%65%6E' }, 'en'],
  ['invalid cookie prefix', { cookie: 'pref-lang=enough' }, 'ja'],
  ['invalid percent encoding', { cookie: 'pref-lang=%E0%A4%A' }, 'ja'],
  ['cookie read denied', { denyRead: true }, 'ja'],
  ['cookie write denied', { denyWrite: true }, 'ja'],
  ['unsupported language prefix', { languages: ['english', 'ja-JP'] }, 'ja'],
  ['navigator unavailable retains campaign', { denyNavigator: true }, 'ko'],
]) {
  test(`client fallback: ${label}`, () => {
    const result = fallback(options);
    assert.deepEqual(result.redirects, [`/${expected}/${QUERY}#apps`]);
    if (!options.denyWrite && !options.denyNavigator) assert.equal(result.writes.length, 1);
  });
}
