// gen-pages.mjs — 기존 public/ HTML 20개를 src/pages/*.astro 로 변환
// ------------------------------------------------------------
// head 메타 추출 + body(nav/footer 제외) verbatim 이전 → BaseLayout 래핑.
// 콘텐츠는 손대지 않는다(번역·재작성 금지). chrome 만 컴포넌트로 중앙화.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

// src(기존 HTML) → dest(.astro) → lang 매핑.
// 루트 index.astro 는 생성 대상 아님 — 언어 감지 리다이렉트 랜딩(수기 작성).
const SITE = 'https://pifl-labs.com';
const PAGES = [
  ['public/terms.html',                              'src/pages/terms.astro',                       'en'],
  ['public/privacy.html',                            'src/pages/privacy.astro',                     'en'],
  ['public/en/index.html',                           'src/pages/en/index.astro',                    'en'],
  ['public/en/terms.html',                           'src/pages/en/terms.astro',                    'en'],
  ['public/en/privacy.html',                         'src/pages/en/privacy.astro',                  'en'],
  ['public/en/apps/pipi-focus/privacy.html',         'src/pages/en/apps/pipi-focus/privacy.astro',  'en'],
  ['public/en/apps/pipi-words/privacy.html',         'src/pages/en/apps/pipi-words/privacy.astro',  'en'],
  ['public/apps/pipi-focus/privacy.html',            'src/pages/apps/pipi-focus/privacy.astro',     'en'],
  ['public/apps/pipi-words/privacy.html',            'src/pages/apps/pipi-words/privacy.astro',     'en'],
  ['public/apps/pipi-dday/privacy.html',             'src/pages/apps/pipi-dday/privacy.astro',      'en'],
  ['public/en/apps/pipi-dday/privacy.html',          'src/pages/en/apps/pipi-dday/privacy.astro',   'en'],
  ['public/localized-files/ko/apps/pipi-dday/privacy.html', 'src/pages/ko/apps/pipi-dday/privacy.astro', 'ko'],
  ['public/localized-files/ja/apps/pipi-dday/privacy.html', 'src/pages/ja/apps/pipi-dday/privacy.astro', 'ja'],
  ['public/localized-files/ko/index.html',           'src/pages/ko/index.astro',                    'ko'],
  ['public/localized-files/ko/terms.html',           'src/pages/ko/terms.astro',                    'ko'],
  ['public/localized-files/ko/privacy.html',         'src/pages/ko/privacy.astro',                  'ko'],
  ['public/localized-files/ko/apps/pipi-focus/privacy.html', 'src/pages/ko/apps/pipi-focus/privacy.astro', 'ko'],
  ['public/localized-files/ko/apps/pipi-words/privacy.html', 'src/pages/ko/apps/pipi-words/privacy.astro', 'ko'],
  ['public/localized-files/ja/index.html',           'src/pages/ja/index.astro',                    'ja'],
  ['public/localized-files/ja/terms.html',           'src/pages/ja/terms.astro',                    'ja'],
  ['public/localized-files/ja/privacy.html',         'src/pages/ja/privacy.astro',                  'ja'],
  ['public/localized-files/ja/apps/pipi-focus/privacy.html', 'src/pages/ja/apps/pipi-focus/privacy.astro', 'ja'],
  ['public/localized-files/ja/apps/pipi-words/privacy.html', 'src/pages/ja/apps/pipi-words/privacy.astro', 'ja'],
];

const m1 = (re, s) => { const r = s.match(re); return r ? r[1] : null; };

function extract(html) {
  const lang = m1(/<html[^>]*\blang="([^"]+)"/, html);
  const title = m1(/<title>([\s\S]*?)<\/title>/, html);
  const description = m1(/<meta\s+name="description"\s+content="([^"]*)"/, html);
  const keywords = m1(/<meta\s+name="keywords"\s+content="([^"]*)"/, html);
  const canonical = m1(/<link\s+rel="canonical"\s+href="([^"]*)"/, html);
  const alternates = [...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]*)"\s+href="([^"]*)"\s*\/?>/g)]
    .map((x) => ({ hreflang: x[1], href: x[2] }));
  const ogImage = m1(/<meta\s+property="og:image"\s+content="([^"]*)"/, html);
  const hasStylesCss = /<link[^>]+href="\/styles\.css"/.test(html);

  // body = </nav> 다음 ~ <footer 직전
  const navEnd = html.indexOf('</nav>');
  const footStart = html.indexOf('<footer');
  if (navEnd < 0 || footStart < 0) throw new Error('nav/footer 경계 탐지 실패');
  let body = html.slice(navEnd + '</nav>'.length, footStart).trim();

  return { lang, title, description, keywords, canonical, alternates, ogImage, hasStylesCss, body };
}

function layoutImport(dest) {
  // dest 깊이에 맞춘 상대경로 (src/pages/<...>/x.astro → ../*/layouts)
  const rel = dest.replace(/^src\/pages\//, '');
  const depth = rel.split('/').length - 1; // 디렉토리 깊이
  return '../'.repeat(depth + 1) + 'layouts/BaseLayout.astro';
}

// canonical·hreflang 계산 — 모든 콘텐츠는 /ko//en//ja prefix 아래.
// 루트 무prefix 페이지(예: /terms)는 /en/ 트윈을 canonical 로 가리켜 중복 제거.
// x-default 는 /ko/ (한국 회사 기준).
function i18nMeta(dest, lang) {
  let rel = dest.replace(/^src\/pages\//, '').replace(/\.astro$/, '');
  rel = rel.replace(/^(en|ko|ja)\//, '');          // 로케일 prefix 제거
  const key = rel === 'index' ? '' : rel;           // home → ''
  const suffix = key === '' ? '' : key + '/';
  return {
    canonical: `${SITE}/${lang}/${suffix}`,
    alternates: [
      { hreflang: 'en', href: `${SITE}/en/${suffix}` },
      { hreflang: 'ko', href: `${SITE}/ko/${suffix}` },
      { hreflang: 'ja', href: `${SITE}/ja/${suffix}` },
      { hreflang: 'x-default', href: `${SITE}/ko/${suffix}` },
    ],
  };
}

let count = 0;
for (const [src, dest, langHint] of PAGES) {
  const html = readFileSync(join(ROOT, src), 'utf-8');
  const e = extract(html);
  const lang = e.lang || langHint;
  if (!e.title) throw new Error(`${src}: title 누락`);

  const { canonical, alternates } = i18nMeta(dest, lang);

  const props = [
    `  lang="${lang}"`,
    `  title={${JSON.stringify(e.title)}}`,
    `  description={${JSON.stringify(e.description ?? '')}}`,
    `  canonical=${JSON.stringify(canonical)}`,
    e.keywords ? `  keywords={${JSON.stringify(e.keywords)}}` : null,
    `  alternates={${JSON.stringify(alternates)}}`,
    e.ogImage ? `  ogImage=${JSON.stringify(e.ogImage)}` : null,
    e.hasStylesCss ? `  extraCss={["/styles.css"]}` : null,
  ].filter(Boolean).join('\n');

  const out = `---
import BaseLayout from '${layoutImport(dest)}';
---
<BaseLayout
${props}
>
${e.body}
</BaseLayout>
`;

  const destAbs = join(ROOT, dest);
  mkdirSync(dirname(destAbs), { recursive: true });
  writeFileSync(destAbs, out, 'utf-8');
  count++;
  console.log(`OK  ${lang}  ${dest}`);
}
console.log(`\n${count}/${PAGES.length} 페이지 생성 완료`);
