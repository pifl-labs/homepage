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
* The publisher's Sudoku listing is outside this homepage's ten exposed catalog products; no new product page was invented.
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
