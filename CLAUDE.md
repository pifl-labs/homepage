# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PiFl Labs is a static website for a Flutter-focused development company ("Code like a pirate. Fly like Flutter."), hosted on Firebase Hosting. Vanilla HTML/CSS/JS site (no build tools, no framework) with multi-language support (Korean default, English, Japanese).

## Project Structure

```
public/
  index.html              # Main (Korean, lang="ko", x-default)
  en/index.html           # English
  ja/index.html           # Japanese
  ko/index.html           # Redirect-only → / (301)
  styles.css              # Shared stylesheet (1,680 lines)
  script.js               # Shared script (210 lines)
  404.html                # Error page (standalone styles)
  sitemap.xml             # 3 URLs: /, /en/, /ja/
  robots.txt
  pifl-ship.png / .webp   # Hero image (2.3MB / 273KB)
  pipi-mascot.png / .webp # Mascot image (1.3MB / 112KB)
firebase.json             # Hosting (security headers, redirects, cache, rewrites)
.firebaserc               # Firebase project: pifl-labs-main
STRATEGY-2026.md          # 2026 business strategy report
DEVELOPMENT-GUIDE.md      # Development guide for adding new pages
```

## Key Architecture

- **No build step**: Pure static files. No bundler, transpiler, or framework.
- **3 content HTML files share 1 CSS + 1 JS**: `/index.html`, `/en/index.html`, `/ja/index.html` all reference the same `styles.css` and `script.js`. Changes affect all languages.
- **`/ko/` is a redirect**: Korean content lives at root `/`. The `/ko/` path 301-redirects to `/` via both firebase.json and meta refresh.
- **CSS variables**: All colors, spacing, fonts in `:root`. Media queries at 768px/480px redefine spacing variables for mobile.
- **CSP enforced**: `script-src 'self'` — no inline JS allowed. Use `data-*` attributes + addEventListener.
- **Email obfuscation**: Never use plaintext `mailto:`. Use `data-email-user` + `data-email-domain` attributes; `script.js` assembles them at runtime.
- **Image pattern**: Always use `<picture>` with WebP source + PNG fallback. Include `width`/`height` for CLS prevention.
- **Mobile text switching**: Dual spans with `-full` (desktop) and `-mobile` (shortened) variants, toggled via CSS at 768px.

## Development Commands

```bash
# Local dev server
npx http-server public -p 8000

# Deploy
firebase deploy --only hosting
```

## Multi-Language Sync

When editing content, update all 3 content files simultaneously:
1. `public/index.html` (Korean)
2. `public/en/index.html` (English)
3. `public/ja/index.html` (Japanese)

Each file needs matching: hreflang links, canonical URL, og:url, og:locale, nav-link text in its language, lang-btn active state.

## Known Issues

- **6 missing @keyframes**: `float`, `gentle-float`, `brand-glow`, `cyber-glow`, `neon-pulse`, `cyber-float` are referenced in styles.css but have no definitions — these animations don't work.
- **Favicon oversized**: Using 1.3MB `pipi-mascot.png` as favicon. Needs dedicated 32/192px files.
- **og:image oversized**: Using 2.3MB `pifl-ship.png`. Needs 1200x630px optimized version.

## Firebase

- Account: `andrew.kim@pifl-labs.com`
- Project ID: `pifl-labs-main`
- Domain: `pifl-labs.com`
- Security headers: X-Frame-Options, X-Content-Type-Options, HSTS, CSP, Permissions-Policy, Referrer-Policy (all in firebase.json)

## Reference Files

- `DEVELOPMENT-GUIDE.md` — Detailed guide for adding pages (templates, design system, component patterns, checklists)
- `STRATEGY-2026.md` — Business strategy and roadmap
- `HANDOFF.md` — Session-by-session change log
