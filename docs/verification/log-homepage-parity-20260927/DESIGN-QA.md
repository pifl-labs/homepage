# Mood Tile homepage parity — 2026-09-27

Scope: only the Log / Mood Tile (`pipi-log`) entry and landing copy on the PiFl Labs homepage. This is an isolated local candidate, **not** a public deployment.

## Public-store facts checked

| Market | App Store / Google Play public title | Both public versions | Icon |
| --- | --- | --- | --- |
| KR | 기분 한 칸: 날씨 감정일기 | 1.0.10 | Pink journal, cloud and sea wave |
| JP | 気分のひとこま：感情日記 | 1.0.10 | Same visual icon |
| US | Mood Tile: Daily Journal | 1.0.10 | Same visual icon |

- App Store: [KR](https://itunes.apple.com/lookup?id=6770272665&country=kr&lang=ko_kr), [JP](https://itunes.apple.com/lookup?id=6770272665&country=jp&lang=ja_jp), [US](https://itunes.apple.com/lookup?id=6770272665&country=us&lang=en_us). Lookup API returned the titles, versions and artwork; its `currentVersionReleaseDate` was `2026-09-23T20:23:13Z` for all three. The homepage's date convention is UTC, so it displays 2026-09-23; this is 2026-09-24 in Korea.
- Google Play: [KR](https://play.google.com/store/apps/details?id=com.pifl.pipi.log&hl=ko-KR&gl=KR), [JP](https://play.google.com/store/apps/details?id=com.pifl.pipi.log&hl=ja-JP&gl=JP), [US](https://play.google.com/store/apps/details?id=com.pifl.pipi.log&hl=en-US&gl=US). Public localized pages returned the same respective `og:title`, icon URL and embedded app version `1.0.10`; visible last-updated date was 2026-09-23 in each locale. The KR page icon was visually compared in-browser to the existing local homepage icon. This is a visual match, **not** a byte-for-byte assertion.
- Homepage icon `/assets/apps/pipi-log/icon-62e28eb5e981.webp` was already the matching design, so no icon asset was changed.
- The existing `since: 2026-06-09` first-launch field was left untouched; this audit did not independently re-establish that historical date.

## Factual copy gate

Before: Log landing said all records remained on device and network was used *only* to show ads. That contradicted the [current Log privacy policy](../../../src/pages/ko/apps/pipi-log/privacy.astro), which explicitly lists Google AdMob, in-app purchase and receipt validation, while distinguishing locally stored diary/photo contents. The app's `lib/presentation/detail/entry_detail_actions.dart` (`code/pipi_log` sibling repository) also gates biometric locking behind premium. Now all three locales explain local diary/photo storage, ads and purchases using network services, and the paid nature of biometric lock. None of these changes imply the app is completely free or that all data is local.

## Exact candidate QA

- Built from verified `origin/main` base `b929483239b7156ea62f79e3b06c6c8a43eda470` plus this isolated diff. Built HTML SHA256: KO `1f0a2692d637e634ade5ff6a5467d2ef2f80dbf77e8e35e5718ddcd7a0d5317b`, JA `f2e7b1b73d7833b6eb7e810c814cbe0a0edce51c1a4a0cd62adc38b1ef37e3b4`, EN `1a0c966980ea117291d4b02dc48c62f45c7c9d7d84944fc2ab5126addb4678e9`; built landing CSS `2307ebc8531db6b3b6151171bfec1b7f6b8fb51f145e516c244ca8bc8a8a8c20`.
- `npm test`: **139/139 pass**.
- `npm run build`: **133 pages built**.
- `npm run test:built`: store links **33 pages / 144 links pass**; Draw regression pass; Focus, Word Voyage and Log 3-locale store-transition assertions pass. The Log assertions verify the exact names, previous-name alias, v1.0.10, no redundant store-name transition notice, purchase disclosure and premium-lock disclosure.
- Actual Codex in-app browser against a local static build: KR 1280×800 desktop; JA 375×812 phone; EN 768×900 tablet; KO/JA/EN 320×900 with root font forced to 32px (200% relative to default). The 200% fixture was generated from each **built HTML file** with only a temporary `html{font-size:200%!important}` style in ignored `dist/`; no test-only CSS was shipped.
- Browser measurements: `documentElement.scrollWidth === clientWidth` at all checked widths; each 320px/200% store button stayed within x=4..316; three locales showed v1.0.10. KO button labels retained word boundaries instead of splitting `받기`; JA lede kept `登録不要。` and `日記と写真` as reading units; EN last lede line was `your device.` rather than lone `device.`. The EN 768px section title rendered with the intended readable display font, not compressed Fraunces. The KO 375px premium-lock feature card and final CTA were visibly readable with no clipped text.
- The DOM overflow/version/store-button check also passed at **320, 375, 768, 1280 and 1920px in KO/JA/EN** (15 cells, normal text). The homepage's light and dark theme states were inspected on the KO desktop page; the light-mode hero retained readable contrast and layout. The temporary theme choice was returned to Auto.
- A real click on the Korean landing's privacy link navigated to `/ko/apps/pipi-log/privacy/` and exposed the expected Log policy heading. The two store links' exact `href`, accessible names and `noopener` were inspected; no external-store purchase or login flow was attempted.
- KR hero links retained both valid store destinations and the Log privacy-policy link. Other apps' names, assets and code are outside this change.

Verdict: **PASS for this local Log homepage candidate only**. No push, PR, merge, deployment or claim about other apps' production state.

| Gate | Decision |
| --- | --- |
| Visual hierarchy and contrast | PASS — title, icon, buttons and release data remained distinct in inspected dark/light views. |
| Text, responsive and enlarged | PASS — above 15-cell normal matrix and 3-cell 200% matrix, plus visual wrap inspection. |
| Functional and accessibility | PASS within scope — privacy click/readback, store destinations and accessible labels; external purchase/login not in scope. |
| Exact artifact | PASS for local build SHA above; production deployment is **not** claimed. |
| Publication integrity | N/A — no public write made. |
