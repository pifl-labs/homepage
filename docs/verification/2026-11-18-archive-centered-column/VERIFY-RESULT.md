# Verify — PASS

| 요구사항 | 근거 |
|---|---|
| 같은 폭·가운데 정렬 | Archive.astro의 공통 열이 앱 선택, 필터, 구분선, 기록/출처를 감싼다. 개별 폭 상한 제거. |
| 오른쪽 콘텐츠 없음 | aside 및 새 콘텐츠 없음. archive 이외 페이지, 릴리스 데이터, 클라이언트 필터 구현은 변경하지 않음. |
| 모바일 QA | 320/375px 및 확대 글자, 3개 언어, 두 테마. 상세는 DESIGN-QA.md. |

- `npm run build`: 222개 페이지 성공.
- `npm test`: 981개 통과. 가운데 열 및 CSS 캐시 해시 테스트 추가.
- `npm run test:built`: 성공.
- `git diff --check`: 성공.
