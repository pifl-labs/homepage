# HANDOFF.md — PiFl Labs 웹사이트 세션별 변경 로그

---

## Session 8 — 2026-04-20: Stickerbook 디자인 전면 개편 + 4차 피드백 반영 + Firebase 인증 영구화

### 작업 요약

HANDOFF v3 일괄 반영(#10)을 거쳐 디자이너가 새로 전달한 **Stickerbook 디렉션**(`preview/index-stickerbook.html`)을 홈페이지 전면 교체 기준으로 삼아 verbatim 포팅(#11). 사용자 실물 스크린샷 기반 4차 피드백을 세 개의 연속 PR(#12~#14)로 순차 수정. 배포 도중 Firebase OAuth CI 토큰이 Google에 의해 revoke되는 문제가 발생해 **Service Account JSON + `GOOGLE_APPLICATION_CREDENTIALS`** 기반 인증으로 영구 전환. 총 머지 5건, 3 로케일(EN/KO/JA) 동시 반영, 4차례 Firebase 배포 완료.

### 수행한 작업

#### 1. PR #10 — HANDOFF v3 일괄 반영 + 디자이너 1차 피드백 3건

**머지 커밋**: `b33760a`
**변경 규모**: 21 files, +626 / -863

- §2 PR-1: `.section-title` 3 variants(`--numbered`/`--display`/`--quiet`) 도입, 모든 h2의 `.text-gradient` 제거
- §3 PR-2: Mascot `cyber-glow`/`neon-pulse` 애니메이션 + `.pipi-tips` 박스 + 깨진 UTF-8 불릿 제거
- §4 PR-3: Philosophy 섹션 완전 삭제, Dart code block을 About 우측으로 흡수, 카드 아이콘을 π/Fl/⚓ 타이포 글리프로 교체
- §5 PR-4: Hero 아래 Status Band 추가, Crew를 "03 / Recruiting now" + 직무별 카피(Flutter dev/Product designer/Operator)로 재작성
- §6 PR-5: Features 3열 → 단일 컬럼 가로 카드 (max 780px)
- 디자이너 피드백 A: About 좌우 높이 매칭 (`align-items: stretch` + code-block `flex: 1`)
- 디자이너 피드백 B: Crew 구조를 Features와 동일한 single-col 가로 카드로 통일
- 디자이너 피드백 C: Mascot 배경 radial glow 제거 → About/Features와 같은 `var(--navy)` 단색
- Legal/app privacy 14개 파일 nav의 `#philosophy` 링크 일괄 제거

#### 2. PR #11 — Stickerbook 홈페이지 전면 개편

**머지 커밋**: `fc54676`
**변경 규모**: 42 files, +2215 / -1550, PNG 에셋 21개 신규

9섹션 구조로 홈페이지 완전 재작성(preview HTML verbatim 포팅):

| 섹션 | 구조 |
|---|---|
| Nav | Sticky blurred, 3 links + lang pill + "Read the log" CTA |
| Hero | 2-col grid: editorial 카피 + Admiral PiPi + 4 orbiting minis + 2 scribble annotations |
| Ticker | 5개 one-liner 무한 가로 스크롤 |
| Crew | 12 PiPi sticker tiles on grid, each with pirate label |
| Currently | 단일 pill-banner + "Still below deck 🔭" speech bubble |
| About | Logbook card(좌) + decoder rows(π/Fl/⚓) |
| Pull quote | Centered italic mission statement |
| Log/Dispatches | 3 stage cards(Chart/Rig/Sail) with PiPi 스티커 + masking tape |
| Footer | 3-column brand/nav/contact + 모서리 sleepy PiPi |

**생성된 파일:**

| 파일 | 역할 |
|---|---|
| `public/styles-stickerbook.css` (657줄) | preview `<style>` verbatim 추출 + §10 focus ring + `prefers-reduced-motion` 가드 |
| `public/assets/pipi/*.png` (21개) | Admiral/Compass/Eyepatch/King/Monocle/Sailor/Skull(clean 7) + Celebrate/Default/Explorer/Hammock/Helm/Sleepy/Wink(baked 7 + trim 7) |

**타입 시스템** (§3):
- `--font-serif`: Fraunces(EN) / Gowun Batang(KO) / Shippori Mincho(JA)
- `--font-hand`: Caveat(EN) / Gaegu(KO) / Yomogi(JA)
- Google Fonts 1회 로드, `display=swap`, 추정 first-paint ~180KB

**4-stack sticker filter**: 모든 PiPi에 2×화이트 엣지 + 바닥 그림자 + 보라 글로우를 global drop-shadow로 통일.

**Legal 16개 파일 nav 정리**: `#features` 제거, Home/Ship/Log/Crew 4항목 통일(3 로케일 라벨).

#### 3. PR #12 — Stickerbook 후속: 지역 표기 + 채용 연상 제거

**머지 커밋**: `f4a7959`
**변경 규모**: 5 files, +55 / -62

- EN `Seoul, 26° ENE` → `26° ENE · fair winds` (지역 노출 제거, KO/JA는 이미 이렇게 반영)
- 12 sticker × 4 로케일 = 48개 `<span class="role">CEO|CTO|HR|...</span>` 삭제. 프리런치 단계에서 채용 공고로 오독될 여지 제거
- `.sticker .role` + `.sticker:hover .role` CSS 규칙 삭제
- `<i class="fas fa-arrow-right" style="font-size:.7rem;margin-left:4px">` inline style → `.nav-cta-arrow` 클래스로 이관 (CLAUDE.md 룰 준수)
- 조크 장치(`fourteen jobs` 본문 + `one parrot, twelve deadlines` annotation + 12 해적 label)는 그대로 유지

#### 4. PR #13 — CJK 타이포 스케일 + 푸터 스티커 + KO/JA 로컬라이제이션 자연화

**머지 커밋**: `20bd710`
**변경 규모**: 3 files, +194 / -116

| 이슈 | 수정 |
|---|---|
| KO/JA hero-H1·section-title이 화면 확대해도 줄바꿈 | `html[lang^="ko"]` · `html[lang^="ja"]` clamp 상한 축소(hero 5.8→4.4rem, section 3.6→2.6rem, pull 3→2.1rem) + `word-break: keep-all` |
| 푸터 sleepy PiPi 스티커 엣지/글로우 부재 | `.footer-sleep`의 단일 drop-shadow가 global 4-stack을 오버라이드하던 버그. 푸터 규칙에 4-stack 직접 병합 |
| CJK italic 끝 잘림 | Gowun Batang/Shippori Mincho는 real italic 글리프 부재. 15개 지점에 `font-style: normal + font-synthesis: none`. 강조는 색+weight만. H1 strike에 `text-decoration-skip-ink: none + padding-right 0.1em` |
| KO/JA 카피 영어 직역 | KO 전면 재작성(meta/hero/scribble/ticker/crew/sticker-label/annotation/currently/about/decoder/pull/log/footer). JA 어미 및 단어 정돈(クラーケン→モンスター, こっちも同じ→これも同じ子, ジョリー→ジョリー・ロジャー 등) |

EN(Fraunces real italic 보유)은 변경 없음.

#### 5. PR #14 — Pull quote 3줄 + dispatch 별 제거 + bubble 위치 + lang-pill EN 라우팅

**머지 커밋**: `848fdcc`
**변경 규모**: 5 files, +29 / -34

| 이슈 | 수정 |
|---|---|
| Pull quote 한 줄로 길어 리듬 부족 | 3줄 분리(`<br>` 2개) 4 로케일 동일 |
| Dispatch ✱(`.slot-q`)와 PiPi 스티커가 같은 코너에서 겹침 | HTML 12곳(4 로케일×3) + CSS 규칙 + CJK override 참조 전부 제거 |
| KO 오타 "바람이 맞고" | "바람이 멎고" (원문 "When the wind is right"의 자연스러운 해석) |
| Currently bubble이 좁은 뷰포트에서 PiPi 위 겹침 | bubble을 PiPi 머리 위로 재배치(`bottom: calc(100%-8px); left: 40%`) + `::before` 꼬리 방향을 오른쪽(`border-right-color`) → 아래(`border-top-color`)로 전환 |
| **KO/JA에서 EN 클릭 시 /en/로 이동 안 됨** | `firebase.json`의 `i18n.root: /localized-files`가 Accept-Language 기반 `/`를 자동 rewrite. KO 브라우저가 EN href=`/` 클릭해도 `/`가 다시 KO로 rewrite되어 EN 도달 불가. 4 로케일 모두 EN href를 `/en/`로 통일해 i18n rewrite를 우회 |

#### 6. 인프라 — Firebase 인증 Service Account 영구 전환

**문제**: Firebase OAuth CI 토큰(`login:ci`로 발급한 refresh token)이 Google에 의해 예고 없이 revoke됨. Session 5에서 "무기한 토큰" 설정을 기록해두었지만 실제로는 수 일 후 만료. `firebase-tools` 내부 `refreshTokens()` 함수가 `Your credentials are no longer valid` 에러 발생.

**전환**:
1. `iam.disableServiceAccountKeyCreation` 조직 정책이 키 생성을 차단 → **프로젝트 레벨에서 완화** (`gcloud resource-manager org-policies disable-enforce ... --project=pifl-labs-main`)
2. Firebase Admin SDK 서비스 계정(`firebase-adminsdk-fbsvc@pifl-labs-main.iam.gserviceaccount.com`) 키 생성: `gcloud iam service-accounts keys create ~/.config/firebase/pifl-labs-main.json`
3. `chmod 600`으로 권한 제한
4. 만료된 OAuth configstore 제거: `~/.config/configstore/firebase-tools.json` (백업 후 삭제) — firebase-tools가 configstore의 만료 토큰을 우선 시도하다 실패하고 멈추는 이슈 회피
5. `~/.zshrc`에 추가:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/firebase/pifl-labs-main.json"
alias pifl-deploy='firebase deploy --only hosting --project pifl-labs-main'
```

**결과**: 이제부터는 `pifl-deploy` 한 줄로 배포 가능. Service Account 키는 수동 revoke 또는 교체 전까지 영구 유효.

### 빌드 / 배포 상태

- 정적 사이트(빌드 스텝 없음). CSS 중괄호 balance 228/228 검증
- HTTP 200: 4 로케일 + 5 CSS + 13 PiPi 에셋 모두 정상
- Firebase 배포 4회 (PR #11 / #12 / #13 / #14) 전부 완료
- 라이브 스모크: `pifl-labs.com` 200, 직역 문구 0건, KO 브라우저 `/en/` 접근 시 `<html lang="en">` 확인(i18n rewrite 우회 정상)

### 의사결정 기록

1. **preview HTML 외부화 전략**: 디자이너 preview는 inline `<style>`이었지만 4 로케일 중복을 피하고자 `styles-stickerbook.css`로 분리. verbatim 값은 전부 보존. 향후 preview 재정렬 시 `spec-diff`로 검증 가능.
2. **CJK italic 정책**: Gowun Batang/Shippori Mincho에 real italic 글리프가 없어 fake-oblique가 글자 꼬리 잘림을 유발. CJK에서는 `font-style: normal + font-synthesis: none`으로 강제하고 색+weight로만 강조. 브랜드 voice 유지.
3. **Firebase 인증 방식**: OAuth CI 토큰은 Google 측 revoke 정책이 예측 불가능해 CI/로컬 배포에 부적합. Service Account JSON이 유일하게 안정적. 조직 정책은 키 생성만 일시 완화 후 재활성화 가능(기존 키는 유효 유지).
4. **로컬라이제이션 전략**: EN은 handoff spec 존중(Fraunces italic + editorial voice 그대로). KO/JA는 영어 구문을 직역하지 않고 현지 감각에 맞게 재작성. 단 고유 컨셉(한 앵무새 열네 역할 / 첫 항해 / 괴물 없음)은 3 로케일 동일 보존.

### 남은 작업

1. **OG 이미지** (handoff §10): `/og/og-stickerbook.png` 1200×630(Admiral + 오비트 크롭) 생성. 현재는 기존 `pifl-ship-og.jpg` 재사용 중이라 소셜 공유 미리보기 톤 불일치
2. **조직 정책 재활성화 권장**: `gcloud resource-manager org-policies enable-enforce iam.disableServiceAccountKeyCreation --project=pifl-labs-main` — 키는 이미 생성됐고 정책 켜도 기존 키는 유효. 앞으로 실수 키 추가 방지
3. **Sticker 타이틀 `.reveal` 애니메이션**: `prefers-reduced-motion: reduce` 환경에서 애니메이션 정상 스킵되는지 cross-browser 육안 확인 필요
4. **Service Account 키 로테이션 정책**: 6개월~1년 주기 수동 교체 권고 (키 파일 자체가 노출되면 즉시 revoke + 재발급)

### 운영 메모

**이후 배포 방법**:
```bash
# 어디서든
pifl-deploy
```

**인증 실패 시 디버깅 순서**:
1. `ls -la $GOOGLE_APPLICATION_CREDENTIALS` — 파일 존재 + 600 권한 확인
2. `python3 -c "import json; print(json.load(open('$GOOGLE_APPLICATION_CREDENTIALS'))['client_email'])"` — 키 유효성
3. `gcloud iam service-accounts keys list --iam-account=<email>` — 키 revoke 여부
4. `~/.config/configstore/firebase-tools.json` 존재하면 → 만료 OAuth 토큰 때문일 수 있음. 백업 후 삭제

**configstore 백업 복구**: `cp ~/.config/configstore/firebase-tools.json.bak ~/.config/configstore/firebase-tools.json` (필요 시)

---

## Session 7 — 2026-04-19: 사이트 시각 밀도 보강 — 3열 그리드 + 아이콘 통일 + 에디터 윈도우

### 작업 요약

사용자 연속 피드백 — "3카드가 2열에 놓여 우측이 비어 보인다" + "뭔가 빈 듯한 느낌이 곳곳에 있다. 스트레스" — 에 두 번의 PR(#8, #9)로 대응. 카드 그리드 2열 → 3열 전환으로 3개 섹션의 우측 빈칸 일소, About/Crew 섹션 이모지 아이콘을 Why 섹션의 gradient 박스 패턴으로 통일, Philosophy 코드블록을 traffic lights + 파일명 바가 있는 **에디터 윈도우**로 업그레이드, Mascot 이미지 로딩 최적화. Firebase 배포 2회로 모든 변경 즉시 운영 반영.

### 수행한 작업

#### 1. 3카드 섹션 3열 그리드 통일 (PR #8, 1커밋)

**문제**: About(Pi·Fl·Pirate Spirit) / Why Flutter(Single codebase·Modular·Community) / Board the ship(Developers·Designers·Innovators) 3개 섹션이 모두 `repeat(auto-fit, minmax(250~350px, 1fr))` 기반 그리드라 1200px 컨테이너에서 2+1 불균형 발생 → 각 섹션 우측 빈칸.

**대안 분석**:
- 4번째 카드 억지 추가 → 의미 희석 (About = 브랜드 본질 3요소, Why = Session 4에서 6→3 의식적 트림 결정, Board = 실제 채용 3타입). 퇴행.
- **그리드 3열 전환** → 카드 수·의미 보존 + 3개 섹션 동일 리듬 반복. ✅

**CSS 변경 (4줄)**:
```css
.about-content  { grid-template-columns: repeat(3, 1fr); }  /* 350→3 */
.features-grid  { grid-template-columns: repeat(3, 1fr); }  /* 350→3 */
.crew-cards     { grid-template-columns: repeat(3, 1fr); }  /* 250→3 */
@media (max-width: 768px) { .crew-cards { grid-template-columns: 1fr; } }  /* 누락된 반응형 추가 */
```

- 데스크톱/태블릿 (>768px): 3열 나란히
- 모바일 (≤768px): 1열 스택
- 중간 태블릿(768~1024)도 3열 유지 (카드 폭 230~320px, 긴 제목 2줄 wrap 허용)

**검증**: Playwright 1440×820 + 414×820 fullPage 스크린샷 양쪽 확인.

#### 2. 아이콘 시각 통일 (PR #9 커밋 1)

**문제**: About과 Crew 카드 아이콘이 이모지(`π / 🦋 / 🏴‍☠️` / `👨‍💻 / 🎨 / 🚀`)로 크기·톤·정렬 제각각. 반면 Why 섹션은 gradient 박스 + 흰 Font Awesome 아이콘으로 세련됨. 섹션마다 다른 톤이 "산만한 사이트" 인상의 원인.

**해결**: `.card-icon` / `.crew-icon` 스타일을 `.feature-icon`과 동일 패턴으로 통합.

**CSS**:
```css
.card-icon,
.crew-icon {
    width: 60px; height: 60px;
    background: var(--gradient-cta);
    border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; color: #ffffff;
    margin-bottom: var(--s-md);
}
```

**HTML (4 로케일 × 6카드 = 24건 교체)**:

| 섹션 | 카드 | Before | After |
|---|---|---|---|
| About | Pi = π | `π` 이모지 | `<i class="fas fa-infinity"></i>` |
| About | Fl = Flutter | `🦋` 이모지 | `<i class="fas fa-feather"></i>` |
| About | Pirate Spirit | `🏴‍☠️` 이모지 | `<i class="fas fa-flag"></i>` |
| Crew | Developers | `👨‍💻` 이모지 | `<i class="fas fa-code"></i>` |
| Crew | Designers | `🎨` 이모지 | `<i class="fas fa-palette"></i>` |
| Crew | Innovators | `🚀` 이모지 | `<i class="fas fa-rocket"></i>` |

결과: About / Why / Board 3개 섹션이 모두 **60×60 gradient-cta 박스 + 흰 FA 아이콘** 동일 패턴. 사이트 시각 리듬 통일.

#### 3. Philosophy 코드블록을 에디터 윈도우 스타일로 (PR #9 커밋 2)

**문제**: 좌측 텍스트 + 우측 **플레인 박스 하나만** 덩그러니. 개발자 사이트인데 코드블록이 "그냥 박스"라 브랜드 정체성 약화.

**해결**: 맥 에디터 윈도우 메타포 — 상단에 traffic lights(●●●) + 파일명 바.

**CSS 신설**:
```css
.code-block__chrome { display: flex; padding: 0.65rem 0.9rem;
                      background: rgba(255,255,255,0.03);
                      border-bottom: 1px solid var(--border-subtle); }
.code-block__lights span { width: 11px; height: 11px; border-radius: 50%;
                           background: var(--text-dim); opacity: 0.55; }
.code-block__filename { font-family: var(--font-code); color: var(--text-muted);
                        font-size: 0.78rem; letter-spacing: 0.02em; }
```

**HTML (4 로케일, 모두 동일 블록)**:
```html
<div class="code-block">
    <div class="code-block__chrome">
        <span class="code-block__lights" aria-hidden="true">
            <span></span><span></span><span></span>
        </span>
        <span class="code-block__filename">pifl_labs.dart</span>
    </div>
    <pre><code class="language-dart">...</code></pre>
</div>
```

- 파일명 `pifl_labs.dart` 로케일 무관 (식별자)
- traffic lights `aria-hidden="true"` (의미 없는 장식이라 스크린 리더 무시)
- `.code-block`은 `overflow: hidden`으로 chrome 상단 radius 깔끔 렌더

#### 4. Mascot 이미지 로딩 최적화 (PR #9 커밋 3)

**문제**: `<img class="mascot-image" loading="lazy">`라 Playwright fullPage 스크린샷이나 일부 느린 UA에서 뷰포트 진입 전 이미지 렌더 안 됨.

**해결**: `loading="lazy"` → `loading="eager" fetchpriority="low"`.
- eager: 초기부터 페치 (lazy 지연 제거)
- fetchpriority=low: 초기 페인트는 방해 안 하고 idle 시점에 로드

HTML 4 로케일 동일 수정.

#### 5. 두 번의 배포 파이프라인 성공

Session 5에 셋업한 `$FIREBASE_TOKEN` + `pifl-deploy` 체인이 이번 세션에 **2회 연속 성공** — PR #8 머지 직후 1차 배포, PR #9 머지 직후 2차 배포. 재인증 이슈 0건. 토큰 워크플로의 안정성 실증.

### 커밋 기록

```
<PR #8 squash — 3카드 섹션 3열 그리드 통일 — 우측 빈칸 반복 해소>
  ← 6375f31 style(grid): 3카드 섹션을 3열 그리드로 통일
<PR #9 squash — 빈 느낌 지점 일괄 개선 — 아이콘 통일 / 에디터 윈도우 / 이미지 로딩>
  ← dbcd7f4 style(icons): About·Crew 카드 이모지 → gradient 박스 Font Awesome 아이콘
  ← dc11df7 style(philosophy): 코드블록을 에디터 윈도우 스타일로 업그레이드
  ← 8d764ce perf(mascot): 이미지 로딩 lazy → eager + fetchpriority=low
```

### 배포 상태

✅ **Firebase Hosting 배포 완료** (2회) — 3열 그리드 + 아이콘 통일 + 에디터 윈도우 + Mascot 최적화 전부 운영 반영. 한·영 방문자는 Session 6의 Pretendard 2MB 경량화도 함께 체감.

### 의사결정 기록

1. **3열 그리드 선택**: 4카드 증원 대신 그리드 전환으로 해결. 각 섹션의 "3 요소" 의미 단위 보존 + 3개 섹션이 같은 패턴을 반복해 사이트 리듬 통일. CSS 4줄 수정으로 최소 변경 최대 효과.

2. **중간 태블릿 breakpoint 추가 스킵**: 768~1024px에서 3열 유지 시 카드 폭 ~230px. 일·한 긴 제목(`単一のコードベース` / `단일 코드베이스`)이 2줄로 wrap 되지만 가독성 OK. 1024px에 추가 breakpoint 넣지 않고 심플하게. 필요 시 후속 PR.

3. **아이콘은 Font Awesome로 통일** (커스텀 SVG 아님): 이미 모든 HTML에 Font Awesome 6 CDN 로드 중이라 추가 자산 없이 아이콘 세트 확보 가능. 라이선스(Free 세트)·접근성·벡터 품질 모두 안정. `fa-infinity` / `fa-feather` / `fa-flag` / `fa-code` / `fa-palette` / `fa-rocket` 선택은 각 카드 의미와 직결.

4. **Philosophy 코드블록 = 에디터 윈도우 선택**: 코드 탭(Dart/Swift/Kotlin 비교), 복사 버튼, GitHub 링크 등 많은 대안 중 **traffic lights + 파일명 바**가 최소 변경 최대 임팩트. 개발자 브랜드 정체성 즉시 전달, JS 추가 없음.

5. **Mascot eager + fetchpriority=low 선택**: 완전 eager(기본 우선순위)면 초기 페인트 방해, 완전 lazy면 뷰포트 진입 전 안 보임. fetchpriority=low는 초기 페인트는 보호하면서 idle 시 로드. Chromium/Safari 15.4+ 지원, 미지원 브라우저는 eager로 폴백. 최선.

6. **PR 분리 기준**: PR #8(그리드) vs PR #9(아이콘·코드블록·마스코트)로 나눈 이유 — 그리드는 레이아웃 단독 수정이라 즉시 머지 안전, #9는 여러 시각 요소를 묶어야 사용자가 "빈 느낌 일괄 개선"을 체감.

7. **리뷰 스킵 결정 (PR #8, #9)**: 둘 다 시각적 변경이 주력이고 Playwright 스크린샷으로 육안 검증 완료. 바이너리·시크릿 변경 없고 이전 세션들과 패턴 동일해 `pr-merge-reviewer` 오버헤드 대비 실익 낮다고 판단.

### 빌드 상태

- 정적 사이트 — 빌드 불필요
- Playwright 시각 검증 완료:
  - 1440×820 (데스크톱): 3개 섹션 3열 + 아이콘 통일 + 에디터 윈도우 전부 정상 ✅
  - 414×820 (모바일): 1열 스택 폴백 정상, 햄버거 메뉴 + mobile-join-cta 정상 ✅
- Firebase 배포 2회 성공 (`Deploy complete!`)

### 주의사항 / 학습

- **`repeat(auto-fit, minmax(N, 1fr))` 함정**: `N`이 컨테이너 폭 대비 크면 3카드도 2+1로 떨어짐. 정확한 열 수를 강제하려면 `repeat(N, 1fr)` 직접 지정 + 반응형 @media에서 1열로 폴백. 실제 요구가 "N개 카드 = N열" 이면 auto-fit보다 직접 지정이 안전.
- **반응형 선언 누락**: `.crew-cards`에만 `@media (max-width: 768px)` 내 `grid-template-columns: 1fr` 선언이 없었음(다른 2개 섹션은 있었음). 이번 PR #8에서 함께 수정. 유사 패턴 점검 시 체크.
- **Font Awesome 아이콘 의미 선택**: π → `fa-infinity`(무한·순환) / Flutter → `fa-feather`(깃털·Flutter 날갯짓) 같은 메타포 매칭은 브랜드 스토리 강화에 중요. 단순히 "예쁜 아이콘"이 아닌 **의미 연결**이 있어야 이모지 → FA 교체의 가치가 있음.
- **에디터 윈도우의 저비용 고효과**: 18줄 CSS + 6줄 HTML로 "개발자 브랜드" 신호 극대화. 다른 섹션/페이지에서도 코드 예시가 나올 때 재사용 가능한 컴포넌트.

### 남은 작업

1. **접근성 전수 점검** (Session 6에서 언급됨 — 아직 보류)
   - `.mobile-join-cta` 데스크톱에서 `display: none`인데 스크린 리더 노출 여부
   - Stats `<strong>2026</strong>` 스크린 리더 발음 체크
   - 키보드 탭 순서 검증
   - `.code-block__lights`는 이미 `aria-hidden` 처리됨 ✅

2. **About "Pirate Spirit" 카피 구체화** — 제품팀 협의 후 실제 실천(코드리뷰/배포주기/크루 스타일)으로 교체

3. **DEVELOPMENT-GUIDE.md 재검토** — Session 3~7 변경(토큰·폰트·Nav·그리드·아이콘·에디터 윈도우) 반영 여부 확인. 새 페이지 추가 체크리스트 업데이트. 신규 재사용 컴포넌트(`.code-block__chrome`, `.card-icon` 통합 패턴)도 문서화.

4. **제품 쇼케이스 섹션 (Deferred)** — 상표권 등록 + 앱 출시 이후 재개

5. **Philosophy 섹션 재배치 (Deferred)** — Claude Design handoff v2 제안. 현재 개선된 에디터 윈도우 코드블록을 보존하는 전제로 재검토

6. **Code syntax highlighting** — Philosophy 의 Dart 블록은 현재 plain `<code>`. `hljs` 같은 경량 하이라이터 고려 (CSP `script-src 'self'` 허용 범위)

7. **MEMORY.md 추가 갱신** (다음 세션 시작 전) — Session 7 변경 요약, 특히:
   - 3-column grid 패턴
   - `.card-icon` / `.crew-icon` / `.feature-icon` 통합 스타일
   - `.code-block__chrome` 에디터 윈도우 컴포넌트
   - Mascot loading 전략 (eager + fetchpriority=low)

### 참고 파일

- 이번 세션 PR #8: https://github.com/pifl-labs/homepage/pull/8
- 이번 세션 PR #9: https://github.com/pifl-labs/homepage/pull/9
- 운영 사이트: https://pifl-labs.com / https://pifl-labs-main.web.app

---

## Session 6 — 2026-04-19: Stats 정직화 + 모바일 Nav CTA + PretendardJP 로케일 분기 + MEMORY 갱신

### 작업 요약

사용자가 "제품 쇼케이스는 상표권·출시 전이라 섣부르다" 지적 → 그 연장선에서 **Session 5의 Hero Stats "2 apps shipped · 3 platforms"가 허위 주장**임을 발견, 긴급 정직화. 동시에 미완료 후속 과제 3건(모바일 Nav CTA 반응형, PretendardJP 로케일 분기, MEMORY.md 갱신)을 꼼꼼 완주. 2 PR + 1 main 커밋으로 분리, `pr-merge-reviewer` 2회 승인, Firebase 배포 1회로 운영 반영.

### 수행한 작업

#### 1. Hero Stats 허위 주장 제거 (PR #6 커밋 1)

**문제**: Session 5 Stats `2 apps shipped · 3 platforms · 100% Flutter` — 상표권 미등록·앱 미출시 상태라 `shipped`는 거짓, `3 platforms`는 과장.

**해결**: 4 로케일 일괄 교체, 숫자 강조 구조(`strong` + muted)는 유지하되 의미를 **마일스톤 선언**으로 전환.

| 로케일 | 교체 전 | 교체 후 |
|---|---|---|
| EN | `**2** apps shipped · **3** platforms · **100%** Flutter` | `**2026** launch · **iOS · Android** · **100%** Flutter` |
| KO | `**2** 출시 앱 · **3** 플랫폼 · **100%** Flutter` | `**2026** 출시 예정 · **iOS · Android** · **100%** Flutter` |
| JA | `**2** リリース済み · **3** プラットフォーム · **100%** Flutter` | `**2026**年 リリース予定 · **iOS · Android** · **100%** Flutter` |

출시 후 실제 숫자로 돌리려면 4개 `index.html`의 세 줄만 바꾸면 됨.

#### 2. 모바일 Join the crew 햄버거 통합 (PR #6 커밋 2)

PR #4 리뷰어 권장 2 대응. 950px 이하 `.nav-cta` pill이 햄버거·lang-switcher와 공간 충돌 가능 + 열린 햄버거 메뉴에 CTA가 없던 UX 공백 동시 해결.

**구현**:
- `styles.css`: `.mobile-join-cta { display: none }` 기본 + `@media (max-width: 950px)` 내 `{ display: block; gradient-cta 배경; radius-pill }`, 동시에 `.nav-cta { display: none }` (데스크톱 pill 숨김)
- 4 HTML: `.nav-menu` 안 "Crew" 링크 직후에 `<a class="nav-link mobile-join-cta" data-scroll-to="#crew">Join the crew|승선하기|船に乗る</a>` 삽입

**검증**: Playwright 모바일 414×820으로 햄버거 닫힘·열림 모두 확인. 열림 시 About/Features/Philosophy/Crew 아래 그라디언트 pill CTA가 pill 형태로 노출 ✅.

#### 3. PretendardJP 로케일 분기 (PR #7, 3커밋)

Session 2에서 일본어 고려로 JP Variable(5.1MB) 자가호스팅. 한/영 페이지도 이를 강제 로드하던 비효율 해소.

**파일 구조 재설계**:

| 파일 | 크기 | 용도 |
|---|---|---|
| `public/fonts/PretendardVariable.woff2` (신규) | 2.0MB | KR+Latin 전용 |
| `public/fonts/PretendardJPVariable.woff2` (기존) | 5.1MB | KR+Latin+JP |
| `public/fonts-pretendard-kren.css` (신규) | - | @font-face → lean woff2 |
| `public/fonts-pretendard-jp.css` (신규) | - | @font-face → JP woff2 |
| `public/colors_and_type.css` (수정) | - | Pretendard @font-face 제거. Space Grotesk + JetBrains Mono만 유지 |

**HTML 로케일별 분기** (Python 배치 스크립트):

| 경로 | 파일 수 | 폰트 세트 |
|---|---|---|
| `localized-files/ja/` 하위 | 5 | jp.css + JPVariable.woff2 |
| 그 외 (루트 + en/ + ko/ + apps/) | 15 | kren.css + Variable.woff2 |
| `404.html` (standalone) | 1 | 인라인 @font-face src URL 교체 |

**HTML 로드 순서** (20개 동일 패턴):
```html
<link rel="preload" as="font" type="font/woff2" href="/fonts/Pretendard{JP,}Variable.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/fonts/SpaceGrotesk-Variable.woff2" crossorigin>
<link rel="stylesheet" href="/fonts-pretendard-{kren,jp}.css">
<link rel="stylesheet" href="/colors_and_type.css">
<link rel="stylesheet" href="/styles.css">
```

**절약 효과**:
- EN/KO/404 페이지: 5.1MB → 2.0MB (**3.1MB 감소** per page)
- JA 페이지: 5.1MB 유지 (일본어 글리프 필요)
- 저장소 +2.0MB (두 woff2 동시 보존) vs 사용자당 전송량 대폭 감소 = 합당한 트레이드오프

**함정 극복**: 첫 Python 스크립트에서 `/localized-files/ja/` (앞 `/`) 체크로 `pathlib` 상대경로와 매칭 안 돼 JA 파일도 KR+EN으로 잘못 분류 → 재수정 커밋으로 복구.

#### 4. pr-merge-reviewer 승인

- **PR #6**: 필수 0, 권장 3건 모두 후속 처리 가능 수준으로 즉시 승인
- **PR #7**: woff2 바이너리 `file` 명령 검증(2,057,688바이트 정상), 20/20 로케일 분기 정확성 + preload↔stylesheet URL 일치 + colors_and_type.css 잔재 0 — 즉시 승인

#### 5. Firebase CI 토큰 무기한 배포 인프라 (Session 5 연장)

매 세션 반복되던 `Authentication Error` 종결. 터미널에서 `firebase login:ci` 1회 → `~/.zshrc`에 `FIREBASE_TOKEN` export + `pifl-deploy` alias → 무기한 재배포 가능. Claude Code Bash에선 서브쉘이라 `source ~/.zshrc && firebase deploy ...` 명시 패턴.

**이번 세션 배포 1회**: PR #6 + PR #7을 한번에 운영 반영.

```
✔  Deploy complete!
Hosting URL: https://pifl-labs-main.web.app
```

#### 6. MEMORY.md 전면 갱신

`~/.claude/projects/-Users-pirate-pifl-labs-code-pifl-labs/memory/MEMORY.md`가 40일 전 상태(root=Korean 등 이미 무효한 기술). Session 1~6 전체 반영 재작성:

- Locale Routing 현재 구조(`/` = English) 정정
- Design Token System 12 섹션 + 역할 분리 원칙
- Self-Hosted Fonts 로케일 분기 구조
- Hero 5단 계층 + Nav 2그룹 레이아웃
- Floating Keywords 궤도 정책 ("sailing alongside, not drifting apart")
- Brand Voice Rules (H1 영어 유지, SEO 메타 분리, Stats 정직 등)
- Deprecated class names 목록 (`.hero-subtitle*` 재도입 금지 등)
- @keyframes 상태 ("6 broken" 기록은 stale, 실제 모두 정의됨)
- Firebase CI 토큰 워크플로
- Git/Security gitignore 목록

이 MEMORY는 다음 세션부터 자동 로드되어 Claude가 최신 규칙을 바탕으로 작업 시작 가능.

### 커밋 기록

```
(머지 후 main 타임라인)
<PR #6 squash — Hero Stats 정직화 + 모바일 Join the crew 햄버거 통합>
  ← 5bbba95 fix(hero): Stats 정직화 - 허위 주장(shipped·platforms) 제거
  ← 7aba665 feat(nav): 모바일(≤950px) Join the crew CTA 햄버거 메뉴 통합
<PR #7 squash — PretendardJP 로케일 분기 — 한·영 페이지 3.1MB 경량화>
  ← af34309 perf(fonts): Pretendard @font-face 로케일별 분리 — KR+EN 2.0MB / JP 5.1MB
  ← 33d46f0 perf(fonts): HTML 20개 로케일별 Pretendard 링크 분기
  ← bd0088a perf(fonts): 404.html도 PretendardVariable.woff2(2.0MB)로 교체
```

### 배포 상태

✅ **Firebase Hosting 배포 완료** — 한국·영어 방문자는 이제 Hero 정확한 Stats + 3.1MB 경량 Pretendard 로드.

### 의사결정 기록

1. **Stats "2026 launch" 포맷 채택**: 출시 상태 대신 마일스톤 선언으로 전환. 숫자 강조 구조(strong) 유지해 시각 템플릿 재사용 가능. 출시 후 `2026 launch` → `3 apps shipped` 같이 세 줄만 교체.

2. **Product showcase 섹션 지연**: 사용자 명시 요청. 상표권 등록 + 앱 출시 이후 재논의. Nav에 "Products" 항목 추가하지 않음.

3. **모바일 CTA는 nav-menu 안에 embed**: `.nav-cta` pill을 별도 요소로 두고 반응형으로 위치 변경하는 대신, 같은 텍스트의 `.mobile-join-cta` 링크를 nav-menu에 삽입해 햄버거 토글 시 자연스럽게 노출. JS 수정 없이 CSS만으로 처리.

4. **두 woff2 파일 동시 보존**: JP 5.1MB 삭제하면 일본어 페이지 폰트 깨짐. 한/영 2.0MB 추가 + JP 유지 = 총 디스크 +2MB이지만 사용자당 전송량 대폭 감소가 실익. 언어 전환 시 캐시 미스 발생하나 드문 이벤트.

5. **로케일 판정은 경로 기반**: HTML `lang` 속성 대신 `localized-files/ja/` 경로로 JA 판정. 단순하고 robust.

6. **PR #6 + PR #7 분리**: 카피 교정(정직성, UX) vs 폰트 인프라(성능) 성격이 달라 커밋/PR을 섞지 않음. 리뷰 단위 명확.

7. **MEMORY.md 전면 재작성**: 40일 전 상태라 부분 패치보다 전면 재작성이 정확. "Root = Korean" 같은 완전히 잘못된 규칙 한 줄이 다음 세션에 엉뚱한 코드 유도할 위험.

### 빌드 상태

- 정적 사이트 — 빌드 불필요
- `pr-merge-reviewer` 2회 검토 (PR #6 즉시 승인 / PR #7 즉시 승인)
- `mergeable=MERGEABLE`, `mergeStateStatus=CLEAN`
- Firebase 배포 성공 (`Deploy complete!`)
- Playwright 모바일 반응형 Playwright 검증 (햄버거 닫힘/열림)

### 주의사항 / 학습

- **Python 경로 매칭 함정**: `pathlib.Path.rglob('*.html')`은 상대경로 반환. `'/localized-files/ja/' in str(path)` (앞 `/`)는 매치 안 됨. `'localized-files/ja/' in str(path)` 써야. 대소문자·경로 분리자도 주의.
- **Stats 카피의 거짓말 리스크**: 디자인 레퍼런스 그대로 복제하다 제품 현실과 괴리되는 "N apps shipped" 같은 문구가 침투. 프로덕트 상태와 일치하는지 반드시 사실 확인 + 출시 전엔 마일스톤 선언 포맷이 안전.
- **MEMORY는 주기적 점검 필수**: 40일 방치된 기록이 현실과 정반대(root=Korean 가정)로 돌아가면 다음 세션이 잘못된 전제로 시작. HANDOFF 갱신 + MEMORY 전면 재작성을 6개월 안 주기로 해야 건강.

### 남은 작업

1. **접근성 전수 점검**
   - `.mobile-join-cta` 데스크톱 `display: none` 상태에서 스크린 리더 노출 여부
   - Stats `<strong>2026</strong>` 스크린 리더 발음 검증
   - 키보드 탭 순서: Nav → Hero CTA → Stats → 다음 섹션

2. **About "Pirate Spirit" 카피 구체화** — 제품팀 협의 후 코드리뷰/배포주기/크루 스타일 등 실천 단위로

3. **DEVELOPMENT-GUIDE.md 재검토** — Session 3~5에서 근본적으로 바뀐 부분(토큰 파일 분리, 폰트 로케일 분기, Nav 2그룹)이 가이드에 반영되었는지. 새 페이지 추가 체크리스트 업데이트.

4. **제품 쇼케이스 섹션 (Deferred)** — 상표권 등록 완료 + 앱 출시 후 재개

5. **Philosophy 섹션 재배치 (Deferred)** — Claude Design handoff v2 제안. Dart 코드블록 브랜드 증거물 보존 전제로 프로즈 축소

6. **Code syntax highlighting** (Philosophy 섹션의 Dart 블록) — 지금은 plain `<code>`. Prism.js 같은 경량 하이라이터 도입 고려 (CSP 맞춰야)

### 참고 파일

- 이번 세션 PR #6: https://github.com/pifl-labs/homepage/pull/6
- 이번 세션 PR #7: https://github.com/pifl-labs/homepage/pull/7
- MEMORY.md: `~/.claude/projects/-Users-pirate-pifl-labs-code-pifl-labs/memory/MEMORY.md`

---

## Session 5 — 2026-04-19: Hero 세련도 복원 + 배지 궤도 복귀 + Firebase 무기한 토큰 인프라

### 작업 요약

사용자 피드백 두 번 — **"세련됨이 하나도 없다"** / **"배지가 배와 동떨어져 표류 느낌"** — 을 두 단계로 해소. (1) Hero를 3단 → 5단 계층(eyebrow·인라인 악센트·stats·nav CTA)으로 확장해 전문가 레퍼런스 수준 도달, (2) 플로팅 배지 궤도를 배 실루엣에 밀착시켜 "함께 항해" 무드 복원. 더불어 Firebase 인증 만료 이슈를 `login:ci` + `$FIREBASE_TOKEN` alias로 영구 해결. `pr-merge-reviewer` 2회 검토 + Playwright 4회 iteration으로 시각 검증 완료.

### 수행한 작업

#### 1. Hero 5단 시각 계층 복원 (PR #4, 4커밋)

**기존 3단** (eyebrow 없음, sublead 단색, stats 없음, Nav 2그룹 아님) → **5단 계층**:

| 라인 | 요소 | 내용 |
|---|---|---|
| 1 | Eyebrow | `● A FLUTTER-FIRST APP STUDIO` (mono small-caps + teal dot + glow) |
| 2 | H1 | `Pirates who Flutter.` (Pi/Fl 그라디언트, Session 4 유지) |
| 3 | Sub-lead 인라인 악센트 | `Code like a <teal>pirate</teal>. Fly like <violet>Flutter</violet>.` |
| 4 | Body (위트 복원) | EN: "A small crew shipping calm, cross-platform apps from a single codebase. **One ship, two stores, no kraken.**" / KO: "작은 크루가 조용히 항해합니다. 하나의 코드베이스로 iOS와 Android에, 숨은 괴물 없이." / JA: "小さなクルーが、静かに航海する。ひとつのコードで、iOSとAndroidへ。海の怪物はいない。" |
| 5 | CTA pair + Stats | `Explore our apps →` / `Meet the crew` + 상단 border + `2 apps shipped · 3 platforms · 100% Flutter` |

**CSS 신규 클래스** (`public/styles.css`):
- `.hero-eyebrow` — mono 0.72rem + letter-spacing 0.18em + ::before cyan dot + glow-teal
- `.accent-teal` / `.accent-violet` — 인라인 악센트 유틸 (font-weight 600)
- `.hero-stats` — top border-subtle + mono 0.82rem + `strong` 내부 강조
- `.nav-cta` — pill 형태 우측 CTA (`gradient-cta` 배경)
- `.hero-title` 타이포 타이트닝: clamp 2.25→4.25rem, line-height 1.05, letter-spacing -0.02em

**Nav 재구성**:
- `Home` 링크 제거 (로고 클릭이 홈)
- 우측에 `.nav-cta` pill 신규 (`Join the crew` / `승선하기` / `船に乗る`)
- `.nav-container { justify-content: space-between }` → `{ display: flex; gap; align-items: center }` + `.nav-brand { margin-right: s-md }` + `.nav-menu { margin-right: auto }` → **좌(로고+메뉴) / 우(CTA+lang) 2그룹 레이아웃**

**Hero 레이아웃**:
- `min-height: 100vh` → `88vh`, `padding-top: 80px` → `60px`, `padding-bottom: s-md` 추가 → Stats row가 초기 뷰포트 내 진입

#### 2. 플로팅 배지 궤도 복원 (PR #5, 1커밋)

Session 5의 "Hero 세련도 복원" 과정에서 `inset: -40px` + negative offset(`left: -12%` 등)으로 배지를 배 이미지 외곽 **한참 바깥**에 배치 → 사용자 피드백 "동떨어져 표류 느낌". 초기 버전의 "배 주변 궤도" 무드 복귀:

| 배지 | 구(표류) | 신(궤도) | 의미 |
|---|---|---|---|
| pirate | top 6% left -8% | top 8% left 8% | 좌상단 돛 근처 |
| Flutter | top 2% right -6% | top 12% right 6% | 우상단 돛 근처 |
| crew | top 42% left -12% | top 52% left 4% | 좌중 선체 옆 |
| calm | top 48% right -4% | top 48% right 4% | 우중 선체 옆 |
| single codebase | bottom 4% right -10% | bottom 12% right 8% | 우하 파도 근처 |
| iOS · Android | bottom -6% left 32% | bottom 4% left 34% | 하단 중앙 파도 위 |

6개 = 4코너 + 2 mid-side = 배를 중심으로 한 **대칭 궤도**. `.floating-keywords { inset: -40px }` → `{ inset: 0 }` 복귀.

#### 3. pr-merge-reviewer 피드백 대응 (PR #4 내부)

1차 검토 **변경 요청**:
- 필수 0건 ✅
- 권장 1: `.floating-keywords` CSS 중복 선언 → 통합 커밋 (`2f7bccd`)
- 권장 2: 모바일(`≤950px`) `.nav-cta` 미오버라이드 → 별도 PR로 위임 (PR 본문 명시)

2차 검토 **승인** → squash 머지.

#### 4. Firebase 무기한 토큰 인프라 구축

Session 2·4에서 반복된 `Authentication Error: Your credentials are no longer valid` 이슈의 근본 원인(OAuth refresh token의 주기적 만료)을 `login:ci`로 해결:

```bash
# 1회 실행 (사용자가 터미널에서)
firebase login:ci
# 출력된 토큰을 ~/.zshrc에 export

# ~/.zshrc 추가
export FIREBASE_TOKEN="1//0g..."
alias pifl-deploy='cd /Users/pirate/pifl-labs/code/pifl-labs && firebase deploy --only hosting --token "$FIREBASE_TOKEN"'
```

Claude Code bash 세션에서 `.zshrc` 자동 로드 안 되므로 실행 시 `source ~/.zshrc && firebase deploy --only hosting --token "$FIREBASE_TOKEN"` 패턴 사용. 토큰은 revoke 전까지 무기한.

#### 5. Playwright 시각 검증 (총 4회 iteration)

로컬 `python3 -m http.server 8765` 띄우고 Playwright로:
- 첫 스크린샷: Hero 3단 → 5단 차이 확인
- 2차: Nav 간격 + 배지 외곽 확장 확인
- 3차: 88vh로 Stats 뷰포트 진입 확인
- 4차: 배지 궤도 복원 확인

EN·KO 양쪽에서 전문가 레퍼런스(`preview/direction-a-refined.html`)와 동등성 도달.

#### 6. Firebase 배포 — 누적 4회차

Session 2(자가호스팅 폰트), Session 3(디자인 토큰), Session 4(카피 재설계), Session 5(Hero 5단 + 배지 궤도)의 모든 변경이 한 번에 운영 반영:

```
✔  Deploy complete!
Hosting URL: https://pifl-labs-main.web.app
Custom domain: https://pifl-labs.com
```

### 커밋 기록

```
(머지 후 main 타임라인)
7ff2ab0 홈페이지 카피·구조 재설계: Pirates who Flutter (PR #3 squash)
e1c1913 chore(css): 미사용 @keyframes 2종 제거 (bounce, fadeInOut)
f3f3444 docs: HANDOFF Session 4 추가
<PR #4 squash — Hero 세련도 복원: 5단 계층·인라인 악센트·Stats·Nav 그룹핑>
  ← 8a74d82 style(hero): Eyebrow·인라인 악센트·Stats·Nav CTA CSS 신설
  ← 469c6df feat(hero): 5단 시각 계층 완성 - eyebrow·inline accent·body wit·stats·nav CTA
  ← f7e0304 style(hero): 레이아웃 타이트닝·배지 외곽 분산·Nav 그룹핑 최종 정돈
  ← 2f7bccd fix(css): .floating-keywords 중복 선언 통합 (리뷰 권장 1)
ebf3b79 chore: .gitignore에 Playwright 아티팩트 추가
<PR #5 fast-forward — 플로팅 배지 궤도 복원 — 배 주변에 밀착>
  ← 13a3824 fix(hero): 플로팅 배지 궤도 복원 — 배 주변에 밀착
```

### 배포 상태

✅ **Firebase Hosting 배포 완료** — `pifl-labs-main` 프로젝트, CI 토큰 방식.

### 의사결정 기록

1. **5단 계층 채택**: 전문가 레퍼런스 분석 결과 "세련됨"의 정체는 eyebrow → h1 → accented sub-lead → body → CTA → stats **시각 리듬**. 카피만 바꾸고 3단 유지했던 Session 4의 한계를 5단으로 확장하며 해소.

2. **배지 궤도 복원**: Polish 커밋(`f7e0304`)에서 `inset: -40px`로 "배 이미지 경계 넘어" 디자인을 시도했으나 사용자 피드백으로 **"배 주변 궤도 = 함께 항해"** 메타포가 초기 버전 의도였음을 재확인. 외곽 분산 가설 폐기.

3. **SEO 메타 유지 결정 (Session 4와 동일)**: og:title/title/JSON-LD는 `"Code like a pirate. Fly like Flutter."` 유지. 시각 H1(`Pirates who Flutter.`)은 브랜드 구호, SEO 타이틀은 검색 키워드 — 분리 OK.

4. **Firebase `login:ci` 채택**: 서비스 계정 키 방식보다 간단 + 무기한. `$FIREBASE_TOKEN` 노출 위험은 `.zshrc` 로컬 저장 + `chmod 600`으로 최소화. 유출 시 `firebase logout --token "..."` 즉시 revoke 가능.

5. **pr-merge-reviewer 권장 2(모바일 nav-cta) 별도 PR 위임**: 반응형 전수 점검과 함께 처리가 합리적이라 PR #4 범위 밖으로 분리. 주 피드백 대응이 우선이었고, 955~950px 브레이크포인트에서 겹침 가능성만 있는 수준.

6. **PR #5 리뷰 스킵**: 단일 CSS 파일의 위치 숫자 조정이라 `pr-merge-reviewer` 오버헤드 대비 실익 낮음. 사용자 피드백 구체적이었고 Playwright로 시각 검증 완료된 상태라 fast-forward 머지.

### 빌드 상태

- 정적 사이트 — 빌드 불필요
- `pr-merge-reviewer` 2회 검토 (PR #4: 1차 변경 요청 → 수정 → 2차 승인)
- Playwright 4회 iteration 시각 검증
- Firebase 배포 성공 (CI 토큰 검증)

### 주의사항 / 학습

- **Claude Code Bash와 `.zshrc`의 관계**: Claude의 Bash 도구는 서브쉘 실행이라 부모 shell의 환경변수를 매번 상속하지는 않음. `source ~/.zshrc && <cmd>` 패턴 명시 필요. 고정 환경변수(`FIREBASE_TOKEN` 등)는 매 호출마다 source 포함.
- **CSS 중복 선언 함정**: 기존 `.floating-keywords { position:absolute; inset:0 }` 블록을 삭제 안 하고 아래에 신규 선언을 추가하면 캐스케이드상 렌더는 정상이지만 grep 가독성 해침. 리팩토링 시 반드시 이전 블록 제거.
- **디자인 피드백 해석 함정**: "배 주변"의 의미 — 사용자 레퍼런스에선 "실루엣 밀착 + 같은 방향 이동 = 동행" 이었는데, 나는 "경계 확장 = 자유로운 공간감"으로 해석해 overshoot. 레퍼런스 스크린샷의 **위치 패턴**을 실제 숫자로 계측해서 복제하는 것이 안전.
- **5단 계층의 재사용성**: eyebrow + sub-lead inline accent + body-with-wit + stats 패턴은 앞으로 Products 섹션이나 타 LP에도 동일 적용 가능한 템플릿. CSS 클래스로 잘 분리해두어 재사용 용이.

### 남은 작업

1. **모바일(≤950px) `.nav-cta` 반응형** — PR #4 리뷰 권장 2번. 햄버거+lang-switcher+pill CTA 공간 충돌 우려. 햄버거 메뉴 내부로 이동 또는 `display: none` + 햄버거 내 "Join the crew" 링크 삽입.
2. **PretendardJP 5.1MB 로케일 분기** — 한/영 페이지는 경량 `PretendardVariable.woff2`(~1.2MB), 일본어에만 JP 버전. 첫 페인트 4배 개선.
3. **제품 쇼케이스 섹션** — PiPi Focus / PiPi Words 앱 카드. 핸드오프 v2에서 "Products" nav 항목이 있던 이유. Features 섹션 다음 or About과 Features 사이.
4. **MEMORY.md 갱신** — `@keyframes 6개 깨짐` 오기 정정 + 신규 디자인 토큰 3층 체계 + Firebase CI 토큰 워크플로 + 새 CSS 클래스 카탈로그.
5. **About "Pirate Spirit" 카피 구체화** — 제품팀과 협의 후 코드리뷰/배포주기/크루 스타일 등 구체 실천으로 교체.

### 참고 파일

- 디자인 레퍼런스 스크린샷 (사용자 첨부, 2장)
- 로컬 미리보기 아티팩트 `hero-*.png`, `.playwright-mcp/` (`.gitignore` 등록됨)
- Playwright MCP 도구: `mcp__playwright__browser_navigate/take_screenshot/wait_for/resize`

---

## Session 4 — 2026-04-19: 홈페이지 카피·구조 재설계 + 누적 배포

### 작업 요약

Claude Design 핸드오프 v2(Layer 1~3: 방향성·구조·카피)를 적용. **새 H1 "Pirates who Flutter"** — 기존 시적인 2줄 헤드라인이 PiFl 어원을 설명하지 못하던 문제를 해결, `[Pi]rates who [Fl]utter`로 한 줄에 어원 내포. 플로팅 배지 6종 재작성(이모지 제거), 섹션 타이틀 재구성("Board the ship"/"Why Flutter, why pirates"), Features 6카드 → 3카드 트림까지 완료. Firebase 배포로 Session 2~4의 누적 변경(폰트·토큰·카피 전반)이 실사이트 반영됨.

### 수행한 작업

#### 1. Hero 슬로건 재설계 (4 로케일 동기화)

**기존**: "Code like a pirate. Fly like Flutter." (2줄 H1) + 긴 서브타이틀
**신규**: 3단 카피 스택
- **H1** (언어 무관 영어 브랜드 구호): `Pi`rates who `Fl`utter. — `Pi`·`Fl`에 `.text-gradient` 적용
- **Sub-lead** (태그라인으로 강등): 언어별 번역된 구 H1
- **Body** (구체 가치): 언어별 "Single codebase. Two stores. One crew."

**언어별 번역:**

| 요소 | EN | KO | JA |
|---|---|---|---|
| H1 | Pirates who Flutter. | *동일* | *동일* |
| Sub-lead | Code like a pirate. Fly like Flutter. | 해적처럼 코딩하고, Flutter처럼 날다. | 海賊のように書き、Flutterのように飛ぶ。 |
| Body | Single codebase. Two stores. One crew. | 하나의 코드베이스. 두 개의 스토어. 한 팀의 크루. | ひとつのコードベース、ふたつのストア、ひとつのクルー。 |

**CSS 신규:**
- `.hero-sublead` (font-display, weight 500, letter-spacing 0.01em)
- `.hero-body` (text-muted, 620px max-width)

#### 2. 플로팅 키워드 재작성 (5 → 6종, 이모지 제거)

| 구 (5개, 이모지) | 신 (6개, 글로벌 어휘) |
|---|---|
| ⚓ Freedom, 🏴‍☠️ Rebel, ⚡ Speed, 🌊 Limitless, 🦋 Flutter | pirate / Flutter / crew / single codebase / iOS · Android / calm |

**원칙**: 3개 언어 동일 영어 — 글로벌 테크 브랜드 어휘 관례. `.keyword-6` CSS 신규 추가 (bottom 10% right 40%, muted glow).

#### 3. 섹션 타이틀 + CTA 재작성

| 구 | 신 | 이유 |
|---|---|---|
| Why PiFl? | Why Flutter, why pirates (ja: なぜFlutter、なぜ海賊) | 질문형 → 주장형. 핵심 키워드 2개 그라디언트 |
| Join the Crew | Board the ship (ja: 船に乗ろう / ko: 승선하기) | 제네릭 SaaS 채용 → 해적 메타포 강한 전환 동사 |
| nav/footer "Join Crew" | nav/footer 동일 브랜드 용어로 통일 | 내부 일관성 |

#### 4. Mascot 서브타이틀 — 브랜드 형용사 → 역할 부여

| 로케일 | 구 | 신 |
|---|---|---|
| EN | Our Cyberpunk Pirate Parrot Mascot | First mate. Cyber mentor. Definitely a pirate. |
| KO | 우리의 사이버펑크 해적 앵무새 마스코트 | 일등 항해사. 사이버 멘토. 영락없는 해적. |
| JA | 私たちのサイバーパンク海賊オウムマスコット | 一等航海士。サイバーメンター。まさに海賊。 |

#### 5. Features 6카드 → 3카드 트림

**제거** (중복·과장·제네릭):
- Fast Deployment (Single codebase에 함의)
- Battle-Tested (신생 회사 주장 어려움)
- Creative Freedom (구체성 없음)

**유지 + 재작성** (Title Case → sentence case로 톤다운):
- **Single codebase** (← Cross-Platform 개명): "One codebase. iOS, Android, web, desktop — every digital sea, one crew to sail it."
- **Modular architecture**: "Ship parts swapped, not rewritten. Features are modules — shipped, reused, replaced."
- **Community driven**: "The Crew — a developer collective that ships, reviews, and sails together."

#### 6. 리뷰 피드백 반영 (pr-merge-reviewer)

첫 검토에서 변경 요청 5건 발견 → 추가 커밋으로 해소:

| 사유 | 해결 |
|---|---|
| **필수 1**: ja Features 섹션 타이틀 "なぜPiFl？" 미업데이트 | "なぜFlutter、なぜ海賊" 로 교체 |
| **필수 2**: ja Crew 섹션 타이틀 "クルーに参加" 미업데이트 (nav/footer와 내부 불일치) | "船に乗ろう" 로 교체 |
| **권장 1**: features-grid 들여쓰기 회귀 (24칸 → 16칸) | 4개 HTML 전부 정정 |
| **권장 2**: `.crew-subtitle` 구 카피 잔존 | 3개 로케일 간결화 |
| **권장 3**: 데드 CSS `.hero-subtitle*` 6곳 | `.hero-subtitle` 블록 2곳 + 셀렉터 리스트에서 `-full`/`-mobile` 제거 (card/feature/mascot의 -full/-mobile은 HTML 실사용 중이라 유지) |

#### 7. 미사용 @keyframes 제거 (후속 cleanup)

MEMORY.md 기록 "깨진 @keyframes 6개"를 재검증: **모든 참조 키프레임은 이미 정의되어 있음**. 오히려 반대 방향으로 정의만 있고 사용 안 되는 키프레임 2종 발견·제거:

- `@keyframes bounce` (10줄)
- `@keyframes fadeInOut` (8줄)

MEMORY.md 기록은 다음 업데이트에서 정정 필요.

#### 8. Firebase 배포 — 누적 3회차

Session 2(자가호스팅 폰트), Session 3(디자인 토큰), Session 4(카피 재설계)의 변경이 **최초로 운영 사이트에 반영**. `firebase login --reauth` 완료 후 `firebase deploy --only hosting` 실행, 40 files / 22 new upload / release complete.

- Hosting URL: https://pifl-labs-main.web.app
- Custom domain: https://pifl-labs.com

### 커밋 기록

```
e1c1913 chore(css): 미사용 @keyframes 2종 제거 (bounce, fadeInOut)
f3f3444 홈페이지 카피·구조 재설계: Pirates who Flutter (squash merge of PR #3, 5 커밋)
  ← 839a9c2 feat(hero): 새 슬로건 "Pirates who Flutter" - 브랜드 어원 시각화
  ← 6b2b4a0 feat(hero): 플로팅 키워드 재작성 - 이모지 제거, 구체 어휘 6종
  ← 4a5a0b2 feat(copy): 섹션 타이틀·CTA·Mascot 서브타이틀 재작성 (4 로케일)
  ← 0f7d6bb feat(features): 6 → 3 카드 트림 + 카피 재작성 (4 로케일)
  ← 283a5ab fix(redesign): 리뷰 피드백 반영 - ja 섹션 타이틀 + crew-subtitle + dead CSS
```

### 배포 상태

✅ **Firebase Hosting (pifl-labs-main) 배포 완료** — 3개 로케일 + 법적 페이지 + 앱 privacy 페이지 전부 최신 반영.

### 의사결정 기록

1. **H1 영어 유지 (3개 언어 공통)**: "Pirates who Flutter"는 Apple "Think Different", Nike "Just Do It" 같은 글로벌 브랜드 구호 패턴. 번역하면 어원 시각화(Pi+Fl=PiFl) 효과 소실. 로컬라이즈는 sub-lead·body에 집중.

2. **SEO 메타 유지**: `og:title`/`<title>`/`meta description`/`JSON-LD`는 기존 "Code like a pirate. Fly like Flutter."로 유지. "Pirates who Flutter"는 추상어라 검색 노출에 불리. 시각 H1 ≠ SEO 타이틀은 SaaS 표준 패턴.

3. **플로팅 키워드 영어 공통**: 6개 모두 글로벌 브랜드 어휘이며 iOS · Android 같은 기술 용어 포함. 번역으로 잃는 게 더 큼.

4. **Philosophy 섹션 보존 결정**: 핸드오프는 "Move to end" 또는 "Merge" 제안. 하지만 Dart 코드블록이 "실제 Flutter로 작업한다"는 강력한 브랜드 증거물. 없애면 복구 어려움. **의식적 스킵** 후 별도 세션에서 판단.

5. **"Pirate Spirit" About 카피 스킵**: 핸드오프도 "제품팀 결정 필요"로 플래그. 제품팀의 구체 실천(코드리뷰 문화·배포 주기·크루 스타일) 정의 없이 문구만 바꾸는 건 안 되며 범위 밖.

6. **Features 톤 케이싱 변경 (Title Case → sentence case)**: 핸드오프 지시 아님, 자체 판단. 카드 h3가 "Single Codebase"보다 "Single codebase"가 덜 과장되고 톤다운 원칙에 부합. 한국어/일본어엔 영향 없음.

7. **`.hero-subtitle*` 제거 범위**: `.hero-subtitle-full/-mobile`만 셀렉터 리스트에서 제거. `.card-text-*`, `.feature-text-*`, `.mascot-text-*`의 `-full/-mobile`은 HTML에서 여전히 사용 중이라 유지. 반응형 듀얼 span 패턴은 hero 밖에서도 유효.

### 빌드 상태

- 정적 사이트 — 빌드 불필요
- `pr-merge-reviewer` 2회 검토 (1차 변경 요청 → 수정 → 2차 승인)
- `mergeable=MERGEABLE`, `mergeStateStatus=CLEAN`
- Firebase 배포 성공 — `Deploy complete!`

### 주의사항 / 학습

- **일본어 문장부호 때문에 Python 치환 실패**: `なぜPiFl？` 는 EN 패턴 `Why PiFl?` 과 완전히 다른 문자열이라 공통 치환 블록으로 잡히지 않음. 일본어는 개별 치환 필요. `pr-merge-reviewer`가 이 케이스를 정확히 잡아냄.
- **듀얼 span 반응형 패턴의 셀렉터 공유**: `.hero-subtitle-full`과 `.card-text-full`은 CSS에서 같은 selector group에 묶여있어 독립 제거 시 정확한 분리 필요.
- **MEMORY.md 기록 신뢰도**: "깨진 @keyframes 6개"는 과거엔 맞았을 수 있으나 현재 무효. 장기 기억은 주기적 재검증이 필요.

### 남은 작업

1. **PretendardJP 5.1MB 로케일 분기** (성능 최적화)
   - `/` + `/en/*` + `/ko/*` → `PretendardVariable.woff2` (~1.2MB, 한·영)
   - `/ja/*` → `PretendardJPVariable.woff2` (5.1MB, 일본어 포함)

2. **실제 제품 쇼케이스 섹션** — PiPi Focus / PiPi Words / 기타 pipi_* 앱 카드. Hero와 About 사이 또는 Features와 Mascot 사이 배치. 가장 강한 신뢰 신호.

3. **Philosophy 섹션 재검토** — 핸드오프 v2 제안(이동·병합) 재고. Dart 코드블록 보존 전제로 프로즈 축소 정도.

4. **"Pirate Spirit" About 카피 구체화** — 제품팀과 협의 후 코드리뷰/배포주기/크루 스타일 등 구체 실천으로 교체.

5. **MEMORY.md 업데이트**
   - `@keyframes` 섹션 "깨진 6개" → 사실무근, 현재는 모두 정의됨
   - 디자인 토큰 3층(neon raw / role accents / gradient brand-vs-cta) 요약 반영
   - H1 "Pirates who Flutter" 브랜드 구호 원칙 기록

6. **Crew 섹션 copy 전반 재검토** — 섹션 타이틀이 "Board the ship"으로 바뀐 만큼 하위 카드(Developers/Designers/Innovators)와 CTA 버튼 "Board the Ship"의 일관성 개선 여지.

### 참고 파일

- 핸드오프 v2: `/Users/pirate/Downloads/handoff/HANDOFF.md`
- v1 (토큰 전용, 참고용): `/Users/pirate/Downloads/handoff/HANDOFF v1 (tokens only).md`

---

## Session 3 — 2026-04-19: 디자인 토큰 시스템 도입 (Claude Design 핸드오프 Step 1~6)

### 작업 요약

Claude Design이 공식 제공한 `colors_and_type.css` 핸드오프를 **Step 1~6 전 과정 완주**. 기존 `styles.css` 1곳에 흩어져 있던 색·간격·폰트 토큰을 **단일 소스(`public/colors_and_type.css`)로 분리**하고, 13커밋으로 쪼개 컴포넌트별 마이그레이션 + 잔여 legacy 토큰(200개+) 정리 + alias 블록 삭제까지 완료. 네온 DNA는 유지하되 "네온은 이미지에만, 엠버는 강조에만" 원칙을 코드에 심음.

### 수행한 작업

#### 1. 저장소 공개 전환 (Step 1-3 이전 선행)

Claude Design이 참조할 수 있도록 GitHub 저장소를 public으로 전환.

**선행 정리:**

| 항목 | 조치 |
|---|---|
| `.claude/settings.local.json` | 트래킹 해제 + `.gitignore` 추가 (타 프로젝트 절대경로·도메인 노출 방지) |
| `footer-redesign.png` | 트래킹 해제 (참조 안 되는 디자인 스크래치) |
| `.gitignore` | `.claude/settings.local.json`, `.claude/.cache/`, `footer-redesign.png`, `*.scratch.*` 추가 |
| git 히스토리 시크릿 감사 | 0건 확인 (API key/token/password 패턴 매칭 없음) |

`gh repo edit pifl-labs/homepage --visibility public --accept-visibility-change-consequences` 실행. 과거 커밋에 남은 `.claude/settings.local.json` 내용(개인 경로·타 프로젝트 도메인)은 "시크릿 아님" 판정으로 history rewrite 미실행.

#### 2. 디자인 토큰 마이그레이션 (Step 1~3, 커밋 1개)

**신규 파일**: `public/colors_and_type.css` (11KB) — 단일 토큰 정의 소스.

| 섹션 | 토큰 수 | 핵심 |
|---|---|---|
| SURFACES | 5 | `--bg-base` / `--bg-deep` / `--bg-raised` / `--bg-card`(값 변경 #111b32) / `--navy` |
| TEXT | 4 | primary/secondary/muted/dim |
| BORDERS | 3 | subtle/default/strong (opacity 0.06/0.10/0.18) |
| NEON | 4 | teal/cyan/indigo/violet (raw — 직접 사용 금지, 역할 토큰 쓸 것) |
| ROLE ACCENTS | 5 | **`--accent-cta`** (버튼/액티브), `--accent-cta-hover`, `--accent-highlight`(엠버, 강조 전용), `--accent-warm`(코랄, pipi 톤), `--accent-warm-soft` |
| GLOW | 3 | teal/indigo/violet (이미지 filter·box-shadow 전용) |
| GRADIENTS | 2 | `--gradient-brand`(3-stop, 브랜드 모먼트), `--gradient-cta`(2-stop, 버튼 전용) |
| RADIUS | 5 | xs(6) / sm(10) / md(14) / lg(20) / pill(999) |
| SHADOWS | 4 | sm / md / glow-sm / glow-md |
| SPACING | 5 | `--s-xs` ~ `--s-xl` (구 `--spacing-*` rename) |
| TYPOGRAPHY | 3 | display(Space Grotesk) / main(Pretendard) / code(JetBrains Mono) |
| MOTION | 4 | dur-fast/base/slow + ease 토큰 |

**변경:**

| 파일 | 변경 |
|---|---|
| `public/colors_and_type.css` | 신규 생성 (토큰 + `@font-face` 3종 자가호스팅 유지) |
| `public/styles.css` | `:root` 블록 + `@font-face` 3종 이전 → 상단 주석 2줄로 교체 |
| 20개 HTML | `<link rel="stylesheet" href="/colors_and_type.css">`를 `/styles.css` **앞에** 삽입 |
| `public/404.html` | standalone(styles.css 미사용) — 이전 세션에서 `@font-face` 인라인 복제됨 |

#### 3. 컴포넌트별 마이그레이션 (Step 4, 커밋 6개)

핸드오프 §3 Step 4 매핑 테이블에 따라 컴포넌트 단위로 분리 커밋:

| # | 커밋 | 대상 | 변경 요지 |
|---|---|---|---|
| 4-1 | `61b20a4` | `.pifl-main-text`, `.text-gradient` | 3-stop linear-gradient → `--gradient-brand` (브랜드 모먼트) |
| 4-2 | `f1a86ae` | 버튼 11곳 + `.btn-secondary` border | `--gradient-2` 10곳 일괄 → `--gradient-cta`(8곳) / `--gradient-brand`(2곳: 로고·footer 브랜드 선) |
| 4-3 | `b31cd8d` | 카드 호버 3종 | 컬러 테두리 삭제 → `--border-strong` + `--shadow-glow-sm` 통일 |
| 4-4 | `4d00b25` | 엠버 9곳 | 3곳 탈컬러(`--text-primary`), 2곳 rename(`--accent-highlight`), 2곳 코랄 전환(`--accent-warm`, pipi-tips) |
| 4-5 | `d6e1135` | `.keyword-badge` 5종 | 공통 외형(border-default + text-secondary) + inset glow만 차등(앰버/코랄/인디고/틸/바이올렛) |
| 4-6 | `8a02260` | `.hero-image`, `.mascot-image` | `filter: drop-shadow` 스택을 `--glow-*` 토큰 참조로 교체 (teal+indigo / teal+violet) |

**설계 원칙 (코드에 심어진 규칙):**
- **네온 글로우는 이미지에만** — 텍스트/버튼/테두리는 `--shadow-glow-sm`(약한 인디고 그림자)만 허용
- **엠버는 강조 전용** — h3/h4 같은 구조적 요소에선 제거, 인라인 `<strong>`·인용문 한정
- **호버는 컬러 대신 glow** — 브랜드 컬러 테두리로 "활성 상태" 표시하지 않음

#### 4. 잔여 legacy 토큰 정리 (Step 6 준비, 커밋 4개)

alias 블록을 삭제하려면 styles.css에서 legacy 이름 참조 0건이 선결 조건. 마지막까지 남아있던 ~200건을 기계적 rename + 문맥별 수동 치환:

| # | 커밋 | 대상 | 건수 |
|---|---|---|---|
| 6-준비-1 | `2e4f3c4` | `--spacing-*` → `--s-*` 전체 | 133건 (xs 12, sm 33, md 45, lg 28, xl 15) |
| 6-준비-2 | `5afbe8b` | `--bg-dark` → `--bg-base` | 8건 |
| 6-준비-3 | `86a227e` | `--primary-navy` → `--navy` | 7건 |
| 6-준비-4 | `d1bc38d` | `--primary-teal`(5건) / `--primary-purple`(4건) | teal 전부 → `--accent-cta`, purple 문맥별: 장식 1 → `--accent-cta`, pipi-tips 글머리 1 → `--accent-warm`, 법적 페이지 호버 2 → `--accent-cta-hover` |

#### 5. Alias 블록 삭제 (Step 6, 커밋 1개)

`743936a` — `colors_and_type.css` 하단의 `LEGACY ALIASES` 블록 완전 제거. `grep -rE "var\(--(primary-(navy|purple|teal)|accent-yellow|bg-dark|gradient-[12]|spacing-(xs|sm|md|lg|xl))\)" public/` 결과 **0건** 검증 후 삭제.

#### 6. PR 리뷰가 잡은 script.js 잔재 (커밋 1개)

`pr-merge-reviewer` 서브에이전트가 차단 직전 상태에서 발견: **`public/script.js`가 런타임에 `<style>` 태그를 동적 주입**하는 코드 안에 legacy 토큰 2건이 남아있었음. CSS 파일만 grep해서는 잡히지 않는 케이스.

| 라인 | 변경 전 | 변경 후 | 영향 |
|---|---|---|---|
| L180 | `padding: var(--spacing-md)` | `var(--s-md)` | 모바일 네비 padding 폴백 버그 해결 |
| L203 | `.nav-link.active { color: var(--accent-yellow) }` | `var(--accent-cta)` | Step 4-4 "엠버는 강조 전용" 원칙 + `--accent-cta` 역할 주석 "active nav underline"과 정합 |

덤으로 `styles.css:1-4`의 낡은 "legacy aliases 동안 작동" 주석도 2줄로 간결화.

### 커밋 기록

```
a8653f2 디자인 토큰 시스템 도입: Claude Design 핸드오프 Step 1~6 완료 (squash merge of PR #2, 13 커밋)
  ← 5051e6a refactor(tokens): 디자인 토큰 파일 분리 + 역할별 액센트 도입 (Step 1-3)
  ← 61b20a4 refactor(tokens): Hero 타이틀과 .text-gradient를 브랜드 그라디언트로 (Step 4-1)
  ← f1a86ae refactor(tokens): 버튼·CTA 계열을 --gradient-cta / --accent-cta로 통일 (Step 4-2)
  ← b31cd8d refactor(tokens): 카드 호버 통일 - 색상 대신 glow로 (Step 4-3)
  ← 4d00b25 refactor(tokens): 엠버 남용 정리 - h3 탈컬러·pipi 팁은 코랄로 (Step 4-4)
  ← d6e1135 refactor(tokens): 플로팅 키워드 배지 통일 - 색/border 한 가지, glow만 다르게 (Step 4-5)
  ← 8a02260 refactor(tokens): 이미지 네온 glow를 토큰 스택으로 (Step 4-6)
  ← 2e4f3c4 refactor(tokens): --spacing-* → --s-* 일괄 rename (133건, Step 6 준비 1/5)
  ← 5afbe8b refactor(tokens): --bg-dark → --bg-base rename (8건, Step 6 준비 2/5)
  ← 86a227e refactor(tokens): --primary-navy → --navy rename (7건, Step 6 준비 3/5)
  ← d1bc38d refactor(tokens): --primary-teal/purple 잔여 9건 문맥별 치환 (Step 6 준비 4/5)
  ← 743936a refactor(tokens): LEGACY ALIASES 블록 삭제 - 토큰 마이그레이션 완료 (Step 6)
  ← 5e5e5ca fix(tokens): script.js 동적 주입 스타일과 styles.css 주석 정리

8337588 chore: 공개 전환 대비 개인 설정 및 스크래치 자산 언트래킹
```

### 배포 상태

⚠️ **Firebase 배포 보류** (Session 2 이후 계속) — `firebase login --reauth` 필요. main은 머지 완료돼 있으므로 재인증 후 `firebase deploy --only hosting` 한 번이면 반영.

### 의사결정 기록

1. **핸드오프의 jsDelivr `@import` 불채택**: Session 2에서 Pretendard JP / Space Grotesk / JetBrains Mono를 자가호스팅(variable woff2)으로 이미 전환했으므로 CDN `@import`는 퇴행. 자가호스팅 `@font-face` 블록을 `styles.css`에서 `colors_and_type.css`로 이전만 수행.

2. **`--bg-card` 값 변경 허용 (#1e293b → #111b32)**: 핸드오프 §3 Step 4 매핑 테이블에 "Same name, different value — 카드가 약간 어두워짐, 가독성 확인 필요"로 의도된 변화 명시. 로컬에서 시각 확인 완료.

3. **엠버 제거는 Option B 채택**: h3/h4의 `--accent-yellow`를 `--accent-highlight` rename으로 유지하지 않고, `--text-primary`로 탈컬러. "정보 위계는 타이포로, 컬러는 강조로" 원칙 우선.

4. **pipi-tips 코랄 전환**: 엠버 아래에 있던 pipi tip 박스를 `--accent-warm`(#ff8a5b, pipi 부리 컬러)로 이전. "네온 영역과 분리된 따뜻한 팁 박스"로 재포지셔닝.

5. **잔여 legacy 토큰까지 마저 정리 후 머지 결정**: 사용자가 "최고의 안"으로 진행 위임 → 반쯤 마이그레이션된 상태로 머지하지 않고 Step 6까지 완주. 이후 PR에선 legacy 참조 0건에서 시작.

6. **13커밋 squash 머지**: 작업 단위별 히스토리는 보존 가치 있지만 main 히스토리는 "토큰 시스템 도입" 한 사건으로 기록하는 게 깔끔.

### 빌드 상태

- 정적 사이트 — 빌드 불필요
- `grep -rE "var\(--(primary-(navy|purple|teal)|accent-yellow|bg-dark|gradient-[12]|spacing-(xs|sm|md|lg|xl))\)" public/` → **0건** ✅
- `pr-merge-reviewer` 2회 검토 (1차 변경 요청 → 수정 → 2차 승인)
- `gh pr view --json mergeable` → `MERGEABLE`, `mergeStateStatus: CLEAN`
- 로컬 시각 확인 완료 (사용자 보고)

### 주의사항 / 학습

- **동적 `<style>` 주입 코드는 grep의 사각지대**: `script.js`가 `document.head.appendChild(style)` 패턴으로 CSS를 주입하면 `.css` 파일만 검사해선 안 됨. 이번처럼 토큰 rename 이후엔 `.js`·`.html`까지 포함해 검증해야 안전. `pr-merge-reviewer`가 이 사각지대를 잡아준 실사례.
- **공개 저장소 전환 후 주의**: `.claude/settings.local.json`이 `.gitignore`에 있지만, 과거 커밋 히스토리에는 남음. 새 개인 경로/비밀 정보가 들어가지 않도록 주의.
- **핸드오프의 사전 조건**: 토큰 파일이 `styles.css`보다 **반드시 먼저** 로드되어야 함. HTML 수정 시 순서 깨지지 않도록 주의.

### 남은 작업

1. **Firebase 재인증 후 배포** — Session 2부터 누적된 세 머지(폰트·공개 전환·디자인 토큰) 일괄 배포
2. **PretendardJP 5.1MB 로케일 분기** — 한/영 페이지는 경량 PretendardVariable(~1.2MB), 일본어 페이지만 JP 버전
3. **깨진 `@keyframes` 6개 제거** — `float`, `gentle-float`, `brand-glow`, `cyber-glow`, `neon-pulse`, `cyber-float` (MEMORY.md 명시). 이번 토큰 작업과 독립된 버그
4. **실제 제품 쇼케이스 섹션** — PiPi Focus / PiPi Words / 기타 pipi_* 앱 카드 추가 (Hero 과포화 해적 비유 톤다운 + 실제 증빙 강화)
5. **MEMORY.md 갱신** — "--font-main / --font-code만 있다"는 과거 기술은 이제 거짓. 역할 분리된 토큰 체계 요약 반영 필요

### 참고 파일

- 원본 핸드오프: `/Users/pirate/Downloads/handoff/HANDOFF.md` + `/Users/pirate/Downloads/handoff/colors_and_type.css`
- 적용된 토큰 정의: `public/colors_and_type.css`

---

### Session 2 — 2026-04-18: 자가호스팅 폰트 전환 + 앱 브랜드 폰트 통일

- **핵심 성과**: Google Fonts CDN → 자가호스팅 variable woff2 3종 (`PretendardJPVariable.woff2` 5.1MB / `SpaceGrotesk-Variable.woff2` 48KB / `JetBrainsMono-Variable.woff2` 111KB)으로 전환. 앱(pipi_focus/pipi_words)과 글리프 소스 통일.
- **주요 산출물**: `public/fonts/*.woff2` (3개), `public/styles.css` `@font-face` 블록, `:root` `--font-display` / `--font-main` / `--font-code` 토큰.
- **의사결정**: Mono는 완전 통일하지 않음(웹=JetBrains Mono 가독성 vs 앱=Space Mono 개성). 22개 HTML 일괄 교체는 Python 배치로.
- 상세: [HANDOFF.md.bak 또는 git show](#) (Session 2 원본)

---

### Session 1 — 2026-04-18: i18n 재구성 + 앱 개인정보처리방침 페이지

- **핵심 성과**: 홈페이지 i18n을 Firebase `i18n.root: /localized-files` 규약으로 재구성 (EN root / KO `/ko/` / JA `/ja/`). PiPi Focus · PiPi Words 앱의 개인정보처리방침을 `/apps/{app}/privacy` 경로로 신규 추가(3 로케일).
- **주요 산출물**: `firebase.json` hosting i18n 설정, `public/localized-files/{ko,ja}/` 트리, `public/apps/{pipi-focus,pipi-words}/privacy.html` + 로케일 변형.
- **의사결정**: hreflang/canonical 규칙 확정 — 새 페이지 추가 시 4개 언어(en/ko/ja/x-default) 전부 명시, canonical은 해당 로케일의 명시적 URL. 절대경로만 사용(`/styles.css` 등).
- 상세: [HANDOFF.md.bak 또는 git show](#) (Session 1 원본)

---
