/* FACADES — procedural building materials for map-based worlds (used by gis.js).

   OpenStreetMap rarely says what a building looks like (well under 1% of buildings in our regions carry a colour or
   material tag), so the look comes from rules: building type, height, size, and where it is. Each facade texture is
   drawn on a canvas as FOUR FLOORS × FOUR BAYS, and gis.js maps it so that floors line up with each building's own
   storey height (height ÷ number of floors). Colour variety comes from per-building tints (vertex colours), so one
   texture serves many buildings without looking cloned.

   Styles: curtain (glass towers), ribbon (banded office), punched (limestone/concrete), brick, collegiate (red brick
   with limestone bands, as on the Ohio State campus), house (siding), garage (parking decks), plain (industrial),
   shop (storefront ground floor), plus roof materials: shingle (pitched roofs), flat (membrane/gravel). */
import * as THREE from 'three';
import { rng } from '../../sci-fi-360/js/lib.js';

const S = 512;     // texture size (px); 4 floors × 4 bays → 128 px per floor/bay

function canvasPair() { const m = document.createElement('canvas'), e = document.createElement('canvas'); m.width = m.height = e.width = e.height = S;
  const x = m.getContext('2d'), y = e.getContext('2d'); y.fillStyle = '#000'; y.fillRect(0, 0, S, S); return { m, e, x, y }; }
function tex(c, renderer) { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; return t; }
const noise = (x, r, a, w = S, h = S, n = 2600) => { for (let i = 0; i < n; i++) { x.fillStyle = `rgba(${r() < .5 ? '0,0,0' : '255,255,255'},${a * r()})`; x.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); } };
/** a window: frame, glass with a sky reflection gradient, optional mullions; lit → emissive copy */
function win(x, y, px, py, w, h, { glass = ['#3d5469', '#9bb7cc'], frame = '#e9e6df', fw = 3, mull = 0, lit = false, warm = 1 } = {}) {
  x.fillStyle = frame; x.fillRect(px - fw, py - fw, w + 2 * fw, h + 2 * fw);
  const g = x.createLinearGradient(px, py, px + w * .6, py + h); g.addColorStop(0, glass[1]); g.addColorStop(.55, glass[0]); g.addColorStop(1, glass[0]); x.fillStyle = g; x.fillRect(px, py, w, h);
  x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.moveTo(px, py + h * .7); x.lineTo(px + w * .5, py); x.lineTo(px + w * .7, py); x.lineTo(px, py + h); x.fill();
  if (mull) { x.fillStyle = frame; if (mull & 1) x.fillRect(px + w / 2 - 1, py, 2, h); if (mull & 2) x.fillRect(px, py + h * .5 - 1, w, 2); }
  if (lit) { y.fillStyle = `rgba(255,${200 + 40 * warm},${140 + 80 * warm},.85)`; y.fillRect(px, py, w, h); }
}

const DRAW = {
  curtain(x, y, r) {             // glass curtain wall: 16 panels × 4 floors, gentle sky gradient, per-panel tone variation
    const g = x.createLinearGradient(0, 0, 0, S); g.addColorStop(0, '#b9cfe0'); g.addColorStop(1, '#6f8ea8'); x.fillStyle = g; x.fillRect(0, 0, S, S);
    for (let f = 0; f < 4; f++) for (let b = 0; b < 16; b++) { const v = r(); x.fillStyle = v < .5 ? `rgba(20,40,60,${.04 + v * .12})` : `rgba(255,255,255,${(v - .5) * .16})`; x.fillRect(b * 32, f * 128, 32, 128); }
    const sky = x.createLinearGradient(0, 0, S, S); sky.addColorStop(0, 'rgba(255,255,255,.14)'); sky.addColorStop(.5, 'rgba(255,255,255,0)'); sky.addColorStop(1, 'rgba(255,255,255,.08)'); x.fillStyle = sky; x.fillRect(0, 0, S, S);
    for (let f = 0; f < 4; f++) { x.fillStyle = 'rgba(40,58,74,.5)'; x.fillRect(0, f * 128 + 112, S, 16); x.fillStyle = 'rgba(230,240,248,.75)'; x.fillRect(0, f * 128 + 111, S, 2); }
    for (let b = 0; b <= 16; b++) { x.fillStyle = 'rgba(225,235,242,.8)'; x.fillRect(b * 32 - 1, 0, 2, S); }
    for (let f = 0; f < 4; f++) for (let b = 0; b < 16; b++) if (r() < .22) { y.fillStyle = `rgba(255,236,200,${.35 + r() * .4})`; y.fillRect(b * 32 + 2, f * 128 + 6, 28, 104); }
  },
  ribbon(x, y, r) {              // banded office: continuous window strips between light spandrels
    x.fillStyle = '#e4e1da'; x.fillRect(0, 0, S, S); noise(x, r, .05);
    for (let f = 0; f < 4; f++) { const top = f * 128 + 38; const g = x.createLinearGradient(0, top, 0, top + 62); g.addColorStop(0, '#9fb6c8'); g.addColorStop(1, '#3e5468'); x.fillStyle = g; x.fillRect(0, top, S, 62);
      for (let b = 0; b <= 16; b++) { x.fillStyle = '#d2d0ca'; x.fillRect(b * 32 - 1.5, top, 3, 62); }
      x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, top + 62, S, 4);
      for (let b = 0; b < 16; b++) if (r() < .25) { y.fillStyle = 'rgba(255,232,190,.7)'; y.fillRect(b * 32 + 2, top, 28, 62); } }
  },
  punched(x, y, r) {             // limestone / precast with punched windows, two per bay
    x.fillStyle = '#e8e1d2'; x.fillRect(0, 0, S, S); noise(x, r, .06);
    for (let f = 0; f < 4; f++) { x.fillStyle = 'rgba(120,105,80,.12)'; x.fillRect(0, f * 128 + 124, S, 4);
      for (let b = 0; b < 8; b++) win(x, y, b * 64 + 16, f * 128 + 26, 32, 74, { frame: '#d8d0bf', fw: 4, mull: 2, lit: r() < .22, glass: ['#34495c', '#93aec2'] }); }
  },
  brick(x, y, r) {               // red brick with stone lintels and sills
    x.fillStyle = '#b4614a'; x.fillRect(0, 0, S, S);
    for (let row = 0; row < S / 8; row++) for (let i = -1; i < S / 22 + 1; i++) { const off = row % 2 ? 11 : 0; const v = r(); x.fillStyle = `rgb(${150 + v * 50},${70 + v * 28},${52 + v * 20})`; x.fillRect(i * 22 + off, row * 8, 20, 6); }
    for (let f = 0; f < 4; f++) for (let b = 0; b < 8; b++) { const px = b * 64 + 18, py = f * 128 + 30;
      x.fillStyle = '#e6dccb'; x.fillRect(px - 6, py - 10, 40, 8); x.fillRect(px - 5, py + 76, 38, 6);
      win(x, y, px, py, 28, 72, { frame: '#f1ede4', fw: 3, mull: 2, lit: r() < .2 }); }
  },
  collegiate(x, y, r) {          // Ohio State campus brick: red brick, limestone string course each floor, paired windows
    DRAW.brick(x, y, r); x.fillStyle = '#ece4d3';
    for (let f = 0; f < 4; f++) { x.fillRect(0, f * 128 + 120, S, 8); x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(0, f * 128 + 128, S, 2); x.fillStyle = '#ece4d3'; }
    for (let b = 0; b <= 4; b++) { x.fillStyle = 'rgba(236,228,211,.9)'; x.fillRect(b * 128 - 5, 0, 10, S); }
  },
  house(x, y, r) {               // painted lap siding, double-hung windows with trim, a door every other bay
    x.fillStyle = '#ece8e0'; x.fillRect(0, 0, S, S);
    for (let k = 0; k < S; k += 9) { x.fillStyle = 'rgba(0,0,0,.09)'; x.fillRect(0, k, S, 1.5); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(0, k + 2, S, 1); }
    for (let f = 0; f < 4; f++) for (let b = 0; b < 4; b++) { const px = b * 128, py = f * 128;
      x.fillStyle = '#ffffff'; x.fillRect(px + 26, py + 28, 30, 62); x.fillRect(px + 74, py + 28, 30, 62);
      win(x, y, px + 30, py + 32, 22, 54, { frame: '#ffffff', fw: 1, mull: 2, lit: r() < .15 }); win(x, y, px + 78, py + 32, 22, 54, { frame: '#ffffff', fw: 1, mull: 2, lit: r() < .15 });
      if (f === 3 && b % 2 === 0) { x.fillStyle = ['#7a2f2a', '#2f4a63', '#2e4d36', '#4a3b2e'][Math.floor(r() * 4)]; x.fillRect(px + 52, py + 40, 26, 88); } }
  },
  garage(x, y, r) {              // parking structure: concrete spandrels with dark open decks
    x.fillStyle = '#c9c7c1'; x.fillRect(0, 0, S, S); noise(x, r, .07);
    for (let f = 0; f < 4; f++) { x.fillStyle = '#2b2f33'; x.fillRect(0, f * 128 + 34, S, 70);
      for (let b = 0; b <= 8; b++) { x.fillStyle = '#bdbab3'; x.fillRect(b * 64 - 4, f * 128 + 34, 8, 70); }
      for (let c = 0; c < 6; c++) if (r() < .6) { x.fillStyle = ['#b0b4b8', '#7a1f1f', '#e8e8e8', '#2a3a55', '#555'][Math.floor(r() * 5)]; x.fillRect(r() * S, f * 128 + 84, 30, 14); }
      y.fillStyle = 'rgba(255,240,200,.25)'; for (let b = 0; b < 8; b++) y.fillRect(b * 64 + 28, f * 128 + 36, 8, 3); }
  },
  plain(x, y, r) {               // industrial: ribbed metal panels, a few high windows
    x.fillStyle = '#c5c6c4'; x.fillRect(0, 0, S, S);
    for (let k = 0; k < S; k += 8) { x.fillStyle = 'rgba(0,0,0,.1)'; x.fillRect(k, 0, 2, S); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(k + 3, 0, 1, S); }
    for (let f = 0; f < 4; f += 2) for (let b = 0; b < 4; b++) win(x, y, b * 128 + 30, f * 128 + 20, 68, 22, { frame: '#9a9c9c', fw: 2, mull: 1 });
  },
  shop(x, y, r) {                // storefronts: tall glazing, awnings, signage band (one floor tall, repeats along the street)
    x.fillStyle = '#d9d2c4'; x.fillRect(0, 0, S, S); const aw = ['#8c1d24', '#1f4e3d', '#203f66', '#6b4a1f', '#2b2b2b', '#a8582a'];
    for (let f = 0; f < 4; f++) for (let b = 0; b < 4; b++) { const px = b * 128, py = f * 128;
      x.fillStyle = '#2d3136'; x.fillRect(px + 8, py + 20, 112, 14);                     // sign band
      x.fillStyle = 'rgba(255,255,255,.55)'; for (let k = 0; k < 4; k++) x.fillRect(px + 16 + k * 22, py + 25, 14, 4);
      win(x, y, px + 12, py + 46, 104, 76, { frame: '#3a3e42', fw: 3, mull: 1, glass: ['#24323e', '#7d97ab'], lit: r() < .6 });
      x.fillStyle = aw[Math.floor(r() * aw.length)]; x.beginPath(); x.moveTo(px + 6, py + 36); x.lineTo(px + 122, py + 36); x.lineTo(px + 116, py + 52); x.lineTo(px + 12, py + 52); x.fill(); }
  },
  shingle(x, y, r) {             // asphalt shingles for pitched roofs (tinted per house)
    x.fillStyle = '#6a6862'; x.fillRect(0, 0, S, S);
    for (let row = 0; row < S / 10; row++) for (let i = -1; i < S / 18 + 1; i++) { const v = r(); x.fillStyle = `rgb(${80 + v * 40},${78 + v * 38},${72 + v * 34})`; x.fillRect(i * 18 + (row % 2) * 9, row * 10, 17, 8); }
  },
  flat(x, y, r) {                // flat roof membrane / gravel with seams
    x.fillStyle = '#a9aaa7'; x.fillRect(0, 0, S, S); noise(x, r, .12, S, S, 9000);
    for (let k = 0; k < S; k += 64) { x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(k, 0, 2, S); }
  },
};

/** build every facade/roof texture and its material; returns { mats, tile: style → [bay width m, floor height m (default)] } */
export function makeFacades(ctx) {
  const mats = {}, out = {};
  // [bay width m, roughness, metalness, env]. Window spacing: curtain 1.5 m panels, ribbon 1.5 m mullions,
  // punched/brick/collegiate 2.6 m per window (2 per bay), house 4 m bays (2 windows), garage 4 m openings, shop 6 m fronts
  const params = { curtain: [6, .25, .35, 1.1], ribbon: [6, .7, .1, .5], punched: [5.2, .85, 0, .35], brick: [5.2, .9, 0, .3], collegiate: [5.2, .9, 0, .3],
    house: [4, .9, 0, .25], garage: [8, .95, 0, .2], plain: [5, .7, .3, .4], shop: [6, .6, .1, .5], shingle: [1, .95, 0, .15], flat: [1, .95, 0, .2] };
  let seed = 101;
  for (const k in DRAW) { const c = canvasPair(), r = rng(seed++); DRAW[k](c.x, c.y, r);
    const [, rough, metal, env] = params[k];
    mats[k] = ctx.mat('#ffffff', { map: tex(c.m), emissiveMap: tex(c.e), emissive: '#ffffff', emissiveIntensity: k === 'curtain' ? .25 : .3, roughness: rough, metalness: metal, envMapIntensity: env, vertexColors: true, side: k === 'shingle' ? THREE.DoubleSide : THREE.FrontSide }); }
  for (const k in params) out[k] = params[k][0] * 4;      // texture width in metres (4 bays)
  return { mats, bayW: out };
}

/* ---------------- rules: which facade, which colour ---------------- */
const HOUSEY = new Set(['house', 'detached', 'semidetached_house', 'terrace', 'bungalow', 'cabin', 'farm']);
const CIVIC = new Set(['university', 'college', 'school', 'dormitory', 'church', 'cathedral', 'chapel', 'civic', 'government', 'public', 'museum', 'library', 'hospital']);
const PARKING = new Set(['parking', 'garages']);
const LOWPLAIN = new Set(['shed', 'roof', 'service', 'transformer_tower', 'industrial', 'warehouse', 'storage_tank', 'hangar']);
const TINTS = {
  curtain: ['#cfe3f2', '#bfe1dc', '#d9d2c4', '#b7c4d0', '#e6eef4', '#9fb4c6'], ribbon: ['#ffffff', '#efe7da', '#e1e4e6', '#e9e0d0'],
  punched: ['#ffffff', '#f3ead8', '#e6e0d6', '#ece4d0', '#d9d4cb'], brick: ['#ffffff', '#f0d0c0', '#d9b19c', '#ffe6cf', '#c99a86', '#e8c6a8'],
  collegiate: ['#ffffff', '#f2d6c6', '#e6bea8'], house: ['#ffffff', '#f3e6c8', '#d8e4ea', '#e3ead9', '#f0d6d0', '#d6d0c8', '#c9d6c9', '#efe1d0'],
  garage: ['#ffffff', '#ebe7df', '#dcdcdc'], plain: ['#ffffff', '#e2e6e8', '#e8e2d6'], shop: ['#ffffff', '#efe6d6', '#e3ddd3'],
  shingle: ['#ffffff', '#c7b8a8', '#9aa1a8', '#b98d7a', '#8c8f84', '#7c6f66'], flat: ['#ffffff', '#d9dad6', '#c2c4c0', '#e9ebe8', '#b5b2aa', '#9c9d9a', '#8f918e', '#cfc8bb'] };
export const tintFor = (style, s) => TINTS[style][Math.floor(s * TINTS[style].length) % TINTS[style].length];

/**
 * pick a style for a building. ctx: { area, rect (0..1, how rectangular), campus (region is a campus) }
 * returns { style, pitched, shop, floorH }
 */
export function chooseStyle(b, s, { area, rect, campus }) {
  const k = b.k || 'yes', h = b.h;
  const out = { style: 'brick', pitched: false, shop: false, floorH: 3.6 };
  if (HOUSEY.has(k) || (k === 'yes' && h <= 10 && area < 200 && rect > .7) || ((k === 'garage') && area < 120)) {
    out.style = k === 'garage' ? 'plain' : 'house'; out.pitched = rect > .72 && area < 600; out.floorH = 3; return out; }
  if (PARKING.has(k) || (k === 'garage' && area >= 120) || /garage|parking/i.test(b.n || '')) { out.style = 'garage'; out.floorH = 3.2; return out; }
  if (LOWPLAIN.has(k) && h < 20) { out.style = 'plain'; out.floorH = 4.5; return out; }
  if (CIVIC.has(k)) { out.style = h > 60 ? 'curtain' : campus ? 'collegiate' : (s < .5 ? 'punched' : 'brick'); out.floorH = 4; return out; }
  if (h >= 60) { out.style = s < .62 ? 'curtain' : s < .85 ? 'ribbon' : 'punched'; out.floorH = 3.9; out.shop = s > .3; return out; }
  if (h >= 22) { out.style = k === 'apartments' || k === 'residential' ? (s < .5 ? 'brick' : 'punched') : (s < .35 ? 'ribbon' : s < .65 ? 'punched' : s < .85 ? 'curtain' : 'brick');
    out.floorH = 3.7; out.shop = ['commercial', 'retail', 'office', 'hotel', 'yes', 'apartments'].includes(k) && s > .25; return out; }
  if (['commercial', 'retail'].includes(k)) { out.style = s < .6 ? 'brick' : 'punched'; out.shop = true; out.floorH = 4; return out; }
  if (k === 'apartments' || k === 'residential' || k === 'dormitory') { out.style = campus && s < .5 ? 'collegiate' : 'brick'; out.floorH = 3.2; return out; }
  out.style = campus ? (s < .55 ? 'collegiate' : 'brick') : (s < .55 ? 'brick' : 'punched'); out.floorH = 3.8; return out;
}
