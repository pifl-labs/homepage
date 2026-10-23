# Feature journey review — 2026-10-23

Read-only comparison of versioned release notes, existing 2026-10-23 public observations and earlier/later document baselines. No app implementation was edited. Version labels identify document scope, not inferred release dates. All 30 dated archive events remain unchanged.

| App | Compared versions | Explicit limit |
|---|---|---|
| pipi-focus | 1.0.2 → 1.0.3, 1.0.16 → 1.1.0, 1.1.0 → 1.2.0 | Individual fixes in 1.0.4–1.0.15 are not exhaustively reconstructed. |
| pipi-draw | 1.0.0 소개 문서, 1.0.0 → 1.0.11, 1.1.2 공개 기록 | 1.0.1(19) was held from public release. Feature changes in version 1.2.2 need separate verification. |
| pipi-words | 1.0.0 → 1.0.1, 1.0.5 → 1.0.6, 1.0.11 → 1.0.12 | Features after 1.0.12 are outside this summary. Earlier stages are supported by version notes, not verified individual release dates. |
| pipi-log | 1.0.0 소개 문서, 1.0.0 → 1.0.1, 1.0.11 → 1.0.12 | Later sharing features in development metadata are not attributed to 1.0.12. |
| pipi-dday | 1.0.0 → 1.0.1, 1.0.5 → 1.1.0, 1.1.4–1.1.5 | The notes record Play 1.1.4 being replaced by 1.1.5, so their changes are grouped. |
| pipi-hello | 1.0.0 소개 문서, 1.0.0 → 1.0.1, 1.0.9 → 1.0.10 | Historical subscription terms are not presented as current terms; intermediate release dates need verification. |
| pipi-word-voyage | 1.0.0 → 1.0.1, 1.0.8 → 1.0.9, 1.0.10 후보 → 1.1.0 공개 관측 | Proverb documentation retains the 1.0.10 candidate label; its first public arrival is not asserted as 1.0.10. |
| dialogos | Android 1.0.0, 1.0.0 → 1.0.2, 1.0.2 → 1.0.3 | 1.0.1 was skipped and included in 1.0.2, documented as the first iOS release. |
| pipi-bridge | 1.0.0(20), 1.0.0 → 1.0.1 문서, 1.0.1(22) 문서 → 1.0.2 관측 | The precise delta from documented 1.0.1 to public 1.0.2 is unverified; internal build 21 is not counted as a release. |
| pipi-tide | 1.0.5(7) 문서, 1.1.0(12) 문서, 1.1.2(14) 문서 | The prior audit confirms Android availability, not each documented version rollout or an iOS launch. The earlier personal-account lineage is kept separate. |
| pipi-sudoku | Android 1.0.0(1), 1.0.1(12) 제출 문서 | Public rollout of 1.0.1 and completion of the iOS launch were not verified here; this is not presented as a new public feature. |
| pipi-sky |  | Initial sky-viewing release copy exists, but public initial/intermediate feature changes remain unverified. |
| kkachi |  | Version configuration and preparation status were checked; comparable versioned feature notes were not found in this scoped review. |
| pipi-legion |  | Control and fleet redesign notes exist for internal candidates 0.4.0 and 0.6.0, but are not tied to public releases and are excluded from the release journey. |

## Evidence handling
Sources in archive-journeys.mjs record repository-relative file, last Git commit where available and exact file SHA-256. Source documents themselves (including internal review sections) are not copied to the public build. Public UI contains only paraphrased feature changes, version identifiers and explicit limits. No email re-query or raw email data.
Draw 1.1.2 print/PDF summary reuses the previously verified archive event, not inferred from a current development branch. No new claim of first availability from metadata filenames. Legion documents are outside a Git repository; hashes, not invented commit IDs, identify them.

## Verification
525 existing tests passed; 2 additional journey integrity/render tests passed; build and store-link/localized transition checks passed. PIRATE IAB local and remote QA results are reported with the final commit/Preview. Production release gate is not asserted; this is a draft PR review.

Local visual checks: KO desktop 1280, JA mobile 375 and tablet 768, JA light desktop 1920, and KO/JA/EN 320px with 200% root-text fixtures. No horizontal overflow. Native keyboard Enter expands the journey. Three-app selection showed only Hello/Words/Log. Fixtures are text scaling, not native browser zoom; no full cross-product matrix or real mobile hardware claim.
