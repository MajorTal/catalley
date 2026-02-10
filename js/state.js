// state.js - Game state + localStorage persistence

const STORAGE_KEY = 'catalley_state';
const STATE_VERSION = 1;

function createFreshCat() {
  return {
    base: 'orange',
    accessories: { hat: null, glasses: null, scarf: null, collar: null, accessory: null }
  };
}

function defaultState() {
  return {
    version: STATE_VERSION,
    currentCat: createFreshCat(),
    gallery: [],
    stats: { catsCreated: 0, accessoriesStolen: 0 }
  };
}

let state = defaultState();

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && saved.version === STATE_VERSION) {
        state = saved;
      }
    }
  } catch (e) {
    console.warn('Failed to load state, using default', e);
  }
  return state;
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state', e);
  }
}

export function getState() {
  return state;
}

export function setAccessory(slot, id) {
  state.currentCat.accessories[slot] = id;
  state.stats.accessoriesStolen++;
  saveState();
}

export function setBase(baseId) {
  state.currentCat.base = baseId;
  saveState();
}

export function saveCatToGallery(name) {
  const cat = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: name || 'Unnamed Cat',
    base: state.currentCat.base,
    accessories: { ...state.currentCat.accessories },
    createdAt: Date.now()
  };
  state.gallery.unshift(cat);
  state.stats.catsCreated++;
  saveState();
  return cat;
}

export function deleteCatFromGallery(id) {
  state.gallery = state.gallery.filter(c => c.id !== id);
  saveState();
}

export function swapWithGallery(galleryId, streetName) {
  const idx = state.gallery.findIndex(c => c.id === galleryId);
  if (idx === -1) return null;

  const galleryCat = state.gallery[idx];

  // Save current street cat into the gallery slot
  const hasAcc = Object.values(state.currentCat.accessories).some(v => v !== null);
  if (hasAcc || state.currentCat.base !== 'orange') {
    state.gallery[idx] = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: streetName || 'Unnamed',
      base: state.currentCat.base,
      accessories: { ...state.currentCat.accessories },
      createdAt: Date.now()
    };
  } else {
    // Street cat is blank, just remove the gallery entry
    state.gallery.splice(idx, 1);
  }

  // Load gallery cat onto the street
  state.currentCat.base = galleryCat.base;
  state.currentCat.accessories = { ...galleryCat.accessories };

  saveState();
  return galleryCat;
}

export function resetCurrentCat() {
  state.currentCat = createFreshCat();
  saveState();
}
