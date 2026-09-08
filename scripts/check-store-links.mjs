#!/usr/bin/env node
/** Verify built HTML, including no-JS defaults, on every localized home/app page. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { APPLE_PROVIDER_TOKEN, storeUrl, websiteCampaign } from '../public/store-attribution.mjs';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const decode = (value) => value.replaceAll('&amp;', '&').replaceAll('&#38;', '&').replaceAll('&quot;', '"');
let pages = 0, links = 0;
for (const lang of ['ko', 'ja', 'en']) {
  const files = [join(dist, lang, 'index.html')];
  for (const app of readdirSync(join(dist, lang, 'apps'), {withFileTypes: true})) {
    if (app.isDirectory()) files.push(join(dist, lang, 'apps', app.name, 'index.html'));
  }
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    assert.match(html, /<script[^>]*type="module"[^>]*src="\/store-links.js"/, file);
    let pageLinks = 0;
    for (const match of html.matchAll(/<a\b[^>]*>/g)) {
      const attrs = Object.fromEntries([...match[0].matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], decode(m[2])]));
      if (!attrs.href || !/^https:\/\/(apps\.apple\.com|play\.google\.com)\//.test(attrs.href)) continue;
      assert.ok(attrs['data-store-link'], `Missing original store destination: ${file}`);
      assert.equal(attrs.href, storeUrl(attrs['data-store-link'], websiteCampaign(lang)), file);
      assert.equal(attrs.target, '_blank', file);
      assert.ok(attrs.rel.includes('noopener'), file);
      pageLinks++;
    }
    // Published app pages have two placements × two stores; coming-soon has none.
    if (file.endsWith(join(lang, 'index.html'))) assert.ok(pageLinks > 0 && pageLinks % 2 === 0, file);
    else {
      const jsonLd = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)]
        .map((m) => JSON.parse(m[1]));
      const live = jsonLd.some((data) => data['@type'] === 'SoftwareApplication' && data.operatingSystem);
      assert.equal(pageLinks, live ? 4 : 0, `${file}: ${pageLinks}`);
    }
    pages++;
    links += pageLinks;
  }
}
assert.ok(links > 0);
assert.equal(readFileSync(join(dist, 'store-links.js'), 'utf8'), readFileSync(new URL('../public/store-links.js', import.meta.url), 'utf8'));
assert.ok(readFileSync(join(dist, 'store-attribution.mjs'), 'utf8').includes('decorateCampaignLinks'));
const headers = readFileSync(join(dist, '_headers'), 'utf8');
assert.match(headers, /script-src 'self'/);
assert.doesNotMatch(headers, /script-src[^;\n]*'unsafe-inline'/);
console.log(`PASS: ${pages} localized home/app pages, ${links} store links; Apple attribution ${APPLE_PROVIDER_TOKEN ? 'configured' : 'disabled pending verification'}.`);
