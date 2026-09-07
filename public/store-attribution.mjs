/**
 * Store-link attribution shared by Astro (no-JS fallback) and the browser.
 * No analytics SDK, requests, cookies, storage, or user identifiers.
 * Only campaign labels belong here — never put personal data in a URL.
 */

// Leave disabled until verified against an actual ASC-generated campaign link.
// The legacy TikTok page's olympus providerId is NOT proof of a campaign pt.
// A provider token is public link metadata, not an API credential.
export const APPLE_PROVIDER_TOKEN = '';

const SOURCES = new Set([
  'pifl-labs', 'pipi-worlds', 'instagram', 'youtube', 'threads', 'tiktok',
  'naver', 'medium', 'brunch',
]);
const MEDIUMS = new Set(['website', 'social', 'video', 'referral', 'blog']);
const CAMPAIGN = /^[a-z0-9][a-z0-9_-]{0,29}$/;
const KEYS = ['utm_source', 'utm_medium', 'utm_campaign'];

/** @typedef {{source: string, medium: string, campaign: string}} Campaign */

/** @returns {Campaign} */
export function websiteCampaign(locale) {
  const lang = ['ko', 'ja', 'en'].includes(locale) ? locale : 'ko';
  return { source: 'pifl-labs', medium: 'website', campaign: `website_${lang}` };
}

/** Invalid/partial/duplicate parameters are ignored as a whole, not rewritten. */
export function readCampaign(search) {
  const params = new URLSearchParams(search);
  if (KEYS.some((key) => params.getAll(key).length > 1)) return null;
  const source = params.get('utm_source');
  const campaign = params.get('utm_campaign');
  const medium = params.get('utm_medium') ?? 'referral';
  if (!SOURCES.has(source) || !MEDIUMS.has(medium) || !CAMPAIGN.test(campaign ?? '')) return null;
  return { source, medium, campaign };
}

/**
 * Preserve the original store ID/path and unrelated store options.
 * An unsupported destination is returned untouched (never an open redirect).
 * Apple stays a normal download link until its provider token is verified.
 * @param {string} href
 * @param {Campaign} campaign
 */
export function storeUrl(href, campaign, appleProviderToken = APPLE_PROVIDER_TOKEN) {
  let url;
  try { url = new URL(href); } catch { return href; }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return href;
  if (!SOURCES.has(campaign?.source) || !MEDIUMS.has(campaign?.medium) || !CAMPAIGN.test(campaign?.campaign ?? '')) return href;

  if (url.hostname === 'apps.apple.com' && /\/id\d+$/.test(url.pathname)) {
    if (!/^\d+$/.test(appleProviderToken)) return href;
    url.searchParams.set('pt', appleProviderToken);
    url.searchParams.set('ct', campaign.campaign);
    url.searchParams.set('mt', '8');
  } else if (url.hostname === 'play.google.com' && url.pathname === '/store/apps/details' && url.searchParams.getAll('id').length === 1 && /^[a-zA-Z]\w*(?:\.\w+)+$/.test(url.searchParams.get('id'))) {
    // Play Console listing reports read top-level UTM dimensions. Include the
    // same labels in install referrer, without forwarding arbitrary query data.
    const referrer = new URLSearchParams();
    for (const [key, value] of campaignParams(campaign)) {
      url.searchParams.set(key, value);
      referrer.set(key, value);
    }
    url.searchParams.set('referrer', referrer.toString());
  } else {
    return href;
  }
  return url.href;
}

function campaignParams(campaign) {
  return [['utm_source', campaign.source], ['utm_medium', campaign.medium], ['utm_campaign', campaign.campaign]];
}

/** Carry labels only through same-site home/app/locale links, never legal,
 * support, assets, email, external links or /go/tiktok's independent campaign.
 */
export function campaignNavigation(href, currentHref, campaign) {
  if (!campaign || !href || href.startsWith('#')) return href;
  let url, current;
  try { current = new URL(currentHref); url = new URL(href, current); } catch { return href; }
  if (url.origin !== current.origin || url.username || url.password) return href;
  if (!/^\/(ko|ja|en)\/(?:apps\/[a-z0-9-]+\/)?$/.test(url.pathname)) return href;
  // Do not overwrite a deliberately different destination campaign, even if
  // partial/invalid; its owner must fix that link rather than silently mixing.
  if (KEYS.some((key) => url.searchParams.has(key))) return href;
  for (const [key, value] of campaignParams(campaign)) url.searchParams.set(key, value);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Browser adapter exported for regression testing without a browser SDK. */
export function decorateCampaignLinks(document, currentHref) {
  const current = new URL(currentHref);
  const campaign = readCampaign(current.search);
  if (!campaign) return; // Static site campaign remains usable without JS.
  for (const anchor of document.querySelectorAll('a[data-store-link]')) {
    const original = anchor.getAttribute('data-store-link');
    anchor.setAttribute('href', storeUrl(original, campaign));
  }
  for (const anchor of document.querySelectorAll('a[href]')) {
    const original = anchor.getAttribute('href');
    const decorated = campaignNavigation(original, currentHref, campaign);
    if (decorated !== original) anchor.setAttribute('href', decorated);
  }
}
