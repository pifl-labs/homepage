import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  APPLE_PROVIDER_TOKEN, websiteCampaign, readCampaign, storeUrl,
  campaignNavigation, decorateCampaignLinks,
} from '../public/store-attribution.mjs';

const PLAY = 'https://play.google.com/store/apps/details?id=com.pifl.pipi.focus';
const APPLE = 'https://apps.apple.com/app/pipi-focus-pirate-pomodoro/id6762258878';
const CURRENT = 'https://pifl-labs.com/ko/';
const CAMPAIGN = { source: 'instagram', medium: 'social', campaign: 'ig_focus_ko_2609' };
const QUERY = '?utm_source=instagram&utm_medium=social&utm_campaign=ig_focus_ko_2609';

test('static defaults preserve locale; unknown locale falls back to ko', () => {
  for (const locale of ['ko', 'en', 'ja']) {
    assert.deepEqual(websiteCampaign(locale), {source: 'pifl-labs', medium: 'website', campaign: `website_${locale}`});
  }
  assert.equal(websiteCampaign('kr').campaign, 'website_ko');
});

test('reads only campaign labels and defaults an omitted medium to referral', () => {
  assert.deepEqual(readCampaign(QUERY + '&email=private%40example.com&fbclid=not-forwarded'), CAMPAIGN);
  assert.deepEqual(readCampaign('?utm_source=youtube&utm_campaign=yt_focus_ko_2609'), {
    source: 'youtube', campaign: 'yt_focus_ko_2609', medium: 'referral',
  });
});

for (const [label, query] of [
  ['no campaign', ''], ['partial', '?utm_source=instagram'],
  ['empty', '?utm_source=instagram&utm_campaign='],
  ['email', '?utm_source=instagram&utm_campaign=user%40example.com'],
  ['unlisted source', '?utm_source=unknown&utm_campaign=ig_focus'],
  ['unlisted medium', '?utm_source=instagram&utm_medium=cpc&utm_campaign=ig_focus'],
  ['duplicate source', QUERY + '&utm_source=youtube'],
  ['duplicate campaign', QUERY + '&utm_campaign=other'],
  ['duplicate medium', QUERY + '&utm_medium=video'],
  ['over 30 characters', '?utm_source=instagram&utm_campaign=' + 'a'.repeat(31)],
  ['space', '?utm_source=instagram&utm_campaign=bad+label'],
  ['markup', '?utm_source=instagram&utm_campaign=%3Cscript%3E'],
  ['encoded separator', '?utm_source=instagram&utm_campaign=one%26two'],
  ['mixed case', '?utm_source=instagram&utm_campaign=IG_Focus'],
  ['final newline', '?utm_source=instagram&utm_campaign=ig_focus%0A'],
  ['leading tab', '?utm_source=instagram&utm_campaign=%09ig_focus'],
]) {
  test(`rejects ${label} without inventing another source`, () => assert.equal(readCampaign(query), null));
}

test('Play has matching listing UTM and exactly-once encoded install referrer', () => {
  const result = new URL(storeUrl(PLAY + '&hl=ko&gl=KR', CAMPAIGN));
  assert.equal(result.searchParams.get('id'), 'com.pifl.pipi.focus');
  assert.equal(result.searchParams.get('hl'), 'ko');
  assert.equal(result.searchParams.get('gl'), 'KR');
  const referrer = new URLSearchParams(result.searchParams.get('referrer'));
  for (const [key, value] of Object.entries(CAMPAIGN)) {
    assert.equal(result.searchParams.get(`utm_${key}`), value);
    assert.equal(referrer.get(`utm_${key}`), value);
  }
  assert.equal([...referrer].length, 3);
  assert.equal(storeUrl(result.href, CAMPAIGN), result.href);
});

test('a new campaign replaces stale tracking labels without changing the app', () => {
  const result = new URL(storeUrl(PLAY + '&utm_source=old&referrer=old', CAMPAIGN));
  assert.equal(result.searchParams.get('utm_source'), 'instagram');
  assert.ok(!result.searchParams.get('referrer').includes('old'));
});

test('Apple is deliberately disabled until a generated provider token is verified', () => {
  assert.equal(APPLE_PROVIDER_TOKEN, '');
  assert.equal(storeUrl(APPLE, CAMPAIGN), APPLE);
  assert.equal(storeUrl(APPLE, CAMPAIGN, 'not-a-provider-token'), APPLE);
});

test('verified Apple configuration preserves path/product page and uses a <=30 character ct', () => {
  // Synthetic example from Apple docs; never the production configuration.
  const result = new URL(storeUrl(APPLE + '?ppid=example-page', CAMPAIGN, '123456'));
  assert.equal(result.pathname, new URL(APPLE).pathname);
  assert.equal(result.searchParams.get('ppid'), 'example-page');
  assert.equal(result.searchParams.get('pt'), '123456');
  assert.equal(result.searchParams.get('ct'), CAMPAIGN.campaign);
  assert.equal(result.searchParams.get('mt'), '8');
  assert.ok(result.searchParams.get('ct').length <= 30);
});

for (const href of [
  'javascript:alert(1)', 'https://evil.example/?next=' + PLAY, '/ko/',
  'http://play.google.com/store/apps/details?id=com.pifl.pipi.focus',
  'https://play.google.com.evil.example/store/apps/details?id=com.pifl.pipi.focus',
  'https://user:password@play.google.com/store/apps/details?id=com.pifl.pipi.focus',
  PLAY + '&id=other.app', 'https://play.google.com/store/apps/details',
  'https://apps.apple.com/app/no-id', 'https://play.google.com:8443/store/apps/details?id=com.pifl.pipi.focus',
]) {
  test(`leaves unsupported target untouched: ${href.split('?')[0]}`, () => {
    assert.equal(storeUrl(href, CAMPAIGN, '123456'), href);
  });
}

test('a malformed direct campaign argument cannot contaminate a store URL', () => {
  assert.equal(storeUrl(PLAY, null), PLAY);
  assert.equal(storeUrl(PLAY, {...CAMPAIGN, campaign: 'bad&tag'}), PLAY);
});

test('home → app → locale preserves campaign, existing query, and hash', () => {
  const app = campaignNavigation('/ko/apps/pipi-focus/?view=compact#features', CURRENT, CAMPAIGN);
  const parsed = new URL(app, CURRENT);
  assert.equal(parsed.pathname, '/ko/apps/pipi-focus/');
  assert.equal(parsed.searchParams.get('view'), 'compact');
  assert.equal(parsed.hash, '#features');
  assert.deepEqual(readCampaign(parsed.search), CAMPAIGN);
  const localized = new URL(campaignNavigation('/ja/apps/pipi-focus/', parsed.href, CAMPAIGN), CURRENT);
  assert.deepEqual(readCampaign(localized.search), CAMPAIGN);
  assert.equal(campaignNavigation(app, CURRENT, CAMPAIGN), app);
});

for (const href of [
  '#apps', '/ko/apps/pipi-focus/privacy/', '/ko/terms/', '/ko/privacy/',
  '/ko/apps/pipi-focus/support/', '/assets/example.png', '/go/tiktok/',
  '/invite/example', 'mailto:hello@example.com', 'https://other.example/ko/',
  '//other.example/ko/', '/ko/?utm_source=youtube',
]) {
  test(`does not propagate labels outside the intended funnel: ${href}`, () => {
    assert.equal(campaignNavigation(href, CURRENT, CAMPAIGN), href);
  });
}

test('DOM adapter decorates actual hrefs, needs no click handler, and is idempotent', () => {
  const node = (attributes) => ({
    getAttribute: (key) => attributes[key] ?? null,
    setAttribute: (key, value) => { attributes[key] = value; },
  });
  const play = node({'data-store-link': PLAY, href: storeUrl(PLAY, websiteCampaign('ko'))});
  const apple = node({'data-store-link': APPLE, href: APPLE});
  const app = node({href: '/ko/apps/pipi-focus/'});
  const privacy = node({href: '/ko/privacy/'});
  const doc = {querySelectorAll: (selector) => selector === 'a[data-store-link]' ? [play, apple] : [play, apple, app, privacy]};
  decorateCampaignLinks(doc, CURRENT + QUERY + '&email=private%40example.com');
  assert.equal(new URL(play.getAttribute('href')).searchParams.get('utm_campaign'), CAMPAIGN.campaign);
  assert.equal(apple.getAttribute('href'), APPLE);
  assert.equal(privacy.getAttribute('href'), '/ko/privacy/');
  assert.ok(!app.getAttribute('href').includes('email'));
  const once = play.getAttribute('href');
  decorateCampaignLinks(doc, CURRENT + QUERY);
  assert.equal(play.getAttribute('href'), once);
});

test('untagged visits leave static links untouched and do not inspect the DOM', () => {
  decorateCampaignLinks({querySelectorAll: () => assert.fail('should keep static defaults')}, CURRENT);
});

test('attribution code does not add collection, persistence, or click interception', () => {
  for (const name of ['store-attribution.mjs', 'store-links.js']) {
    const source = readFileSync(new URL(`../public/${name}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /\b(fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|preventDefault)\b|document\.cookie|addEventListener/);
  }
});
