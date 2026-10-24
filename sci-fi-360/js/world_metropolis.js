/* WORLD 3 · METROPOLIS (1927) — a monumental Art Deco city: towers above, machines and workers below. */
import * as THREE from 'three';
import { V3, Col, lerp, clamp, smooth, sstep, win, rng, FlightPath, Builder, boxGeo, cylGeo, beamGeo, cylBetween, decoTex, SpriteField, puffTex, dotTex, People, Movers, mat4 } from './lib.js';

export function buildMetropolis(ctx) {
  const group = new THREE.Group(); group.name = 'metropolis';
  const path = new FlightPath([[76, 0, 120, 900], [83, 0, 112, 760], [89, -14, 108, 610], [95, -4, 106, 460], [101, 8, 104, 310], [107, 0, 104, 160], [113, -6, 130, 20], [118, -8, 205, -90], [124, -8, 335, -180]]);
  const r = rng(1927); const lat = (t, l, up = 0) => path.beside(t, l, up);
  const dt1 = decoTex(4, '#ddd3bd'), dt2 = decoTex(8, '#c9cdd2'), dt3 = decoTex(12, '#c7b49a');
  const mk = (d) => ctx.mat('#ffffff', { map: d.map, emissiveMap: d.emi, emissive: '#ffffff', emissiveIntensity: .55, roughness: .7, metalness: .1, vertexColors: true, envMapIntensity: .55 });
  const deco1 = mk(dt1), deco2 = mk(dt2), deco3 = mk(dt3);
  const metal = ctx.mat('#ffffff', { roughness: .35, metalness: .85, vertexColors: true, envMapIntensity: .9 });
  const stoneM = ctx.mat('#ffffff', { roughness: .85, vertexColors: true, envMapIntensity: .3 });
  const bronze = ctx.mat('#8a6a3e', { roughness: .4, metalness: .85, envMapIntensity: 1.1 });
  const gold = ctx.mat('#e2b85a', { roughness: .25, metalness: 1, envMapIntensity: 1.3, emissive: '#5a3a10', emissiveIntensity: .4 });
  const glowW = new THREE.MeshBasicMaterial({ color: new Col('#fff1cc').multiplyScalar(2.2) }), glowR = new THREE.MeshBasicMaterial({ color: new Col('#ff5a4a').multiplyScalar(2.5) });
  /* streets */
  { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#5d5a55'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#7a756c'; x.fillRect(36, 36, 184, 184); x.fillStyle = '#8c867b'; x.fillRect(46, 46, 164, 164);
    x.fillStyle = '#d8cc9a'; for (let i = 0; i < 256; i += 24) { x.fillRect(i + 4, 16, 12, 3); x.fillRect(16, i + 4, 3, 12); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.repeat.set(120, 120);
    const g = new THREE.Mesh(new THREE.PlaneGeometry(7000, 7000).rotateX(-Math.PI / 2), ctx.mat('#ffffff', { map: t, roughness: 1, envMapIntensity: .2 })); g.position.z = 200; group.add(g); }
  const B = new Builder(); const placed = []; const free = (x, z, rad) => placed.every(p => (p[0] - x) ** 2 + (p[1] - z) ** 2 > (p[2] + rad) ** 2);
  const PAL = ['#efe6d2', '#d9d2c4', '#c9ccd2', '#e6dccb', '#b9b4ac', '#d7c4a4', '#aeb6c2'];
  /* stepped Art Deco skyscraper */
  function tower(x, z, w, d, h, yaw, opts = {}) { const key = opts.key || ['deco1', 'deco2', 'deco3'][Math.floor(r() * 3)], c = opts.c || PAL[Math.floor(r() * PAL.length)];
    const tiers = opts.tiers || [[1, 1, .52], [.78, .78, .24], [.56, .56, .14], [.36, .36, .1]]; let y = 0;
    for (const [sw, sd, sh] of tiers) { const tw = w * sw, td = d * sd, th = h * sh; B.add(key, boxGeo(tw, th, td, 8, 16), [x, y, z], [0, yaw, 0], null, c);
      // vertical piers on the long faces
      const n = Math.max(2, Math.round(tw / 9)); const ax = new V3(Math.cos(yaw), 0, -Math.sin(yaw)), fw = new V3(-Math.sin(yaw), 0, -Math.cos(yaw));
      for (let i = 0; i <= n; i++) { const o = -tw / 2 + i * tw / n; for (const s of [-1, 1]) { const p = new V3(x, 0, z).addScaledVector(ax, o).addScaledVector(fw, s * (td / 2 + .4)); B.add('stone', boxGeo(1.4, th + 2.5, 1, 4, 4), [p.x, y, p.z], [0, yaw, 0], null, c); } }
      B.add('stone', boxGeo(tw + 2, 1.6, td + 2), [x, y + th, z], [0, yaw, 0], null, '#a89c86'); y += th + 1.6; }
    const top = y; if (opts.spire !== false) { const sp = h * (.12 + r() * .1); B.add('metal', new THREE.ConeGeometry(w * .1, sp, 8).translate(0, sp / 2, 0), [x, top, z], null, null, '#d8d8dc'); B.add('red', new THREE.SphereGeometry(1.2, 8, 6), [x, top + sp, z]); }
    // crown fins
    if (opts.fins !== false) for (let k = 0; k < 4; k++) { const a = yaw + k * Math.PI / 2; const fx = x + Math.sin(a) * w * .2, fz = z + Math.cos(a) * w * .2; B.add('gold', boxGeo(1.2, h * .07, w * .12), [fx, top - h * .06, fz], [0, a, 0]); }
    return top; }
  /* ---- avenue hero towers on both sides ---- */
  for (let t = 74; t <= 126; t += 1.35) for (const side of [-1, 1]) { if (r() < .12) continue; const w = 34 + r() * 26, d = 30 + r() * 24; const l = side * (58 + w / 2 + r() * 18); const p = lat(t, l);
    if (t > 98.5 && t < 102.5) continue; // statue plaza
    if (side > 0 && t > 86 && t < 94) continue; // machine hall
    if (!free(p.x, p.z, w * .6)) continue; const h = 140 + r() * 230 + (Math.abs(t - 100) < 12 ? 60 : 0); tower(p.x, p.z, w, d, h, path.yaw(t)); placed.push([p.x, p.z, w * .6]); }
  /* ---- the central tower: end of the avenue, the ship climbs past it ---- */
  const CT = new V3(96, 0, -130); { const yaw = -Math.PI / 2; placed.push([CT.x, CT.z, 110]);
    const top = tower(CT.x, CT.z, 96, 96, 610, yaw, { key: 'deco1', c: '#e9e1cf', tiers: [[1, 1, .3], [.82, .82, .22], [.64, .64, .18], [.46, .46, .14], [.3, .3, .1]], spire: false });
    B.add('metal', new THREE.ConeGeometry(9, 90, 8).translate(0, 45, 0), [CT.x, top, CT.z], null, null, '#e8e8ea'); B.add('red', new THREE.SphereGeometry(2.2, 10, 8), [CT.x, top + 90, CT.z]);
    for (let k = 0; k < 4; k++) { const a = yaw + k * Math.PI / 2 + Math.PI / 4; B.add('gold', boxGeo(3, 110, 3), [CT.x + Math.sin(a) * 38, top - 30, CT.z + Math.cos(a) * 38], [0, a, 0]); B.add('gold', new THREE.ConeGeometry(2.4, 26, 6).translate(0, 13, 0), [CT.x + Math.sin(a) * 38, top + 80, CT.z + Math.cos(a) * 38]); } }
  // sunburst emblem on the tower face toward the path
  const emblem = new THREE.Group(); emblem.position.set(CT.x - 41.6, 252, CT.z); emblem.rotation.y = -Math.PI / 2; group.add(emblem); const emGlow = new THREE.MeshBasicMaterial({ color: new Col('#fff1cc').multiplyScalar(2) });
  { const em = new THREE.Mesh(new THREE.CircleGeometry(26, 48), gold); emblem.add(em); const inner = new THREE.Mesh(new THREE.RingGeometry(8, 12, 48), emGlow); inner.position.z = .3; emblem.add(inner);
    for (let k = 0; k < 24; k++) { const ray = new THREE.Mesh(new THREE.BoxGeometry(1.4, 22, .6), k % 2 ? gold : bronze); const a = k / 24 * Math.PI * 2; ray.position.set(Math.cos(a) * 38, Math.sin(a) * 38, .2); ray.rotation.z = a - Math.PI / 2; emblem.add(ray); }
    for (let k = 0; k < 8; k++) { const tooth = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 1.2), bronze); const a = k / 8 * Math.PI * 2; tooth.position.set(Math.cos(a) * 14.5, Math.sin(a) * 14.5, .5); tooth.rotation.z = a; emblem.add(tooth); } }
  /* ---- two colossal statues flanking the plaza (t ≈ 100.5) ---- */
  const statues = []; for (const side of [-1, 1]) { const t = 100.5, p = lat(t, side * 54); const yaw = path.yaw(t) + (side < 0 ? -Math.PI / 2 : Math.PI / 2) + Math.PI; placed.push([p.x, p.z, 30]);
    B.add('stone', boxGeo(26, 34, 26, 6, 6), [p.x, 0, p.z], [0, yaw, 0], null, '#cfc5b0'); B.add('stone', boxGeo(30, 4, 30), [p.x, 34, p.z], [0, yaw, 0], null, '#b4a88f'); B.add('gold', boxGeo(26.4, 1.2, 26.4), [p.x, 20, p.z], [0, yaw, 0]);
    const s = makeColossus(bronze, gold, side); s.position.set(p.x, 38, p.z); s.rotation.y = yaw; s.scale.setScalar(1); group.add(s); statues.push(s); }
  /* ---- the machine hall (right, t ≈ 90): open to the avenue, giant flywheels inside ---- */
  const MH = lat(90, 82); const mhYaw = path.yaw(90); placed.push([MH.x, MH.z, 70]);
  const mhAx = new V3(Math.cos(mhYaw), 0, -Math.sin(mhYaw)), mhFw = new V3(-Math.sin(mhYaw), 0, -Math.cos(mhYaw));
  { const W = 110, D = 62, Hh = 66; const back = MH.clone().addScaledVector(mhAx, D / 2); B.add('deco3', boxGeo(W, Hh, 6, 8, 16), [back.x, 0, back.z], [0, mhYaw + Math.PI / 2, 0], null, '#9a8f80');
    for (const s of [-1, 1]) { const q = MH.clone().addScaledVector(mhFw, s * W / 2); B.add('deco3', boxGeo(6, Hh, D, 8, 16), [q.x, 0, q.z], [0, mhYaw + Math.PI / 2, 0], null, '#9a8f80'); const tw = MH.clone().addScaledVector(mhFw, s * (W / 2 + 6)).addScaledVector(mhAx, -D / 2 + 4); tower(tw.x, tw.z, 16, 16, 120, mhYaw, { tiers: [[1, 1, .7], [.7, .7, .2]], c: '#8f857a' }); }
    for (let k = 0; k <= 6; k++) { const q = MH.clone().addScaledVector(mhFw, -W / 2 + k * W / 6); q.y = Hh; B.addM('metal', cylBetween(q.clone().addScaledVector(mhAx, -D / 2), q.clone().addScaledVector(mhAx, D / 2), 1.1, 6), new THREE.Matrix4(), '#3a3632'); }
    const fl = MH.clone(); B.add('stone', boxGeo(W, 1, D), [fl.x, 0, fl.z], [0, mhYaw + Math.PI / 2, 0], null, '#2a2420');
    const furn = MH.clone().addScaledVector(mhAx, D / 2 - 4); B.add('furnace', new THREE.PlaneGeometry(W * .8, 26), [furn.x, 14, furn.z], [0, mhYaw - Math.PI / 2, 0]); }
  const furnace = new THREE.MeshBasicMaterial({ color: new Col('#ff8a30').multiplyScalar(2.4), side: THREE.DoubleSide });
  const wheels = []; for (const k of [-32, 0, 32]) { const g = new THREE.Group(); const p = MH.clone().addScaledVector(mhFw, k).addScaledVector(mhAx, 6); g.position.set(p.x, 30, p.z); g.rotation.y = mhYaw + Math.PI / 2; group.add(g);
    const wh = new THREE.Group(); g.add(wh); wh.add(new THREE.Mesh(new THREE.TorusGeometry(22, 2.4, 12, 48), metal)); for (let i = 0; i < 8; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(1.6, 44, 1.6), metal); sp.rotation.z = i * Math.PI / 8; wh.add(sp); }
    wh.add(new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 6, 16).rotateX(Math.PI / 2), gold)); for (let i = 0; i < 32; i++) { const tth = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3, 3), metal); const a = i / 32 * Math.PI * 2; tth.position.set(Math.cos(a) * 24.5, Math.sin(a) * 24.5, 0); tth.rotation.z = a; wh.add(tth); }
    const piston = new THREE.Mesh(new THREE.BoxGeometry(3, 30, 3), gold); g.add(piston); wheels.push({ wh, piston, dir: k === 0 ? -1 : 1 }); }
  /* ---- elevated highways along the avenue + crossing bridges ---- */
  const HW = [{ l: -30, y: 64 }, { l: 30, y: 64 }, { l: -36, y: 34 }, { l: 36, y: 34 }];
  for (const h of HW) for (let t = 70; t < 128; t += .5) { const a = lat(t, h.l), b = lat(t + .5, h.l); const m = a.clone().lerp(b, .5); const yw = Math.atan2(-(b.x - a.x), -(b.z - a.z));
    B.add('stone', boxGeo(14, 2, a.distanceTo(b) + .3, 4, 4), [m.x, h.y - 2, m.z], [0, yw, 0], null, '#bdb3a0'); for (const s of [-1, 1]) { const q = m.clone().add(new V3(Math.cos(yw) * 7 * s, 0, -Math.sin(yw) * 7 * s)); B.add('stone', boxGeo(.6, 1.2, a.distanceTo(b) + .3), [q.x, h.y, q.z], [0, yw, 0], null, '#d8cfbd'); }
    if (Math.round(t * 2) % 6 === 0) B.add('stone', boxGeo(4, h.y - 2, 4, 4, 8), [m.x, 0, m.z], null, null, '#a89c86'); if (Math.round(t * 2) % 4 === 0) { const q = m.clone().add(new V3(Math.cos(yw) * 7, 0, -Math.sin(yw) * 7)); B.add('metal', cylGeo(.15, .2, 6, 5), [q.x, h.y, q.z], null, null, '#333'); B.add('glowW', new THREE.SphereGeometry(.6, 8, 6), [q.x, h.y + 6, q.z]); } }
  const cross = [{ t: 92.5, up: -20 }, { t: 106, up: 22 }, { t: 85, up: -45 }, { t: 110, up: -40 }];
  const crossLanes = [];
  for (const c of cross) { const p = path.pos(c.t), yw = path.yaw(c.t), y = p.y + c.up; const ax = new V3(Math.cos(yw), 0, -Math.sin(yw)); const A = p.clone().addScaledVector(ax, -260), Bp = p.clone().addScaledVector(ax, 260); A.y = Bp.y = y; const m = p.clone(); m.y = y;
    B.add('stone', boxGeo(520, 3, 16, 6, 4), [m.x, y - 3, m.z], [0, yw, 0], null, '#c9bfab'); for (const s of [-1, 1]) { const q = m.clone().addScaledVector(new V3(-Math.sin(yw), 0, -Math.cos(yw)), 8 * s); B.add('gold', boxGeo(520, 1, .5), [q.x, y, q.z], [0, yw, 0]); }
    for (let k = -4; k <= 4; k++) { if (Math.abs(k) < 1) continue; const q = m.clone().addScaledVector(ax, k * 62); B.add('stone', boxGeo(6, y - 3, 8, 4, 8), [q.x, 0, q.z], [0, yw, 0], null, '#b4a88f'); }
    if (c.up > 0) for (let k = -12; k <= 12; k++) { const q = m.clone().addScaledVector(ax, k * 9); B.add('glowW', new THREE.BoxGeometry(1.4, .3, 1.4), [q.x, y - 3.2, q.z]); }
    const off = new V3(-Math.sin(yw), 0, -Math.cos(yw)); crossLanes.push({ a: A.clone().addScaledVector(off, 3.5).setY(y + .6), b: Bp.clone().addScaledVector(off, 3.5).setY(y + .6), speed: 26, n: 14 }, { a: Bp.clone().addScaledVector(off, -3.5).setY(y + .6), b: A.clone().addScaledVector(off, -3.5).setY(y + .6), speed: 24, n: 14 }); }
  /* ---- background city (the original skyship's instanced block shader) ---- */
  const blocks = []; { const br = rng(77); for (let i = 0; i < 2600 && blocks.length < 1500; i++) { const x = (br() - .5) * 5200, z = 200 + (br() - .5) * 5200; let near = 1e9; for (let t = 70; t <= 130; t += 3) { const p = path.pos(t); near = Math.min(near, Math.hypot(p.x - x, p.z - z)); } if (near < 150) continue;
      const w = 24 + br() * 26, d = 24 + br() * 26; const far = Math.min(1, near / 1600); const h = (60 + br() * 220) * (1.2 - far * .6) * (br() < .12 ? 1.8 : 1); blocks.push({ x, z, w, d, h, y: 0, c: PAL[Math.floor(br() * PAL.length)], s: br() * 100 });
      if (h > 140) blocks.push({ x, z, w: w * .7, d: d * .7, h: h * .25, y: h, c: PAL[Math.floor(br() * PAL.length)], s: br() * 100 }); if (h > 200) blocks.push({ x, z, w: w * .4, d: d * .4, h: h * .14, y: h * 1.25, c: '#d8d0c0', s: br() * 100 }); } }
  group.add(ctx.makeBlocks(blocks));
  B.build({ deco1, deco2, deco3, stone: stoneM, metal, gold, red: glowR, glowW, furnace }, group);
  /* ---- traffic on the avenue highways (path-following) ---- */
  const carGeo = (() => { const b = new Builder(); b.add('c', new THREE.BoxGeometry(2, 1, 4.6), [0, .7, 0]); b.add('c', new THREE.BoxGeometry(1.7, .7, 2.2), [0, 1.5, .3]); b.add('c', new THREE.CylinderGeometry(.42, .42, 2.1, 8).rotateZ(Math.PI / 2), [0, .42, -1.5]); b.add('c', new THREE.CylinderGeometry(.42, .42, 2.1, 8).rotateZ(Math.PI / 2), [0, .42, 1.5]); return b.build({ c: null }).c.geometry; })();
  const carMat = ctx.mat('#ffffff', { roughness: .3, metalness: .6, envMapIntensity: 1 });
  const CAR_COLS = ['#1a1a1c', '#7a1f1f', '#2a3a5a', '#d8d2c0', '#3a4a3a', '#8a6a3a', '#b02a20', '#2a2a30'];
  const avenueCars = []; for (const h of HW) for (const dir of [-1, 1]) for (let i = 0; i < 26; i++) avenueCars.push({ h, dir, off: i / 26 * 60 + r() * 1.5, lane: h.l + dir * 3.5, sp: .5 + r() * .25, col: CAR_COLS[Math.floor(r() * CAR_COLS.length)] });
  for (const dir of [-1, 1]) for (let i = 0; i < 40; i++) avenueCars.push({ h: { l: 0, y: 0 }, dir, off: i / 40 * 60 + r(), lane: dir * (4 + (i % 2) * 3.4), sp: .3 + r() * .2, col: CAR_COLS[Math.floor(r() * CAR_COLS.length)] });
  const cars = new THREE.InstancedMesh(carGeo, carMat, avenueCars.length); cars.frustumCulled = false; cars.instanceMatrix.setUsage(THREE.DynamicDrawUsage); avenueCars.forEach((c, i) => cars.setColorAt(i, new Col(c.col))); group.add(cars);
  const crossCars = new Movers(carGeo, carMat, crossLanes.map(l => ({ ...l, colors: CAR_COLS })), 14, 9); group.add(crossCars.mesh);
  /* ---- flying cars + airships ---- */
  const flyGeo = (() => { const b = new Builder(); b.add('c', new THREE.SphereGeometry(1, 16, 10), [0, 0, 0], null, [1.3, .8, 3.4]); b.add('c', new THREE.BoxGeometry(5.8, .2, 1.6), [0, 0, 1.2]); b.add('c', new THREE.BoxGeometry(.2, 1.6, 1.4), [0, .9, 2.6]); b.add('c', new THREE.SphereGeometry(.7, 10, 8), [0, .55, -.6], null, [1, .7, 1.6]); return b.build({ c: null }).c.geometry; })();
  const flyMat = ctx.mat('#ffffff', { roughness: .25, metalness: .8, envMapIntensity: 1.2 });
  const flyLanes = []; { const fr = rng(31); for (let i = 0; i < 16; i++) { const t = 78 + fr() * 44; const p = path.pos(t); const yw = path.yaw(t); const along = fr() < .55; const side = fr() < .5 ? -1 : 1; let a, b;
      if (along) { const l = side * (26 + fr() * 30); a = lat(t - 8, l); b = lat(t + 8, l); if (fr() < .5) [a, b] = [b, a]; const y = p.y + (fr() < .5 ? -1 : 1) * (14 + fr() * 50); a.y = b.y = y; }
      else { const ax = new V3(Math.cos(yw + (fr() - .5) * .8), 0, -Math.sin(yw + (fr() - .5) * .8)); const y = p.y + (fr() < .5 ? -1 : 1) * (22 + fr() * 70); a = p.clone().addScaledVector(ax, -500); b = p.clone().addScaledVector(ax, 500); if (fr() < .5) [a, b] = [b, a]; a.y = b.y = y; }
      flyLanes.push({ a, b, speed: 30 + fr() * 25, n: 5, bob: 1.5, colors: ['#e8e2d4', '#c33a2a', '#d9a73a', '#2e3a4e', '#f2f2f2'] }); } }
  const flyers = new Movers(flyGeo, flyMat, flyLanes, 5, 12); group.add(flyers.mesh);
  const airships = []; { const env = ctx.mat('#d9d4c8', { roughness: .5, metalness: .3, envMapIntensity: .8 }), gond = ctx.mat('#3a3530', { roughness: .5, metalness: .5 }); const ar = rng(55);
    for (let i = 0; i < 7; i++) { const g = new THREE.Group(); const L = 60 + ar() * 50; const hullM = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), env); hullM.scale.set(L * .16, L * .16, L * .5); g.add(hullM);
      const gm = new THREE.Mesh(new THREE.BoxGeometry(L * .06, L * .05, L * .22), gond); gm.position.y = -L * .17; g.add(gm); const lights = new THREE.Mesh(new THREE.BoxGeometry(L * .061, L * .012, L * .2), glowW); lights.position.y = -L * .16; g.add(lights);
      for (let k = 0; k < 4; k++) { const fin = new THREE.Mesh(new THREE.BoxGeometry(.6, L * .14, L * .1), env); const a = k * Math.PI / 2; fin.position.set(Math.cos(a) * L * .08, Math.sin(a) * L * .08, L * .42); fin.rotation.z = a; g.add(fin); }
      for (let k = 0; k < 3; k++) { const band = new THREE.Mesh(new THREE.TorusGeometry(L * .16, .5, 6, 32), gond); band.position.z = (k - 1) * L * .18; band.scale.set(1 - Math.abs(k - 1) * .05, 1 - Math.abs(k - 1) * .05, 1); g.add(band); }
      const t = 80 + i * 6.5 + ar() * 3; const side = i % 2 ? -1 : 1; const p = lat(t, side * (90 + ar() * 160)); p.y = 190 + ar() * 150; g.position.copy(p); g.userData = { p0: p.clone(), yaw: path.yaw(t) + (ar() - .5) * 1.2, sp: 4 + ar() * 4 }; g.rotation.y = g.userData.yaw; group.add(g); airships.push(g); } }
  /* ---- searchlights sweeping from the central tower ---- */
  const beamMat = new THREE.MeshBasicMaterial({ color: new Col('#fff2cf').multiplyScalar(.5), transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const beams = []; for (let k = 0; k < 4; k++) { const g = new THREE.Group(); g.position.set(CT.x, 560, CT.z); const m = new THREE.Mesh(new THREE.ConeGeometry(40, 900, 24, 1, true).rotateX(Math.PI).translate(0, 450, 0), beamMat); g.add(m); group.add(g); beams.push(g); }
  /* ---- crowds below + workers marching into the machine hall ---- */
  const N_SIDE = 520, N_SHIFT = 120; const people = new People(N_SIDE + N_SHIFT, { skin: '#d8b496', stride: 7.5, envMats: ctx.envMats });
  const crowd = []; { const cr = rng(13); for (let i = 0; i < N_SIDE; i++) { const side = cr() < .5 ? -1 : 1; crowd.push({ l: side * (16 + cr() * 7), off: cr() * 60, dir: cr() < .5 ? -1 : 1, sp: .055 + cr() * .03, ph: cr() * 6 }); people.color(i, ['#4a3f3a', '#2c2c30', '#6a5a4a', '#3a4450', '#7a6f60', '#2a2622'][Math.floor(cr() * 6)]); } }
  for (let i = 0; i < N_SHIFT; i++) people.color(N_SIDE + i, '#30353d');
  group.add(people.mesh);
  /* ---- haze + steam from the machine hall ---- */
  const haze = new SpriteField(70, { map: puffTex(61), color: '#e8dcc0', opacity: .5 }); group.add(haze.mesh);
  const hz = []; { const hr = rng(3); for (let i = 0; i < 70; i++) { if (i < 18) { hz.push({ p: MH.clone().add(new V3((hr() - .5) * 90, 40 + hr() * 30, (hr() - .5) * 60)), s: 30 + hr() * 30, steam: 1, ph: hr() }); } else { const t = 74 + hr() * 56; hz.push({ p: lat(t, (hr() < .5 ? -1 : 1) * (60 + hr() * 300), -hr() * 90), s: 70 + hr() * 90, steam: 0, ph: hr() }); } } }
  const _p = new V3(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new V3(1, 1, 1);
  function update(t, C) {
    // avenue traffic
    avenueCars.forEach((c, i) => { const span = 60; let s = ((c.off + t * c.sp * c.dir) % span + span) % span; const tt = 70 + s; _p.copy(lat(tt, c.lane)); _p.y = c.h.y + (c.h.y ? .2 : .1); const yw = path.yaw(tt) + (c.dir > 0 ? 0 : Math.PI);
      const edge = Math.min(1, s / 1.5, (span - s) / 1.5); _m.compose(_p, _q.setFromEuler(_e.set(0, yw, 0)), _s.setScalar(Math.max(.001, edge))); cars.setMatrixAt(i, _m); }); cars.instanceMatrix.needsUpdate = true;
    crossCars.update(t); flyers.update(t);
    airships.forEach(g => { const u = g.userData; g.position.copy(u.p0).add(new V3(-Math.sin(u.yaw) * u.sp * (t - 100), Math.sin(t * .2 + u.p0.x) * 2, -Math.cos(u.yaw) * u.sp * (t - 100))); });
    // machine
    wheels.forEach((w, i) => { w.wh.rotation.z = t * .35 * w.dir; const a = t * .35 * w.dir; w.piston.position.set(Math.cos(a) * 12 - 30, Math.sin(a) * 12, 4); w.piston.rotation.z = Math.PI / 2 + Math.sin(a) * .25; });
    beams.forEach((b, k) => { b.rotation.set(.45 + Math.sin(t * .3 + k * 1.7) * .2, t * .15 + k * Math.PI / 2, 0, 'YXZ'); });
    emGlow.color.setRGB(1, .94, .8).multiplyScalar(1.6 + Math.sin(t * 2) * .4);
    statues.forEach((s, i) => s.userData.update?.(t));
    // people
    crowd.forEach((c, i) => { const span = 60; const s = ((c.off + t * c.sp * c.dir) % span + span) % span; const tt = 70 + s; _p.copy(lat(tt, c.l)); people.place(i, _p.x, 0, _p.z, path.yaw(tt) + (c.dir > 0 ? Math.PI : 0), 1, c.ph, 1); });
    for (let i = 0; i < N_SHIFT; i++) { const col = i % 4, row = Math.floor(i / 4); const u = ((row / 30) + t * .022) % 1; const p = MH.clone().addScaledVector(mhFw, (col - 1.5) * 1.6 - 20).addScaledVector(mhAx, lerp(-80, 26, u)); people.place(N_SIDE + i, p.x, 0, p.z, mhYaw - Math.PI / 2 + Math.PI, 1, 0, 1); }
    people.commit(t);
    hz.forEach((h, i) => { const q = h.steam ? (t * .08 + h.ph) % 1 : 0; haze.set(i, h.p.x + Math.sin(t * .05 + i) * 10, h.p.y + q * 50, h.p.z, h.s * (1 + q), 1, 1, 1, h.steam ? (1 - q) * .8 : .55); }); haze.commit(); haze.fog(C.fog);
    return { flash: 0 };
  }
  const anchors = { avenue: lat(96, 0, 40), machine: MH.clone().add(new V3(0, 30, 0)), statueL: statues[0].localToWorld(new V3(0, 60, 0)), statueR: statues[1].localToWorld(new V3(0, 60, 0)), tower: new V3(CT.x - 40, 252, CT.z), bridge: path.pos(106).add(new V3(0, 20, 0)), flyers: lat(88, 30, 10), below: lat(96, 0, -100) };
  group.updateMatrixWorld(true); anchors.statueL = statues[0].localToWorld(new V3(0, 62, 0)); anchors.statueR = statues[1].localToWorld(new V3(0, 62, 0));
  const telescope = [
    { t0: 70, t1: 87, name: 'METROPOLIS', fact: 'TOWERS FOR THE FEW · MACHINES FOR THE MANY', at: anchors.tower, size: 420 },
    { t0: 87, t1: 96, name: 'THE MACHINE HALLS', fact: 'WORKERS MARCH IN SHIFTS BELOW THE CITY', at: anchors.machine, size: 120 },
    { t0: 96, t1: 108, name: 'COLOSSUS OF LABOR', fact: '"HEAD AND HANDS NEED A MEDIATOR"', at: anchors.statueR, size: 60 },
    { t0: 108, t1: 130, name: 'THE CENTRAL TOWER', fact: 'THE CITY\'S BRAIN · 610 M OF STONE AND STEEL', at: anchors.tower, size: 180 } ];
  return { id: 'metropolis', group, path, update, anchors, telescope };
}

/* stylised Art Deco colossus, ~62 m tall, one arm raising a gear-sun */
function makeColossus(bronze, gold, side) {
  const g = new THREE.Group(); const M = (geo, m, p, r, s) => { const o = new THREE.Mesh(geo, m); if (p) o.position.set(...p); if (r) o.rotation.set(...r); if (s) o.scale.set(...s); g.add(o); return o; };
  M(new THREE.CylinderGeometry(7, 9.5, 26, 8), bronze, [0, 13, 0]);             // robe / legs block
  for (let k = 0; k < 8; k++) M(new THREE.BoxGeometry(1, 26, 1.2), gold, [Math.cos(k / 8 * Math.PI * 2) * 8.2, 13, Math.sin(k / 8 * Math.PI * 2) * 8.2], [0, -k / 8 * Math.PI * 2, 0]);
  M(new THREE.BoxGeometry(15, 16, 9), bronze, [0, 34, 0]);                      // torso
  M(new THREE.BoxGeometry(19, 3.4, 10), bronze, [0, 41.5, 0]);                  // shoulders
  M(new THREE.BoxGeometry(7, 2, 9.4), gold, [0, 30, 0]);                        // belt
  M(new THREE.CylinderGeometry(2.4, 2.8, 3, 8), bronze, [0, 44.5, 0]);
  const head = M(new THREE.BoxGeometry(6, 7.5, 6.4), bronze, [0, 50, 0]); M(new THREE.BoxGeometry(6.6, 1.4, 7), gold, [0, 52.5, 0]); M(new THREE.ConeGeometry(4.6, 4, 4), bronze, [0, 55.6, 0], [0, Math.PI / 4, 0]);
  const s = side; // raised arm on the avenue side
  const up = new THREE.Group(); up.position.set(9 * -s, 41, 0); g.add(up); up.rotation.z = 2.75 * -s;
  const ua = new THREE.Mesh(new THREE.BoxGeometry(4, 15, 4), bronze); ua.position.y = -7.5; up.add(ua); const fa = new THREE.Mesh(new THREE.BoxGeometry(3.6, 14, 3.6), bronze); fa.position.y = -21; up.add(fa);
  const gear = new THREE.Group(); gear.position.y = -31; up.add(gear); gear.add(new THREE.Mesh(new THREE.TorusGeometry(6, 1.3, 8, 24), gold)); for (let i = 0; i < 12; i++) { const tth = new THREE.Mesh(new THREE.BoxGeometry(2, 2.4, 2), gold); const a = i / 12 * Math.PI * 2; tth.position.set(Math.cos(a) * 7.4, Math.sin(a) * 7.4, 0); tth.rotation.z = a; gear.add(tth); }
  const core = new THREE.Mesh(new THREE.SphereGeometry(3.4, 16, 12), new THREE.MeshBasicMaterial({ color: new Col('#ffe2a0').multiplyScalar(2.2) })); gear.add(core);
  const dn = new THREE.Group(); dn.position.set(9 * s, 41, 0); g.add(dn); dn.rotation.z = .12 * s; const da = new THREE.Mesh(new THREE.BoxGeometry(4, 28, 4), bronze); da.position.y = -14; dn.add(da);
  const ham = new THREE.Mesh(new THREE.BoxGeometry(1.4, 22, 1.4), gold); ham.position.set(0, -24, 2); dn.add(ham); const hh = new THREE.Mesh(new THREE.BoxGeometry(7, 4, 4), bronze); hh.position.set(0, -35, 2); dn.add(hh);
  g.userData.update = t => { gear.rotation.z = t * .2 * s; };
  return g;
}
