/* Rushi tracker — anonymous heartbeat to our own server. No cookies, no personal data.
   Steps: 1 entrou, 2 carrinho, 3 checkout, 4 pagamento, 5 PIX gerado, 6 pago. */
(function () {
  if (window.__rushiPresenceLoaded) return;
  window.__rushiPresenceLoaded = true;

  var KEY = "rushi_sid";
  var sid;
  try { sid = sessionStorage.getItem(KEY); } catch (e) {}
  if (!sid) {
    sid = "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    try { sessionStorage.setItem(KEY, sid); } catch (e) {}
  }

  var path = location.pathname;
  var pageStep = /obrigado/.test(path) ? 6 : /pedido/.test(path) ? 5 : 1;
  var step = pageStep;
  var qs = new URLSearchParams(location.search);
  var utmS = qs.get("utm_source"), utmC = qs.get("utm_campaign");
  try {
    if (utmS) sessionStorage.setItem("rushi_us", utmS); else utmS = sessionStorage.getItem("rushi_us");
    if (utmC) sessionStorage.setItem("rushi_uc", utmC); else utmC = sessionStorage.getItem("rushi_uc");
  } catch (e) {}
  var device = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop";
  var first = true;

  function send() {
    var body = JSON.stringify({ sid: sid, path: path, step: step, pv: first ? 1 : 0, us: utmS, uc: utmC, d: device });
    first = false;
    try {
      if (navigator.sendBeacon && navigator.sendBeacon("/api/public/track", new Blob([body], { type: "text/plain" }))) return;
    } catch (e) {}
    try { fetch("/api/public/track", { method: "POST", body: body, keepalive: true }); } catch (e) {}
  }

  window.rushiStep = function (n) {
    if (n > step) { step = n; send(); }
  };

  send();
  setInterval(function () { if (document.visibilityState === "visible") send(); }, 20000);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") send(); });
})();
