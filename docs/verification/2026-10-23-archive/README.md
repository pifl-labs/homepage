# PiFl Labs archive — manual review, 2026-10-23

## Scope and dates

`/{ko,ja,en}/archive/` provides year, app, platform and event filters with shareable query URLs. All 14 catalog apps are selectable. Focus and Draw have 11 representative records; the other 12 explicitly say history is in preparation, independently of public-release status. This is a partial manually curated collection, not automated ingestion or a complete version history.

`src/data/archive.mjs` is the editable source; `public/archive-evidence.json` is its sanitized downloadable snapshot. Keep them synchronized (the test enforces this). `archive-copy.ts` contains three-language labels. New verified years automatically enter the year filter. FleetLog is renamed to “Last checked store versions” and links to the archive; it remains a current-state table.

Public-store update timestamps, actual submission times stated in notifications, notification Date headers, Git record dates and observation dates are distinct. Approval is not public availability. Focus's first approval notification has no version; Draw's first approval literally says 1.0, not 1.0.0. Version groups retain separate submission and approval-notification times in evidence disclosures. Focus 1.2.0 Korean store observation and 1.2.1 Japan/US observation remain separate, even though the 1.2.0 store timestamp precedes its approval notification by 40 seconds. Neither source silently overwrites the other.

The earlier Focus May 15 and Draw July 14 `since` fields were removed from cards/detail structured data because evidence establishes review receipt/submission, not launch. Tests now prevent those dates from being published as first-release facts. No replacement launch dates are invented.

## Bounded source review

- Website Git 0253ac3366b0c9bdda94c417deb6d2c53d2f56bb: Focus website icon/voyage materials preserved May 29.
- Website Git a181984b2fa219fdc13de2ad72ec56a0ca67a249: Draw website icon preserved June 19.
- Draw official Git 101d79e4: 20260930 screen set recorded October 1; `store_assets/screenshots/20260930/ios/en/ai_result.png` becomes the resized WebP archive image. The folder date is not a store publication date.
- Draw Git 1e64cc3a: version 1.1.2 release notes support printing/PDF/palette/color-selection summary.
- `docs/release/public-facts-20261008.json`, `public-facts-20261014.json`, `public-facts-20261016-focus.json`, `homepage-app-audit-20261023.json`: dated public-store observations. Current submission images retain `src/data/app-submission-media.json` provenance.
- Owner-provided verified notification summaries supply only event/version/time facts and name order. No original email, message identifier, address, internal review reason, token or console export was added. Internal upload/TestFlight events were deliberately excluded from this public review. Not every supplied approval is expanded into a separate row.

Icon and screen pairs compare preserved official assets with current listing observations. They do NOT prove that an icon shipped in a particular version or that a screenshot was captured from an exact submitted binary. Exact rename dates remain unknown. No newly generated icons; optional notification image URLs were not needed. No app repositories were changed, apps built, simulators launched, credentials created, main merged or production deployed.

## Verification

- Astro build: PASS, 163 pages.
- Node tests: PASS, 520/520; archive evidence/locale/filter markup checks included.
- Built checks: PASS, 45 localized home/app pages and 180 store links; Draw disclosures and store-transition identity checks.
- PIRATE local in-app Chromium, normal text: KO/JA/EN at 320, 375, 768, 1280, 1920px (15 DOM cases), no horizontal overflow or loaded-image failures.
- 200% root text: a local-only copy of built pages with `html{font-size:32px!important}`, KO/JA/EN at 320,768,1280px (9 cases), no horizontal overflow. These fixtures are not source files or deployment artifacts. Existing extra-large UI control (130%) separately exercised.
- Actual visual views: KO desktop overview, EN narrow overview, JA light/large text, KO mobile timeline, Draw desktop asset comparison, Focus mobile asset comparison. Not every matrix cell was visually inspected.
- Interactions: app/platform filtering, empty combination, reset, Back/Forward count restoration, preparing app, selected-app preservation across JA language navigation, expandable evidence/screens. Screens remain explicitly unverified against binaries.
- Existing home layout CSS and app-detail layout CSS unchanged. No Safari/Firefox/physical-device or screen-reader session; 200% fixture is not native browser zoom.

Review screenshots are delivered separately via Library. Raw local browser captures and build logs are excluded from Git.
