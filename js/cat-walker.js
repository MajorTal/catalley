// cat-walker.js - Cat spawning, walking, click handling, game loop

import {
  PIXEL_SCALE, DISPLAY_SIZE,
  drawComposedCat, pickRandomAccessories, pickRandomBase,
  ACCESSORIES, RARITY, SLOTS
} from './sprites.js';
import { getState, setAccessory } from './state.js';
import { showToast } from './main.js';

const MAX_CATS = 6;
const SPAWN_MIN = 1500;
const SPAWN_MAX = 4000;
const CAT_SPEED_MIN = 0.4;
const CAT_SPEED_MAX = 1.2;
const BOB_AMPLITUDE = 2;
const BOB_SPEED = 0.004;

let canvas, ctx;
let walkers = [];
let spawnTimer = 0;
let lastTime = 0;
let animFrame = null;
let streetActive = false;
let cssWidth = 0, cssHeight = 0; // logical (CSS) dimensions for coordinate math

// Background drawing data
const SKY_COLOR = '#1a1a3e';
const BUILDING_COLORS = ['#2a2a4e', '#252545', '#2e2e52', '#222240'];
const SIDEWALK_COLOR = '#555566';
const ROAD_COLOR = '#333344';
const ROAD_LINE_COLOR = '#555544';

let buildings = [];

function generateBuildings(width) {
  buildings = [];
  let x = 0;
  while (x < width + 100) {
    const w = 60 + Math.random() * 80;
    const h = 80 + Math.random() * 160;
    const color = BUILDING_COLORS[Math.floor(Math.random() * BUILDING_COLORS.length)];
    const windows = [];
    // Generate windows
    for (let wy = 10; wy < h - 20; wy += 24) {
      for (let wx = 8; wx < w - 8; wx += 18) {
        windows.push({
          x: wx, y: wy, w: 8, h: 10,
          lit: Math.random() > 0.4,
          color: Math.random() > 0.5 ? '#ffee88' : '#aaccff'
        });
      }
    }
    buildings.push({ x, w, h, color, windows });
    x += w + 2;
  }
}

function getGroundY(canvasHeight) {
  return canvasHeight - 70;
}

function drawBackground(width, height) {
  // Sky
  ctx.fillStyle = SKY_COLOR;
  ctx.fillRect(0, 0, width, height);

  // Stars
  ctx.fillStyle = '#ffffff44';
  for (let i = 0; i < 60; i++) {
    const sx = (i * 137 + 50) % width;
    const sy = (i * 89 + 20) % (height * 0.4);
    const size = (i % 3 === 0) ? 2 : 1;
    ctx.fillRect(sx, sy, size, size);
  }

  const groundY = getGroundY(height);

  // Buildings
  for (const b of buildings) {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, groundY - b.h, b.w, b.h);
    // Windows
    for (const w of b.windows) {
      ctx.fillStyle = w.lit ? w.color : '#111122';
      ctx.fillRect(b.x + w.x, groundY - b.h + w.y, w.w, w.h);
    }
    // Roof line
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(b.x, groundY - b.h, b.w, 2);
  }

  // Road
  ctx.fillStyle = ROAD_COLOR;
  ctx.fillRect(0, groundY, width, 50);

  // Road lines
  ctx.fillStyle = ROAD_LINE_COLOR;
  for (let x = 0; x < width; x += 40) {
    ctx.fillRect(x, groundY + 24, 20, 3);
  }

  // Sidewalk
  ctx.fillStyle = SIDEWALK_COLOR;
  ctx.fillRect(0, groundY - 5, width, 8);
  ctx.fillStyle = '#444455';
  ctx.fillRect(0, groundY + 48, width, 22);

  // Sidewalk lines
  ctx.fillStyle = '#4a4a5a';
  for (let x = 0; x < width; x += 30) {
    ctx.fillRect(x, groundY - 5, 1, 8);
    ctx.fillRect(x, groundY + 48, 1, 22);
  }
}

// ===== Walking Cats =====
function spawnCat(canvasWidth, canvasHeight) {
  if (walkers.length >= MAX_CATS) return;

  const goRight = Math.random() > 0.5;
  const speed = CAT_SPEED_MIN + Math.random() * (CAT_SPEED_MAX - CAT_SPEED_MIN);
  const groundY = getGroundY(canvasHeight);

  walkers.push({
    base: pickRandomBase(),
    accessories: Math.random() < 1/3 ? pickRandomAccessories(1, 1) : pickRandomAccessories(0, 0),
    x: goRight ? -DISPLAY_SIZE : canvasWidth + DISPLAY_SIZE,
    y: groundY - DISPLAY_SIZE + 4,
    speed: goRight ? speed : -speed,
    flipped: !goRight,
    bobOffset: Math.random() * 1000,
    clicked: false,
  });
}

function updateWalkers(dt, canvasWidth) {
  for (const w of walkers) {
    w.x += w.speed * dt * 0.06;
  }
  // Remove off-screen cats
  walkers = walkers.filter(w =>
    w.x > -DISPLAY_SIZE * 2 && w.x < canvasWidth + DISPLAY_SIZE * 2
  );
}

function drawWalkers(time) {
  for (const w of walkers) {
    const bob = Math.sin((time + w.bobOffset) * BOB_SPEED) * BOB_AMPLITUDE * PIXEL_SCALE;
    drawComposedCat(ctx, w.base, w.accessories, w.x, w.y + bob, w.flipped);
  }
}

// ===== Your Cat Panel =====
let yourCatCanvas, yourCatCtx;

export function updateYourCatPanel() {
  const state = getState();
  const cat = state.currentCat;

  if (!yourCatCanvas) {
    yourCatCanvas = document.getElementById('your-cat-canvas');
    yourCatCtx = yourCatCanvas.getContext('2d');
  }

  // Draw your cat
  yourCatCtx.clearRect(0, 0, yourCatCanvas.width, yourCatCanvas.height);
  drawComposedCat(yourCatCtx, cat.base, cat.accessories, 0, 0, false);

  // Update accessory list
  const listEl = document.getElementById('your-cat-accessories');
  const parts = [];
  for (const slot of SLOTS) {
    if (cat.accessories[slot]) {
      const acc = ACCESSORIES[cat.accessories[slot]];
      if (acc) {
        const color = RARITY[acc.rarity].color;
        parts.push(`<span style="color:${color}">${acc.name}</span>`);
      }
    }
  }
  listEl.innerHTML = parts.length > 0 ? parts.join(' &middot; ') : '<span style="color:#666">Click cats to steal!</span>';
}

// ===== Click Handling =====
function handleClick(e) {
  const rect = canvas.getBoundingClientRect();
  // Use CSS coordinates (matching our draw coordinates thanks to DPR transform)
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  // Check walkers in reverse (top-most first)
  for (let i = walkers.length - 1; i >= 0; i--) {
    const w = walkers[i];
    const time = performance.now();
    const bob = Math.sin((time + w.bobOffset) * BOB_SPEED) * BOB_AMPLITUDE * PIXEL_SCALE;
    const catX = w.x;
    const catY = w.y + bob;

    if (mx >= catX && mx <= catX + DISPLAY_SIZE &&
        my >= catY && my <= catY + DISPLAY_SIZE) {

      // Steal one random accessory from this cat
      const filledSlots = SLOTS.filter(slot => w.accessories[slot]);
      if (filledSlots.length > 0) {
        const slot = filledSlots[Math.floor(Math.random() * filledSlots.length)];
        const stolenId = w.accessories[slot];
        setAccessory(slot, stolenId);

        // Remove the accessory from the walker cat
        w.accessories[slot] = null;

        const acc = ACCESSORIES[stolenId];
        const rarity = RARITY[acc.rarity];
        showFloatingText(acc.name + '!', rarity.color, catX + DISPLAY_SIZE / 2, catY - 10);
      } else {
        showFloatingText('No accessories!', '#888', catX + DISPLAY_SIZE / 2, catY - 10);
      }

      updateYourCatPanel();
      break;
    }
  }
}

// ===== Floating Text =====
const floatingTexts = [];

function showFloatingText(text, color, x, y) {
  floatingTexts.push({ text, color, x, y, startTime: performance.now(), duration: 1200 });
}

function drawFloatingTexts(time) {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    const elapsed = time - ft.startTime;
    if (elapsed > ft.duration) {
      floatingTexts.splice(i, 1);
      continue;
    }
    const progress = elapsed / ft.duration;
    const alpha = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;
    const yOffset = -progress * 50;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.fillText(ft.text, ft.x + 1, ft.y + yOffset + 1);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y + yOffset);
    ctx.restore();
  }
}

// ===== Game Loop =====
function gameLoop(time) {
  if (!streetActive) return;

  const dt = lastTime ? time - lastTime : 16;
  lastTime = time;

  const width = cssWidth;
  const height = cssHeight;

  // Spawn timer
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    spawnCat(width, height);
    spawnTimer = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
  }

  // Update
  updateWalkers(dt, width);

  // Draw (clearRect in CSS coords since we have the DPR transform applied)
  ctx.clearRect(0, 0, width, height);
  drawBackground(width, height);
  drawWalkers(time);
  drawFloatingTexts(time);

  animFrame = requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const navH = document.getElementById('nav').offsetHeight;
  const w = rect.width;
  const h = window.innerHeight - navH;

  cssWidth = w;
  cssHeight = h;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  generateBuildings(w);
}

export function startStreet() {
  canvas = document.getElementById('street-canvas');
  ctx = canvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  canvas.addEventListener('click', handleClick);
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    handleClick({ clientX: touch.clientX, clientY: touch.clientY });
  }, { passive: false });

  updateYourCatPanel();

  streetActive = true;
  lastTime = 0;
  spawnTimer = 500; // Spawn first cat quickly
  animFrame = requestAnimationFrame(gameLoop);
}

export function stopStreet() {
  streetActive = false;
  if (animFrame) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
}

export function resumeStreet() {
  if (!streetActive) {
    streetActive = true;
    lastTime = 0;
    updateYourCatPanel();
    animFrame = requestAnimationFrame(gameLoop);
  }
}
