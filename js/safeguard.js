export function initSafeguards() {
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());

  let lastTouchStart = 0;
  document.addEventListener('touchstart', (e) => {
    const now = Date.now();
    if (now - lastTouchStart <= 400) {
      e.preventDefault();
    }
    lastTouchStart = now;
  }, { passive: false });

  document.addEventListener('dblclick', (e) => {
    e.preventDefault();
  });

  window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = '';
  });

  history.pushState(null, '', location.href);
  window.addEventListener('popstate', () => {
    history.pushState(null, '', location.href);
  });
}
