// sprites.js - Pixel art data, sprite registry, composable rendering

export const PIXEL_SCALE = 3;
export const SPRITE_SIZE = 32;
export const DISPLAY_SIZE = SPRITE_SIZE * PIXEL_SCALE; // 96

// ===== Color Palettes for Base Cats =====
const PALETTES = {
  orange:  { body: '#e8842a', dark: '#c46a1a', light: '#f0a050', ear: '#d07020', nose: '#ff8899', eye: '#2d2d2d' },
  gray:    { body: '#888899', dark: '#666677', light: '#aaaabb', ear: '#777788', nose: '#cc8899', eye: '#2d2d2d' },
  black:   { body: '#3a3a4a', dark: '#2a2a3a', light: '#4a4a5a', ear: '#333344', nose: '#aa6677', eye: '#55cc55' },
  white:   { body: '#e8e8ee', dark: '#ccccdd', light: '#f5f5ff', ear: '#ddddee', nose: '#ffaaaa', eye: '#4488dd' },
  calico:  { body: '#e8842a', dark: '#c46a1a', light: '#e8e8ee', ear: '#3a3a4a', nose: '#ff8899', eye: '#2d2d2d' },
};

// ===== Base Cat Sprite Generator =====
// Generates a 32x32 cat body facing right
function generateBaseCat(paletteId) {
  const p = PALETTES[paletteId];
  const grid = Array.from({ length: SPRITE_SIZE }, () => Array(SPRITE_SIZE).fill(null));

  const set = (x, y, color) => {
    if (x >= 0 && x < SPRITE_SIZE && y >= 0 && y < SPRITE_SIZE) grid[y][x] = color;
  };
  const fill = (x1, y1, x2, y2, color) => {
    for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) set(x, y, color);
  };

  // Ears (at top of head)
  // Left ear
  set(9, 5, p.ear); set(10, 5, p.ear);
  set(9, 6, p.ear); set(10, 6, p.body);
  // Right ear
  set(17, 5, p.ear); set(18, 5, p.ear);
  set(17, 6, p.body); set(18, 6, p.ear);

  // Head (rows 7-14)
  fill(9, 7, 18, 7, p.body);
  fill(8, 8, 19, 8, p.body);
  fill(8, 9, 19, 14, p.body);

  // Eyes (row 10-11)
  set(11, 10, p.eye); set(12, 10, p.eye);
  set(16, 10, p.eye); set(17, 10, p.eye);
  set(11, 11, p.eye); set(12, 11, '#fff');
  set(16, 11, p.eye); set(17, 11, '#fff');

  // Nose (row 12)
  set(13, 12, p.nose); set(14, 12, p.nose);

  // Mouth (row 13)
  set(13, 13, p.dark); set(14, 13, p.dark);

  // Cheek highlights
  set(9, 11, p.light); set(18, 11, p.light);

  // Body (rows 15-24)
  fill(8, 15, 19, 15, p.body);
  fill(7, 16, 20, 16, p.body);
  fill(7, 17, 21, 24, p.body);

  // Calico patches
  if (paletteId === 'calico') {
    fill(8, 18, 11, 21, p.light);  // white patch
    fill(16, 17, 19, 20, '#3a3a4a'); // black patch
    fill(9, 10, 10, 11, '#3a3a4a'); // black face patch
  }

  // Belly highlight
  fill(11, 18, 16, 23, p.light);

  // Dark stripe on back
  fill(7, 17, 8, 22, p.dark);

  // Front legs (rows 25-28)
  fill(9, 25, 11, 28, p.body);
  fill(16, 25, 18, 28, p.body);

  // Paws
  fill(9, 28, 11, 28, p.light);
  fill(16, 28, 18, 28, p.light);

  // Tail (curves right from body)
  fill(21, 19, 22, 19, p.body);
  fill(22, 18, 24, 18, p.body);
  fill(24, 17, 25, 17, p.body);
  set(25, 16, p.dark);
  set(26, 16, p.dark);

  return grid;
}

// ===== Accessory Definitions =====
// anchor: { x, y } relative to base cat's top-left corner
// Each accessory is a mini pixel grid drawn at its anchor point

export const RARITY = {
  COMMON:   { name: 'Common',   weight: 60, color: '#b0b0b0' },
  UNCOMMON: { name: 'Uncommon', weight: 25, color: '#4ecca3' },
  RARE:     { name: 'Rare',     weight: 12, color: '#5e9eff' },
  EPIC:     { name: 'Epic',     weight: 3,  color: '#c77dff' },
};

export const ACCESSORIES = {
  // ===== HATS =====
  top_hat: {
    name: 'Top Hat', slot: 'hat', rarity: 'COMMON',
    anchor: { x: 9, y: -1 },
    pixels: [
      [null, null, '#222', '#222', '#222', '#222', '#222', '#222', null, null],
      [null, null, '#222', '#222', '#222', '#222', '#222', '#222', null, null],
      [null, null, '#222', '#333', '#333', '#333', '#333', '#222', null, null],
      [null, null, '#222', '#333', '#333', '#333', '#333', '#222', null, null],
      [null, null, '#222', '#222', '#222', '#222', '#222', '#222', null, null],
      [null, '#222', '#222', '#444', '#444', '#444', '#444', '#222', '#222', null],
      ['#222', '#222', '#222', '#222', '#222', '#222', '#222', '#222', '#222', '#222'],
    ],
  },
  beret: {
    name: 'Beret', slot: 'hat', rarity: 'COMMON',
    anchor: { x: 8, y: 2 },
    pixels: [
      [null, null, null, null, '#cc2222', null, null, null, null, null, null, null],
      [null, null, null, '#cc2222', '#cc2222', '#cc2222', null, null, null, null, null, null],
      [null, null, '#cc2222', '#dd3333', '#dd3333', '#dd3333', '#cc2222', null, null, null, null, null],
      [null, '#cc2222', '#dd3333', '#dd3333', '#ee4444', '#dd3333', '#dd3333', '#cc2222', null, null, null, null],
      ['#cc2222', '#cc2222', '#dd3333', '#dd3333', '#dd3333', '#dd3333', '#cc2222', '#cc2222', '#cc2222', null, null, null],
    ],
  },
  crown: {
    name: 'Crown', slot: 'hat', rarity: 'EPIC',
    anchor: { x: 9, y: 1 },
    pixels: [
      [null, '#ffd700', null, null, '#ffd700', null, null, '#ffd700', null, null],
      ['#ffd700', '#ffd700', '#ffd700', null, '#ffd700', null, '#ffd700', '#ffd700', '#ffd700', null],
      ['#ffd700', '#ffee44', '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffee44', '#ffd700', null],
      ['#ffd700', '#ffee44', '#ff4444', '#ffee44', '#ffee44', '#ffee44', '#ff4444', '#ffee44', '#ffd700', null],
      ['#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffd700', null],
    ],
  },
  witch_hat: {
    name: 'Witch Hat', slot: 'hat', rarity: 'RARE',
    anchor: { x: 8, y: -3 },
    pixels: [
      [null, null, null, null, null, '#442288', null, null, null, null, null, null],
      [null, null, null, null, '#442288', '#553399', '#442288', null, null, null, null, null],
      [null, null, null, '#442288', '#553399', '#553399', '#553399', '#442288', null, null, null, null],
      [null, null, '#442288', '#553399', '#553399', '#664aaa', '#553399', '#553399', '#442288', null, null, null],
      [null, '#442288', '#553399', '#553399', '#553399', '#553399', '#553399', '#553399', '#553399', '#442288', null, null],
      ['#442288', '#553399', '#553399', '#553399', '#553399', '#553399', '#553399', '#553399', '#553399', '#553399', '#442288', null],
      [null, '#44bb44', '#44bb44', '#44bb44', '#44bb44', '#44bb44', '#44bb44', '#44bb44', '#44bb44', '#44bb44', null, null],
      ['#442288', '#442288', '#442288', '#442288', '#442288', '#442288', '#442288', '#442288', '#442288', '#442288', '#442288', '#442288'],
    ],
  },
  party_hat: {
    name: 'Party Hat', slot: 'hat', rarity: 'UNCOMMON',
    anchor: { x: 10, y: -1 },
    pixels: [
      [null, null, null, '#ffee00', null, null, null, null],
      [null, null, '#ff4488', '#ff4488', '#ff4488', null, null, null],
      [null, '#44bbff', '#ff4488', '#ffee00', '#ff4488', '#44bbff', null, null],
      [null, '#44bbff', '#ff4488', '#ff4488', '#ff4488', '#44bbff', null, null],
      ['#44bbff', '#ff4488', '#ffee00', '#ff4488', '#ffee00', '#ff4488', '#44bbff', null],
      ['#ff4488', '#ff4488', '#ff4488', '#ff4488', '#ff4488', '#ff4488', '#ff4488', null],
    ],
  },
  cowboy_hat: {
    name: 'Cowboy Hat', slot: 'hat', rarity: 'COMMON',
    anchor: { x: 7, y: 1 },
    pixels: [
      [null, null, null, null, '#8B4513', '#8B4513', '#8B4513', '#8B4513', null, null, null, null, null, null],
      [null, null, null, '#8B4513', '#a0522d', '#c68642', '#c68642', '#a0522d', '#8B4513', null, null, null, null, null],
      [null, null, null, '#8B4513', '#daa520', '#daa520', '#daa520', '#daa520', '#8B4513', null, null, null, null, null],
      [null, '#8B4513', '#8B4513', '#a0522d', '#a0522d', '#a0522d', '#a0522d', '#a0522d', '#a0522d', '#8B4513', '#8B4513', null, null, null],
      ['#8B4513', '#a0522d', '#a0522d', '#a0522d', '#a0522d', '#a0522d', '#a0522d', '#a0522d', '#a0522d', '#a0522d', '#a0522d', '#8B4513', null, null],
    ],
  },
  pirate_hat: {
    name: 'Pirate Hat', slot: 'hat', rarity: 'UNCOMMON',
    anchor: { x: 8, y: 0 },
    pixels: [
      [null, null, null, '#222', '#222', '#222', '#222', null, null, null, null, null],
      [null, null, '#222', '#333', '#333', '#333', '#333', '#222', null, null, null, null],
      [null, '#222', '#333', '#fff', '#333', '#333', '#fff', '#333', '#222', null, null, null],
      [null, '#222', '#333', '#333', '#fff', '#fff', '#333', '#333', '#222', null, null, null],
      ['#222', '#333', '#333', '#333', '#333', '#333', '#333', '#333', '#333', '#222', null, null],
      ['#daa520', '#222', '#222', '#222', '#222', '#222', '#222', '#222', '#222', '#222', '#daa520', null],
    ],
  },
  halo: {
    name: 'Halo', slot: 'hat', rarity: 'EPIC',
    anchor: { x: 10, y: 1 },
    pixels: [
      [null, '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffd700', null],
      ['#ffd700', '#ffee44', '#fff9a0', '#fff9a0', '#fff9a0', '#fff9a0', '#ffee44', '#ffd700'],
      [null, '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffd700', null],
    ],
  },

  // ===== GLASSES =====
  round_glasses: {
    name: 'Round Glasses', slot: 'glasses', rarity: 'COMMON',
    anchor: { x: 9, y: 10 },
    pixels: [
      ['#555', '#555', '#555', '#555', '#555', '#555', '#555', '#555', '#555', '#555'],
      ['#555', '#88ccff', '#88ccff', '#555', null, null, '#555', '#88ccff', '#88ccff', '#555'],
      ['#555', '#555', '#555', '#555', null, null, '#555', '#555', '#555', '#555'],
    ],
  },
  sunglasses: {
    name: 'Sunglasses', slot: 'glasses', rarity: 'UNCOMMON',
    anchor: { x: 9, y: 9 },
    pixels: [
      [null, '#333', '#333', '#333', '#333', '#333', '#333', '#333', '#333', null],
      ['#333', '#222', '#222', '#333', '#333', '#333', '#333', '#222', '#222', '#333'],
      ['#333', '#111', '#111', '#333', null, null, '#333', '#111', '#111', '#333'],
      [null, '#333', '#333', null, null, null, null, '#333', '#333', null],
    ],
  },
  star_glasses: {
    name: 'Star Glasses', slot: 'glasses', rarity: 'RARE',
    anchor: { x: 9, y: 9 },
    pixels: [
      [null, '#ff0', null, null, null, null, null, null, '#ff0', null],
      ['#ff0', '#ff0', '#ff0', '#e80', '#e80', '#e80', '#e80', '#ff0', '#ff0', '#ff0'],
      ['#e80', '#ff0', '#e80', null, null, null, null, '#e80', '#ff0', '#e80'],
      [null, '#e80', null, null, null, null, null, null, '#e80', null],
    ],
  },
  monocle: {
    name: 'Monocle', slot: 'glasses', rarity: 'UNCOMMON',
    anchor: { x: 15, y: 9 },
    pixels: [
      ['#daa520', '#daa520', '#daa520', null],
      ['#daa520', '#aaddff', '#daa520', null],
      ['#daa520', '#daa520', '#daa520', null],
      [null, '#daa520', null, null],
      [null, '#daa520', null, null],
      [null, null, '#daa520', null],
    ],
  },
  heart_glasses: {
    name: 'Heart Glasses', slot: 'glasses', rarity: 'EPIC',
    anchor: { x: 9, y: 9 },
    pixels: [
      ['#ff3377', null, '#ff3377', '#ff3377', null, null, '#ff3377', null, '#ff3377', '#ff3377'],
      ['#ff3377', '#ff77aa', '#ff3377', '#ff3377', '#ff3377', '#ff3377', '#ff3377', '#ff77aa', '#ff3377', '#ff3377'],
      [null, '#ff3377', '#ff3377', '#ff3377', null, null, null, '#ff3377', '#ff3377', null],
      [null, null, '#ff3377', null, null, null, null, null, '#ff3377', null],
    ],
  },
  eye_patch: {
    name: 'Eye Patch', slot: 'glasses', rarity: 'COMMON',
    anchor: { x: 9, y: 9 },
    pixels: [
      ['#555', '#555', '#555', '#555', '#555', '#555', '#555', '#555', '#555', '#555'],
      [null, null, '#222', '#222', '#222', null, null, null, null, null],
      [null, null, '#222', '#111', '#222', null, null, null, null, null],
      [null, null, null, '#222', null, null, null, null, null, null],
    ],
  },
  three_d_glasses: {
    name: '3D Glasses', slot: 'glasses', rarity: 'UNCOMMON',
    anchor: { x: 9, y: 10 },
    pixels: [
      ['#eee', '#eee', '#eee', '#eee', '#eee', '#eee', '#eee', '#eee', '#eee', '#eee'],
      ['#eee', '#dd2222', '#dd2222', '#eee', null, null, '#eee', '#2244dd', '#2244dd', '#eee'],
      ['#eee', '#eee', '#eee', '#eee', null, null, '#eee', '#eee', '#eee', '#eee'],
    ],
  },
  laser_visor: {
    name: 'Laser Visor', slot: 'glasses', rarity: 'RARE',
    anchor: { x: 8, y: 9 },
    pixels: [
      [null, '#cc0000', '#cc0000', '#cc0000', '#cc0000', '#cc0000', '#cc0000', '#cc0000', '#cc0000', '#cc0000', '#cc0000', null],
      [null, '#ff0000', '#ff3333', '#ff3333', '#ff3333', '#ff3333', '#ff3333', '#ff3333', '#ff3333', '#ff3333', '#ff0000', null],
      [null, null, '#cc0000', '#cc0000', null, null, null, null, '#cc0000', '#cc0000', null, null],
    ],
  },

  // ===== SCARVES =====
  red_scarf: {
    name: 'Red Scarf', slot: 'scarf', rarity: 'COMMON',
    anchor: { x: 7, y: 15 },
    pixels: [
      [null, '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', null],
      [null, '#aa1111', '#dd3333', '#aa1111', '#dd3333', '#aa1111', '#dd3333', '#aa1111', '#dd3333', '#aa1111', '#dd3333', '#aa1111', '#dd3333', '#aa1111'],
      [null, null, null, null, null, null, null, null, null, null, null, null, '#aa1111', '#cc2222'],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, '#aa1111'],
    ],
  },
  blue_scarf: {
    name: 'Blue Scarf', slot: 'scarf', rarity: 'COMMON',
    anchor: { x: 7, y: 15 },
    pixels: [
      [null, '#2244aa', '#2244aa', '#2244aa', '#2244aa', '#2244aa', '#2244aa', '#2244aa', '#2244aa', '#2244aa', '#2244aa', '#2244aa', '#2244aa', null],
      [null, '#1a3388', '#3355bb', '#1a3388', '#3355bb', '#1a3388', '#3355bb', '#1a3388', '#3355bb', '#1a3388', '#3355bb', '#1a3388', '#3355bb', '#1a3388'],
      [null, null, null, null, null, null, null, null, null, null, null, null, '#1a3388', '#2244aa'],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, '#1a3388'],
    ],
  },
  rainbow_scarf: {
    name: 'Rainbow Scarf', slot: 'scarf', rarity: 'RARE',
    anchor: { x: 7, y: 15 },
    pixels: [
      [null, '#ff0000', '#ff8800', '#ffff00', '#00cc00', '#0088ff', '#8800ff', '#ff0000', '#ff8800', '#ffff00', '#00cc00', '#0088ff', '#8800ff', null],
      [null, '#cc0000', '#cc6600', '#cccc00', '#009900', '#0066cc', '#6600cc', '#cc0000', '#cc6600', '#cccc00', '#009900', '#0066cc', '#6600cc', '#cc0000'],
      [null, null, null, null, null, null, null, null, null, null, null, null, '#6600cc', '#8800ff'],
    ],
  },
  gold_scarf: {
    name: 'Gold Scarf', slot: 'scarf', rarity: 'UNCOMMON',
    anchor: { x: 7, y: 15 },
    pixels: [
      [null, '#daa520', '#daa520', '#daa520', '#daa520', '#daa520', '#daa520', '#daa520', '#daa520', '#daa520', '#daa520', '#daa520', '#daa520', null],
      [null, '#b8860b', '#eec840', '#b8860b', '#eec840', '#b8860b', '#eec840', '#b8860b', '#eec840', '#b8860b', '#eec840', '#b8860b', '#eec840', '#b8860b'],
    ],
  },
  green_scarf: {
    name: 'Green Scarf', slot: 'scarf', rarity: 'COMMON',
    anchor: { x: 7, y: 15 },
    pixels: [
      [null, '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', null],
      [null, '#1a6b1a', '#33aa33', '#1a6b1a', '#33aa33', '#1a6b1a', '#33aa33', '#1a6b1a', '#33aa33', '#1a6b1a', '#33aa33', '#1a6b1a', '#33aa33', '#1a6b1a'],
      [null, null, null, null, null, null, null, null, null, null, null, null, '#1a6b1a', '#228B22'],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, '#1a6b1a'],
    ],
  },
  pink_scarf: {
    name: 'Pink Scarf', slot: 'scarf', rarity: 'COMMON',
    anchor: { x: 7, y: 15 },
    pixels: [
      [null, '#dd5599', '#dd5599', '#dd5599', '#dd5599', '#dd5599', '#dd5599', '#dd5599', '#dd5599', '#dd5599', '#dd5599', '#dd5599', '#dd5599', null],
      [null, '#bb4488', '#ee66aa', '#bb4488', '#ee66aa', '#bb4488', '#ee66aa', '#bb4488', '#ee66aa', '#bb4488', '#ee66aa', '#bb4488', '#ee66aa', '#bb4488'],
      [null, null, null, null, null, null, null, null, null, null, null, null, '#bb4488', '#dd5599'],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, '#bb4488'],
    ],
  },
  flame_scarf: {
    name: 'Flame Scarf', slot: 'scarf', rarity: 'RARE',
    anchor: { x: 7, y: 15 },
    pixels: [
      [null, '#cc2222', '#dd4400', '#ee8800', '#ffcc00', '#ee8800', '#dd4400', '#cc2222', '#dd4400', '#ee8800', '#ffcc00', '#ee8800', '#dd4400', null],
      [null, '#aa1111', '#cc3300', '#dd6600', '#eeaa00', '#dd6600', '#cc3300', '#aa1111', '#cc3300', '#dd6600', '#eeaa00', '#dd6600', '#cc3300', '#aa1111'],
      [null, null, null, null, null, null, null, null, null, null, null, null, '#cc3300', '#dd4400'],
    ],
  },

  // ===== COLLARS =====
  red_collar: {
    name: 'Red Collar', slot: 'collar', rarity: 'COMMON',
    anchor: { x: 8, y: 15 },
    pixels: [
      ['#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222'],
      [null, null, null, null, null, '#ffdd00', '#ffdd00', null, null, null, null, null],
    ],
  },
  blue_collar: {
    name: 'Blue Collar', slot: 'collar', rarity: 'COMMON',
    anchor: { x: 8, y: 15 },
    pixels: [
      ['#2244cc', '#2244cc', '#2244cc', '#2244cc', '#2244cc', '#2244cc', '#2244cc', '#2244cc', '#2244cc', '#2244cc', '#2244cc', '#2244cc'],
      [null, null, null, null, null, '#aaddff', '#aaddff', null, null, null, null, null],
    ],
  },
  bell_collar: {
    name: 'Bell Collar', slot: 'collar', rarity: 'UNCOMMON',
    anchor: { x: 8, y: 15 },
    pixels: [
      ['#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222', '#cc2222'],
      [null, null, null, null, '#ffd700', '#ffd700', '#ffd700', '#ffd700', null, null, null, null],
      [null, null, null, null, '#ffd700', '#ffee44', '#ffee44', '#ffd700', null, null, null, null],
      [null, null, null, null, null, '#ffd700', '#ffd700', null, null, null, null, null],
    ],
  },
  spike_collar: {
    name: 'Spike Collar', slot: 'collar', rarity: 'RARE',
    anchor: { x: 7, y: 14 },
    pixels: [
      [null, null, '#888', null, null, '#888', null, null, '#888', null, null, '#888', null, null],
      ['#333', '#333', '#888', '#333', '#333', '#888', '#333', '#333', '#888', '#333', '#333', '#888', '#333', '#333'],
      ['#222', '#222', '#222', '#222', '#222', '#222', '#222', '#222', '#222', '#222', '#222', '#222', '#222', '#222'],
    ],
  },
  bowtie: {
    name: 'Bow Tie', slot: 'collar', rarity: 'UNCOMMON',
    anchor: { x: 11, y: 15 },
    pixels: [
      ['#cc2222', null, null, null, null, '#cc2222'],
      ['#cc2222', '#dd3333', '#cc2222', '#cc2222', '#dd3333', '#cc2222'],
      ['#cc2222', '#dd3333', '#ee4444', '#ee4444', '#dd3333', '#cc2222'],
      ['#cc2222', '#dd3333', '#cc2222', '#cc2222', '#dd3333', '#cc2222'],
      ['#cc2222', null, null, null, null, '#cc2222'],
    ],
  },
  green_collar: {
    name: 'Green Collar', slot: 'collar', rarity: 'COMMON',
    anchor: { x: 8, y: 15 },
    pixels: [
      ['#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22'],
      [null, null, null, null, null, '#44cc44', '#44cc44', null, null, null, null, null],
    ],
  },
  diamond_collar: {
    name: 'Diamond Collar', slot: 'collar', rarity: 'UNCOMMON',
    anchor: { x: 8, y: 15 },
    pixels: [
      ['#aaddff', '#88bbee', '#aaddff', '#88bbee', '#aaddff', '#88bbee', '#aaddff', '#88bbee', '#aaddff', '#88bbee', '#aaddff', '#88bbee'],
      [null, null, null, null, '#ffffff', '#aaddff', '#aaddff', '#ffffff', null, null, null, null],
    ],
  },
  chain_collar: {
    name: 'Chain Collar', slot: 'collar', rarity: 'RARE',
    anchor: { x: 8, y: 15 },
    pixels: [
      ['#888', '#ccc', '#888', '#ccc', '#888', '#ccc', '#888', '#ccc', '#888', '#ccc', '#888', '#ccc'],
      ['#ccc', '#888', '#ccc', '#888', '#ccc', '#888', '#ccc', '#888', '#ccc', '#888', '#ccc', '#888'],
    ],
  },

  // ===== ACCESSORIES (carried/misc) =====
  fish: {
    name: 'Fish', slot: 'accessory', rarity: 'COMMON',
    anchor: { x: 21, y: 22 },
    pixels: [
      [null, null, '#6699cc', '#6699cc', null, null],
      ['#5588bb', '#6699cc', '#77aadd', '#77aadd', '#6699cc', null],
      ['#5588bb', '#6699cc', '#222', '#77aadd', '#6699cc', '#5588bb'],
      ['#5588bb', '#6699cc', '#77aadd', '#77aadd', '#6699cc', null],
      [null, null, '#6699cc', '#6699cc', null, null],
    ],
  },
  balloon: {
    name: 'Balloon', slot: 'accessory', rarity: 'UNCOMMON',
    anchor: { x: 19, y: 4 },
    pixels: [
      [null, '#ff4488', '#ff4488', null],
      ['#ff4488', '#ff77aa', '#ff4488', '#ff4488'],
      ['#ff4488', '#ff4488', '#ff4488', '#ff4488'],
      [null, '#ff4488', '#ff4488', null],
      [null, null, '#888', null],
      [null, null, '#888', null],
      [null, null, '#888', null],
      [null, null, '#888', null],
      [null, null, '#888', null],
      [null, null, '#888', null],
      [null, null, '#888', null],
      [null, null, '#888', null],
      [null, null, '#888', null],
      [null, null, '#888', null],
      [null, null, '#888', null],
    ],
  },
  flower: {
    name: 'Flower', slot: 'accessory', rarity: 'COMMON',
    anchor: { x: 18, y: 6 },
    pixels: [
      [null, '#ff6688', null],
      ['#ff6688', '#ffee00', '#ff6688'],
      [null, '#ff6688', null],
      [null, '#44aa44', null],
      [null, '#44aa44', null],
    ],
  },
  sword: {
    name: 'Sword', slot: 'accessory', rarity: 'RARE',
    anchor: { x: 21, y: 12 },
    pixels: [
      [null, '#ccc', null],
      [null, '#ccc', null],
      [null, '#ccc', null],
      [null, '#ccc', null],
      [null, '#ccc', null],
      [null, '#ccc', null],
      ['#daa520', '#daa520', '#daa520'],
      [null, '#8B4513', null],
      [null, '#8B4513', null],
    ],
  },
  magic_wand: {
    name: 'Magic Wand', slot: 'accessory', rarity: 'EPIC',
    anchor: { x: 21, y: 10 },
    pixels: [
      ['#ffee00', '#ffee00', '#ffee00'],
      ['#ffee00', '#fff', '#ffee00'],
      ['#ffee00', '#ffee00', '#ffee00'],
      [null, '#8B4513', null],
      [null, '#8B4513', null],
      [null, '#8B4513', null],
      [null, '#8B4513', null],
      [null, '#8B4513', null],
      [null, '#a0522d', null],
    ],
  },
  cape: {
    name: 'Cape', slot: 'accessory', rarity: 'RARE',
    anchor: { x: 5, y: 15 },
    pixels: [
      [null, null, null, '#8822cc', '#8822cc'],
      [null, null, '#8822cc', '#9933dd', '#8822cc'],
      [null, '#8822cc', '#9933dd', '#9933dd', '#8822cc'],
      ['#8822cc', '#9933dd', '#9933dd', '#9933dd', '#8822cc'],
      ['#8822cc', '#9933dd', '#aa44ee', '#9933dd', '#8822cc'],
      ['#8822cc', '#9933dd', '#9933dd', '#9933dd', '#8822cc'],
      ['#8822cc', '#9933dd', '#9933dd', '#9933dd', '#8822cc'],
      ['#8822cc', '#9933dd', '#9933dd', '#9933dd', '#8822cc'],
      ['#8822cc', '#9933dd', '#aa44ee', '#9933dd', '#8822cc'],
      ['#8822cc', '#9933dd', '#9933dd', '#9933dd', '#8822cc'],
      [null, '#8822cc', '#8822cc', '#8822cc', null],
    ],
  },
  mouse_toy: {
    name: 'Mouse Toy', slot: 'accessory', rarity: 'COMMON',
    anchor: { x: 22, y: 22 },
    pixels: [
      ['#777', null, null, '#777', null],
      ['#999', '#aaa', '#aaa', '#999', null],
      ['#999', '#222', '#aaa', '#aaa', '#ff8899'],
      ['#999', '#aaa', '#aaa', '#999', null],
      [null, '#999', '#999', null, null],
    ],
  },
  shield: {
    name: 'Shield', slot: 'accessory', rarity: 'UNCOMMON',
    anchor: { x: 21, y: 16 },
    pixels: [
      [null, '#888', '#888', '#888', '#888', null],
      ['#888', '#4488cc', '#4488cc', '#4488cc', '#4488cc', '#888'],
      ['#888', '#4488cc', '#ffdd00', '#ffdd00', '#4488cc', '#888'],
      ['#888', '#4488cc', '#ffdd00', '#ffdd00', '#4488cc', '#888'],
      ['#888', '#4488cc', '#4488cc', '#4488cc', '#4488cc', '#888'],
      [null, '#888', '#4488cc', '#4488cc', '#888', null],
      [null, null, '#888', '#888', null, null],
    ],
  },
  trident: {
    name: 'Trident', slot: 'accessory', rarity: 'EPIC',
    anchor: { x: 21, y: 10 },
    pixels: [
      ['#ffd700', null, '#ffd700', null, '#ffd700'],
      ['#ffd700', null, '#ffd700', null, '#ffd700'],
      ['#ffd700', '#ffd700', '#ffd700', '#ffd700', '#ffd700'],
      [null, null, '#daa520', null, null],
      [null, null, '#daa520', null, null],
      [null, null, '#daa520', null, null],
      [null, null, '#daa520', null, null],
      [null, null, '#daa520', null, null],
      [null, null, '#daa520', null, null],
      [null, null, '#8B4513', null, null],
      [null, null, '#8B4513', null, null],
    ],
  },
};

// Accessory IDs grouped by slot for quick lookup
export const SLOTS = ['hat', 'glasses', 'scarf', 'collar', 'accessory'];
export const ACCESSORIES_BY_SLOT = {};
for (const slot of SLOTS) {
  ACCESSORIES_BY_SLOT[slot] = Object.entries(ACCESSORIES)
    .filter(([, a]) => a.slot === slot)
    .map(([id]) => id);
}

const ALL_ACCESSORY_IDS = Object.keys(ACCESSORIES);

// ===== Base Cat Cache =====
const baseCatCache = {};
export function getBaseCat(paletteId) {
  if (!baseCatCache[paletteId]) {
    baseCatCache[paletteId] = generateBaseCat(paletteId);
  }
  return baseCatCache[paletteId];
}

export const BASE_CAT_IDS = Object.keys(PALETTES);

// ===== Rendering =====
export function drawSprite(ctx, grid, x, y, flipped = false) {
  const rows = grid.length;
  const maxCols = Math.max(...grid.map(r => r.length));
  ctx.save();
  if (flipped) {
    ctx.translate(x + maxCols * PIXEL_SCALE, y);
    ctx.scale(-1, 1);
    x = 0;
    y = 0;
  }
  for (let r = 0; r < rows; r++) {
    const row = grid[r];
    for (let c = 0; c < row.length; c++) {
      const color = row[c];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x + c * PIXEL_SCALE, y + r * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
      }
    }
  }
  ctx.restore();
}

export function drawComposedCat(ctx, baseId, accessories, x, y, flipped = false, scale = 1) {
  const baseGrid = getBaseCat(baseId);

  ctx.save();

  // Apply flip as a single transform around the cat's center
  if (flipped) {
    ctx.translate(x + DISPLAY_SIZE, y);
    ctx.scale(-1, 1);
    x = 0;
    y = 0;
  }

  if (scale !== 1) {
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    x = 0;
    y = 0;
  }

  // Draw cape first (behind body)
  const capeId = accessories.accessory;
  if (capeId && ACCESSORIES[capeId] && ACCESSORIES[capeId].name === 'Cape') {
    const acc = ACCESSORIES[capeId];
    drawSprite(ctx, acc.pixels, x + acc.anchor.x * PIXEL_SCALE, y + acc.anchor.y * PIXEL_SCALE, false);
  }

  // Draw base cat
  drawSprite(ctx, baseGrid, x, y, false);

  // Draw accessories in order (collar, scarf overlay collar if both present)
  const drawOrder = ['collar', 'scarf', 'hat', 'glasses', 'accessory'];
  for (const slot of drawOrder) {
    const accId = accessories[slot];
    if (!accId || !ACCESSORIES[accId]) continue;
    if (accId === capeId && ACCESSORIES[accId].name === 'Cape') continue; // already drawn
    const acc = ACCESSORIES[accId];
    drawSprite(ctx, acc.pixels, x + acc.anchor.x * PIXEL_SCALE, y + acc.anchor.y * PIXEL_SCALE, false);
  }

  ctx.restore();
}

// ===== Random Accessory Picking =====
export function pickRandomAccessories(minCount = 1, maxCount = 3) {
  // Decide how many accessories (1-3)
  const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));

  // Pick random slots
  const shuffledSlots = [...SLOTS].sort(() => Math.random() - 0.5);
  const chosenSlots = shuffledSlots.slice(0, count);

  const result = { hat: null, glasses: null, scarf: null, collar: null, accessory: null };

  for (const slot of chosenSlots) {
    const candidates = ACCESSORIES_BY_SLOT[slot];
    // Weighted random by rarity
    const weighted = candidates.map(id => ({
      id,
      weight: RARITY[ACCESSORIES[id].rarity].weight
    }));
    const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const w of weighted) {
      roll -= w.weight;
      if (roll <= 0) {
        result[slot] = w.id;
        break;
      }
    }
  }

  return result;
}

export function pickRandomBase() {
  return BASE_CAT_IDS[Math.floor(Math.random() * BASE_CAT_IDS.length)];
}
