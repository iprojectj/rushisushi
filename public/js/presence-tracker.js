/* Rushi presence tracker — anonymous heartbeat via Supabase Realtime Presence.
   No PII, no cookies. Sends only: timezone, path, timestamp. */
(function () {
  if (window.__rushiPresenceLoaded) return;
  window.__rushiPresenceLoaded = true;

  var SUPABASE_URL = "https://lcvditqesiesrpngmksp.supabase.co";
  var SUPABASE_KEY = "sb_publishable_8tN-U-SBvpJEyXZ0cWj5mA_-5jG-0hW";

  function start(supabaseLib) {
    try {
      var client = supabaseLib.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      });
      var key = "v-" + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random());
      var channel = client.channel("site-presence", {
        config: { presence: { key: key } },
      });
      var tz;
      try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { tz = "UTC"; }

      channel.subscribe(function (status) {
        if (status === "SUBSCRIBED") {
          channel.track({ tz: tz, path: location.pathname, at: Date.now() });
        }
      });

      // Refresh presence periodically so it doesn't stale
      setInterval(function () {
        if (document.visibilityState === "visible") {
          channel.track({ tz: tz, path: location.pathname, at: Date.now() });
        }
      }, 25000);

      window.addEventListener("beforeunload", function () {
        try { channel.untrack(); } catch (e) {}
      });
    } catch (e) {
      /* silent — never break the site */
    }
  }

  // Load supabase-js from CDN (module) with a script-tag fallback.
  var s = document.createElement("script");
  s.type = "module";
  s.textContent =
    "import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';" +
    "window.__rushiSupabase = { createClient: createClient };" +
    "window.dispatchEvent(new Event('rushi-sb-ready'));";
  window.addEventListener("rushi-sb-ready", function () {
    start(window.__rushiSupabase);
  });
  document.head.appendChild(s);
})();
