/* Mobile App Lock — força comportamento de app nativo:
   - Bloqueia pinch zoom (gesturestart/gesturechange/gestureend no iOS Safari)
   - Bloqueia double-tap zoom
   - Bloqueia ctrl+wheel zoom (desktop)
   - Bloqueia pull-to-refresh / overscroll horizontal
   - Garante text-size-adjust e overflow-x oculto
*/
(function () {
  // CSS de proteção global
  try {
    var style = document.createElement('style');
    style.textContent = [
      'html,body{',
      '  -webkit-text-size-adjust:100%;',
      '  -ms-text-size-adjust:100%;',
      '  text-size-adjust:100%;',
      '  overscroll-behavior:none;',
      '  overflow-x:hidden;',
      '  max-width:100vw;',
      '  touch-action:pan-x pan-y;',
      '  -webkit-tap-highlight-color:transparent;',
      '}',
      '*{ -webkit-touch-callout:none; }',
      'input,textarea,select,button{ font-size:16px !important; }', // evita zoom de foco no iOS
      'img{ max-width:100%; height:auto; }',
    ].join('');
    document.head.appendChild(style);
  } catch (e) {}

  // Reforça viewport (caso alguma página tenha esquecido)
  try {
    var vp = document.querySelector('meta[name="viewport"]');
    if (!vp) {
      vp = document.createElement('meta');
      vp.name = 'viewport';
      document.head.appendChild(vp);
    }
    vp.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover'
    );
  } catch (e) {}

  // Bloqueia gestos de pinça no iOS Safari
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (evt) {
    document.addEventListener(evt, function (e) { e.preventDefault(); }, { passive: false });
  });

  // Bloqueia double-tap zoom
  var lastTouch = 0;
  document.addEventListener('touchend', function (e) {
    var now = Date.now();
    if (now - lastTouch <= 350) { e.preventDefault(); }
    lastTouch = now;
  }, { passive: false });

  // Bloqueia ctrl+wheel zoom (desktop / trackpad)
  document.addEventListener('wheel', function (e) {
    if (e.ctrlKey) { e.preventDefault(); }
  }, { passive: false });

  // Bloqueia atalhos de zoom de teclado
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].indexOf(e.key) !== -1) {
      e.preventDefault();
    }
  });

  // Bloqueia pinch via touchmove com 2+ dedos
  document.addEventListener('touchmove', function (e) {
    if (e.touches && e.touches.length > 1) { e.preventDefault(); }
  }, { passive: false });
})();
