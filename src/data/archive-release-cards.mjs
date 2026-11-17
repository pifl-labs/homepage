import {publicArchiveEvents} from './archive-public.mjs';

// Matched by reviewed version-specific store notes, or a release document
// explicitly confirming no platform-specific changes. Version equality alone
// is not sufficient (Tide and D-Day 2.0.2 are deliberately separate).
const sharedReleasePairs = [
 ['dialogos-android-observed-20261117','dialogos-ios-observed-20261117'],
 ['pipi-draw-android-observed-20261117','pipi-draw-ios-observed-20261117'],
 ['pipi-focus-android-observed-20261117','pipi-focus-ios-observed-20261117'],
 ['pipi-log-android-observed-20261117','pipi-log-ios-observed-20261117'],
 ['pipi-word-voyage-android-observed-20261117','pipi-word-voyage-ios-observed-20261117'],
 ['pipi-words-android-observed-20261117','pipi-words-ios-observed-20261117'],
 ['pipi-bridge-android-observed-20261117','pipi-bridge-ios-observed-20261117'],
 ['pipi-sudoku-android-observed-20261117','pipi-sudoku-ios-102'],
 ['pipi-hello-android-observed-20261117','pipi-hello-110'],
];

export function buildReleaseCards(events, pairs = sharedReleasePairs) {
 const byId = new Map(events.filter(e=>e.publication).map(e=>[e.id,e]));
 const consumed = new Set();
 const cards = [];
 function add(id,copy,platforms) {
  const releases = [...platforms].sort((a,b)=>a.platform==='ios'?-1:b.platform==='ios'?1:0);
  const sortDate = releases.map(e=>e.publication.date).sort().at(-1);
  cards.push({id,app:copy.app,version:copy.version,title:copy.title,summary:copy.summary,sortDate,
   kind:releases.some(e=>e.publication.basis!=='play-production')?'released':'observed',releases});
  for(const e of releases) consumed.add(e.id);
 }
 for(const [androidId,iosId] of pairs) {
  const android=byId.get(androidId), ios=byId.get(iosId);
  if(!android || !ios || consumed.has(androidId) || consumed.has(iosId) ||
     android.platform!=='android' || ios.platform!=='ios' ||
     android.app!==ios.app || android.version!==ios.version) continue;
  add(`${ios.app}-shared-${ios.version}`,android,[ios,android]);
 }
 for(const e of byId.values()) if(!consumed.has(e.id)) add(e.id,e,[e]);
 return cards.sort((a,b)=>b.sortDate.localeCompare(a.sortDate)||a.id.localeCompare(b.id));
}

export const archiveReleaseCards = buildReleaseCards(publicArchiveEvents);
