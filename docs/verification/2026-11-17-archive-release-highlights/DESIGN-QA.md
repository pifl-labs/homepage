# 기록관 실제 변경 내용 보강 — Design QA

## 요구와 정보 순서
- 사용자는 “무엇이 달라졌는지”를 읽으러 온다. 공개 여부 확인만 반복하던 37개 기록을 기능·개선 중심 제목과 짧은 설명으로 바꾼다.
- 앱·플랫폼·버전 → 주요 변경 제목 → 변경 설명 → 접힌 출처 순서. 관측일/승인일/공개 업데이트일은 기존 의미와 값 그대로다.
- 26건: 직접 확인한 공개 스토어 출시 노트. 11건: 버전별 Git 출시 문서(과거 10건 + 공개 Apple 노트가 없는 물시계 iOS).
- iOS/Android 안녕 일본어 1.1.1/1.1.0을 분리. 밑그림 1.2.5에는 없는 UI 신기능을 만들지 않았다.

## 실행물 / matrix
- Product source 및 3개 언어 build SHA-256: `fingerprint.json`.
- Chrome headless, 실제 Astro production preview `http://127.0.0.1:4328`.
- KO/JA/EN × 320/375/768/1280/1920px × light/dark × 100%/200% text = 60 cells. 기본 viewport height 900px.
- 각 셀에서 68개 기록, 변경한 37개 제목·설명, 새 출처 표시를 검증. 60셀 가로 넘침·변경 텍스트 clipping·페이지 JS 오류 0.
- 3개 언어 375px 실제 흐름: 앱 선택 → Android 필터 → 키보드 Enter로 출처 열기 → JSON 근거 링크 → 뒤로 가기/필터 복원 → 전체 초기화. 모두 PASS (`flows.json`).

## 실물 검토
- 기존 일반 문구: `screenshots/before-generic-ko-375.png`.
- 기본 모바일 3언어/light·dark, desktop 출처, 320px/200% 확대 카드 증거: `screenshots/`.
- 제목과 본문의 정보 위계, 출처의 낮은 강조, 기존 링크/키보드 동작, 대비, KO 어절·JA 금칙·EN 단어 경계와 간격을 대표 실제 렌더에서 확인했다.
- 1차: 한국어 인용부호 뒤 조사와 가운뎃점 목록의 어색한 줄바꿈을 발견해 REVISE. 의미를 유지하면서 인용부호를 빼고 목록을 쉼표/자연어로 고쳤다. 2차: 같은 60셀 재검증 PASS.
- 변경 제목/본문의 최종 텍스트 진단 후보 166건은 영문 하이픈/대시 경계 줄바꿈이다. 단어 중간의 임의 절단은 없다 (`text-review.json`).
- **도구 원판정은 덮어쓰지 않음:** 원본 전수 진단의 unsupported/UNVERIFIED와 닫힌 상세/미변경 영역 후보는 `raw-text/*.json.gz`에 그대로 보존한다. 이 도구가 디자인 PASS를 내렸다고 주장하지 않는다.
- 긴 element screenshot에는 sticky nav가 중간에 합성되는 촬영 한계가 있다. 본문이 가려진 이미지를 판정 근거로 삼지 않았다. 별도 `qa-readable-crops.mjs`가 같은 320px/200%에서 viewport 높이만 늘려 37카드×3언어=111개의 가림 없는 보조 crop을 만들었고, 원래 900px 화면과 카드 폭·높이가 같음을 검증했다. 이는 900px 기능 matrix의 대체가 아니다.

## 범위와 판정
- Visual / changed text-responsive / functional / artifact match: **PASS**.
- 출시 범위: 기록관의 변경된 37개 카드와 근거 disclosure. CSS·공통 navigation·앱 landing·홈 크루는 변경하지 않았다. 기존의 닫힌 발전과정 패널 전체에 대한 새 품질 인증으로 확대하지 않는다.
- 전체 R1/R2 원본과 111 crops는 모노레포 `docs/verification/2026-11-17-archive-release-highlights/{round-1,round-2,readable-crops}/`에 보관. 이 PR에는 대표 이미지 및 원본 텍스트 진단/구조화 결과를 포함한다.
