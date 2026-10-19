import test from 'node:test';
import assert from 'node:assert/strict';
import { storeUrl, websiteCampaign, decorateCampaignLinks } from '../public/store-attribution.mjs';

// Independently enumerated public app IDs from the dated owner evidence.
const IDS = ['6762258878', '6770267735', '6777299814', '6770272665',
  '6770268950', '6779071131', '6788949612', '6801205183'];
for (const id of IDS) {
  for (const [language, country] of [['ko', 'kr'], ['ja', 'jp'], ['en', 'us']]) {
    test(`verified ${id}/${language}: no-JS destination keeps app, country, product page and hash`, () => {
      const href = `https://apps.apple.com/${country}/app/id${id}?ppid=existing&uo=4#details`;
      const result = new URL(storeUrl(href, websiteCampaign(language)));
      assert.equal(result.pathname, `/${country}/app/id${id}`);
      assert.equal(result.searchParams.get('ppid'), 'existing');
      assert.equal(result.searchParams.get('uo'), '4');
      assert.equal(result.searchParams.get('pt'), '128720089');
      assert.equal(result.searchParams.get('ct'), `website_${language}`);
      assert.equal(result.searchParams.get('mt'), '8');
      assert.equal(result.hash, '#details');
      assert.equal(storeUrl(result.href, websiteCampaign(language)), result.href);
    });
  }
}
for (const href of [
  'https://apps.apple.com/us/app/id123456789?pt=another&ct=original',
  'https://apps.apple.com/us/app/id68012051830',
  'https://apps.apple.com/us/app/id06762258878',
  'https://apps.apple.com/us/app/id6762258878/',
  'https://apps.apple.com.evil.example/us/app/id6762258878',
]) test(`unknown or unsupported target stays byte-identical: ${href}`, () => {
  assert.equal(storeUrl(href, websiteCampaign('en')), href);
});

test('explicit provider arguments and URL query data cannot substitute another owner', () => {
  const href = 'https://apps.apple.com/us/app/id6770272665?pt=untrusted&ct=old&mt=999&ppid=page';
  const own = new URL(storeUrl(href, websiteCampaign('en')));
  assert.equal(own.searchParams.get('pt'), '128720089');
  assert.equal(own.searchParams.get('mt'), '8');
  assert.equal(own.searchParams.get('ppid'), 'page');
  for (const provider of ['', '1', 128720089, null, undefined]) {
    if (provider === undefined) continue; // undefined uses the documented default.
    assert.equal(storeUrl(href, websiteCampaign('en'), provider), href);
  }
});

test('browser adaptation changes only destination metadata, not label or unknown app', () => {
  const makeAnchor = href => ({ href, label: 'App Store', original: href,
    getAttribute(name) { return name === 'data-store-link' ? this.original : this.href; },
    setAttribute(name, value) { assert.equal(name, 'href'); this.href = value; },
  });
  const anchors = [makeAnchor('https://apps.apple.com/ja/app/id6801205183'),
    makeAnchor('https://apps.apple.com/ja/app/id6788949612'),
    makeAnchor('https://apps.apple.com/ja/app/id123456789')];
  const document = { querySelectorAll(selector) {
    assert.ok(['a[data-store-link]', 'a[href]'].includes(selector)); return anchors;
  } };
  decorateCampaignLinks(document, 'https://pifl-labs.com/ja/?utm_source=threads&utm_medium=social&utm_campaign=th_bridge_ja_2610&email=private%40example.com&pt=wrong');
  for (const anchor of anchors.slice(0, 2)) {
    const result = new URL(anchor.href);
    assert.equal(result.searchParams.get('pt'), '128720089');
    assert.equal(result.searchParams.get('ct'), 'th_bridge_ja_2610');
    assert.equal(result.searchParams.has('email'), false);
    assert.equal(anchor.label, 'App Store');
  }
  assert.equal(anchors[2].href, anchors[2].original);
});
