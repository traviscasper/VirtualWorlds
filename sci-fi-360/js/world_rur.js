/* WORLD 2 · R.U.R. (1920) — Rossum's island factory at golden hour. Čapek's robots are made of
   synthetic living matter, so the workers here are human-shaped and identical, not metal machines. */
import * as THREE from 'three';
import { V3, Col, lerp, clamp, smooth, sstep, win, rng, fbm, FlightPath, Builder, boxGeo, cylGeo, beamGeo, cylBetween, brickTex, SpriteField, puffTex, dotTex, People, Movers, signTex, mat4 } from './lib.js';

export function buildRUR(ctx) {
  const group = new THREE.Group(); group.name = 'rur';
  const path = new FlightPath([[36, 0, 62, 720], [43, 0, 52, 580], [50, -6, 46, 440], [57, -10, 44, 300], [64, -4, 44, 160], [71, 6, 46, 20], [77, 8, 50, -110], [84, 4, 62, -250]]);
  const r = rng(1920);
  const bt = brickTex(3), bt2 = brickTex(9);
  const brick = ctx.mat('#ffffff', { map: bt.map, emissiveMap: bt.emi, emissive: '#ffffff', emissiveIntensity: 1.25, roughness: .9, vertexColors: true, envMapIntensity: .25 });
  const brick2 = ctx.mat('#ffffff', { map: bt2.map, emissiveMap: bt2.emi, emissive: '#ffffff', emissiveIntensity: 1.25, roughness: .9, vertexColors: true, envMapIntensity: .25 });
  const steel = ctx.mat('#ffffff', { roughness: .5, metalness: .7, vertexColors: true, envMapIntensity: .6 });
  const roof = ctx.mat('#4a3f3a', { roughness: .7, metalness: .3, envMapIntensity: .4, flatShading: true });
  const brass = ctx.mat('#c89a4a', { roughness: .3, metalness: .95, envMapIntensity: 1 });
  const concrete = ctx.mat('#ffffff', { roughness: 1, vertexColors: true, envMapIntensity: .2 });
  const lamp = new THREE.MeshBasicMaterial({ color: new Col('#ffc070').multiplyScalar(2.4) });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000).rotateX(-Math.PI / 2), ctx.mat('#3b302a', { roughness: 1, envMapIntensity: .1 })); group.add(ground);
  const B = new Builder();
  const lat = (t, l, up = 0) => path.beside(t, l, up);
  const placed = []; const free = (x, z, rad) => placed.every(p => (p[0] - x) ** 2 + (p[1] - z) ** 2 > (p[2] + rad) ** 2);
  /* ---- sawtooth factory hall ---- */
  function factory(x, z, w, l, h, yaw, key = 'brick') {
    B.add(key, boxGeo(w, h, l, 10, 10), [x, 0, z], [0, yaw, 0], null, '#c8a890');
    const n = Math.max(2, Math.round(l / 14)); const fw = new V3(-Math.sin(yaw), 0, -Math.cos(yaw)); for (let i = 0; i < n; i++) { const o = (i + .5) / n * l - l / 2; const c = new V3(x, h, z).addScaledVector(fw, o);
      const tooth = new THREE.BufferGeometry(); const hw = w / 2, d = l / n / 2, th = 6; const P = [-hw, 0, -d, hw, 0, -d, hw, th, d, -hw, 0, -d, hw, th, d, -hw, th, d, -hw, 0, d, hw, 0, d, hw, th, d, -hw, 0, d, hw, th, d, -hw, th, d, -hw, 0, -d, -hw, th, d, -hw, 0, d, hw, 0, -d, hw, 0, d, hw, th, d];
      tooth.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); tooth.computeVertexNormals(); tooth.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(P.length / 3 * 2), 2)); B.add('roof', tooth, [c.x, c.y, c.z], [0, yaw, 0]);
      B.add('glow', new THREE.PlaneGeometry(w * .9, th * .8), [c.x, c.y + th * .45, c.z], [0, yaw, 0]); }
  }
  /* ---- smokestack, returns its top for the smoke ---- */
  const stacks = [];
  function stack(x, z, h, rad) { B.add('brick2', cylGeo(rad, rad * 1.35, h, 14, 6, 8), [x, 0, z], null, null, '#b08870'); for (let k = 1; k < 4; k++) B.add('steel', cylGeo(rad * 1.04, rad * 1.04, 1.2, 14), [x, h * k / 4, z], null, null, '#3a3a3a'); B.add('steel', cylGeo(rad * 1.12, rad, 3, 14), [x, h - 3, z], null, null, '#2a2624'); stacks.push(new V3(x, h, z)); }

  /* ---- the production line, left of the path (t 46 → 63) ---- */
  const vatT = []; for (let t = 46; t <= 63; t += 1.25) vatT.push(t);
  const vats = []; const VAT_LAT = -31, vatBase = t => lat(t, VAT_LAT).y - 13;
  for (const t of vatT) { const p = lat(t, VAT_LAT); const y0 = p.y - 13; vats.push({ p: new V3(p.x, y0, p.z), t });
    B.add('steel', cylGeo(4.4, 4.8, 2.2, 20), [p.x, y0 - 2.2, p.z], null, null, '#3b3430'); B.add('steel', cylGeo(4.2, 4.4, 1.8, 20), [p.x, y0 + 13, p.z], null, null, '#4a3e34');
    B.add('brass', new THREE.SphereGeometry(4.2, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), [p.x, y0 + 14.6, p.z]); B.add('brass', cylGeo(.6, .6, 6, 8), [p.x, y0 + 17, p.z]);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + .4; B.add('brass', cylGeo(.22, .22, 13, 6), [p.x + Math.cos(a) * 4.3, y0, p.z + Math.sin(a) * 4.3]); }
    B.add('lamp', new THREE.TorusGeometry(4.25, .18, 6, 32), [p.x, y0 + .4, p.z], [Math.PI / 2, 0, 0]); }
  // gantry platform the vats stand on, + pipe manifold to the left
  { const a = lat(45, VAT_LAT), b = lat(64, VAT_LAT); for (let t = 45; t < 64; t += 1) { const p = lat(t + .5, VAT_LAT); const y0 = p.y - 15.2; B.add('concrete', boxGeo(14, 2, 22, 6, 6), [p.x, y0, p.z], [0, path.yaw(t + .5), 0], null, '#6b5b4e');
      if (Math.round(t) % 3 === 0) for (const s of [-5, 5]) { const q = lat(t + .5, VAT_LAT + s); B.add('steel', boxGeo(1.4, y0, 1.4), [q.x, 0, q.z], null, null, '#2e2a28'); } }
    for (const [lo, up] of [[-7, 9], [-8, 11], [-9, 13]]) { for (let t = 45; t < 64; t += 1) B.addM('brass', cylBetween(lat(t, VAT_LAT + lo, up - 13 + 2), lat(t + 1, VAT_LAT + lo, up - 13 + 2), .6, 8), new THREE.Matrix4()); }
    placed.push([a.x, a.z, 30], [b.x, b.z, 30], [lat(54, VAT_LAT).x, lat(54, VAT_LAT).z, 40]); }
  const vatGlass = new THREE.MeshPhysicalMaterial({ color: '#ffd59a', roughness: .08, metalness: 0, transparent: true, opacity: .28, emissive: '#ff9a3a', emissiveIntensity: .35, envMapIntensity: 1.2, side: THREE.DoubleSide, depthWrite: false });
  const vatFluid = new THREE.MeshBasicMaterial({ color: new Col('#ffb257').multiplyScalar(.9), transparent: true, opacity: .22, depthWrite: false, side: THREE.BackSide });
  { const gb = new Builder(); for (const v of vats) { gb.add('g', cylGeo(4, 4, 13, 28, 8, 8, true), [v.p.x, v.p.y, v.p.z]); gb.add('f', cylGeo(3.8, 3.8, 11.5, 24, 8, 8), [v.p.x, v.p.y, v.p.z]); } const ms = gb.build({ g: vatGlass, f: vatFluid }, group); ms.g.renderOrder = 4; ms.f.renderOrder = 3; }
  // bubbles in the vats
  const bubbles = new SpriteField(vats.length * 10, { map: dotTex(), additive: true, color: '#ffe0b0' }); group.add(bubbles.mesh);
  /* conveyor below the vats, path side, carrying finished workers */
  const CONV_LAT = -21.5; const convA = 44, convB = 66;
  for (let t = convA; t < convB; t += .5) { const p = lat(t + .25, CONV_LAT); const y = vatBase(t + .25) - 6; B.add('steel', boxGeo(4, 1, 11, 4, 4), [p.x, y, p.z], [0, path.yaw(t + .25), 0], null, '#2c2a28'); if (Math.round(t * 2) % 4 === 0) B.add('steel', boxGeo(.8, y, .8), [p.x, 0, p.z], null, null, '#2c2a28'); }
  /* ---- elevated catwalks crossing overhead (t 59.5 and 67.5) ---- */
  const walks = [];
  for (const [ct, up] of [[59.5, 15], [67.5, 13]]) { const c = path.pos(ct), y = c.y + up, yw = path.yaw(ct); const ax = new V3(Math.cos(yw), 0, -Math.sin(yw));
    const A = c.clone().addScaledVector(ax, -120), Bp = c.clone().addScaledVector(ax, 140); A.y = Bp.y = y;
    const mid = A.clone().lerp(Bp, .5); B.add('steel', boxGeo(260, .6, 3.2, 4, 4), [mid.x, y - .6, mid.z], [0, yw, 0], null, '#3a3532');
    for (let k = 0; k <= 52; k++) { const p = A.clone().lerp(Bp, k / 52); for (const s of [-1, 1]) { const q = p.clone().addScaledVector(new V3(-Math.sin(yw), 0, -Math.cos(yw)), 1.5 * s); B.add('steel', boxGeo(.1, 1.2, .1), [q.x, y, q.z], null, null, '#3a3532'); } }
    for (const s of [-1, 1]) { const q0 = A.clone().addScaledVector(new V3(-Math.sin(yw), 0, -Math.cos(yw)), 1.5 * s), q1 = Bp.clone().addScaledVector(new V3(-Math.sin(yw), 0, -Math.cos(yw)), 1.5 * s); q0.y = q1.y = y + 1.2; B.addM('steel', cylBetween(q0, q1, .07, 4), new THREE.Matrix4()); }
    // truss underneath
    for (let k = 0; k < 26; k++) { const p0 = A.clone().lerp(Bp, k / 26), p1 = A.clone().lerp(Bp, (k + 1) / 26); p0.y -= .6; p1.y -= .6; const q = p0.clone().lerp(p1, .5); q.y -= 3; B.addM('steel', cylBetween(p0, q, .12, 4), new THREE.Matrix4()); B.addM('steel', cylBetween(q, p1, .12, 4), new THREE.Matrix4()); }
    for (const k of [0, .23, .77, 1]) { const p = A.clone().lerp(Bp, k); B.add('steel', boxGeo(2.4, y, 2.4), [p.x, 0, p.z], null, null, '#2e2a28'); placed.push([p.x, p.z, 8]); }
    walks.push({ A, Bp, y, yw }); }
  /* ---- right side: the main works ---- */
  const signT = 54.5; { const p = lat(signT, 70); const yw = path.yaw(signT); factory(p.x, p.z, 60, 150, 26, yw, 'brick'); placed.push([p.x, p.z, 80]);
    const sp = lat(signT, 41, 0); sp.y = 26 + 12; const sm = new THREE.MeshBasicMaterial({ map: signTex("ROSSUM'S UNIVERSAL ROBOTS", 2048, 220), toneMapped: true }); sm.color.setScalar(1.6);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(118, 12.7), sm); sign.position.copy(sp); sign.rotation.y = yw - Math.PI / 2; group.add(sign);
    for (let k = 0; k < 7; k++) { const q = lat(signT - 2.6 + k * .87, 41); B.add('steel', boxGeo(.7, 18, .7), [q.x, 26, q.z], null, null, '#2e2a28'); }
    for (let k = 0; k < 5; k++) { const q = lat(signT - 2.4 + k * 1.2, 76); stack(q.x, q.z, 95 + k * 9 % 30, 4.2); } }
  for (let i = 0; i < 400 && placed.length < 90; i++) { const t = 34 + r() * 56; const side = r() < .72 ? 1 : -1; const w = 26 + r() * 40, L = 50 + r() * 90; const half = Math.max(w, L) * .55; const l = side * (half + (side > 0 ? 36 : 52) + Math.pow(r(), 1.3) * 430); const p = lat(t, l); if (!free(p.x, p.z, Math.max(w, L) * .55)) continue;
    const h = 14 + r() * 22; factory(p.x, p.z, w, L, h, path.yaw(t) + (r() < .3 ? Math.PI / 2 : 0), r() < .5 ? 'brick' : 'brick2'); placed.push([p.x, p.z, Math.max(w, L) * .55]);
    if (r() < .55) { const q = lat(t + (r() - .5) * 1.5, l + (r() - .5) * 20); if (free(q.x, q.z, 5) || true) stack(q.x, q.z, 60 + r() * 80, 2.4 + r() * 2.5); } }
  /* ---- cranes ---- */
  const crane = { p: lat(70, -46), h: 72, jib: 58 }; crane.p.y = 0;
  { const { p, h } = crane; for (const s of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) B.add('steel', boxGeo(.5, h, .5), [p.x + s[0] * 1.6, 0, p.z + s[1] * 1.6], null, null, '#c8902a');
    for (let k = 0; k < 18; k++) { const y = k * h / 18; B.add('steel', boxGeo(3.4, .3, .3), [p.x, y, p.z - 1.6], null, null, '#c8902a'); B.add('steel', boxGeo(3.4, .3, .3), [p.x, y, p.z + 1.6], null, null, '#c8902a'); B.add('steel', boxGeo(.3, .3, 3.4), [p.x - 1.6, y, p.z], null, null, '#c8902a'); B.add('steel', boxGeo(.3, .3, 3.4), [p.x + 1.6, y, p.z], null, null, '#c8902a'); }
    placed.push([p.x, p.z, 10]); }
  const craneTop = new THREE.Group(); craneTop.position.set(crane.p.x, crane.h, crane.p.z); group.add(craneTop);
  { const cy = ctx.mat('#c8902a', { roughness: .6, metalness: .5 }), dk = ctx.mat('#2e2a28', { roughness: .6, metalness: .5 });
    const jb = new THREE.Mesh(boxGeo(2.4, 2.6, crane.jib + 18, 4, 4), cy); jb.position.z = -(crane.jib - 18) / 2; craneTop.add(jb);
    const cab = new THREE.Mesh(boxGeo(3, 3, 3), dk); cab.position.set(2.6, -3, 0); craneTop.add(cab); const cw = new THREE.Mesh(boxGeo(4, 4, 6), dk); cw.position.set(0, -4, 16); craneTop.add(cw);
    const mast = new THREE.Mesh(boxGeo(1, 10, 1), cy); craneTop.add(mast); }
  const hook = new THREE.Group(); craneTop.add(hook); { const cab = ctx.mat('#2e2a28', { roughness: .6, metalness: .6 }); const line = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 1, 4).translate(0, -.5, 0), cab); hook.add(line); hook.userData.line = line;
    const load = new THREE.Group(); hook.add(load); hook.userData.load = load; load.add(new THREE.Mesh(boxGeo(7, 3, 4), ctx.mat('#6e4a32', { roughness: .8 }))); }
  // travelling gantry crane over the vat line
  const gantry = new THREE.Group(); group.add(gantry); { const cy = ctx.mat('#b0402a', { roughness: .6, metalness: .5 }); const span = 30, hh = 50;
    for (const s of [-1, 1]) { const leg = new THREE.Mesh(boxGeo(1.6, hh, 1.6), cy); leg.position.set(s * span / 2, 0, 0); gantry.add(leg); const leg2 = leg.clone(); leg2.position.z = 6; gantry.add(leg2); }
    const top = new THREE.Mesh(boxGeo(span + 4, 3, 8), cy); top.position.set(0, hh, 3); gantry.add(top); const trol = new THREE.Mesh(boxGeo(4, 2.5, 6), ctx.mat('#2e2a28', { roughness: .6 })); trol.position.set(0, hh - 2.5, 3); gantry.add(trol);
    const cab = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, 12, 4), ctx.mat('#222')); cab.position.set(0, hh - 8, 3); gantry.add(cab); }
  /* ---- elevated railway on the right with a moving train ---- */
  const RAIL_LAT = 27; const railPts = []; for (let t = 30; t <= 92; t += 1) { const p = lat(t, RAIL_LAT); p.y = 30; railPts.push(p); }
  for (let i = 0; i < railPts.length - 1; i++) { const a = railPts[i], b = railPts[i + 1]; const m = a.clone().lerp(b, .5); const yw = Math.atan2(-(b.x - a.x), -(b.z - a.z)); B.add('concrete', boxGeo(6, 1.6, a.distanceTo(b) + .2, 4, 4), [m.x, 28.4, m.z], [0, yw, 0], null, '#6b5b4e'); if (i % 2 === 0) B.add('concrete', boxGeo(2.2, 28.4, 2.2), [a.x, 0, a.z], null, null, '#5b4b40'); }
  const railCurve = new THREE.CatmullRomCurve3(railPts); const railLen = railCurve.getLength();
  const train = []; { const car = boxGeo(4.2, 4, 14, 4, 4); const tm = ctx.mat('#3a2a22', { roughness: .6, metalness: .4 }), lm = ctx.mat('#ffcf8a', { emissive: '#ffb050', emissiveIntensity: 1.2 });
    for (let k = 0; k < 9; k++) { const g = new THREE.Group(); g.add(new THREE.Mesh(car, tm)); const w = new THREE.Mesh(new THREE.BoxGeometry(4.3, .9, 11), lm); w.position.y = 2.6; g.add(w); if (k === 0) { const sk = new THREE.Mesh(cylGeo(.8, 1, 3, 8), tm); sk.position.set(0, 4, -4); g.add(sk); } group.add(g); train.push(g); } }
  /* ---- smoke, steam and dust ---- */
  const smoke = new SpriteField(stacks.length * 9, { map: puffTex(31), color: '#6a5a50', opacity: .75 }); group.add(smoke.mesh);
  const steam = new SpriteField(80, { map: puffTex(44), color: '#f0e2d0', opacity: .7 }); group.add(steam.mesh);
  const steamSrc = []; { const sr = rng(12); for (let i = 0; i < 10; i++) { const t = 44 + sr() * 30; steamSrc.push({ p: lat(t, (sr() < .5 ? -1 : 1) * (14 + sr() * 20), -40), ph: sr() * 10 }); } }
  const sparks = new SpriteField(60, { map: dotTex(), additive: true, color: '#ffc070' }); group.add(sparks.mesh);
  B.build({ brick, brick2, steel, roof, brass, concrete, glow: lamp, lamp }, group);
  /* ---- the manufactured workers ---- */
  const N_CONV = 46, N_WALK = 2 * 44, N_VAT = vats.length, N_YARD = 220;
  const people = new People(N_CONV + N_WALK + N_VAT + N_YARD, { skin: '#e3c3ab', stride: 6.5, envMats: ctx.envMats });
  for (let i = 0; i < people.n; i++) people.color(i, i < N_CONV + N_WALK + N_VAT ? '#8d8a84' : '#7c7a74');
  group.add(people.mesh);
  const yard = []; { const yr = rng(88); for (let i = 0; i < N_YARD; i++) { const col = Math.floor(i / 20), row = i % 20; const t = 38 + col * 3.6 + yr() * .4; yard.push({ t, l: -46 - (row % 4) * 1.4, along: Math.floor(row / 4) * 1.6, ph: col * .3 }); } }
  const _p = new V3();
  function update(t, C) {
    const sp = C.shipPos;
    // workers on the conveyor (standing, carried along), then walking in step on the catwalks
    let k = 0; const convSpeed = .085; // path-time units per second along the belt
    for (let i = 0; i < N_CONV; i++, k++) { const u = (i / N_CONV + t * .0068) % 1; const tt = lerp(convA + .5, convB - .5, u); const p = lat(tt, CONV_LAT); people.place(k, p.x, vatBase(tt) - 5.5, p.z, path.yaw(tt) - Math.PI / 2 + Math.PI, 0, 0, 1); }
    for (const w of walks) for (let i = 0; i < 44; i++, k++) { const rev = i % 2; let u = ((i >> 1) / 22 + t * .0058) % 1; if (rev) u = 1 - u; _p.copy(w.A).lerp(w.Bp, u); const lane = rev ? .65 : -.65; _p.x += -Math.sin(w.yw) * lane; _p.z += -Math.cos(w.yw) * lane;
      people.place(k, _p.x, w.y, _p.z, w.yw + (rev ? -Math.PI / 2 : Math.PI / 2), 1, rev * 1.3, 1); }
    for (let i = 0; i < N_VAT; i++, k++) { const v = vats[i]; const bob = Math.sin(t * .8 + i) * .5; const s = 2.6 + (i % 3) * .25; people.place(k, v.p.x, v.p.y + 1.8 + bob, v.p.z, path.yaw(v.t) + Math.PI / 2 + Math.sin(t * .3 + i) * .4, 0, 0, s); }
    for (let i = 0; i < N_YARD; i++, k++) { const y = yard[i]; const tt = y.t + ((t * .5 + y.along * .7) % 9) * .2; const p = lat(tt, y.l); people.place(k, p.x, 0, p.z, path.yaw(tt) + Math.PI, 1, y.ph, 1); }
    people.commit(t);
    // vat bubbles
    for (let i = 0; i < vats.length; i++) for (let j = 0; j < 10; j++) { const v = vats[i]; const q = (t * .35 + j / 10 + i * .13) % 1; const a = j * 2.4 + i; bubbles.set(i * 10 + j, v.p.x + Math.cos(a) * 2.6, v.p.y + .6 + q * 11, v.p.z + Math.sin(a) * 2.6, .25 + (j % 3) * .12, 1, 1, 1, .7 * Math.sin(q * Math.PI)); }
    bubbles.commit();
    // smoke plumes drifting downwind
    stacks.forEach((s, i) => { for (let j = 0; j < 9; j++) { const q = (t * .07 + j / 9 + i * .17) % 1; const sz = 8 + q * 40; smoke.set(i * 9 + j, s.x + q * 70 + Math.sin(q * 6 + i) * 6, s.y + 4 + q * 55, s.z - q * 30, sz, .9 - q * .3, .85 - q * .3, .8 - q * .3, .7 * (1 - q) * Math.min(1, q * 8)); } }); smoke.commit(); smoke.fog(C.fog);
    steamSrc.forEach((s, i) => { for (let j = 0; j < 8; j++) { const ph = (t * .35 + s.ph) % 4; const burst = ph < 1.6 ? 1 : 0; const q = ((t * .6 + j / 8) % 1); const p = s.p; steam.set(i * 8 + j, p.x + q * 4, 3 + q * 26, p.z, 4 + q * 16, 1, 1, 1, burst * (1 - q) * .8); } }); steam.commit(); steam.fog(C.fog);
    // welding sparks along the vat gantry
    for (let i = 0; i < 60; i++) { const sr = rng(i * 7 + Math.floor(t * 10)); const tt = 46 + (i % 6) * 3; const q = (t * 1.3 + i * .37) % 1; const p = lat(tt, VAT_LAT + 8, -14); sparks.set(i, p.x + (sr() - .5) * 2, p.y + 2 - q * q * 8, p.z + (sr() - .5) * 2, .25 + sr() * .3, 1, 1, 1, (1 - q) * (sr() < .8 ? 1 : 0)); } sparks.commit();
    // cranes
    craneTop.rotation.y = 1.45 + Math.sin(t * .12) * .75; const drop = 26 + Math.sin(t * .3) * 10; hook.position.z = -crane.jib + 8; hook.userData.line.scale.y = drop; hook.userData.load.position.y = -drop - 3; hook.userData.load.rotation.y = t * .2;
    { const u = .5 + .5 * Math.sin(t * .09); const tt = lerp(47, 62, u); const p = lat(tt, VAT_LAT - 12); gantry.position.set(p.x, 0, p.z); gantry.rotation.y = path.yaw(tt); }
    // train
    const d = ((t * 14) % railLen + railLen) % railLen; train.forEach((g, i) => { const u = ((railLen - d) / railLen + i * 15.5 / railLen) % 1; const a = railCurve.getPointAt(u), b = railCurve.getPointAt(Math.min(.9999, u + .002)); g.position.set(a.x, 31, a.z); g.rotation.y = Math.atan2(-(b.x - a.x), -(b.z - a.z)); });
    return { flash: 0 };
  }
  const anchors = { vats: lat(54, VAT_LAT, -4), conveyor: lat(52, CONV_LAT, -8), catwalk: walks[0].A.clone().lerp(walks[0].Bp, .46), sign: lat(signT, 41, 38 - lat(signT, 41).y), stacks: stacks[2] || stacks[0], crane: new V3(crane.p.x, crane.h, crane.p.z) };
  const telescope = [
    { t0: 30, t1: 47, name: 'ROSSUM\'S UNIVERSAL ROBOTS', fact: 'THE FACTORY ON ROSSUM\'S ISLAND', at: anchors.sign, size: 120 },
    { t0: 47, t1: 58, name: 'PRODUCTION VATS', fact: 'ROBOTS GROWN FROM SYNTHETIC LIVING MATTER', at: anchors.vats, size: 22 },
    { t0: 58, t1: 66, name: 'THE NIGHT SHIFT THAT NEVER ENDS', fact: '"ROBOTA" · CZECH FOR FORCED LABOR', at: anchors.catwalk, size: 26 },
    { t0: 66, t1: 90, name: 'SMOKESTACKS', fact: 'MASS PRODUCTION · ONE MODEL, MILLIONS MADE', at: anchors.stacks, size: 90 } ];
  return { id: 'rur', group, path, update, anchors, telescope };
}
