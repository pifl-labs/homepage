// /go/tiktok — OS 감지로 해당 스토어 버튼만 노출 (CSP script-src 'self' 준수, head 동기 실행)
(function () {
  var ua = navigator.userAgent || '';
  var isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/.test(ua);
  if (isIOS) {
    document.documentElement.classList.add('os-ios');
  } else if (isAndroid) {
    document.documentElement.classList.add('os-android');
  }
})();
