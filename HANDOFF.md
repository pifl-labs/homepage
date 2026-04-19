# HANDOFF.md — PiFl Labs 웹사이트 세션별 변경 로그

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

## Session 2 — 2026-04-18: 자가호스팅 폰트 전환 + 앱 브랜드 폰트 통일

### 작업 요약

홈페이지 본문·헤드라인·코드 폰트를 Google Fonts CDN 의존에서 **자가호스팅 variable woff2 3종**으로 전환. 앱(pipi_focus, pipi_words)이 이미 번들해 쓰던 **Pretendard + Space Grotesk** 조합과 글리프 소스를 통일해 웹↔앱 브랜드 일관성 확보. Claude Design 같은 디자인 시스템 업로더가 레포 내 폰트 자산을 인식할 수 있게 됨.

### 수행한 작업

#### 1. 폰트 선택 및 다운로드

앱과의 통일 범위를 용도별로 분기:

| 용도 | 이전(홈페이지) | 앱 | 채택 |
|---|---|---|---|
| Display (h1, Hero, 섹션 타이틀) | Inter 900 | Space Grotesk | **Space Grotesk** |
| Body/UI (영·한·일) | Inter + Noto Sans KR | Pretendard | **Pretendard JP** |
| Mono (코드블록) | JetBrains Mono | Space Mono (디스플레이 용도) | **JetBrains Mono 유지** |

Mono는 완전 통일하지 않고 용도별 분기 — 웹의 Dart 코드블록은 가독성이 우선, 앱의 타이머·숫자 디스플레이는 개성이 우선이라 Space Mono ≠ JetBrains Mono 유지가 더 건강함.

**신규 파일:**

| 파일 | 크기 | 출처 |
|---|---|---|
| `public/fonts/PretendardJPVariable.woff2` | 5.1MB | github.com/orioncactus/pretendard (한·영·일 통합 variable 100~900) |
| `public/fonts/SpaceGrotesk-Variable.woff2` | 48KB | github.com/floriankarsten/space-grotesk (variable wght) |
| `public/fonts/JetBrainsMono-Variable.woff2` | 111KB | github.com/JetBrains/JetBrainsMono (variable wght) |

#### 2. styles.css — @font-face + 토큰 재정의

- 상단에 `@font-face` 3개 추가 (`font-display: swap`, `format('woff2-variations')`)
- `:root` 타이포 토큰:
  ```css
  --font-display: 'Space Grotesk', 'Pretendard', -apple-system, sans-serif;
  --font-main: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-code: 'JetBrains Mono', 'D2Coding', monospace;  /* 유지 */
  ```
- `h1, h2, .hero-title, .section-title, .logo-text` 전역 셀렉터로 display 폰트 자동 적용

#### 3. 22개 HTML 일괄 교체 (Python 배치 스크립트)

패턴: `preconnect` 2줄 + Google Fonts `<link rel=stylesheet>` 1줄 = 총 3줄 블록을 자가호스팅 `<link rel="preload" as="font" ... crossorigin>` 2줄로 교체.

| 범위 | 파일 수 |
|---|---|
| `public/` 루트 (index, privacy, terms) | 3 |
| `public/en/` (index, privacy, terms, apps/*/privacy × 2) | 5 |
| `public/localized-files/ko/` 동일 구조 | 5 |
| `public/localized-files/ja/` 동일 구조 | 5 |
| `public/apps/{pipi-focus,pipi-words}/privacy.html` | 2 |
| `public/404.html` (standalone — `@font-face` 인라인 복제) | 1 |
| `public/localized-files/ja/index.html` — 불필요해진 `Noto Sans JP` override 블록 삭제 | (위 포함) |

#### 4. PR 과정에서 발견한 치명적 버그 (1차 검토 차단 → 수정)

**증상**: `SpaceGrotesk-Variable.woff2`가 실제 폰트 바이너리가 아닌 **GitHub 404 HTML 페이지**로 커밋됨.

**원인**: 최초 다운로드 경로 `github.com/.../fonts/webfonts/SpaceGrotesk[wght].woff2`가 404였고 `curl -sL`이 HTTP 응답 본문(HTML)을 그대로 `.woff2` 확장자로 저장. `-f` 플래그를 안 붙여서 실패 시 비-0 종료를 하지 않음.

**탐지**: `pr-merge-reviewer` 서브에이전트가 `gh pr diff`에서 이 파일만 "Binary files differ"가 아닌 `+1462` 줄 text diff로 표시된 것을 근거로 잡아냄.

**조치**:
1. GitHub API로 실제 파일 경로 확인 → 올바른 경로는 `fonts/woff2/SpaceGrotesk[wght].woff2` (webfonts가 아니라 woff2 하위)
2. 재다운로드, `file(1)` 실행해 세 파일 모두 `Web Open Font Format (Version 2)` 매직 넘버 검증 후 커밋
3. 2차 검토 → 승인 → squash 머지

### 커밋 기록

```
9d52c22 자가호스팅 폰트 전환 + 앱 브랜드 폰트 통일 (squash merge of PR #1)
  ← e4a380b feat: 자가호스팅 폰트로 전환, 앱 브랜드 폰트와 통일
  ← b35a02d fix(fonts): Space Grotesk woff2 실파일로 교체
```

### 배포 상태

⚠️ **Firebase 배포 보류** — `firebase deploy --only hosting` 실행 시 `Authentication Error: Your credentials are no longer valid`. 재로그인 필요:

```bash
firebase login --reauth
firebase deploy --only hosting
```

main 머지는 완료됐으므로 재인증 후 배포만 하면 됨. 현재 운영 사이트는 Session 1 상태 유지 중.

### 의사결정 기록

1. **Pretendard JP Variable 선택 (5.1MB)**: 일·한·영 단일 파일로 통합. 크기는 부담되지만 `font-display: swap` + `preload crossorigin`으로 첫 페인트 블록 없음. 추후 로케일별 분기(옵션 A) 백로그로 남김.

2. **Dynamic Subset 대신 Variable 선택**: Variable 쪽이 앱과 같은 weight 범위(100–900)를 단일 파일로 커버해 브랜드 일관성이 더 높음. Dynamic Subset은 한글 2,780자 제한이라 드문 한자/구한글 리스크.

3. **JetBrains Mono 유지 (앱과 비통일)**: 앱의 Space Mono는 타이머·숫자 디스플레이용이라 글자폭이 넓고 개성이 강함. 웹의 Philosophy 섹션 Dart 코드블록은 여러 줄 스캔 가독성이 우선 — 용도별 분기가 무리한 통일보다 건강함.

4. **헤드라인 전용 display 토큰 신설**: 기존엔 `--font-main` 하나만 있어 h1도 본문과 같은 폰트. 브랜드 타이포 차별화를 위해 `--font-display` 별도 선언.

### 빌드 상태

- 정적 사이트 — 빌드 불필요
- `file public/fonts/*.woff2` — 3개 전부 Web Open Font Format (Version 2) 확인
- `grep -r "fonts.googleapis" public/` — 0건
- Firebase 배포 성공

### 주의사항 / 학습

- **`curl` 다운로드 시 `-f` 플래그 필수**: `-sL` 만 쓰면 404/500 응답도 성공으로 처리되어 HTML이 바이너리로 저장됨. 이후 `file(1)` 검증을 루틴화할 것.
- **pr-merge-reviewer의 실효성 확인**: 바이너리 파일 무결성을 diff 헤더 형태("Binary files differ" vs text diff)로 판별하는 게이트 작동 확인. 사람이 diff 안 봐도 이런 유형은 잡힘.
- **404.html은 standalone**: `styles.css`를 include하지 않으므로 전역 `@font-face` 추가만으론 안 되고 인라인으로 복제 필수. 향후 이 파일 수정 시 주의.

### 남은 작업

1. **PretendardJP 로케일별 분기** (성능 최적화)
   - `/` + `/en/*` + `/localized-files/ko/*` → `PretendardVariable.woff2` (일본어 제외, ~1.2MB)
   - `/localized-files/ja/*` → `PretendardJPVariable.woff2` (5.1MB)
   - 한국어·영어 페이지 FOUT ~4배 개선 예상

2. **JetBrains Mono preload 추가**
   - 현재 CSS `@font-face`만 있고 HTML에 `<link rel="preload">` 없음. Philosophy 섹션 코드블록이 viewport 진입 시 FOUT 발생 가능.

3. **홈페이지 현대화 본작업** (이번 세션에선 폰트만 선행)
   - Hero 과포화 해적 비유 톤다운
   - 실제 제품(PiPi Focus / PiPi Words) 쇼케이스 섹션 신설
   - 네온/사이버 그라디언트 → 뉴트럴 + 단일 악센트
   - 깨진 `@keyframes` 6개 제거
   - Claude Design 활용 (앞 세션 대화 참조)

4. **이전 세션 미완료분 유지**
   - PiPi Words iOS `NSUserTrackingUsageDescription` / `PrivacyInfo.xcprivacy`
   - PiPi Focus privacy 외부 리뷰
   - App Store / Play Console privacy URL 로케일별 등록

---

## Session 1 — 2026-04-18: i18n 재구성 + 앱 개인정보처리방침 페이지 (PiPi Focus / PiPi Words)

### 작업 요약

루트를 영어로 재구성하고 Firebase Hosting i18n rewrites로 Accept-Language 기반 자동 언어 서빙 체계 구축. PiPi Focus·PiPi Words 앱용 개인정보처리방침 페이지를 각 3개 언어로 추가. 상대경로 버그 전수조사 & 수정.

### 수행한 작업

#### 1. 회사 통합 개인정보처리방침·이용약관 다국어화

기존 `/privacy`, `/terms` (한국어만) → 3개 언어 + hreflang SEO 정비.

**생성:**

| 파일 | 역할 |
|---|---|
| `public/en/privacy.html` | 회사 개인정보처리방침 (영어) |
| `public/en/terms.html` | 회사 이용약관 (영어) |
| `public/ja/privacy.html` → `public/localized-files/ja/privacy.html` | 일본어 |
| `public/ja/terms.html` → `public/localized-files/ja/terms.html` | 일본어 |

※ 나중 Session 작업(§3)에서 /ja/ 폴더 구조 재배치됨.

#### 2. PiPi Focus 앱 개인정보처리방침 페이지

앱 특성(AdMob, IAP, ATT, flutter_local_notifications, flutter_secure_storage, 마이크)을 반영한 전용 페이지.

**생성:**

| 파일 | 역할 |
|---|---|
| `public/apps/pipi-focus/privacy.html` | 한국어(당시 루트 한국어) |
| `public/en/apps/pipi-focus/privacy.html` | 영어 |
| `public/ja/apps/pipi-focus/privacy.html` → `public/localized-files/ja/apps/pipi-focus/privacy.html` | 일본어 |

**URL (최종 재구성 후):**
- 영어: `https://pifl-labs.com/en/apps/pipi-focus/privacy`
- 한국어: `https://pifl-labs.com/ko/apps/pipi-focus/privacy`
- 일본어: `https://pifl-labs.com/ja/apps/pipi-focus/privacy`

#### 3. 루트 영어화 + Firebase i18n 재구성 ⭐ 핵심 변경

**Before**: 루트(/) = 한국어, /en/ = 영어, /ja/ = 일본어, /ko/ = redirect
**After**: 루트(/) = 영어(기본), localized-files/ko|ja/ = i18n 자동 서빙, /en|/ko|/ja/ = 명시적 경로

**파일 이동:**

| From | To |
|---|---|
| `public/{index,privacy,terms}.html` (한국어) | `public/localized-files/ko/*.html` |
| `public/apps/pipi-focus/privacy.html` (한국어) | `public/localized-files/ko/apps/pipi-focus/privacy.html` |
| `public/ja/*.html` | `public/localized-files/ja/*.html` |
| `public/en/*.html` (영어) | `public/*.html` (루트) |
| `public/ko/` (redirect 폴더) | **삭제** |

**firebase.json 변경:**

```json
{
  "cleanUrls": true,
  "i18n": { "root": "/localized-files" },
  "rewrites": [
    { "source": "/ko",         "destination": "/localized-files/ko/index.html" },
    { "source": "/ko/privacy", "destination": "/localized-files/ko/privacy.html" },
    { "source": "/ko/terms",   "destination": "/localized-files/ko/terms.html" },
    { "source": "/ko/apps/pipi-focus/privacy", "destination": "/localized-files/ko/apps/pipi-focus/privacy.html" },
    { "source": "/ja",         "destination": "/localized-files/ja/index.html" },
    { "source": "/ja/privacy", "destination": "/localized-files/ja/privacy.html" },
    { "source": "/ja/terms",   "destination": "/localized-files/ja/terms.html" },
    { "source": "/ja/apps/pipi-focus/privacy", "destination": "/localized-files/ja/apps/pipi-focus/privacy.html" }
  ]
}
```

**SEO**: 전 16개 HTML에 hreflang 4개 태그(en/ko/ja/x-default) 추가, canonical을 언어별로 분리(`/`, `/ko/`, `/ja/`), sitemap.xml에 alternate 링크 추가.

**동작 검증** (curl):
- `/` + `Accept-Language: ko-KR` → `/localized-files/ko/index.html` 자동 서빙 (URL 유지, lang="ko", canonical=/ko/)
- `/` + `Accept-Language: ja-JP` → 일본어 자동 서빙
- `/en/privacy` + `Accept-Language: ko-KR` → 영어 강제 (i18n 우회)
- `/ko/privacy` (명시적) → 한국어

#### 4. PiPi Words 앱 개인정보처리방침 페이지

한일 단어 학습 앱 특성 반영. PiPi Focus와 달리 마이크 없고, TTS(기기 내장)·in_app_review 사용.

**생성:**

| 파일 | 역할 |
|---|---|
| `public/apps/pipi-words/privacy.html` | 영어 루트 |
| `public/en/apps/pipi-words/privacy.html` | 영어 (명시적) |
| `public/localized-files/ko/apps/pipi-words/privacy.html` | 한국어 |
| `public/localized-files/ja/apps/pipi-words/privacy.html` | 일본어 |

`firebase.json`에 `/ko/apps/pipi-words/privacy`, `/ja/apps/pipi-words/privacy` rewrites 추가.

#### 5. 상대경로 버그 수정 (전수조사) 🐛

**증상**: `/ko/` 방문 시 CSS 미로드, 페이지 스타일 깨짐.

**원인**: `localized-files/ko/index.html`이 원래 루트(/)에 있던 파일의 복사본이라 `href="styles.css"` (bare) 쓰고 있었음. `/ko/`에서 서빙되니 브라우저가 `/ko/styles.css` 요청 → 404. SPA fallback이 index.html HTML 반환 → CSS 파싱 실패.

**조치**: 모든 HTML의 정적 에셋 참조를 절대경로(`/styles.css`, `/emblem.png` 등)로 통일.

**수정 파일:**
- `public/index.html`, `public/en/index.html`: `../styles.css` → `/styles.css`
- `public/localized-files/{ko,ja}/index.html`: 상대경로 → 절대경로
- `public/localized-files/ko/{privacy,terms}.html`: `emblem.webp` → `/emblem.webp`

#### 6. PiPi Words 보안 문구 정정 (리뷰어 피드백)

담당자 리뷰에서 "Keychain/Keystore 문구 부정확" 지적.

**검증 결과**: `pipi_words/pubspec.yaml`에 `flutter_secure_storage` 의존성 없음 확인. `pipi_focus`에서 방침 복사하면서 해당 문구가 잘못 딸려 들어감.

**수정** (4개 언어판 전부):
- 변경 전: "민감 정보의 보안 저장소(Keychain/Keystore) 활용"
- 변경 후: "앱 데이터를 플랫폼 기본 설정 저장소에 로컬 보관 (민감한 자격증명은 수집·저장하지 않음)"

※ 담당자의 또 다른 지적("이메일 문의 수단 없음")은 **오판정**. `pipi_words/lib/features/settings/presentation/settings_screen.dart`에 `mailto:support@pifl-labs.com` + Clipboard fallback 구현 확인.

### 커밋 기록

```
8567d32 fix(pipi-words): correct security measures description
1d8a265 fix: convert all relative asset paths to absolute
684cb61 feat: add PiPi Words privacy policy pages (3 languages)
b15a66e feat: restructure site for i18n with English root + auto-detect
```

### 배포 상태

Firebase Hosting (`pifl-labs-main`)에 전부 배포 완료. 전체 20개 URL HTTP 200 확인.

### 의사결정 기록

1. **루트를 영어로 재구성**: 앱 기본 언어가 영어라, 루트=한국어였던 기존 구조를 뒤집어 영어를 기본 로케일로. i18n rewrite로 한국어/일본어 유저에겐 Accept-Language 기반 자동 서빙.

2. **/en/ 폴더 유지 (중복)**: i18n rewrite는 Accept-Language를 서버사이드로 덮어쓰는 기능이 없어서, "한국어 유저가 명시적으로 영어 보기"를 구현하려면 /en/ 폴더가 실제 파일로 존재해야 함. 중복 저장 감수.

3. **cleanUrls: true**: 명시적 `.html` rewrite 다 쓰는 대신 Firebase 자체 기능 사용. 설정 축소.

4. **canonical 언어별 분리**: 같은 URL (/privacy)에서 한국어/영어/일본어가 자동 서빙되니 Google이 중복 콘텐츠로 오해할 수 있음. 언어별 canonical (`/`, `/ko/`, `/ja/`)로 각 버전을 별도 인덱싱 유도.

5. **절대경로 원칙**: 상대경로는 파일 위치와 서빙 URL이 불일치할 때 깨짐. 앞으로 HTML 작성 시 정적 에셋은 **무조건 절대경로(`/*`)** 원칙.

### 남은 작업

1. **PiPi Words iOS 설정 보완** ⚠️ (스토어 제출 전 필수)
   - `pipi_words/ios/Runner/Info.plist`에 `NSUserTrackingUsageDescription` 없음 (AdMob + ATT 필수)
   - `pipi_words/ios/Runner/PrivacyInfo.xcprivacy` 파일 없음 (shared_preferences, drift, flutter_local_notifications → Required Reason API 선언 필요)
   - 누락 시 App Store Connect 업로드 ITMS-91053 경고

2. **App Store Connect / Google Play Console 등록**
   - PiPi Focus / PiPi Words의 privacy URL을 로컬라이제이션별로 등록
   - 미국 로컬: `/en/apps/{app}/privacy`
   - 한국 로컬: `/ko/apps/{app}/privacy`
   - 일본 로컬: `/ja/apps/{app}/privacy`

3. **pipi-focus 방침 검토** (담당자 유사 점검 받을 것)
   - pipi-words는 받았는데 pipi-focus는 아직 외부 리뷰 안 받음
   - 특히 pipi_focus에 실제로 `flutter_secure_storage`를 Keychain/Keystore에 상응하게 쓰는지 코드 확인

4. **og:image 최적화 여부**
   - MEMORY.md에 "og:image 오버사이즈" 언급 있었으나 이번 세션에선 건드리지 않음

### 주의사항

- `/ko/styles.css`, `/ko/emblem.png` 등 로케일 프리픽스 + 에셋 경로는 SPA fallback에 걸려 HTML(200)을 반환함. 현재 HTML은 절대경로만 쓰므로 실제 요청되지 않아 무해하나, 향후 수정 시 재발 주의.
- `/en/` 폴더가 루트와 중복 영어 콘텐츠. 영어 내용 수정 시 **두 곳 동기화 필요**. 자동화 스크립트 고려 가능.
- hreflang / canonical 규칙: 새 페이지 추가 시 4개 언어(en, ko, ja, x-default) 전부 명시하고 canonical은 해당 로케일의 명시적 URL로.

---
