export function initSafeguards() {
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());

  let lastTouchStart = 0;
  document.addEventListener('touchstart', (e) => {
    if (e.target.closest('button, a, input, [role="button"]')) return;
    const now = Date.now();
    if (now - lastTouchStart <= 400) {
      e.preventDefault();
    }
    lastTouchStart = now;
  }, { passive: false });

  document.addEventListener('dblclick', (e) => {
    e.preventDefault();
  });

  history.pushState(null, '', location.href);
  window.addEventListener('popstate', () => {
    history.pushState(null, '', location.href);
  });
}
