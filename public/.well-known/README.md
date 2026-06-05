# `.well-known/` — 모바일 딥링크 검증 파일 (PiPi 앱 공통 플레이북)

PiPi 앱들의 Universal Links(iOS) / App Links(Android) 검증용 정적 파일.
"앱 설치 시 앱 열기 / 미설치 시 웹 랜딩 폴백" 을 **서버 로직 0**으로 구현한다.
이 디렉토리의 파일 **하나가 여러 앱을 동시에 보증**한다(배열에 항목 추가).

> 빌드 시 `public/` → `dist/` 복사 → `https://pifl-labs.com/.well-known/...` 서빙.
> Content-Type(`application/json`) 강제 + i18n 302 우회는 `public/_headers` 와
> `functions/_middleware.ts` 에서 처리(앱마다 다시 안 함, **한 번 깔면 전 앱 공유**).

---

## 1. `apple-app-site-association` (iOS) — 지문 불필요

- **확장자 없음** (붙이면 Apple CDN 거부).
- `Content-Type: application/json`, **리다이렉트 금지**(`_headers` + 미들웨어 우회로 보장).
- `details[].appIDs = "<TeamID>.<BundleID>"`. 현재: `2MZNLNQSP8.com.pifl.pipi.dday`.
- iOS는 **SHA 지문이 필요 없다** — TeamID + BundleID만 있으면 된다(둘 다 알려진 값).
  앱 추가 시 `appIDs`/`components`에 항목 한 줄만 넣으면 끝.
- Apple CDN(`app-site-association.cdn-apple.com`)이 최초 등록 시 최대 **24h 캐싱**.
- 검증: `curl https://app-site-association.cdn-apple.com/a/v1/pifl-labs.com`

## 2. `assetlinks.json` (Android) — 앱마다 SHA-256 지문 필요

Play App Signing(신규 앱 필수)을 쓰면 Google이 업로드 AAB를 **앱 서명 키**로 재서명한다.
Play로 배포된 앱이 App Link 자동검증을 통과하려면 그 **앱 서명 키의 SHA-256**을 넣어야 한다.
로컬 `*.jks`(업로드 키)는 사이드로드 APK에서만 통과 → 둘 다 넣는 게 정석.

> ⚠️ **앱마다 서명 키가 다르므로 지문은 공유 불가.** dday 지문을 넣어도 words엔 무의미.

### 2-A. 📋 Play 앱 서명 키 SHA-256 받는 법 (앱당 1회, ~30초)

1. **Play Console** (play.google.com/console) 접속 → 해당 앱 선택
2. 왼쪽 메뉴: **테스트 및 출시 → 설정 → 앱 무결성**
   (영문: **Release → Setup → App integrity**)
3. **앱 서명 키 인증서**(App signing key certificate) 카드
4. **SHA-256 인증서 디지털 지문** 복사 (`AB:CD:EF:...` 64자리 hex, 콜론 구분 32쌍)
   - 보너스: 같은 카드에 **Digital Asset Links JSON 스니펫**이 통째로 제공되기도 한다. 그걸 복사하면 패키지명+지문이 다 들어있어 더 편함.
5. (전제) 그 앱 빌드가 **Play에 1번 이상 업로드**돼 있어야 앱 서명 키가 존재한다.
   pipi_dday는 내부 테스트 업로드 완료 → **지금 바로 받을 수 있음**.

### 2-B. 세팅 (배열에 추가)

```json
{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.pifl.pipi.dday",
    "sha256_cert_fingerprints": [
      "06:43:14:99:...:67:6D",            // 업로드 키 (로컬/사이드로드)
      "<여기에 Play 앱 서명 키 SHA-256>"   // ← 2-A에서 복사한 값 (Play 배포 프로덕션)
    ]
  }
}
```

추가 후 `git push` → Cloudflare 자동 재배포. **앱 재빌드 불필요**(웹만 바뀜).

### 2-C. 검증

```bash
curl -s https://pifl-labs.com/.well-known/assetlinks.json | python3 -m json.tool   # 지문 2개 확인
# Google 공식 검증기:
# https://developers.google.com/digital-asset-links/tools/generator
# 앱 설치 후: https 링크 탭 → 선택창 없이 앱이 바로 열리면 성공
```

---

## 3. 왜 fastlane/API로 자동화 못 하나

`fastlane supply`(= Google Play Developer API androidpublisher v3)는 **AAB/메타데이터 업로드 전용**.
이 API에는 **앱 서명 인증서를 조회하는 엔드포인트가 없다.** 따라서 지문은 Play Console에서
수동 복사가 유일한 길(선례: `pipi_words/docs/UNIVERSAL-LINKS-SETUP.md` §2-A도 동일 결론).
**일반 배포 파이프라인과 무관** — 지문은 유니버셜링크 전용, 웹쪽, 일회성.

---

## 4. 다음 앱(words/focus/log 등)에 딥링크 추가하는 절차

| 단계 | 공유? | 누가 |
|---|---|---|
| 웹 인프라(`_headers`·`_middleware`·이 디렉토리) | ✅ 이미 됨, 전 앱 공유 | 재작업 0 |
| iOS: AASA `appIDs`에 `TeamID.bundleID` 항목 추가 | ⬜ 앱마다 1줄 | **Claude 자동**(값 다 알려짐, 지문 X) |
| Android: assetlinks에 패키지+지문 객체 추가 | ⬜ 앱마다 1줄 | **지문만 사용자 1회 복사**(2-A) |
| 앱 코드(app_links·entitlement·intent-filter·parser·랜딩) | ⬜ 앱마다 + 새 빌드 | Claude 패턴 복붙 |

⚠️ **Apple Team ID 주의**: dday/focus/words/log = `2MZNLNQSP8`, **pipi_draw만 `VR9827BQ8R`**.
draw에 추가 시 AASA에 그 팀 ID로 별도 항목(+ draw 팀 설정 점검 필요).

> 요약: 다음 앱은 그 앱의 **Android 지문 한 줄**만 주면, 나머지(웹 JSON 2곳 + 앱 코드 + 빌드)는
> Claude가 패턴대로 처리. iOS는 지문조차 불필요.
