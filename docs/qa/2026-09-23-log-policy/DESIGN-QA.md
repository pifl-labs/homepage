# Mood Tile privacy pages — design and truthfulness QA (2026-09-23)

## Scope and source

- Base: homepage `origin/main` `be32a27ed3da9b9f7d1f028bdb71d623fb90d83f`; this PR changes only the four Log privacy routes, their scoped CSS/table component, test, and this QA evidence. The existing dirty homepage checkout was not edited.
- Routes: `/ko/apps/pipi-log/privacy/`, `/ja/apps/pipi-log/privacy/`, `/en/apps/pipi-log/privacy/`, legacy English `/apps/pipi-log/privacy/`.
- Build: `npm run build` generated 133 static pages. Final built-page SHA-256: KO `336196829f6800455b611f43de25b5ace91872cfaad14aeefc4b68c12c948b82`, JA `e566a8d87e14d365403ad3531f24569c2b52e6cfaccb68cd8f312b1953db22a0`, EN `2c9c3682b97f08e608647e77a6ed4752ba58b78efaa101509b2d11797f626ca9`, default `ae3ce2a3b472aa177486161c16b9d17f24701a4388037e05d6d6b0d2650452de`.
- The first draft had an invisible light-mode heading and a stranded Japanese character at 200% text size; these were found in real screenshots, fixed, rebuilt and rechecked. This is why source-only/overflow-only QA was not sufficient.

## Truthfulness gate

- App name: `code/pipi_log/docs/brand/product-names.json` and native store metadata confirm KO `기분 한 칸`, JA `気分のひとこま`, EN `Mood Tile`. The historical `PiPi Log` alias remains in the opening paragraph; bundle IDs/routes are unchanged.
- The former blanket claim “sensitive data stored in Keychain/Keystore” was inaccurate. App source `code/pipi_log/lib/data/database/app_database.dart:116–120` puts journal entries in regular on-device SQLite; `tables/log_entries.dart:5` defines the content text column, and `lib/presentation/home/home_screen.dart:356` copies attached photos into app storage. `features/premium/data/premium_repository_impl.dart:24–52` uses secure storage for **purchase entitlement status**. All four pages now disclose this distinction and no separate app-level journal/photo encryption claim is made.
- Original policy effective date **2026-05-17** remains; correction/last-updated date **2026-09-23** and its scope appear in all four languages/routes. No other data-processing or ATT/ad disclosure was invented or removed. Privacy law guidance is not substituted for counsel; [Korean PIPC's 2026 guidance](https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&nttId=12021) supports clearly notifying policy changes.

## Real browser matrix

Chrome headless on the exact built HTML/CSS, KO/JA/EN/default × 320/375/768/1280 CSS px × 100%/200% root text size × light/dark system scheme: **64/64 PASS**, 0 document/heading/text-element horizontal overflow, 0 page JS errors. Raw reduced matrix is in `browser-matrix.json`. The site supports both themes; the final test used browser `prefers-color-scheme` without a competing test-injected localStorage startup script. A preliminary harness with a competing injection intermittently missed theme initialization; fresh-context saved-preference retests passed dark 10/10 and light 10/10. This was not counted as a product PASS without the final clean matrix.

All twelve tables remain intact. On 375px/200% light, first table viewport width 309px, scroll content 979px; keyboard focus has a visible outline and two ArrowRight presses moved scrollLeft 0→80px. Native scroll is contained in the region rather than the document. In KO, home link keyboard Enter → `/ko/` HTTP 200, general privacy link click → `/ko/privacy/` HTTP 200, and email link resolves to `mailto:privacy@pifl-labs.com`.

Representative exact-build screenshots:

- [KO 320px dark](ko-320-dark.png); [KO 375px 200% light](ko-375-200-light.png); [KO table 375px 200%](ko-375-200-table.png)
- [JA 375px 200% light](ja-375-200-light.png); [JA 320px 200% light](ja-320-200-light.png)
- [EN 375px 200% light](en-375-200-light.png)

Visual review: title/product grouping and date hierarchy clear; no one-character Korean/Japanese headline tail in inspected samples; table affordance visible, body text not clipped. These screens represent only the Log privacy routes, not the homepage or other app privacy pages.

## Automated checks and release limit

- `npm test`: 131/131 PASS, including 8 Log policy tests.
- `npm run build`: PASS, 133 pages.
- `npm run test:built`: PASS (store links, Draw facts, Focus transition).
- `git diff --check`: PASS.
- `npm run check`: **UNVERIFIED**: repository does not install optional `@astrojs/check` and its interactive install prompt was declined; no packages downloaded/installed. Build and tests completed independently.
- Publication remains **UNVERIFIED** until this exact PR is merged, Cloudflare deployment succeeds, and all four public URLs are read back; local PASS is not a live claim.
