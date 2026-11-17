# 기록관: 출시·업데이트 중심 정리

- 기준 main: `64ba0b7997f44220f364242774124a998c6a9e8e`; 정확한 검증 산출물은 `result.json`의 source/build SHA-256.
- Before: 운영 KO 375px에서 17개 앱·68개 기록, 피피 군단전기 필터에 출시 준비/자료 보관 기록이 노출됨. `before-ko-375.png`.
- After: 공개 버전 및 내용 근거가 있는 앱 16개·기록 48건. 제출 1, 승인 9, 자산 5, 중복/내용 없는 관측 5건 제외. 버전별 실제 기능과 출처, 업데이트 날짜가 한 표준 타임라인에 위치. 보관 자산과 미출시 단계 요약은 웹/공개 JSON과 분리.
- Visual **PASS**: KO 375px 전후, 풀 사이즈 3언어·밝고 어두운 카드, 320px 확대 제목 및 768px 확대 선택 버튼의 위계·여백·대비·줄바꿈을 직접 확인. 1차에서 확대 시 앱 이름이 중간에 끊긴 이슈를 확인하여 글자 크기에 따라 필터 열을 재배치. 2차에서 EN 320px 200% 제목의 and 고립을 발견해 Release history로 교체하고, 제목 위 고정 연도 장식을 제거. 3차에서 재확인.
- Text/responsive/accessibility **PASS**: KO/JA/EN × 320·375·768·1280·1920px × light/dark × 100%/200% = 60셀. 48개 제목/본문/표시 날짜 및 316개 측정 박스 대조, 가로 넘침/클리핑/JS 오류 0. 12개 추가 키보드 선택·명확한 focus/선택 체크·44px 목표 확인. 표준 3언어/변경 경로 실물 기준이며 앱 신규 빌드 시험이 아님.
- Functional **PASS**: 3언어 375px 구형 미출시 앱 링크, 다중 선택, 플랫폼/종류 교차, 결과 없음, 상세 키보드 열기와 Git 근거, 뒤로, 리셋, 근거 링크 및 JSON 다운로드 확인.
- Artifact match **PASS**: 최종 CSS/JS/데이터와 3언어 HTML 해시 기록. 외부 공개 반영은 별도 확인 필요.
- 원본: 모노레포 `docs/verification/2026-11-18-public-release-archive/{round-1,round-2,final}`. 전체 화면/측정 및 도구의 UNVERIFIED/unsupported 진단 보존; 진단값만으로 디자인 승인하지 않았다. 모노레포 자료의 `round-1/run.mjs`, `round-1/pickers.mjs`가 실행기다.
- 범위: 기록관 3개 경로, 관련 공개 JSON/JS/CSS만. 홈·피피 군단전기 소개·Dialogos 소개 각 3언어 HTML의 이전 빌드와 byte 동일 확인. 앱·스토어·기기 변경 없음.
