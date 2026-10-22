# Company homepage app audit — 2026-10-23 UTC

Scope: pifl-labs.com, GitHub `pifl-labs/homepage`. Not PiPi Worlds. No app repository, Words app work, simulator/device pool, production deployment or main merge was touched.

Base: `adc92af7f24a72a7dca3111c1d6d958591b7fc18` (remote main verified read-only). Branch: `codex/homepage-app-audit-20261022`. Isolated checkout: `/Users/pirate/Documents/Codex/2026-10-23/task/homepage`. Original `/Users/pirate/pifl-labs/code/pifl-labs` remains on `fix/log-policy-name-20260921`, with the same pre-existing modified/untracked files.

## Findings and implemented changes

All ten homepage products were checked. Nine are publicly available on both stores; Legion remains unverified/upcoming. The largest factual error was **Dialogos incorrectly marked coming soon**. It now has verified localized names, public links, release metadata and download actions. The home count and footer derive nine releases automatically; stale Dialogos-in-drydock copy was removed in KO/JA/EN.

A single catalog now explains each app's job using a short, localized description, official icon and localized public App Store screenshot. There are no generated icons or fabricated product screens. Current names and former names remain searchable. Version information is moved out of the decision card into a native, keyboard-accessible disclosure, retaining the dated platform history without a second always-open app list.

| Product | Public Apple KR version (UTC release day) | Public identity / distinguishing purpose | Result |
|---|---|---|---|
| Korean Bridge | 1.0.2 / Oct 21 | Korean Bridge - 어린이 한국어·한글·수학; Korean, early math and school preparation for ages 4–8 | Expanded exact localized names; current official icon; second store screenshot shows learning home rather than language setup |
| 집중항해 / Pomodoro at Sea | 1.2.0 / Oct 19 | Pomodoro timer, lofi/rain audio, island rewards | KR returned 1.2.0 while JP/US returned 1.2.1 / Oct 22; conservative KR release snapshot retained, regional differences preserved in receipt |
| 밑그림 / Photo Outlines | 1.2.1 / Oct 21 | Photos to coloring outlines, hands-on coloring | Public icon/screen and concise purpose; no invented beta exports or unlimited-AI claim |
| 낱말항해 / Hangul Voyage | 1.1.0 / Oct 21 | Korean word puzzle, word search, initial-consonant and proverb quizzes | New public gameplay modes are explicitly present in the public description |
| 말놀이 새싹 / KanaSprout | 1.0.10 / Oct 18 | First Japanese for KO/EN children; first Korean in Japanese locale | Locale-dependent learning language preserved |
| 단어루틴 / Vocab Routine | 1.0.12 / Oct 5 | JLPT/TOPIK vocabulary, spaced repetition and listening | Public release unchanged, icon/screen verified; no stopped Words work resumed |
| 그날까지 / Until That Day | 1.1.5 / Oct 13 | D-day/anniversary widgets and lunar dates | Current public names match; official icon/screen verified |
| 기분 한 칸 / Mood Tile | 1.0.12 / Oct 19 | Sea-weather mood journal, photos, tags and calendar | Current iOS release, distinct journaling copy; separately dated Android snapshot preserved |
| Dialogos | 1.0.3 / Oct 22 | Dialogos: 철학자와의 대화 / 賢者との対話 / Stoic Dialogues | Corrected upcoming → live; Apple id6780508628 and Play com.pifl.pipi.thus; optional purchases and AI/external processing boundaries stated |
| 피피 군단전기 / PiPi Legion Chronicle | Unverified | Naval combat concept | Upcoming retained, no store download buttons; card explicitly says public availability/features unverified |

Sources: `homepage-app-audit-20261023.json` contains exact Apple artwork/screenshot URLs, locale names and release timestamps, plus Google Play JSON-LD for KO/JA/EN. Apple lookup is `https://itunes.apple.com/lookup?id=<trackId>&country=kr|jp|us`; canonical store URLs and exact IDs are in `src/data/apps.ts`. Google Play publisher listing independently exposed Dialogos. The existing official website documentation, app facts receipts and legal/source pages were read as supporting context; current public stores controlled launch/name/asset decisions. Existing developer source screenshots are not treated as proof of beta availability.

Each new icon URL is keyed to downloaded source SHA-256; `app-icons.json` records source and WebP hashes. Preview hashes, selected screenshot index and source URLs are in the receipt. Existing unused historical assets are retained to avoid breaking other consumers.

## Limits and uncertainty

* Public store metadata is an observation, not an installed-app functional test. No app simulator was used.
* Google Play names, links, public descriptions and icons were observed; current Android version numbers were not reliably extracted. Older explicitly dated Android snapshots are preserved, never relabeled as newly verified or inferred from iOS.
* Focus storefront version disagreement is retained in the receipt. No claim that KR had 1.2.1 is made.
* Legion's lack of a verified store result does not prove nonexistence. No speculative URL was created.
* Correction: the initial ten-product scope was incomplete. The authenticated account reconciliation below supersedes that scope.
* Detailed existing app landing feature sets were not exhaustively exercised. This work refreshes the company catalog and verified identity/release facts, plus the newly discovered Dialogos launch. Medical/legal policy pages remain unchanged.

## Verification

* `npm run build`: PASS, 148 pages.
* `npm test` after final build: PASS, 514 tests, zero failures/skips.
* `npm run test:built`: PASS, 33 localized home/app pages and 162 store links; Draw disclosures and platform-specific release/name checks pass.
* Historical receipt tests remain intact; current-release assertions were advanced to the new public receipt. New catalog tests assert ten cards, nine actual store previews/download groups, explicit upcoming uncertainty and closed-by-default history.
* `git diff --check`: PASS.

PIRATE local in-app browser: final build served only at `http://127.0.0.1:4326`. This is not a cloud browser and not the live website.

| Matrix | Result |
|---|---|
| KO/JA/EN × 320, 375, 768, 1280, 1920 CSS px; 100%, dark | 15 cells, no page/card/button horizontal overflow |
| Same × built-in 130%, light | 15 cells, no page/card/button horizontal overflow |
| Same × 200% text, dark | 15 cells, no page/card/button horizontal overflow |
| History disclosure click / Enter | Opened to 9 rows, then closed with Enter |
| Dialogos and Draw card navigation | Correct localized landing URL/title; Dialogos exposes both verified store destinations |

200% used a test-only copy of final generated HTML under ignored `dist/qa-200`, overriding only `html { font-size:200%!important }`; computed root size was 32px. It is not shipped source and is not claimed as a physical-device or browser-zoom test. A viewport update initially returned the previous JA width; the exact JA 320px cell was remeasured and recorded. Screenshot inspection sampled KO desktop/mobile, EN large/light, JA desktop and JA 200%; DOM measurements cover the stated matrix. Full WCAG/contrast audit, screen-reader testing, all detailed routes and real devices remain unverified, so this is a **draft for review, not production release approval**.

Evidence is preserved locally under `evidence/`: `before-desktop.jpg`, `before-mobile.jpg`, `after-desktop.jpg`, `after-desktop-full.jpg`, `after-mobile.jpg`, `after-en-large-light.jpg`, `after-ja-200.jpg`, `final-built-matrix.json`, `responsive-200-built.json`, raw public responses and build/test logs. Before/after use 1280×900 desktop and 375×812 mobile; scroll positions differ to show the changed catalog. No operating-system or shared browser preferences were changed; preferences only applied to these localhost origins.

## Corrected account-wide audit (supersedes initial ten-app scope)

PIRATE local Chrome profile `pifl-labs.com` was selected from the enabled profile inventory. Existing signed-in App Store Connect (PiFl Labs Co., Ltd.) and Play Console (PiFl Labs, 8852533891626306957) were read without credential or permission changes. Initially open tabs were stale: refreshing changed Sudoku from internal testing to production. One Apple tab stalled at sign-in loading; the other existing Apple tab successfully navigated to a newly loaded Apps grid. These refreshed results are authoritative for this receipt.

Apple: **14** current listed apps (7 latest versions ready, 5 in review, 2 preparing submission). Play: **13** current listed apps (11 production, 2 internal testing; Kkachi changes in review). **Intersection 13, union 14; Apple-only Legion, no Play-only app.** Apple latest-submission status does not establish the availability of an older release. No discontinued state is in the current lists; historical deleted apps are not proven absent.

| App key | Apple ID / latest submission | Play status |
|---|---|---|
| focus | 6762258878: 1.2.1 ready | production |
| draw | 6779071131: 1.2.2 waiting for review | production |
| wordvoyage | 6788949612: 1.1.0 ready | production |
| hello | 6777299814: 1.0.10 ready | production |
| words | 6770267735: 1.0.14 waiting for review | production |
| dday | 6770268950: 1.1.5 ready | production |
| log | 6770272665: 1.0.12 ready | production |
| thus | 6780508628: 1.0.3 ready | production |
| bridge | 6801205183: 1.0.2 ready | production |
| tide | 6820126418: 1.1.2 waiting for review | production |
| sudoku | 6820125053: 1.0.0 waiting for review | production |
| kkachi | 6824772783: 1.0.0 waiting for review | internal testing; changes in review |
| sky | 6797726159: 1.0 prepare for submission | internal testing |
| legion | 6791804605: 1.0 prepare for submission | not in account list |

Missing from the original homepage: **Tide Friend, Cell by Cell Sudoku, Kkachi, Skydaze**. Added all four, including 12 localized landing pages. Tide and Sudoku have confirmed public Android listings and production console status; only Android download buttons are exposed. Kkachi and Skydaze remain preparing/testing with no download buttons. Skydaze's former name PiPi Sky is retained for recognition. Google Sudoku's current console name is Cell by Cell Sudoku; public names are 한칸씩 스도쿠 / ひとマスずつナンプレ / Cell by Cell Sudoku.

Public KO/JA/EN Play listings supply the two new released apps' names, concise descriptions, icons and first screenshots. Unreleased icons come from the official local app repositories (read-only), with source hashes in `app-icons.json`; they are not described as released store icons. No new images were generated. Apple public lookup returned no KR matches for the four omitted IDs, so no unverified iOS link/version was added. Both public developer pages were checked as supplementary evidence: the Play developer page alone listed only 10 packages and omitted Tide despite its live direct page.

Full normalized counts, states, public asset URLs and caveats: `homepage-account-inventory-20261023.json`. Local private console evidence is in ignored `evidence/apple-account-inventory.txt` and `evidence/play-account-inventory.txt` (Play metrics excluded). No account financial data is committed.

Corrected-scope validation: `npm run build` PASS (160 pages); `npm test` PASS (515 tests, zero failures/skips); `npm run test:built` PASS (45 localized pages, 180 store links). The first expanded build caught an assumption that every live app had a recorded version; release history now includes only apps with verified version receipts. Platform validation now checks actual available platform counts. No version was invented for Tide or Sudoku. PIRATE local in-app browser: 30 layout checks (3 languages × 5 widths × normal/200% root font size), 14 cards, zero horizontal overflow/clipped cards/buttons. This is CSS font enlargement, not an OS accessibility or browser-zoom test. Desktop and mobile added-card screenshots and the Sudoku mobile landing were visually inspected. Earlier theme checks apply to unchanged styling; the expanded matrix did not repeat every theme combination. Production deployment remains unapproved.

## Spacing correction after review

The previous mobile card placed an icon beside a tall screenshot in the first row and moved the title below that entire row. This created empty space above the actual app information. The desktop home hero also enforced 88vh. The revision moves app identity into a shared icon/name row, keeps descriptions beside the official preview where space permits, and reflows the name/body/preview vertically for enlarged text. Type sizes and 44px minimum store targets are retained. The home hero is content-sized, its artwork stage is smaller, catalog padding and heading gaps are reduced, and cards use smaller padding/gaps. No app facts, launch states, or assets changed.

Same-viewport KO measurements (CSS pixels):

| Measurement | Before | After |
|---|---:|---:|
| Desktop 1280×900 hero | 792 | 579 |
| Desktop first app card | 425 | 366 |
| Desktop complete catalog | 3353 | 2790 |
| Mobile 375×812 hero | 1024 | 816 |
| Mobile first app card | 565 | 386 |
| Mobile complete catalog | 7612 | 5282 |

PIRATE local browser visual comparison: desktop hero and cards, mobile catalog. Final 30-case matrix: KO/JA/EN × widths 320/375/768/1280/1920 × default/200% root font, 14 cards, no document overflow or clipped card/text/button containers, all store targets at least 44px. Narrow Japanese long-name clipping discovered during review was corrected by allowing full-width identity at enlarged sizes. This is root-font enlargement, not browser zoom/OS assistive technology. Relevant tests: 18/18; build 160 pages; built checks 45 pages/180 store links. Evidence: ignored evidence/spacing-{metrics,matrix}.json and spacing-before/after-{desktop,mobile}.jpg. The comparison screenshots were saved to Library. Main and production were not changed.
