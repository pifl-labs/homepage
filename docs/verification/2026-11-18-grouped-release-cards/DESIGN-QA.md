# 동일 릴리스 통합 / 플랫폼 날짜 / 공개 앱 카탈로그

- Source/build: `results.json` SHA-256. Chrome headless의 Astro production preview에서 테스트. 기본 기준 main `eb15595`.
- Before/after: 같은 KO dark 1280px·200%에서 기분 한 칸 1.0.15의 두 카드 → 한 카드. 업데이트 상세는 한 번만 읽고, iOS 공개(KST)와 Android Play 업데이트는 아래 두 날짜로 확인. 메인 375px 운영 캡처에서 출시 전 군단전기 카드를 확인했고 최종 메인 3언어 카드/목록 구조화 데이터에서 제외.
- Visual **PASS**: 동일 조건 캡처 `before-comparable.png` → `after-comparable.png`의 위계·문장 폭·날짜의 위치. KO 375px(출처도 펼친 상태), EN 320px/200% 홈 버전 행, JA 375px 그날까지 상세의 날짜·버전 줄을 실물 대조. 기존 카드 배경과 토큰 유지. 증거 날짜와 스토어 공개 날짜가 다른 의미임을 라벨과 disclosure로 표현.
- Text/responsive/accessibility **PASS**: 홈·기록관·그날까지 상세 × 3언어 × 320/375/768/1280/1920px × light/dark × 100/200% = 180셀. 렌더된 40카드·플랫폼 날짜 일치, 홈페이지 공개 앱 16개, 가로 넘침·측정 대상 잘림 0. 원본 텍스트 도구의 UNVERIFIED/unsupported는 별도 보존(자동 승인 아님).
- Functional **PASS**: 3언어 375px 방문 시 오래된 미출시 앱 쿼리 무해, Space 앱 선택, 동일 카드가 양 필터에 표시 및 두 날짜 보존, 뒤로·키보드 출처·JSON 링크·리셋·메인 기록관 링크 동작.
- Artifact match **PASS**: 실행한 9개 HTML 및 제품 소스와 공개 자산 해시 `results.json`. 최종 운영의 readback은 별도 기록.
- 검증 범위는 변경된 웹 페이지·정보. 다른 앱의 실제 기기 빌드 검증은 해당 없음. 원본 180셀 실행기/캡처/진단/로그는 모노레포 `docs/verification/2026-11-18-grouped-release-cards/`에 보존.

배포 직전 동시 병합 #204 푸터 그림만 상류 변경됨. 최신 main `870a21e` 위에서 다시 빌드(222), 977 테스트 및 built checks, 동일 180셀/3흐름 PASS. `results.json`은 이 최종 빌드 해시이며 전후 비교 그림의 기록관 부분은 동일한 프로젝트 소스다. 재실행 원본은 모노레포 `latest-base/`와 `*-r2.log`.
