/* LANDMARKS — hand-modelled signature buildings for the map-based worlds, built on their real OpenStreetMap footprints.

   Each landmark finds its own outline in the map data by name, extrudes the real footprint for its base, and adds its
   signature parts (towers, setbacks, crowns, cupolas, belfries, atria) in the footprint's own frame (oriented box), so
   the model sits exactly where the building is and lines up with the street grid. Materials are drawn on canvases from
   published descriptions (see docs/LANDMARKS.md for the references and what is approximate).

   buildLandmarks(ctx, data, ids) → { group, colliders, skip: Set(of map buildings to leave out), at: { id: {x, z, top, ...} } }
   Coordinates: metres; x = east, z = south, y = up. */
import * as THREE from 'three';
import { V3, Col, Builder, boxGeo, cylGeo, rng } from '../../sci-fi-360/js/lib.js';
import { Acc, obb, signedArea, triOut, pointInRing } from './gis.js';
import { canvasPair, win, tex, noise, TEX_SIZE as S } from './facades.js';

/* ---------------- materials (drawn once; 512 px canvas = 4 bays × 4 floors unless noted) ---------------- */
const DRAW = {
  terracotta(x, y, r) {      // LeVeque: cream "oak-bark" glazed terra cotta, strong vertical piers, recessed windows, ornamented spandrels
    x.fillStyle = '#e9dcc0'; x.fillRect(0, 0, S, S); noise(x, r, .05);
    for (let b = 0; b < 4; b++) { x.fillStyle = '#f3e9d3'; x.fillRect(b * 128, 0, 22, S); x.fillStyle = 'rgba(120,95,60,.18)'; x.fillRect(b * 128 + 22, 0, 3, S); }
    for (let f = 0; f < 4; f++) for (let b = 0; b < 4; b++) { const px = b * 128 + 34, py = f * 128 + 16;
      x.fillStyle = '#d9c8a6'; x.fillRect(px - 6, py + 92, 92, 18); x.fillStyle = 'rgba(150,120,80,.35)'; for (let k = 0; k < 6; k++) x.fillRect(px + k * 14, py + 96, 8, 10);
      win(x, y, px, py, 34, 84, { frame: '#cdbb98', fw: 2, mull: 2, glass: ['#3c4a55', '#93a6b4'], lit: r() < .2 }); win(x, y, px + 44, py, 34, 84, { frame: '#cdbb98', fw: 2, mull: 2, glass: ['#3c4a55', '#93a6b4'], lit: r() < .2 }); }
  },
  redgranite(x, y, r) {      // Rhodes Tower: red "Carnelian" granite piers with recessed dark-grey glass in continuous vertical strips
    x.fillStyle = '#8e4b3e'; x.fillRect(0, 0, S, S); noise(x, r, .12, S, S, 7000);
    for (let b = 0; b < 8; b++) { const px = b * 64 + 22; const g = x.createLinearGradient(px, 0, px + 24, 0); g.addColorStop(0, '#2a3036'); g.addColorStop(.5, '#4b5560'); g.addColorStop(1, '#22282d'); x.fillStyle = g; x.fillRect(px, 0, 24, S);
      x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(px - 3, 0, 3, S);
      for (let f = 0; f < 4; f++) { x.fillStyle = '#7d4236'; x.fillRect(px, f * 128 + 104, 24, 24); if (r() < .25) { y.fillStyle = 'rgba(255,236,200,.55)'; y.fillRect(px + 2, f * 128 + 8, 20, 92); } } }
  },
  granitesolid(x, y, r) {    // red granite service cores and podium: ashlar panels, no windows
    x.fillStyle = '#8a4a3d'; x.fillRect(0, 0, S, S); noise(x, r, .12, S, S, 7000);
    for (let k = 0; k <= S; k += 64) { x.fillStyle = 'rgba(40,15,10,.25)'; x.fillRect(0, k, S, 2); x.fillRect(k, 0, 2, S); }
  },
  imperialred(x, y, r) {     // Huntington Center: imperial red granite with punched bronze-glass windows
    x.fillStyle = '#9a4f45'; x.fillRect(0, 0, S, S); noise(x, r, .1, S, S, 6000);
    for (let f = 0; f < 4; f++) for (let b = 0; b < 8; b++) win(x, y, b * 64 + 12, f * 128 + 30, 40, 70, { frame: '#86443b', fw: 3, glass: ['#4a3a2a', '#b08a5e'], lit: r() < .2 });
  },
  bronzeglass(x, y, r) {     // bronze-tinted curtain glass
    const g = x.createLinearGradient(0, 0, S * .4, S); g.addColorStop(0, '#d4b48a'); g.addColorStop(.5, '#8a6a46'); g.addColorStop(1, '#5e4630'); x.fillStyle = g; x.fillRect(0, 0, S, S);
    for (let f = 0; f < 4; f++) for (let b = 0; b < 16; b++) { const v = r(); x.fillStyle = `rgba(${v < .5 ? '0,0,0' : '255,240,210'},${.05 + (v % .5) * .2})`; x.fillRect(b * 32, f * 128, 32, 128); }
    for (let b = 0; b <= 16; b++) { x.fillStyle = 'rgba(60,40,24,.8)'; x.fillRect(b * 32 - 1, 0, 2, S); } for (let f = 0; f < 4; f++) { x.fillStyle = 'rgba(60,40,24,.8)'; x.fillRect(0, f * 128 + 120, S, 8); }
    for (let i = 0; i < 18; i++) { y.fillStyle = 'rgba(255,220,170,.4)'; y.fillRect(Math.floor(r() * 16) * 32 + 2, Math.floor(r() * 4) * 128 + 4, 28, 112); }
  },
  limestone(x, y, r) {       // classical ashlar limestone with tall windows (Statehouse, Thompson's original block); 2 tall floors per texture
    x.fillStyle = '#d9d2c1'; x.fillRect(0, 0, S, S); noise(x, r, .05);
    for (let k = 0; k < S; k += 32) { x.fillStyle = 'rgba(110,98,78,.22)'; x.fillRect(0, k, S, 2); for (let j = (k / 32) % 2 ? 0 : 48; j < S; j += 96) x.fillRect(j, k, 2, 32); }
    for (let f = 0; f < 2; f++) for (let b = 0; b < 4; b++) { const px = b * 128 + 40, py = f * 256 + 40;
      x.fillStyle = '#cfc6b2'; x.fillRect(px - 10, py - 18, 68, 14); win(x, y, px, py, 48, 170, { frame: '#e4ddcd', fw: 4, mull: 3, glass: ['#38444e', '#98abb8'], lit: r() < .2 }); }
  },
  arcade(x, y, r) {          // Beaux-Arts stone with round-arched windows (Thompson Library's Oval front); 2 floors per texture
    DRAW.limestone(x, y, r); x.fillStyle = '#d9d2c1';
    for (let b = 0; b < 4; b++) { const px = b * 128 + 40, py = 296; x.fillRect(px - 6, py - 30, 60, 40); x.fillStyle = '#e4ddcd'; x.beginPath(); x.arc(px + 24, py, 30, Math.PI, 0); x.fill();
      const g = x.createLinearGradient(px, py - 24, px, py + 10); g.addColorStop(0, '#98abb8'); g.addColorStop(1, '#38444e'); x.fillStyle = g; x.beginPath(); x.arc(px + 24, py, 24, Math.PI, 0); x.fill(); x.fillStyle = '#d9d2c1'; }
  },
  stacks(x, y, r) {          // Thompson's book tower: glass walls showing the stacks and reading floors behind
    x.fillStyle = '#5f7486'; x.fillRect(0, 0, S, S);
    for (let f = 0; f < 4; f++) { x.fillStyle = '#e8e2d4'; x.fillRect(0, f * 128 + 116, S, 12);
      for (let k = 0; k < 40; k++) { x.fillStyle = ['#7a3b2f', '#3f5a7a', '#8a7a4a', '#4d6b4a', '#6b4a6b', '#c9b48a'][Math.floor(r() * 6)]; x.fillRect(r() * S, f * 128 + 70 + r() * 30, 3 + r() * 4, 16 + r() * 18); }
      for (let b = 0; b <= 8; b++) { x.fillStyle = 'rgba(230,236,240,.85)'; x.fillRect(b * 64 - 1, f * 128, 2, 116); }
      y.fillStyle = 'rgba(255,230,180,.35)'; y.fillRect(0, f * 128 + 10, S, 100); }
    x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(0, 0, S, S);
  },
  victorianbrick(x, y, r) {  // University Hall: red brick, stone trim, tall pointed-arch windows (High Victorian Gothic); 4 floors
    x.fillStyle = '#9b4a37'; x.fillRect(0, 0, S, S);
    for (let row = 0; row < S / 8; row++) for (let i = -1; i < S / 22 + 1; i++) { const v = r(); x.fillStyle = `rgb(${140 + v * 40},${62 + v * 22},${46 + v * 16})`; x.fillRect(i * 22 + (row % 2 ? 11 : 0), row * 8, 20, 6); }
    for (let f = 0; f < 4; f++) { x.fillStyle = '#e2d6bd'; x.fillRect(0, f * 128 + 118, S, 6);
      for (let b = 0; b < 4; b++) { const px = b * 128 + 44, py = f * 128 + 26; x.fillStyle = '#e2d6bd'; x.beginPath(); x.moveTo(px - 6, py + 12); x.lineTo(px + 20, py - 16); x.lineTo(px + 46, py + 12); x.fill();
        win(x, y, px, py + 6, 40, 78, { frame: '#efe6d2', fw: 3, mull: 1, lit: r() < .2 }); } }
  },
  strata(x, y, r) {          // Orton Hall: Ohio stones in stratigraphic order, round-arched (Romanesque) windows. One texture = the whole wall height (v 0 → 1 bottom → top)
    const bands = ['#7d7466', '#8a7f6c', '#a89a7c', '#b9a582', '#c4ad86', '#a8876a', '#9c7a5e', '#b39270'];
    for (let i = 0; i < bands.length; i++) { x.fillStyle = bands[bands.length - 1 - i]; x.fillRect(0, i * S / 8, S, S / 8); }
    noise(x, r, .1, S, S, 9000);
    for (let k = 0; k < S; k += 16) { x.fillStyle = 'rgba(40,30,20,.18)'; x.fillRect(0, k, S, 1.5); }
    for (let f = 0; f < 3; f++) for (let b = 0; b < 4; b++) { const px = b * 128 + 40, py = 60 + f * 150;
      x.fillStyle = 'rgba(230,215,185,.9)'; x.beginPath(); x.arc(px + 24, py + 6, 30, Math.PI, 0); x.fill(); win(x, y, px, py, 48, 90, { frame: '#d8c9a8', fw: 3, mull: 1, lit: r() < .15 });
      x.fillStyle = '#5c6a76'; x.beginPath(); x.arc(px + 24, py + 2, 22, Math.PI, 0); x.fill(); }
  },
  unionbrick(x, y, r) {      // Ohio Union: reddish blended brick with limestone bands and large glazed openings; 4 levels
    x.fillStyle = '#a5563f'; x.fillRect(0, 0, S, S);
    for (let row = 0; row < S / 8; row++) for (let i = -1; i < S / 22 + 1; i++) { const v = r(); x.fillStyle = `rgb(${150 + v * 45},${72 + v * 26},${54 + v * 18})`; x.fillRect(i * 22 + (row % 2 ? 11 : 0), row * 8, 20, 6); }
    for (let f = 0; f < 4; f++) { x.fillStyle = '#e8dfcc'; x.fillRect(0, f * 128 + 112, S, 16);
      for (let b = 0; b < 4; b++) win(x, y, b * 128 + 18, f * 128 + 18, 92, 82, { frame: '#e8dfcc', fw: 4, mull: 1, glass: ['#2f3f4d', '#9fb6c6'], lit: r() < .25 }); }
  },
  arena(x, y, r) {           // Nationwide Arena: brick with a stone base and tall arched glazing; 2 tall storeys per texture
    x.fillStyle = '#9c5040'; x.fillRect(0, 0, S, S);
    for (let row = 0; row < S / 8; row++) for (let i = -1; i < S / 22 + 1; i++) { const v = r(); x.fillStyle = `rgb(${145 + v * 40},${68 + v * 22},${52 + v * 16})`; x.fillRect(i * 22 + (row % 2 ? 11 : 0), row * 8, 20, 6); }
    x.fillStyle = '#d6cdb9'; x.fillRect(0, 400, S, 112); for (let k = 400; k < S; k += 28) { x.fillStyle = 'rgba(90,80,60,.25)'; x.fillRect(0, k, S, 2); }
    for (let b = 0; b < 4; b++) { const px = b * 128 + 24; x.fillStyle = '#e1d8c4'; x.fillRect(px - 6, 60, 92, 330); win(x, y, px, 90, 80, 290, { frame: '#e1d8c4', fw: 2, mull: 3, glass: ['#2d3a46', '#9bb0c0'], lit: r() < .4 });
      x.fillStyle = '#e1d8c4'; x.beginPath(); x.arc(px + 40, 90, 46, Math.PI, 0); x.fill(); x.fillStyle = '#6b8193'; x.beginPath(); x.arc(px + 40, 90, 38, Math.PI, 0); x.fill(); }
  },
  slate(x, y, r) {           // dark slate / standing-seam roofs
    x.fillStyle = '#4b4f55'; x.fillRect(0, 0, S, S); for (let row = 0; row < S / 12; row++) for (let i = -1; i < S / 20 + 1; i++) { const v = r(); x.fillStyle = `rgb(${62 + v * 22},${66 + v * 22},${72 + v * 24})`; x.fillRect(i * 20 + (row % 2) * 10, row * 12, 19, 10); }
  },
  redtile(x, y, r) {         // red clay tile roofs
    x.fillStyle = '#9a4a32'; x.fillRect(0, 0, S, S); for (let row = 0; row < S / 10; row++) for (let i = 0; i < S / 12; i++) { const v = r(); x.fillStyle = `rgb(${150 + v * 40},${70 + v * 20},${48 + v * 14})`; x.fillRect(i * 12, row * 10, 10, 9); }
  },
};
let MATS = null;
function mats(ctx) {
  if (MATS) return MATS; MATS = {}; let seed = 501;
  const p = { terracotta: [.8, 0, .35], redgranite: [.55, .05, .5], granitesolid: [.6, .05, .45], imperialred: [.55, .05, .5], bronzeglass: [.25, .45, 1.1], limestone: [.85, 0, .3], arcade: [.85, 0, .3],
    stacks: [.3, .2, .8], victorianbrick: [.9, 0, .3], strata: [.92, 0, .25], unionbrick: [.88, 0, .3], arena: [.85, 0, .3], slate: [.7, .2, .35], redtile: [.85, 0, .25] };
  for (const k in DRAW) { const c = canvasPair(), r = rng(seed++); DRAW[k](c.x, c.y, r); const [ro, me, en] = p[k];
    MATS[k] = ctx.mat('#ffffff', { map: tex(c.m), emissiveMap: tex(c.e), emissive: '#ffffff', emissiveIntensity: .28, roughness: ro, metalness: me, envMapIntensity: en, vertexColors: true }); }
  MATS.white = ctx.mat('#ffffff', { roughness: .6, envMapIntensity: .5, vertexColors: true });
  MATS.metal = ctx.mat('#ffffff', { roughness: .35, metalness: .7, envMapIntensity: .9, vertexColors: true });
  MATS.glass = ctx.mat('#9fc0d8', { roughness: .1, metalness: .4, envMapIntensity: 1.3, transparent: true, opacity: .55 });
  MATS.glowW = new THREE.MeshBasicMaterial({ color: new Col('#fff1d0').multiplyScalar(1.6) });
  MATS.glowR = new THREE.MeshBasicMaterial({ color: new Col('#ff3a2a').multiplyScalar(1.8) });
  return MATS;
}

/* ---------------- frame helpers ---------------- */
/** an oriented frame on a footprint: P(u, v) → world [x, z]; rot = Y rotation that maps local x → long axis */
function frameOf(ring) { const o = obb(ring), vx = -o.uz, vz = o.ux;
  return { ...o, vx, vz, rot: Math.atan2(-o.uz, o.ux), P: (u, v) => [o.cx + o.ux * u + vx * v, o.cz + o.uz * u + vz * v],
    local: (x, z) => [(x - o.cx) * o.ux + (z - o.cz) * o.uz, (x - o.cx) * vx + (z - o.cz) * vz] }; }
/** which local side faces a world direction: returns +1/-1 along u or v */
const sideToward = (F, dx, dz) => ({ u: Math.sign(dx * F.ux + dz * F.uz) || 1, v: Math.sign(dx * F.vx + dz * F.vz) || 1 });
/** extrude a ring's walls between y0 and y1 with a texture of (tw × th) metres per repeat */
function extrude(A, ring, key, y0, y1, tw, th, col = new Col('#ffffff'), vb = y0) {
  const rg = signedArea(ring) > 0 ? ring : [...ring].reverse(); let u = 0;
  for (let i = 0; i < rg.length; i++) { const a = rg[i], c = rg[(i + 1) % rg.length], dx = c[0] - a[0], dz = c[1] - a[1], L = Math.hypot(dx, dz); if (L < .05) continue;
    A.wall(key, a, c, y0, y1, [dz / L, 0, -dx / L], u, u + L, tw, th, col, vb); u += L; }
}
const inset = (ring, m) => { const cx = ring.reduce((s, p) => s + p[0], 0) / ring.length, cz = ring.reduce((s, p) => s + p[1], 0) / ring.length;
  return ring.map(([x, z]) => { const dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz) || 1; return [x - dx / d * m, z - dz / d * m]; }); };
/** a box in a frame: centre (u, v), size w (along u) × d (along v), from y up h; tw/th texture metres */
function fbox(B, F, key, u, v, w, d, y, h, col, tw = 8, th = 8, rotExtra = 0) { const [x, z] = F.P(u, v); B.add(key, boxGeo(w, h, d, tw, th), [x, y, z], [0, F.rot + rotExtra, 0], null, col); }
/** a pyramid (n sides) roof */
const pyramid = (B, key, x, y, z, r, h, rot, col, n = 4) => B.add(key, new THREE.ConeGeometry(r, h, n).rotateY(Math.PI / n).translate(0, h / 2, 0), [x, y, z], [0, rot, 0], null, col);
/** a hipped roof over a frame-aligned rectangle (four slopes); key texture for the slopes */
function hipRoof(A, F, key, u0, v0, w, d, y, rise, col) { const hw = w / 2, hd = d / 2, ridge = Math.max(0, hw - hd);
  const P3 = (u, v, yy) => { const [x, z] = F.P(u0 + u, v0 + v); return [x, yy, z]; };
  const c = [P3(-hw, -hd, y), P3(hw, -hd, y), P3(hw, hd, y), P3(-hw, hd, y)], r0 = P3(-ridge, 0, y + rise), r1 = P3(ridge, 0, y + rise);
  const n = (a, b, cc) => { const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ac = [cc[0] - a[0], cc[1] - a[1], cc[2] - a[2]]; let v = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]]; const l = Math.hypot(...v) || 1; v = v.map(q => q / l); return v[1] < 0 ? v.map(q => -q) : v; };
  const uv = p => [p[0] / 4, p[2] / 4];
  const T = (a, b, cc) => triOut(A, key, a, b, cc, n(a, b, cc), uv(a), uv(b), uv(cc), col);
  T(c[0], c[1], r1); T(c[0], r1, r0); T(c[2], c[3], r0); T(c[2], r0, r1); T(c[1], c[2], r1); T(c[3], c[0], r0);
}
const colliderOf = (ring, y0, y1, name) => { let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const [x, z] of ring) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); } return [x0, y0, z0, x1, y1, z1, name]; };

/* ---------------- the landmarks ---------------- */
const LANDMARKS = {
  /* LeVeque Tower (1927, 169 m, 47 floors): cream terra cotta; square shaft rising from the site's south-west corner, flanked by
     18-storey wings; three sculpted setbacks; square → octagonal near the top; observation gallery and domed lantern. */
  leveque: { match: /^leveque tower$/i, build(b, F, B, A, M, out) {
    const ring = b.pts, wingsH = 18 * 3.7;
    extrude(A, ring, 'terracotta', 0, wingsH, 12, 14.8); A.poly('white', ring, null, wingsH + .02, new Col('#cfc6b4'), 8);
    // tower at the south-west corner of the site (smallest x - z)
    const cs = [[-F.w / 2, -F.d / 2], [F.w / 2, -F.d / 2], [F.w / 2, F.d / 2], [-F.w / 2, F.d / 2]].map(([u, v]) => ({ u, v, w: F.P(u, v) }));
    const c = cs.reduce((a, q) => (q.w[0] - q.w[1] < a.w[0] - a.w[1] ? q : a)); const s = 26, tu = c.u - Math.sign(c.u) * s / 2, tv = c.v - Math.sign(c.v) * s / 2;
    const tiers = [[s, 0, 122], [s - 4, 122, 136], [s - 8, 136, 146]]; let topY = 0;
    for (const [w, y0, y1] of tiers) { fbox(B, F, 'terracotta', tu, tv, w, w, y0, y1 - y0, new Col('#ffffff'), 12, 14.8);
      for (const [du, dv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { fbox(B, F, 'terracotta', tu + du * (w / 2 - .6), tv + dv * (w / 2 - .6), 2.4, 2.4, y0, y1 - y0 + 1.2, new Col('#fff6e4'), 3, 14.8); // corner piers
        if (y0 > 0) { const [x, z] = F.P(tu + du * (w / 2 + 1.6), tv + dv * (w / 2 + 1.6)); B.add('white', new THREE.ConeGeometry(1.1, 6.5, 4).translate(0, 3.25, 0), [x, y0 - .5, z], null, null, '#e8dcc4'); } } // sculptures at the setbacks
      topY = y1; }
    const [tx, tz] = F.P(tu, tv);
    B.add('terracotta', cylGeo(7.2, 8.2, 9, 8, 12, 14.8), [tx, topY, tz], [0, F.rot + Math.PI / 8, 0], null, '#ffffff');          // octagonal stage
    B.add('white', cylGeo(7.8, 7.8, 1, 8), [tx, topY + 9, tz], [0, F.rot + Math.PI / 8, 0], null, '#efe4cc');                     // observation gallery
    for (let i = 0; i < 8; i++) { const a = F.rot + i * Math.PI / 4; B.add('white', boxGeo(.7, 4.2, .7), [tx + Math.cos(a) * 6.6, topY + 10, tz + Math.sin(a) * 6.6], null, null, '#efe4cc'); }
    B.add('terracotta', cylGeo(5.2, 6, 4.5, 8, 12, 14.8), [tx, topY + 10, tz], [0, F.rot + Math.PI / 8, 0], null, '#ffffff');      // lantern
    B.add('white', new THREE.SphereGeometry(5.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), [tx, topY + 14.5, tz], null, [1, .75, 1], '#e8d9b8');  // dome
    B.add('glowW', new THREE.SphereGeometry(.9, 10, 8), [tx, topY + 19.6, tz]);
    out.colliders.push(colliderOf(ring, 0, wingsH, 'LeVeque Tower wings')); out.colliders.push([tx - s / 2, 0, tz - s / 2, tx + s / 2, topY + 20, tz + s / 2, 'LeVeque Tower']);
    out.at.leveque = { x: tx, z: tz, top: topY + 20, h: topY + 20 }; } },

  /* Rhodes State Office Tower (1974, 192 m, 41 floors): red Carnelian granite, dark grey glass in vertical strips; 144 ft (44 m)
     square office floors with the elevator/service cores outside the square on the north and east; low base; antennas, beacons, helipad. */
  rhodes: { match: /^rhodes state office tower$/i, build(b, F, B, A, M, out) {
    const ring = b.pts, H = 192, sq = 44;
    extrude(A, ring, 'granitesolid', 0, 9, 12, 12); A.poly('white', ring, null, 9.02, new Col('#8a4a3d'), 8);
    const north = sideToward(F, 0, -1), east = sideToward(F, 1, 0);                    // which local sides face north and east
    // office square toward the south-west, cores on the north and east faces
    const tu = -east.u * (F.w - sq) / 2 * .9, tv = -north.v * (F.d - sq) / 2 * .9;
    fbox(B, F, 'redgranite', tu, tv, sq, sq, 0, H, new Col('#ffffff'), 6, 18.6);
    fbox(B, F, 'granitesolid', tu, tv + north.v * (sq / 2 + 3.5), sq * .55, 7, 0, H + 6, new Col('#ffffff'), 12, 12);   // north core
    fbox(B, F, 'granitesolid', tu + east.u * (sq / 2 + 3.5), tv, 7, sq * .55, 0, H + 6, new Col('#ffffff'), 12, 12);    // east core
    fbox(B, F, 'granitesolid', tu, tv, sq + .6, sq + .6, H, 3, new Col('#ffffff'), 12, 12);                                // parapet cap
    const [x, z] = F.P(tu, tv); fbox(B, F, 'metal', tu - 8, tv - 8, 16, 16, H + 3, 4, new Col('#9aa0a6'));
    B.add('white', cylGeo(9, 9, .3, 32), [x + 9, H + 3.05, z + 9], null, null, '#3a3e44'); B.add('glowW', new THREE.TorusGeometry(8.2, .15, 6, 40).rotateX(Math.PI / 2), [x + 9, H + 3.4, z + 9]);
    B.add('metal', cylGeo(.5, .9, 34, 8), [x - 6, H + 7, z - 6], null, null, '#c8ccd0'); B.add('metal', new THREE.TorusGeometry(4, .35, 6, 24), [x - 6, H + 26, z - 6], [Math.PI / 2, 0, 0], null, '#c8ccd0');
    B.add('glowR', new THREE.SphereGeometry(.7, 8, 6), [x - 6, H + 41.5, z - 6]);
    out.colliders.push([x - sq / 2 - 8, 0, z - sq / 2 - 8, x + sq / 2 + 8, H + 42, z + sq / 2 + 8, 'Rhodes State Office Tower']); out.at.rhodes = { x, z, top: H + 42, h: H }; } },

  /* Huntington Center (1984, 156 m, 37 floors; SOM): imperial red granite and bronze glass; reads as two granite towers
     linked by bronze glass, with two storeys of greenhouses at the top. */
  huntington: { match: /^huntington center$/i, build(b, F, B, A, M, out) {
    const ring = b.pts, H = 148;
    extrude(A, ring, 'imperialred', 0, 18, 10, 16); A.poly('white', ring, null, 18.02, new Col('#7e4038'), 8);
    const w = Math.min(F.w, 60), d = Math.min(F.d, 58), slab = d * .36, gap = d - 2 * slab;
    for (const sd of [-1, 1]) { fbox(B, F, 'imperialred', 0, sd * (gap / 2 + slab / 2), w, slab, 0, H - (sd > 0 ? 0 : 6), new Col('#ffffff'), 10, 16);
      fbox(B, F, 'imperialred', 0, sd * (gap / 2 + slab / 2), w - 6, slab - 4, H - (sd > 0 ? 0 : 6), 4, new Col('#f2e6e2'), 10, 16); }
    fbox(B, F, 'bronzeglass', 0, 0, w - 8, gap + .4, 0, H + 2, new Col('#ffffff'), 12, 16);
    // greenhouse crown: a two-storey glazed gable over the link
    const [x, z] = F.P(0, 0); const gh = new THREE.CylinderGeometry(gap * .62, gap * .62, w - 12, 3, 1).rotateZ(Math.PI / 2).rotateX(-Math.PI / 2).translate(0, gap * .31, 0);   // apex up, ridge along the long axis
    B.add('bronzeglass', gh, [x, H + 2, z], [0, F.rot, 0], [1, 1.4, 1], '#ffffff');
    out.colliders.push(colliderOf(ring, 0, H + 14, 'Huntington Center')); out.at.huntington = { x, z, top: H + 14, h: H }; } },

  /* Ohio Statehouse (completed 1861): Greek Revival in Columbus limestone; 184 × 304 ft; recessed Doric porticos on the long
     High Street and Third Street fronts; a cylindrical drum (cupola) with a shallow conical roof, 158 ft high. */
  statehouse: { match: /^ohio statehouse$/i, build(b, F, B, A, M, out) {
    const ring = b.pts, H = 17;
    extrude(A, ring, 'limestone', 0, H, 10, 17); A.poly('white', ring, null, H + .02, new Col('#cfc8b6'), 8);
    extrude(A, inset(ring, -.6), 'white', H - 1.6, H, 8, 8, new Col('#e6e0d2'));                                     // cornice
    for (const sd of [-1, 1]) { const vv = sd * (F.d / 2 + .2);                                                       // porticos on both long faces
      fbox(B, F, 'white', 0, vv - sd * 2.6, F.w * .34, 5.2, 0, 1.2, new Col('#d8d2c4'));                            // steps
      for (let i = 0; i < 8; i++) { const [x, z] = F.P(-F.w * .15 + i * F.w * .3 / 7, vv); B.add('white', cylGeo(1.05, 1.2, H - 3.2, 14), [x, 1.2, z], null, null, '#ece6d8'); }
      fbox(B, F, 'white', 0, vv, F.w * .34, 1.6, H - 3.2, 3.2, new Col('#e6e0d2')); }
    const [x, z] = F.P(0, 0);
    B.add('limestone', cylGeo(10, 10, 24, 40, 10, 17), [x, H, z], null, null, '#ffffff');
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; B.add('white', boxGeo(1.6, 9, .6), [x + Math.cos(a) * 10.05, H + 8, z + Math.sin(a) * 10.05], [0, -a + Math.PI / 2, 0], null, '#3c444e'); }
    B.add('white', cylGeo(11, 11, 1.8, 40), [x, H + 24, z], null, null, '#ece6d8'); B.add('white', new THREE.ConeGeometry(10.8, 4, 40).translate(0, 2, 0), [x, H + 25.8, z], null, null, '#bdb6a6');
    out.colliders.push(colliderOf(ring, 0, H, 'Ohio Statehouse'), [x - 11, H, z - 11, x + 11, H + 30, z + 11, 'Statehouse cupola']); out.at.statehouse = { x, z, top: H + 30, h: H }; } },

  /* Nationwide Arena (2000): brick and stone veneer with tall arched glazing; arena roof */
  arena: { match: /^nationwide arena$/i, build(b, F, B, A, M, out) {
    const ring = b.pts, H = Math.max(22, b.h || 22);
    extrude(A, ring, 'arena', 0, H, 14, 2 * H / 2, new Col('#ffffff'), 0); A.poly('white', ring, null, H + .02, new Col('#a7a9ab'), 8);
    const [x, z] = F.P(0, 0); B.add('white', new THREE.SphereGeometry(1, 40, 12, 0, Math.PI * 2, 0, Math.PI / 2), [x, H, z], [0, F.rot, 0], [F.w * .42, 9, F.d * .4], '#b9bcbf');
    out.colliders.push(colliderOf(ring, 0, H + 9, 'Nationwide Arena')); out.at.arena = { x, z, top: H + 9, h: H }; } },

  /* William Oxley Thompson Memorial Library (1913; stacks tower 1951; renovated 2009): Beaux-Arts stone front facing the Oval
     with round-arched windows and a low red-tile roof; the ten-storey book tower behind, its east and west stone walls replaced
     with glass in 2009; a skylit west atrium with a curved glass facade. */
  thompson: { match: /thompson memorial library/i, build(b, F, B, A, M, out) {
    const ring = b.pts, H = 20, east = sideToward(F, 1, 0);
    extrude(A, ring, 'arcade', 0, H, 12, 20); A.poly('white', ring, null, H + .02, new Col('#bdb6a6'), 8);
    extrude(A, inset(ring, -.5), 'white', H - 1.4, H, 8, 8, new Col('#ece6d8'));
    hipRoof(A, F, 'redtile', east.u * F.w * .3, 0, F.w * .36, F.d * .9, H, 5, new Col('#ffffff'));                    // the original block's roof, on the Oval side
    const tw = F.w * .38, td = F.d * .5, tu = -east.u * F.w * .08, top = H + 10 * 3.3;                                   // book tower
    fbox(B, F, 'limestone', tu, 0, tw, td, H, top - H, new Col('#ffffff'), 10, 17);                                    // stone ends (north/south)
    fbox(B, F, 'stacks', tu, 0, tw + .4, td - 4, H, top - H, new Col('#ffffff'), 12, 13.2);                            // glass faces east/west
    fbox(B, F, 'white', tu, 0, tw + 1, td + 1, top, 1.4, new Col('#e6e0d2'));
    const [ax, az] = F.P(-east.u * (F.w / 2 + 2), 0); const atr = new THREE.CylinderGeometry(F.d * .34, F.d * .34, 16, 24, 1, true, 0, Math.PI).translate(0, 8, 0);
    B.add('glass', atr, [ax, 0, az], [0, F.rot + (east.u > 0 ? Math.PI : 0), 0], [.45, 1, 1]);         // curved west atrium glass, bulging west
    const [x, z] = F.P(tu, 0); out.colliders.push(colliderOf(ring, 0, H + 5, 'Thompson Library'), [x - tw / 2, H, z - td / 2, x + tw / 2, top + 1.4, z + td / 2, 'Thompson Library tower']);
    out.at.thompson = { x, z, top: top + 1.4, h: top }; } },

  /* Ohio Union (2010): four levels of reddish blended brick with limestone bands; formal glazed entry on axis on High Street */
  union: { match: /^ohio union$/i, build(b, F, B, A, M, out) {
    const ring = b.pts, H = 20, east = sideToward(F, 1, 0);
    extrude(A, ring, 'unionbrick', 0, H, 14, 18); A.poly('white', ring, null, H + .02, new Col('#b9b7b0'), 8); extrude(A, inset(ring, -.4), 'white', H - 1, H + .8, 8, 8, new Col('#e8dfcc'));
    const eu = east.u * (F.w / 2), [x, z] = F.P(eu, 0);                                                               // High Street entry
    fbox(B, F, 'glass', eu, 0, 10, 24, 0, H + 4); fbox(B, F, 'white', eu, -12.5, 11, 2, 0, H + 5, new Col('#e8dfcc')); fbox(B, F, 'white', eu, 12.5, 11, 2, 0, H + 5, new Col('#e8dfcc'));
    fbox(B, F, 'white', eu, 0, 11, 27, H + 4, 1.2, new Col('#e8dfcc'));
    const [cx, cz] = F.P(0, 0); out.colliders.push(colliderOf(ring, 0, H + 5, 'Ohio Union')); out.at.union = { x: cx, z: cz, top: H + 5, h: H, entry: { x, z } }; } },

  /* Orton Hall (1893; Yost & Packard): Romanesque, built of Ohio stones laid in stratigraphic order; bell tower (1915) with a
     ring of columns carrying fossil-animal grotesques at the top; steep roofs. Tower placement is approximate. */
  orton: { match: /^orton hall$/i, build(b, F, B, A, M, out, ctxW) {
    const ring = b.pts, H = 14;
    extrude(A, ring, 'strata', 0, H, 16, H); hipRoof(A, F, 'slate', 0, 0, F.w * .92, F.d * .92, H, 6, new Col('#ffffff'));
    const oval = ctxW.oval || { x: 0, z: 0 }; const cs = []; for (let i = 0; i < ring.length; i++) cs.push(ring[i]);
    const c = cs.reduce((a, p) => (Math.hypot(p[0] - oval.x, p[1] - oval.z) < Math.hypot(a[0] - oval.x, a[1] - oval.z) ? p : a), cs[0]);
    const [lu, lv] = F.local(c[0], c[1]); const tu = lu * .82, tv = lv * .82, [tx, tz] = F.P(tu, tv), T = 8, TH = 30;
    fbox(B, F, 'strata', tu, tv, T, T, 0, TH, new Col('#ffffff'), 16, TH);
    for (let i = 0; i < 24; i++) { const side = Math.floor(i / 6), k = (i % 6) / 5 - .5, du = [k, .5, -k, -.5][side] * T, dv = [-.5, k, .5, -k][side] * T;  // 24 columns
      const [x, z] = F.P(tu + du, tv + dv); B.add('white', cylGeo(.28, .32, 4.2, 8), [x, TH, z], null, null, '#d8c9a8'); }
    fbox(B, F, 'white', tu, tv, T + 1, T + 1, TH + 4.2, .8, new Col('#cdbf9e'));
    pyramid(B, 'slate', tx, TH + 5, tz, T * .78, 9, F.rot, '#ffffff');
    out.colliders.push(colliderOf(ring, 0, H + 6, 'Orton Hall'), [tx - T / 2, 0, tz - T / 2, tx + T / 2, TH + 14, tz + T / 2, 'Orton Hall bell tower']);
    const [cx, cz] = F.P(0, 0); out.at.orton = { x: cx, z: cz, top: H + 6, h: H }; out.at.ortonTower = { x: tx, z: tz, top: TH + 14, h: TH + 14 }; } },

  /* University Hall (1873, rebuilt to the original design 1976): High Victorian Gothic brick; centre section with the clock tower
     over the main entrance (facing the Oval), east and west wings; steep slate roofs. */
  univhall: { match: /^university hall$/i, build(b, F, B, A, M, out, ctxW) {
    const ring = b.pts, H = 17; const oval = ctxW.oval || { x: 0, z: 0 }, front = sideToward(F, oval.x - F.cx, oval.z - F.cz);
    extrude(A, ring, 'victorianbrick', 0, H, 12, 17); hipRoof(A, F, 'slate', 0, 0, F.w * .96, F.d * .9, H, 7, new Col('#ffffff'));
    for (const su of [-1, 1]) { fbox(B, F, 'victorianbrick', su * F.w * .4, 0, F.w * .14, F.d * 1.02, 0, H + 2, new Col('#ffffff'), 12, 17); pyramid(B, 'slate', ...(([x, z]) => [x, H + 2, z])(F.P(su * F.w * .4, 0)), F.d * .62, 6, F.rot, '#ffffff'); }
    const tv = front.v * (F.d / 2 - 2), [tx, tz] = F.P(0, tv), T = 8.5, TH = 33;
    fbox(B, F, 'victorianbrick', 0, tv, T, T, 0, TH, new Col('#ffffff'), 12, 17);
    for (const [du, dv] of [[0, front.v], [1, 0], [-1, 0]]) { const [x, z] = F.P(du * (T / 2 + .05), tv + dv * (T / 2 + .05)); B.add('white', cylGeo(2, 2, .3, 24).rotateX(Math.PI / 2), [x, TH - 5, z], [0, F.rot + (du ? Math.PI / 2 : 0), 0], null, '#f1ead8'); }
    pyramid(B, 'slate', tx, TH, tz, T * .8, 11, F.rot, '#ffffff'); B.add('metal', cylGeo(.12, .2, 4, 6), [tx, TH + 11, tz], null, null, '#3a3a3a');
    out.colliders.push(colliderOf(ring, 0, H + 7, 'University Hall'), [tx - T / 2, 0, tz - T / 2, tx + T / 2, TH + 15, tz + T / 2, 'University Hall tower']);
    out.at.univhall = { x: tx, z: tz, top: TH + 15, h: TH }; } },
};

export function buildLandmarks(ctx, data, ids, ctxW = {}) {
  const M = mats(ctx), group = new THREE.Group(); group.name = 'landmarks'; const out = { group, colliders: [], skip: new Set(), at: {}, missing: [] };
  const B = new Builder(), A = new Acc();
  for (const id of ids) { const L = LANDMARKS[id]; const b = data.buildings.find(q => q.n && L.match.test(q.n) && !q.part) || data.buildings.find(q => q.n && L.match.test(q.n));
    if (!b) { out.missing.push(id); continue; }
    // OSM often maps a landmark in pieces: unnamed building:parts inside it, or an enclosing complex outline. Leave out
    // every map building that sits inside this footprint, or whose outline contains this footprint's centre.
    const cen = q => { const r = q.pts; let x = 0, z = 0; for (const p of r) { x += p[0]; z += p[1]; } return [x / r.length, z / r.length]; };
    const [bx, bz] = cen(b);
    for (const q of data.buildings) { if (q === b || (q.n && L.match.test(q.n))) { out.skip.add(q); continue; }
      const [qx, qz] = cen(q); if (Math.abs(qx - bx) > 400 || Math.abs(qz - bz) > 400) continue;
      if (pointInRing(qx, qz, b.pts) || (pointInRing(bx, bz, q.pts) && !q.n)) out.skip.add(q); }
    const F = frameOf(b.pts); L.build(b, F, B, A, M, out, ctxW); }
  B.build(M, group); A.build(M, group);
  if (out.missing.length) console.info('[landmarks] not found in map data:', out.missing.join(', '));
  return out;
}
export const LANDMARK_IDS = Object.keys(LANDMARKS);
