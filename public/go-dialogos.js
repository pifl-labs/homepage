// /go/dialogos — 방문자 OS·언어로 스토어 버튼과 문구를 고른다 (CSP script-src 'self', head 동기 실행)
(function () {
  var root = document.documentElement;
  var ua = navigator.userAgent || '';
  // Android 먼저: 터치 되는 Mac 판별(iPad 데스크톱 모드)에 Android 에뮬레이션이 걸리지 않게.
  if (/Android/.test(ua)) {
    root.classList.add('os-android');
  } else if (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  ) {
    root.classList.add('os-ios');
  }
  var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  for (var i = 0; i < langs.length; i++) {
    // 앞 부분만: 'ko-KR' → 'ko'. 'kok'(콘칸어)·'jam' 이 ko·ja 로 읽히지 않게 자르지 않고 나눈다.
    var code = String(langs[i]).toLowerCase().split('-')[0];
    if (code === 'ko' || code === 'ja' || code === 'en') {
      if (code !== 'en') root.classList.add('lang-' + code);
      root.setAttribute('lang', code);
      return;
    }
  }
})();
