# PiFl Labs 개발 가이드

상세 페이지 추가 시 디자인/개발 일관성을 유지하기 위한 가이드.

---

## 1. 프로젝트 구조

### 현재 파일 구조
```
public/
├── index.html              ← 메인 (한국어, lang="ko")
├── en/index.html            ← 영어 (lang="en")
├── ja/index.html            ← 일본어 (lang="ja")
├── ko/index.html            ← /ko → / 리다이렉트 전용 (콘텐츠 없음)
├── 404.html                 ← 에러 페이지 (독립 스타일)
├── styles.css               ← 공유 스타일시트 (전 페이지 공통)
├── script.js                ← 공유 스크립트 (전 페이지 공통)
├── sitemap.xml
├── robots.txt
├── pifl-ship.png / .webp    ← 히어로 이미지
└── pipi-mascot.png / .webp  ← 마스코트 이미지
firebase.json                ← 호스팅 설정 (rewrites, headers, redirects)
```

### 새 페이지 추가 시 디렉토리 규칙

```
public/
├── blog/                    ← 블로그 (향후)
│   ├── index.html           ← 블로그 목록 (한국어)
│   └── {slug}/index.html    ← 개별 포스트
├── services/                ← 서비스 소개 (향후)
│   └── index.html
├── portfolio/               ← 포트폴리오 (향후)
│   └── index.html
├── en/
│   ├── index.html           ← 기존
│   ├── blog/index.html      ← 영어 블로그
│   ├── services/index.html
│   └── portfolio/index.html
└── ja/
    ├── index.html           ← 기존
    ├── blog/index.html      ← 일본어 블로그
    ├── services/index.html
    └── portfolio/index.html
```

**규칙:**
- 루트(`/`)는 한국어 기본 → 한국어 페이지를 루트에 배치
- 영어/일본어는 `/en/`, `/ja/` 하위에 동일 구조 미러링
- `/ko/`는 사용하지 않음 (루트로 301 리다이렉트)
- 모든 페이지는 `index.html` 파일로 생성 → URL이 `/blog/`처럼 깔끔

---

## 2. HTML 템플릿

### 새 페이지 기본 템플릿 (한국어 / 루트)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{페이지 제목} - PiFl Labs</title>
    <meta name="description" content="{페이지 설명 150자 이내}">
    <meta name="keywords" content="PiFl Labs, Flutter, {추가 키워드}">

    <!-- Canonical -->
    <link rel="canonical" href="https://pifl-labs.com/{path}/">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="{페이지 제목} - PiFl Labs">
    <meta property="og:description" content="{페이지 설명}">
    <meta property="og:url" content="https://pifl-labs.com/{path}/">
    <meta property="og:image" content="https://pifl-labs.com/{og-image}.png">
    <meta property="og:site_name" content="PiFl Labs">
    <meta property="og:locale" content="ko_KR">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{페이지 제목} - PiFl Labs">
    <meta name="twitter:description" content="{페이지 설명}">
    <meta name="twitter:image" content="https://pifl-labs.com/{og-image}.png">

    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;600&family=Noto+Sans+KR:wght@400;500;600;700;900&display=swap" rel="stylesheet">

    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer">

    <!-- Language Links -->
    <link rel="alternate" hreflang="ko" href="https://pifl-labs.com/{path}/">
    <link rel="alternate" hreflang="en" href="https://pifl-labs.com/en/{path}/">
    <link rel="alternate" hreflang="ja" href="https://pifl-labs.com/ja/{path}/">
    <link rel="alternate" hreflang="x-default" href="https://pifl-labs.com/{path}/">

    <!-- Styles -->
    <link rel="stylesheet" href="/styles.css">

    <!-- Structured Data (페이지 유형에 맞게 수정) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "{페이지 제목}",
        "url": "https://pifl-labs.com/{path}/",
        "isPartOf": {
            "@type": "WebSite",
            "name": "PiFl Labs",
            "url": "https://pifl-labs.com"
        }
    }
    </script>
</head>
<body>
    <!-- Navigation (공통) -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-brand">
                <a href="/" class="logo" id="logoHome">
                    <span class="logo-icon">⚓</span>
                    <span class="logo-text">PiFl Labs</span>
                </a>
            </div>
            <div class="nav-menu">
                <a href="/#home" class="nav-link">홈</a>
                <a href="/#about" class="nav-link">소개</a>
                <a href="/#features" class="nav-link">특징</a>
                <a href="/#philosophy" class="nav-link">철학</a>
                <a href="/#crew" class="nav-link">크루 모집</a>
                <!-- 상세 페이지용 추가 링크 -->
                <!-- <a href="/blog/" class="nav-link active">블로그</a> -->
            </div>
            <div class="lang-switcher">
                <a href="/en/{path}/" class="lang-btn">EN</a>
                <a href="/{path}/" class="lang-btn active">KO</a>
                <a href="/ja/{path}/" class="lang-btn">JA</a>
            </div>
            <div class="nav-toggle" id="navToggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </nav>

    <!-- Page Content -->
    <main>
        <!-- 페이지별 콘텐츠 -->
    </main>

    <!-- Footer (공통) -->
    <footer class="footer">
        <!-- index.html의 footer 구조를 그대로 복사 -->
    </footer>

    <!-- Scripts -->
    <script src="/script.js"></script>
</body>
</html>
```

### 영어/일본어 페이지 차이점

| 항목 | 한국어 (루트) | 영어 (/en/) | 일본어 (/ja/) |
|------|-------------|-------------|---------------|
| `<html lang=` | `"ko"` | `"en"` | `"ja"` |
| CSS 경로 | `/styles.css` | `../styles.css` 또는 `/styles.css` | `../styles.css` 또는 `/styles.css` |
| JS 경로 | `/script.js` | `../script.js` 또는 `/script.js` | `../script.js` 또는 `/script.js` |
| 이미지 경로 | `pifl-ship.webp` | `../pifl-ship.webp` 또는 `/pifl-ship.webp` | `../pifl-ship.webp` 또는 `/pifl-ship.webp` |
| og:locale | `ko_KR` | `en_US` | `ja_JP` |
| nav-link 텍스트 | 홈/소개/특징/철학/크루 모집 | Home/About/Features/Philosophy/Join Crew | ホーム/PiFlとは/特徴/理念/クルー募集 |
| Font | Noto Sans KR | Inter만 (KR 폰트 불필요) | Noto Sans JP |
| lang-btn active | KO | EN | JA |

**경로 권장**: 서브디렉토리가 깊어질 경우 상대경로(`../`)보다 **절대경로(`/styles.css`)**를 사용. 깊이에 관계없이 동작.

### 일본어 페이지 전용 폰트 오버라이드

JA 페이지에는 인라인 `<style>` 또는 별도 CSS에서 폰트 오버라이드:

```html
<!-- ja/index.html의 <head> 안 -->
<style>
    body { font-family: 'Inter', 'Noto Sans JP', sans-serif; }
</style>
```

향후 안정적인 방식으로 전환하려면 `styles.css`에 추가:
```css
html[lang="ja"] body {
    font-family: 'Inter', 'Noto Sans JP', sans-serif;
}
```

---

## 3. 디자인 시스템

### 색상 팔레트

```css
/* 반드시 CSS 변수로 사용. 하드코딩 금지. */
--primary-navy: #0f172a;     /* 네비바, 섹션 배경 */
--primary-purple: #6366f1;   /* 포인트 컬러, 보더 호버 */
--primary-teal: #06b6d4;     /* 하이라이트, 링크 호버 */
--accent-yellow: #fbbf24;    /* 강조, 카드 제목, 액센트 */
--text-primary: #f8fafc;     /* 본문 (밝은 텍스트) */
--text-secondary: #cbd5e1;   /* 보조 텍스트, 설명 */
--bg-dark: #020617;          /* 메인 배경 */
--bg-card: #1e293b;          /* 카드, 코드 블록 배경 */
```

**그라디언트:**
```css
--gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);  /* 보라 계열 (미사용) */
--gradient-2: linear-gradient(135deg, #06b6d4 0%, #6366f1 100%);  /* 청록→보라 (메인) */
```

**색상 사용 규칙:**
- 배경: `--bg-dark` (메인) / `--primary-navy` (섹션) / `--bg-card` (카드)
- 텍스트: `--text-primary` (제목, 본문) / `--text-secondary` (부연 설명)
- 강조: `--accent-yellow` (카드 h3, 특별 강조) / `--primary-teal` (링크, 아이콘)
- 인터랙션: `--primary-purple` (호버 보더, 버튼 아웃라인)
- 그라디언트 텍스트: `.text-gradient` 클래스 사용

### 타이포그래피

```css
--font-main: 'Inter', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
--font-code: 'JetBrains Mono', 'D2Coding', 'Courier New', monospace;
```

**크기 체계 (clamp 사용):**

| 용도 | CSS | 예시 |
|------|-----|------|
| 히어로 제목 | `clamp(2rem, 5vw, 4rem)` | `.hero-title` |
| 섹션 제목 | `clamp(2rem, 4vw, 3rem)` | `.section-title` |
| 카드 제목 | 기본 (1rem~1.1rem) | `.feature-card h3` |
| 본문 | `1rem` / `0.9rem` (모바일) | `p` |
| 코드 | `0.9rem` / `0.8rem` (모바일) | `.code-block pre` |
| 작은 텍스트 | `0.85rem` | footer, 라벨 |

### 간격 시스템

```css
/* 데스크톱 기본값 */
--spacing-xs: 0.5rem;    /*  8px */
--spacing-sm: 1rem;      /* 16px */
--spacing-md: 2rem;      /* 32px */
--spacing-lg: 3rem;      /* 48px */
--spacing-xl: 4rem;      /* 64px */
```

**주의**: 768px 이하와 480px 이하에서 `@media` 쿼리 안에서 `:root` 변수를 재정의하여 간격이 축소됨. 새 컴포넌트 작성 시 반드시 `var()` 함수로 참조해야 자동 적용.

### 반응형 브레이크포인트

```
1200px — 데스크톱 (nav 간격 축소)
1024px — 태블릿 가로 (히어로 1열, nav 축소)
 950px — 모바일 네비게이션 전환 (햄버거 메뉴 활성화)
 768px — 태블릿 세로 / 모바일 (전면 레이아웃 변경, 간격 축소)
 480px — 소형 모바일 (최소 간격, 최소 폰트)
```

**주의**: 950px에서 `.nav-menu`가 `display: none`이 되고 `.nav-toggle`이 나타남. 768px에서 모바일 텍스트 전환 (`-full` 숨기고 `-mobile` 표시).

---

## 4. 공통 컴포넌트 패턴

### 섹션 기본 구조

```html
<section id="{section-id}" class="{section-class}">
    <div class="container">
        <h2 class="section-title">{제목} <span class="text-gradient">{강조 단어}</span></h2>
        <!-- 콘텐츠 -->
    </div>
</section>
```

```css
/* 섹션 배경 패턴 (짝수/홀수 교대) */
.section-name {
    padding: var(--spacing-xl) 0;
    background: var(--primary-navy);                                    /* 단색 */
    /* 또는 */
    background: linear-gradient(180deg, var(--bg-dark) 0%, var(--primary-navy) 100%);  /* 그라디언트 */
    /* 또는 */
    background: linear-gradient(180deg, var(--primary-navy) 0%, var(--bg-dark) 100%);  /* 반전 */
}
```

**현재 섹션 배경 흐름:**
```
hero        → bg-dark (기본)
about       → bg-dark → primary-navy (그라디언트)
features    → primary-navy (단색)
philosophy  → primary-navy → bg-dark (그라디언트)
mascot      → primary-navy → #1a1a2e → bg-dark (3색 그라디언트 + radial glow)
crew        → primary-navy → bg-dark (그라디언트)
footer      → bg-dark → #0a0f1e (그라디언트)
```

새 섹션 추가 시 인접 섹션과 배경이 자연스럽게 이어지도록 색상 흐름을 맞출 것.

### 카드 컴포넌트

```html
<div class="{type}-card">
    <div class="{type}-icon">{아이콘 또는 이모지}</div>
    <div class="{type}-content">
        <h3>{제목}</h3>
        <p>
            <span class="{type}-text-full">{데스크톱 텍스트}</span>
            <span class="{type}-text-mobile">{모바일 축약 텍스트}</span>
        </p>
    </div>
</div>
```

```css
/* 카드 공통 스타일 */
.{type}-card {
    background: var(--bg-card);
    padding: var(--spacing-lg);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);   /* 또는 0.05 */
    transition: border-color 0.3s ease;
}

.{type}-card:hover {
    border-color: var(--primary-purple);            /* 또는 --primary-teal */
}

.{type}-card h3 {
    color: var(--accent-yellow);                    /* 또는 --text-primary */
    margin-bottom: var(--spacing-sm);
}

.{type}-card p {
    color: var(--text-secondary);
    line-height: 1.6;
}
```

**카드 레이아웃:**
- 데스크톱: `grid-template-columns: repeat(auto-fit, minmax(250~350px, 1fr))`
- 모바일 (768px 이하): `grid-template-columns: 1fr` + 가로 레이아웃 (아이콘 좌측, 콘텐츠 우측)

### 모바일 텍스트 전환 패턴

모든 텍스트가 긴 컴포넌트에 적용:

```html
<span class="{prefix}-text-full">{전체 텍스트}</span>
<span class="{prefix}-text-mobile">{축약 텍스트}</span>
```

```css
/* 기본: 데스크톱 텍스트 표시 */
.{prefix}-text-mobile { display: none; }
.{prefix}-text-full   { display: inline; }

/* 768px 이하: 모바일 텍스트 전환 */
@media (max-width: 768px) {
    .{prefix}-text-full   { display: none; }
    .{prefix}-text-mobile { display: inline; }
}
```

**새 컴포넌트에서 이 패턴을 사용하려면**, `styles.css` 상단의 기존 선언에 새 prefix를 추가:

```css
/* styles.css:71-83 에 추가 */
.hero-subtitle-mobile,
.card-text-mobile,
.feature-text-mobile,
.mascot-text-mobile,
.{new-prefix}-text-mobile {      /* ← 추가 */
    display: none;
}
```

768px 미디어 쿼리 안에도 동일하게 추가.

### 버튼 시스템

```html
<!-- 기본 버튼 -->
<button class="btn btn-primary">
    <i class="fas fa-anchor"></i> {라벨}
</button>

<!-- 아웃라인 버튼 -->
<button class="btn btn-secondary">
    <i class="fas fa-compass"></i> {라벨}
</button>

<!-- 대형 CTA 버튼 -->
<a href="#" class="btn btn-large">
    <i class="fas fa-ship"></i> {라벨}
</a>
```

**버튼 스크롤 동작:**
```html
<!-- 인라인 onclick 사용 금지 (CSP 위반). data-scroll-to 속성 사용: -->
<button class="btn btn-primary" data-scroll-to="#section-id">
    {라벨}
</button>
```
`script.js`의 `[data-scroll-to]` 이벤트 리스너가 자동으로 스무스 스크롤 처리.

### 이메일 링크

```html
<!-- 이메일 평문 노출 금지. 난독화 패턴 사용: -->
<a href="#" data-email-user="support" data-email-domain="pifl-labs.com">
    <i class="fas fa-headset"></i> <span class="email-text"></span>
</a>
```
`script.js`의 이메일 난독화 로직이 `DOMContentLoaded` 시 `mailto:` href와 텍스트를 동적 생성.

---

## 5. 이미지 가이드

### 이미지 추가 규칙

1. **WebP 우선, PNG 폴백**: 반드시 `<picture>` 태그 사용

```html
<picture>
    <source srcset="{image}.webp" type="image/webp">
    <img src="{image}.png" alt="{설명}" loading="lazy" decoding="async" width="{w}" height="{h}">
</picture>
```

2. **width/height 필수**: CLS(Cumulative Layout Shift) 방지
3. **loading 전략**:
   - 히어로/ATF(Above The Fold): `loading="eager"` + `fetchpriority="high"`
   - 그 외: `loading="lazy"` + `decoding="async"`
4. **파일 크기 상한**: WebP 기준 **300KB 이하** 권장
5. **OG 이미지**: 별도 최적화 파일 (1200x630px, 300KB 이내)

### 이미지 경로

| 페이지 위치 | 이미지 경로 |
|------------|------------|
| `/index.html` (루트) | `pifl-ship.webp` (상대) 또는 `/pifl-ship.webp` (절대) |
| `/en/index.html` | `../pifl-ship.webp` 또는 `/pifl-ship.webp` |
| `/blog/post/index.html` | `/pifl-ship.webp` (절대경로 권장) |

서브디렉토리가 2단계 이상이면 **절대경로(`/`)** 사용 필수.

---

## 6. firebase.json 업데이트

### 새 페이지 추가 시 rewrite 규칙

```json
{
  "rewrites": [
    { "source": "/en", "destination": "/en/index.html" },
    { "source": "/ja", "destination": "/ja/index.html" },
    { "source": "/blog", "destination": "/blog/index.html" },
    { "source": "/en/blog", "destination": "/en/blog/index.html" },
    { "source": "/ja/blog", "destination": "/ja/blog/index.html" },
    { "source": "**", "destination": "/index.html" }
  ]
}
```

**규칙**: 구체적인 패스가 먼저, catch-all(`**`)은 마지막.

### sitemap.xml 업데이트

새 페이지 추가 시 반드시 sitemap에 URL 추가:

```xml
<url>
    <loc>https://pifl-labs.com/blog/</loc>
    <lastmod>2026-XX-XX</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
</url>
```

---

## 7. CSS 작성 규칙

### 새 섹션/컴포넌트 CSS 추가 위치

`styles.css` 내부 구조:

```
[1-25]     :root 변수
[27-45]    리셋 & 베이스
[53-68]    타이포그래피 유틸리티 (.text-gradient, .text-highlight)
[70-83]    모바일 텍스트 전환 기본값
[85-210]   네비게이션
[212-455]  히어로 섹션
[457-561]  섹션 공통 + About + Features
[563-636]  Philosophy
[638-746]  Mascot
[748-804]  Crew
[806-924]  Footer
[926-964]  애니메이션 @keyframes
[966-1589] 반응형 미디어 쿼리
[1591-1680] 법률 페이지 (legal-page)
```

**새 섹션 CSS 추가 순서:**
1. 섹션 스타일 → Footer 앞 (`/* Footer */` 코멘트 이전)
2. 해당 섹션의 반응형 → 각 미디어 쿼리 블록 내 적절한 위치
3. 새 텍스트 전환 prefix → 70-83줄 + 768px 미디어 쿼리 모두에 추가

### 주의: 누락된 @keyframes 정의

현재 CSS에서 **참조되지만 정의되지 않은 애니메이션**이 있음:

| 참조 위치 | animation 이름 | 상태 |
|-----------|---------------|------|
| `:123` `.logo-icon` | `float` | **미정의** (동작 안 함) |
| `:351` `.hero-image` | `gentle-float` | **미정의** |
| `:372` `.pifl-main-text` | `brand-glow` | **미정의** |
| `:659` `.mascot::before` | `cyber-glow` | **미정의** |
| `:694` `.mascot-visual::before` | `neon-pulse` | **미정의** |
| `:706` `.mascot-image` | `cyber-float` | **미정의** |

정의된 것: `float-simple`, `wave`, `slideInLeft`, `bounce`, `fadeInOut`

이 애니메이션들이 실제로 동작하지 않고 있음. 새 애니메이션 추가 시 반드시 `@keyframes` 블록을 함께 작성할 것.

### CSS 작성 컨벤션

```css
/* 새 섹션 예시 */
.blog {
    padding: var(--spacing-xl) 0;
    background: linear-gradient(180deg, var(--bg-dark) 0%, var(--primary-navy) 100%);
}

.blog-card {
    background: var(--bg-card);                              /* 변수 사용 */
    padding: var(--spacing-lg);                              /* 변수 사용 */
    border-radius: 16px;                                     /* 기존 카드와 통일 */
    border: 1px solid rgba(255, 255, 255, 0.1);             /* 기존 패턴 */
    transition: border-color 0.3s ease;                      /* 기존 패턴 */
}

/* 호버는 border-color 변경 패턴 */
.blog-card:hover {
    border-color: var(--primary-purple);
}
```

**금지 사항:**
- 색상 하드코딩 (`#6366f1` 대신 `var(--primary-purple)`)
- 간격 하드코딩 (`32px` 대신 `var(--spacing-md)`)
- `!important` 남용 (기존 `.lang-btn`에만 예외적으로 사용 중)
- 인라인 `style=""` 속성 (CSS 클래스로 대체)

---

## 8. JavaScript 작성 규칙

### script.js 구조

```
[1-76]    DOMContentLoaded 블록
           ├── 네비게이션 토글
           ├── 로고 클릭
           ├── data-scroll-to 버튼
           └── 이메일 난독화
[78-93]   스무스 스크롤 (a[href^="#"])
[96-136]  스크롤 핸들러 (네비게이션 하이라이트 + 패럴랙스)
[138-153] IntersectionObserver (카드 애니메이션)
[155-165] 히어로 타이틀 효과
[167-204] 동적 CSS 주입
[206-209] 로딩 애니메이션
```

### 새 인터랙션 추가 규칙

1. **DOMContentLoaded 블록 안에** 이벤트 리스너 등록
2. **인라인 JS 금지**: `onclick="..."` 대신 `data-*` 속성 + `addEventListener`
3. **전역 함수 금지**: 모든 함수는 스코프 내부 또는 IIFE로 감싸기
4. **console.log 금지**: 프로덕션 코드에 디버그 로그 넣지 않기

```javascript
// 새 기능 추가 예시 (DOMContentLoaded 블록 안에 추가)
document.addEventListener('DOMContentLoaded', () => {
    // ... 기존 코드 ...

    // 새 기능: 탭 전환
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            // ... 로직 ...
        });
    });
});
```

### IntersectionObserver 확장

새 카드 타입 추가 시 observer에 셀렉터 추가:

```javascript
// styles.css:151 수정
document.querySelectorAll('.about-card, .feature-card, .crew-card, .blog-card').forEach(card => {
    observer.observe(card);
});
```

---

## 9. 다국어 체크리스트

새 페이지 추가 시 반드시 3개 언어 파일을 동시에 작성/수정.

### 파일별 체크리스트

- [ ] `public/{path}/index.html` — 한국어 (루트)
- [ ] `public/en/{path}/index.html` — 영어
- [ ] `public/ja/{path}/index.html` — 일본어
- [ ] `firebase.json` — rewrite 규칙 추가 (3개 경로)
- [ ] `public/sitemap.xml` — URL 추가 (3개)
- [ ] 모든 파일의 `hreflang` 링크 상호 참조 확인
- [ ] 모든 파일의 `canonical` URL 확인
- [ ] 모든 파일의 `og:url`, `og:locale` 확인
- [ ] nav-link 텍스트 해당 언어로 번역 확인
- [ ] 이메일 링크 `data-email-*` 패턴 사용 확인
- [ ] Font Awesome `integrity` 속성 포함 확인

---

## 10. 법률 페이지 (이미 CSS 준비됨)

`styles.css:1591-1680`에 `.legal-page` 관련 스타일이 이미 정의되어 있음.

### 법률 페이지 HTML 구조

```html
<main class="legal-page">
    <div class="container">
        <a href="/" class="legal-back">
            <i class="fas fa-arrow-left"></i> 홈으로 돌아가기
        </a>
        <div class="legal-header">
            <h1>{제목}</h1>
            <p class="legal-date">최종 수정일: 2026년 X월 X일</p>
        </div>
        <div class="legal-content">
            <h2>1. {조항 제목}</h2>
            <p>{내용}</p>
            <!-- ... -->
        </div>
    </div>
</main>
```

용도: 개인정보처리방침, 이용약관 등. `max-width: 800px`로 좁은 읽기 폭 적용.

---

## 11. 배포 프로세스

```bash
# 1. 로컬 테스트
npx http-server public -p 8000

# 2. 변경사항 확인
#    - 모든 언어 페이지 브라우저에서 확인
#    - 모바일 뷰 확인 (DevTools → 반응형)
#    - 이메일 링크 동작 확인
#    - 404 페이지 확인 (존재하지 않는 URL 접속)

# 3. 배포
firebase deploy --only hosting

# 4. 배포 후 확인
#    - https://pifl-labs.com 접속
#    - /en/, /ja/ 각각 확인
#    - /ko/ → / 리다이렉트 확인
#    - sitemap.xml 접근 가능 확인
```

---

## 12. 자주 발생하는 실수

| 실수 | 방지법 |
|------|--------|
| 한 언어만 수정하고 나머지 방치 | 3개 파일 동시 수정 → 체크리스트 사용 |
| CSS 변수 대신 하드코딩 | 리뷰 시 `#` 색상코드 직접 사용 검색 |
| 인라인 onclick 사용 | CSP `script-src 'self'`에 의해 차단됨 |
| 이메일 평문 노출 | `data-email-*` 패턴 필수 |
| 이미지 WebP 미변환 | PNG만 올리면 안 됨 → WebP + `<picture>` |
| width/height 누락 | CLS 점수 하락 → 반드시 명시 |
| @keyframes 정의 없이 animation 사용 | 참조 전 정의 확인 |
| 깊은 경로에서 상대경로 사용 | `/styles.css` 절대경로 사용 |
| firebase.json rewrite 누락 | 새 경로 추가 시 rewrite 먼저 등록 |
| sitemap.xml 갱신 안 함 | 새 페이지 = sitemap URL 추가 |
