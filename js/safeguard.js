export function initSafeguards() {
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());

  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = '';
  });

  history.pushState(null, '', location.href);
  window.addEventListener('popstate', () => {
    history.pushState(null, '', location.href);
  });
}
