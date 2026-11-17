# Design QA — PASS (검증 범위 내 배포 전 게이트)

2026-11-17 KST. 사용자의 **“운영 홈페이지까지 반영”** 요청 후 수행한 후속 보완/검증이다. 상위 폴더의 최초 REVISE/HOLD 보고서·실패 화면은 역사적 증거로 그대로 보존한다. 사용자 승인으로 결함을 예외 처리한 것이 아니라, 실제 수정한 새 빌드를 다시 검증했다.

## 정확 실행물

- 기준 커밋: `32c8d1dd2374f2b739bf601cbb6ef3b084f5b463`
- 최종 runtime source SHA-256: `6bfa356630321cf0421e2fc8a9376e09377ad7a665dd82c06fe70d3dc20ce95b`
- 최종 dist SHA-256: `d9a0ec6d2956e2871bd61bbb45af1c62b27ae9d7ae2c244bba573129e6777e8b`
- 대상: `http://127.0.0.1:4327` / Astro preview / 설치된 Google Chrome headless.
- 상세 파일 해시: [artifact-manifest.json](artifact-manifest.json). 마지막 빌드 후 runtime 소스 변경 없음.

## 보완 회차

1. KO 안내문·스토어 표시명·이전 이름·footer·마스코트 주석에 `keep-all` 적용. JA 안내문/footer에는 `line-break: strict`. 필수 문구와 글자 크기는 유지.
2. 기록관의 이미지 비교 열을 글자 크기에 적응하도록 변경. 좁은 필터는 장식 아이콘 대신 **전체 이름과 선택 체크**를 우선. 2열 밀도와 `aria-pressed` 유지.
3. 기록관 이미지 카드의 좌우 여백을 반응형으로 보완. 320px/200%에서도 `KanaSprout:`의 콜론을 다음 줄로 밀지 않음.

후속 보완은 3회에서 종료했다. 각 회차의 matrix는 `remediation-1-*`, `remediation-2-*`와 최종 matrix로 구분한다. 처음 보류했던 결함을 숨기거나 판정 기준을 낮추지 않았다.

## Matrix

| 범위 | 조합 | 결과 |
|---|---|---|
| 홈·기록관 | KO/JA/EN × 320·375·768·1280·1920px × light/dark × 100%/200% = **120셀** | 수평 넘침 0, 감지된 깨진 이미지 0, 크루 라벨 카드 이탈 0, pageerror 0 |
| 변경된 7개 앱 상세 버전 영역 | 같은 조합 = **420셀** | 수평 넘침 0, 버전 영역 잘림 0 |
| 실제 기능 | 3개 언어 | 앱 다중 선택·빈 결과·초기화·뒤로가기·언어 전환·테마·키보드 disclosure·앱 상세 이동 PASS |
| 발견 결함 회귀 | 3개 언어 × 320px × 100%/200%, Hello/Words 비교 = **12개 기록관 상태**, **6개 홈 상태** | 안내문 단어 경계, JA 금칙, 선택 체크, 영문 비교 설명 PASS |

viewport 높이는 900px. 200%는 루트 font-size 확대이며 전체 페이지 zoom과 구분한다. [matrix.json](matrix.json), [app-matrix.json](app-matrix.json), [regression-results.json](regression-results.json), `logs/`에 원 결과를 보존했다.

홈·기록관은 경로별 matrix를 검증했다. 앱 상세는 변경된 버전 표시 영역과 공통 footer 규칙의 회귀 검증이며 본문 전체 재디자인 승인이나 네이티브 앱 QA가 아니다. 정적 footer 컴포넌트와 CSS는 앱들에 공통이며 홈페이지·기록관의 같은 footer에서 실제 한·일 줄바꿈을 확인했다.

## 실물 시각 판정

- [KO 안내문 200%](evidence/ko-320-2-app-media-footnote.png): `있습니다`, `버전과`, `확인하세요` 어절 분리 해소. 글자 축소/생략 없음.
- [JA 안내문 200%](evidence/ja-320-2-app-media-footnote.png), [JA footer](evidence/ja-320-2-footer-tagline.png): `ー` 행두 해소.
- [EN 좁은 필터](evidence/en-320-1-pipi-hello-filters.png): `KanaSprout` 전체 표시. 선택 체크와 테두리 구분, 2열 유지.
- [EN 비교 자료 200%](evidence/en-320-2-pipi-hello-media.png): 제목/아이콘/과거·현재 자료의 위계와 단어 단위 설명. 긴 요소 캡처의 고정 nav 중첩은 별도 [이전 설명](evidence/en-caption-1.png), [현재 설명](evidence/en-caption-2.png), [관측 설명](evidence/en-caption-0.png) 원본 요소 캡처로 재확인했다.
- [KO 크루 light](evidence/ko-home-375-light-1-crew.png), [dark](evidence/ko-home-375-dark-1-crew.png): 12개 역할 유지, 모바일 2열, 일반 글자에서 4,995→1,703px로 **65.9% 단축**.
- [EN 크루 200%](evidence/en-home-1280-light-2-crew.png), [JA 크루 200%](evidence/ja-home-768-light-2-crew.png): 확대 시 열 수 적응, 라벨과 그림 중첩 없음.
- 기록관의 최신 관측/스토어 업데이트 날짜/출처 구분, 접힌 앱별 변화 목차와 실제 키보드 동작 확인.
- Hello의 iOS 1.1.1 / Android 1.1.0 독립 표시 확인.

원 텍스트 진단의 `UNVERIFIED`, `unsupported`, `visualApproval:false`는 `diagnostics/*.json.gz`에 그대로 남겼다. 남은 후보는 중점(`·`)으로 구분된 열거, 정상 하이픈 줄바꿈, 이메일/코드 경로/날짜의 구분자 경계였다. 원문 줄 배열을 확인했으며 이들 전체를 일반 본문 검사에서 제외하지 않았다. 링크 이메일은 기존 `data-email-user/domain` 런타임 조립 대상과 표시 문자열이 일치한다. 도구의 0건을 시각 승인으로 대신하지 않았다.

## 독립 게이트

| 게이트 | 판정 | 근거/범위 |
|---|---|---|
| 정보·시각 | PASS | 위 대표 실물 직접 검토, 브랜드 자산/토큰 유지, 역할 위계와 간격 |
| 문장·반응형 | PASS | 필수 matrix, 발견 결함 원본 이미지 재검토, 확대 글자 손실 없음 |
| 기능·접근성 | PASS (작업 범위) | 실제 클릭·키보드·선택 상태·이름 확인; focus 규칙 유지, 역할 라벨 대비 개선 토큰 |
| 로컬 실행물 일치 | PASS | 마지막 build/source 파일 해시와 최종 QA 결과 |
| 운영 실행물 | PENDING | 배포 후 공개 URL 확인 전까지 운영 반영 완료를 주장하지 않음 |
| **배포 전 UI 게이트** | **PASS** | 알려진 필수 결함 해소; 공개 배포 확인은 별도 단계 |

미검증 범위: Safari/Firefox, 실제 모바일 OS 브라우저, 전체 페이지 zoom, 전체 WCAG/스크린리더 감사, 네이티브 iOS/Android 앱. 공통 footer의 미변경 legal 콘텐츠와 모든 앱 본문 전체를 재감사한 것은 아니다. 독립 시각 검토자는 없으며 구현자가 직접 원본을 검토했다.

## 실행기

상위 폴더 실행기에 있는 기존 측정/기능 로직으로 실행했고, 이 폴더에는 같은 로직에 최종 결과 assert를 추가한 재현 실행기를 보존했다. 실행 환경에 설치된 Playwright 경로와 공용 텍스트 진단 경로를 명시한다. 새 의존성은 설치하지 않았다.

```sh
npm run build && npm test && npm run test:built
npm run preview -- --host 127.0.0.1 --port 4327
# 별도 터미널:
export PLAYWRIGHT_MODULE=/path/to/existing/playwright/index.mjs
export TEXT_GEOMETRY_MODULE=/Users/pirate/pifl-labs/tools/web_text_geometry.mjs
export QA_OUTPUT=/tmp/pifl-qa-repeat
node docs/verification/2026-11-17-homepage-refresh/deployment-followup/qa-homepage.mjs
node docs/verification/2026-11-17-homepage-refresh/deployment-followup/qa-apps.mjs
node docs/verification/2026-11-17-homepage-refresh/deployment-followup/qa-regression.mjs
```
