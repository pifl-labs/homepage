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

// Copyable links for the existing English first-kana paper, independent of locale.
const KANA_PAPER_RESOURCES = new Map([
  ['/kana/en/a4', '/assets/printables/first-kana-shape-match-en-a4.pdf'],
  ['/kana/en/a4/', '/assets/printables/first-kana-shape-match-en-a4.pdf'],
  ['/kana/en/letter', '/assets/printables/first-kana-shape-match-en-letter.pdf'],
  ['/kana/en/letter/', '/assets/printables/first-kana-shape-match-en-letter.pdf'],
]);

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
  // RFC 9110: q defaults to 1; q=0 is not acceptable. Equal weights keep
  // header order. Ignore malformed/unsupported ranges, retaining our default
  // locale (rather than an error page) if none of the supported locales match.
  let preferred: Locale | null = null;
  let highestQuality = 0;
  for (const part of header.split(',')) {
    const match = part.trim().match(/^([a-z]{2,8})(?:-[a-z0-9]{1,8})*(?:\s*;\s*q=(0(?:\.\d{0,3})?|1(?:\.0{0,3})?))?$/i);
    if (!match) continue;
    const locale = match[1].toLowerCase();
    const quality = match[2] === undefined ? 1 : Number(match[2]);
    if (isLocale(locale) && quality > highestQuality) {
      preferred = locale;
      highestQuality = quality;
    }
  }
  return preferred;
}

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    // A stale or malformed preference cookie must not turn an entry URL into
    // HTTP 500. Ignore only this value and continue browser-language detection.
    return null;
  }
}

// `/.well-known/` 은 모바일 딥링크 검증 파일(AASA·assetlinks.json) 경로.
// AASA는 확장자가 없어 STATIC_FILE_RE에 안 걸리므로 명시적으로 통과시켜야 한다.
// (i18n 302 리다이렉트가 끼면 Apple CDN이 AASA를 거부한다.)
// `/go/` 는 언어 중립 link-in-bio 허브(noindex) — 소셜 프로필 바이오가 참조하는
// 고정 URL이므로 i18n 302를 끼우지 않고 그대로 서빙한다.
const STATIC_PATH_PREFIXES = ['/_astro/', '/fonts/', '/assets/', '/.well-known/', '/go/'];
const STATIC_FILE_RE = /\.(woff2?|ttf|otf|png|webp|jpe?g|svg|gif|ico|css|js|mjs|map|xml|txt|json|webmanifest)$/i;
// 언어 중립으로 그대로 서빙하는 페이지(canonical 은 /en/ 판, 사이트맵 제외).
// `/apps/pipi-spend/privacy` — 가계부 앱(pipi_spend app_config.dart privacyPolicyUrlFor)이 사이트 언어(ko/en/ja) 밖의
// 7개 언어(de·fr·es·pt·it·zh·id)를 이 한 페이지의 `#<languageCode>` 섹션으로 연다. 302 로 /ko/·/en/·/ja/ 판에 보내면
// 그 판에는 해당 언어 섹션이 없어 앵커가 빈 곳에 떨어진다.
const LANGUAGE_NEUTRAL_PATHS = new Set(['/apps/pipi-spend/privacy', '/apps/pipi-spend/privacy/']);

type PagesContext = {
  request: Request;
  next: () => Promise<Response>;
};

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { request, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  const paper = KANA_PAPER_RESOURCES.get(path);
  if (paper) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    return new Response(null, {
      status: 302,
      headers: {
        Location: new URL(paper, url.origin).href,
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, follow',
      },
    });
  }

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

  // 2-1) 앱이 앵커로 여는 언어 중립 페이지 통과
  if (LANGUAGE_NEUTRAL_PATHS.has(path)) {
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
