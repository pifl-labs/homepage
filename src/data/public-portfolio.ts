/** Verified company-public product inventory, not the curated website appList.
 * KR Android evidence proves these products are public; it is not iOS/region
 * parity, a native-app quality audit, or a permanent upper bound on the company.
 * Update only from a newly verified public inventory, never internal tests. */
export const publicPortfolioEvidence = Object.freeze({
  observedAt: "2026-11-15T21:36:03.916Z",
  sourceURL: "https://play.google.com/store/apps/dev?id=8852533891626306957&hl=ko&gl=KR",
  market: 'KR',
  platform: 'Android',
  packages: Object.freeze([
    "com.pifl.pipi.bp",
    "com.pifl.pipi.bridge",
    "com.pifl.pipi.dday",
    "com.pifl.pipi.draw",
    "com.pifl.pipi.dream",
    "com.pifl.pipi.focus",
    "com.pifl.pipi.hello",
    "com.pifl.pipi.kkachi",
    "com.pifl.pipi.log",
    "com.pifl.pipi.sky",
    "com.pifl.pipi.spend",
    "com.pifl.pipi.sudoku",
    "com.pifl.pipi.thus",
    "com.pifl.pipi.tide",
    "com.pifl.pipi.words",
    "com.pifl.pipi.wordvoyage"
]),
});
export const verifiedPublicAppCount = publicPortfolioEvidence.packages.length;
