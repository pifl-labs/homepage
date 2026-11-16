import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const syncReceipt=JSON.parse(readFileSync(new URL('../../docs/release/public-release-sync-20261116.json',import.meta.url),'utf8'));
export const syncDeltas=JSON.parse(readFileSync(new URL('../../docs/release/public-release-sync-source-deltas-20261116.json',import.meta.url),'utf8'));
const sha=s=>createHash('sha256').update(s).digest('hex');
/** Only exact approved bytes reverse to history. Missing/unknown edits are failures, not exemptions. */
export function beforeReleaseSync(file,text){
 const row=syncDeltas[file];assert.ok(row,file);assert.equal(sha(text),row.afterSHA256,`unrecorded source edit: ${file}`);
 for(const d of row.deltas){assert.equal(text.split(d.new).length-1,1,`exact delta once: ${file}`);text=text.replace(d.new,d.old);}
 assert.equal(sha(text),row.beforeSHA256,`historical source restored: ${file}`);return text;
}
const suffixes={'pipi-word-voyage':'wordvoyage',dialogos:'thus',kkachi:'kkachi'};
export const packageFor=slug=>'com.pifl.pipi.'+(suffixes[slug]??slug.replace('pipi-',''));
export const currentIOS=slug=>syncReceipt.ios.KR.apps.find(a=>a.bundleId===packageFor(slug));
export const currentAndroid=slug=>syncReceipt.android.apps.find(a=>a.package===packageFor(slug));
export const androidDay=a=>a.updated.match(/\d+/g).map((s,i)=>i?s.padStart(2,'0'):s).join('-');

const retained={
 'pipi-focus':{ios:'2026-11-02',android:'2026-11-02'},'pipi-hello':{ios:'2026-11-02',android:'2026-11-02'},
 'pipi-words':{android:'2026-11-02'},'pipi-log':{ios:'2026-11-06'},'pipi-bridge':{ios:'2026-11-11'},
 'pipi-word-voyage':{android:'2026-11-13'},'pipi-tide':{android:'2026-11-02'},'pipi-sudoku':{ios:'2026-11-02',android:'2026-11-02'},'kkachi':{android:'2026-11-02'},
};
export const checkedAtFor=(slug,platform)=>retained[slug]?.[platform]??syncReceipt.observedAt;
export const currentIOSName=(slug,lang)=>{const C={ko:'KR',ja:'JP',en:'US'}[lang];return syncReceipt.ios[C].apps.find(a=>a.bundleId===packageFor(slug))?.trackName??currentIOS(slug)?.trackName};
export const currentAndroidName=(slug,lang)=>lang==='ko'||slug==='pipi-tide'?currentAndroid(slug)?.name:syncReceipt.nativeAndroidNames[{ja:'JP',en:'US'}[lang]].apps.find(a=>new URL(a.url).searchParams.get('id')===packageFor(slug))?.name;
