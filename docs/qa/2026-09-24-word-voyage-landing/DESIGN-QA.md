# 낱말항해 공개 랜딩 사실 정합성 · 디자인 QA (2026-09-24)

## 범위·실행물

- 대상: `https://pifl-labs.com/{ko,ja,en}/apps/pipi-word-voyage/`의 **홈페이지 랜딩만**. 앱 바이너리, 스토어 설명, 다른 앱 랜딩은 이번 판정 범위가 아니다.
- 사용자 행동: 기능을 이해하고 해당 언어의 스토어 버튼으로 이동한다.
- 작업 기준: 독립 홈페이지 worktree의 `origin/main@c6ff6de` + 이 변경. 기존 더티 홈페이지 checkout은 수정하지 않았다.
- 최종 후보 source SHA-256: `src/data/apps.ts` = `0a46e0db9ea9150ddfee24c534ed8d1c6bf01f8af628e7696fd215edf9684920`; `public/styles-app-landing.css` = `ac2401afe8914dc50c0c0c4887746b93edddb223f08a233aba3b302f69f9262a`.
- 빌드 HTML SHA-256: KO `71df20420323fcf173bea21503f6f3b1870ebf8e6119616f8d5b646fe955252f`, JA `f8d14f415799927052341aa6c33c53f0f64bac43e5eddca35704863c3858ea7b`, EN `117bf5af5a3e000d30c54f6fd5fdc08da6bbdfd780a6aeaedacdd3ec5a80675c`.
- 로컬 정확 실행물: 위 빌드의 `astro preview` (`127.0.0.1:4327`), 별도 임시 프로필의 headless Chrome. 회사 로그인 Chrome 세션은 사용하지 않았다.

## 공개 사실 근거와 수정

| 결함 | 기존 공개 화면 | 이번 후보 | 근거 |
|---|---|---|---|
| 이름·버전 | 세 언어 모두 PiPi Word Voyage 계열, v1.0.3 | KO `낱말항해: 한글 단어 퍼즐`, JA `ハングル航海：韓国語の単語パズル`, EN `Hangul Voyage: Korean Puzzle`; 양 스토어 v1.0.7 (2026-09-23) | 2026-09-24 04:40 KST Apple Lookup KR/JP/US 캐시 무효화 조회 + Google Play 공개 페이지. 상세 URL 아래. |
| 사전 검증 | 모든 단어의 표준국어대사전 검증 단정 | 실제 기능인 한글 낱말 퍼즐·보너스 낱말로 교체 | 앱 `docs/release/_app-facts.md`; 사전 전체 검증 근거 없음. |
| 항해일지 | 찾은 모든 단어 영구 보관 단정 | **새로 찾은 보너스 낱말** 도감으로 한정 | 같은 앱 SSOT. |
| 통신 | 광고용으로만 통신 단정 | 광고와 앱 개선용 사용 통계 가능성 기재 | 같은 앱 SSOT의 AdMob·Firebase Analytics. |
| 화면 | 구형 제목이 보이는 `home.webp`, “모든 낱말 영구 저장” 오버레이가 있는 `logbook.webp` 포함 | 두 장은 **파일 삭제 없이 캐러셀에서 비노출**, 사실과 일치하는 `game/voyage/daily` 3장만 노출 | 3언어 원본 이미지 시각 확인, 렌더 결과·OG·JSON-LD 참조 확인. 새로운 실물 캡처가 생기면 재평가. |

Apple 공식 조회는 `https://itunes.apple.com/lookup?id=6788949612&country=kr&cb=1790192411` (`country=jp/us`도 동일 `cb`, `Cache-Control: no-cache`)로 3국가 모두 1.0.7 및 릴리스 시각 `2026-09-23T18:34:22Z`를 확인했다. **캐시버스터가 없는 CDN 응답은 한때 1.0.6으로 낡아 있었으므로 단일 무효화 없는 조회를 증거로 사용하지 않는다.** Google Play 공개 URL `https://play.google.com/store/apps/details?id=com.pifl.pipi.wordvoyage&hl=ko&gl=US&cb=1790192411` (`hl=ja/en` 동일 방식)에서 제목·버전·업데이트를 대조했다. 이 값은 조회 시각의 공개 표시값이며 배포 뒤 재조회 대상이다.

## 디자인·문장·기능 게이트

- **정보·시각: PASS (후보)**. 세 언어 375px 전후 이미지에서 앱 제목→핵심 가치→스토어 행동→실측 버전 순서가 유지된다. 오래된 제목을 담은 첫 카드와 허위 도감 카드가 사라졌고, 첫 스크린샷은 퍼즐 실제 화면이다. 카드 수가 5→3이 되어도 320/375/768/1280/1920에서 빈 슬롯 없이 스크롤된다. KO/JA/EN 320px 200% 상단·푸터 및 KO/JA/EN 375px 본문·CTA를 원본 스크린샷으로 별도 확인했다. 독립 검토자가 KO375/JA320/EN375 다크 상단뿐 아니라 KO 전후 본문과 EN 전후 캐러셀을 재확인했다. 새 첫 카드가 어둡지만 **실제 게임 화면**이어서 구형 마케팅 홈보다 사실 정합성을 우선했다.
- **문장·반응형: PASS (후보)**. `browser-matrix.json` 27셀 = KO/JA/EN × (light 320·375·768·1280·1920, light 320·375의 200% 텍스트, dark 375·1280). 전 셀 HTTP 200, 문서 수평 overflow 0, 깨진 이미지 0, 필수 이미지 3장, 스토어 링크 4개, JS 오류 0. 마지막 점검에서 320px 200% JA 푸터의 min-content 클리핑을 발견해 그리드 트랙을 `minmax(0,1fr)`로 고친 뒤 **정확한 새 빌드에서 전 27셀을 다시 촬영·검사**했고 푸터 클리핑 0. 정상 하이픈 영어 `cross-platform`과 `support@pifl-labs.com`처럼 320px 200%에서도 원문 문자열을 보존한 긴 토큰은 의미 절단이 아닌 정당한 줄넘김이다. 실제 텍스트 검출기는 unsupported 항목이 있어 자체적으로 `UNVERIFIED`이며 이를 디자인 PASS로 대신하지 않았다.
- **기능·접근성: PASS (후보)**. `interactions.json`: 세 언어 375px에서 캐러셀 `scrollLeft 4→617`, Apple/Play 배지 각각 실제 popup 열림 및 올바른 상품 URL·제목. 각 페이지 배지 4개(상·하 CTA). `controls.json`: KO320에서 다크 버튼 선택 시 `data-theme=dark`, `aria-pressed=true`; 글자 크기 xlarge 선택 시 `data-type-scale=xlarge`, `aria-pressed=true`, scrollWidth 320; JA 언어 전환 시 현재 앱 경로 유지. 장식이 버튼을 가리거나 버튼 안 텍스트가 잘리지 않는지 전후 원본 화면 확인.
- **실행물 일치: PASS (후보)**. 스크린샷/JSON은 위 해시와 동일한 마지막 빌드에서 다시 생성했다. 앞선 후보의 이미지가 아닌 `final5`를 사용했다. 운영 반영은 아래 **배포 후 재조회** 전까지 미완료로 남긴다.

### 시각 증거

- 제목·기능·CTA 전후: [KO](ko-before-after.png) · [JA](ja-before-after.png) · [EN](en-before-after.png)
- 구형 첫 카드→실제 퍼즐 카드: [KO](ko-carousel-before-after.png) · [JA](ja-carousel-before-after.png) · [EN](en-carousel-before-after.png)
- 수치 원본: [27셀 매트릭스](browser-matrix.json) · [캐러셀/스토어 실제 이동](interactions.json) · [테마/글자/언어 실제 조작](controls.json).
- 비교의 BEFORE는 2026-09-24 공개 사이트 375px 라이트 실물. AFTER는 동일 너비·테마의 최종 후보. 200% 확대 스크린샷은 로컬 `final5` 원본에 보관. 공개 사이트의 새로운 AFTER라고 주장하지 않는다.

## 재현 및 결과

- `npm test`: **135/135 PASS**. Word Voyage 이름·버전·허위 문구·비노출 이미지 회귀 테스트 포함.
- `npm run build`: **133 pages PASS**.
- `npm run test:built`: **PASS**, 3개 언어 스토어 링크/랜딩 검사 포함.
- `git diff --check`: **PASS**.
- 선택적 `npm run check`는 현재 `@astrojs/check`가 설치되지 않아 설치 확인 프롬프트가 뜬다. 새 의존성을 설치하지 않았으며 위 빌드/테스트 결과와 혼동하지 않는다.

## Verify Result — PASS (이 웹 변경의 로컬 릴리스 후보)

| 요구사항 | 확인 | 판정 |
|---|---|---|
| 양 스토어 공개 제목/버전 정합 | 세 로케일 공식 조회 + `apps.ts`/빌드 HTML | PASS |
| 허위 기능 주장 제거 | 앱 SSOT + 정적 회귀 + 3언어 화면 | PASS |
| 오래된 화면 비노출 | 캐러셀 3장·OG/game·JSON-LD/icon, 실제 3언어 화면 | PASS |
| 시각/반응형/동작 | 27셀 + 전후 캡처 + 기능 조작 | PASS |
| 홈페이지 더티 변경 보존 | 별도 worktree에서만 편집, 기존 checkout 무변경 | PASS |

**미포함·후속:** 앱 자체 새 캡처, 앱·스토어 설명 문구, 다른 앱 페이지. 이 문서가 말하는 PASS는 **이 랜딩 변경의 로컬 후보**에 한정한다. 실제 운영 PASS는 PR 병합·Cloudflare 배포 후 `https://pifl-labs.com/{ko,ja,en}/apps/pipi-word-voyage/`를 캐시 무효화하여 제목·v1.0.7·3장·허위 문구 없음·스토어 링크를 재조회하고 그 결과를 별도로 기록해야 한다.
