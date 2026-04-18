# HANDOFF.md — PiFl Labs 웹사이트 세션별 변경 로그

---

## Session 2 — 2026-04-18: 자가호스팅 폰트 전환 + 앱 브랜드 폰트 통일

### 작업 요약

홈페이지 본문·헤드라인·코드 폰트를 Google Fonts CDN 의존에서 **자가호스팅 variable woff2 3종**으로 전환. 앱(pipi_focus, pipi_words)이 이미 번들해 쓰던 **Pretendard + Space Grotesk** 조합과 글리프 소스를 통일해 웹↔앱 브랜드 일관성 확보. Claude Design 같은 디자인 시스템 업로더가 레포 내 폰트 자산을 인식할 수 있게 됨.

### 수행한 작업

#### 1. 폰트 선택 및 다운로드

앱과의 통일 범위를 용도별로 분기:

| 용도 | 이전(홈페이지) | 앱 | 채택 |
|---|---|---|---|
| Display (h1, Hero, 섹션 타이틀) | Inter 900 | Space Grotesk | **Space Grotesk** |
| Body/UI (영·한·일) | Inter + Noto Sans KR | Pretendard | **Pretendard JP** |
| Mono (코드블록) | JetBrains Mono | Space Mono (디스플레이 용도) | **JetBrains Mono 유지** |

Mono는 완전 통일하지 않고 용도별 분기 — 웹의 Dart 코드블록은 가독성이 우선, 앱의 타이머·숫자 디스플레이는 개성이 우선이라 Space Mono ≠ JetBrains Mono 유지가 더 건강함.

**신규 파일:**

| 파일 | 크기 | 출처 |
|---|---|---|
| `public/fonts/PretendardJPVariable.woff2` | 5.1MB | github.com/orioncactus/pretendard (한·영·일 통합 variable 100~900) |
| `public/fonts/SpaceGrotesk-Variable.woff2` | 48KB | github.com/floriankarsten/space-grotesk (variable wght) |
| `public/fonts/JetBrainsMono-Variable.woff2` | 111KB | github.com/JetBrains/JetBrainsMono (variable wght) |

#### 2. styles.css — @font-face + 토큰 재정의

- 상단에 `@font-face` 3개 추가 (`font-display: swap`, `format('woff2-variations')`)
- `:root` 타이포 토큰:
  ```css
  --font-display: 'Space Grotesk', 'Pretendard', -apple-system, sans-serif;
  --font-main: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-code: 'JetBrains Mono', 'D2Coding', monospace;  /* 유지 */
  ```
- `h1, h2, .hero-title, .section-title, .logo-text` 전역 셀렉터로 display 폰트 자동 적용

#### 3. 22개 HTML 일괄 교체 (Python 배치 스크립트)

패턴: `preconnect` 2줄 + Google Fonts `<link rel=stylesheet>` 1줄 = 총 3줄 블록을 자가호스팅 `<link rel="preload" as="font" ... crossorigin>` 2줄로 교체.

| 범위 | 파일 수 |
|---|---|
| `public/` 루트 (index, privacy, terms) | 3 |
| `public/en/` (index, privacy, terms, apps/*/privacy × 2) | 5 |
| `public/localized-files/ko/` 동일 구조 | 5 |
| `public/localized-files/ja/` 동일 구조 | 5 |
| `public/apps/{pipi-focus,pipi-words}/privacy.html` | 2 |
| `public/404.html` (standalone — `@font-face` 인라인 복제) | 1 |
| `public/localized-files/ja/index.html` — 불필요해진 `Noto Sans JP` override 블록 삭제 | (위 포함) |

#### 4. PR 과정에서 발견한 치명적 버그 (1차 검토 차단 → 수정)

**증상**: `SpaceGrotesk-Variable.woff2`가 실제 폰트 바이너리가 아닌 **GitHub 404 HTML 페이지**로 커밋됨.

**원인**: 최초 다운로드 경로 `github.com/.../fonts/webfonts/SpaceGrotesk[wght].woff2`가 404였고 `curl -sL`이 HTTP 응답 본문(HTML)을 그대로 `.woff2` 확장자로 저장. `-f` 플래그를 안 붙여서 실패 시 비-0 종료를 하지 않음.

**탐지**: `pr-merge-reviewer` 서브에이전트가 `gh pr diff`에서 이 파일만 "Binary files differ"가 아닌 `+1462` 줄 text diff로 표시된 것을 근거로 잡아냄.

**조치**:
1. GitHub API로 실제 파일 경로 확인 → 올바른 경로는 `fonts/woff2/SpaceGrotesk[wght].woff2` (webfonts가 아니라 woff2 하위)
2. 재다운로드, `file(1)` 실행해 세 파일 모두 `Web Open Font Format (Version 2)` 매직 넘버 검증 후 커밋
3. 2차 검토 → 승인 → squash 머지

### 커밋 기록

```
9d52c22 자가호스팅 폰트 전환 + 앱 브랜드 폰트 통일 (squash merge of PR #1)
  ← e4a380b feat: 자가호스팅 폰트로 전환, 앱 브랜드 폰트와 통일
  ← b35a02d fix(fonts): Space Grotesk woff2 실파일로 교체
```

### 배포 상태

⚠️ **Firebase 배포 보류** — `firebase deploy --only hosting` 실행 시 `Authentication Error: Your credentials are no longer valid`. 재로그인 필요:

```bash
firebase login --reauth
firebase deploy --only hosting
```

main 머지는 완료됐으므로 재인증 후 배포만 하면 됨. 현재 운영 사이트는 Session 1 상태 유지 중.

### 의사결정 기록

1. **Pretendard JP Variable 선택 (5.1MB)**: 일·한·영 단일 파일로 통합. 크기는 부담되지만 `font-display: swap` + `preload crossorigin`으로 첫 페인트 블록 없음. 추후 로케일별 분기(옵션 A) 백로그로 남김.

2. **Dynamic Subset 대신 Variable 선택**: Variable 쪽이 앱과 같은 weight 범위(100–900)를 단일 파일로 커버해 브랜드 일관성이 더 높음. Dynamic Subset은 한글 2,780자 제한이라 드문 한자/구한글 리스크.

3. **JetBrains Mono 유지 (앱과 비통일)**: 앱의 Space Mono는 타이머·숫자 디스플레이용이라 글자폭이 넓고 개성이 강함. 웹의 Philosophy 섹션 Dart 코드블록은 여러 줄 스캔 가독성이 우선 — 용도별 분기가 무리한 통일보다 건강함.

4. **헤드라인 전용 display 토큰 신설**: 기존엔 `--font-main` 하나만 있어 h1도 본문과 같은 폰트. 브랜드 타이포 차별화를 위해 `--font-display` 별도 선언.

### 빌드 상태

- 정적 사이트 — 빌드 불필요
- `file public/fonts/*.woff2` — 3개 전부 Web Open Font Format (Version 2) 확인
- `grep -r "fonts.googleapis" public/` — 0건
- Firebase 배포 성공

### 주의사항 / 학습

- **`curl` 다운로드 시 `-f` 플래그 필수**: `-sL` 만 쓰면 404/500 응답도 성공으로 처리되어 HTML이 바이너리로 저장됨. 이후 `file(1)` 검증을 루틴화할 것.
- **pr-merge-reviewer의 실효성 확인**: 바이너리 파일 무결성을 diff 헤더 형태("Binary files differ" vs text diff)로 판별하는 게이트 작동 확인. 사람이 diff 안 봐도 이런 유형은 잡힘.
- **404.html은 standalone**: `styles.css`를 include하지 않으므로 전역 `@font-face` 추가만으론 안 되고 인라인으로 복제 필수. 향후 이 파일 수정 시 주의.

### 남은 작업

1. **PretendardJP 로케일별 분기** (성능 최적화)
   - `/` + `/en/*` + `/localized-files/ko/*` → `PretendardVariable.woff2` (일본어 제외, ~1.2MB)
   - `/localized-files/ja/*` → `PretendardJPVariable.woff2` (5.1MB)
   - 한국어·영어 페이지 FOUT ~4배 개선 예상

2. **JetBrains Mono preload 추가**
   - 현재 CSS `@font-face`만 있고 HTML에 `<link rel="preload">` 없음. Philosophy 섹션 코드블록이 viewport 진입 시 FOUT 발생 가능.

3. **홈페이지 현대화 본작업** (이번 세션에선 폰트만 선행)
   - Hero 과포화 해적 비유 톤다운
   - 실제 제품(PiPi Focus / PiPi Words) 쇼케이스 섹션 신설
   - 네온/사이버 그라디언트 → 뉴트럴 + 단일 악센트
   - 깨진 `@keyframes` 6개 제거
   - Claude Design 활용 (앞 세션 대화 참조)

4. **이전 세션 미완료분 유지**
   - PiPi Words iOS `NSUserTrackingUsageDescription` / `PrivacyInfo.xcprivacy`
   - PiPi Focus privacy 외부 리뷰
   - App Store / Play Console privacy URL 로케일별 등록

---

## Session 1 — 2026-04-18: i18n 재구성 + 앱 개인정보처리방침 페이지 (PiPi Focus / PiPi Words)

### 작업 요약

루트를 영어로 재구성하고 Firebase Hosting i18n rewrites로 Accept-Language 기반 자동 언어 서빙 체계 구축. PiPi Focus·PiPi Words 앱용 개인정보처리방침 페이지를 각 3개 언어로 추가. 상대경로 버그 전수조사 & 수정.

### 수행한 작업

#### 1. 회사 통합 개인정보처리방침·이용약관 다국어화

기존 `/privacy`, `/terms` (한국어만) → 3개 언어 + hreflang SEO 정비.

**생성:**

| 파일 | 역할 |
|---|---|
| `public/en/privacy.html` | 회사 개인정보처리방침 (영어) |
| `public/en/terms.html` | 회사 이용약관 (영어) |
| `public/ja/privacy.html` → `public/localized-files/ja/privacy.html` | 일본어 |
| `public/ja/terms.html` → `public/localized-files/ja/terms.html` | 일본어 |

※ 나중 Session 작업(§3)에서 /ja/ 폴더 구조 재배치됨.

#### 2. PiPi Focus 앱 개인정보처리방침 페이지

앱 특성(AdMob, IAP, ATT, flutter_local_notifications, flutter_secure_storage, 마이크)을 반영한 전용 페이지.

**생성:**

| 파일 | 역할 |
|---|---|
| `public/apps/pipi-focus/privacy.html` | 한국어(당시 루트 한국어) |
| `public/en/apps/pipi-focus/privacy.html` | 영어 |
| `public/ja/apps/pipi-focus/privacy.html` → `public/localized-files/ja/apps/pipi-focus/privacy.html` | 일본어 |

**URL (최종 재구성 후):**
- 영어: `https://pifl-labs.com/en/apps/pipi-focus/privacy`
- 한국어: `https://pifl-labs.com/ko/apps/pipi-focus/privacy`
- 일본어: `https://pifl-labs.com/ja/apps/pipi-focus/privacy`

#### 3. 루트 영어화 + Firebase i18n 재구성 ⭐ 핵심 변경

**Before**: 루트(/) = 한국어, /en/ = 영어, /ja/ = 일본어, /ko/ = redirect
**After**: 루트(/) = 영어(기본), localized-files/ko|ja/ = i18n 자동 서빙, /en|/ko|/ja/ = 명시적 경로

**파일 이동:**

| From | To |
|---|---|
| `public/{index,privacy,terms}.html` (한국어) | `public/localized-files/ko/*.html` |
| `public/apps/pipi-focus/privacy.html` (한국어) | `public/localized-files/ko/apps/pipi-focus/privacy.html` |
| `public/ja/*.html` | `public/localized-files/ja/*.html` |
| `public/en/*.html` (영어) | `public/*.html` (루트) |
| `public/ko/` (redirect 폴더) | **삭제** |

**firebase.json 변경:**

```json
{
  "cleanUrls": true,
  "i18n": { "root": "/localized-files" },
  "rewrites": [
    { "source": "/ko",         "destination": "/localized-files/ko/index.html" },
    { "source": "/ko/privacy", "destination": "/localized-files/ko/privacy.html" },
    { "source": "/ko/terms",   "destination": "/localized-files/ko/terms.html" },
    { "source": "/ko/apps/pipi-focus/privacy", "destination": "/localized-files/ko/apps/pipi-focus/privacy.html" },
    { "source": "/ja",         "destination": "/localized-files/ja/index.html" },
    { "source": "/ja/privacy", "destination": "/localized-files/ja/privacy.html" },
    { "source": "/ja/terms",   "destination": "/localized-files/ja/terms.html" },
    { "source": "/ja/apps/pipi-focus/privacy", "destination": "/localized-files/ja/apps/pipi-focus/privacy.html" }
  ]
}
```

**SEO**: 전 16개 HTML에 hreflang 4개 태그(en/ko/ja/x-default) 추가, canonical을 언어별로 분리(`/`, `/ko/`, `/ja/`), sitemap.xml에 alternate 링크 추가.

**동작 검증** (curl):
- `/` + `Accept-Language: ko-KR` → `/localized-files/ko/index.html` 자동 서빙 (URL 유지, lang="ko", canonical=/ko/)
- `/` + `Accept-Language: ja-JP` → 일본어 자동 서빙
- `/en/privacy` + `Accept-Language: ko-KR` → 영어 강제 (i18n 우회)
- `/ko/privacy` (명시적) → 한국어

#### 4. PiPi Words 앱 개인정보처리방침 페이지

한일 단어 학습 앱 특성 반영. PiPi Focus와 달리 마이크 없고, TTS(기기 내장)·in_app_review 사용.

**생성:**

| 파일 | 역할 |
|---|---|
| `public/apps/pipi-words/privacy.html` | 영어 루트 |
| `public/en/apps/pipi-words/privacy.html` | 영어 (명시적) |
| `public/localized-files/ko/apps/pipi-words/privacy.html` | 한국어 |
| `public/localized-files/ja/apps/pipi-words/privacy.html` | 일본어 |

`firebase.json`에 `/ko/apps/pipi-words/privacy`, `/ja/apps/pipi-words/privacy` rewrites 추가.

#### 5. 상대경로 버그 수정 (전수조사) 🐛

**증상**: `/ko/` 방문 시 CSS 미로드, 페이지 스타일 깨짐.

**원인**: `localized-files/ko/index.html`이 원래 루트(/)에 있던 파일의 복사본이라 `href="styles.css"` (bare) 쓰고 있었음. `/ko/`에서 서빙되니 브라우저가 `/ko/styles.css` 요청 → 404. SPA fallback이 index.html HTML 반환 → CSS 파싱 실패.

**조치**: 모든 HTML의 정적 에셋 참조를 절대경로(`/styles.css`, `/emblem.png` 등)로 통일.

**수정 파일:**
- `public/index.html`, `public/en/index.html`: `../styles.css` → `/styles.css`
- `public/localized-files/{ko,ja}/index.html`: 상대경로 → 절대경로
- `public/localized-files/ko/{privacy,terms}.html`: `emblem.webp` → `/emblem.webp`

#### 6. PiPi Words 보안 문구 정정 (리뷰어 피드백)

담당자 리뷰에서 "Keychain/Keystore 문구 부정확" 지적.

**검증 결과**: `pipi_words/pubspec.yaml`에 `flutter_secure_storage` 의존성 없음 확인. `pipi_focus`에서 방침 복사하면서 해당 문구가 잘못 딸려 들어감.

**수정** (4개 언어판 전부):
- 변경 전: "민감 정보의 보안 저장소(Keychain/Keystore) 활용"
- 변경 후: "앱 데이터를 플랫폼 기본 설정 저장소에 로컬 보관 (민감한 자격증명은 수집·저장하지 않음)"

※ 담당자의 또 다른 지적("이메일 문의 수단 없음")은 **오판정**. `pipi_words/lib/features/settings/presentation/settings_screen.dart`에 `mailto:support@pifl-labs.com` + Clipboard fallback 구현 확인.

### 커밋 기록

```
8567d32 fix(pipi-words): correct security measures description
1d8a265 fix: convert all relative asset paths to absolute
684cb61 feat: add PiPi Words privacy policy pages (3 languages)
b15a66e feat: restructure site for i18n with English root + auto-detect
```

### 배포 상태

Firebase Hosting (`pifl-labs-main`)에 전부 배포 완료. 전체 20개 URL HTTP 200 확인.

### 의사결정 기록

1. **루트를 영어로 재구성**: 앱 기본 언어가 영어라, 루트=한국어였던 기존 구조를 뒤집어 영어를 기본 로케일로. i18n rewrite로 한국어/일본어 유저에겐 Accept-Language 기반 자동 서빙.

2. **/en/ 폴더 유지 (중복)**: i18n rewrite는 Accept-Language를 서버사이드로 덮어쓰는 기능이 없어서, "한국어 유저가 명시적으로 영어 보기"를 구현하려면 /en/ 폴더가 실제 파일로 존재해야 함. 중복 저장 감수.

3. **cleanUrls: true**: 명시적 `.html` rewrite 다 쓰는 대신 Firebase 자체 기능 사용. 설정 축소.

4. **canonical 언어별 분리**: 같은 URL (/privacy)에서 한국어/영어/일본어가 자동 서빙되니 Google이 중복 콘텐츠로 오해할 수 있음. 언어별 canonical (`/`, `/ko/`, `/ja/`)로 각 버전을 별도 인덱싱 유도.

5. **절대경로 원칙**: 상대경로는 파일 위치와 서빙 URL이 불일치할 때 깨짐. 앞으로 HTML 작성 시 정적 에셋은 **무조건 절대경로(`/*`)** 원칙.

### 남은 작업

1. **PiPi Words iOS 설정 보완** ⚠️ (스토어 제출 전 필수)
   - `pipi_words/ios/Runner/Info.plist`에 `NSUserTrackingUsageDescription` 없음 (AdMob + ATT 필수)
   - `pipi_words/ios/Runner/PrivacyInfo.xcprivacy` 파일 없음 (shared_preferences, drift, flutter_local_notifications → Required Reason API 선언 필요)
   - 누락 시 App Store Connect 업로드 ITMS-91053 경고

2. **App Store Connect / Google Play Console 등록**
   - PiPi Focus / PiPi Words의 privacy URL을 로컬라이제이션별로 등록
   - 미국 로컬: `/en/apps/{app}/privacy`
   - 한국 로컬: `/ko/apps/{app}/privacy`
   - 일본 로컬: `/ja/apps/{app}/privacy`

3. **pipi-focus 방침 검토** (담당자 유사 점검 받을 것)
   - pipi-words는 받았는데 pipi-focus는 아직 외부 리뷰 안 받음
   - 특히 pipi_focus에 실제로 `flutter_secure_storage`를 Keychain/Keystore에 상응하게 쓰는지 코드 확인

4. **og:image 최적화 여부**
   - MEMORY.md에 "og:image 오버사이즈" 언급 있었으나 이번 세션에선 건드리지 않음

### 주의사항

- `/ko/styles.css`, `/ko/emblem.png` 등 로케일 프리픽스 + 에셋 경로는 SPA fallback에 걸려 HTML(200)을 반환함. 현재 HTML은 절대경로만 쓰므로 실제 요청되지 않아 무해하나, 향후 수정 시 재발 주의.
- `/en/` 폴더가 루트와 중복 영어 콘텐츠. 영어 내용 수정 시 **두 곳 동기화 필요**. 자동화 스크립트 고려 가능.
- hreflang / canonical 규칙: 새 페이지 추가 시 4개 언어(en, ko, ja, x-default) 전부 명시하고 canonical은 해당 로케일의 명시적 URL로.

---
