// ==============================================
// DOG DASH - Infinite Mode
// ==============================================
(() => {
'use strict';

// --- CONSTANTS ---
const W = 800, H = 500;
const B = 40; // block size
const GROUND_Y = H - 80;
const GRAV = 0.7;
const JUMP = -12;
const PAD_JUMP = -18;
const SPEED = 5;
const DOG = 36;
const DOG_OFF = (B - DOG) / 2;

// --- PROCEDURAL LEVEL GENERATION ---
let world = [];
let gapSet = new Set();
let generatedUpTo = 0; // rightmost column generated so far
const CHUNK_SIZE = 40; // generate 40 columns at a time
const GEN_AHEAD = 30;  // generate when player is within 30 cols of edge
const SAFE_ZONE = 10;  // no obstacles in first 10 columns

function getDifficulty(col) {
  // Ramps from 0 to 1 over ~400 columns
  return Math.min(1, col / 400);
}

function generateChunk(startCol, endCol) {
  const d = getDifficulty(startCol);
  let col = startCol;

  while (col < endCol) {
    if (col < SAFE_ZONE) { col++; continue; }

    const roll = Math.random();

    // Gap spacing decreases with difficulty
    const minGap = Math.max(2, Math.floor(6 - d * 4));
    const maxGap = Math.max(3, Math.floor(10 - d * 5));
    const spacing = minGap + Math.floor(Math.random() * (maxGap - minGap + 1));

    if (roll < 0.05 + d * 0.1) {
      // Gap (pit) — 2-3 columns wide
      const gapW = Math.random() < 0.3 + d * 0.2 ? 3 : 2;
      for (let i = 0; i < gapW; i++) gapSet.add(col + i);
      // Sometimes add spikes after gap
      if (d > 0.3 && Math.random() < d * 0.5) {
        world.push({ t: 's', x: (col + gapW + 1) * B, y: GROUND_Y - B });
      }
      col += gapW + spacing;
    } else if (roll < 0.15 + d * 0.1) {
      // Block platform — 2-3 blocks
      const bw = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < bw; i++) {
        world.push({ t: 'b', x: (col + i) * B, y: GROUND_Y - B });
      }
      // Spike after blocks
      if (Math.random() < 0.4 + d * 0.3) {
        world.push({ t: 's', x: (col + bw + 1) * B, y: GROUND_Y - B });
      }
      col += bw + spacing;
    } else if (roll < 0.2 + d * 0.05 && d > 0.2) {
      // Pad with spike run
      world.push({ t: 'p', x: col * B, y: GROUND_Y - B });
      const spikeRun = 2 + Math.floor(d * 4 * Math.random());
      for (let i = 1; i <= spikeRun; i++) {
        world.push({ t: 's', x: (col + i) * B, y: GROUND_Y - B });
      }
      col += spikeRun + spacing + 1;
    } else {
      // Spike cluster — 1 to 3 spikes depending on difficulty
      const count = 1 + Math.floor(Math.random() * (1 + d * 2));
      for (let i = 0; i < count; i++) {
        world.push({ t: 's', x: (col + i) * B, y: GROUND_Y - B });
      }
      col += count + spacing;
    }
  }

  generatedUpTo = endCol;
}

function ensureGenerated(playerCol) {
  while (playerCol + GEN_AHEAD > generatedUpTo) {
    generateChunk(generatedUpTo, generatedUpTo + CHUNK_SIZE);
  }
}

function cleanupBehind(playerCol) {
  const cutoff = (playerCol - 60) * B;
  world = world.filter(o => o.x > cutoff);
  // Clean gapSet of old columns
  for (const c of gapSet) {
    if (c < playerCol - 60) gapSet.delete(c);
  }
}

// --- CANVAS ---
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// --- AUDIO ---
let ac = null;
function initAudio() {
  if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
}
function snd(type) {
  if (!ac) return;
  const t = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  if (type === 'jump') {
    o.type = 'sine';
    o.frequency.setValueAtTime(400, t);
    o.frequency.exponentialRampToValueAtTime(800, t + 0.1);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.start(t); o.stop(t + 0.15);
  } else if (type === 'death') {
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(300, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.3);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.start(t); o.stop(t + 0.3);
  } else if (type === 'pad') {
    o.type = 'sine';
    o.frequency.setValueAtTime(300, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.15);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.start(t); o.stop(t + 0.2);
  }
}

// --- STATE ---
let state = 'start';
let dog, cam, attempt, particles, deadTimer, frame, shake, score, bestScore;

bestScore = parseInt(localStorage.getItem('dogdash_best') || '0', 10);

function reset(full) {
  dog = {
    x: 3 * B, y: GROUND_Y - DOG, prevY: GROUND_Y - DOG,
    vy: 0, grounded: true, rot: 0, sq: 1, st: 1,
  };
  cam = 0;
  particles = [];
  deadTimer = 0;
  frame = 0;
  shake = 0;
  score = 0;
  if (full) {
    attempt = 1;
    world = [];
    gapSet = new Set();
    generatedUpTo = 0;
    ensureGenerated(0);
  }
}
reset(true);

// --- INPUT ---
let pressed = false;

function onDown(e) {
  if (e) e.preventDefault();
  if (state === 'start') {
    initAudio();
    state = 'playing';
    reset(true);
  } else if (state === 'dead' && deadTimer > 30) {
    state = 'playing';
    attempt++;
    reset(true);
  } else if (state === 'playing') {
    pressed = true;
  }
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
    if (!e.repeat) onDown(e);
  }
});
canvas.addEventListener('mousedown', onDown);
canvas.addEventListener('touchstart', onDown, { passive: false });

// --- PARTICLES ---
function spawnDeath(x, y) {
  const cols = ['#e8a43a','#f5deb3','#c78530','#fff','#ffaa33'];
  for (let i = 0; i < 20; i++) {
    const a = Math.PI * 2 * i / 20 + Math.random() * 0.3;
    const s = 2 + Math.random() * 5;
    particles.push({
      x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s - 3,
      sz: 3 + Math.random() * 5,
      c: cols[Math.floor(Math.random() * cols.length)],
      life: 1, dec: 0.015 + Math.random() * 0.015,
    });
  }
}

// --- COLLISION ---
function ov(a, b) {
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}
function dogHB() {
  return { x: dog.x+5, y: dog.y+3, w: DOG-10, h: DOG-6 };
}

// --- DIE ---
function die() {
  if (state !== 'playing') return;
  state = 'dead';
  deadTimer = 0;
  shake = 8;
  spawnDeath(dog.x + DOG/2, dog.y + DOG/2);
  snd('death');
  score = Math.floor(dog.x / B);
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('dogdash_best', String(bestScore));
  }
}

// --- UPDATE ---
function update() {
  if (state !== 'playing') {
    if (state === 'dead') { deadTimer++; shake *= 0.85; }
    // Update particles
    for (let i = particles.length-1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= p.dec;
      if (p.life <= 0) particles.splice(i, 1);
    }
    return;
  }

  frame++;
  dog.prevY = dog.y;

  // Generate terrain ahead & clean behind
  const playerCol = Math.floor(dog.x / B);
  ensureGenerated(playerCol);
  if (playerCol % 20 === 0) cleanupBehind(playerCol);

  // Jump
  if (pressed && dog.grounded) {
    dog.vy = JUMP;
    dog.grounded = false;
    dog.sq = 0.7; dog.st = 1.3;
    snd('jump');
  }
  pressed = false;

  // Move
  dog.x += SPEED;
  if (!dog.grounded) dog.vy += GRAV;
  dog.y += dog.vy;
  dog.grounded = false;

  // Ground
  const col = Math.floor((dog.x + DOG/2) / B);
  if (!gapSet.has(col)) {
    if (dog.y + DOG >= GROUND_Y) {
      dog.y = GROUND_Y - DOG;
      dog.vy = 0;
      dog.grounded = true;
      if (dog.prevY + DOG < GROUND_Y - 2) { dog.sq = 1.2; dog.st = 0.8; }
    }
  } else if (dog.y > H + 50) { die(); return; }

  // Block collisions
  const hb = dogHB();
  for (const o of world) {
    if (o.t !== 'b' || Math.abs(o.x - dog.x) > B*2) continue;
    const bb = { x: o.x, y: o.y, w: B, h: B };
    if (!ov(hb, bb)) continue;
    if (dog.prevY + DOG <= bb.y + 4) {
      dog.y = bb.y - DOG; dog.vy = 0; dog.grounded = true;
      dog.sq = 1.15; dog.st = 0.85;
    } else { die(); return; }
  }

  // Spike collisions
  for (const o of world) {
    if (o.t !== 's' || Math.abs(o.x - dog.x) > B*2) continue;
    if (ov(hb, { x: o.x+10, y: o.y+5, w: 20, h: 35 })) { die(); return; }
  }

  // Pad collisions
  for (const o of world) {
    if (o.t !== 'p' || Math.abs(o.x - dog.x) > B*2) continue;
    if (ov(hb, { x: o.x+5, y: o.y+B-15, w: B-10, h: 15 }) && dog.vy >= 0) {
      dog.vy = PAD_JUMP; dog.grounded = false;
      dog.sq = 0.6; dog.st = 1.4;
      snd('pad');
    }
  }

  // Rotation
  if (!dog.grounded) dog.rot += dog.vy * 0.003;
  else dog.rot *= 0.8;

  // Ease squash/stretch
  dog.sq += (1 - dog.sq) * 0.15;
  dog.st += (1 - dog.st) * 0.15;

  // Camera
  cam = Math.max(0, dog.x - 200);

  if (dog.y > H + 100) die();

  // Update score
  score = Math.floor(dog.x / B);

  // Particles
  for (let i = particles.length-1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= p.dec;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// --- BACKGROUND DATA ---
// Stars and mountains repeat every WRAP_W pixels
const STAR_WRAP = 1600;
const MTN_WRAP = 2400;
const stars = Array.from({length: 60}, () => ({
  x: Math.random() * STAR_WRAP,
  y: Math.random() * (GROUND_Y - 50) + 10,
  s: Math.random() * 2 + 0.5,
  b: Math.random() * 0.5 + 0.2,
}));
const mtns = Array.from({length: 12}, (_, i) => ({
  x: i * 200 + Math.random() * 100,
  w: 150 + Math.random() * 200,
  h: 80 + Math.random() * 120,
}));

// --- DRAW HELPERS ---
function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
}

// --- RENDER ---
function render() {
  const sx = shake > 0.5 ? (Math.random()-0.5) * shake : 0;
  const sy = shake > 0.5 ? (Math.random()-0.5) * shake : 0;
  ctx.save();
  ctx.translate(sx, sy);

  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0, '#0f0e17');
  grad.addColorStop(1, '#1a1a3e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, GROUND_Y);

  // Stars (wrapping)
  const starOffset = (cam * 0.05) % STAR_WRAP;
  for (const s of stars) {
    let sx2 = s.x - starOffset;
    if (sx2 < -5) sx2 += STAR_WRAP;
    if (sx2 > W + 5) continue;
    ctx.globalAlpha = s.b + Math.sin(frame*0.03+s.x)*0.15;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(sx2, s.y, s.s, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Mountains (wrapping)
  ctx.fillStyle = '#12122a';
  const mtnOffset = (cam * 0.2) % MTN_WRAP;
  for (const m of mtns) {
    let mx = m.x - mtnOffset;
    if (mx + m.w < 0) mx += MTN_WRAP;
    if (mx > W) continue;
    ctx.beginPath();
    ctx.moveTo(mx, GROUND_Y);
    ctx.lineTo(mx+m.w/2, GROUND_Y-m.h);
    ctx.lineTo(mx+m.w, GROUND_Y);
    ctx.fill();
  }

  // Ground
  for (let sx3 = -B; sx3 <= W+B; sx3 += B) {
    const c = Math.floor((sx3 + cam) / B);
    const dx = c * B - cam;
    if (gapSet.has(c)) {
      // Draw pit: red glow at top, dark fade below
      const pitGrad = ctx.createLinearGradient(0, GROUND_Y, 0, GROUND_Y + 40);
      pitGrad.addColorStop(0, 'rgba(255,50,50,0.25)');
      pitGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = pitGrad;
      ctx.fillRect(dx, GROUND_Y, B, 40);
      continue;
    }
    ctx.fillStyle = '#2d1b0e';
    ctx.fillRect(dx, GROUND_Y, B, H-GROUND_Y);
    ctx.fillStyle = '#3d2b1e';
    for (let sy2 = 12; sy2 < H-GROUND_Y; sy2 += 18)
      ctx.fillRect(dx, GROUND_Y+sy2, B, 4);
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(dx, GROUND_Y, B, 3);
    for (let gx = 0; gx < B; gx += 8) {
      const bh = 4 + Math.sin(c*3+gx)*3;
      ctx.fillRect(dx+gx, GROUND_Y-bh, 2, bh);
    }
    // Warning stripes on edges next to gaps
    if (gapSet.has(c + 1)) {
      // Right edge — yellow/black caution stripe
      for (let sy2 = 0; sy2 < 12; sy2 += 4) {
        ctx.fillStyle = sy2 % 8 === 0 ? '#ddaa00' : '#333';
        ctx.fillRect(dx + B - 3, GROUND_Y + sy2, 3, 4);
      }
    }
    if (gapSet.has(c - 1)) {
      // Left edge
      for (let sy2 = 0; sy2 < 12; sy2 += 4) {
        ctx.fillStyle = sy2 % 8 === 0 ? '#ddaa00' : '#333';
        ctx.fillRect(dx, GROUND_Y + sy2, 3, 4);
      }
    }
  }

  // Objects
  for (const o of world) {
    const ox = o.x - cam;
    if (ox < -B || ox > W+B) continue;

    if (o.t === 's') {
      // Spike glow
      ctx.fillStyle = 'rgba(255,51,68,0.3)';
      ctx.beginPath();
      ctx.moveTo(ox+B/2, o.y-3); ctx.lineTo(ox-3, o.y+B+3); ctx.lineTo(ox+B+3, o.y+B+3);
      ctx.fill();
      // Spike
      ctx.fillStyle = '#ff3344';
      ctx.beginPath();
      ctx.moveTo(ox+B/2, o.y+2); ctx.lineTo(ox+4, o.y+B); ctx.lineTo(ox+B-4, o.y+B);
      ctx.fill();
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.moveTo(ox+B/2, o.y+6); ctx.lineTo(ox+B/2-4, o.y+B-4); ctx.lineTo(ox+B/2+2, o.y+B-4);
      ctx.fill();
    }
    else if (o.t === 'b') {
      ctx.fillStyle = '#3d3d5c';
      ctx.fillRect(ox+1, o.y+1, B-2, B-2);
      ctx.strokeStyle = '#5d5d7c'; ctx.lineWidth = 2;
      ctx.strokeRect(ox+1, o.y+1, B-2, B-2);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
      ctx.strokeRect(ox+5, o.y+5, B-10, B-10);
    }
    else if (o.t === 'p') {
      // Glow
      const gs = 3+Math.sin(frame*0.1)*2;
      ctx.fillStyle = 'rgba(255,215,0,0.3)';
      ctx.fillRect(ox-gs, o.y+B-18-gs, B+gs*2, 18+gs*2);
      // Pad shape
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(ox+4, o.y+B); ctx.lineTo(ox+10, o.y+B-16);
      ctx.lineTo(ox+B-10, o.y+B-16); ctx.lineTo(ox+B-4, o.y+B);
      ctx.fill();
      // Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.moveTo(ox+12, o.y+B-14); ctx.lineTo(ox+15, o.y+B-6);
      ctx.lineTo(ox+B-15, o.y+B-6); ctx.lineTo(ox+B-12, o.y+B-14);
      ctx.fill();
      // Arrow
      const bn = Math.sin(frame*0.15)*4;
      ctx.fillStyle = '#ffd700'; ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(ox+B/2, o.y+B-28+bn);
      ctx.lineTo(ox+B/2-6, o.y+B-20+bn);
      ctx.lineTo(ox+B/2+6, o.y+B-20+bn);
      ctx.fill(); ctx.globalAlpha = 1;
    }
  }

  // Dog
  if (state !== 'dead') {
    const dx = dog.x - cam;
    const dy = dog.y;
    const cx = dx + DOG/2;
    const cy = dy + DOG/2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(dog.rot);
    ctx.scale(dog.sq, dog.st);
    ctx.translate(-DOG/2, -DOG/2);
    const s = DOG/40;

    // Body
    ctx.fillStyle = '#e8a43a';
    rrect(2*s, 2*s, 36*s, 36*s, 6*s); ctx.fill();
    ctx.strokeStyle = '#c78530'; ctx.lineWidth = 2;
    rrect(2*s, 2*s, 36*s, 36*s, 6*s); ctx.stroke();

    // Face patch
    ctx.fillStyle = '#f5deb3';
    ctx.beginPath(); ctx.ellipse(22*s, 24*s, 12*s, 10*s, 0, 0, Math.PI*2); ctx.fill();

    // Ears
    ctx.fillStyle = '#c78530';
    ctx.beginPath(); ctx.moveTo(8*s,4*s); ctx.lineTo(4*s,-8*s); ctx.lineTo(16*s,2*s); ctx.fill();
    ctx.beginPath(); ctx.moveTo(24*s,2*s); ctx.lineTo(30*s,-10*s); ctx.lineTo(34*s,2*s); ctx.fill();
    // Inner ear
    ctx.fillStyle = '#ff6b8a';
    ctx.beginPath(); ctx.moveTo(9*s,2*s); ctx.lineTo(7*s,-4*s); ctx.lineTo(14*s,1*s); ctx.fill();
    ctx.beginPath(); ctx.moveTo(25*s,1*s); ctx.lineTo(29*s,-6*s); ctx.lineTo(32*s,1*s); ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(14*s, 16*s, 5*s, 5.5*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(28*s, 16*s, 5*s, 5.5*s, 0, 0, Math.PI*2); ctx.fill();
    // Pupils
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.ellipse(15.5*s, 16*s, 2.5*s, 3*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(29.5*s, 16*s, 2.5*s, 3*s, 0, 0, Math.PI*2); ctx.fill();
    // Highlights
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(13.5*s, 14.5*s, 1.5*s, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(27.5*s, 14.5*s, 1.5*s, 0, Math.PI*2); ctx.fill();

    // Nose
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.ellipse(21*s, 26*s, 3*s, 2*s, 0, 0, Math.PI*2); ctx.fill();

    // Mouth / tongue
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5*s;
    ctx.beginPath(); ctx.moveTo(18*s, 29*s); ctx.quadraticCurveTo(21*s, 32*s, 24*s, 29*s); ctx.stroke();
    // Tongue
    if (dog.grounded) {
      const tw = Math.sin(frame*0.15)*1.5;
      ctx.fillStyle = '#ff6b8a';
      ctx.beginPath(); ctx.ellipse(21*s, 32*s+tw*s, 2.5*s, 3.5*s, 0, 0, Math.PI*2); ctx.fill();
    }

    ctx.restore();
  }

  // Particles
  for (const p of particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.c;
    ctx.fillRect(p.x - cam - p.sz/2, p.y - p.sz/2, p.sz, p.sz);
  }
  ctx.globalAlpha = 1;

  // --- HUD ---
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '16px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 25, 30);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '14px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Best: ' + bestScore, W - 25, 30);

  ctx.restore(); // shake

  // --- OVERLAY SCREENS ---
  if (state === 'start') {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    // Title
    ctx.fillStyle = '#e8a43a';
    ctx.font = 'bold 64px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DOG DASH', W/2, H/2 - 50);
    // Subtitle
    ctx.fillStyle = '#fff';
    ctx.font = '20px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Press SPACE or Tap to Start', W/2, H/2 + 10);
    // Hint
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '14px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Jump over obstacles — how far can you go?', W/2, H/2 + 45);
    // Best score
    if (bestScore > 0) {
      ctx.fillStyle = '#ffd700';
      ctx.font = '16px "Segoe UI", Arial, sans-serif';
      ctx.fillText('Best: ' + bestScore, W/2, H/2 + 75);
    }
    // Mini dog icon
    const by = H/2 - 120 + Math.sin(Date.now()*0.004)*10;
    drawMiniDog(W/2 - 25, by, 50);
  }
  else if (state === 'dead') {
    if (deadTimer > 30) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Woof!', W/2, H/2 - 40);
      // Score
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
      ctx.fillText('Score: ' + score, W/2, H/2 + 5);
      // Best
      ctx.fillStyle = '#ffd700';
      ctx.font = '18px "Segoe UI", Arial, sans-serif';
      if (score >= bestScore && score > 0) {
        ctx.fillText('New Best!', W/2, H/2 + 35);
      } else {
        ctx.fillText('Best: ' + bestScore, W/2, H/2 + 35);
      }
      // Retry
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '16px "Segoe UI", Arial, sans-serif';
      ctx.fillText('Tap or press SPACE to retry', W/2, H/2 + 70);
    }
  }
}

// Mini dog for menus
function drawMiniDog(x, y, size) {
  const s = size / 40;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#e8a43a';
  rrect(2*s,2*s,36*s,36*s,6*s); ctx.fill();
  ctx.fillStyle = '#f5deb3';
  ctx.beginPath(); ctx.ellipse(22*s,24*s,12*s,10*s,0,0,Math.PI*2); ctx.fill();
  // Ears
  ctx.fillStyle = '#c78530';
  ctx.beginPath(); ctx.moveTo(8*s,4*s); ctx.lineTo(4*s,-8*s); ctx.lineTo(16*s,2*s); ctx.fill();
  ctx.beginPath(); ctx.moveTo(24*s,2*s); ctx.lineTo(30*s,-10*s); ctx.lineTo(34*s,2*s); ctx.fill();
  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(14*s,16*s,5*s,5.5*s,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(28*s,16*s,5*s,5.5*s,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.ellipse(15.5*s,16*s,2.5*s,3*s,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(29.5*s,16*s,2.5*s,3*s,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(13.5*s,14.5*s,1.5*s,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(27.5*s,14.5*s,1.5*s,0,Math.PI*2); ctx.fill();
  // Nose
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.ellipse(21*s,26*s,3*s,2*s,0,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

// --- GAME LOOP ---
function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

})();
