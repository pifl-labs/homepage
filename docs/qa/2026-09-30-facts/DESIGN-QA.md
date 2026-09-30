# Homepage facts correction — draft review

Purpose: let visitors identify the app and its actual store listing before downloading, with free download distinguished from optional purchases. Existing icons, taglines and privacy pages are unchanged.

Base: origin/main 87e3f1f. Sources observed 2026-09-30: Apple public Lookup KR/JP/US and Google Play public KO/JA/EN listings for Focus, Hello, Words, D-Day and Draw. App Store IDs: 6762258878, 6777299814, 6770267735, 6770268950, 6779071131. Google Play package IDs: com.pifl.pipi.{focus,hello,words,dday,draw}.

Verified iOS versions: Focus 1.0.15; Hello 1.0.8; Words 1.0.11; D-Day 1.1.3; Draw 1.0.12. Unverified Android versions are omitted for these five apps; visible versions carry iOS labels and cross-platform JSON-LD omits softwareVersion. Store links remain unchanged. Exact store names are split by platform. No free-content limits, word counts or billing periods are introduced.

Validation:
- npm test: 141/141 PASS.
- npm run build: 133 pages PASS.
- npm run test:built: PASS (33 pages, 144 store links, disclosures, platform identity/version contracts).
- npm run check: FAIL with five errors in unchanged AppCatalog.astro, AppLanding.astro and FleetLog.astro (implicit-any callbacks and invalid role="text"); not suppressed or reported as passing. No standalone lint script exists.
- Browser matrix and visual review: IN PROGRESS. Target: KO/JA/EN home + five app details, 320/375/768/1280/1920, light/dark; text 200% at 320. This is a draft, not release approval.

Visual: UNVERIFIED (review in progress). Functional: UNVERIFIED (browser interaction pending). Release: HOLD. No merge/production deployment authorized for this turn. Old screenshot assets may retain former names; asset refresh is outside this correction.
