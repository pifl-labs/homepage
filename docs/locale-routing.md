# 언어별 홈페이지 진입 안정성

`functions/_middleware.ts`는 prefix 없는 홈페이지/앱 소개 URL을 ko/en/ja로 연결한다. `public/lang-detect.js`는 미들웨어가 없는 환경의 루트 진입 폴백이다.

- 유효한 기존 `pref-lang` 설정이 브라우저 언어보다 우선한다. 쿠키 이름·기간·속성은 유지한다.
- 쿠키의 잘못된 percent encoding은 무시하고 언어 감지를 계속한다. 진입 페이지를 HTTP 500으로 만들지 않는다.
- 서버는 지원하는 언어 태그의 `q`가 높은 순서로 선택한다. `q=0`과 잘못된 값은 제외하고, 동률이면 헤더 순서를 따른다. `en-US`는 영어, `english`는 지원하지 않는 태그다.
- 지원 언어가 없으면 기존 기본값 한국어로 안내한다. 전체 HTTP 언어 협상 구현이나 406 응답을 추가하는 변경은 아니다.
- 명시적 `/ko/`, `/en/`, `/ja/`, 앱 개인정보 페이지, 정적 자산, `/.well-known/`, `/go/` 경로는 그대로 통과한다.
- 리다이렉트는 기존 same-origin 경로와 query를 보존한다. 클라이언트 폴백은 쿠키 접근이 제한돼도 감지한 언어·캠페인 query·fragment를 유지한다.
- 새 분석 스크립트·쿠키·외부 요청·수집 항목을 추가하지 않는다. CSP, 스토어 링크, 앱 이름/아이콘, 앱 개인정보처리방침은 변경하지 않는다.

검증: Node.js 24의 내장 TypeScript type stripping으로 실제 middleware를 불러오는 `npm test`, `npm run build`, `npm run test:built`, 별도 로컬 Cloudflare Pages runtime의 실제 HTTP 회귀. 로컬 통과와 운영 반영은 별개다. 합성 요청으로 오류 재현이 가능하다는 사실이 실제 고객 손실이나 전환율 증가를 증명하지는 않는다.

근거: [RFC 9110 Accept-Language](https://www.rfc-editor.org/rfc/rfc9110.html#section-12.5.4), [Node.js TypeScript 지원](https://nodejs.org/api/typescript.html).
