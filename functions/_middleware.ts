// Cloudflare Pages Functions — i18n Accept-Language 리다이렉트.
// ------------------------------------------------------------
// 동작:
//   1) URL이 /ko /en /ja prefix를 이미 가지면 통과.
//   2) 정적 자산(_astro, fonts, assets, *.css/js/woff2/png/...) 통과.
//   3) 그 외(루트 등) → Accept-Language 또는 쿠키(pref-lang) 감지 → 302 redirect.
//   4) 한 번 감지하면 쿠키(pref-lang, 1년)에 저장 → 다음 방문 즉시 라우팅.
//
// 정적 사이트 + Cloudflare Pages 전용. 미들웨어가 안 도는 환경(로컬 dev 등)에서는
// src/pages/index.astro 의 클라이언트 redirect 가 폴백.

const SUPPORTED = ['ko', 'en', 'ja'] as const;
type Locale = (typeof SUPPORTED)[number];
const DEFAULT_LOCALE: Locale = 'ko';
const COOKIE_NAME = 'pref-lang';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1년

function isLocale(value: string): value is Locale {
  return (SUPPORTED as readonly string[]).includes(value);
}

function detectFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  // "ko-KR,ko;q=0.9,en-US;q=0.8" → 등장 순서 우선
  const parts = header.split(',').map((s) => s.split(';')[0].trim().toLowerCase());
  for (const lang of parts) {
    if (lang.startsWith('ko')) return 'ko';
    if (lang.startsWith('ja')) return 'ja';
    if (lang.startsWith('en')) return 'en';
  }
  return null;
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// `/.well-known/` 은 모바일 딥링크 검증 파일(AASA·assetlinks.json) 경로.
// AASA는 확장자가 없어 STATIC_FILE_RE에 안 걸리므로 명시적으로 통과시켜야 한다.
// (i18n 302 리다이렉트가 끼면 Apple CDN이 AASA를 거부한다.)
const STATIC_PATH_PREFIXES = ['/_astro/', '/fonts/', '/assets/', '/.well-known/'];
const STATIC_FILE_RE = /\.(woff2?|ttf|otf|png|webp|jpe?g|svg|gif|ico|css|js|mjs|map|xml|txt|json|webmanifest)$/i;

type PagesContext = {
  request: Request;
  next: () => Promise<Response>;
};

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // 1) 이미 언어 prefix가 있으면 통과
  for (const loc of SUPPORTED) {
    if (path === `/${loc}` || path.startsWith(`/${loc}/`)) {
      return next();
    }
  }

  // 2) 정적 자산 통과 (robots/sitemap/favicon/_headers 등 루트 자산 포함)
  if (STATIC_PATH_PREFIXES.some((p) => path.startsWith(p)) || STATIC_FILE_RE.test(path)) {
    return next();
  }

  // 3) 루트(또는 prefix 없는 경로) → 언어 감지 후 redirect.
  //    path 를 보존해 /terms → /ko/terms 처럼 deep link 도 올바르게 라우팅.
  const cookieLang = readCookie(request.headers.get('cookie'), COOKIE_NAME);
  const fromCookie = cookieLang && isLocale(cookieLang) ? cookieLang : null;
  const detected =
    fromCookie ?? detectFromAcceptLanguage(request.headers.get('accept-language')) ?? DEFAULT_LOCALE;

  const target = `${url.origin}/${detected}${path}${url.search}${url.hash}`;
  return new Response(null, {
    status: 302,
    headers: {
      Location: target,
      'Set-Cookie': `${COOKIE_NAME}=${detected}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`,
      'Cache-Control': 'no-store',
    },
  });
};
