# `.well-known/` — 모바일 딥링크 검증 파일

PiPi D-Day 앱의 Universal Links(iOS) / App Links(Android) 검증용 정적 파일.
"앱 설치 시 앱 열기 / 미설치 시 웹 랜딩(`/apps/pipi-dday/import`) 폴백" 을 서버 로직 0으로 구현한다.

> 이 파일들은 빌드 시 `public/` → `dist/` 로 복사돼 `https://pifl-labs.com/.well-known/...` 로 서빙된다.
> Content-Type(`application/json`) 강제 + i18n 302 우회는 `public/_headers` 와 `functions/_middleware.ts` 에서 처리.

## `apple-app-site-association` (iOS)

- **확장자 없음** (붙이면 Apple CDN 이 거부).
- `Content-Type: application/json`, **리다이렉트 금지** (`_headers` + 미들웨어 `/.well-known/` 우회로 보장).
- `appID = <TeamID>.<BundleID>` = `2MZNLNQSP8.com.pifl.pipi.dday`.
- Apple CDN(`app-site-association.cdn-apple.com`)이 최초 등록 시 최대 24h 캐싱 — 배포 후 즉시 동작 안 할 수 있음.
- 검증: `https://app-site-association.cdn-apple.com/a/v1/pifl-labs.com`

## `assetlinks.json` (Android)

현재 등록된 지문은 **업로드 키**(`pipi_dday.jks`) SHA-256 1개다.
이것만으로는 **로컬/사이드로드 APK** 에서만 App Link 자동검증이 통과한다.

### ⚠️ 출시 전 필수 — Play **앱 서명 키** 지문 추가

Play App Signing 을 쓰면 Google 이 업로드 AAB 를 **앱 서명 키**로 재서명하므로,
Play 스토어로 배포된 앱이 App Link 검증을 통과하려면 **앱 서명 키**의 SHA-256 을
`sha256_cert_fingerprints` 배열에 **추가**해야 한다.

1. Play Console → PiPi D-Day → Release → **Setup → App Integrity (앱 서명)**
2. **App signing key certificate** 의 SHA-256 복사
3. 아래처럼 배열에 한 줄 추가 후 재배포:

```json
"sha256_cert_fingerprints": [
  "06:43:...:67:6D",            // 업로드 키 (로컬/사이드로드)
  "<여기에 Play 앱 서명 키 SHA-256>" // Play 배포 앱 (프로덕션)
]
```

검증: `https://pifl-labs.com/.well-known/assetlinks.json` 200 + `Content-Type: application/json`,
Google 검증기 `https://developers.google.com/digital-asset-links/tools/generator`.
