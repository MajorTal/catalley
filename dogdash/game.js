// ==============================================
// DOG DASH - Phase 1
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

// --- LEVEL DATA ---
function sp(x, y) { return { t: 's', x, y: y || 0 }; }
function bl(x, y) { return { t: 'b', x, y: y || 0 }; }
function pd(x) { return { t: 'p', x, y: 0 }; }

const GAPS = [[50,52],[72,74],[124,126],[148,150],[188,190]];
const gapSet = new Set();
GAPS.forEach(([a, b]) => { for (let i = a; i <= b; i++) gapSet.add(i); });

const FINISH = 218;
const OBJS = [
  // Phrase 1: Intro
  sp(14), sp(19), sp(23),
  // Phrase 2: Multi-spikes
  sp(28), sp(29), sp(34), sp(35),
  sp(40), sp(41), sp(42),
  // Phrase 3: First gap
  sp(56),
  // Phrase 4: Blocks
  bl(62), bl(63), bl(64), sp(68), sp(78),
  // Phrase 5: Rhythms
  sp(82), sp(85), sp(88),
  sp(93), sp(94), sp(95),
  sp(99), sp(100),
  // Phrase 6: Pad intro
  pd(108), sp(109), sp(110), sp(111), sp(112),
  sp(120),
  // Phrase 7: Advanced
  sp(130),
  bl(133), bl(134), bl(135),
  sp(139), sp(142), sp(143),
  sp(154),
  // Phrase 8: Big pad
  pd(157),
  sp(158), sp(159), sp(160), sp(161), sp(162),
  sp(168), sp(172), sp(173),
  // Finale
  sp(180), sp(182), sp(184),
  sp(194),
  pd(199),
  sp(200), sp(201), sp(202), sp(203), sp(204),
  bl(209), bl(210), bl(211),
];

// Precompute world positions
const world = OBJS.map(o => ({
  t: o.t,
  x: o.x * B,
  y: GROUND_Y - (o.y + 1) * B,
}));

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
  } else if (type === 'win') {
    [523, 659, 784, 1047].forEach((f, i) => {
      const o2 = ac.createOscillator();
      const g2 = ac.createGain();
      o2.connect(g2); g2.connect(ac.destination);
      o2.type = 'sine';
      o2.frequency.setValueAtTime(f, t + i * 0.12);
      g2.gain.setValueAtTime(0.12, t + i * 0.12);
      g2.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.3);
      o2.start(t + i * 0.12); o2.stop(t + i * 0.12 + 0.3);
    });
    o.type = 'sine'; o.frequency.setValueAtTime(1, t);
    g.gain.setValueAtTime(0, t);
    o.start(t); o.stop(t + 0.01);
  }
}

// --- STATE ---
let state = 'start';
let dog, cam, attempt, particles, deadTimer, frame, shake;

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
  if (full) attempt = 1;
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
    reset();
  } else if (state === 'complete') {
    state = 'playing';
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

  // Win
  if (dog.x >= FINISH * B) { state = 'complete'; snd('win'); }
  if (dog.y > H + 100) die();

  // Particles
  for (let i = particles.length-1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= p.dec;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// --- BACKGROUND DATA ---
const stars = Array.from({length: 100}, () => ({
  x: Math.random() * FINISH * B * 1.5,
  y: Math.random() * (GROUND_Y - 50) + 10,
  s: Math.random() * 2 + 0.5,
  b: Math.random() * 0.5 + 0.2,
}));
const mtns = Array.from({length: 30}, (_, i) => ({
  x: i * 300 + Math.random() * 100,
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

  // Stars
  for (const s of stars) {
    const sx2 = s.x - cam * 0.05;
    if (sx2 < -5 || sx2 > W+5) continue;
    ctx.globalAlpha = s.b + Math.sin(frame*0.03+s.x)*0.15;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(sx2, s.y, s.s, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Mountains
  ctx.fillStyle = '#12122a';
  for (const m of mtns) {
    const mx = m.x - cam*0.2;
    if (mx+m.w < 0 || mx > W) continue;
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
    if (gapSet.has(c)) continue;
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

  // --- UI ---
  // Progress bar
  const progress = Math.min(1, Math.max(0, (dog ? dog.x : 0) / (FINISH * B)));
  ctx.fillStyle = '#333';
  ctx.fillRect(20, 15, W-40, 6);
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(20, 15, (W-40) * progress, 6);
  // Progress dot
  ctx.beginPath();
  ctx.arc(20 + (W-40)*progress, 18, 5, 0, Math.PI*2);
  ctx.fill();

  // Attempt counter
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '14px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Attempt ' + attempt, W-25, 42);

  // Percentage
  ctx.textAlign = 'left';
  ctx.fillText(Math.floor(progress * 100) + '%', 25, 42);

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
    // Subtitle paw prints
    ctx.fillStyle = '#fff';
    ctx.font = '20px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Press SPACE or Tap to Start', W/2, H/2 + 10);
    // Bouncing dog hint
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '14px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Jump over obstacles to reach the end!', W/2, H/2 + 45);
    // Mini dog icon
    const by = H/2 - 120 + Math.sin(Date.now()*0.004)*10;
    drawMiniDog(W/2 - 25, by, 50);
  }
  else if (state === 'dead') {
    if (deadTimer > 30) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Woof!', W/2, H/2 - 10);
      ctx.fillStyle = '#fff';
      ctx.font = '18px "Segoe UI", Arial, sans-serif';
      ctx.fillText('Tap or press SPACE to retry', W/2, H/2 + 30);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '14px "Segoe UI", Arial, sans-serif';
      ctx.fillText(Math.floor(progress * 100) + '% complete', W/2, H/2 + 60);
    }
  }
  else if (state === 'complete') {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 48px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Level Complete!', W/2, H/2 - 40);
    ctx.fillStyle = '#ffd700';
    ctx.font = '22px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Attempts: ' + attempt, W/2, H/2 + 10);
    ctx.fillStyle = '#fff';
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Tap or press SPACE to play again', W/2, H/2 + 50);
    // Victory dog
    const vy = H/2 - 110 + Math.sin(Date.now()*0.005)*8;
    drawMiniDog(W/2 - 20, vy, 40);
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
