import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { onRequest } from '../functions/_middleware.ts';

const read = (p) => readFileSync(new URL('../' + p, import.meta.url));
const xml = read('public/sitemap-resources.xml').toString('utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const expected = [
  'https://pifl-labs.com/assets/printables/one-line-journal-en.pdf',
  'https://pifl-labs.com/assets/press/pifl-labs-ios-portfolio-2026-10-11.pdf',
];

test('only the two already-public canonical PDFs, once each', () => {
  assert.deepEqual(urls, expected);
  assert.equal(new Set(urls).size, urls.length);
  for (const url of urls) {
    const u = new URL(url);
    assert.equal(u.origin, 'https://pifl-labs.com');
    assert.equal(u.search + u.hash, '');
    assert.ok(u.pathname.startsWith('/assets/') && u.pathname.endsWith('.pdf'));
  }
});

test('standard UTF-8 root urlset, accurate fixed publication date; no SEO promises', () => {
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
  assert.equal((xml.match(/<url>/g) || []).length, 2);
  assert.deepEqual([...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(m => m[1]), ['2026-10-11', '2026-10-11']);
  assert.doesNotMatch(xml, /<!DOCTYPE|<!ENTITY|<priority>|<changefreq>|pipi-worlds|\.txt<\/loc>/);
});

test('robots keeps the original sitemap and crawling rules, adding one root sitemap', () => {
  const robots = read('public/robots.txt').toString('utf8');
  assert.equal((robots.match(/^Sitemap: https:\/\/pifl-labs\.com\/sitemap-resources\.xml$/gm) || []).length, 1);
  assert.ok(robots.includes('Sitemap: https://pifl-labs.com/sitemap-index.xml'));
  assert.ok(robots.includes('User-agent: *\nAllow: /'));
  assert.ok(robots.includes('Crawl-delay: 1'));
  assert.doesNotMatch(robots, /^Disallow:/m);
});

test('the XML endpoint has XML MIME and short-cache policy, without noindex', () => {
  const headers = read('public/_headers').toString('utf8');
  assert.ok(headers.includes('/sitemap-resources.xml\n  Content-Type: application/xml; charset=utf-8\n  Cache-Control: public, max-age=3600'));
  assert.doesNotMatch(headers, /X-Robots-Tag:.*noindex/i);
  assert.ok(headers.includes('X-Content-Type-Options: nosniff'));
});

test('the journal PDF is byte-identical to the accepted public resource', () => {
  const pdf = read('public/assets/printables/one-line-journal-en.pdf');
  assert.equal(createHash('sha256').update(pdf).digest('hex'), '4ba5dac07e719266d5619cfd5cefe3e63d160321c9bb6233b64790f518fb3aa8');
});

test('the portfolio PDF is byte-identical to the accepted public overview', () => {
  const pdf = read('public/assets/press/pifl-labs-ios-portfolio-2026-10-11.pdf');
  assert.equal(createHash('sha256').update(pdf).digest('hex'), '8e6e1e53590f2216f5f2d5ee7f02d45ac8575bfff95b1bff69a55ba3fc9b2cb5');
});

for (const language of ['ko-KR', 'en-US', 'ja-JP']) {
  test(`XML static route preserves exact response without locale redirect (${language})`, async () => {
    const response = await onRequest({
      request: new Request('https://pifl-labs.com/sitemap-resources.xml', {
        headers: { 'accept-language': language, cookie: 'pref-lang=ja' },
      }),
      next: async () => new Response(xml, { status: 200, headers: { 'content-type': 'application/xml; charset=utf-8' } }),
    });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), xml);
    assert.equal(response.headers.get('location'), null);
    assert.equal(response.headers.get('set-cookie'), null);
  });
}
