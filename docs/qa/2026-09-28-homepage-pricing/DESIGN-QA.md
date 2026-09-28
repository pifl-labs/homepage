# Homepage pricing disclosure — design QA (2026-09-28)

## Scope and artifact

- Target: `http://127.0.0.1:4325/{ko,en,ja}/`, served from this worktree's production `dist/` build.
- Source base: `87e3f1faf1c169002721285850deeb1bcae46bc6` (`fix/homepage-free-tier-20260928`). The main checkout's unrelated work was not changed.
- Final built HTML SHA-256: KO `0b8f8390e79ab2a32c0aa6a68a02cd61be7b3e5065ab1c59c65b66e5379657c6`; EN `6aad47ddb07df63b40ed040627cae6b5fe6dc5aac81251739c5b4a7f33c0ef8c`; JA `6e5a1a132b2d04bb2f0e84d1a09c8aa0148f14bcf2c9841931e7c20f683c5af2`; stylesheet `568a1944eab0337a36d5dda8f0a45b86137535b8d85e131a7d28dce0550f8a66`.
- QA-only 200% simulation was added **only** to generated `dist/colors_and_type.css` after a build, not to source. It was restored byte-for-byte; final built and public CSS both SHA-256 `efafdffbdc75766de17f2df038392898ed15bc0713f2db65ae362ac18044b7f0`.

## User-facing before → after

| Locale | Before | After | Finding |
|---|---|---|---|
| KO | `무료 · 계정 없이` | `무료 설치 · 일부 앱에서 인앱 결제` | Free installation is distinguished from optional purchases in some apps; no blanket account claim. |
| EN | `Free · no account` | `Free install · paid options in some apps` | Same distinction; semantic groups stay intact in enlarged text. |
| JA | `無料 · アカウント不要` | `インストール無料 · 一部アプリ内課金` | Same distinction; the paid phrase stays together. |

Store/portfolio fact check: all eight live apps are free to install; six offer in-app purchases, while Bridge and Word Voyage do not. This is **not** a claim that every feature is free or that every app is account-free. The price note remains secondary to the primary app-list CTA and uses the existing `--text-secondary` token, not a new button/badge treatment.

## Real-browser matrix

Codex browser controlled the built static pages. After the site's entrance animation settled, the final-source light/default-text matrix had `document.documentElement.scrollWidth === innerWidth` in all 12 cells. Pricing, maintained-date label, and CTA right edges remained inside the viewport.

| Locale | 320 | 375 | 768 | 1280 |
|---|---:|---:|---:|---:|
| KO | 320/320 | 375/375 | 768/768 | 1280/1280 |
| EN | 320/320 | 375/375 | 768/768 | 1280/1280 |
| JA | 320/320 | 375/375 | 768/768 | 1280/1280 |

Entries are `scrollWidth/innerWidth` in CSS px. At 320px, default 16px root font, the pricing right edges were KO 236px, EN 304px, JA 244px. The actual viewport was inspected visually, not inferred from source. The primary CTA remained visually distinct, and EN `See the apps` was clicked on the final build: the URL became `/en/#apps` and `#apps` was visible. KO/JA same CTA flow was clicked during the preceding copy iteration; the CTA markup was unchanged thereafter.

At the built-in `xlarge` setting (20.8px root font), dark/320px: KO/EN/JA pricing stayed within 320px (right edges 297/309/307px), with readable secondary text `rgb(192,201,221)` on `rgb(2,6,23)`; light pricing was `rgb(54,64,90)` on `rgb(244,247,251)`. Calculated contrast is approximately 12.14:1 dark and 9.59:1 light. EN used two lines; KO and JA one. There was no cut-off or meaningless single-glyph tail in the changed pricing text.

At **200% text scale** with 320px CSS width, screenshots and geometry were inspected in both themes. KO/JA paid phrases and all three maintained-date labels stayed as intact reading units; EN used three meaningful units: `Free install ·` / `paid options` / `in some apps`. KO final paid phrase measured 276.5px wide, ending at 280.5px; the pricing container ended at 316px. The document settled at `scrollWidth=320px`, and neither price nor CTA escaped the 320px viewport. This was a temporary CSS-variable simulation of text-only scaling, **not** a claim that browser zoom on every browser/device was tested.

## Commands and gate

- `npm test`: **145/145 PASS**, including 4 focused disclosure regressions.
- `npm run build`: **PASS**, 133 static pages.
- `npm run test:built`: **PASS**, 33 localized home/app pages, 144 store destinations, Draw/transition checks.
- `git diff --check`: **PASS**.
- `npm run check`: **baseline FAIL** with five existing diagnostics in unchanged `AppCatalog.astro`, `AppLanding.astro`, `FleetLog.astro` (implicit `any`, `role="text"`). None is in a changed file; this is not misreported as green.

**Visual PASS** for this pricing/metadata change; **text/responsive/accessibility PASS** for the tested route matrix; **functional PASS** for the unchanged primary CTA; **artifact match PASS** for the local production build. Production URL is **UNVERIFIED until PR merge and deployment readback**. This report does not certify unrelated home sections or other app pages.
