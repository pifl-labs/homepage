// /go/dialogos — 방문자 OS·언어로 스토어 버튼과 문구를 고른다 (CSP script-src 'self', head 동기 실행)
(function () {
  var root = document.documentElement;
  var ua = navigator.userAgent || '';
  var isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) {
    root.classList.add('os-ios');
  } else if (/Android/.test(ua)) {
    root.classList.add('os-android');
  }
  var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  for (var i = 0; i < langs.length; i++) {
    var code = String(langs[i]).toLowerCase().slice(0, 2);
    if (code === 'ko' || code === 'ja' || code === 'en') {
      if (code !== 'en') root.classList.add('lang-' + code);
      root.setAttribute('lang', code);
      return;
    }
  }
})();
