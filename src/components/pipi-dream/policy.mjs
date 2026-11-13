// 간밤(pipi-dream) 개인정보처리방침 — 앱 저장소가 만든 공개 쪽을 회사 사이트 레이아웃에 옮긴다.
//
// policy/<언어>.html 은 pipi_dream 저장소 site/privacy/<언어>.html 을 바이트 그대로 복사한 것이다
// (원본: pipi_dream docs/legal/PRIVACY_POLICY.md → tools/privacy/build_privacy.py). 법적 문구라 본문을 이 사이트에서
// 다시 쓰지 않는다 — 원본이 바뀌면 다섯 파일을 다시 복사한다. 여기서 바꾸는 것은 사이트 규칙에 필요한 세 가지뿐이다.
//   1) <h1> 을 본문에서 떼어 사이트의 legal-hero 제목으로 쓴다(글자는 그대로).
//   2) 평문 mailto 링크를 data-email-user/data-email-domain 난독화로 바꾼다(사이트 규칙 — script.js 가 런타임에 조립).
//   3) 쪽 사이 언어 고르기 <nav> 에 이름(aria-label)을 붙인다 — 사이트 상단 내비와 구분. 링크(href·hreflang)는 그대로다.

export const POLICY_LANGS = ['ko', 'en', 'ja', 'zh-Hans', 'zh-Hant'];

const NAV_LABEL = { ko: '언어', en: 'Language', ja: '言語', 'zh-Hans': '语言', 'zh-Hant': '語言' };
const MAILTO = /<a href="mailto:([a-z0-9._-]+)@([a-z0-9.-]+)">\1@\2<\/a>/g;

/** 원본 html 한 쪽 → { title, heading, body, description }. 모양이 예상과 다르면 빌드를 멈춘다. */
export function policyParts(lang, sourceHtml) {
  if (!POLICY_LANGS.includes(lang)) throw new Error(`pipi-dream policy: unknown lang ${lang}`);
  const main = sourceHtml.match(/<main>\n([\s\S]*?)\n\s*<\/main>/)?.[1];
  const title = sourceHtml.match(/<title>([^<]+)<\/title>/)?.[1];
  const h1 = main?.match(/\n\s*<h1>([^<]+)<\/h1>\n/);
  if (!main || !title || !h1) throw new Error(`pipi-dream policy ${lang}: <title>/<main>/<h1> not found`);

  let body = main.replace(h1[0], '\n');
  if ((body.match(MAILTO) ?? []).length === 0) throw new Error(`pipi-dream policy ${lang}: contact mail link not found`);
  body = body.replace(
    MAILTO,
    '<a href="#" data-email-user="$1" data-email-domain="$2"><span class="email-text">$1 (at) $2</span></a>',
  );
  if (/mailto:/i.test(body)) throw new Error(`pipi-dream policy ${lang}: plain mailto left after obfuscation`);
  if ((body.match(/<nav>/g) ?? []).length !== 1) throw new Error(`pipi-dream policy ${lang}: expected one language <nav>`);
  body = body.replace('<nav>', `<nav class="dream-policy-langs" aria-label="${NAV_LABEL[lang]}">`);

  // meta description = 원본 첫 문단의 앞 두 문장(글자 그대로).
  const lead = body.match(/<p>([^<]+)<\/p>/)?.[1];
  if (!lead) throw new Error(`pipi-dream policy ${lang}: lead paragraph not found`);
  const description = lead.split(/(?<=[.。])\s*/u).slice(0, 2).join(lang.startsWith('zh') || lang === 'ja' ? '' : ' ');

  return { title, heading: h1[1], body, description };
}
