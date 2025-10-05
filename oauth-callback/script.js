// /oauth-callback/script.js
// Tries to open custom scheme (yash://) then falls back to universal https link (which can also open your app if app links are configured)

(function () {
  const log = (s) => { const el = document.getElementById('msg'); if(el) el.textContent = s; };

  // parse both querystring and hash params
  const params = (() => {
    const p = new URLSearchParams(window.location.search || window.location.hash || '');
    // also if redirected with #... (some OAuth flows)
    if (!p.toString() && window.location.hash) {
      const hash = window.location.hash.replace(/^#/, '');
      return new URLSearchParams(hash);
    }
    return p;
  })();

  const paramPairs = {};
  for (const [k,v] of params.entries()) paramPairs[k] = v;

  // build param string to forward to app
  const forwarded = Object.keys(paramPairs).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(paramPairs[k])}`).join('&');

  const schemeUrl = `yash://oauth${forwarded ? '?' + forwarded : ''}`;
  const universalUrl = `https://yashbook.online/launch${forwarded ? '?' + forwarded : ''}`;

  // manual open button
  const manual = document.getElementById('open-manual');
  if (manual) {
    manual.href = schemeUrl;
    manual.addEventListener('click', (e) => {
      e.preventDefault();
      tryOpen(schemeUrl, () => { window.location.href = universalUrl; });
    });
  }

  // Auto-open on mobile
  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    log('Opening the Yash app…');
    tryOpen(schemeUrl, () => {
      // small delay then try universal link (if you configured App Links / Universal Links this should open your app too)
      setTimeout(() => { window.location.href = universalUrl; }, 400);
    });
  } else {
    // Desktop: instruct the user
    log('Open this page on your phone to complete sign-in.');
    if (manual) manual.style.display = 'inline-block';
  }

  function tryOpen(url, fallback) {
    // attempt navigation — works on many mobile browsers
    window.location = url;
    // fallback if still on this page after 800ms
    setTimeout(() => { fallback && fallback(); }, 800);
  }
})();
