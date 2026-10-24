/* WORLD · COLUMBUS 2050 — an artistic future scenario for downtown Columbus, Ohio.
   NOT an official plan. Real landmarks (Scioto River, Scioto Mile, LeVeque Tower, Ohio Statehouse, Rhodes Tower,
   Huntington Center) are placed approximately; streets are a simplified grid. Everything marked "2050" is imagined.

   Coordinates: metres; x = east, z = south, y = up. High Street is x = 0, Broad Street is z = 0.
   The layout constants below are the seam for later GIS work: swap STREETS / LANDMARKS / buildLots() for data
   generated from OpenStreetMap or Franklin County parcels without touching the engine.

   Module interface (shared with sci-fi-360 worlds): buildX(ctx) → { group, path, update(t), anchors, telescope }
   plus optional: colliders (boxes for path-clearance QA), blockRoof (roof tint for ctx.makeBlocks). */
import * as THREE from 'three';
import { V3, Col, lerp, clamp, rng, fbm, FlightPath, Builder, boxGeo, cylGeo, beamGeo, cylBetween, decoTex, brickTex, solarTex, SpriteField, puffTex, dotTex, People, Movers } from '../../sci-fi-360/js/lib.js';

/* ---------------- layout (simplified downtown grid) ---------------- */
export const STREETS = {
  ns: [ { x: -200, hw: 9, name: 'Civic Center Dr' }, { x: -120, hw: 10, name: 'Front St' }, { x: 0, hw: 16, name: 'High St', transit: true }, { x: 120, hw: 10, name: 'Third St' },
        { x: 240, hw: 10, name: 'Fourth St' }, { x: 360, hw: 10, name: 'Grant Ave' }, { x: 480, hw: 9 }, { x: 600, hw: 9 }, { x: 720, hw: 9 } ],
  ew: [ { z: -700, hw: 9 }, { z: -560, hw: 11, name: 'Nationwide Blvd' }, { z: -390, hw: 10, name: 'Spring St' }, { z: -260, hw: 10, name: 'Long St' }, { z: -130, hw: 10, name: 'Gay St' },
        { z: 0, hw: 18, name: 'Broad St', transit: true }, { z: 110, hw: 10, name: 'State St' }, { z: 220, hw: 10, name: 'Town St' }, { z: 330, hw: 10, name: 'Rich St' },
        { z: 440, hw: 10, name: 'Main St' }, { z: 560, hw: 10, name: 'Mound St' }, { z: 700, hw: 9 } ] };
const X0 = -200, X1 = 760, Z0 = -760, Z1 = 760;      // downtown extent east of the river
export const riverX = z => -285 + 12 * Math.sin((z + 200) / 500);   // Scioto centreline
const RIVER_HW = 36;
const SIDEWALK = 5;

export function buildColumbus2050(ctx) {
  const group = new THREE.Group(); group.name = 'columbus-2050';
  const colliders = [];
  const B = new Builder();
  const addBox = (key, w, h, d, x, y, z, ry = 0, color, tw = 8, th = 8, label) => { B.add(key, boxGeo(w, h, d, tw, th), [x, y, z], [0, ry, 0], null, color);
    if (label !== false) colliders.push([x - w / 2, y, z - d / 2, x + w / 2, y + h, z + d / 2, label || key]); };

  /* ---------------- materials ---------------- */
  const tex = makeTextures();
  const M = {
    ground: ctx.mat('#7a8a6c', { roughness: 1, envMapIntensity: .2 }),
    plaza: ctx.mat('#b4b2a8', { roughness: .95, envMapIntensity: .25 }),
    street: ctx.mat('#3b3f45', { roughness: .9, envMapIntensity: .2 }),
    paint: ctx.mat('#ffffff', { roughness: .8, vertexColors: true, envMapIntensity: .2 }),
    grass: ctx.mat('#ffffff', { roughness: .95, vertexColors: true, envMapIntensity: .25 }),
    stone: ctx.mat('#ffffff', { roughness: .8, vertexColors: true, envMapIntensity: .35 }),
    glass: ctx.mat('#ffffff', { map: tex.glass.map, emissiveMap: tex.glass.emi, emissive: '#ffffff', emissiveIntensity: .35, roughness: .25, metalness: .35, envMapIntensity: 1.1, vertexColors: true }),
    deco: ctx.mat('#ffffff', { map: tex.deco.map, emissiveMap: tex.deco.emi, emissive: '#ffffff', emissiveIntensity: .25, roughness: .75, vertexColors: true }),
    brick: ctx.mat('#ffffff', { map: tex.brick.map, emissiveMap: tex.brick.emi, emissive: '#ffffff', emissiveIntensity: .2, roughness: .85, vertexColors: true }),
    timber: ctx.mat('#ffffff', { map: tex.timber.map, emissiveMap: tex.timber.emi, emissive: '#ffffff', emissiveIntensity: .3, roughness: .7, vertexColors: true }),
    rib: ctx.mat('#ffffff', { map: tex.rib.map, emissiveMap: tex.rib.emi, emissive: '#ffffff', emissiveIntensity: .25, roughness: .55, metalness: .2, vertexColors: true }),
    leveque: ctx.mat('#ffffff', { map: tex.leveque.map, emissiveMap: tex.leveque.emi, emissive: '#ffffff', emissiveIntensity: .25, roughness: .7, vertexColors: true }),
    solar: ctx.mat('#ffffff', { map: tex.solar, roughness: .25, metalness: .6, envMapIntensity: 1.2, emissive: '#0a1a40', emissiveIntensity: .35 }),
    white: ctx.mat('#ffffff', { roughness: .35, metalness: .15, envMapIntensity: .9, vertexColors: true }),
    dark: ctx.mat('#2a3340', { roughness: .45, metalness: .6, envMapIntensity: .8 }),
    water: ctx.mat('#3d7fa3', { roughness: .08, metalness: .3, envMapIntensity: 1.4, emissive: '#0d3048', emissiveIntensity: .35 }),
    glowG: new THREE.MeshBasicMaterial({ color: new Col('#7dffb0').multiplyScalar(1.6) }),
    glowB: new THREE.MeshBasicMaterial({ color: new Col('#8fe4ff').multiplyScalar(1.8) }),
    glowW: new THREE.MeshBasicMaterial({ color: new Col('#fff1d0').multiplyScalar(1.6) }) };

  /* ---------------- ground, streets, river ---------------- */
  { const g = new THREE.Mesh(new THREE.PlaneGeometry(40000, 40000).rotateX(-Math.PI / 2), M.ground); g.position.y = -.05; group.add(g); }
  B.add('plaza', boxGeo(X1 - X0 + 40, .1, Z1 - Z0 + 40), [(X0 + X1) / 2 + 10, 0, 0]);
  const streetRuns = [];
  for (const s of STREETS.ns) { addBox('street', s.hw * 2, .12, Z1 - Z0 + 80, s.x, 0, 0, 0, null, 8, 8, false); streetRuns.push({ ax: 'z', c: s.x, hw: s.hw, a: Z0 - 40, b: Z1 + 40, s }); }
  for (const s of STREETS.ew) { const x0 = s.transit ? -1300 : X0 - 10; addBox('street', X1 + 60 - x0, .12, s.hw * 2, (x0 + X1 + 60) / 2, 0, s.z, 0, null, 8, 8, false); streetRuns.push({ ax: 'x', c: s.z, hw: s.hw, a: x0, b: X1 + 60, s }); }
  // painted bike lanes (both sides, every street) and green transit ways on Broad and High
  for (const r of streetRuns) { const L = r.b - r.a, m = (r.a + r.b) / 2;
    for (const sd of [-1, 1]) { const o = r.c + sd * (r.hw - 1.6); if (r.ax === 'z') B.add('paint', boxGeo(2.2, .16, L), [o, 0, m], null, null, '#2f9a62'); else B.add('paint', boxGeo(L, .16, 2.2), [m, 0, o], null, null, '#2f9a62'); }
    if (r.s.transit) { if (r.ax === 'z') B.add('grass', boxGeo(10, .2, L), [r.c, 0, m], null, null, '#4f8f45'); else B.add('grass', boxGeo(L, .2, 10), [m, 0, r.c], null, null, '#4f8f45');
      for (const o of [-3.2, -1.8, 1.8, 3.2]) { if (r.ax === 'z') B.add('paint', boxGeo(.35, .24, L), [r.c + o, 0, m], null, null, '#c9d2d8'); else B.add('paint', boxGeo(L, .24, .35), [m, 0, r.c + o], null, null, '#c9d2d8'); } } }
  // the river: a ribbon following the centreline, with planted banks and paths
  { const N = 120, zA = -1700, zB = 1700; const pos = [], idx = [];
    for (let i = 0; i <= N; i++) { const z = lerp(zA, zB, i / N), c = riverX(z); pos.push(c - RIVER_HW, .5, z, c + RIVER_HW, .5, z); if (i) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); const w = new THREE.Mesh(g, M.water); group.add(w);
    for (let i = 0; i < N; i++) { const z = lerp(zA, zB, (i + .5) / N), c = riverX(z), L = (zB - zA) / N + 1;
      for (const sd of [-1, 1]) { B.add('grass', boxGeo(26, 1.6, L), [c + sd * (RIVER_HW + 13), -.2, z], null, null, '#5f9447'); B.add('paint', boxGeo(4, 1.7, L), [c + sd * (RIVER_HW + 30), -.2, z], null, null, '#d9d2bd'); } } }
  // parks: Scioto Mile (east bank), Genoa Park (west bank), Capitol Square, Columbus Commons, North Bank
  const parks = [ { x0: riverX(0) + RIVER_HW + 32, x1: X0 - 9, z0: -380, z1: 520, name: 'Scioto Mile' }, { x0: 21, x1: 105, z0: 23, z1: 95, name: 'Capitol Square' }, { x0: 21, x1: 105, z0: 225, z1: 315, name: 'Columbus Commons' },
    { x0: riverX(-500) + RIVER_HW + 32, x1: X0 - 9, z0: -720, z1: -400, name: 'North Bank Park' }, { x0: riverX(0) - RIVER_HW - 110, x1: riverX(0) - RIVER_HW - 32, z0: -300, z1: 420, name: 'Genoa Park' } ].filter(p => p.z1 > p.z0);
  for (const p of parks) B.add('grass', boxGeo(p.x1 - p.x0, .3, p.z1 - p.z0), [(p.x0 + p.x1) / 2, 0, (p.z0 + p.z1) / 2], null, null, '#6aa64f');
  // promenade along the Scioto Mile
  B.add('paint', boxGeo(6, .35, 900), [riverX(70) + RIVER_HW + 42, 0, 70], null, null, '#d8d0bc');

  /* ---------------- bridges ---------------- */
  const bridge = (z, w, label, opts = {}) => { const c = riverX(z), L = RIVER_HW * 2 + 70;
    addBox('stone', L, 2.2, w, c, 6, z, 0, '#d9d4c8', 8, 8, label); addBox('street', L, .2, w - 4, c, 8.2, z, 0, null, 8, 8, false);
    for (const sd of [-1, 1]) { addBox('white', L, 1.1, .4, c, 8.4, z + sd * (w / 2 - .2), 0, '#eef2f5', 8, 8, false); B.add('stone', cylGeo(1.6, 1.8, 6, 10), [c + sd * 18, 0, z], null, null, '#cfc8ba'); }
    if (opts.green) { B.add('grass', boxGeo(L, .5, w - 8), [c, 8.3, z], null, null, '#5e9a45'); for (let i = -2; i <= 2; i++) treeAt(c + i * 16, 8.8, z + (i % 2 ? 3 : -3), .8); }
    if (opts.arch) { const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push(new V3(c - L / 2 + 8 + u * (L - 16), 8 + Math.sin(u * Math.PI) * 24, z - w / 2 - 2 + Math.sin(u * Math.PI) * 6)); }
      for (let i = 0; i < 16; i++) B.addM('white', cylBetween(pts[i], pts[i + 1], 1.1, 8), new THREE.Matrix4(), '#f4f6f8'); colliders.push([c - L / 2, 8, z - w / 2 - 4, c + L / 2, 33, z - w / 2 + 6, 'Main St bridge arch']); } };
  const treeList = [];
  function treeAt(x, y, z, s = 1, kind) { treeList.push([x, y, z, s, kind ?? ((x * 13.7 + z * 7.1) % 1 + 1) % 1]); }
  bridge(0, 36, 'Broad St bridge'); bridge(-260, 22, 'Long St bridge'); bridge(220, 22, 'Town St bridge'); bridge(330, 22, 'Rich St bridge'); bridge(440, 24, 'Main St bridge', { arch: true });
  bridge(-130, 26, 'Green Bridge (2050)', { green: true });

  /* ---------------- landmarks (real, approximate) ---------------- */
  // LeVeque Tower (1927, 555 ft / 169 m) — tiered Art Deco tower, 50 W Broad St
  const LQ = new V3(-70, 0, -45);
  { const s = .97; const tiers = [[34, 72], [28, 48], [22, 24], [16, 12]]; let y = 0;
    for (const [w, h] of tiers) { addBox('leveque', w * s, h * s, w * s, LQ.x, y, LQ.z, 0, '#efe6d2', 6, 8, 'LeVeque Tower');
      for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) { const a = (i - 1.5) / 4 * w * s; B.add('leveque', boxGeo(1.1, h * s, 1.1), [LQ.x + a, y, LQ.z + sd * (w * s / 2 + .4)], null, null, '#f6eedb'); B.add('leveque', boxGeo(1.1, h * s, 1.1), [LQ.x + sd * (w * s / 2 + .4), y, LQ.z + a], null, null, '#f6eedb'); }
      y += h * s; }
    B.add('leveque', cylGeo(6, 8, 9, 8), [LQ.x, y, LQ.z], null, null, '#efe6d2'); B.add('leveque', new THREE.ConeGeometry(4, 9, 8).translate(0, 4.5, 0), [LQ.x, y + 9, LQ.z], null, null, '#efe6d2');
    B.add('glowW', new THREE.SphereGeometry(1.4, 10, 8), [LQ.x, y + 18.4, LQ.z]); }
  // Rhodes State Office Tower (1974, 629 ft / 192 m), 30 E Broad St
  const RH = new V3(60, 0, -55); addBox('rib', 48, 192, 30, RH.x, 0, RH.z, 0, '#9aa3ad', 6, 8, 'Rhodes Tower'); addBox('dark', 30, 6, 18, RH.x, 192, RH.z, 0, null, 8, 8, 'Rhodes roof');
  // Huntington Center (1984, 512 ft / 156 m), 41 S High St
  const HC = new V3(-60, 0, 50); addBox('deco', 40, 130, 40, HC.x, 0, HC.z, 0, '#b88a7c', 6, 8, 'Huntington Center'); addBox('deco', 28, 18, 28, HC.x, 130, HC.z, 0, '#b88a7c', 6, 8, 'Huntington Center top');
  B.add('stone', new THREE.ConeGeometry(20, 8, 4).rotateY(Math.PI / 4).translate(0, 4, 0), [HC.x, 148, HC.z], null, null, '#8b6a60');
  // Ohio Statehouse (completed 1861) on Capitol Square
  const SH = new V3(60, 0, 59);
  { addBox('stone', 70, 17, 52, SH.x, 0, SH.z, 0, '#e2dccd', 8, 8, 'Ohio Statehouse'); addBox('stone', 6, 3, 30, SH.x - 38, 13, SH.z, 0, '#e8e2d4', 8, 8, false);
    for (let i = 0; i < 8; i++) B.add('stone', cylGeo(1.1, 1.2, 13, 12), [SH.x - 39, 0, SH.z - 12 + i * 3.4], null, null, '#f0ebdf');
    B.add('stone', cylGeo(10, 10, 24, 32), [SH.x, 17, SH.z], null, null, '#e8e2d4'); B.add('stone', cylGeo(11.2, 11.2, 2, 32), [SH.x, 41, SH.z], null, null, '#f0ebdf');
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; B.add('dark', boxGeo(1.6, 9, .6), [SH.x + Math.cos(a) * 10.05, 27, SH.z + Math.sin(a) * 10.05], [0, -a + Math.PI / 2, 0]); }
    colliders.push([SH.x - 11, 17, SH.z - 11, SH.x + 11, 43, SH.z + 11, 'Statehouse cupola']);
    for (const [dx, dz] of [[-30, -28], [30, -28], [-30, 28], [30, 28], [0, -30], [0, 30], [-36, 0], [36, 0]]) treeAt(SH.x + dx, .3, SH.z + dz, 1.1); }
  // COSI (west bank) — long low science-centre building
  { const cx = riverX(40) - RIVER_HW - 150, cz = 40; addBox('white', 150, 16, 50, cx, 0, cz, 0, '#e9edf0', 8, 8, 'COSI'); const roof = new THREE.CylinderGeometry(25, 25, 150, 24, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateX(Math.PI / 2);
    B.add('white', roof, [cx, 16, cz], [0, 0, 0], [1, .45, 1], '#dfe6ea'); }

  /* ---------------- 2050 additions (artistic) ---------------- */
  // rooftop vertiport / mobility hub by the river
  const VP = new V3(-158, 0, -325);
  { addBox('white', 70, 30, 56, VP.x, 0, VP.z, 0, '#e6ebef', 8, 8, 'Mobility hub'); addBox('solar', 64, .6, 50, VP.x, 30, VP.z, 0, null, 8, 8, false);
    for (const [dx, dz] of [[-17, -12], [17, -12], [-17, 12], [17, 12]]) { B.add('white', cylGeo(8, 8, .6, 32), [VP.x + dx, 30.6, VP.z + dz], null, null, '#f4f6f8'); B.add('glowB', new THREE.TorusGeometry(7, .18, 6, 40).rotateX(Math.PI / 2), [VP.x + dx, 31.3, VP.z + dz]); }
    B.add('glowB', boxGeo(70.4, 1, 56.4), [VP.x, 12, VP.z]); }
  // mass-timber terraced towers with planted setbacks
  const TT = [[300, -195, 32, 112], [420, 60, 30, 96], [560, -330, 34, 120], [190, 385, 28, 84], [-150, -470, 30, 90]];
  for (const [x, z, w, h] of TT) { let y = 0, ww = w; const step = h / 5;
    for (let k = 0; k < 5; k++) { addBox('timber', ww, step, ww, x, y, z, 0, '#ffffff', 6, 6, 'Mass-timber tower'); y += step;
      if (k < 4) { B.add('grass', boxGeo(ww, .8, ww), [x, y, z], null, null, '#5c9a43'); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; treeAt(x + Math.cos(a) * (ww / 2 - 2), y + .8, z + Math.sin(a) * (ww / 2 - 2), .55); } }
      ww -= 4; }
    addBox('solar', ww + 2, .6, ww + 2, x, y, z, 0, null, 8, 8, false); }
  // solar canopy park + neighbourhood microgrid battery hall
  const SC = new V3(420, 0, 165), MG = new V3(330, 0, -150);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const x = SC.x - 33 + i * 22, z = SC.z - 25 + j * 25; B.add('white', cylGeo(.35, .35, 6, 8), [x, 0, z], null, null, '#dfe4e8'); B.add('solar', boxGeo(18, .4, 9), [x, 6, z], [0, 0, 0], null); }
  B.add('grass', boxGeo(90, .3, 80), [SC.x, 0, SC.z], null, null, '#6aa64f');
  addBox('white', 40, 9, 16, MG.x, 0, MG.z, 0, '#eef1f3', 8, 8, 'Microgrid battery hall'); for (let i = 0; i < 8; i++) B.add('glowG', boxGeo(3, .6, .3), [MG.x - 17 + i * 4.8, 6.5, MG.z + 8.1]);
  addBox('solar', 38, .5, 14, MG.x, 9, MG.z, 0, null, 8, 8, false);

  /* ---------------- downtown buildings (procedural lots in the street grid) ---------------- */
  const R = rng(2050);
  const reserved = [ [LQ.x - 20, LQ.z - 20, LQ.x + 20, LQ.z + 20], [RH.x - 28, RH.z - 18, RH.x + 28, RH.z + 18], [HC.x - 24, HC.z - 24, HC.x + 24, HC.z + 24], [21, 23, 105, 95], [21, 225, 105, 315],
    [VP.x - 38, VP.z - 32, VP.x + 38, VP.z + 32], [SC.x - 48, SC.z - 42, SC.x + 48, SC.z + 42], [MG.x - 24, MG.z - 12, MG.x + 24, MG.z + 12], ...TT.map(([x, z, w]) => [x - w / 2 - 4, z - w / 2 - 4, x + w / 2 + 4, z + w / 2 + 4]) ];
  const hits = (a, b) => !(a[2] <= b[0] || a[0] >= b[2] || a[3] <= b[1] || a[1] >= b[3]);
  const roofTops = [];
  const NS = STREETS.ns, EW = STREETS.ew;
  for (let i = 0; i < NS.length - 1; i++) for (let j = 0; j < EW.length - 1; j++) {
    const cx0 = NS[i].x + NS[i].hw + SIDEWALK, cx1 = NS[i + 1].x - NS[i + 1].hw - SIDEWALK, cz0 = EW[j].z + EW[j].hw + SIDEWALK, cz1 = EW[j + 1].z - EW[j + 1].hw - SIDEWALK;
    const nx = cx1 - cx0 > 70 ? 2 : 1, nz = cz1 - cz0 > 70 ? 2 : 1;
    for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) {
      const lx0 = lerp(cx0, cx1, a / nx) + (a ? 3 : 0), lx1 = lerp(cx0, cx1, (a + 1) / nx) - (a < nx - 1 ? 3 : 0), lz0 = lerp(cz0, cz1, b / nz) + (b ? 3 : 0), lz1 = lerp(cz0, cz1, (b + 1) / nz) - (b < nz - 1 ? 3 : 0);
      const lot = [lx0, lz0, lx1, lz1]; if (reserved.some(r => hits(lot, r))) continue;
      const cx = (lx0 + lx1) / 2, cz = (lz0 + lz1) / 2;
      if (R() < .08) { B.add('grass', boxGeo(lx1 - lx0, .3, lz1 - lz0), [cx, 0, cz], null, null, '#6aa64f'); treeAt(cx, .3, cz, 1.2); treeAt(cx + 8, .3, cz - 6, .9); continue; }
      const d = Math.hypot(cx, cz * .85); const inset = R() * 3;
      let h = d < 300 ? (R() < .14 ? lerp(85, 135, R()) : lerp(22, 64, R())) : d < 650 ? lerp(14, 40, R()) : lerp(9, 24, R());
      if (cx > 130 && cz > -275 && cz < 30) h = Math.min(h, 58);              // keeps the skyship's climb-out clear
      const w = lx1 - lx0 - inset * 2, dd = lz1 - lz0 - inset * 2;
      const kind = d < 330 ? (R() < .55 ? 'glass' : R() < .6 ? 'deco' : 'rib') : (R() < .35 ? 'brick' : R() < .45 ? 'deco' : R() < .6 ? 'glass' : 'timber');
      const tint = { glass: ['#d6e4ef', '#c4d4e2', '#e2ecf4'], deco: ['#efe6d2', '#e3d6be', '#d8d0c4'], brick: ['#ffffff', '#f2e4dc'], timber: ['#ffffff', '#f6ebdc'], rib: ['#b8c0c8', '#a8b2bc'] }[kind];
      addBox(kind, w, h, dd, cx, 0, cz, 0, tint[Math.floor(R() * tint.length)], 6, kind === 'brick' ? 6 : 8, 'Downtown building');
      // roofs: most are green, many carry solar, some keep mechanical plant
      const rr = R(); if (rr < .55) { B.add('grass', boxGeo(w - 2, .8, dd - 2), [cx, h, cz], null, null, R() < .5 ? '#5e9a45' : '#6fae52'); if (h < 45 && w > 18) { treeAt(cx - w / 4, h + .8, cz, .6); treeAt(cx + w / 4, h + .8, cz + dd / 5, .55); } }
      else if (rr < .82) B.add('solar', boxGeo(w - 3, .5, dd - 3), [cx, h, cz]); else addBox('dark', w * .4, 3.5, dd * .4, cx, h, cz, 0, null, 8, 8, false);
      roofTops.push({ x: cx, z: cz, y: h, w, d: dd });
      if (h > 60 && R() < .5) B.add('glowW', boxGeo(w + .2, .5, dd + .2), [cx, h - 1, cz]);
    } }
  // vertical-axis wind turbines on some eastern roofs
  const turbines = []; { const pick = roofTops.filter(r => r.x > 150 && r.y > 25 && r.y < 58).slice(0, 8);
    const tg = new THREE.Group(); group.add(tg); const bladeM = M.white;
    for (const r of pick) { const t = new THREE.Group(); t.position.set(r.x, r.y, r.z); tg.add(t); const mast = new THREE.Mesh(new THREE.CylinderGeometry(.25, .3, 9, 8).translate(0, 4.5, 0), M.dark); t.add(mast);
      const rot = new THREE.Group(); rot.position.y = 5.5; t.add(rot); for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; const b = new THREE.Mesh(new THREE.BoxGeometry(.5, 6, .12), bladeM); b.position.set(Math.cos(a) * 2, 0, Math.sin(a) * 2); b.rotation.y = -a; rot.add(b); }
      for (const y of [-3, 3]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(2, .08, 6, 24).rotateX(Math.PI / 2), M.dark); ring.position.y = y; rot.add(ring); } turbines.push(rot); } }

  /* ---------------- outskirts (instanced low blocks with green roofs) ---------------- */
  { const list = []; const r = rng(77);
    for (let x = -2600; x <= 2800; x += 64) for (let z = -2800; z <= 2800; z += 64) {
      const inDown = x > X0 - 30 && x < X1 + 30 && z > Z0 - 30 && z < Z1 + 30; const nearRiver = Math.abs(x - riverX(z)) < RIVER_HW + 150; const westPark = x < riverX(z) && x > riverX(z) - 260 && z > -340 && z < 460;
      if (inDown || nearRiver || westPark || r() < .3) continue; const d = Math.hypot(x, z); const h = d < 1400 ? 8 + r() * 26 : 5 + r() * 12;
      list.push({ x: x + r() * 12 - 6, z: z + r() * 12 - 6, w: 22 + r() * 26, d: 22 + r() * 26, h, c: ['#b9b2a6', '#c8bfb0', '#a9a39a', '#d3cabc', '#9fa6ac'][Math.floor(r() * 5)], s: r() * 100 }); }
    group.add(ctx.makeBlocks(list)); }

  /* ---------------- trees: streets, riverbanks, parks ---------------- */
  for (const run of streetRuns) { if (run.a < X0 - 40 && run.ax === 'x') { /* skip the long Broad St run west of downtown here */ }
    const a = Math.max(run.a, run.ax === 'z' ? Z0 : X0), b = Math.min(run.b, run.ax === 'z' ? Z1 : X1);
    for (let u = a + 8; u < b; u += 21) { const cross = (run.ax === 'z' ? EW : NS).some(o => Math.abs(u - (run.ax === 'z' ? o.z : o.x)) < o.hw + 7); if (cross) continue;
      for (const sd of [-1, 1]) { const o = run.c + sd * (run.hw + 2.6); const [x, z] = run.ax === 'z' ? [o, u] : [u, o]; if (reserved.slice(0, 3).some(rr => x > rr[0] && x < rr[2] && z > rr[1] && z < rr[3])) continue; treeAt(x, .1, z, .8 + ((u * 7) % 3) * .1); } } }
  { const r = rng(31); for (let z = -1500; z < 1500; z += 9) for (const sd of [-1, 1]) { if (r() < .25) continue; const x = riverX(z) + sd * (RIVER_HW + 4 + r() * 18); if (Math.abs(z) < 24) continue; if ([-260, -130, 220, 330, 440].some(b => Math.abs(z - b) < 16)) continue; treeAt(x, .9, z, .9 + r() * .7); } }
  { const r = rng(32); for (const p of parks) { const n = Math.round((p.x1 - p.x0) * (p.z1 - p.z0) / 520); for (let i = 0; i < n; i++) { const x = lerp(p.x0 + 4, p.x1 - 4, r()), z = lerp(p.z0 + 4, p.z1 - 4, r());
      if (p.name === 'Capitol Square' && Math.abs(x - SH.x) < 41 && Math.abs(z - SH.z) < 30) continue; if (p.name === 'Scioto Mile' && Math.hypot(x - (riverX(40) + 68), z - 40) < 22) continue; treeAt(x, .3, z, .9 + r() * .6); } } }
  const treeGeo = (() => { const b = new Builder(); b.add('t', new THREE.CylinderGeometry(.35, .55, 4, 6).translate(0, 2, 0), null, null, null, '#6a4a2e'); b.add('t', new THREE.IcosahedronGeometry(3, 0), [0, 5.6, 0], null, [1, 1.2, 1], '#ffffff'); b.add('t', new THREE.IcosahedronGeometry(2.2, 0), [.6, 8, .3], null, null, '#ffffff'); return b.build({ t: null }).t.geometry; })();
  const treeMat = ctx.mat('#ffffff', { vertexColors: true, roughness: .85, flatShading: true, envMapIntensity: .35 });
  const trees = new THREE.InstancedMesh(treeGeo, treeMat, treeList.length); { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new Col();
    treeList.forEach(([x, y, z, s, k], i) => { trees.setMatrixAt(i, m.compose(new V3(x, y, z), q.setFromEuler(e.set(0, k * 6.28, 0)), new V3(s, s, s))); trees.setColorAt(i, c.set(k < .35 ? '#3f8a3e' : k < .65 ? '#4f9a3a' : k < .88 ? '#6aa845' : '#2f7438')); }); }
  group.add(trees);

  B.build({ ground: M.ground, plaza: M.plaza, street: M.street, paint: M.paint, grass: M.grass, stone: M.stone, glass: M.glass, deco: M.deco, brick: M.brick, timber: M.timber, rib: M.rib, leveque: M.leveque, solar: M.solar, white: M.white, dark: M.dark, glowG: M.glowG, glowB: M.glowB, glowW: M.glowW }, group);

  /* ---------------- moving things ---------------- */
  // rapid transit (artistic): articulated vehicles on Broad St and High St
  const tramGeo = (() => { const b = new Builder(); for (const zz of [-7, 7]) { b.add('v', boxGeo(2.65, 3.1, 13, 4, 4), [0, .3, zz], null, null, '#f2f5f7'); b.add('v', boxGeo(2.7, .9, 13.05), [0, 1.6, zz], null, null, '#1d2a36'); b.add('v', boxGeo(2.72, .35, 13.1), [0, .9, zz], null, null, '#19b3a6'); } b.add('v', boxGeo(2.4, 2.6, 1.2), [0, .4, 0], null, null, '#c9d2d8'); return b.build({ v: null }).v.geometry; })();
  const vehMat = ctx.mat('#ffffff', { vertexColors: true, roughness: .35, metalness: .2, envMapIntensity: .9 });
  const tram = new Movers(tramGeo, vehMat, [ { a: new V3(-1250, 0, 2.5), b: new V3(900, 0, 2.5), n: 4, speed: 13 }, { a: new V3(900, 0, -2.5), b: new V3(-1250, 0, -2.5), n: 4, speed: 13 },
    { a: new V3(2.5, 0, 800), b: new V3(2.5, 0, -800), n: 3, speed: 12 }, { a: new V3(-2.5, 0, -800), b: new V3(-2.5, 0, 800), n: 3, speed: 12 } ], 3, 11); group.add(tram.mesh);
  // autonomous electric pods on the other streets
  const podGeo = (() => { const b = new Builder(); b.add('p', new THREE.CapsuleGeometry(.9, 2.4, 4, 10).rotateX(Math.PI / 2), [0, 1.05, 0], null, [1, .95, 1], '#ffffff'); b.add('p', new THREE.BoxGeometry(1.75, .55, 2.2), [0, 1.45, -.2], null, null, '#1d2a36'); return b.build({ p: null }).p.geometry; })();
  const podLanes = []; for (const s of NS) if (!s.transit) for (const sd of [-1, 1]) podLanes.push({ a: new V3(s.x + sd * (s.hw - 5), 0, sd > 0 ? Z1 : Z0), b: new V3(s.x + sd * (s.hw - 5), 0, sd > 0 ? Z0 : Z1), n: 3, speed: 9, colors: ['#ffffff', '#dff6f2', '#fff4d6', '#e4ecff'] });
  for (const s of EW) if (!s.transit) for (const sd of [-1, 1]) podLanes.push({ a: new V3(sd > 0 ? X0 : X1, 0, s.z + sd * (s.hw - 5)), b: new V3(sd > 0 ? X1 : X0, 0, s.z + sd * (s.hw - 5)), n: 2, speed: 9, colors: ['#ffffff', '#dff6f2', '#fff4d6', '#e4ecff'] });
  const pods = new Movers(podGeo, vehMat, podLanes, 2, 12); group.add(pods.mesh);
  // cyclists on the protected lanes
  const bikeGeo = (() => { const b = new Builder(); for (const zz of [-.55, .55]) b.add('b', new THREE.TorusGeometry(.33, .05, 4, 12).rotateY(Math.PI / 2), [0, .35, zz], null, null, '#222222'); b.add('b', new THREE.BoxGeometry(.08, .08, 1.1), [0, .6, 0], null, null, '#2a6a9a');
    b.add('b', new THREE.BoxGeometry(.4, .62, .28), [0, 1.2, .05], [-.35, 0, 0], null, '#ffffff'); b.add('b', new THREE.SphereGeometry(.13, 8, 6), [0, 1.62, -.12], null, null, '#e9c9a8'); b.add('b', new THREE.BoxGeometry(.16, .55, .16), [0, .75, .1], null, null, '#3a4452'); return b.build({ b: null }).b.geometry; })();
  const bikeLanes = []; for (const s of [...NS.filter(s => s.x <= 360), ...EW.filter(s => Math.abs(s.z) <= 330)]) for (const sd of [-1, 1]) { const o = ('x' in s ? s.x : s.z) + sd * (s.hw - 1.6);
    if ('x' in s) bikeLanes.push({ a: new V3(o, 0, sd > 0 ? Z1 : Z0), b: new V3(o, 0, sd > 0 ? Z0 : Z1), n: 4, speed: 5.5, colors: ['#ffffff', '#ffd27a', '#7fd8ff', '#ff9a8a', '#9dffcf'] });
    else bikeLanes.push({ a: new V3(sd > 0 ? X0 : X1, 0, o), b: new V3(sd > 0 ? X1 : X0, 0, o), n: 3, speed: 5.5, colors: ['#ffffff', '#ffd27a', '#7fd8ff', '#ff9a8a', '#9dffcf'] }); }
  const bikes = new Movers(bikeGeo, vehMat, bikeLanes, 3, 13); group.add(bikes.mesh);
  // kayaks on the Scioto
  const kayakGeo = new THREE.CapsuleGeometry(.35, 3.4, 4, 8).rotateX(Math.PI / 2).scale(1, .45, 1);
  const kayaks = new Movers(kayakGeo, ctx.mat('#ffffff', { roughness: .4, envMapIntensity: .6 }), [ { a: new V3(riverX(0) - 9, .6, -900), b: new V3(riverX(0) - 9, .6, 900), n: 5, speed: 2.2, colors: ['#ff8a3d', '#ffd23d', '#ff5a5a'] },
    { a: new V3(riverX(0) + 8, .6, 900), b: new V3(riverX(0) + 8, .6, -900), n: 5, speed: 2.4, colors: ['#3dc0ff', '#ffd23d', '#9dffcf'] } ], 5, 14); group.add(kayaks.mesh);
  // electric air taxis (artistic): routes out of the rooftop vertiport, plus two that land and take off
  const evGeo = (() => { const b = new Builder(); b.add('e', new THREE.SphereGeometry(1, 16, 10), [0, 0, 0], null, [1.3, .9, 2.6], '#f4f6f8'); b.add('e', new THREE.SphereGeometry(.8, 10, 8), [0, .35, -1.2], null, [1, .7, 1.2], '#20354a');
    for (const [x, z] of [[-2.6, -1.6], [2.6, -1.6], [-2.6, 1.8], [2.6, 1.8]]) { b.add('e', new THREE.BoxGeometry(2.4, .14, .2), [x * .55, .2, z], null, null, '#c8d2dc'); b.add('e', new THREE.CylinderGeometry(1.1, 1.1, .06, 16), [x, .5, z], null, null, '#9fe0ff'); } return b.build({ e: null }).e.geometry; })();
  const evMat = ctx.mat('#ffffff', { vertexColors: true, roughness: .3, metalness: .3, envMapIntensity: 1, emissive: '#183040', emissiveIntensity: .25 });
  const evRoutes = [[new V3(-158, 70, -325), new V3(900, 160, -1400)], [new V3(-1100, 140, -900), new V3(-158, 70, -325)], [new V3(-158, 80, -325), new V3(600, 130, 900)], [new V3(1200, 180, 300), new V3(-900, 150, -200)], [new V3(-600, 120, 1200), new V3(400, 170, -1300)]];
  const evtol = new Movers(evGeo, evMat, evRoutes.map(([a, b]) => ({ a, b, speed: 38, n: 2, bob: 1 })), 2, 15); group.add(evtol.mesh);
  const landers = [0, 1].map(k => { const m = new THREE.Mesh(evGeo, evMat); group.add(m); return { m, pad: new V3(VP.x + (k ? 17 : -17), 31.4, VP.z + (k ? 12 : -12)), ph: k * 6 }; });
  // people strolling the Scioto Mile promenade, Capitol Square and the Commons
  const NP = 170; const people = new People(NP, { skin: '#d7b08f', stride: 6, envMats: ctx.envMats }); group.add(people.mesh); const pr = rng(66); const walkers = [];
  for (let i = 0; i < NP; i++) { const zone = i % 3; let w;
    if (zone === 0) { const z0 = -300 + pr() * 760; w = { kind: 'line', x: riverX(z0) + RIVER_HW + 40 + pr() * 4, z: z0, len: 160, dir: pr() < .5 ? -1 : 1, sp: .9 + pr() * .5 }; }
    else if (zone === 1) { w = { kind: 'ring', c: SH, r: 33 + pr() * 6, a: pr() * 6.28, sp: (pr() < .5 ? -1 : 1) * (.03 + pr() * .02) }; }
    else { w = { kind: 'ring', c: new V3(63, 0, 270), r: 12 + pr() * 28, a: pr() * 6.28, sp: (pr() < .5 ? -1 : 1) * (.03 + pr() * .03) }; }
    w.ph = pr() * 6; walkers.push(w); people.color(i, ['#f2f2f2', '#e0a040', '#4a8ac8', '#c84a5a', '#5aa86a', '#f0d080', '#8a6ad8'][i % 7]); }
  // Bicentennial Park fountain jets on the Scioto Mile
  const FT = new V3(riverX(40) + 68, 0, 40);
  { const b2 = new Builder(); b2.add('stone', cylGeo(14, 14, .8, 40), [FT.x, 0, FT.z], null, null, '#d6d2c8'); b2.build({ stone: M.stone }, group); }
  { const pool = new THREE.Mesh(new THREE.CircleGeometry(13, 40).rotateX(-Math.PI / 2), M.water); pool.position.set(FT.x, .85, FT.z); group.add(pool); }
  const jets = new SpriteField(72, { map: puffTex(5), color: '#f2fbff', opacity: .55 }); group.add(jets.mesh);

  /* ---------------- flight path (journey time = local time) ---------------- */
  const path = new FlightPath([[-3, -300, 74, -860], [0, -296, 66, -750], [5.5, -300, 56, -520], [11, -292, 50, -260], [15.5, -284, 50, -80], [19, -258, 52, -8], [22.5, -178, 58, 0],
    [26, -62, 62, 0], [29.5, 58, 66, 0], [33, 190, 84, -4], [36.5, 310, 150, -40], [39.5, 400, 290, -90], [42.5, 460, 470, -130], [46, 500, 650, -160]]);

  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new V3(1, 1, 1);
  function update(t) {
    tram.update(t); pods.update(t); bikes.update(t); kayaks.update(t); evtol.update(t);
    for (const L of landers) { const u = ((t + L.ph) % 12) / 12; const y = u < .4 ? lerp(60, 0, u / .4) : u < .6 ? 0 : lerp(0, 60, (u - .6) / .4); L.m.position.set(L.pad.x, L.pad.y + y * y / 60, L.pad.z); L.m.rotation.y = .6 + Math.sin(t * .2) * .1; }
    for (const r of turbines) r.rotation.y = t * 2.2;
    walkers.forEach((w, i) => { if (w.kind === 'line') { const s = ((t * w.sp + w.ph * 20) % (2 * w.len)); const u = s < w.len ? s : 2 * w.len - s; const z = w.z + w.dir * (u - w.len / 2); people.place(i, w.x + Math.sin(z * .05) * 1.5, .5, z, (s < w.len) === (w.dir > 0) ? 0 : Math.PI, 1, w.ph); }
      else { const a = w.a + t * w.sp; people.place(i, w.c.x + Math.cos(a) * w.r, .4, w.c.z + Math.sin(a) * w.r, -a + (w.sp > 0 ? Math.PI : 0), 1, w.ph); } }); people.commit(t);
    for (let i = 0; i < 72; i++) { const k = i % 12, ring = Math.floor(i / 12); const q = ((t * .7 + i * .137) % 1); const a = k / 12 * Math.PI * 2 + ring * .26; const rad = 3 + ring * 1.6;
      jets.set(i, FT.x + Math.cos(a) * rad * (1 - q * .4), 1 + Math.sin(q * Math.PI) * (6 - ring * .5), FT.z + Math.sin(a) * rad * (1 - q * .4), 1.6 + q * 2.4, 1, 1, 1, (1 - q) * .8); } jets.commit();
    return { flash: 0 };
  }

  const anchors = { river: new V3(riverX(-420), 4, -420), vertiport: new V3(VP.x, 34, VP.z), greenbridge: new V3(riverX(-130), 10, -130), leveque: new V3(LQ.x, 120, LQ.z), fountain: new V3(FT.x, 4, FT.z),
    canyon: new V3(-62, 40, -10), transit: new V3(-20, 2, 0), statehouse: new V3(SH.x, 30, SH.z), roofs: new V3(230, 45, -130), microgrid: new V3(MG.x, 8, MG.z), timber: new V3(300, 70, -195),
    solarpark: new V3(SC.x, 6, SC.z), bikes: new V3(-120, 1, -60), rhodes: new V3(RH.x, 150, RH.z), downtown: new V3(60, 60, 0), cosi: new V3(riverX(40) - RIVER_HW - 150, 16, 40) };
  const telescope = [
    { t0: -9, t1: 8, name: 'SCIOTO RIVER', fact: 'FREE-FLOWING THROUGH DOWNTOWN · GREENWAYS 2015', at: anchors.river, size: 220 },
    { t0: 8, t1: 12.5, name: 'ROOFTOP VERTIPORT', fact: '2050 CONCEPT · ELECTRIC AIR TAXIS', at: anchors.vertiport, size: 90 },
    { t0: 12.5, t1: 16, name: 'GREEN BRIDGE', fact: '2050 CONCEPT · WALK · BIKE · SHADE', at: anchors.greenbridge, size: 90 },
    { t0: 16, t1: 21, name: 'LEVEQUE TOWER', fact: 'OPENED 1927 · 555 FT', at: anchors.leveque, size: 120 },
    { t0: 21, t1: 25, name: 'SCIOTO MILE', fact: 'RIVERFRONT PARKS · OPENED 2011', at: anchors.fountain, size: 70 },
    { t0: 25, t1: 30, name: 'BROAD STREET TRANSIT', fact: '2050 CONCEPT · RAPID TRANSIT', at: new V3(220, 2, 0), size: 70 },
    { t0: 30, t1: 34, name: 'OHIO STATEHOUSE', fact: 'COMPLETED 1861', at: anchors.statehouse, size: 110 },
    { t0: 34, t1: 38.5, name: 'MASS-TIMBER TOWERS', fact: '2050 CONCEPT · WOOD STORES CARBON', at: anchors.timber, size: 150 },
    { t0: 38.5, t1: 60, name: 'COLUMBUS 2050', fact: 'ONE POSSIBLE FUTURE · AN ARTISTIC SCENARIO', at: anchors.downtown, size: 1400 } ];
  return { id: 'columbus-2050', group, path, update, anchors, telescope, colliders, blockRoof: { color: '#5e9450', mix: .8 } };
}

/* ---------------- facade textures (canvas; one tile = tw × th metres) ---------------- */
function canvasPair(W, H, draw) { const a = document.createElement('canvas'), b = document.createElement('canvas'); a.width = b.width = W; a.height = b.height = H; draw(a.getContext('2d'), b.getContext('2d'), W, H);
  const mk = (c, srgb) => { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }; return { map: mk(a, true), emi: mk(b, true) }; }
function makeTextures() {
  const glass = canvasPair(256, 256, (x, e, W, H) => { const r = rng(5); x.fillStyle = '#5d7489'; x.fillRect(0, 0, W, H); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const k = r(); const g = x.createLinearGradient(0, j * 64, 0, j * 64 + 60); g.addColorStop(0, `rgb(${120 + k * 40},${150 + k * 40},${175 + k * 40})`); g.addColorStop(1, `rgb(${70 + k * 30},${95 + k * 30},${120 + k * 30})`); x.fillStyle = g; x.fillRect(i * 64 + 3, j * 64 + 4, 58, 56); if (k > .86) { e.fillStyle = 'rgba(255,236,200,.55)'; e.fillRect(i * 64 + 3, j * 64 + 4, 58, 56); } }
    x.fillStyle = '#d7dee5'; for (let i = 0; i <= 4; i++) { x.fillRect(i * 64 - 2, 0, 4, H); x.fillRect(0, i * 64 - 2, W, 4); } });
  const timber = canvasPair(256, 256, (x, e, W, H) => { const r = rng(8); x.fillStyle = '#c99a62'; x.fillRect(0, 0, W, H); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
    for (let i = 0; i < W; i += 8) { const v = r(); x.fillStyle = `rgba(${120 + v * 60},${80 + v * 40},${40 + v * 20},.35)`; x.fillRect(i, 0, 3, H); }
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { x.fillStyle = '#2d3a44'; x.fillRect(i * 128 + 18, j * 128 + 20, 92, 82); x.fillStyle = 'rgba(160,200,230,.35)'; x.fillRect(i * 128 + 18, j * 128 + 20, 92, 30); if (r() > .7) { e.fillStyle = 'rgba(255,220,170,.6)'; e.fillRect(i * 128 + 18, j * 128 + 20, 92, 82); } }
    x.fillStyle = '#9a6e3e'; x.fillRect(0, 118, W, 10); x.fillRect(0, 246, W, 10); });
  const rib = canvasPair(256, 256, (x, e, W, H) => { const r = rng(9); x.fillStyle = '#4b5560'; x.fillRect(0, 0, W, H); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = '#26303a'; x.fillRect(i * 32 + 9, j * 32 + 6, 14, 22); if (r() > .88) { e.fillStyle = 'rgba(255,230,190,.55)'; e.fillRect(i * 32 + 9, j * 32 + 6, 14, 22); } }
    x.fillStyle = '#c5ccd3'; for (let i = 0; i < 8; i++) x.fillRect(i * 32 + 1, 0, 6, H); });
  return { glass, timber, rib, deco: decoTex(11, '#d8cdb4'), brick: brickTex(12), leveque: decoTex(13, '#e9dfc9'), solar: (() => { const t = solarTex(); t.repeat.set(1, 1); return t; })() };
}
