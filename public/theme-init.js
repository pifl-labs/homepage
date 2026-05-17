/* theme-init.js — paint 전 테마/글자크기 적용 (FOUC 방지)
   --------------------------------------------------------------
   CSP(script-src 'self')가 인라인 스크립트를 금지하므로 외부 파일로
   분리하고 <head> 에서 동기 로드한다. 동기 외부 스크립트는 파싱을
   차단하므로 body 렌더 전에 실행 → 깜빡임 없음.

   저장 키: pifl-theme(auto|light|dark), pifl-type-scale(large|xlarge)
   토글 핸들러는 script.js 가 담당. */
(function () {
  var root = document.documentElement;

  try {
    var scale = localStorage.getItem('pifl-type-scale');
    if (scale === 'large' || scale === 'xlarge') {
      root.dataset.typeScale = scale;
    }
  } catch (e) {}

  try {
    var theme = localStorage.getItem('pifl-theme');
    var resolved =
      theme === 'light' || theme === 'dark'
        ? theme
        : window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark';
    root.dataset.theme = resolved;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', resolved === 'light' ? '#f4f7fb' : '#020617');
    }
  } catch (e) {}
})();
