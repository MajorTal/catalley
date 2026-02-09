// gallery.js - Gallery rendering, save/delete

import { DISPLAY_SIZE, drawComposedCat, SLOTS } from './sprites.js';
import { getState, saveCatToGallery, deleteCatFromGallery, resetCurrentCat } from './state.js';
import { showToast } from './main.js';
import { updateYourCatPanel } from './cat-walker.js';

export function renderGallery() {
  const state = getState();
  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');

  grid.innerHTML = '';

  if (state.gallery.length === 0) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  for (const cat of state.gallery) {
    const card = document.createElement('div');
    card.className = 'gallery-card';

    const cvs = document.createElement('canvas');
    cvs.width = DISPLAY_SIZE;
    cvs.height = DISPLAY_SIZE;
    const cCtx = cvs.getContext('2d');
    drawComposedCat(cCtx, cat.base, cat.accessories, 0, 0, false);

    const nameEl = document.createElement('div');
    nameEl.className = 'cat-name';
    nameEl.textContent = cat.name;

    const dateEl = document.createElement('div');
    dateEl.className = 'cat-date';
    dateEl.textContent = new Date(cat.createdAt).toLocaleDateString();

    const releaseBtn = document.createElement('button');
    releaseBtn.className = 'btn-release';
    releaseBtn.textContent = 'Release';
    releaseBtn.addEventListener('click', () => {
      if (confirm(`Release ${cat.name}? They'll wander off forever...`)) {
        deleteCatFromGallery(cat.id);
        renderGallery();
        showToast(`${cat.name} wandered off into the alley...`);
        updateStats();
      }
    });

    card.appendChild(cvs);
    card.appendChild(nameEl);
    card.appendChild(dateEl);
    card.appendChild(releaseBtn);
    grid.appendChild(card);
  }
}

export function initGalleryActions() {
  const saveBtn = document.getElementById('save-cat-btn');
  const newBtn = document.getElementById('new-cat-btn');
  const nameInput = document.getElementById('cat-name-input');

  saveBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) {
      showToast('Give your cat a name first!');
      nameInput.focus();
      return;
    }

    const state = getState();
    const hasAcc = SLOTS.some(s => state.currentCat.accessories[s] !== null);
    if (!hasAcc) {
      showToast('Steal some accessories first!');
      return;
    }

    const cat = saveCatToGallery(name);
    showToast(`${cat.name} saved to The Alley!`);
    nameInput.value = '';

    resetCurrentCat();
    updateYourCatPanel();
    updateStats();
  });

  newBtn.addEventListener('click', () => {
    resetCurrentCat();
    nameInput.value = '';
    updateYourCatPanel();
    showToast('Fresh cat ready!');
  });
}

export function updateStats() {
  const state = getState();
  const el = document.getElementById('stats-display');
  el.textContent = `Cats: ${state.stats.catsCreated} | Stolen: ${state.stats.accessoriesStolen}`;
}
