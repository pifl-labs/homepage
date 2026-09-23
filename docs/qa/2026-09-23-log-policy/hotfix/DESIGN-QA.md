# Log policy post-release typography hotfix — design QA

## Scope and source

- Base: deployed homepage `main@9ce6caac26db86b0d4df60bda52a0dadb98ebea6`. This hotfix changes only Log policy-scoped CSS, one Japanese retention-row label, and its regression test; it does not alter the other policies, app data, consent, or retention rules.
- Exact final build: Astro 133 pages; KO HTML SHA-256 `336196829f6800455b611f43de25b5ace91872cfaad14aeefc4b68c12c948b82`, JA `8575620882281936820ca3d3f6676a978f85950beb37e3b45665824d6ed97764`, EN `2c9c3682b97f08e608647e77a6ed4752ba58b78efaa101509b2d11797f626ca9`; Log CSS `8787f675151b34fc67e606af5516ba11737c739aab1dbf5f56a9c86a36065e`.
- The pre-hotfix images were captured from the public site after `9ce6caa` deployed. The post-hotfix images were captured from the exact local static build under identical Chrome viewport, 200% root text size, and light theme.

## Actual pixel defects and correction

| Locale | Before | After | Evidence |
| --- | --- | --- | --- |
| KO 375px / 200% | Article heading broke `개인/정보의` inside a word. | `개인정보의` moves together to the next line; paragraph and section hierarchy remain legible. | [before](ko-heading-before-375-200.png) · [after](ko-heading-after-375-200.png) |
| JA 375px / 200% | Retention label broke `ロ/ーカル`, starting a line with the prolonged vowel mark. | Strict Japanese line breaking; short equivalent label `アプリ内データ` fits without losing the local-storage disclosure in the preceding data table. | [before](ja-list-before-375-200.png) · [after](ja-list-after-375-200.png) |
| JA 320px / 200% | Even after strict line breaking, the original long label isolated the last `タ`. | Short label remains whole with no document overflow. | [after](ja-after-320-200.png) |
| EN 375px / 200% | First-column `Advertisi/ng` and `Purchase/s` broke inside words. | Table may wrap at spaces only; all first-column words are complete and the other columns remain horizontally scrollable. | [before](en-table-before-375-200.png) · [after](en-table-after-375-200.png) |

Additional final-build narrow samples: [KO 320px / 200%](ko-after-320-200.png), [EN 320px / 200%](en-after-320-200.png). The existing keyboard-scroll/table accessibility checks remain in the full matrix.

## Four design gates

- Visual: **PASS for the above scoped defects** on original/full-size screenshots. No new unrelated artwork or layout change.
- Text/responsive: KO/JA/EN/default × 320/375/768/1280 × 100%/200% × light/dark = **64/64 PASS** in the exact rebuilt browser matrix; 0 document overflow, 0 page JS errors. Raw reduced results: [browser-matrix.json](browser-matrix.json). 320px/200% representative screenshots were visually inspected, not merely box measured.
- Function/accessibility: all three table regions per route remain keyboard focusable and horizontally scrollable. The prior direct link/keyboard tests are unchanged; the CSS hotfix does not modify navigation or scripts.
- Artifact: source/build hashes above; pre/post images are labeled separately. Publication **not yet claimed** for this hotfix; it requires independent review, merge, Cloudflare production success, and public KO/JA/EN/default readback.

## Diagnostics and limits

- The optional rendered-text scanner identified the actual defects after numeric overflow checks had passed. With candidate CSS at 375px/200%, its counts dropped KO 28→17, JA 3→1, EN 12→9; remaining flags mainly concern long technical tokens, addresses, hyphen/punctuation boundaries, or inherited footer text. Its `UNVERIFIED` status reflects unsupported generated/non-text content, not visual approval; it is **not** represented as “zero text findings.” The in-scope article-heading, Japanese prolonged-vowel, and English table-word defects were separately pixel-checked and fixed.
- A first final-build 64-cell run had one intermittent dark-theme initialization miss at EN 768px, not reproduced in 20 identical reloads; a full rerun passed 64/64. This is recorded rather than hidden. Theme scripts were not changed by this hotfix.
- `npm test`: 132/132 PASS; `npm run build`: 133 pages PASS; `npm run test:built`: PASS; `git diff --check`: PASS. `npm run check` remains unavailable because optional `@astrojs/check` is not installed; no package download was introduced.
- Release gate: **independent visual review and live deployment/readback pending**. These screenshots apply only to the Log privacy routes, not other site pages or apps.
