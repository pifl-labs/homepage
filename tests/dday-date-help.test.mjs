import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { appList } from '../src/data/apps.ts';
import { ddayDateHelpFor } from '../src/data/dday-date-help.mjs';
const read = p => readFileSync(new URL(p, import.meta.url), 'utf8');
const sha = s => createHash('sha256').update(s).digest('hex');
const landing = read('../src/components/AppLanding.astro');
const help = ddayDateHelpFor({ slug: 'pipi-dday', status: 'live', lang: 'ko' });

test('D-Day links to the exact observed separate Korean hundredth-day calculator', () => {
  assert.equal(help.href, 'https://pipi-worlds.com/ko/world/hundredth-day/');
  assert.equal(help.label, '100일째와 100일 뒤 비교하기');
  assert.equal(new URL(help.href).search, '');
  for (const fact of ['설치·가입 없는 별도 웹 계산기', '앱의 계산 설정과는 별개', '결과도 자동으로 옮겨지지 않습니다.']) assert.ok(help.note.includes(fact), fact);
  assert.doesNotMatch(help.note, /앱 체험|앱 미리보기|동기화|위젯 체험|자동 저장/);
});

test('no date help on any other registered app, non-live status, other or inherited-key locale', () => {
  for (const app of appList.filter(a => a.slug !== 'pipi-dday')) assert.equal(ddayDateHelpFor({slug: app.slug, status: 'live', lang: 'ko'}), null, app.slug);
  for (const lang of ['en','ja','fr','constructor','__proto__',undefined]) assert.equal(ddayDateHelpFor({slug:'pipi-dday',status:'live',lang}),null);
  for (const status of ['soon','draft',undefined]) assert.equal(ddayDateHelpFor({slug:'pipi-dday',status,lang:'ko'}),null);
  assert.equal(ddayDateHelpFor({slug:undefined,status:'live',lang:'ko'}),null);
});

test('secondary link follows store/price information without replacing existing release or calendar UI', () => {
  const start=landing.indexOf('{ddayDateHelp && <div');
  assert.ok(start>landing.indexOf('<div class="app-stores"'));
  assert.ok(start>landing.indexOf('{c.downloadNote &&'));
  assert.ok(start<landing.indexOf('{rel && ('));
  assert.match(landing,/ddayDateHelpFor\(\{ slug: app\.slug, status: app\.status, lang \}\)/);
  assert.match(landing,/href=\{ddayDateHelp\.href\} hreflang="ko">\{ddayDateHelp\.label\}<\/a>\s*<p>\{ddayDateHelp\.note\}<\/p>/);
  assert.equal((landing.match(/data-date-help="dday"/g)??[]).length,1);
  assert.equal((landing.match(/<slot name="before-showcase"\s*\/>/g)??[]).length,1);
});

test('only supported entry loads exact content-hashed focus-safe scoped CSS', () => {
  const css=read('../public/styles-dday-date-help.css');
  assert.ok(landing.includes(`...(ddayDateHelp ? ['/styles-dday-date-help.css?v=${sha(css).slice(0,12)}'] : [])`));
  assert.match(css,/\.app-page \[data-date-help="dday"\] \{[^}]*box-sizing: border-box;[^}]*max-width: 100%;[^}]*padding-inline: \.25rem;/);
  assert.match(css,/text-wrap: balance/);
  assert.match(css,/html\[data-theme="light"\] \.app-page \[data-date-help="dday"\] a:hover \{\s*color: var\(--text-primary\);/);
  assert.doesNotMatch(css,/overflow:\s*hidden|outline:\s*(?:none|0)|white-space:\s*nowrap|font-size|display:\s*none/);
  const shared=read('../public/styles-app-landing.css');
  assert.match(shared,/\.app-bridge-resource-link:focus-visible \{[^}]*outline: 2px solid/);
});

test('built entry and stylesheet occur exactly once in KO D-Day and nowhere else', () => {
  const css=read('../public/styles-dday-date-help.css');
  const url=`/styles-dday-date-help.css?v=${sha(css).slice(0,12)}`;
  assert.equal(read('../dist/styles-dday-date-help.css'),css);
  for(const lang of ['ko','ja','en']) for(const app of appList){
    const html=read(`../dist/${lang}/apps/${app.slug}/index.html`);
    const expected=lang==='ko'&&app.slug==='pipi-dday';
    assert.equal(html.includes('data-date-help="dday"'),expected,`${lang}/${app.slug}`);
    assert.equal(html.includes(url),expected,`${lang}/${app.slug}`);
    if(expected){
      const block=html.match(/<div class="app-download-note" data-date-help="dday"[^>]*>(.*?)<\/div>/s)?.[1];
      assert.ok(block);assert.ok(block.includes(`href="${help.href}" hreflang="ko"`));
      assert.ok(block.includes(help.label));assert.ok(block.includes(help.note));
      assert.equal((html.match(/data-date-help="dday"/g)??[]).length,1);
      assert.ok(html.indexOf('class="app-stores"')<html.indexOf(block));
      assert.ok(html.indexOf(block)<html.indexOf('class="app-rel-line"'));
      assert.ok(html.includes('com.pifl.pipi.dday'));assert.ok(html.includes('6770268950'));
    }
  }
});

test('dated evidence preserves exact shared source outside the optional D-Day entry', () => {
  const receipt=JSON.parse(read('../docs/release/dday-date-help-20261113.json'));
  assert.equal(receipt.source,help.href);assert.equal(receipt.body,help.note);
  assert.deepEqual(receipt.actualSyntheticExample,{start:'2026-11-13',hundredthDay:'2027-02-20',hundredDaysLater:'2027-02-21',realPersonDate:false,clipboardWrite:false});
  assert.equal(sha(read('../src/data/apps.ts')),receipt.unchangedAppsSHA256);
  const block=`{ddayDateHelp && <div class="app-download-note" data-date-help="dday">\n            <a class="app-bridge-resource-link" href={ddayDateHelp.href} hreflang="ko">{ddayDateHelp.label}</a>\n            <p>{ddayDateHelp.note}</p>\n          </div>}`;
  const edits=[
    "\nimport { ddayDateHelpFor } from '../data/dday-date-help.mjs';",
    '\nconst ddayDateHelp = ddayDateHelpFor({ slug: app.slug, status: app.status, lang });',
    `, ...(ddayDateHelp ? ['/styles-dday-date-help.css?v=${sha(read('../public/styles-dday-date-help.css')).slice(0,12)}'] : [])`,
    block,
  ];
  let projected=landing;
  for(const edit of edits){assert.equal(projected.split(edit).length-1,1,'exact optional edit once');projected=projected.replace(edit,'');}
  assert.equal(sha(projected),receipt.originalLandingSHA256,'all original app landing bytes preserved');
});
