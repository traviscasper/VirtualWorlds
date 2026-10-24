/* WORLD 1 · FRANKENSTEIN (1818) — a Gothic laboratory in an Alpine gorge during a thunderstorm.
   The creature follows Mary Shelley's description (eight feet tall, yellowish skin, flowing black hair),
   not any film studio's makeup design. */
import * as THREE from 'three';
import { V3, Col, lerp, clamp, smooth, sstep, win, rng, fbm, FlightPath, Builder, boxGeo, cylGeo, beamGeo, cylBetween, gothicTex, SpriteField, puffTex, dotTex, boltGeometry, mat4 } from './lib.js';

export const STRIKES = [ // [time, target]; thunder in the soundtrack follows these
  [4.6, 'far1'], [11.8, 'coil'], [16.4, 'coil'], [22.6, 'rods'], [25.4, 'rods'], [30.8, 'far2'], [35.6, 'coil'], [39.2, 'far1'] ];
export const SHEETS = [1.6, 8.2, 19.4, 28.6, 33.4, 37.8];

export function buildFrankenstein(ctx) {
  const group = new THREE.Group(); group.name = 'frankenstein';
  const path = new FlightPath([[-4, 0, 96, 620], [5, 0, 92, 440], [12, -8, 86, 300], [19, -6, 80, 190], [24, 2, 78, 140], [29, 8, 78, 95], [34, 6, 82, 10], [39, -4, 88, -90], [44, -8, 92, -175]]);
  const r = rng(1818);
  /* ---- the gorge: centre line follows the flight path ---- */
  const tbl = []; for (let t = -40; t <= 80; t += .25) { const p = path.pos(t); tbl.push([p.z, p.x]); }
  const cxSlow = z => { if (z >= tbl[0][0]) return tbl[0][1]; for (let i = 0; i < tbl.length - 1; i++) if (z <= tbl[i][0] && z >= tbl[i + 1][0]) { const k = (z - tbl[i][0]) / (tbl[i + 1][0] - tbl[i][0]); return lerp(tbl[i][1], tbl[i + 1][1], k); } return tbl[tbl.length - 1][1]; };
  const CXG = new Float32Array(1601); for (let i = 0; i <= 1600; i++) CXG[i] = cxSlow(-3200 + i * 4);
  const cxAt = z => { const f = clamp((z + 3200) / 4, 0, 1599.999); const i = Math.floor(f); return lerp(CXG[i], CXG[i + 1], f - i); };
  const H = (x, z) => { const d = Math.abs(x - cxAt(z)); const n = fbm(x * .004 + 3, z * .004, 1.7, 4);
    const plateau = 52 + 22 * fbm(x * .01, z * .01, 5, 3); let h = d < 34 ? 0 : d < 64 ? plateau * smooth((d - 34) / 30) + (fbm(x * .05, z * .05, 2, 2) - .5) * 14 * Math.min(1, (d - 34) / 10) : plateau;
    if (d > 230) { const m = Math.pow(Math.max(0, (d - 230) / 900), .9); const ridge = 1 - Math.abs(fbm(x * .0022, z * .0022, 9.1, 5) * 2 - 1); h += m * (420 + 520 * ridge) * (.55 + n * .7); }
    return Math.max(0, h); };
  { const S = 5600, N = 230; const g = new THREE.PlaneGeometry(S, S, N, N).rotateX(-Math.PI / 2).translate(0, 0, 150); const P = g.attributes.position; const col = new Float32Array(P.count * 3); const c = new Col();
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i); const h = H(x, z); P.setY(i, h); const snow = sstep(330, 520, h + fbm(x * .02, z * .02, 0, 2) * 120);
      c.set('#2c3240').lerp(new Col('#4a4f5c'), fbm(x * .03, z * .03, 4, 2)).lerp(new Col('#c9d3e6'), snow); if (h < 2) c.set('#14181f'); col.set([c.r, c.g, c.b], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
    const m = ctx.mat('#ffffff', { vertexColors: true, roughness: 1, flatShading: true, envMapIntensity: .15 }); group.add(new THREE.Mesh(g, m)); }
  /* river */
  const riverU = { uTime: { value: 0 }, flash: { value: 0 } };
  { const pts = []; for (let t = -40; t <= 80; t += 1) pts.push(path.pos(t)); const pos = [], uv = []; let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; const len = a.distanceTo(b); for (const [p, v] of [[a, acc], [b, acc + len]]) { pos.push(p.x - 34, 1.2, p.z, p.x + 34, 1.2, p.z); uv.push(0, v / 40, 1, v / 40); } acc += len; }
    const idx = []; for (let i = 0; i < pts.length - 1; i++) { const o = i * 4; idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    const m = new THREE.ShaderMaterial({ uniforms: riverU, fog: true, uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, riverU]),
      vertexShader: `varying vec2 vUv; #include <fog_pars_vertex>
        void main(){ vUv=uv; vec4 mvPosition=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mvPosition; #include <fog_vertex> }`.replace(/#include <(\w+)>/g, '\n#include <$1>\n'),
      fragmentShader: `uniform float uTime, flash; varying vec2 vUv; #include <fog_pars_fragment>
        float h(vec2 p){ return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5); }
        float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
        void main(){ vec2 q=vec2(vUv.x*6.,vUv.y*8.+uTime*1.6); float s=n(q)*.6+n(q*2.3+3.)*.4; vec3 c=mix(vec3(.02,.03,.05),vec3(.16,.2,.28),pow(s,3.)); c+=vec3(.5,.6,.9)*flash*pow(s,2.)*.8;
          float edge=smoothstep(0.,.08,vUv.x)*smoothstep(1.,.92,vUv.x); c=mix(vec3(.25,.28,.32),c,edge); gl_FragColor=vec4(c,1.);
          #include <fog_fragment>
          #include <colorspace_fragment>
        }`.replace(/#include <(\w+)>/g, '\n#include <$1>\n') });
    m.uniforms.uTime = riverU.uTime; m.uniforms.flash = riverU.flash; group.add(new THREE.Mesh(g, m)); }

  /* ---- Gothic architecture ---- */
  const gt = gothicTex(7), gt2 = gothicTex(11);
  const stone = ctx.mat('#ffffff', { map: gt.map, emissiveMap: gt.emi, emissive: '#ffffff', emissiveIntensity: 1.6, roughness: .95, vertexColors: true, envMapIntensity: .2 });
  const stone2 = ctx.mat('#ffffff', { map: gt2.map, emissiveMap: gt2.emi, emissive: '#ffffff', emissiveIntensity: 1.6, roughness: .95, vertexColors: true, envMapIntensity: .2 });
  const plain = ctx.mat('#ffffff', { roughness: .95, vertexColors: true, envMapIntensity: .2 });
  const arch = ctx.mat('#ffffff', { map: gt2.map, roughness: .95, vertexColors: true, envMapIntensity: .2 });
  const slate = ctx.mat('#2a2f3c', { roughness: .55, metalness: .2, envMapIntensity: .5, flatShading: true });
  const iron = ctx.mat('#1b1d22', { roughness: .45, metalness: .8, envMapIntensity: .6 });
  const copper = ctx.mat('#b86a3a', { roughness: .35, metalness: .9, envMapIntensity: .9 });
  const glowWarm = new THREE.MeshBasicMaterial({ color: new Col('#ffb060').multiplyScalar(2.2) });
  const B = new Builder();
  const SC = '#9a9aa6', SC2 = '#7f8090';
  function tower(x, z, base, w, h, opts = {}) { const round = opts.round, key = opts.alt ? 'stone2' : 'stone', c = opts.c || SC;
    if (round) B.add(key, cylGeo(w / 2, w / 2 * 1.06, h, 12, 8, 10), [x, base, z], null, null, c); else B.add(key, boxGeo(w, h, w, 8, 10), [x, base, z], [0, opts.ry || 0, 0], null, c);
    const top = base + h; // crenels / corbel ring
    if (round) B.add('plain', cylGeo(w / 2 + .9, w / 2, 2.2, 12), [x, top, z], null, null, SC2); else B.add('plain', boxGeo(w + 1.6, 2.2, w + 1.6), [x, top, z], [0, opts.ry || 0, 0], null, SC2);
    const sp = opts.spire ?? w * 2.2; const cone = new THREE.ConeGeometry(round ? w / 2 + .6 : (w + 1.4) * .72, sp, round ? 12 : 4, 1); cone.translate(0, sp / 2, 0);
    B.add('slate', cone, [x, top + 2.2, z], [0, (opts.ry || 0) + (round ? 0 : Math.PI / 4), 0]);
    B.add('iron', new THREE.CylinderGeometry(.12, .2, sp * .35, 5).translate(0, sp * .17, 0), [x, top + 2.2 + sp, z]);
    if (!round && w > 7) for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const px = x + sx * w * .5, pz = z + sz * w * .5; const pc = new THREE.ConeGeometry(1.1, 7, 4).translate(0, 3.5, 0); B.add('slate', pc, [px, top + 2.2, pz]); B.add('plain', boxGeo(1.4, 3, 1.4), [px, top - .8, pz], null, null, SC2); }
    if (opts.butt) for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + (opts.ry || 0); const bx = x + Math.sin(a) * (w / 2 + 1.4), bz = z + Math.cos(a) * (w / 2 + 1.4); B.add('plain', boxGeo(2.2, h * .55, 3), [bx, base, bz], [0, a, 0], null, SC2); }
    if (opts.lamp) B.add('glow', new THREE.SphereGeometry(.8, 8, 6), [x + w * .55, top - 6, z]);
  }
  function hall(x, z, base, w, l, h, ry) { B.add('stone2', boxGeo(w, h, l, 8, 10), [x, base, z], [0, ry, 0], null, SC); const roof = new THREE.CylinderGeometry(0, w * .72, l, 4, 1); roof.rotateZ(Math.PI / 2); roof.rotateX(Math.PI / 4);
    const rg = new THREE.BufferGeometry().copy(roof); rg.scale(1, .9, 1); B.add('slate', new THREE.ConeGeometry(w * .7, w * .8, 4).translate(0, w * .4, 0).scale(1, 1, l / w), [x, base + h, z], [0, ry + Math.PI / 4 * 0, 0]); }
  const placed = [];
  // the great castle on the right, end of the gorge (reference: towers on a crag)
  const castle = path.beside(37, 135); { const base = H(castle.x, castle.z) - 2; tower(castle.x, castle.z, base, 22, 70, { butt: true, alt: true, spire: 40 }); for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; tower(castle.x + Math.cos(a) * 34, castle.z + Math.sin(a) * 34, base, 8 + (k % 2) * 3, 40 + (k % 3) * 12, { round: k % 2 === 0, lamp: true }); }
    hall(castle.x - 10, castle.z + 30, base, 16, 40, 22, .3); placed.push([castle.x, castle.z, 60]); }
  /* the stone viaduct we fly under (t = 9) */
  const bridgeT = 9, bp = path.pos(bridgeT), byaw = path.yaw(bridgeT), deckY = bp.y + 30;
  { const ax = new V3(Math.cos(byaw), 0, -Math.sin(byaw)); const at = (lat, y) => new V3(bp.x + ax.x * lat, y, bp.z + ax.z * lat);
    const spans = [[-150, -95], [-95, -42], [-42, 42], [42, 95], [95, 150]];
    for (const [a, b] of spans) { const mid = (a + b) / 2, R = (b - a) / 2, spring = deckY - R - 2;
      for (let k = 0; k <= 18; k++) { const th = Math.PI * k / 18; const lat = mid - Math.cos(th) * R, y = spring + Math.sin(th) * R; const p = at(lat, y);
        B.add('arch', boxGeo(3.2, deckY - y + .5, 9, 6, 6), [p.x, y - 1.6, p.z], [0, byaw, 0], null, SC); } }
    for (const lat of [-150, -95, -42, 42, 95, 150]) { const p = at(lat, 0); const g = H(p.x, p.z); const top = deckY - 22; if (top > g) B.add('arch', boxGeo(8, top - g + 2, 11, 6, 8), [p.x, g - 1, p.z], [0, byaw, 0], null, SC2); }
    const c = at(0, deckY); B.add('arch', boxGeo(312, 3, 12, 8, 4), [c.x, deckY, c.z], [0, byaw, 0], null, SC2);
    for (let lat = -150; lat <= 150; lat += 12) { for (const s of [-1, 1]) { const p = at(lat, deckY + 3); p.x += Math.sin(byaw) * 5.5 * s * -1; p.z += Math.cos(byaw) * 5.5 * s * -1; B.add('plain', boxGeo(1, 1.4, 1), [p.x, p.y, p.z], [0, byaw, 0], null, SC2); if (lat % 36 === 0) { B.add('iron', new THREE.CylinderGeometry(.12, .15, 4, 5).translate(0, 2, 0), [p.x, p.y, p.z]); B.add('glow', new THREE.SphereGeometry(.5, 8, 6), [p.x, p.y + 4.3, p.z]); } } }
    for (const lat of [-42, 42]) { const p = at(lat, deckY + 3); tower(p.x, p.z, deckY + 3, 7, 16, { round: true, lamp: true, spire: 12 }); } }
  /* ---- the coil tower (left, t ≈ 16) ---- */
  const coilBase = path.beside(16, -64); coilBase.y = H(coilBase.x, coilBase.z) - 1; const coilTop = coilBase.clone().add(new V3(0, 112, 0));
  { const legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]]; const W0 = 15, W1 = 3.2; const lv = (s, k) => new V3(coilBase.x + s[0] * lerp(W0, W1, k), coilBase.y + k * 108, coilBase.z + s[1] * lerp(W0, W1, k));
    for (const s of legs) B.addM('iron', beamGeo(lv(s, 0), lv(s, 1), .9), new THREE.Matrix4());
    for (let k = 0; k < 12; k++) { const k0 = k / 12, k1 = (k + 1) / 12; for (let i = 0; i < 4; i++) { const a = legs[i], b = legs[(i + 1) % 4]; B.addM('iron', beamGeo(lv(a, k0), lv(b, k1), .35), new THREE.Matrix4()); B.addM('iron', beamGeo(lv(b, k0), lv(a, k1), .35), new THREE.Matrix4()); B.addM('iron', beamGeo(lv(a, k1), lv(b, k1), .45), new THREE.Matrix4()); } }
    B.add('copper', new THREE.TorusGeometry(9, 2.2, 10, 32), [coilTop.x, coilTop.y + 2, coilTop.z], [Math.PI / 2, 0, 0]);
    B.add('copper', new THREE.SphereGeometry(5.5, 20, 14), [coilTop.x, coilTop.y + 7, coilTop.z]);
    for (let k = 0; k < 6; k++) B.add('copper', new THREE.TorusGeometry(5.5 - k * .5, .45, 6, 24), [coilBase.x, coilBase.y + 70 + k * 5, coilBase.z], [Math.PI / 2, 0, 0]);
    B.add('stone', boxGeo(34, 9, 34, 8, 9), [coilBase.x, coilBase.y - 2, coilBase.z], null, null, SC2); placed.push([coilBase.x, coilBase.z, 26]); }
  /* ---- the creature's platform (right, t ≈ 26.5) ---- */
  const CT = 26.5, plat = path.beside(CT, 27, -7.6); const platY = plat.y; const pyaw = path.yaw(CT);
  const toPath = Math.atan2(-(Math.cos(pyaw)), (Math.sin(pyaw))); // facing toward the flight line
  const rods = [];
  { B.add('stone', cylGeo(11, 13, platY - 2, 16, 8, 10), [plat.x, -2, plat.z], null, null, SC);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; B.add('plain', boxGeo(2.4, platY * .7, 3), [plat.x + Math.cos(a) * 12.5, -2, plat.z + Math.sin(a) * 12.5], [0, -a, 0], null, SC2); }
    B.add('plain', cylGeo(14.5, 11.5, 3.5, 24), [plat.x, platY - 3.5, plat.z], null, null, SC2);
    B.add('iron', new THREE.TorusGeometry(14.1, .14, 5, 64), [plat.x, platY + 1.6, plat.z], [Math.PI / 2, 0, 0]);
    for (let k = 0; k < 36; k++) { const a = k / 36 * Math.PI * 2; B.add('iron', new THREE.CylinderGeometry(.1, .1, 1.6, 4).translate(0, .8, 0), [plat.x + Math.cos(a) * 14.1, platY, plat.z + Math.sin(a) * 14.1]); }
    // stone bridge back to the cliff
    const ax = new V3(Math.cos(pyaw), 0, -Math.sin(pyaw)); const b0 = plat.clone().addScaledVector(ax, 13), b1 = plat.clone().addScaledVector(ax, 72); const mid = b0.clone().lerp(b1, .5);
    B.add('stone2', boxGeo(62, 3, 7, 8, 4), [mid.x, platY - 3, mid.z], [0, pyaw, 0], null, SC2); for (const k of [0, .5, 1]) { const q = b0.clone().lerp(b1, k); placed.push([q.x, q.z, 16]); }
    for (const k of [.35, .7]) { const p = b0.clone().lerp(b1, k); B.add('stone', boxGeo(5, platY, 6, 6, 8), [p.x, -2, p.z], [0, pyaw, 0], null, SC); }
    // lightning rods + Leyden coils around the rim
    for (let k = 0; k < 5; k++) { const a = pyaw + (k - 2) * .5; const p = new V3(plat.x + Math.cos(a) * 11, platY, plat.z - Math.sin(a) * 11); const h = 18 + (k % 2) * 6;
      B.add('iron', new THREE.CylinderGeometry(.18, .35, h, 6).translate(0, h / 2, 0), [p.x, p.y, p.z]); B.add('copper', new THREE.SphereGeometry(.9, 12, 8), [p.x, p.y + h, p.z]); rods.push(new V3(p.x, p.y + h, p.z)); }
    for (const s of [-1, 1]) { const a = pyaw + s * 1.1; const p = new V3(plat.x + Math.cos(a) * 8, platY, plat.z - Math.sin(a) * 8);
      B.add('iron', cylGeo(1.6, 2, 1, 12), [p.x, p.y, p.z]); B.add('glass', cylGeo(1.4, 1.4, 6, 16), [p.x, p.y + 1, p.z]); for (let k = 0; k < 7; k++) B.add('copper', new THREE.TorusGeometry(1.45, .12, 6, 20), [p.x, p.y + 1.6 + k * .75, p.z], [Math.PI / 2, 0, 0]);
      B.add('copper', new THREE.SphereGeometry(1, 12, 8), [p.x, p.y + 7.8, p.z]); rods.push(new V3(p.x, p.y + 7.8, p.z)); }
    // operating table, tilted, behind the creature
    { const p = plat.clone().addScaledVector(ax, 6); B.add('iron', boxGeo(1.4, 2.2, 1.4), [p.x, platY, p.z]); B.add('plain', boxGeo(4, .6, 9), [p.x, platY + 2.6, p.z], [-.6, pyaw + Math.PI / 2, 0], null, '#6a645e'); }
    // cables from rods to the coils
    for (let k = 0; k < rods.length - 2; k++) { const a = rods[k], b = new V3(plat.x, platY + .3, plat.z).addScaledVector(ax, 4); const pts = []; for (let i = 0; i <= 10; i++) { const p = a.clone().lerp(b, i / 10); p.y -= Math.sin(Math.PI * i / 10) * 3; pts.push(p); } for (let i = 0; i < 10; i++) B.addM('iron', cylBetween(pts[i], pts[i + 1], .14, 5), new THREE.Matrix4()); }
    for (const s of [-1, 1]) { const p = new V3(plat.x, platY, plat.z).addScaledVector(ax, -2).add(new V3(Math.sin(pyaw) * 6 * s, 0, Math.cos(pyaw) * 6 * s)); B.add('iron', new THREE.CylinderGeometry(.5, .8, 2.4, 8).translate(0, 1.2, 0), [p.x, p.y, p.z]); B.add('glow', new THREE.SphereGeometry(.9, 10, 8), [p.x, p.y + 2.8, p.z]); } }
  // scatter towers on both plateaus
  
  const free = (x, z, rad) => placed.every(p => (p[0] - x) ** 2 + (p[1] - z) ** 2 > (p[2] + rad) ** 2);
  for (let i = 0; i < 260 && placed.length < 70; i++) { const t = -6 + r() * 56; const side = r() < .5 ? -1 : 1; const lat = side * (64 + Math.pow(r(), 1.4) * 330); const p = path.beside(t, lat); const w = 6 + r() * 9; if (!free(p.x, p.z, w)) continue;
    const base = H(p.x, p.z) - 1; const h = 18 + r() * 46 + (Math.abs(lat) < 120 ? 10 : 0); tower(p.x, p.z, base, w, h, { round: r() < .4, alt: r() < .5, butt: r() < .5, lamp: r() < .3, ry: r() * Math.PI });
    placed.push([p.x, p.z, w]); if (r() < .35) { const a = r() * Math.PI * 2, d = w + 8 + r() * 8; const hx = p.x + Math.cos(a) * d, hz = p.z + Math.sin(a) * d; if (free(hx, hz, 8)) { hall(hx, hz, H(hx, hz) - 1, 10 + r() * 6, 22 + r() * 18, 12 + r() * 8, a); placed.push([hx, hz, 14]); } } }
  const glassM = new THREE.MeshPhysicalMaterial({ color: '#9fd6ff', roughness: .05, transmission: 0, transparent: true, opacity: .35, emissive: '#3fa8ff', emissiveIntensity: .6, envMapIntensity: 1 });
  B.build({ stone, stone2, plain, arch, slate, iron, copper, glow: glowWarm, glass: glassM }, group);

  /* ---- the creature ---- */
  const creature = makeCreature(ctx); creature.root.position.set(plat.x, platY, plat.z); creature.root.rotation.y = pyaw - Math.PI / 2; creature.root.scale.setScalar(3.05); group.add(creature.root);
  const labLamp = new THREE.PointLight('#ffb070', 900, 60, 1.6); labLamp.position.copy(path.beside(CT, 17, 1)); group.add(labLamp);
  const labLamp2 = new THREE.PointLight('#9fc0ff', 500, 50, 1.6); labLamp2.position.copy(path.beside(CT - 3, 22, 6)); group.add(labLamp2);
  const creatureHead = new V3();

  /* ---- waterfall on the left cliff (t ≈ 31) ---- */
  const wfU = { uTime: { value: 0 }, flash: { value: 0 } };
  const wfMat = new THREE.ShaderMaterial({ uniforms: wfU, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vUv; varying vec3 vW; void main(){ vUv=uv; vW=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }`,
    fragmentShader: `uniform float uTime, flash; varying vec2 vUv; float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
      void main(){ vec2 q=vec2(vUv.x*22.,vUv.y*3.-uTime*2.2); float s=n(q)*.55+n(q*vec2(1.,3.)+7.)*.45; float a=smoothstep(.25,.85,s)*smoothstep(0.,.12,vUv.x)*smoothstep(1.,.88,vUv.x);
        a*=.55+.45*smoothstep(.0,.25,1.-vUv.y); vec3 c=mix(vec3(.45,.52,.62),vec3(.9,.95,1.),s)*(.55+flash*1.4); gl_FragColor=vec4(c,a*.85);
        #include <colorspace_fragment>
      }` });
  const falls = []; const fallB = new Builder();
  for (const [ft, lat, w] of [[31, -40, 24], [38.5, 41, 16], [13.5, 44, 14]]) { const sg = Math.sign(lat), yawF = path.yaw(ft); const pw = path.beside(ft, lat); const top = Math.max(H(path.beside(ft, lat * 1.8).x, path.beside(ft, lat * 1.8).z), 50) + 16;
    fallB.add('stone', boxGeo(w + 10, top, 7, 8, 10), [pw.x, -2, pw.z], [0, yawF, 0], null, SC); fallB.add('plain', boxGeo(w + 13, 2.5, 9), [pw.x, top - 2, pw.z], [0, yawF, 0], null, SC2);
    for (const e of [-1, 1]) { const q = pw.clone().add(new V3(-Math.sin(yawF) * (w / 2 + 6) * e, 0, -Math.cos(yawF) * (w / 2 + 6) * e)); fallB.add('stone2', cylGeo(4, 4.4, top + 10, 10, 8, 10), [q.x, -2, q.z], null, null, SC2); fallB.add('slate', new THREE.ConeGeometry(4.8, 12, 10).translate(0, 6, 0), [q.x, top + 8, q.z]); }
    const g = new THREE.PlaneGeometry(w, top, 12, 8); const P = g.attributes.position; for (let i = 0; i < P.count; i++) { const v = (P.getY(i) + top / 2) / top; P.setZ(i, Math.pow(1 - v, 2) * 6); } g.translate(0, top / 2 - 3, 0);
    const m = new THREE.Mesh(g, wfMat); const wp = path.beside(ft, lat - sg * 4.2); m.position.set(wp.x, 0, wp.z); m.rotation.y = yawF + (lat < 0 ? Math.PI / 2 : -Math.PI / 2); group.add(m); falls.push({ base: m.position.clone(), w, top }); placed.push([pw.x, pw.z, w + 12]); }
  fallB.build({ stone, stone2, plain, slate }, group);
  /* mist along the river + waterfall spray */
  const mist = new SpriteField(110, { map: puffTex(21), color: '#8a96ad', opacity: .55 }); group.add(mist.mesh);
  const mr = rng(77); const mistP = []; for (let i = 0; i < 110; i++) { if (i < 80) { const t = -8 + mr() * 60; const p = path.beside(t, (mr() - .5) * 60, 0); mistP.push([p.x, 6 + mr() * 22, p.z, 40 + mr() * 50, mr() * 6.28]); } else { const f = falls[i % falls.length]; mistP.push([f.base.x + (mr() - .5) * f.w, 4 + mr() * 14, f.base.z + (mr() - .5) * f.w, 16 + mr() * 18, mr() * 6.28]); } }
  /* rain: streaks anchored in the world, wrapped around the ship */
  const rain = new SpriteField(700, { map: dotTex(), color: '#a9b8d8', opacity: .45, axis: true }); rain.u.stretch.value = 26; group.add(rain.mesh);
  const rr = rng(5); const rainP = []; for (let i = 0; i < 700; i++) rainP.push([rr() * 90 - 45, rr() * 70, rr() * 90 - 45, .05 + rr() * .05]);
  /* electric arcs + lightning */
  const boltMat = new THREE.MeshBasicMaterial({ color: new Col('#cfe4ff').multiplyScalar(4), transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const arcMat = boltMat.clone(); arcMat.color = new Col('#9fc8ff').multiplyScalar(3.5);
  const bolt = new THREE.Mesh(new THREE.BufferGeometry(), boltMat); bolt.frustumCulled = false; group.add(bolt); let boltKey = -1;
  const arcs = new THREE.Mesh(new THREE.BufferGeometry(), arcMat); arcs.frustumCulled = false; group.add(arcs); let arcKey = -1;
  const flashLight = new THREE.PointLight('#bcd4ff', 0, 900, 1.2); group.add(flashLight);
  const sparks = new SpriteField(90, { map: dotTex(), additive: true, color: '#9fd0ff' }); group.add(sparks.mesh);
  const targets = { coil: coilTop.clone().add(new V3(0, 12, 0)), rods: rods[2].clone(), far1: path.beside(30, -420, 140), far2: path.beside(48, 520, 160) };
  const strikeAt = t => { for (let i = 0; i < STRIKES.length; i++) { const u = (t - STRIKES[i][0]) / .55; if (u >= 0 && u < 1) return { i, u }; } return null; };

  function update(t, C) {
    riverU.uTime.value = t; wfU.uTime.value = t;
    // lightning
    const s = strikeAt(t); let flash = 0;
    if (s) { const [st, tg] = STRIKES[s.i]; const T = targets[tg]; if (boltKey !== s.i) { boltKey = s.i; const top = T.clone().add(new V3((rng(s.i * 7)() - .5) * 160, 0, (rng(s.i * 13)() - .5) * 160)); top.y = 430; bolt.geometry.dispose(); bolt.geometry = boltGeometry(top, T, 100 + s.i, tg.startsWith('far') ? 3.2 : 2.0, 4); }
      const fl = Math.pow(1 - s.u, 1.4) * (.55 + .45 * (Math.sin(s.u * 40) > -.2 ? 1 : 0)); bolt.visible = true; boltMat.opacity = fl; flash = Math.max(flash, fl); flashLight.position.copy(T).add(new V3(0, 30, 0)); flashLight.intensity = fl * 6e4; }
    else { bolt.visible = false; flashLight.intensity = 0; }
    for (const sh of SHEETS) { const u = (t - sh) / .7; if (u > 0 && u < 1) flash = Math.max(flash, .55 * Math.pow(1 - u, 1.6) * (Math.sin(u * 30) > 0 ? 1 : .5)); }
    riverU.flash.value = flash; wfU.flash.value = flash;
    // continuous arcs on the coil tower + platform coils
    const ak = Math.floor(t * 9); if (ak !== arcKey) { arcKey = ak; const ra = rng(ak * 31 + 7); const geos = [];
      for (let k = 0; k < 3; k++) { const a = coilTop.clone().add(new V3(0, 7, 0)); const b = a.clone().add(new V3((ra() - .5) * 40, -8 - ra() * 30, (ra() - .5) * 40)); geos.push(boltGeometry(a, b, ak * 5 + k, .45, 1)); }
      const near = sstep(18, 22, t) * (1 - sstep(31, 34, t)); if (near > 0) for (let k = 0; k < 2; k++) { const a = rods[rods.length - 1 - k], b = rods[(k * 2 + ak) % (rods.length - 2)]; geos.push(boltGeometry(a, b, ak * 3 + k + 900, .16, 0)); }
      const all = []; for (const g of geos) { all.push(...g.attributes.position.array); g.dispose(); } arcs.geometry.dispose(); arcs.geometry = new THREE.BufferGeometry(); arcs.geometry.setAttribute('position', new THREE.Float32BufferAttribute(all, 3)); }
    arcMat.opacity = .55 + .45 * Math.abs(Math.sin(t * 37));
    // creature
    creature.update(t, C.shipPos, flash, s && STRIKES[s.i][1] === 'rods' ? 1 - s.u : 0); creature.headWorld(creatureHead);
    // sparks dancing over the creature + rods during and after strikes
    const charge = Math.max(win(22.4, 22.8, 24.5, 27, t), win(25.3, 25.6, 27, 29.5, t));
    for (let i = 0; i < 90; i++) { const q = rng(i * 17 + Math.floor(t * 12))(); if (charge > 0 && q < .7) { const rp = rng(i * 3 + Math.floor(t * 12) * 101); const k = rp(); const p = creatureHead.clone(); p.x += (rp() - .5) * 4; p.y -= k * 9; p.z += (rp() - .5) * 4; sparks.set(i, p.x, p.y, p.z, .5 + rp() * 1.2, 1, 1, 1, charge * (.4 + rp() * .6)); } else sparks.hide(i); }
    sparks.commit();
    // mist + rain
    for (let i = 0; i < mistP.length; i++) { const m = mistP[i]; mist.set(i, m[0] + Math.sin(t * .1 + m[4]) * 8, m[1] + Math.sin(t * .2 + m[4]) * 2, m[2], m[3], 1 + flash, 1 + flash, 1 + flash * 1.2, .65); } mist.commit(); mist.fog(C.fog);
    const sp = C.shipPos; for (let i = 0; i < rainP.length; i++) { const d = rainP[i]; const x = sp.x + ((d[0] - sp.x) % 90 + 135) % 90 - 45, z = sp.z + ((d[2] - sp.z) % 90 + 135) % 90 - 45; const y = sp.y + 35 - ((d[1] + t * 32) % 70);
      const nearCab = (x - sp.x) ** 2 + (z - sp.z) ** 2 < 30; rain.set(i, x, y, z, nearCab ? 0 : d[3], 1 + flash * 2, 1 + flash * 2, 1 + flash * 2, .7); } rain.commit();
    return { flash };
  }
  const anchors = { bridge: new V3(bp.x, deckY - 4, bp.z), coil: coilTop.clone().add(new V3(0, 6, 0)), creature: creatureHead, falls: falls[0].base.clone().add(new V3(0, falls[0].top * .6, 0)), castle: new V3(castle.x, H(castle.x, castle.z) + 60, castle.z), ahead: null };
  const telescope = [
    { t0: -9, t1: 12.5, name: 'THE GORGE · STONE VIADUCT', fact: 'ALPINE STORM · LIGHTNING EVERY FEW SECONDS', at: anchors.bridge, size: 120 },
    { t0: 12.5, t1: 20, name: 'GALVANIC COIL TOWER', fact: '"A SPARK OF BEING" · CH. 5', at: anchors.coil, size: 70 },
    { t0: 20, t1: 31, name: 'THE CREATURE', fact: '"ABOUT EIGHT FEET IN HEIGHT" · CH. 4', at: creatureHead, size: 9 },
    { t0: 31, t1: 50, name: 'THE LABORATORY CASTLE', fact: 'LIGHT IN EVERY WINDOW · THE WORK GOES ON', at: anchors.castle, size: 160 } ];
  return { id: 'frankenstein', group, path, update, anchors, telescope, H };
}

/* ---------------- the creature: hierarchical, ~2.45 m before scaling ---------------- */
function makeCreature(ctx) {
  const skin = ctx.mat('#b9b48c', { roughness: .75, envMapIntensity: .3 }), coat = ctx.mat('#1d1c22', { roughness: .9, envMapIntensity: .2 }), shirt = ctx.mat('#77705f', { roughness: 1 }),
    trous = ctx.mat('#2b2a2c', { roughness: 1 }), boot = ctx.mat('#121214', { roughness: .6, metalness: .1 }), hair = ctx.mat('#08080a', { roughness: .5, envMapIntensity: .5 }),
    lips = ctx.mat('#2a1c22', { roughness: .6 }), stitch = new THREE.MeshBasicMaterial({ color: '#2a1e1a' }), eyeM = new THREE.MeshBasicMaterial({ color: new Col('#e6efe0').multiplyScalar(1.4) });
  const M = (g, m, p, r, s, parent) => { const o = new THREE.Mesh(g, m); if (p) o.position.set(...p); if (r) o.rotation.set(...r); if (s) o.scale.set(...s); parent.add(o); return o; };
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  for (const s of [-1, 1]) { M(new THREE.BoxGeometry(.24, .2, .4), boot, [.16 * s, .1, .05], null, null, body); M(new THREE.CylinderGeometry(.12, .11, .5, 10), boot, [.16 * s, .38, 0], null, null, body);
    M(new THREE.CylinderGeometry(.14, .12, .55, 10), trous, [.16 * s, .78, 0], null, null, body); M(new THREE.CylinderGeometry(.16, .14, .5, 10), trous, [.16 * s, 1.2, 0], null, null, body); }
  const chest = new THREE.Group(); chest.position.y = 1.45; body.add(chest);
  M(new THREE.BoxGeometry(.62, .78, .34), shirt, [0, .38, 0], null, null, chest);
  for (const s of [-1, 1]) { M(new THREE.BoxGeometry(.3, .86, .38), coat, [.2 * s, .4, -.01], [0, 0, -.03 * s], null, chest); M(new THREE.BoxGeometry(.3, .62, .1), coat, [.2 * s, -.22, -.14], [.06, 0, .04 * s], null, chest); }
  M(new THREE.BoxGeometry(.78, .22, .4), coat, [0, .74, 0], null, null, chest);            // shoulders
  M(new THREE.CylinderGeometry(.11, .13, .2, 10), skin, [0, .9, 0], null, null, chest);   // neck
  for (const y of [.86, .93]) M(new THREE.BoxGeometry(.24, .012, .02), stitch, [0, y, .11], null, null, chest);
  const head = new THREE.Group(); head.position.set(0, 1.02, 0); chest.add(head);
  M(new THREE.SphereGeometry(.17, 20, 16), skin, [0, .14, 0], null, [.95, 1.25, 1.02], head);
  M(new THREE.BoxGeometry(.3, .05, .1), skin, [0, .22, .12], null, null, head);           // heavy brow
  M(new THREE.BoxGeometry(.12, .025, .03), lips, [0, .02, .155], null, null, head);
  for (const s of [-1, 1]) { const e = M(new THREE.SphereGeometry(.026, 8, 6), eyeM, [.065 * s, .16, .148], null, null, head); }
  M(new THREE.BoxGeometry(.2, .01, .012), stitch, [.02, .28, .14], [0, 0, -.12], null, head); for (let k = 0; k < 6; k++) M(new THREE.BoxGeometry(.008, .035, .012), stitch, [-.06 + k * .032, .28 + (-.06 + k * .032) * -.12, .142], null, null, head);
  M(new THREE.BoxGeometry(.012, .14, .012), stitch, [.11, .06, .12], [0, 0, .2], null, head);
  // long black hair
  M(new THREE.SphereGeometry(.185, 20, 12, 0, Math.PI * 2, 0, Math.PI * .55), hair, [0, .17, -.02], null, [1, 1.25, 1.05], head);
  for (let k = 0; k < 11; k++) { const a = Math.PI * .55 + k / 10 * Math.PI * .9; M(new THREE.BoxGeometry(.07, .5, .03), hair, [Math.cos(a) * .17, -.05, Math.sin(a) * -.17 - .03], [0, -a + Math.PI / 2, 0], null, head); }
  const arms = []; for (const s of [-1, 1]) { const sh = new THREE.Group(); sh.position.set(.46 * s, .66, 0); chest.add(sh);
    M(new THREE.CylinderGeometry(.11, .1, .52, 10), coat, [0, -.26, 0], null, null, sh); const el = new THREE.Group(); el.position.y = -.52; sh.add(el);
    M(new THREE.CylinderGeometry(.1, .085, .46, 10), coat, [0, -.23, 0], null, null, el); M(new THREE.CylinderGeometry(.065, .06, .06, 8), skin, [0, -.48, 0], null, null, el);
    for (let k = 0; k < 4; k++) M(new THREE.BoxGeometry(.012, .012, .1), stitch, [0, -.42, 0], [0, k * .8, 0], [1, 1, .9], el);
    M(new THREE.BoxGeometry(.14, .2, .07), skin, [0, -.6, 0], null, null, el); for (let f = 0; f < 4; f++) M(new THREE.BoxGeometry(.028, .12, .03), skin, [-.045 + f * .03, -.75, 0], null, null, el); M(new THREE.BoxGeometry(.03, .09, .03), skin, [.08 * s, -.62, .03], [0, 0, .5 * s], null, el);
    arms.push({ sh, el, s }); }
  const _v = new V3(), _w = new V3();
  return { root,
    headWorld(out) { return head.localToWorld(out.set(0, .15, 0)); },
    update(t, shipPos, flash, rodHit) {
      root.updateMatrixWorld(); _v.copy(shipPos); root.worldToLocal(_v); const want = clamp(Math.atan2(_v.x, _v.z), -1.1, 1.1); const look = win(14, 19, 34, 38, t);
      head.rotation.y = want * look + Math.sin(t * .4) * .08 * (1 - look); head.rotation.x = -.12 * look + Math.sin(t * .9) * .03;
      chest.scale.set(1 + Math.sin(t * 1.3) * .012, 1, 1 + Math.sin(t * 1.3) * .02); body.rotation.z = Math.sin(t * .5) * .015;
      // poses: idle → arms flung up on the rod strike → reaching toward the ship → slowly lowering
      const up = Math.max(win(22.55, 22.9, 23.8, 24.8, t), win(25.35, 25.7, 26.0, 26.6, t)) ;
      const reach = win(25.9, 27.0, 29.4, 31.5, t), fl = rodHit * .6;
      for (const a of arms) { const rest = .12 * a.s; let rx = 0, rz = rest, ex = -.15;
        rz = lerp(rz, 2.4 * a.s, up); rx = lerp(rx, -.3, up); ex = lerp(ex, -.2, up);
        if (a.s > 0 || a.s < 0) { const k = a.s < 0 ? reach : reach * .35; rx = lerp(rx, -1.35, k); rz = lerp(rz, .25 * a.s, k); ex = lerp(ex, -.25 + Math.sin(t * 1.5) * .08, k); }
        rz += Math.sin(t * 23 + a.s) * fl * .1; a.sh.rotation.set(rx, 0, rz); a.el.rotation.x = ex; }
      body.position.y = -fl * .02; body.rotation.x = -up * .06 + reach * .05;
    } };
}
