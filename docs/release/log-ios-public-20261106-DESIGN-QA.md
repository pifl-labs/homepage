# Log iOS 공개 버전 진입 수정 — DESIGN-QA / VERIFY

대상: 2026-11-06 공개 KR/JP/US iOS 버전과 회사 소개의 불일치 수정. 앱 기능 추가나 전체 앱 QA가 아니다.

## 사실·범위
- 독립된 세 시장의 Apple 공개 응답: 동일 앱 6770272665 / com.pifl.pipi.log, iOS 1.0.14. UTC 업데이트 2026-11-04T17:21:03Z를 기존 날짜 규칙대로 표시한다.
- Android 1.0.13은 2026-11-02의 마지막 확인 기록이다. Android의 오늘 버전·양 OS 동시 업데이트·실행 검증으로 확대하지 않는다.
- 기존 제출 화면 iOS 1.0.13 (27), 최신 실행 화면 미검증 안내, 과거 관측 문서는 그대로다.
- 홈의 서로 다른 버전/단일 플랫폼 행은 장식 아이콘만으로 구분하지 않고 iOS/Android 이름을 표시한다. 변경된 작은 글자의 기존 전경색 토큰을 사용한다.

## 실행·시각 검증
- Node 22.23.3, npm run build: 181페이지 생성 / HTML 파일 182개.
- npm test: **663 pass / 0 fail / 0 skip**.
- npm run test:built: 기존 validator 3개 PASS, 48개 로케일 홈·앱 경로 / 207개 스토어 링크.
- Log 상세 KO/JA/EN × 양테마 × 기본 320/375/768/1280/1920 + 320/1280 텍스트 200%: **42개 실제 브라우저 최종 화면**.
- 홈 변경 라벨 KO/JA/EN × 양테마 × 320 기본/200%: **12개 실제 최종 화면**. 좁은 폭이 최장 버전 두 줄의 최악 조건이고 기존 flex-wrap/폭/글자 크기는 바꾸지 않아 이 범위를 검증했다. 홈 전체 디자인/다른 링크 대비 PASS는 아니다.
- 200%는 로컬 검증 응답의 실제 root 32px 렌더다. 단순 '아주 크게' 버튼이나 전체 브라우저 줌으로 바꾸어 부르지 않았다.
- 실제 화면을 각각 보며 정보 위계·플랫폼 구분·의미 단위 버전 줄바꿈·여백·클리핑을 확인했다. 수치 PASS만으로 시각 PASS를 정하지 않았다.
- 기능: 홈 요약 키보드 펼침/닫힘, 홈 Log 행 Enter → 상세, 뒤로 → 홈, 두 스토어 버튼 Enter → 정확 공개 앱/개발사 확인. 설치/로그인/설정 변경/결제 없음.
- 실제 기본/확대 글자 설정 동작을 확인하고 기본으로 복원했다.
- 시각 수정 3회: Log 라이트 작은 버전 글자 대비, 홈 플랫폼 이름, 그 이름을 바꾼 모든 행의 전경색. 잘못된 확대 초기 응답과 같은 URL의 이전 DOM 캡처는 실패로 보존하고 최종 54개에 넣지 않았다.

## 동등성·리뷰
- 변경 HTML은 세 홈 + 세 Log 상세뿐. 나머지 176개 HTML, 다른 42개 앱 랜딩은 바이트 동일.
- 홈 최종 보완 뒤 세 Log 상세 HTML 해시는 앞서 42개 화면을 검수한 실행물과 완전히 동일하다.
- iOS 날짜 외 다른 제품 사실/광고/비용/프라이버시/스토어 경로·기존 제출 자산/SDK/의존성/원격 CI/보호 규칙은 불변.
- 구현자 자체 diff/실물 리뷰이며 독립 리뷰 0건. 초기 회귀 테스트 실패와 validator의 옛 날짜 단정 실패를 보존하고 개별 관측 근거로 보완했다. skip/기준 삭제 없음.

## 판정
- Visual / Text-responsive / Functional / Artifact match: **PASS — 위 변경 범위 한정**.
- Local pre-merge verify: **PASS**. 정상 원격 검사·병합·운영 공개 확인은 별도 단계이며 이 문서만으로 배포 완료를 주장하지 않는다.
- 미검증: 앱 실행·인쇄·다른 브라우저·중간 폭 200%·전체 포트폴리오 대비/품질·실제 설치/매출 효과.

원본 54개 화면·측정·초기 실패·실행 로그는 회사 로컬 성장 증거 묶음 `2026-11-06-log-ios-release-entry`에 보존한다. 민감한 원문·메일·인증 자료는 이 저장소에 추가하지 않는다.

## 검수한 생산 소스 SHA-256
- `scripts/check-store-transition.mjs`: `74e053866b48f4f8127b0b2a004fcf68343ce4333cd61021e4a13afc9b9f94aa`
- `src/components/AppLanding.astro`: `55f034e9e3e7f6bf7a47d4ccc89a66842dba9d052ce022d629df7ae8729f72d1`
- `src/components/FleetLog.astro`: `e1ae64bf5cf508f2f10bb14dbd2e60007957b0a2dda1175610bf872d7f18a976`
- `src/data/apps.ts`: `f2c148ef838f6c7faf6c0f587863794b9e56f5e9f09f6da23d4206acd0b7fdbd`
- `tests/focus-public-release.test.mjs`: `20239220d54937141552a28ef6d50fa8ddb18adcb407ccbd3163e10501a7adee`
- `tests/log-context-copy.test.mjs`: `513876e5626264355905396f0d6de19cbfe726a2bc100746eb160a3a19f5304d`
- `tests/portfolio-public-release-facts.test.mjs`: `b92723d67a3596e9ca5d4c8673ae100531e5d8faed507877e7b37b92af66b7fb`
- `tests/store-sync-20261102.test.mjs`: `154dbc4c78d34f390bf9b4cd0411301f0ecce91ae4aad39d953918ca48cbe2b2`
- `docs/release/log-ios-public-20261106.json`: `325385bd4c69a9a34256354ef9e76e11a328e4658452d7bc88948c1551cf4c40`
- `public/styles-log-release-version.css`: `c7dc11a0479f7d8acd19b92b6844ad5a3240223d574cacb49c52ee1d60908039`
- `tests/log-ios-release-20261106.test.mjs`: `9ebf26f547a9e4a557a6e408be3de04429dbbd7d6b5f6b0687c680abf096db3d`
