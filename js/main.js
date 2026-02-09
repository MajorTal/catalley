// main.js - Entry point, view switching, toast system

import { loadState } from './state.js';
import { startStreet, stopStreet, resumeStreet } from './cat-walker.js';
import { renderGallery, initGalleryActions, updateStats } from './gallery.js';
import { initMusic } from './music.js';

// ===== Toast System =====
export function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== View Switching =====
let currentView = 'street';

function switchView(viewName) {
  if (viewName === currentView) return;

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(`view-${viewName}`).classList.add('active');
  document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

  if (viewName === 'street') {
    resumeStreet();
  } else {
    stopStreet();
  }

  if (viewName === 'alley') {
    renderGallery();
  }

  currentView = viewName;
}

// ===== Init =====
function init() {
  loadState();

  // Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Start the street
  startStreet();
  initGalleryActions();
  updateStats();
  initMusic();
}

document.addEventListener('DOMContentLoaded', init);
