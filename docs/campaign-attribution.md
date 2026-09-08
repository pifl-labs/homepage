# 콘텐츠 → 웹 → 스토어 캠페인 연결

로컬 검증: 2026-09-08 KST · **링크 구현과 실제 스토어 귀속은 별도로 검증한다.**

## 왜 이 작업인가

홈과 앱 랜딩에는 이미 스토어 직행 버튼이 있다. 하지만 일반 랜딩의 링크에는 캠페인 정보가 없었고, 홈페이지에 UTM을 붙여 방문해도 다음 앱 페이지로 전달되지 않았다. 콘텐츠 생산량을 더 늘리기 전에 이 단절을 보완한다. 별도 대시보드·유료 도구·분석 SDK는 추가하지 않는다.

## 구현 범위

- `AppCatalog`와 `AppLanding`의 실제 anchor에 빌드 시 웹사이트 기본 캠페인을 부여한다.
- 브라우저는 **URL에 명시된** 세 라벨만 읽고, 같은 사이트의 홈·앱·언어 전환 링크에 전달한다.
- Google Play: `utm_source`, `utm_medium`, `utm_campaign`을 최상위 query와 URL 인코딩된 `referrer`에 동일하게 넣는다. 원래 앱 ID·언어 등 스토어 옵션은 유지한다.
- Apple: `APPLE_PROVIDER_TOKEN`이 빈 값이면 원래 App Store 링크를 그대로 둔다. 기존 TikTok 코드의 `olympus providerId`는 ASC가 생성한 캠페인 링크의 `pt`와 같다는 증거가 없어 복사하지 않았다. 기존 `/go/tiktok`의 URL·캠페인명은 이번에 변경하지 않았다.
- 새 쿠키·저장소·사용자 ID·클릭 수집·외부 요청·클릭 가로채기 없음. CSP 완화 없음. 기존 사이트의 테마/언어 설정 코드는 별개로 유지한다.
- 법률·문의·외부 사이트·파일 링크로 UTM을 전파하지 않는다. 해당 경로로 이동하면 이 구현의 캠페인 전달은 종료된다.
- JS가 꺼지거나 로딩 전 클릭하면 **웹사이트 기본 캠페인**으로 연결된다. 소셜 캠페인까지 보존한다고 주장하지 않는다.

## URL 규약

`utm_source`와 `utm_campaign`을 함께 지정한다. `utm_medium` 생략 시 `referral`.

| 항목 | 허용값 |
|---|---|
| source | `pifl-labs`, `pipi-worlds`, `instagram`, `youtube`, `threads`, `tiktok`, `naver`, `medium`, `brunch` |
| medium | `website`, `social`, `video`, `referral`, `blog` |
| campaign | 1–30자, 소문자 영문·숫자로 시작, 나머지는 영문·숫자·`_`·`-` |

중복 query, 부분 지정, 공백·이메일·허용되지 않은 source/medium 등은 입력 전체를 무시하고 기존 기본 링크를 유지한다. 라벨에 개인정보를 넣지 않는다. 정규식은 개인정보 판별기가 아니다.

**캠페인 이름 자체에 채널·앱·언어를 포함한다.** 향후 Apple `ct`는 campaign 이름을 그대로 사용하므로, 다른 채널에 같은 campaign 이름을 재사용하면 합쳐진다. 소규모 유입을 hero/footer별로 쪼개지 않는다.

예시(게시되었다는 뜻이 아님):

```text
https://pifl-labs.com/ko/apps/pipi-focus/?utm_source=instagram&utm_medium=social&utm_campaign=ig_focus_ko_2609
https://pifl-labs.com/ja/apps/pipi-words/?utm_source=youtube&utm_medium=video&utm_campaign=yt_words_ja_2609
```

태그 없는 직접 방문은 `pifl-labs / website / website_ko`(또는 `website_ja`, `website_en`)로 묶인다. 원래 검색엔진이나 이전 방문 채널을 추정하지 않는다. 언어를 전환해도 처음 콘텐츠의 캠페인 이름을 유지한다.

## 확인 가능한 것과 아직 모르는 것

| 단계 | 현재 상태 |
|---|---|
| 링크 생성·내부 전달 | 단위 테스트와 실제 로컬 브라우저로 확인 |
| 프로덕션에 동일 코드가 배포됨 | 미확인·미배포 |
| 사이트 방문자 / 사이트 버튼 클릭 수 | 이 코드에서는 수집하지 않음 |
| Play에서 해당 UTM 행이 실제 집계됨 | 미확인. 배포 후 콘솔/리포트 readback 필요 |
| Apple provider token | 미설정. 계정에서 생성된 캠페인 링크로 검증 후 설정 |
| Apple 다운로드 귀속 | 비활성. 계정에서 생성된 링크의 pt 확인 후 활성화 가능 |
| 설치·잔존·매출 증가 | 아직 입증하지 못함 |

웹페이지의 `href` 검사만으로 실제 스토어 귀속 PASS를 주지 않는다. 행 누락·권한 부족·지연·개인정보 임계치도 **0건**으로 바꾸지 않는다.

### 스토어 지표의 의미

- Apple 공식 문서는 캠페인 이름 30자, 생성된 링크의 provider token 재사용, 24시간 내 첫 다운로드 귀속, 최소 데이터 임계치를 설명한다. 작은 집단의 상세 리포트는 가려지거나 합쳐질 수 있다. 실제 ASC 링크와 리포트가 기준이다. [Apple 캠페인 도움말](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links)
- Google Play는 2026년 7월부터 스토어 리스팅 보고서를 **설치·열기·사전등록 버튼 클릭과 CTR** 중심으로 변경했다고 안내한다. 이를 설치 완료로 쓰지 않는다. [현재 Play 리스팅 지표](https://support.google.com/googleplay/android-developer/answer/9859173?hl=en-EN)
- 기존 Cloud Storage 월별 CSV는 acquisitions 지표를 유지한다. CSV 출처의 기존 `Store listing acquisitions`와 새 콘솔 클릭 지표는 분리하고, 기간·시간대·dimension·분모를 함께 기록한다. 일별 고유 방문자 합을 기간 전체 고유 방문자라고 부르지 않는다. [Google 월별 내보내기](https://support.google.com/googleplay/android-developer/answer/6135870?hl=en)

## 캠페인 운영 시 검증

실제 CTA 반영 시점을 기록하고, 리포트에서 같은 campaign 이름과 기간을 조회한다. 링크 생성·웹사이트 방문·스토어 버튼 클릭·완료된 설치는 서로 다른 단계다. 기본값은 웹사이트 경유 출처를 나타내며 원래 검색엔진/광고 소스를 추정하지 않는다.

기록 권장 필드: `campaign, app, channel, placement, deployed_commit, cta_live_at, period, timezone, source_report, metric_definition, visitors, clicks, acquisitions, suppression_or_error`. 미확인 숫자는 null, 실제 0만 0. 개인 식별 정보는 URL과 리포트에 넣지 않는다.

## 로컬 검증 (2026-09-08)

```sh
npm test
npm run build
npm run test:built
node --check public/store-attribution.mjs
node --check public/store-links.js
git diff --check
```

- 단위/DOM 어댑터 테스트: 49개 PASS, skip 0.
- Astro: 131페이지 빌드 PASS.
- 빌드 HTML: 홈·앱 33페이지, 스토어 anchor 126개 검사 PASS. 이 중 Apple 링크는 의도대로 기존 URL 유지.
- 실제 브라우저: KO 홈→Focus→JA 전환, 양 CTA의 Google Play 라벨 일치, Apple 기존 URL, 개인정보 링크의 UTM 미전달 확인. 콘솔 warn/error 0.
- 새 의존성, 원격 CI, 외부 발행, 광고비, 스토어 설정 변경 없음.
- **Verify: 로컬 Play 링크 전달 범위 PASS. 운영 배포·실제 귀속·Apple 활성화는 미완료.**

### Apple 활성화 게이트

권한 있는 운영자가 ASC의 생성된 캠페인 링크에서 `pt`를 직접 확인한다. API key·JWT·team ID·olympus providerId를 대신 넣지 않는다. 공개 pt 값과 검증 날짜/근거만 기록하고 `APPLE_PROVIDER_TOKEN` 및 비활성 상태 테스트를 함께 갱신한다. 계정 시크릿을 코드에 넣지 않는다. 다시 build/test/운영 URL readback 후 실제 데이터가 생겨야 귀속 확인으로 표기한다.
