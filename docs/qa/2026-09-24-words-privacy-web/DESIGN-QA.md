# PiPi Words 개인정보처리방침 — 공개 웹 정정·디자인 QA

날짜: 2026-09-24 · 범위: `/ko/apps/pipi-words/privacy/`, `/ja/apps/pipi-words/privacy/`, `/en/apps/pipi-words/privacy/`, `/apps/pipi-words/privacy/` 네 경로만.

## 역할과 정보 위계

이 화면은 이용자가 앱의 광고 SDK 및 결제 정보 처리를 이해하고 문의처를 찾는 법적 안내 페이지다. 홈 복귀 → 제목·시행/수정일 → 처리 항목 → 광고·이전 설명 → 문의처 순서를 유지했다. 다른 앱·스토어·광고 설정·디자인 토큰은 변경하지 않았다.

## 사실 근거와 정정

- 수정 전 영문 공개 페이지의 “The advertising identifier is not used to track you across apps or websites”는 **확인할 수 없는 단정**이다. Words 후보 iOS `1.0.12+29`의 Google Mobile Ads SDK `13.2.0` 내 Privacy Manifest는 `Device ID`를 linked/tracking으로 표기한다. 앱이 `nonPersonalizedAds:true`를 요청하고 ATT 창을 띄우지 않는 사실만으로 SDK의 모든 데이터 처리가 앱·사이트 간 추적과 무관하다고 증명할 수 없다.
- 앱에 추적이 실제 발생한다고 단정하지도 않았다. 세 언어와 기본 영문 경로에 **처리 가능성**, 비맞춤 광고 요청, ATT 권한 미요청과 IDFA 조건, 광고 외 식별자·대략 위치·광고 이용·진단 항목을 구분해 기술했다. 원래 시행일 `2026-04-17`은 유지하고 수정일 `2026-09-24`를 추가했다.
- [Apple User Privacy and Data Use](https://developer.apple.com/app-store/user-privacy-and-data-use/), [Google iOS SDK data disclosure](https://developers.google.com/admob/ios/privacy/data-disclosure), [Google Android SDK data disclosure](https://developers.google.com/admob/android/privacy/play-data-disclosure), [Google ad serving modes](https://developers.google.com/admob/flutter/privacy/ad-serving-modes), [Google Flutter IDFA](https://developers.google.com/admob/flutter/privacy/idfa)를 대조했다. 앱 번들·Play Data Safety·App Store Connect의 **별도** 공개 사항을 이 웹 문구 변경만으로 완료 처리하지 않는다.

## 실화면 Before → After

동일 조건인 영문 320×812px·dark·기본 16px을 Codex 브라우저에서 눈으로 비교했다. 이미지 캡처는 이 작업의 브라우저 실행 기록에 있으며 저장소에 별도 PNG로 보관하지 않았다.

| 항목 | 배포 전 공개 화면 | 수정한 정적 빌드 화면 |
|---|---|---|
| 광고·추적 설명 | 무근거 `not used to track` 단정 | 비맞춤 요청과 SDK 데이터/IDFA 조건을 구분. 무근거 단정 없음 |
| 모바일 페이지 폭 | 문서 `scrollWidth=407`, viewport `320`; 긴 표 때문에 전체 가로 넘침 | 문서 `scrollWidth=320`, viewport `320`; 표 3개가 이름 붙은 독립 가로 스크롤 영역 |
| 날짜 | 영문 시행일 1개만 표시 | 시행일·최근 수정일을 구분하고 ISO 날짜를 끊김 없이 표시 |
| 320px 머리말 | 영문 제목은 정상 줄바꿈 | 유지. 한국어 `개인정보/처리방침`, 일본어 `プライバシー/ポリシー` 의미 경계 보완 |

## 정확한 빌드와 실물 matrix

- Base: `origin/main` `ea002de`. 최종 `public/styles-words-policy.css` SHA-256 `832f7e25f493b353d0251bc2a1bbe6b1c83374078609fd47ae38a980128206b8`; 빌드된 CSS SHA가 동일하며 네 HTML 모두 `?v=832f7e25f493`을 참조한다.
- 정적 HTML SHA-256: KO `bf5f43d966a83ef7bc05e05af495ee5c028eacbeff1ea8608e5bde86e2e40c00`, JA `f52a10403c18c2306c811adfe052890fccdfada73af607e624afe03cb44a31e7`, EN `e02b7368ef0effb0dde6d9d71f4921552dc081c96b79435bf46c94a977fbb8a8`, 기본 EN `a9153e81139edd9e363dfc4d657c16f2f58147b9285e0dc6468c3fb5ff5a5126`.
- **최종 빌드**를 로컬 정적 서버에 제공하고 4경로 × 320/375/768/1280px × `light+normal(16px)`/`dark+xlarge(20.8px)` = **32셀**을 브라우저에서 확인했다. 모든 셀에서 `documentElement.scrollWidth === innerWidth`, 표 3개 존재, 시행일·수정일 존재, 폐기한 단정 문구 부재, 최신 CSS 키 적용. 좁은 KO·JA·EN 첫 화면과 영문 desktop 화면도 스크린샷으로 시각 판독했다.
- **200% 텍스트 보조 검증:** 테스트 중에만 `html[data-type-scale="xlarge"] { --type-scale: 2; }`를 적용해 기본 16px → 계산된 루트 32px로 확대한 뒤 4경로 × 320/375px × light/dark **16셀**을 실브라우저에서 검증했다. 16셀 모두 문서 가로 넘침 0, 제목·날짜 판독 가능, 3개 표의 수평 스크롤 유지. KO 320px 제목이 처음에는 348px로 넘쳐 의미 경계 `<wbr>`를 추가한 후 다시 320px임을 확인했다. **임시 2× CSS는 최종 파일에서 제거했다.** 이는 200% 텍스트 크기의 렌더링 검사이지 Chrome 브라우저 zoom 200% 조작과 같다고 주장하지 않는다. 이 환경에서 실제 Chrome zoom은 미검증이다.
- 키보드 검증: 각 경로 320px 첫 표는 `role=region`, 로케일별 접근성 이름, `tabindex=0`을 제공하고 `ArrowRight` 뒤 실제 `scrollLeft`가 KO/JA 각각 40px, EN/기본 각각 38.5px 증가했다. 홈 복귀 링크도 각 로케일에서 동작했다(기본 영문 별칭의 `/` 링크는 사이트 locale redirect로 `/ko/` 도착).

## 검증 명령과 판정

| 게이트 | 근거 | 결과 |
|---|---|---|
| 정보·시각 품질 | 320px 영문 dark 전/후, KO·JA 좁은 화면, 영문 desktop 육안 비교 | PASS |
| 문장·반응형 | 정적 빌드 32셀 + 테스트 전용 200% 텍스트 16셀. 실제 Chrome zoom은 미확인으로 분리 | PASS (검증한 범위) |
| 기능·접근성 | 4경로 표 키보드 이동 및 홈 복귀, 테마·글자 설정 실제 동작 | PASS |
| 실행물 일치 | CSS/HTML SHA, CSS 키, 정적 빌드 URL 재검증 | PASS |
| 소스 테스트 | `npm test`: 139/139 PASS | PASS |
| 빌드 | `npm run build`: 133 pages, exit 0; `npm run test:built`: 3검사 PASS | PASS |
| 코드 차이 | `git diff --check`: exit 0; 4 route + 전용 CSS + 회귀 테스트 + 이 문서만 의도적 변경 | PASS |

**웹 변경 릴리스 판정: PASS**, 단 운영 배포 완료가 아니다. PR/CI 후 배포된 **공개 네 경로**를 다시 조회해야 완료다. Words iOS/Android 개인정보·스토어 신고 게이트는 독립적으로 남는다.
