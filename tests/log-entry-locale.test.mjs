import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/_middleware.ts';

const ORIGIN = 'https://pifl-labs.com';
const QUERY = '?utm_source=google_play&utm_medium=website';

async function route(path, headers = {}, method = 'GET') {
  return onRequest({
    request: new Request(ORIGIN + path, { headers, method }),
    next: async () => new Response('existing page', { headers: { 'x-original': 'yes' } }),
  });
}

for (const path of ['/apps/pipi-log', '/apps/pipi-log/']) {
  for (const [label, headers, expected] of [
    ['missing browser language', {}, 'en'],
    ['unsupported Spanish', { 'accept-language': 'es-ES,es;q=0.9' }, 'en'],
    ['unsupported languages', { 'accept-language': 'fr-FR,de;q=0.8' }, 'en'],
    ['wildcard only', { 'accept-language': '*' }, 'en'],
    ['no acceptable supported match', { 'accept-language': 'ko;q=0,ja;q=0,en;q=0' }, 'en'],
    ['Korean browser', { 'accept-language': 'ko-KR,en;q=0.8' }, 'ko'],
    ['Japanese browser', { 'accept-language': 'ja-JP,en;q=0.8' }, 'ja'],
    ['English browser', { 'accept-language': 'en-GB,ja;q=0.8' }, 'en'],
    ['quality ordering', { 'accept-language': 'en;q=0.1,ja;q=0.8,ko;q=0.4' }, 'ja'],
    ['unsupported primary with Korean secondary', { 'accept-language': 'es,ko;q=0.5' }, 'ko'],
    ['explicit saved Korean', { cookie: 'pref-lang=ko', 'accept-language': 'en' }, 'ko'],
    ['explicit saved Japanese', { cookie: 'pref-lang=ja', 'accept-language': 'ko' }, 'ja'],
    ['explicit saved English', { cookie: 'other=x; pref-lang=%65%6E', 'accept-language': 'ko' }, 'en'],
    ['malformed saved preference', { cookie: 'pref-lang=%E0%A4%A', 'accept-language': 'es' }, 'en'],
    ['unsupported saved preference', { cookie: 'pref-lang=es', 'accept-language': 'ja' }, 'ja'],
  ]) {
    test(`Log entry ${path}: ${label}`, async () => {
      const response = await route(path + QUERY, headers);
      assert.equal(response.status, 302);
      assert.equal(response.headers.get('location'), `${ORIGIN}/${expected}${path}${QUERY}`);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(response.headers.get('set-cookie'), `pref-lang=${expected}; Path=/; Max-Age=31536000; SameSite=Lax`);
    });
  }
}

for (const locale of ['ko', 'ja', 'en']) {
  test(`explicit ${locale} Log URL wins over cookie and browser`, async () => {
    const response = await route(`/${locale}/apps/pipi-log/${QUERY}`, {
      cookie: 'pref-lang=ja', 'accept-language': 'es-ES',
    });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'existing page');
    assert.equal(response.headers.get('x-original'), 'yes');
    assert.equal(response.headers.get('set-cookie'), `pref-lang=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`);
    const nextVisit = await route('/apps/pipi-log/', {
      cookie: response.headers.get('set-cookie').split(';')[0], 'accept-language': 'es',
    });
    assert.equal(nextVisit.headers.get('location'), `${ORIGIN}/${locale}/apps/pipi-log/`);
  });
}

for (const path of ['/', '/apps/pipi-words/', '/apps/pipi-dday/', '/apps/pipi-log/privacy/', '/apps/pipi-log/privacy', '/apps/pipi-log/other/', '/apps/pipi-log-extra/']) {
  test(`unsupported browser keeps the existing KO default outside exact Log entry: ${path}`, async () => {
    const response = await route(path, { 'accept-language': 'es-ES' });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), `${ORIGIN}/ko${path}`);
  });
}

for (const path of ['/apps/pipi-spend/privacy', '/apps/pipi-spend/privacy/', '/.well-known/apple-app-site-association', '/assets/icon.png', '/go/tiktok/', '/robots.txt']) {
  test(`existing neutral/static bypass remains untouched: ${path}`, async () => {
    const response = await route(path, { 'accept-language': 'es-ES' });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-original'), 'yes');
    assert.equal(response.headers.get('set-cookie'), null);
  });
}

test('HEAD uses the same Log entry redirect', async () => {
  const response = await route('/apps/pipi-log/', { 'accept-language': 'es' }, 'HEAD');
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), `${ORIGIN}/en/apps/pipi-log/`);
  assert.equal(await response.text(), '');
});

test('existing kana PDF short link does not acquire a language prefix or cookie', async () => {
  const response = await route('/kana/en/a4', { 'accept-language': 'es' });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), `${ORIGIN}/assets/printables/first-kana-shape-match-en-a4.pdf`);
  assert.equal(response.headers.get('set-cookie'), null);
});
