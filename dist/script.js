const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Закрыть меню' : 'Открыть меню');
  navigation.classList.toggle('is-open', expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});
document.getElementById('year').textContent = new Date().getFullYear();

function openCatalogCategory() {
  const target = document.getElementById(location.hash.slice(1));
  if (target?.classList.contains('catalog-group')) target.open = true;
}
window.addEventListener('hashchange', openCatalogCategory);
document.querySelectorAll('a[href^="#catalog-"]').forEach(link => {
  link.addEventListener('click', () => {
    const category = document.getElementById(link.hash.slice(1));
    if (category) category.open = true;
  });
});
openCatalogCategory();

const reviewTrack = document.querySelector('#review-track');
if (reviewTrack) {
  const previousReview = document.querySelector('[data-review-prev]');
  const nextReview = document.querySelector('[data-review-next]');
  const reviewPosition = document.querySelector('.review-position');
  const reviewCards = [...reviewTrack.querySelectorAll('.review-card')];
  document.querySelector('.review-controls').hidden = false;
  function reviewStep() {
    return reviewCards.length > 1 ? reviewCards[1].offsetLeft - reviewCards[0].offsetLeft : reviewTrack.clientWidth;
  }
  function updateReviewControls() {
    const step = reviewStep();
    const first = Math.round(reviewTrack.scrollLeft / step);
    const visible = Math.max(1, Math.round(reviewTrack.clientWidth / step));
    previousReview.disabled = reviewTrack.scrollLeft <= 2;
    nextReview.disabled = reviewTrack.scrollLeft >= reviewTrack.scrollWidth - reviewTrack.clientWidth - 2;
    reviewPosition.textContent = `${first + 1}–${Math.min(first + visible, reviewCards.length)} / ${reviewCards.length}`;
  }
  function moveReview(direction) {
    reviewTrack.scrollBy({left: direction * reviewStep(), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  previousReview.addEventListener('click', () => moveReview(-1));
  nextReview.addEventListener('click', () => moveReview(1));
  reviewTrack.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveReview(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  reviewTrack.addEventListener('scroll', updateReviewControls, {passive:true});
  new ResizeObserver(updateReviewControls).observe(reviewTrack);
  updateReviewControls();
}