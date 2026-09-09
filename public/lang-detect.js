/* lang-detect.js — 루트(/) 진입 시 클라이언트 언어 감지 폴백.
   ------------------------------------------------------------
   프로덕션에서는 functions/_middleware.ts 가 서버에서 302 처리하므로
   이 스크립트는 거의 실행되지 않는다. 미들웨어가 안 도는 환경
   (로컬 dev, 기타 호스팅)에서 navigator.language 로 /ko·/en·/ja 라우팅.
   CSP(script-src 'self') 준수 위해 외부 파일로 분리. */
(function () {
  try {
    var supported = ['ko', 'en', 'ja'];
    var match = function (l) {
      var tag = (l || '').toLowerCase().match(/^([a-z]{2,8})(?:-[a-z0-9]{1,8})*$/);
      return tag && supported.indexOf(tag[1]) !== -1 ? tag[1] : null;
    };
    var pref = null;
    try {
      var cookieMatch = document.cookie.match(/(?:^|;\s*)pref-lang=([^;]+)/);
      var saved = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
      if (supported.indexOf(saved) !== -1) pref = saved;
    } catch (_) {
      // Malformed/blocked cookies are not a reason to lose the entry campaign.
    }
    if (!pref && navigator.languages && navigator.languages.length) {
      for (var i = 0; i < navigator.languages.length; i++) {
        var m = match(navigator.languages[i]);
        if (m) { pref = m; break; }
      }
    }
    if (!pref) pref = match(navigator.language) || 'ko';
    try {
      document.cookie = 'pref-lang=' + pref + '; path=/; max-age=' + (60 * 60 * 24 * 365) + '; SameSite=Lax';
    } catch (_) {
      // Navigation still works when the browser disallows preference storage.
    }
    window.location.replace('/' + pref + '/' + window.location.search + window.location.hash);
  } catch (_) {
    window.location.replace('/ko/' + window.location.search + window.location.hash);
  }
})();
