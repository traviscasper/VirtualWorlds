/* WORLD · COLUMBUS 2050 ON REAL GEOGRAPHY — an artistic future scenario for downtown Columbus, Ohio, built on
   OpenStreetMap data (data/gis/columbus-downtown.json, made by tools/gis/osm_world.py). NOT an official plan.

   Real today (from the map): the street network, building footprints and heights, the Scioto River, parks, bridges.
   Hand-modelled real landmarks: the LeVeque Tower and the Ohio Statehouse.
   Imagined for 2050: green and solar roofs, transit lanes on Broad and High, protected bike lanes, street trees,
   a riverbank forest, a rooftop vertiport, mass-timber towers and a solar microgrid on today's surface parking lots,
   a green footbridge, autonomous shuttles and air taxis.

   Origin (0,0) is High St & Broad St; metres; x = east, z = south, y = up.
   Map data (c) OpenStreetMap contributors, ODbL 1.0.

   It keeps the pilot world's anchors and story beats (river 4 s, vertiport 8.5, green bridge 12.5, LeVeque 16,
   Scioto Mile 20.5, Broad St 26.5, Statehouse 30, rooftops 34, clouds 41.5), so the journeys and hotspots carry over. */
import * as THREE from 'three';
import { V3, Col, lerp, clamp, rng, FlightPath, Builder, boxGeo, cylGeo, People } from '../../sci-fi-360/js/lib.js';
import { loadRegion, buildCity, Route, PathMovers, Walkers, chain, lineMesh, samples, footprint, ringBox, pointInRing } from '../js/gis.js';

const DATA = await loadRegion('columbus-downtown');

const FALLBACK = { leveque: [39.96173, -83.00069], statehouse: [39.96119, -82.99900], cosi: [39.95957, -83.00731], bicentennial: [39.95905, -83.00385],
  northbank: [39.96640, -83.00760], arena: [39.96930, -83.00610], commons: [39.95790, -82.99980] };
const NAMES = { leveque: ['LeVeque Tower', 'LeVeque'], statehouse: ['Ohio Statehouse', 'Statehouse'], cosi: ['COSI', 'Center of Science and Industry'],
  bicentennial: ['Bicentennial Park', 'Scioto Mile'], northbank: ['North Bank Park'], arena: ['Nationwide Arena'], commons: ['Columbus Commons'] };

export function buildColumbus2050GIS(ctx) {
  const group = new THREE.Group(); group.name = 'columbus-2050';
  const o = DATA.origin, kx = 111320 * Math.cos(o.lat * Math.PI / 180), kz = 110574;
  const fromLL = ([la, lo]) => ({ x: (lo - o.lon) * kx, z: -(la - o.lat) * kz, h: 0, r: 30 });
  const R = rng(2050);
  const hashB = b => (Math.abs(b.p[0] * 31 + b.p[1] * 17 + b.p.length * 7) % 1000) / 1000;

  /* ---------------- the river and the main streets, from the map ---------------- */
  // the Scioto's line, clipped to downtown (OSM's river way runs far beyond the map area), ordered upstream → downstream
  const sciotoAll = chain(DATA.rivers.filter(r => /scioto/i.test(r.n)).map(r => r.pts))[0] || [[-1100, -230], [-430, 0], [-300, 400], [-600, 800]];
  const riverLine = (() => { const inside = sciotoAll.filter(([x, z]) => x > -1300 && x < 400 && z > -1300 && z < 1300); const L = inside.length > 3 ? inside : sciotoAll;
    return L[0][0] < L[L.length - 1][0] && L[0][1] > L[L.length - 1][1] ? [...L].reverse() : L; })();   // starts in the north-west
  const riverRoute = new Route(riverLine);
  const nearestRiver = (x, z) => { let best = null, bd = 1e18; for (let i = 1; i < riverLine.length; i++) { const a = riverLine[i - 1], b = riverLine[i], ux = b[0] - a[0], uz = b[1] - a[1], L2 = ux * ux + uz * uz || 1;
      const k = clamp(((x - a[0]) * ux + (z - a[1]) * uz) / L2, 0, 1), px = a[0] + ux * k, pz = a[1] + uz * k, d = (px - x) ** 2 + (pz - z) ** 2; if (d < bd) { bd = d; const l = Math.sqrt(L2); best = { x: px, z: pz, d: Math.sqrt(d), nx: -uz / l, nz: ux / l }; } } return best; };
  const riverAtD = d => riverRoute.at(d, {});                       // point on the river d metres from its upstream end in the map area
  const riverDist = (x, z) => nearestRiver(x, z).d;
  const roadLines = re => chain(DATA.roads.filter(r => re.test(r.n || '') && !['footway', 'path', 'cycleway', 'service'].includes(r.c)).map(r => r.pts));
  const broad = roadLines(/\bBroad Street\b/i), high = roadLines(/\bHigh Street\b/i);
  const major = DATA.roads.filter(r => ['primary', 'secondary', 'tertiary', 'trunk'].includes(r.c) && !r.b);

  /* ---------------- landmarks we draw ourselves ---------------- */
  const LQf = footprint(DATA, /leveque/i), SHf = footprint(DATA, /ohio statehouse|^statehouse/i);

  /* ---------------- 2050 sites on today's surface parking lots ---------------- */
  const area = r => { let s = 0; for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s / 2); };
  const lots = DATA.parking.map(f => { const [x0, z0, x1, z1] = ringBox(f.pts); return { f, x0, z0, x1, z1, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0, a: area(f.pts) }; })
    .filter(l => l.a > 1800 && Math.min(l.w, l.d) > 34 && Math.abs(l.cx) < 950 && Math.abs(l.cz) < 900 && riverDist(l.cx, l.cz) > 110).sort((a, b) => b.a - a.a);
  const timberLots = lots.slice(0, 5), solarLot = lots[5] || null;

  /* ---------------- the city ---------------- */
  const city = buildCity(ctx, DATA, { seed: 50, trees: { parks: 260, woods: 70, max: 9000 },
    skip: b => (LQf && b === LQf.b) || (SHf && b === SHf.b),
    roof: (b) => { if (b.part || b.h > 120) return null; const s = hashB(b); if (b.h >= 48) return s < .3 ? 'solar' : null; return s < .45 ? 'green' : s < .7 ? 'solar' : s < .78 ? 'white' : null; },
    extraTrees: streetAndRiverTrees() });
  group.add(city.group);
  const colliders = city.colliders;
  const P = {}; for (const k in FALLBACK) { let f = null; for (const nm of NAMES[k]) { f = city.find(nm); if (f) break; } P[k] = f || fromLL(FALLBACK[k]); }
  if (LQf) P.leveque = { x: LQf.cx, z: LQf.cz, h: 169, r: Math.max(LQf.w, LQf.d) / 2 }; if (SHf) P.statehouse = { x: SHf.cx, z: SHf.cz, h: 48, r: 40, w: SHf.w, d: SHf.d };

  function streetAndRiverTrees() {
    const out = []; const water = DATA.water.map(w => w.pts);
    const inWater = (x, z) => water.some(r => pointInRing(x, z, r));
    const occupied = (x, z) => DATA.buildings.some(b => Math.abs(b.pts[0][0] - x) < 120 && Math.abs(b.pts[0][1] - z) < 120 && pointInRing(x, z, b.pts));
    for (const r of major) for (const sd of [-1, 1]) for (const [x, z] of samples(r.pts, 15, sd * (r.w / 2 + 2.5))) { if (R() < .2 || occupied(x, z)) continue; out.push([x, z, .75 + R() * .3]); }
    // riverbank forest: step along the real river line, walk out to the water's edge on each side, plant a band beyond it
    for (let d = 0; d < riverRoute.len; d += 7) { const c = riverAtD(d), n = nearestRiver(c.x, c.z);
      for (const sd of [-1, 1]) { if (R() < .3) continue; let e = 20; while (e < 260 && inWater(c.x + n.nx * sd * e, c.z + n.nz * sd * e)) e += 6;
        const o = e + 4 + R() * 40, x = c.x + n.nx * sd * o, z = c.z + n.nz * sd * o; if (inWater(x, z) || occupied(x, z)) continue; out.push([x, z, .85 + R() * .6]); } }
    return out;
  }

  const B = new Builder();
  const tex = makeTextures();
  const M = { stone: ctx.mat('#ffffff', { vertexColors: true, roughness: .8, envMapIntensity: .35 }), dark: ctx.mat('#2a3340', { roughness: .45, metalness: .6, envMapIntensity: .8 }),
    white: ctx.mat('#ffffff', { roughness: .35, metalness: .15, envMapIntensity: .9, vertexColors: true }), grass: ctx.mat('#ffffff', { roughness: .95, vertexColors: true, envMapIntensity: .25 }),
    leveque: ctx.mat('#ffffff', { map: tex.deco.map, emissiveMap: tex.deco.emi, emissive: '#ffffff', emissiveIntensity: .25, roughness: .7, vertexColors: true }),
    timber: ctx.mat('#ffffff', { map: tex.timber.map, emissiveMap: tex.timber.emi, emissive: '#ffffff', emissiveIntensity: .3, roughness: .7, vertexColors: true }),
    solar: city.mats.solar, water: city.mats.water,
    glowG: new THREE.MeshBasicMaterial({ color: new Col('#7dffb0').multiplyScalar(1.6) }), glowB: new THREE.MeshBasicMaterial({ color: new Col('#8fe4ff').multiplyScalar(1.8) }),
    glowW: new THREE.MeshBasicMaterial({ color: new Col('#fff1d0').multiplyScalar(1.6) }) };
  const addBox = (key, w, h, d, x, y, z, ry, color, label) => { B.add(key, boxGeo(w, h, d, 6, 8), [x, y, z], [0, ry || 0, 0], null, color); if (label) colliders.push([x - w / 2, y, z - d / 2, x + w / 2, y + h, z + d / 2, label]); };
  const treeList = [];

  /* LeVeque Tower (1927, 169 m) — stepped Art Deco tower */
  { const L = P.leveque, s = LQf ? clamp(Math.min(LQf.w, LQf.d) / 34, .7, 1.3) : 1; const tiers = [[34, 72], [28, 48], [22, 24], [16, 12]]; let y = 0;
    for (const [w, h] of tiers) { addBox('leveque', w * s, h, w * s, L.x, y, L.z, 0, '#efe6d2', 'LeVeque Tower');
      for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) { const a = (i - 1.5) / 4 * w * s; B.add('leveque', boxGeo(1.1, h, 1.1), [L.x + a, y, L.z + sd * (w * s / 2 + .4)], null, null, '#f6eedb'); B.add('leveque', boxGeo(1.1, h, 1.1), [L.x + sd * (w * s / 2 + .4), y, L.z + a], null, null, '#f6eedb'); }
      y += h; }
    B.add('leveque', cylGeo(6, 8, 9, 8), [L.x, y, L.z], null, null, '#efe6d2'); B.add('leveque', new THREE.ConeGeometry(4, 4, 8).translate(0, 2, 0), [L.x, y + 9, L.z], null, null, '#efe6d2');
    B.add('glowW', new THREE.SphereGeometry(1.4, 10, 8), [L.x, y + 14, L.z]); colliders.push([L.x - 6, y, L.z - 6, L.x + 6, y + 15, L.z + 6, 'LeVeque spire']); P.leveque.top = y + 14; }

  /* Ohio Statehouse (completed 1861) — Greek Revival, drum and flat cupola, on Capitol Square */
  { const S = P.statehouse, W = SHf ? SHf.w * .92 : 56, D = SHf ? SHf.d * .92 : 90;
    addBox('stone', W, 17, D, S.x, 0, S.z, 0, '#e2dccd', 'Ohio Statehouse');
    for (let i = 0; i < 8; i++) B.add('stone', cylGeo(1.1, 1.2, 13, 12), [S.x - W / 2 + 6 + i * (W - 12) / 7, 0, S.z - D / 2 - 2], null, null, '#f0ebdf');
    addBox('stone', W - 8, 3, 4, S.x, 13, S.z - D / 2 - 2, 0, '#e8e2d4');
    B.add('stone', cylGeo(10, 10, 24, 32), [S.x, 17, S.z], null, null, '#e8e2d4'); B.add('stone', cylGeo(11.2, 11.2, 2, 32), [S.x, 41, S.z], null, null, '#f0ebdf');
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; B.add('dark', boxGeo(1.6, 9, .6), [S.x + Math.cos(a) * 10.05, 27, S.z + Math.sin(a) * 10.05], [0, -a + Math.PI / 2, 0]); }
    colliders.push([S.x - 11, 17, S.z - 11, S.x + 11, 43, S.z + 11, 'Statehouse cupola']); }

  /* ---------------- flight path (world time) ---------------- */
  // river leg: follow the Scioto's real course from the north-west to the Broad Street bridge; then east along Broad
  // Street; then climb out east of downtown through the clouds
  const broadLine = broad[0] || [[-900, 0], [900, 0]];
  const broadAt = x => { let best = broadLine[0]; for (const p of broadLine) if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p; return best[1]; };
  const crossD = (() => { let best = 0, bd = 1e9; for (let d = 0; d < riverRoute.len; d += 5) { const p = riverAtD(d), e = Math.abs(p.z - broadAt(p.x)); if (e < bd) { bd = e; best = d; } } return best; })();
  const xr0 = riverAtD(crossD).x;
  const keys = [];
  const startD = Math.max(0, crossD - 820);
  for (const [t, f, y] of [[-3, -.16, 74], [0, 0, 66], [5.5, .36, 56], [11, .7, 50], [15.5, .97, 50]]) { const p = riverAtD(startD + f * (crossD - startD)); keys.push([t, p.x, y, p.z]); }
  const bx = [[19, xr0 + 60, 54], [22.5, xr0 + 180, 58], [26.5, lerp(xr0, 0, .62), 60], [30, -10, 62], [34, 230, 66]];
  for (const [t, x, y] of bx) keys.push([t, x, y, broadAt(x)]);
  keys.push([38, 430, 160, broadAt(430) - 120], [41.5, 560, 470, broadAt(560) - 260], [45, 660, 760, broadAt(660) - 380]);
  // keep clear of real buildings: sample the flight and lift nearby keys wherever the path passes over or within
  // 14 m of a building below its top + 22 m (most heights are estimates, so this errs on the safe side)
  let path = new FlightPath(keys); const lifts = new Set();
  for (let pass = 0; pass < 10; pass++) { let lifted = false; const q = new V3();
    for (let t = keys[0][0]; t <= 40; t += .2) { path.pos(t, q);
      for (const c of colliders) { const dx = Math.max(c[0] - q.x, 0, q.x - c[3]), dz = Math.max(c[2] - q.z, 0, q.z - c[5]); if (Math.hypot(dx, dz) > 14 || q.y > c[4] + 22) continue;
        lifts.add(c[6]); for (const k of keys) if (Math.abs(k[0] - t) < 3.6 && k[0] <= 40) { k[2] = Math.max(k[2] + 6, c[4] + 26); lifted = true; } } }
    if (!lifted) break; path = new FlightPath(keys); }
  if (lifts.size) console.info('[columbus-2050] flight lifted to clear:', [...lifts].join(', '));
  const at = t => path.pos(t, new V3());

  /* ---------------- 2050: green footbridge across the Scioto, where the ship passes at 12.5 s ---------------- */
  const GB = (() => { const p = at(12.5), n = nearestRiver(p.x, p.z); const c = { x: n.x + n.nz * 70, z: n.z - n.nx * 70 }, m = nearestRiver(c.x, c.z);   // 70 m downstream, just ahead of the ship
    const ang = Math.atan2(-m.nz, m.nx), L = 170, w = 24, cx = m.x, cz = m.z;     // the deck runs along the river's normal
    const put = (key, ww, h, dd, y, col, ox = 0, oz = 0) => B.add(key, boxGeo(ww, h, dd, 6, 8), [cx + Math.cos(ang) * ox + Math.sin(ang) * oz, y, cz - Math.sin(ang) * ox + Math.cos(ang) * oz], [0, ang, 0], null, col);
    put('stone', L, 2.2, w, 6, '#d9d4c8'); put('grass', L - 4, .5, w - 6, 8.2, '#5e9a45');
    for (const sd of [-1, 1]) put('white', L, 1.1, .4, 8.6, '#eef2f5', 0, sd * (w / 2 - .2));
    for (const ox of [-55, 0, 55]) B.add('stone', cylGeo(1.8, 2, 6, 10), [cx + Math.cos(ang) * ox, 0, cz - Math.sin(ang) * ox], null, null, '#cfc8ba');
    for (let i = -4; i <= 4; i++) { const ox = i * 17, oz = i % 2 ? 4 : -4; treeList.push([cx + Math.cos(ang) * ox + Math.sin(ang) * oz, 8.7, cz - Math.sin(ang) * ox + Math.cos(ang) * oz, .75]); }
    colliders.push([cx - 6, 6, cz - 6, cx + 6, 9, cz + 6, 'Green Bridge (2050)']);
    return new V3(cx, 9, cz); })();

  /* ---------------- 2050: rooftop vertiport on a parking garage near the river, seen at 8.5 s ---------------- */
  const VP = (() => { const p = at(11.5); let best = null, bd = 1e9;   // a garage just ahead of where ARCHIVE points it out (8 s)
    for (const b of DATA.buildings) { if (b.part) continue; const [x0, z0, x1, z1] = ringBox(b.pts), w = x1 - x0, d = z1 - z0; if (w < 35 || d < 30 || b.h > 45) continue; const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      const dist = Math.hypot(cx - p.x, cz - p.z) + (b.k === 'parking' ? -200 : 0); if (riverDist(cx, cz) < 70) continue; if (dist < bd) { bd = dist; best = { cx, cz, w, d, h: b.h }; } }
    const v = best || { cx: p.x + 220, cz: p.z, w: 60, d: 50, h: 24 }; if (!best) addBox('white', v.w, v.h, v.d, v.cx, 0, v.cz, 0, '#e6ebef', 'Mobility hub');
    const y = v.h + .2; addBox('white', Math.min(v.w, 70) - 4, .6, Math.min(v.d, 56) - 4, v.cx, y, v.cz, 0, '#e6ebef');
    for (const [dx, dz] of [[-.25, -.22], [.25, -.22], [-.25, .22], [.25, .22]]) { const px = v.cx + dx * Math.min(v.w, 70), pz = v.cz + dz * Math.min(v.d, 56);
      B.add('white', cylGeo(7.5, 7.5, .6, 32), [px, y + .6, pz], null, null, '#f4f6f8'); B.add('glowB', new THREE.TorusGeometry(6.6, .18, 6, 40).rotateX(Math.PI / 2), [px, y + 1.3, pz]); }
    return new V3(v.cx, y, v.cz); })();

  /* ---------------- 2050: mass-timber terraced towers and a solar microgrid on today's surface lots ---------------- */
  const TT = timberLots.map((l, i) => { const w = clamp(Math.min(l.w, l.d) * .62, 24, 34), h = 78 + (i * 17) % 44; let y = 0, ww = w; const step = h / 5;
    for (let k = 0; k < 5; k++) { addBox('timber', ww, step, ww, l.cx, y, l.cz, 0, '#ffffff', 'Mass-timber tower (2050)'); y += step;
      if (k < 4) { B.add('grass', boxGeo(ww, .8, ww), [l.cx, y, l.cz], null, null, '#5c9a43'); for (let j = 0; j < 6; j++) { const a = j / 6 * Math.PI * 2; treeList.push([l.cx + Math.cos(a) * (ww / 2 - 2), y + .8, l.cz + Math.sin(a) * (ww / 2 - 2), .5]); } }
      ww -= 4; }
    addBox('solar', ww + 2, .6, ww + 2, l.cx, y, l.cz, 0); return new V3(l.cx, h * .7, l.cz); });
  const MG = (() => { const l = solarLot || { cx: 420, cz: 165, w: 90, d: 80 }; const nx = Math.max(2, Math.floor((l.w - 10) / 22)), nz = Math.max(2, Math.floor((l.d - 10) / 25));
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const x = l.cx - (nx - 1) * 11 + i * 22, z = l.cz - (nz - 1) * 12.5 + j * 25; B.add('white', cylGeo(.35, .35, 6, 8), [x, 0, z], null, null, '#dfe4e8'); B.add('solar', boxGeo(18, .4, 9), [x, 6, z]); }
    const hx = l.cx, hz = l.cz + l.d / 2 + 10; addBox('white', 40, 9, 14, hx, 0, hz, 0, '#eef1f3', 'Microgrid battery hall'); for (let i = 0; i < 8; i++) B.add('glowG', boxGeo(3, .6, .3), [hx - 17 + i * 4.8, 6.5, hz + 7.1]);
    return new V3(l.cx, 7, l.cz); })();

  /* ---------------- Scioto Mile fountain (animated jets) ---------------- */
  const FT = (() => { const b = P.bicentennial, n = nearestRiver(b.x, b.z); const push = Math.max(0, 75 - n.d), sx = Math.sign((b.x - n.x) * n.nx + (b.z - n.z) * n.nz) || 1; const x = b.x + n.nx * sx * push, z = b.z + n.nz * sx * push; B.add('water', cylGeo(22, 22, .5, 48), [x, .1, z]); B.add('stone', cylGeo(23, 23, .7, 48, 8, 8, true), [x, 0, z], null, null, '#d9d2bd'); return new V3(x, 0, z); })();
  const jets = new THREE.InstancedMesh(new THREE.CylinderGeometry(.25, .5, 1, 6).translate(0, .5, 0), ctx.mat('#dff3ff', { transparent: true, opacity: .75, roughness: .1, emissive: '#7fbfe0', emissiveIntensity: .3 }), 24); jets.frustumCulled = false; group.add(jets);

  /* trees on the bridge and towers */
  if (treeList.length) { const g = treeInst(ctx, treeList); group.add(g); }
  B.build(M, group);

  /* ---------------- 2050 street layer: transit lanes on Broad and High, bike lanes everywhere ---------------- */
  const transitLines = [...broad.slice(0, 2), ...high.slice(0, 2)];
  group.add(lineMesh(ctx, transitLines, 7.5, .2, '#4f8f45'));
  for (const sd of [-1, 1]) group.add(lineMesh(ctx, major.filter(r => r.w > 9).map(r => r.pts), 1.8, .19, '#2f9a62', sd * 4.2));

  /* ---------------- moving things ---------------- */
  const vehMat = ctx.mat('#ffffff', { vertexColors: true, roughness: .35, metalness: .2, envMapIntensity: .9 });
  const tramGeo = (() => { const b = new Builder(); for (const zz of [-7, 7]) { b.add('v', boxGeo(2.65, 3.1, 13, 4, 4), [0, .3, zz], null, null, '#f2f5f7'); b.add('v', boxGeo(2.7, .9, 13.05), [0, 1.6, zz], null, null, '#1d2a36'); b.add('v', boxGeo(2.72, .35, 13.1), [0, .9, zz], null, null, '#19b3a6'); } return b.build({ v: null }).v.geometry; })();
  const podGeo = (() => { const b = new Builder(); b.add('v', new THREE.CapsuleGeometry(1.1, 2.4, 4, 10).rotateX(Math.PI / 2).scale(1, .9, 1).translate(0, 1.2, 0), null, null, null, '#ffffff'); b.add('v', boxGeo(2.24, .7, 2), [0, 1.5, -.3], null, null, '#1d2a36'); return b.build({ v: null }).v.geometry; })();
  const bikeGeo = (() => { const b = new Builder(); b.add('v', boxGeo(.25, 1.1, 1.7), [0, .2, 0], null, null, '#333333'); b.add('v', boxGeo(.45, .7, .45), [0, 1.3, 0], null, null, '#ffffff'); b.add('v', new THREE.SphereGeometry(.22, 8, 6), [0, 1.85, 0], null, null, '#e8c9b0'); return b.build({ v: null }).v.geometry; })();
  const trams = new PathMovers(tramGeo, vehMat, transitLines.filter(l => l.length > 1).map(l => ({ route: Route.outAndBack(l), n: Math.max(1, Math.round(new Route(l).len / 450)), speed: 11, y: .2 })), 21);
  const podLanes = major.filter(r => r.pts.length > 1).map(r => ({ route: Route.outAndBack(r.pts, 2.5), n: 1, speed: 9, y: .15, colors: ['#ffffff', '#e8f6ff', '#dff7ea', '#fff3d6'] })).filter(l => l.route.len > 150).slice(0, 60);
  const pods = new PathMovers(podGeo, vehMat, podLanes, 22);
  const bikeLanes = major.filter(r => r.pts.length > 1 && r.w > 9).map(r => ({ route: Route.outAndBack(r.pts, 4.2), n: 1, speed: 5.5, y: .2, colors: ['#bb3b3b', '#2f6db0', '#e0a020', '#3a9a5a'] })).filter(l => l.route.len > 120).slice(0, 50);
  const bikes = new PathMovers(bikeGeo, vehMat, bikeLanes, 23);
  // air taxis circling between the vertiport and the river
  const taxiGeo = (() => { const b = new Builder(); b.add('v', new THREE.CapsuleGeometry(1.2, 3, 4, 10).rotateX(Math.PI / 2), [0, 0, 0], null, null, '#ffffff'); b.add('v', boxGeo(9, .2, 1), [0, .6, 0], null, null, '#dfe6ea'); for (const sx of [-4.2, 4.2]) b.add('v', cylGeo(1.5, 1.5, .15, 16), [sx, .9, 0], null, null, '#8fe4ff'); return b.build({ v: null }).v.geometry; })();
  const ring = (cx, cz, r) => { const pts = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2; pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } return pts; };
  const taxis = new PathMovers(taxiGeo, vehMat, [{ route: new Route(ring(VP.x, VP.z, 160)), n: 2, speed: 18, y: VP.y + 55 }, { route: new Route(ring(VP.x - 120, VP.z + 260, 300)), n: 2, speed: 22, y: VP.y + 85 }], 24);
  group.add(trams.mesh, pods.mesh, bikes.mesh, taxis.mesh);
  // people on the riverfront paths and around Capitol Square
  const near = (pts, c, r) => pts.some(([x, z]) => Math.hypot(x - c.x, z - c.z) < r);
  const footRoutes = DATA.roads.filter(r => ['footway', 'path', 'pedestrian'].includes(r.c) && r.pts.length > 1 && (riverDist(r.pts[0][0], r.pts[0][1]) < 140 || near(r.pts, P.statehouse, 140) || near(r.pts, P.commons, 120)))
    .map(r => Route.outAndBack(r.pts)).filter(r => r.len > 30).slice(0, 80);
  let walkers = null; if (footRoutes.length) { const people = new People(Math.min(300, footRoutes.length * 4), { envMats: ctx.envMats }); group.add(people.mesh); walkers = new Walkers(people, footRoutes.map(route => ({ route, n: 4 })), 31); }

  /* ---------------- anchors and telescope (same names as the pilot world) ---------------- */
  const a = (p, y) => new V3(p.x, y, p.z);
  const T0 = TT[0] || new V3(300, 70, -195);
  const rv = riverAtD(startD + .55 * (crossD - startD)); const anchors = { river: new V3(rv.x, 4, rv.z), vertiport: VP.clone().setY(VP.y + 4), greenbridge: GB, leveque: a(P.leveque, 120), fountain: FT.clone().setY(4),
    canyon: new V3(lerp(xr0, 0, .78), 40, broadAt(lerp(xr0, 0, .78))), transit: new V3(lerp(xr0, 0, .86), 2, broadAt(lerp(xr0, 0, .86))), bikes: new V3(lerp(xr0, 0, .92), 1.5, broadAt(lerp(xr0, 0, .92)) + 7), statehouse: a(P.statehouse, 30),
    roofs: new V3(230, 45, broadAt(230) - 120), microgrid: MG, timber: T0, cosi: a(P.cosi, 10), downtown: new V3(0, 0, 0) };
  const telescope = [
    { t0: -9, t1: 8, name: 'SCIOTO RIVER', fact: 'FREE-FLOWING THROUGH DOWNTOWN · GREENWAYS 2015', at: anchors.river, size: 220 },
    { t0: 8, t1: 12.5, name: 'ROOFTOP VERTIPORT', fact: '2050 CONCEPT · ELECTRIC AIR TAXIS', at: anchors.vertiport, size: 90 },
    { t0: 12.5, t1: 16, name: 'GREEN BRIDGE', fact: '2050 CONCEPT · WALK · BIKE · SHADE', at: anchors.greenbridge, size: 90 },
    { t0: 16, t1: 21, name: 'LEVEQUE TOWER', fact: 'OPENED 1927 · 555 FT', at: anchors.leveque, size: 120 },
    { t0: 21, t1: 25, name: 'SCIOTO MILE', fact: 'RIVERFRONT PARKS · OPENED 2011', at: anchors.fountain, size: 70 },
    { t0: 25, t1: 30, name: 'BROAD STREET', fact: '2050 CONCEPT · RAPID TRANSIT LANES', at: anchors.transit, size: 90 },
    { t0: 30, t1: 34, name: 'OHIO STATEHOUSE', fact: 'COMPLETED 1861', at: anchors.statehouse, size: 110 },
    { t0: 34, t1: 38.5, name: 'MASS-TIMBER TOWERS', fact: '2050 CONCEPT · BUILT ON TODAY\'S PARKING LOTS', at: anchors.timber, size: 150 },
    { t0: 38.5, t1: 60, name: 'COLUMBUS 2050', fact: 'REAL STREETS · IMAGINED FUTURE · OPENSTREETMAP', at: anchors.downtown, size: 1400 } ];

  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new V3(), _p = new V3();
  function update(t) { trams.update(t); pods.update(t); bikes.update(t); taxis.update(t); walkers?.update(t);
    for (let i = 0; i < 24; i++) { const ang = i / 24 * Math.PI * 2, r = i % 2 ? 9 : 16, h = 3 + 2.5 * (.5 + .5 * Math.sin(t * 2.2 + i * .7)) + (i % 2 ? 0 : 2);
      jets.setMatrixAt(i, _m.compose(_p.set(FT.x + Math.cos(ang) * r, .3, FT.z + Math.sin(ang) * r), _q, _s.set(1, h, 1))); } jets.instanceMatrix.needsUpdate = true; }

  return { id: 'columbus-2050', group, path, update, anchors, telescope, colliders, stats: city.stats };
}

/* ---------------- small helpers ---------------- */
function treeInst(ctx, list) {
  const b = new Builder(); b.add('t', new THREE.CylinderGeometry(.35, .55, 4, 6).translate(0, 2, 0), null, null, null, '#6a4a2e'); b.add('t', new THREE.IcosahedronGeometry(3, 0), [0, 5.6, 0], null, [1, 1.2, 1], '#ffffff');
  const geo = b.build({ t: null }).t.geometry; const m = new THREE.InstancedMesh(geo, ctx.mat('#ffffff', { vertexColors: true, roughness: .85, flatShading: true, envMapIntensity: .35 }), list.length);
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new Col(); list.forEach(([x, y, z, s], i) => { m.setMatrixAt(i, M.compose(new V3(x, y, z), q, new V3(s, s, s))); m.setColorAt(i, c.set(i % 3 ? '#4f9a3a' : '#3f8a3e')); }); m.frustumCulled = false; return m;
}
function makeTextures() {
  const mk = (W, H, draw) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const e = document.createElement('canvas'); e.width = W; e.height = H; draw(c.getContext('2d'), e.getContext('2d'), W, H);
    const t = cv => { const x = new THREE.CanvasTexture(cv); x.wrapS = x.wrapT = THREE.RepeatWrapping; x.colorSpace = THREE.SRGBColorSpace; return x; }; return { map: t(c), emi: t(e) }; };
  const r = rng(13);
  return {
    deco: mk(256, 512, (x, e, W, H) => { x.fillStyle = '#e9dfc9'; x.fillRect(0, 0, W, H); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
      for (let i = 0; i < 4; i++) { x.fillStyle = '#d6c9ad'; x.fillRect(i * 64 + 4, 0, 8, H); } for (let j = 0; j < 16; j++) for (let i = 0; i < 4; i++) { x.fillStyle = '#566a7c'; x.fillRect(i * 64 + 20, j * 32 + 6, 36, 20); if (r() < .3) { e.fillStyle = '#ffd9a0'; e.fillRect(i * 64 + 20, j * 32 + 6, 36, 20); } } }),
    timber: mk(256, 256, (x, e, W, H) => { x.fillStyle = '#c99a63'; x.fillRect(0, 0, W, H); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
      for (let j = 0; j < 4; j++) { x.fillStyle = '#8a5f35'; x.fillRect(0, j * 64, W, 7); for (let i = 0; i < 4; i++) { x.fillStyle = '#4e6474'; x.fillRect(i * 64 + 6, j * 64 + 12, 52, 44); if (r() < .3) { e.fillStyle = '#ffdca8'; e.fillRect(i * 64 + 6, j * 64 + 12, 52, 44); } } } }) };
}
