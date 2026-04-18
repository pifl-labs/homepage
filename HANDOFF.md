# HANDOFF.md — PiFl Labs 웹사이트 세션별 변경 로그

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
