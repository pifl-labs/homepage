# 홈페이지 앱·기록관 갱신 / 모바일 크루 QA

2026-11-17 KST · **전체 판정 REVISE / 운영 배포 HOLD**

## 화면 목적과 변경

- 홈: 앱을 찾고 스토어로 이동하는 것이 우선. 크루는 브랜드 소개이므로 12개의 큰 포스터처럼 주 행동을 밀어내지 않는다.
- 기록관: 최신 공개 확인 기록을 먼저 읽고, 필요하면 앱별 변화·출처·과거 이미지를 펼친다.
- 기존 캐릭터·테마·색 토큰을 유지했다. 역할명은 그림 아래 정상 문서 흐름으로 배치하고, 실제 동작이 없는 캐릭터에 대한 탭 유도 문구는 제거했다.
- 일반 모바일은 크루 2열. 글자 200% 확대에서는 역할명을 자르지 않도록 열 수를 줄인다. 확대 설정을 되돌리거나 글자를 축소하지 않는다.

## 정확 실행물

| 항목 | 값 |
|---|---|
| 기준 커밋 | `32c8d1dd2374f2b739bf601cbb6ef3b084f5b463` |
| 작업 브랜치 | `feat/homepage-refresh-20261117` (미커밋 변경 포함) |
| runtime source SHA-256 | `d6b7b55f8dbb856d41037ccfc28f95c92d51f2a8ad8c903c8ebb10986560cfa1` |
| dist SHA-256 | `a5bce2ce32ec8036927cdbaac5e9ecfd7431b08b5bff16b6849cae4ab13193d2` |
| 실행 주소 | `http://127.0.0.1:4327` / Astro preview |
| 브라우저 | 설치된 Google Chrome, headless Playwright, reduced-motion |
| 글자 확대 | 루트 font-size 100% / 200%; 브라우저 전체 페이지 zoom과 구분 |

파일별 해시와 집계 방식은 [artifact-manifest.json](artifact-manifest.json). 마지막 빌드 뒤 runtime 소스는 변경하지 않았다. 문서/증거 추가는 빌드 입력 변경이 아니다.

## Matrix와 관측

| 범위 | 언어 | viewport 폭 | 테마 | 글자 크기 | 셀 | 결과 |
|---|---|---|---|---|---:|---|
| 홈 + 기록관 | KO / JA / EN | 320 / 375 / 768 / 1280 / 1920 | light / dark | 100% / 200% | 120 | 수평 넘침 0, 감지된 깨진 이미지 0, 크루 라벨 카드 이탈 0, pageerror 0 |
| 버전이 바뀐 7개 앱 상세 | KO / JA / EN | 동일 | 동일 | 동일 | 420 | 수평 넘침 0, 버전 영역 잘림 0 |

실제 viewport 높이는 모두 900px. [matrix.json](matrix.json), [app-matrix.json](app-matrix.json)에 셀별 결과를 보존한다. 수치 통과를 전체 화면 디자인 PASS로 간주하지 않는다. 앱 상세 420셀은 변경된 버전 표시 영역과 페이지 폭의 검증이며, 앱 상세 본문 전체에 대한 시각 승인이나 네이티브 앱 검증이 아니다.

### 사용자 지적: 모바일 크루 스크롤

375px / KO / light / 100%, 같은 조건의 전후 비교:

| 항목 | 이전 | 수정 후 |
|---|---:|---:|
| 크루 열 수 | 1 | 2 |
| 크루 전체 구간 높이 | 4,995px | 1,703px (**65.9% 감소**) |
| 새 카드 그리드 높이 | 4,312px | 1,270.25px |

[이전](evidence/crew-before-375.png) · [수정 후 light](evidence/ko-home-375-light-1-crew.png) · [수정 후 dark](evidence/ko-home-375-dark-1-crew.png) · [측정값](comparison.json)

이전 스크린샷의 마지막 lazy 이미지 한 장은 디코딩되지 않았다. 높이와 열 수 비교에는 실제 DOM 측정값을 사용했고, 그 빈 그림을 이미지 제거/개선 근거로 사용하지 않았다. 수정 후에는 크루 12개 이미지를 디코딩한 뒤 촬영했다.

### 직접 검토한 대표 화면

- KO 375px light/dark: 2열과 12개 역할명, 카드 간격, 이미지 비율 확인.
- EN 1280px / 200%: 글자 확대에 따라 3열로 재배치되어 긴 역할명 단어 절단 해소.
- JA 768px / 200%: 그림과 라벨 중첩 없이 열 수 적응.
- KO/JA/EN 좁은 기록관: 관측일, 플랫폼, 버전, 스토어 업데이트 날짜, 출처 순서 구분.
- Hello EN 320px / 200%: iOS 1.1.1과 Android 1.1.0을 독립 표시.
- KO/JA 홈 안내문 320px / 200%: **아래 미해결 결함 확인**.

### 실제 기능 흐름

KO/JA/EN 모두 실제 클릭·키보드와 후속 DOM 상태를 확인했다:

- 앱별 변화 목차 기본 접힘 → Enter로 열림/닫힘.
- 앱 다중 선택, 빈 결과, 필터 초기화, 브라우저 뒤로가기.
- 언어 전환 시 선택 필터 유지.
- 기록 출처의 실제 스토어 URL, Dialogos 최신 제출 이미지 경로.
- 테마 버튼 전후 상태, 홈 앱 목록 펼치기 → Hello 상세 이동.

`app-matrix.json`의 `flow`에 각 언어별 true/false 결과를 보존했다. 외부 스토어 구매/설치나 로그인 작업은 하지 않았다.

## 수정 루프와 남은 결함

1. 모바일 2열·간격·문구·기록관 구조와 공개 데이터 반영. 확대 글자에서 역할명 분리 발견.
2. 이미지/라벨을 정상 흐름으로 정리하고 글자 기준 열 폭 적용. 큰 화면 확대 상태의 열 수 재조정 필요 확인.
3. 모든 폭에서 글자 기준 auto-fit 적용, 확대된 스토어 버튼의 단어 단위 줄바꿈 보강. 최종 전체 matrix 재실행.

이전 두 번의 matrix도 `round-1-matrix.json`, `round-2-matrix.json`에 남겼다. 최종 기록으로 실패 이력을 덮지 않았다.

| 미해결 항목 | 재현 | 실물 증거 | 판정 |
|---|---|---|---|
| KO 앱 목록의 제출 화면 안내문이 어절 중간에서 분리 | 홈 320px, light, 200%; `있습 / 니다`, `버 / 전과`, `확인하 / 세요` | [KO 안내문](evidence/ko-existing-caption-200.png) | REVISE |
| JA 같은 안내문의 장음부호가 행두로 밀림 | 홈 320px, light, 200%; `バ / ージョン` | [JA 안내문](evidence/ja-existing-caption-200.png) | REVISE |

이 문구와 관련 기존 규칙은 이번 변경 대상이 아니었지만, 변경된 홈 경로의 필수 확대 검수에서 발견했으므로 예외 처리해 전체 PASS로 바꾸지 않는다. 공통 가이드의 최대 3개 수정 루프에 도달해 추가 UI 수정을 멈추고 배포를 보류한다. 다음 수정에서는 KO 안내문의 의미 단위 줄바꿈과 JA 짧은 구절의 안전한 행 분리를 먼저 해결한 뒤 같은 matrix를 다시 실행한다.

전수 텍스트 진단의 `inventory`, `coverage`, `findings`, `unsupported`, `status`, `visualApproval`은 `diagnostics/*.json.gz`에 원형 그대로 보존했다. 압축은 저장 크기만 줄인 것이며 UNVERIFIED를 PASS로 바꾸지 않았다. JA footer 진단 후보도 있으나 별도 캡처가 빈 이미지여서 시각 확인 증거로 채택하지 않았다. 이 후보는 **UNVERIFIED**로 남긴다.

## 독립 게이트

| 게이트 | 판정 | 범위 |
|---|---|---|
| 요청한 크루 정보·시각 개선 | PASS | 직접 검토한 대표 화면과 matrix 측정 범위 |
| 전체 변경 경로 문장·반응형 | **REVISE** | 위 KO/JA 200% 안내문 결함 |
| 기능 | PASS | 명시된 3개 언어의 실제 흐름 |
| 접근성 전체 | UNVERIFIED | 키보드 주요 흐름 확인; 전체 스크린리더/대비 전수 감사 아님 |
| 로컬 실행물 일치 | PASS | source/dist/증거 해시와 마지막 빌드 일치 |
| 운영 실행물 | UNVERIFIED | 미배포, 운영 readback 없음 |
| **UI Release** | **HOLD** | 필수 텍스트 결함 잔존 |

## 재현

기존 설치 런타임만 사용한다. 패키지 신규 설치는 필요 시 별도 결정한다.

```sh
npm run build
npm test
npm run test:built
npm run preview -- --host 127.0.0.1 --port 4327
# 다른 터미널, 설치된 Playwright ESM 경로를 지정:
export PLAYWRIGHT_MODULE=/path/to/existing/playwright/index.mjs
export TEXT_GEOMETRY_MODULE=/Users/pirate/pifl-labs/tools/web_text_geometry.mjs
export QA_OUTPUT=/tmp/pifl-home-qa-new
node docs/verification/2026-11-17-homepage-refresh/qa-homepage.mjs
node docs/verification/2026-11-17-homepage-refresh/qa-apps.mjs
```

실제 iOS/Android 기기, Safari/Firefox, 200% 브라우저 전체 zoom, 배포 후 공개 URL은 이번에 검증하지 않았다. 다른 앱/기기 PASS로 대체하지 않는다.
