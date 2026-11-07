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
  let drag = null;
  reviewTrack.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = {id: event.pointerId, x: event.clientX, scroll: reviewTrack.scrollLeft};
    reviewTrack.setPointerCapture(event.pointerId);
  });
  reviewTrack.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const distance = event.clientX - drag.x;
    if (Math.abs(distance) > 5) reviewTrack.classList.add('is-dragging');
    if (reviewTrack.classList.contains('is-dragging')) {
      reviewTrack.scrollLeft = drag.scroll - distance;
    }
  });
  function finishReviewDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const wasDragging = reviewTrack.classList.contains('is-dragging');
    drag = null;
    reviewTrack.classList.remove('is-dragging');
    if (reviewTrack.hasPointerCapture(event.pointerId)) reviewTrack.releasePointerCapture(event.pointerId);
    if (wasDragging) {
      const step = reviewStep();
      reviewTrack.scrollTo({left: Math.round(reviewTrack.scrollLeft / step) * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    }
  }
  reviewTrack.addEventListener('pointerup', finishReviewDrag);
  reviewTrack.addEventListener('pointercancel', finishReviewDrag);
  reviewTrack.addEventListener('lostpointercapture', finishReviewDrag);
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

const resultsTrack = document.querySelector('#results-track');
if (resultsTrack) {
  const cards = [...resultsTrack.querySelectorAll('[data-result]')];
  const previous = document.querySelector('[data-result-prev]');
  const next = document.querySelector('[data-result-next]');
  const position = document.querySelector('.results-position');
  const dialog = document.querySelector('.result-dialog');
  const dialogImage = dialog.querySelector('img');
  const dialogPrevious = dialog.querySelector('[data-result-dialog-prev]');
  const dialogNext = dialog.querySelector('[data-result-dialog-next]');
  let current = 0;
  let opener = null;
  let drag = null;
  let suppressClick = false;
  const motion = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  const step = () => cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : resultsTrack.clientWidth;
  function updateResults() {
    const first = Math.min(cards.length - 1, Math.round(resultsTrack.scrollLeft / step()));
    const visible = Math.max(1, Math.round(resultsTrack.clientWidth / step()));
    previous.disabled = resultsTrack.scrollLeft <= 2;
    next.disabled = resultsTrack.scrollLeft >= resultsTrack.scrollWidth - resultsTrack.clientWidth - 2;
    position.textContent = `${first + 1}–${Math.min(first + visible, cards.length)} / ${cards.length}`;
  }
  function moveResults(direction) {
    resultsTrack.scrollBy({left: direction * step(), behavior: motion()});
  }
  previous.addEventListener('click', () => moveResults(-1));
  next.addEventListener('click', () => moveResults(1));
  resultsTrack.addEventListener('scroll', updateResults, {passive:true});
  new ResizeObserver(updateResults).observe(resultsTrack);
  document.querySelector('.results-controls').hidden = false;
  updateResults();

  function showResult(index) {
    current = Math.max(0, Math.min(index, cards.length - 1));
    const original = cards[current].querySelector('img');
    dialogImage.src = cards[current].href;
    dialogImage.alt = original.alt;
    dialog.querySelector('.result-dialog-position').textContent = `Фото ${current + 1} из ${cards.length}`;
    dialogPrevious.disabled = current === 0;
    dialogNext.disabled = current === cards.length - 1;
  }
  cards.forEach((card, index) => card.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); return; }
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    opener = card;
    showResult(index);
    dialog.showModal();
  }));
  dialog.querySelector('.result-dialog-close').addEventListener('click', () => dialog.close());
  dialogPrevious.addEventListener('click', () => showResult(current - 1));
  dialogNext.addEventListener('click', () => showResult(current + 1));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus({preventScroll:true}));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showResult(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  resultsTrack.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveResults(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  resultsTrack.addEventListener('dragstart', event => event.preventDefault());
  resultsTrack.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    suppressClick = false;
    drag = {id:event.pointerId, x:event.clientX, scroll:resultsTrack.scrollLeft, moved:false};
  });
  resultsTrack.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const distance = event.clientX - drag.x;
    if (!drag.moved && Math.abs(distance) > 6) {
      drag.moved = true;
      suppressClick = true;
      resultsTrack.classList.add('is-dragging');
      resultsTrack.setPointerCapture(event.pointerId);
    }
    if (drag.moved) resultsTrack.scrollLeft = drag.scroll - distance;
  });
  function finishResultsDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved;
    drag = null;
    resultsTrack.classList.remove('is-dragging');
    if (resultsTrack.hasPointerCapture(event.pointerId)) resultsTrack.releasePointerCapture(event.pointerId);
    if (moved) {
      resultsTrack.scrollTo({left:Math.round(resultsTrack.scrollLeft / step()) * step(), behavior:motion()});
      setTimeout(() => { suppressClick = false; }, 0);
    }
  }
  resultsTrack.addEventListener('pointerup', finishResultsDrag);
  resultsTrack.addEventListener('pointercancel', finishResultsDrag);
  resultsTrack.addEventListener('lostpointercapture', finishResultsDrag);
  window.addEventListener('pointerup', finishResultsDrag);
}
