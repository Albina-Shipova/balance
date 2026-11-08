// Один экран приветствия на вкладку, общий для главной и страницы цен.
(() => {
  const key = 'balance-intro-seen';
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch { /* В приватном режиме сайт работает и без хранилища. */ }

  const root = document.documentElement;
  const started = performance.now();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let closing = false;
  window.balanceLoading = true;
  root.classList.add('intro-active');

  function finish() {
    if (closing) return;
    closing = true;
    root.classList.add('intro-leaving');
    setTimeout(() => {
      root.classList.remove('intro-active', 'intro-leaving');
      document.querySelector('.site-intro')?.remove();
      window.balanceLoading = false;
      document.dispatchEvent(new Event('balance:ready'));
    }, reduced ? 0 : 500);
  }

  // Внешние шрифты и карты никогда не задерживают доступ к странице.
  setTimeout(finish, 2400);
  document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero-procedure');
    const imageReady = hero?.decode ? hero.decode().catch(() => {}) : Promise.resolve();
    const fontsReady = document.fonts?.ready || Promise.resolve();
    Promise.all([imageReady, fontsReady]).then(() => {
      setTimeout(finish, Math.max(0, 1000 - (performance.now() - started)));
    });
    document.addEventListener('pointerdown', finish, {once: true});
    document.addEventListener('keydown', finish, {once: true});
  }, {once: true});
  window.addEventListener('pageshow', event => {
    if (event.persisted) finish();
  });
})();
