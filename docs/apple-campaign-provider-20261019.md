# Apple 캠페인 URL — 검증된 동일 소유 앱만

2026-10-19. 홈페이지의 Apple 캠페인 링크 비활성 상태를 해제한다. 이는 URL 연결 작업이며 설치·매출 측정 성공이나 성장 성과가 아니다.

## 공개 값의 근거

같은 회사의 기존 공개 검증 기록:
- [2026-10-10 실제 ASC 생성 링크·6개 소유 앱](https://github.com/pifl-labs/pipi-worlds/blob/main/docs/marketing/IOS-CAMPAIGN-LINKS-2026-10-10.md)
- [2026-10-16 Bridge·Voyage 소유 목록 확인](https://github.com/pifl-labs/pipi-worlds/blob/main/docs/marketing/ios-campaign-owner-2026-10-16.json)
- [Apple 공식 캠페인 링크 안내](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links)

기존 ASC 생성기의 공개 링크:
`https://apps.apple.com/app/apple-store/id6762258878?pt=128720089&ct=pipi-focus&mt=8`

`pt=128720089`는 인증정보가 아닌 공개 제공자 식별자다. API 키·team ID·기존 TikTok olympus providerId를 복사한 것이 아니다. Apple 안내에 따라 동일 개발자 계정의 캠페인에 재사용한다.

허용 ID: Focus `6762258878`, Words `6770267735`, Hello `6777299814`, Log `6770272665`, D-Day `6770268950`, Draw `6779071131`, Voyage `6788949612`, Bridge `6801205183`. 다른 앱·미확인 ID·후속 신규 ID에는 자동 적용하지 않는다. Tide·Dialogos의 미확인 iOS ID를 만들지 않는다.

## 불변 조건

- 기존 목적지의 ID·국가·path·`ppid`·기타 옵션·hash와 표시 문구를 보존한다.
- 허용한 ID의 `pt`/`ct`/`mt`만 설정한다. 기존 정제된 캠페인 이름을 사용한다.
- 다른 제공자를 인자로 주거나 알 수 없는 앱을 지정하면 원 URL을 유지한다.
- Android referrer·내부 이동 규칙·원래 `/go/tiktok`은 바꾸지 않는다.
- 쿠키·SDK·네트워크 이벤트·방문자 ID·개인정보·가격·계약·앱 바이너리를 추가하지 않는다.
- URL 생성/배포와 실제 스토어 집계를 구분한다. 이전 비활성 기간은 소급 귀속되지 않는다. 작은 표본·집계 지연·보고서 비제공은0으로 채우지 않는다.

## 검증 경계

단위·DOM adapter·빌드 HTML 검증으로 소유 앱/언어/옵션 보존을 확인한다. 운영에서 같은 모듈과 실제 링크를 읽기 전에는 공개 반영 완료로 쓰지 않는다. 첫 운영 JS 직접 조회는403이었으므로 원인 미정/미검증으로 보존하고 보호를 해제하거나 다른 경로로 우회하지 않는다. 실제 캠페인 집계·설치·수입은 별도 기존 측정 권한과 개인정보 임계치가 적용된다.
