// PiPi D-Day "선원 초대" 랜딩 클라이언트 로직.
// public/ 정적 파일 — CSP(script-src 'self')를 만족하도록 동일출처 외부 스크립트로
// 서빙한다(인라인 금지). 순수 JS (브라우저 그대로 실행, 컴파일 없음).
(function () {
  'use strict';

  // 카테고리 → 이모지 (앱 lib/domain/models/dday_category.dart 와 동일)
  var CATEGORY_EMOJI = {
    voyage: '🗺️',
    challenge: '⚡',
    treasure: '💎',
    birthday: '🎂',
    eternal: '💍',
    arrival: '⚓',
    departure: '🚢',
    free: '🏴‍☠️',
  };

  var DD_LABELS = {
    ko: { future: '남은 항해', today: '오늘 도착!', past: '지난 항해' },
    en: { future: 'days to go', today: 'Arrives today!', past: 'days since' },
    ja: { future: '航海まで', today: '本日到着！', past: '航海から' },
  };

  var card = document.getElementById('invite-card');
  if (!card) return;

  var bodyEl = card.querySelector('.invite-card-body');
  var loadingEl = card.querySelector('.invite-card-loading');
  var invalidEl = card.querySelector('.invite-card-invalid');

  var params = new URLSearchParams(location.search);
  var rawTitle = (params.get('title') || '').trim();
  var rawDate = (params.get('date') || '').trim();
  var rawCategory = (params.get('category') || 'free').trim();
  var rawColor = params.get('color');

  function parseDate(raw) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    var dt = new Date(y, mo - 1, d);
    // 정규화로 잘못된 날짜(2026-02-30)가 다른 달로 넘어가면 거부.
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
      return null;
    }
    return dt;
  }

  function colorToHex(raw) {
    if (!raw) return null;
    var n = /^0x/i.test(raw) ? parseInt(raw.slice(2), 16) : parseInt(raw, 10);
    if (!isFinite(n)) return null;
    var rgb = (n >>> 0) & 0xffffff;
    return '#' + rgb.toString(16).padStart(6, '0');
  }

  function daysBetween(target) {
    var now = new Date();
    var a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    var b = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
    return Math.round((b - a) / 86400000);
  }

  function fmtDate(dt) {
    var lang = document.documentElement.lang || 'en';
    try {
      return new Intl.DateTimeFormat(lang, {
        year: 'numeric', month: 'long', day: 'numeric',
      }).format(dt);
    } catch (e) {
      return dt.toISOString().slice(0, 10);
    }
  }

  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }

  var date = parseDate(rawDate);
  var valid = rawTitle.length > 0 && date !== null;

  hide(loadingEl);

  if (!valid) {
    show(invalidEl);
    card.setAttribute('data-state', 'invalid');
  } else {
    show(bodyEl);
    card.setAttribute('data-state', 'ready');

    var emojiEl = document.getElementById('invite-emoji');
    var titleEl = document.getElementById('invite-title');
    var dateEl = document.getElementById('invite-date');
    var badgeEl = document.getElementById('invite-dday-badge');
    var labelEl = document.getElementById('invite-dday-label');

    if (emojiEl) emojiEl.textContent = CATEGORY_EMOJI[rawCategory] || CATEGORY_EMOJI.free;
    if (titleEl) titleEl.textContent = rawTitle;
    if (dateEl) dateEl.textContent = fmtDate(date);

    var diff = daysBetween(date);
    var lang = document.documentElement.lang || 'en';
    var labels = DD_LABELS[lang] || DD_LABELS.en;
    if (badgeEl) {
      badgeEl.textContent = diff > 0 ? 'D-' + diff : diff === 0 ? 'D-DAY' : 'D+' + (-diff);
    }
    if (labelEl) {
      labelEl.textContent = diff > 0 ? labels.future : diff === 0 ? labels.today : labels.past;
    }

    var accent = colorToHex(rawColor);
    if (accent) card.style.setProperty('--accent', accent);
  }

  // ── "앱에서 열기" 버튼 ──────────────────────────────────────────
  // 이 페이지에 도달 = Universal/App Link 자동열기 실패(대개 미설치).
  // 커스텀 스킴(pipi-dday://) 시도 + 실패 시 스토어 폴백.
  var openBtn = document.getElementById('open-app');
  var playEl = document.getElementById('store-play');
  var appleEl = document.getElementById('store-apple');
  var playHref = playEl ? playEl.href : '';
  var appleHref = appleEl ? appleEl.href : '';

  var ua = navigator.userAgent || '';
  var isAndroid = /android/i.test(ua);
  var isIOS = /iphone|ipad|ipod/i.test(ua) ||
    (/Macintosh/.test(ua) && 'ontouchend' in document);

  var query = location.search; // 이미 인코딩됨 — 그대로 전달

  if (openBtn && valid) {
    openBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (isAndroid) {
        var fallback = encodeURIComponent(playHref);
        location.href =
          'intent://import' + query +
          '#Intent;scheme=pipi-dday;package=com.pifl.pipi.dday;S.browser_fallback_url=' +
          fallback + ';end';
      } else if (isIOS) {
        var fellBack = false;
        var timer = window.setTimeout(function () {
          if (!fellBack && document.visibilityState === 'visible') {
            location.href = appleHref;
          }
        }, 1200);
        var cancel = function () {
          fellBack = true;
          window.clearTimeout(timer);
        };
        document.addEventListener('visibilitychange', cancel, { once: true });
        window.addEventListener('pagehide', cancel, { once: true });
        location.href = 'pipi-dday://import' + query;
      } else {
        location.href = appleHref || playHref;
      }
    });
  } else if (openBtn && !valid) {
    openBtn.setAttribute('href', appleHref || playHref);
  }
})();
