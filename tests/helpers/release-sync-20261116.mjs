import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const syncReceipt=JSON.parse(readFileSync(new URL('../../docs/release/public-release-sync-20261116.json',import.meta.url),'utf8'));
export const syncDeltas=JSON.parse(readFileSync(new URL('../../docs/release/public-release-sync-source-deltas-20261116.json',import.meta.url),'utf8'));
/** Approved source edits made after the 2026-11-16 sync (Dialogos 1.1.0 copy: philosophers, no numbers). */
export const laterDeltas=JSON.parse(readFileSync(new URL('../../docs/release/dialogos-110-copy-source-deltas-20261116.json',import.meta.url),'utf8'));
/** Approved source edits made after the copy layer (Dialogos 1.1.0 screenshots: submitted 2026-11-16 listing set). */
export const screenshotDeltas=JSON.parse(readFileSync(new URL('../../docs/release/dialogos-110-screenshots-source-deltas-20261116.json',import.meta.url),'utf8'));
/** Later layers, newest first. Each layer starts from the bytes the next (older) layer ends with. */
export const refreshReceipt=JSON.parse(readFileSync(new URL('../../docs/release/homepage-refresh-public-20261117.json',import.meta.url),'utf8'));
const refreshDeltas=JSON.parse(readFileSync(new URL('../../docs/release/homepage-refresh-source-deltas-20261117.json',import.meta.url),'utf8'));
export const storeRecheck=JSON.parse(readFileSync(new URL('../../docs/release/homepage-store-recheck-20261118.json',import.meta.url),'utf8'));
const storeRecheckDeltas=JSON.parse(readFileSync(new URL('../../docs/release/homepage-store-recheck-source-deltas-20261118.json',import.meta.url),'utf8'));
export const historyLatest=JSON.parse(readFileSync(new URL('../../docs/release/homepage-current-store-20261119.json',import.meta.url),'utf8'));
const historyDeltas=JSON.parse(readFileSync(new URL('../../docs/release/homepage-current-store-source-deltas-20261119.json',import.meta.url),'utf8'));
/** 2026-11-19 cleanup of CSS for the retired home catalog: AppLanding only re-keys the shared stylesheet URL. */
const cssCleanupDeltas=JSON.parse(readFileSync(new URL('../../docs/release/homepage-css-cleanup-source-deltas-20261119.json',import.meta.url),'utf8'));
/** Dialogos 1.1.1 (21) submitted listing: the symposium screen moves to the 2026-11-19 set (new round flow). */
const dialogos111Deltas=JSON.parse(readFileSync(new URL('../../docs/release/dialogos-111-screenshots-source-deltas-20261119.json',import.meta.url),'utf8'));
export const laterLayers=[dialogos111Deltas,cssCleanupDeltas,historyDeltas,storeRecheckDeltas,refreshDeltas,screenshotDeltas,laterDeltas];
/** Sources removed after their last recorded layer. Their last bytes are kept so the history chain still checks;
 *  a retired file must stay absent (re-adding it means recording a new layer instead). */
export const retiredSources=JSON.parse(readFileSync(new URL('../../docs/release/home-catalog-retired-sources-20261119.json',import.meta.url),'utf8'));
export function sourceText(file){
 const path=new URL('../../'+file,import.meta.url);const retired=retiredSources[file];
 if(!retired)return readFileSync(path,'utf8');
 assert.equal(existsSync(path),false,`retired source re-added without a new layer: ${file}`);
 assert.equal(createHash('sha256').update(retired.content).digest('hex'),retired.sha256,`retired source record intact: ${file}`);
 return retired.content;
}
const sha=s=>createHash('sha256').update(s).digest('hex');
const reverseRow=(row,file,text)=>{
 for(const d of row.deltas){assert.equal(text.split(d.new).length-1,1,`exact delta once: ${file}`);text=text.replace(d.new,d.old);}
 assert.equal(sha(text),row.beforeSHA256,`historical source restored: ${file}`);return text;
};
/** Current bytes back to the synced bytes: only the exact approved later edits reverse, newest first.
 *  `through` stops after that many layers (0 = none), so each layer can be checked on its own bytes. */
export function beforeLaterEdits(file,text,{through=laterLayers.length}={}){
 for(const layer of laterLayers.slice(0,through)){
  const row=layer[file];if(!row)continue;
  assert.equal(sha(text),row.afterSHA256,`unrecorded source edit: ${file}`);text=reverseRow(row,file,text);
 }
 return text;
}
/** Only exact approved bytes reverse to history. Missing/unknown edits are failures, not exemptions. */
export function beforeReleaseSync(file,text){
 for(const layer of laterLayers){const later=layer[file];if(later&&sha(text)===later.afterSHA256)text=reverseRow(later,file,text);}
 const row=syncDeltas[file];assert.ok(row,file);assert.equal(sha(text),row.afterSHA256,`unrecorded source edit: ${file}`);
 for(const d of row.deltas){assert.equal(text.split(d.new).length-1,1,`exact delta once: ${file}`);text=text.replace(d.new,d.old);}
 assert.equal(sha(text),row.beforeSHA256,`historical source restored: ${file}`);return text;
}
const suffixes={'pipi-word-voyage':'wordvoyage',dialogos:'thus',kkachi:'kkachi'};
export const packageFor=slug=>'com.pifl.pipi.'+(suffixes[slug]??slug.replace('pipi-',''));
export const currentIOS=slug=>{const prior=refreshReceipt.ios.KR.apps.find(a=>a.bundleId===packageFor(slug));const latest=historyLatest.ios.find(a=>a.app===slug);return latest?{...prior,...latest}:prior;};
export const currentAndroid=slug=>{const prior=refreshReceipt.android.find(a=>a.package===packageFor(slug));const latest=historyLatest.android.find(a=>a.app===slug);return latest?{...prior,...latest}:slug==='pipi-dday'?{...prior,...storeRecheck.android.find(a=>a.package===packageFor(slug))}:prior;};
export const androidDay=a=>a.updated.match(/\d+/g).map((s,i)=>i?s.padStart(2,'0'):s).join('-');

export const checkedAtFor=(slug,platform)=>historyLatest[platform].some(a=>a.app===slug)?historyLatest.observedAt:slug==='pipi-dday'&&platform==='android'?storeRecheck.observedAt:refreshReceipt.observedAt;
export const currentIOSName=(slug,lang)=>{const C={ko:'KR',ja:'JP',en:'US'}[lang];return syncReceipt.ios[C].apps.find(a=>a.bundleId===packageFor(slug))?.trackName??currentIOS(slug)?.trackName};
export const currentAndroidName=(slug,lang)=>lang==='ko'||slug==='pipi-tide'?currentAndroid(slug)?.name:syncReceipt.nativeAndroidNames[{ja:'JP',en:'US'}[lang]].apps.find(a=>new URL(a.url).searchParams.get('id')===packageFor(slug))?.name;

const kstDay = timestamp => new Intl.DateTimeFormat('sv-SE',{
timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',
}).format(new Date(timestamp));
export const expectedRelease=(slug,platform)=>{const r=platform==='ios'?currentIOS(slug):currentAndroid(slug);return {version:r.version,updated:platform==='ios'?(historyLatest.ios.some(a=>a.app===slug)?kstDay(r.currentVersionReleaseDate):r.currentVersionReleaseDate.slice(0,10)):androidDay(r),checkedAt:checkedAtFor(slug,platform)};};
