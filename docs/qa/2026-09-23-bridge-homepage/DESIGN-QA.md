# Korean Bridge 홈페이지 공개 전환 — 디자인·사실 검증

## 범위와 근거

- 원본: `origin/main` `95cfcfc`에서 격리한 Bridge 관련 변경만 포함. 기존 `code/pifl-labs`의 Log 개인정보처리방침 미커밋 변경은 포함하지 않음.
- 검증 대상: KO/JA/EN 홈의 앱 카드·정비 기록, Korean Bridge 상세, App Store/Google Play 연결.
- 최종 빌드: 2026-09-23 14:48 KST, 133개 페이지. `dist/ko/index.html` SHA-256 `733d6004f399fe92fb918d2758d5d194cd305a11c0072f05d7a64c646d69b0d7`; `dist/ko/apps/pipi-bridge/index.html` SHA-256 `f3682ff78719b5a41b041f8637366df94d8a0be124217434bb8b6696adb59000`.
- 정확한 공개 상태: 기존 홈페이지는 7개 앱과 Bridge 출시 예정. Apple 공개 페이지는 무료 앱, Google Play 공개 페이지에는 설치 버튼과 PiFl Labs 개발자가 표시됨. Android 공개 버전/최초 출시일은 미확인이라 **표시하지 않음**.

## 사용자 영향의 전후

| 항목 | 이전 공개 화면 | 변경 후보 |
|---|---|---|
| 카탈로그 | 출시 앱 7개, Bridge는 Dialogos 뒤 ‘출시 예정’ | 출시 앱 8개, Bridge 첫 번째·‘출시됨’ |
| Bridge 상세 | 실제 공개 후에도 ‘준비 중’ | 3개 언어의 실제 무료 다운로드 안내와 양 스토어 링크 |
| 버전 | 한쪽 플랫폼 버전만 알아도 ‘양 스토어 동일’ 오인 가능 | iOS만 확인된 Bridge는 `iOS v1.0.0`으로만 표시 |
| 활동 소개 | 근거일 없는 ‘최근 30일’ 문구 | 마지막 확인 버전·업데이트 기록으로 한정 |

동일한 375px·다크·기본 글자 전후 화면: [변경 전](./BEFORE-ko-home-375-dark.jpg) / [변경 후](./AFTER-ko-home-375-dark.jpg).

## 실제 화면 매트릭스

- Codex 인앱 브라우저에서 최종 `dist` 로컬 서버를 열어 KO/JA/EN × 홈/상세 × 320/375/768/1280/1920px = **30셀**을 다시 검사. 모든 셀에서 `scrollWidth === innerWidth`; Bridge 카드/상세의 Apple·Play 링크 존재.
- 320px 최종 실물: [한국어](./final-ko-detail-320-dark.jpg), [일본어](./final-ja-detail-320-dark.jpg), [영어](./final-en-detail-320-dark.jpg). 세 제목 모두 의미 단위 2줄, 버튼과 설명 가림·수평 넘침 없음. 영어 보조 카테고리의 고립된 `prep`을 없앰.
- 1280px 최종 실물: [한국어 상세](./final-ko-detail-1280-dark.jpg). 두 스토어 버튼, iOS 버전 단독 표기와 정보 위계 확인.
- 375px 밝은 테마·사이트 ‘아주 큰’ 글자: [실물](./ko-detail-375-light-verylarge.jpg). 제목·본문 가림과 수평 넘침 없음.
- 200% 텍스트 확대: **QA 전용 생성 산출물**의 `colors_and_type.css`에 `html{--type-scale:2!important}`를 일시 적용해 루트 글자 32px을 브라우저에서 실물 확인. KO/JA/EN 홈·상세 320px 6셀 모두 수평 넘침 0, 링크 존재. [375px 본문·CTA](./ko-detail-375-light-200pct-body.jpg). 이 CSS는 최종 재빌드로 제거했으며 `public/` 소스에는 변경 없음. 브라우저 자체의 텍스트 전용 확대 기능은 검증 도구가 제공하지 않아, 이 부분은 동등한 CSS 스케일 모사로 표기한다.
- 키보드 Tab 순서: 본문 건너뛰기 → 헤더 → 언어 → Apple → Google Play. 두 링크에 접근성 이름과 실제 목적지 URL 존재. 홈의 Bridge 카드 클릭은 실제 상세 화면으로 전환됨.
- 인앱 브라우저는 `target=_blank` 외부 링크 클릭에서 새 탭을 반환하지 않아 팝업 동작 자체는 관찰하지 못함. 그러나 같은 정확한 Apple URL과 Play 패키지 URL을 별도 탭에서 열어 공개 페이지를 확인했으며, 정적 href·`rel=noopener`와 키보드 초점을 확인함. 실제 사용자 Chrome의 새 탭 동작은 배포 후 확인 대상.

## 명령과 판정

- `npm test`: 123/123 PASS.
- `npm run build`: 133 pages PASS. 200% 임시 CSS 제거를 위해 최종 재실행.
- `npm run test:built`: 33 localized home/app pages, 144 store links 및 Draw/Focus 검증 PASS.
- `git diff --check`: PASS.
- 시각·문장·반응형: PASS (상기 화면 범위). 기능·접근성: PASS (내부 이동·링크·키보드; 외부 새 탭은 인앱 브라우저 제한). 실행물 일치: PASS (최종 재빌드 해시와 실물 캡처).
- 미검증: Android 실제 버전/최초 배포일, 외부 링크의 일반 Chrome 새 탭 행동. 따라서 두 사실은 웹 카피에 단정하지 않음.
- 배포 후 공개 `https://pifl-labs.com/ko/`, `/ja/`, `/en/` 및 Bridge 상세를 재확인할 것. 로컬 PASS만으로 운영 반영 완료라고 보고하지 않는다.
