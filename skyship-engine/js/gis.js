/* GIS CITY BUILDER — turns a map-data layer file (data/gis/<region>.json, made by tools/gis/osm_world.py from
   OpenStreetMap) into skyship-engine geometry: extruded buildings with facades, roads, bridges, water, parks,
   parking and trees. World modules (columbus2050_gis.js, osu_campus.js) call this, then add their own
   story layer (landmark detail, 2050 overlays, people, vehicles, flight path, anchors).

   Coordinates: metres, x = east, z = south, y = up (same as the engine). Layer files store flat [x, z, ...]
   arrays in decimetres.

   Map data (c) OpenStreetMap contributors, ODbL 1.0. */
import * as THREE from 'three';
import { V3, Col, rng, clamp } from '../../sci-fi-360/js/lib.js';

/** fetch and decode a region's layer file (path relative to the repository root) */
export async function loadRegion(id) {
  const url = new URL(`../../data/gis/${id}.json`, import.meta.url);
  const r = await fetch(url); if (!r.ok) throw new Error(`Map data for ${id} is missing (${url.pathname}). Run tools/gis/osm_world.py.`);
  const d = await r.json();
  const pts = a => { const o = []; for (let i = 0; i < a.length; i += 2) o.push([a[i] / 10, a[i + 1] / 10]); return o; };
  for (const k of ['buildings', 'roads', 'rail', 'water', 'rivers', 'green', 'parking']) for (const f of d[k] || []) { f.pts = pts(f.p); if (f.holes) f.holeP = f.holes.map(pts); }
  d.treePts = pts(d.trees || []);
  return d;
}

/* ---------------- small geometry helpers ---------------- */
const signedArea = r => { let s = 0; for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
export function pointInRing(x, z, r) { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[i], b = r[j]; if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
const bbox = r => { let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const [x, z] of r) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; } return [x0, z0, x1, z1]; };

/** accumulates triangles per material key (positions, normals, uvs, colours) */
class Acc {
  constructor() { this.k = {}; }
  b(key) { return this.k[key] ||= { p: [], n: [], u: [], c: [] }; }
  tri(key, a, b, c, n, ua, ub, uc, col) { const B = this.b(key); B.p.push(...a, ...b, ...c); for (let i = 0; i < 3; i++) B.n.push(...n); B.u.push(...ua, ...ub, ...uc); for (let i = 0; i < 3; i++) B.c.push(col.r, col.g, col.b); }
  /** flat polygon (outer ring + holes) at height y, facing up; uv in metres / tile */
  poly(key, ring, holes, y, col, tile = 8) {
    const c2 = ring.map(([x, z]) => new THREE.Vector2(x, z)), h2 = (holes || []).filter(h => h.length > 2).map(h => h.map(([x, z]) => new THREE.Vector2(x, z)));
    let tris; try { tris = THREE.ShapeUtils.triangulateShape(c2, h2); } catch (e) { return; }
    const all = [...c2, ...h2.flat()];
    for (const [i, j, k] of tris) { let A = all[i], Bv = all[j], C = all[k];
      if ((Bv.y - A.y) * (C.x - A.x) - (Bv.x - A.x) * (C.y - A.y) < 0) [Bv, C] = [C, Bv];   // make it face up
      this.tri(key, [A.x, y, A.y], [Bv.x, y, Bv.y], [C.x, y, C.y], [0, 1, 0], [A.x / tile, A.y / tile], [Bv.x / tile, Bv.y / tile], [C.x / tile, C.y / tile], col); }
  }
  /** vertical quad from a to b (xz), y0..y1, outward normal n */
  wall(key, a, b, y0, y1, n, u0, u1, tw, th, col) {
    const A0 = [a[0], y0, a[1]], B0 = [b[0], y0, b[1]], A1 = [a[0], y1, a[1]], B1 = [b[0], y1, b[1]];
    const v0 = y0 / th, v1 = y1 / th, ua = u0 / tw, ub = u1 / tw;
    this.tri(key, A0, B1, B0, n, [ua, v0], [ub, v1], [ub, v0], col); this.tri(key, A0, A1, B1, n, [ua, v0], [ua, v1], [ub, v1], col);
  }
  build(mats, parent) { const out = {};
    for (const key in this.k) { const B = this.k[key]; if (!B.p.length || !mats[key]) continue; const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(B.u, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(B.c, 3)); g.computeBoundingSphere();
      const m = new THREE.Mesh(g, mats[key]); m.matrixAutoUpdate = false; m.updateMatrix(); parent.add(m); out[key] = m; }
    this.k = {}; return out; }
}

/* ---------------- facade textures (canvas) ---------------- */
function facade(kind, seed) {
  const r = rng(seed), W = 256, H = 256; const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const cm = mk(), ce = mk(), x = cm.getContext('2d'), e = ce.getContext('2d'); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  const spec = { tower: { bg: '#9fb4c8', win: '#3f5f80', cols: 8, rows: 8, ww: .86, wh: .78, mull: '#d9e3ec' },
                 office: { bg: '#d9d2c3', win: '#40566b', cols: 4, rows: 4, ww: .55, wh: .5 },
                 brick: { bg: '#a65a45', win: '#2f3a44', cols: 4, rows: 4, ww: .42, wh: .52, brick: true },
                 stone: { bg: '#d7cdb8', win: '#3a4652', cols: 3, rows: 4, ww: .38, wh: .58, arch: true },
                 house: { bg: '#e6e0d4', win: '#33414d', cols: 2, rows: 3, ww: .34, wh: .42, siding: true },
                 plain: { bg: '#b9b6ae', win: '#5a6168', cols: 2, rows: 4, ww: .2, wh: .25 } }[kind];
  x.fillStyle = spec.bg; x.fillRect(0, 0, W, H);
  if (spec.brick) { for (let y = 0; y < H; y += 6) for (let i = 0; i < W; i += 14) { x.fillStyle = `rgba(${90 + r() * 50},${40 + r() * 20},${30 + r() * 15},.35)`; x.fillRect(i + (y / 6 % 2) * 7, y, 13, 5); } }
  if (spec.siding) { x.strokeStyle = 'rgba(0,0,0,.08)'; for (let y = 0; y < H; y += 8) { x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); } }
  if (spec.mull) { x.fillStyle = spec.mull; for (let i = 0; i <= spec.cols; i++) x.fillRect(i * W / spec.cols - 1.5, 0, 3, H); for (let j = 0; j <= spec.rows; j++) x.fillRect(0, j * H / spec.rows - 2, W, 4); }
  const cw = W / spec.cols, ch = H / spec.rows;
  for (let j = 0; j < spec.rows; j++) for (let i = 0; i < spec.cols; i++) {
    const w = cw * spec.ww, h = ch * spec.wh, px = i * cw + (cw - w) / 2, py = j * ch + (ch - h) * .55;
    const g = x.createLinearGradient(px, py, px + w, py + h); g.addColorStop(0, spec.win); g.addColorStop(1, '#8fb0c8'); x.fillStyle = g;
    if (spec.arch && j === spec.rows - 1) { x.beginPath(); x.moveTo(px, py + h); x.lineTo(px, py + w / 2); x.arc(px + w / 2, py + w / 2, w / 2, Math.PI, 0); x.lineTo(px + w, py + h); x.fill(); } else x.fillRect(px, py, w, h);
    if (r() < .32) { e.fillStyle = `rgba(255,${215 + r() * 30},${160 + r() * 60},${.55 + r() * .4})`; e.fillRect(px, py, w, h); }
  }
  const t = (c, srgb) => { const tx = new THREE.CanvasTexture(c); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.anisotropy = 4; if (srgb) tx.colorSpace = THREE.SRGBColorSpace; return tx; };
  return { map: t(cm, true), emi: t(ce, true), tile: { tower: [24, 28], office: [16, 14], brick: [14, 14], stone: [14, 16], house: [9, 9], plain: [12, 14] }[kind] };
}

/* ---------------- building styling ---------------- */
const STONEY = new Set(['university', 'college', 'school', 'church', 'cathedral', 'civic', 'government', 'public', 'museum', 'library']);
const PLAIN = new Set(['garage', 'garages', 'parking', 'industrial', 'warehouse', 'shed', 'roof', 'service', 'transformer_tower', 'stadium', 'grandstand']);
const HOUSE = new Set(['house', 'detached', 'semidetached_house', 'terrace', 'bungalow']);
export function styleOf(b, seed) {
  const k = b.k || 'yes', h = b.h;
  if (PLAIN.has(k)) return 'plain';
  if (HOUSE.has(k) && h < 14) return 'house';
  if (STONEY.has(k)) return h > 75 ? 'tower' : seed < .45 ? 'stone' : 'brick';
  if (h >= 48) return 'tower';
  if (k === 'apartments' || k === 'residential') return h > 30 ? 'office' : 'brick';
  if (k === 'office' || k === 'commercial' || k === 'hotel') return h > 20 ? 'office' : seed < .5 ? 'brick' : 'office';
  return h > 22 ? 'office' : seed < .55 ? 'brick' : 'office';
}
const TINT = { tower: ['#cfe0ee', '#b8cde0', '#dde7ef', '#a9c3d8'], office: ['#efe9dd', '#e2dccf', '#d6d4cd', '#f3eee4'], brick: ['#ffffff', '#f1d9cc', '#e5c2b2', '#d9b6a6'],
  stone: ['#fffaf0', '#f2ead8', '#e8dfca'], house: ['#ffffff', '#e7eef3', '#f4e9d8', '#e4ecdf'], plain: ['#f0f0f0', '#dcdcdc', '#e6e2da'] };
function cssColour(s) { try { return new Col(s); } catch (e) { return null; } }

/**
 * Build a city from a decoded region.
 * opts.skip(b)                   → true to leave a building out (a world draws its own landmark there)
 * opts.roof(b, i)                → 'green' | 'solar' | 'white' | null   (roof treatment, e.g. for a 2050 scenario)
 * opts.road(r)                   → colour string override for a road (e.g. transit lanes), or null
 * opts.trees: { parks: m²/tree, woods: m²/tree, max }          procedural trees in green areas (plus OSM tree nodes)
 * opts.treeShades: [colours]     canopy colours to pick from (e.g. autumn)
 * opts.extent: [x0, z0, x1, z1]  limit what is built (metres)
 * Returns { group, colliders, landmarks, find(name), roads(name), treePoints, stats }
 */
export function buildCity(ctx, data, opts = {}) {
  const group = new THREE.Group(); group.name = `gis-${data.region}`;
  const A = new Acc(), r = rng(opts.seed ?? 7), colliders = [];
  const ext = opts.extent; const inExt = (x, z) => !ext || (x >= ext[0] && x <= ext[2] && z >= ext[1] && z <= ext[3]);

  /* ground */
  { const [s, w, n, e] = data.bbox, kx = 111320 * Math.cos(data.origin.lat * Math.PI / 180), kz = 110574;
    const x0 = (w - data.origin.lon) * kx, x1 = (e - data.origin.lon) * kx, z0 = -(n - data.origin.lat) * kz, z1 = -(s - data.origin.lat) * kz;
    const g = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000).rotateX(-Math.PI / 2), ctx.mat(opts.groundColor || '#8a9478', { roughness: 1, envMapIntensity: .15 }));
    g.position.y = -.06; group.add(g);
    A.poly('plaza', [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], null, -.02, new Col(opts.landColor || '#a7a99c'), 10); }

  /* green, parking, water */
  const GREEN_COL = { park: '#6fa652', garden: '#78ad57', pitch: '#5e9e4a', playground: '#86b062', golf_course: '#79b25a', grass: '#79ad5a', recreation_ground: '#73a957',
    meadow: '#8db462', cemetery: '#6e9a55', forest: '#4b8340', wood: '#4b8340', scrub: '#6c9550', grassland: '#8ab563', track: '#b5664c', stadium: '#5e9e4a' };
  for (const f of data.green) { if (!inExt(...f.pts[0])) continue; A.poly('ground', f.pts, f.holeP, f.k === 'track' ? .09 : .05, new Col(GREEN_COL[f.k] || '#6fa652'), 6); }
  for (const f of data.parking) A.poly('ground', f.pts, null, .06, new Col('#8f9296'), 6);
  for (const f of data.water) A.poly('water', f.pts, f.holeP, .22, new Col('#ffffff'), 30);
  for (const f of data.rivers) { if (f.c === 'river' && data.water.length) continue; ribbon(A, 'water', f.pts, f.c === 'river' ? 30 : 6, .21, new Col('#ffffff')); }

  /* roads and rail */
  const ROAD_COL = { footway: '#c9c2b2', path: '#b9b19a', pedestrian: '#cfc8b8', steps: '#c9c2b2', cycleway: '#b87a5e', service: '#4c5056' };
  const roadLines = [];
  const order = ['service', 'footway', 'path', 'cycleway', 'pedestrian', 'steps'];
  const sorted = [...data.roads].sort((a, b) => (order.includes(b.c) ? 1 : 0) - (order.includes(a.c) ? 1 : 0));
  for (const rd of sorted) { if (!rd.pts.some(p => inExt(...p))) continue;
    const foot = ['footway', 'path', 'pedestrian', 'steps', 'cycleway'].includes(rd.c);
    const col = new Col(opts.road?.(rd) || ROAD_COL[rd.c] || '#3d4147');
    const y = foot ? .1 : rd.c === 'service' ? .12 : .14;
    const lift = rd.b ? Math.max(1, rd.b) * 5.5 : 0;
    ribbon(A, foot ? 'path' : 'street', rd.pts, rd.w, y, col, lift);
    if (lift) bridgeSides(A, rd.pts, rd.w, lift, new Col('#d6d2c8'));
    if (!foot && ['primary', 'secondary', 'trunk', 'tertiary'].includes(rd.c) && rd.w > 10 && !rd.o) ribbon(A, 'paint', rd.pts, .3, y + .02, new Col('#e8c95a'), lift);
    roadLines.push(rd); }
  for (const rl of data.rail) ribbon(A, 'rail', rl.pts, 3.2, .16, new Col('#6b625a'), rl.b ? 6 : 0);

  /* buildings */
  const tex = {}; const STY = ['tower', 'office', 'brick', 'stone', 'house', 'plain'];
  STY.forEach((s, i) => tex[s] = facade(s, 11 + i));
  const roofCol = { null: new Col('#8b8d90'), green: new Col('#5f9a48'), white: new Col('#e8ebee') };
  let n = 0, nEst = 0;
  for (const b of data.buildings) {
    const ring0 = b.pts; if (ring0.length < 3) continue; const [cx, cz] = ring0[0]; if (!inExt(cx, cz)) continue;
    if (opts.skip?.(b)) continue;
    const ring = signedArea(ring0) > 0 ? ring0 : [...ring0].reverse();
    const seed = ((Math.abs(b.p[0] * 31 + b.p[1] * 17) % 997) / 997);
    const sty = styleOf(b, seed), T = tex[sty], [tw, th] = T.tile;
    const y0 = b.m || 0, y1 = Math.max(y0 + 2.5, b.h);
    const tint = (b.c && cssColour(b.c)) || new Col(TINT[sty][Math.floor(seed * TINT[sty].length)]);
    const walls = (rg, sign) => { let u = 0; for (let i = 0; i < rg.length; i++) { const a = rg[i], c = rg[(i + 1) % rg.length]; const dx = c[0] - a[0], dz = c[1] - a[1], L = Math.hypot(dx, dz); if (L < .05) continue;
      A.wall(sty, a, c, y0, y1, [sign * dz / L, 0, -sign * dx / L], u, u + L, tw, th, tint); u += L; } };
    walls(ring, 1);
    for (const h of b.holeP || []) walls(signedArea(h) < 0 ? h : [...h].reverse(), 1);
    const rk = opts.roof?.(b, n) ?? null;
    A.poly(rk === 'solar' ? 'solar' : 'roof', ring, b.holeP, y1, rk === 'solar' ? new Col('#ffffff') : roofCol[rk] || roofCol.null, rk === 'solar' ? 3 : 8);
    if (y1 >= 10 && !b.part) { const [x0, z0, x1, z1] = bbox(ring); colliders.push([x0, y0, z0, x1, y1, z1, b.n || `building ${n}`]); }
    n++; if (b.e) nEst++;
  }

  /* materials and meshes */
  const facadeMat = s => ctx.mat('#ffffff', { map: tex[s].map, emissiveMap: tex[s].emi, emissive: '#ffffff', emissiveIntensity: .32, roughness: s === 'tower' ? .3 : .8, metalness: s === 'tower' ? .3 : 0, envMapIntensity: s === 'tower' ? 1.1 : .35, vertexColors: true });
  const mats = { plaza: ctx.mat('#ffffff', { vertexColors: true, roughness: 1, envMapIntensity: .15 }), ground: ctx.mat('#ffffff', { vertexColors: true, roughness: .97, envMapIntensity: .2 }),
    street: ctx.mat('#ffffff', { vertexColors: true, roughness: .9, envMapIntensity: .2 }), path: ctx.mat('#ffffff', { vertexColors: true, roughness: .95, envMapIntensity: .2 }),
    paint: ctx.mat('#ffffff', { vertexColors: true, roughness: .7, envMapIntensity: .2 }), rail: ctx.mat('#ffffff', { vertexColors: true, roughness: .6, metalness: .4 }),
    bridge: ctx.mat('#ffffff', { vertexColors: true, roughness: .8, envMapIntensity: .3 }),
    water: ctx.mat('#3d7fa3', { roughness: .08, metalness: .3, envMapIntensity: 1.4, emissive: '#0d3048', emissiveIntensity: .35, vertexColors: true }),
    roof: ctx.mat('#ffffff', { vertexColors: true, roughness: .9, envMapIntensity: .25 }),
    solar: ctx.mat('#ffffff', { map: solarMap(), roughness: .25, metalness: .6, envMapIntensity: 1.2, emissive: '#0a1a40', emissiveIntensity: .35, vertexColors: true }) };
  for (const s of STY) mats[s] = facadeMat(s);
  const meshes = A.build(mats, group);

  /* trees: OSM trees + procedural fill in green areas */
  const treePts = data.treePts.filter(p => inExt(...p)).map(([x, z]) => [x, z, .8 + r() * .5]);
  if (opts.trees) { const grid = buildingGrid(data.buildings);
    for (const f of data.green) { const per = (f.k === 'wood' || f.k === 'forest') ? opts.trees.woods ?? 90 : ['park', 'garden', 'grass', 'recreation_ground', 'cemetery'].includes(f.k) ? opts.trees.parks ?? 420 : 0;
      if (!per) continue; const [x0, z0, x1, z1] = bbox(f.pts); const area = Math.abs(signedArea(f.pts)); let k = Math.min(400, Math.round(area / per));
      for (let tries = 0; k > 0 && tries < k * 6; tries++) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0);
        if (!pointInRing(x, z, f.pts) || grid.hit(x, z) || !inExt(x, z)) continue; treePts.push([x, z, .8 + r() * .6]); k--; } } }
  if (opts.extraTrees) treePts.push(...opts.extraTrees);
  const maxT = opts.trees?.max ?? 6000; if (treePts.length > maxT) treePts.length = maxT;
  if (treePts.length) group.add(treeMesh(ctx, treePts, r, opts.treeShades));

  /* lookups */
  const L = data.landmarks || {};
  const find = name => { const q = name.toLowerCase(); const k = Object.keys(L).find(k => k.toLowerCase() === q) || Object.keys(L).find(k => k.toLowerCase().includes(q)); return k ? { name: k, ...L[k] } : null; };
  const roads = name => { const q = name.toLowerCase(); return roadLines.filter(rd => (rd.n || '').toLowerCase().includes(q)).map(rd => rd.pts); };
  return { group, meshes, mats, colliders, find, roads, landmarks: L, treePoints: treePts, stats: { buildings: n, estimatedHeights: nEst, trees: treePts.length, roads: roadLines.length } };
}

/* ---------------- pieces ---------------- */
function ribbon(A, key, pts, w, y, col, lift = 0) {
  if (pts.length < 2) return; const hw = w / 2; const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  let s = 0; const ramp = Math.min(18, tot / 3);
  for (let i = 0; i < pts.length; i++) {
    if (i) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    let m = 1; if (i > 0 && i < pts.length - 1) { const d1x = pts[i][0] - a[0], d1z = pts[i][1] - a[1], l1 = Math.hypot(d1x, d1z) || 1; m = clamp(1 / Math.max(.4, (d1x / l1) * dx + (d1z / l1) * dz), 1, 2.2); }
    const yy = y + (lift ? lift * clamp(Math.min(s, tot - s) / ramp, 0, 1) : 0);
    L.push([[pts[i][0] - dz * hw * m, yy, pts[i][1] + dx * hw * m], [pts[i][0] + dz * hw * m, yy, pts[i][1] - dx * hw * m], s]);
  }
  for (let i = 1; i < L.length; i++) { const [a, b, s0] = L[i - 1], [c, d, s1] = L[i];
    const t = (p, q, r2) => { const ux = q[0] - p[0], uz = q[2] - p[2], vx = r2[0] - p[0], vz = r2[2] - p[2]; return uz * vx - ux * vz > 0 ? [p, q, r2] : [p, r2, q]; };
    const uv = p => [p[0] / 8, p[2] / 8];
    for (const tri of [t(a, b, c), t(b, d, c)]) A.tri(key, ...tri, [0, 1, 0], ...tri.map(uv), col); }
}
function bridgeSides(A, pts, w, lift, col) {
  // a simple deck edge (fascia) under the lifted part of the road
  const hw = w / 2 + .3; let tot = 0; for (let i = 1; i < pts.length; i++) tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const ramp = Math.min(18, tot / 3); let s = 0;
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < .1) continue;
    const s0 = s, s1 = s + L; s = s1; const ya = lift * clamp(Math.min(s0, tot - s0) / ramp, 0, 1), yb = lift * clamp(Math.min(s1, tot - s1) / ramp, 0, 1);
    if (ya < .5 && yb < .5) continue; const dx = (b[0] - a[0]) / L, dz = (b[1] - a[1]) / L;
    for (const sd of [-1, 1]) { const o = [-dz * hw * sd, dx * hw * sd]; const p = [a[0] + o[0], a[1] + o[1]], q = [b[0] + o[0], b[1] + o[1]]; const n = [-dz * sd, 0, dx * sd];
      const yt = Math.min(ya, yb) + .9; A.wall('bridge', sd > 0 ? q : p, sd > 0 ? p : q, Math.max(0, Math.min(ya, yb) - 1.4), yt, n, 0, L, 8, 8, col); } }
}
function buildingGrid(blds) {
  const C = 40, g = new Map(); const key = (i, j) => i * 100003 + j;
  for (const b of blds) { const [x0, z0, x1, z1] = bbox(b.pts); for (let i = Math.floor(x0 / C); i <= Math.floor(x1 / C); i++) for (let j = Math.floor(z0 / C); j <= Math.floor(z1 / C); j++) { const k = key(i, j); if (!g.has(k)) g.set(k, []); g.get(k).push(b.pts); } }
  return { hit(x, z) { const l = g.get(key(Math.floor(x / C), Math.floor(z / C))); if (!l) return false; for (const r of l) { if (pointInRing(x, z, r)) return true; } return false; } };
}
function treeMesh(ctx, pts, r, shadesIn) {
  const g = new THREE.BufferGeometry(), parts = [new THREE.CylinderGeometry(.3, .45, 3.4, 6).translate(0, 1.7, 0), new THREE.IcosahedronGeometry(2.8, 0).scale(1, 1.15, 1).translate(0, 5.2, 0), new THREE.IcosahedronGeometry(2, 0).translate(.5, 7.3, .3)];
  const cols = ['#6a4a2e', '#ffffff', '#ffffff']; const P = [], N = [], Cc = [];
  parts.forEach((p, k) => { const q = p.index ? p.toNonIndexed() : p; q.computeVertexNormals(); P.push(...q.attributes.position.array); N.push(...q.attributes.normal.array); const c = new Col(cols[k]); for (let i = 0; i < q.attributes.position.count; i++) Cc.push(c.r, c.g, c.b); });
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(Cc, 3));
  const m = new THREE.InstancedMesh(g, ctx.mat('#ffffff', { vertexColors: true, roughness: .85, flatShading: true, envMapIntensity: .35 }), pts.length);
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new Col(), shades = shadesIn || ['#3f8a3e', '#4f9a3a', '#6aa845', '#2f7438'];
  pts.forEach(([x, z, s], i) => { m.setMatrixAt(i, M.compose(new V3(x, 0, z), q.setFromEuler(e.set(0, r() * 6.28, 0)), new V3(s, s * (.9 + r() * .3), s))); m.setColorAt(i, c.set(shades[Math.floor(r() * shades.length)])); });
  m.frustumCulled = false; return m;
}
function solarMap() { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#16305e'; x.fillRect(0, 0, 64, 64); x.strokeStyle = '#7fa6d8'; x.lineWidth = 1.5;
  for (let i = 0; i <= 64; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 64); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(64, i); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; }

/* ---------------- things that move along real streets and paths ---------------- */
/** a polyline you can sample by distance: at(d) → {x, z, yaw}; loops back to the start when d passes the end */
export class Route {
  constructor(pts) { this.p = pts; this.c = [0]; for (let i = 1; i < pts.length; i++) this.c.push(this.c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); this.len = this.c[this.c.length - 1] || 1; }
  at(d, out = {}) { d = ((d % this.len) + this.len) % this.len; let lo = 0, hi = this.c.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (this.c[m] <= d) lo = m; else hi = m; }
    const a = this.p[lo], b = this.p[hi], k = (d - this.c[lo]) / ((this.c[hi] - this.c[lo]) || 1); out.x = a[0] + (b[0] - a[0]) * k; out.z = a[1] + (b[1] - a[1]) * k; out.yaw = Math.atan2(-(b[0] - a[0]), -(b[1] - a[1])); return out; }
  /** a route that runs out along the line and back, so vehicles don't jump from the end to the start */
  static outAndBack(pts, side = 0) { const off = (p, q) => side ? offsetLine(p, side) : p; return new Route([...off(pts), ...off([...pts].reverse()).slice(1)]); }
}
function offsetLine(pts, o) { return pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [p[0] - dz / l * o, p[1] + dx / l * o]; }); }

/** instanced vehicles that drive along routes: lanes = [{ route, n, speed, y, colors, scale }] */
export class PathMovers {
  constructor(geo, mat, lanes, seed = 9) { const r = rng(seed); this.items = [];
    for (const L of lanes) for (let i = 0; i < (L.n ?? 2); i++) this.items.push({ L, off: (i + r() * .5) / (L.n ?? 2) * L.route.len, sp: (L.speed ?? 10) * (.85 + r() * .3), s: L.scale ?? 1, col: L.colors?.[Math.floor(r() * L.colors.length)] });
    this.mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, this.items.length)); this.mesh.frustumCulled = false; this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const c = new Col(); this.items.forEach((it, i) => { if (it.col) this.mesh.setColorAt(i, c.set(it.col)); }); this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._e = new THREE.Euler(); this._p = new V3(); this._s = new V3(); this._o = {}; }
  update(t) { this.items.forEach((it, i) => { const o = it.L.route.at(it.off + it.sp * t, this._o); this._p.set(o.x, it.L.y ?? .2, o.z);
      this._m.compose(this._p, this._q.setFromEuler(this._e.set(0, o.yaw, 0)), this._s.setScalar(it.s)); this.mesh.setMatrixAt(i, this._m); }); this.mesh.instanceMatrix.needsUpdate = true; }
}

/** people walking along routes, using the shared People mesh (lib.js): lanes = [{ route, n, speed }] */
export class Walkers {
  constructor(people, lanes, seed = 4, colors = ['#bb0000', '#666666', '#2f5d8a', '#e0e0e0', '#3d6b3d', '#c98b2a', '#7a4fa0', '#202020']) { const r = rng(seed); this.p = people; this.items = []; let i = 0;
    for (const L of lanes) for (let k = 0; k < (L.n ?? 3) && i < people.n; k++, i++) { const it = { L, i, off: r() * L.route.len, sp: (L.speed ?? 1.35) * (.8 + r() * .4) * (r() < .5 ? -1 : 1), ph: r() * 6.28, side: (r() - .5) * 1.6 }; this.items.push(it); people.color(i, colors[Math.floor(r() * colors.length)]); }
    this._o = {}; }
  update(t) { for (const it of this.items) { const o = it.L.route.at(it.off + it.sp * t, this._o); const yaw = o.yaw + (it.sp < 0 ? Math.PI : 0);
      this.p.place(it.i, o.x + Math.cos(o.yaw) * it.side, it.L.y ?? .1, o.z - Math.sin(o.yaw) * it.side, yaw, 1, it.ph); } this.p.commit(t); }
}
