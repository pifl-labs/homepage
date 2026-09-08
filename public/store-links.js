import { decorateCampaignLinks } from './store-attribution.mjs';

// Deferred module, after static anchors exist. Never intercepts clicks or
// delays navigation; script failure leaves ordinary download links working.
decorateCampaignLinks(document, window.location.href);
