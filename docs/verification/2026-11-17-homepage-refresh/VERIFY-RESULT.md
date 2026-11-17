# Verify Result — REVISE

2026-11-17 · Content QA: **REVISE** · Publication integrity: **N/A (미배포)**

코드 및 데이터 갱신은 구현했으나, 확대 글자의 기존 안내문 결함이 남아 **운영 배포 가능 상태로 승인하지 않는다**.

| 요구사항 | 실제 변경/증거 | 상태 |
|---|---|---|
| 홈페이지 앱 최신화 | `src/data/apps.ts`; 공개 스토어 독립 확인 결과 `docs/release/homepage-refresh-public-20261117.json` | PASS |
| 플랫폼 정보 구분 | Hello iOS 1.1.1 / Android 1.1.0; 새 공통 버전 추정 금지; 테스트와 실제 상세 화면 | PASS |
| 기록관 최신화 | `archive-refresh-20261117.mjs` 27개 관측 추가, 기존 41개 보존, 총 68개 | PASS |
| 날짜·출처 정확성 | 관측일 11/17과 스토어 업데이트 날짜 분리; 직접 출처 링크; 공개 확인을 첫 출시/승인으로 표현하지 않음 | PASS |
| 과거 기록/이미지 보존 | 기존 이벤트 41개 객체 deepEqual; 기존 이미지 삭제 없음; Dialogos 최신 제출 화면도 공개 스크린샷으로 단정하지 않음 | PASS |
| 모바일 불필요한 스크롤 | 크루 일반 모바일 2열, 전체 구간 65.9% 감소; 기록관 앱별 변화 목록 기본 접힘 | PASS |
| 다국어/테마/확대 글자 | 540개 셀 측정; KO/JA 320px 200% 안내문 의미 단위 분리 잔존 | **REVISE** |
| 실제 기능 | KO/JA/EN 필터·키보드·뒤로가기·언어·테마·상세 이동 확인 | PASS |
| 운영 홈페이지 반영 | commit/push/deploy 없음; 운영 readback 없음 | NOT DONE |

## 공개 버전 변경

| 앱 | iOS | Android |
|---|---|---|
| Focus | 1.2.4 | 1.2.4 |
| Draw | 1.2.5 | 1.2.5 |
| Word Voyage | 1.4.2 | 1.4.2 |
| Hello | 1.1.1 | 1.1.0 (유지) |
| Words | 1.1.1 | 1.1.1 |
| Log | 1.0.15 | 1.0.15 |
| Dialogos | 1.1.0 | 1.1.0 |

출시 앱 16개의 기존 플랫폼 연결을 재확인했다. KR Google Play 16개, Apple KR 11개 / JP 10개 / US 10개 공개 메타데이터가 근거다. 모든 국가에서 출시됐다는 주장이나 기기 설치 확인은 아니다. 기록관에 빠져 있던 Spend/BP/Dream의 공개 관측·자산도 포함했다. 미출시 Legion의 출시 기록은 만들지 않았다.

## Commands

| 명령 | 결과 | 로그 |
|---|---|---|
| `npm run build` | exit 0, 222 pages | [build.txt](logs/build.txt) |
| `npm test` | exit 0, 957 passed / 0 failed / 0 skipped | [test.txt](logs/test.txt) |
| `npm run test:built` | exit 0; 54개 home/app 페이지 243개 스토어 링크, 3개 Draw 언어, 독립 버전 표시, 218개 공통 스크립트 캐시, Bridge 리소스 격리 | [built.txt](logs/built.txt) |
| 최종 Chrome QA 실행기 2개 | exit 0; 120 + 420 셀, 3개 언어 기능 흐름 | matrix JSON / qa 실행기 |
| `git diff --check` | exit 0 | 최종 문서 추가 뒤 재실행 |
| 기존 41개 archive event와 HEAD JSON 비교 | deepEqual 통과 | [final-checks.txt](logs/final-checks.txt) |

기존 테스트의 과거 메타데이터를 임의 덮지 않았다. 새 확인 자료와 정확한 apps.ts 변경 내역을 가장 최신 검증 레이어로 추가했다. 스킵한 테스트/삭제한 안전성 가드 없음.

## Side effects

- 기존 `/code/pifl-labs`의 사용자 미완성 변경은 그대로 두고 별도 `.worktrees/homepage-refresh-20261117`에서 작업했다.
- dependency/package-lock/CI 변경 없음. 스토어 콘솔 쓰기·구매·설치·시뮬레이터/공용 기기 조작 없음.
- 새 운영 기능·가격·건강 효능·개인정보 약속을 추정해 추가하지 않았다.
- 공개 스토어 스크린샷 16개의 SHA를 원 수집 자료와 재대조해 `public-store/`에 보존했다.
- 원문 텍스트 진단은 압축 보존했고, 화면 판정은 구현자가 직접 수행했다. 독립 시각 검토자 검수는 하지 않았다.
- Source/build 및 보존 증거 식별: [artifact-manifest.json](artifact-manifest.json).

## Next action

1. [DESIGN-QA.md](DESIGN-QA.md)의 KO/JA 200% 안내문 결함을 다음 수정 회차에서 해결하고 같은 matrix로 재검증한다.
2. 잔여 필수 결함과 미확인 범위를 검토해 release gate를 다시 판정한다.
3. 사용자 배포 범위 확인 및 게이트 충족 후에만 commit/merge/deploy, 공개 URL readback을 진행한다.

**현재 홈페이지 운영본이 갱신됐다고 보고하지 않는다.**
