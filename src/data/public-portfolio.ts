/** Verified company-public product inventory, not the curated website appList.
 * KR Android evidence proves these products are public; it is not iOS/region
 * parity, a native-app quality audit, or a permanent upper bound on the company.
 * Update only from a newly verified public inventory, never internal tests. */
export const publicPortfolioEvidence = Object.freeze({
  observedAt: "2026-11-09T23:28:49.202263+00:00",
  sourceURL: "https://play.google.com/store/apps/developer?id=PiFl+Labs&hl=ko&gl=KR",
  market: 'KR',
  platform: 'Android',
  packages: Object.freeze([
    "com.pifl.pipi.bp",
    "com.pifl.pipi.bridge",
    "com.pifl.pipi.dday",
    "com.pifl.pipi.draw",
    "com.pifl.pipi.focus",
    "com.pifl.pipi.hello",
    "com.pifl.pipi.kkachi",
    "com.pifl.pipi.log",
    "com.pifl.pipi.spend",
    "com.pifl.pipi.sudoku",
    "com.pifl.pipi.thus",
    "com.pifl.pipi.tide",
    "com.pifl.pipi.words",
    "com.pifl.pipi.wordvoyage"
]),
});
export const verifiedPublicAppCount = publicPortfolioEvidence.packages.length;
