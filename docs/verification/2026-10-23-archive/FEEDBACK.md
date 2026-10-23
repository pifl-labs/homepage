# Archive feedback correction and representative history

The deployed 4f5bc4e Preview left the app select on Focus while the URL/count stayed unchanged (11 records); other filters/reset also failed after reload. Astro had inlined the small module, contrary to the deployed `script-src 'self'` policy. The previous local preview did not apply production headers. The same failure was reproduced locally with that policy. The client is now an explicit external module in `public/archive-client.js`; CSP is unchanged. Input/change both apply native selections immediately. Built regression tests reject executable inline archive scripts.

The user's Library screenshot was materialized through the supported transfer tool and inspected. It shows the native select arrow. Selects now retain native keyboard/touch behavior with an inset 16px chevron; supported :open rotates it. Details summaries use matching right-aligned chevrons and native open/closed semantics, 44px targets and reduced-motion support.

## Data coverage

30 representative records across all 14 canonical apps, not every historical version. Notification dates are not release dates; first-listed approvals are not asserted as first launches. Public updates use the already verified store receipt. No feature changes are inferred from approval messages. Internal invitations/uploads/IARC ratings are excluded.

| App | Representative records | Assets and limits |
|---|---|---|
| Focus | Existing 6 records | Earlier/current icons and screens |
| Draw | Existing 5 records | Earlier/current icons and screens; exact submitted capture unverified |
| Words | 1.0 approval; public 1.0.12 + separate approval time | Earlier/current icons and screens; submitted screen may differ from public |
| Log | 1.0 approval; public 1.0.12 + approval time | Earlier/current icons and screens |
| D-Day | 1.0 approval; public 1.1.5 + approval time | Earlier/current icons and screens |
| Hello / KanaSprout | 1.0 approval; public 1.0.10 + approval time | Earlier/current icons and screens; no claim every pair differs |
| Korean Bridge | 1.0.0 approval; public 1.0.2 + approval time | Earlier/current icons; current screen only |
| Word Voyage / Hangul Voyage | 1.0 approval; public 1.1.0 + approval time | Earlier/current icons and screens |
| Dialogos | 1.0.2 approval; public 1.0.3 + approval time | Earlier/current icons and screens |
| Tide | Android production observed | Current icon/submitted listing screen; earlier history unknown |
| Sudoku | Android production observed | Current icon/submitted listing screen; earlier history unknown; no new Flutter-host inference |
| Kkachi | Official material preserved; unreleased | Official repository icon/pending listing screen; earlier history unknown |
| Sky | Official material preserved; unreleased | Official icon; no verified screen or public version history |
| Legion | Official material preserved; unreleased | Website icon; no verified screen or public version history |

Exact asset-to-version association and rename dates remain unverified throughout. Existing website Git assets, `app-icons.json`, `app-submission-media.json` and dated public store receipts support the materials. `archive-extra.mjs` stores the bounded extension; public JSON is synchronized and tested. All-app view keeps two representative exhibits; selecting any app shows only its own materials, avoiding another full catalog.

## Verification

- Build PASS, 163 pages. Full suite 521/521, then final focused archive suite 6/6 including 14-app coverage/CSP regression. Existing built checks PASS: 45 pages/180 links.
- PIRATE local browser: native menu click + arrow keys + Enter under self-only CSP immediately yielded Bridge query, two records and its exhibit. No second filter needed.
- All 14 selections isolate correct rows and one exhibit. Sky plus public-update filter yields empty state; reset returns 30; Back/Forward restores counts. Direct query survives reload, JA switch preserves Hello. Enter opens details; Space closes.
- KO/JA/EN at 320/1280px, normal and 200% root text: no horizontal overflow or loaded-image failures. One stale JA 320 viewport observation was rechecked at actual 320. Representative Words desktop, Hello mobile and Japanese narrow screenshots inspected.
- 200% uses local-only HTML fixtures, not OS accessibility/native browser zoom. No physical-device/Safari/Firefox/screen-reader test. Temporary fixtures are excluded from Git/deployment.
- Home/detail layout CSS unchanged. No app-code changes/builds, credentials, additional email investigation, main merge or production deployment.
