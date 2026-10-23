# Submitted listing screens and detail-page layout

Observed 2026-10-23 (PIRATE local date). Read-only App Store Connect (PiFl Labs Co., Ltd.) and Google Play Console (PiFl Labs) in the existing company Chrome profile. No accounts, submissions, permissions, app repositories, devices or simulators were changed.

Inventory: Apple 14, Google 13, intersection 13, union 14. Legion is Apple-only. Apple: 7 ready for distribution, 5 waiting for review, 2 preparing submission without an attached build. Google: 11 production releases, Kkachi production under review, Sky internal testing (plus a draft). The website retains 11 live / 3 coming-soon products and Android-only download links for Sudoku and Tide.

| App / site slug | Apple attached version (build), state | Google latest relevant track | Website image decision |
|---|---|---|---|
| Pomodoro at Sea / pipi-focus | 1.2.1 (52), ready | 1.2.1 (52), production + internal | Replace with 3 current Apple listing images |
| Vocab Routine / pipi-words | 1.0.14 (35), waiting review | 1.0.14 (32), production; internal 1.0.12 (28) | Replace, including recall-writing screen; review warning |
| Until That Day / pipi-dday | 1.1.5 (28), ready | 1.1.5 (28), production + internal + closed; older Alpha draft | Replace with 3 current listing images |
| Mood Tile / pipi-log | 1.0.12 (25), ready | 1.0.12 (25), production; newer 1.0.13 (26) internal | Replace with Apple 25 metadata; do not claim Android internal 26 capture |
| Korean Bridge / pipi-bridge | 1.0.2 (23), ready | 1.0.2 (23), production + internal | Replace; home preview uses learning screen rather than language onboarding |
| KanaSprout / pipi-hello | 1.0.10 (33), ready | 1.0.10 (33), production + internal | Replace with current English listing images |
| Dialogos / dialogos | 1.0.3 (18), ready | 1.0.3 (18), production; internal 1.0.0 (8) | Replace with current listing images |
| Photo Outlines / pipi-draw | 1.2.2 (52), waiting review | 1.2.2 (52), production 100% | Replace source with current submission metadata, but explicitly disclose older UI remains in it |
| Hangul Voyage / pipi-word-voyage | 1.1.0 (31), ready | 1.1.0 (31), production + internal | Replace with voyage, word-search and initial-consonant screens |
| Cell by Cell Sudoku / pipi-sudoku | 1.0.0 (11), waiting review | 1.0.0 (1), production, 178/178 countries | Replace using that Apple submission only; review warning; no Flutter-host claim |
| Tide Friend / pipi-tide | 1.1.2 (14), waiting review | 1.1.2 (14), production; internal 1.0.5 (9) draft | Replace with tide, activities and alerts; review warning |
| Kkachi / kkachi | 1.0.0 (9), waiting review | 1.0.0 (9), production review; internal (7) | Add submitted screenshots on detail page; retain coming-soon and disabled downloads |
| Skydaze / pipi-sky | 1.0 preparation, no attached build/screens | 1.0.0 (2) internal; (19) draft | Keep no preview. Google listing images exist but cannot be tied to submitted build 19 |
| PiPi Legion Chronicle / pipi-legion | 1.0 preparation, no attached build/screens | Not listed | Keep no preview |

## Evidence scope and remaining gap

The 36 images are **official listing attachments**, not newly generated assets or screenshots captured by running a submitted binary. Exact Apple source URLs, attached versions, review states and localized labels are recorded in `src/data/app-submission-media.json`. Google asset URLs are in `google-image-sources.json`. All 13 Google listings were opened; representative phone images were visually compared with Apple. This does not prove every image in every locale/device-size set matches its binary.

The site explicitly identifies English listing images, the Apple attached version/build, and that capture-to-build equivalence is unverified. Review previews have a public-version warning on home and detail pages. Existing public-release history is preserved independently from the newly identified submission versions.

Draw's Google listing was last updated October 18; current submission metadata still contains earlier UI. Targeted official Draw HANDOFF records (main, photo-aspect and svg-export worktrees) did not establish a capture tied to build 52. Do not substitute current development screenshots. Sudoku Apple 1.0.0 (11) was submitted October 13 per supplied evidence; Flutter merge f42729c is not proof of a new Apple submission. Google Console confirms 1.0.0 (1) production October 21 23:40 KST (14:40 UTC), 178 countries. No app build or simulator was run. A matching build capture supplied by its owner is still needed to close the binary-level visual verification gap.

## Layout and validation

Detail pages use one reading edge for the app identity, title, body, section titles and final buttons. Identity blocks use a 64px icon column and a shrinking text column so short names no longer unexpectedly wrap the entire identity below the icon. Removed forced headline line breaks; Korean keep-all, Japanese strict line breaking and narrow-screen phrase wrapping, and English readable section-heading spacing/font prevent awkward segmentation. No font-size reduction. Screenshot strips retain aspect ratios, are keyboard focusable, and feature columns fit available width. Home subgrid alignment and compact spacing remain unchanged.

- Build passed.
- 19 targeted tests passed (catalog inventory, icons, built-page discovery, image provenance).
- Built checks passed: 45 localized home/app pages, 180 store links; Draw disclosures and store-transition checks.
- Initial layout: 252 DOM cases across 42 detail pages at 320/375/768/1280/1920 and 320px with 200% root text. Final image/layout pass: 126 cases (42 pages × 320 normal, 320 200%, 1280 normal); no document overflow or clipped selected headings/body/badge text. The English section-font adjustment was subsequently checked separately.
- Actual 375px captures of all 42 pages reviewed for header/name/wrapping; representative complete detail pages and 1280px desktop captures reviewed for screenshots, feature rows and CTA alignment. DOM checks are not treated as a substitute for visual review.
- Limits: local PIRATE Chromium only; no Safari/Firefox, OS accessibility-font integration, physical devices or app-binary capture. 200% test uses a local-only HTML font-size fixture, not browser zoom. Full visual review of every page at every width was not performed.
