import { decorateCampaignLinks } from './store-attribution.mjs';

// Deferred module: runs after the static links exist. It never intercepts a
// click or delays navigation; script failure leaves ordinary links working.
decorateCampaignLinks(document, window.location.href);
