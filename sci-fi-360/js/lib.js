/* ARCHIVE · shared helpers: math, flight paths, geometry merging, facade textures,
   camera-facing sprite fields (seamless in 360), animated instanced people, movers. */
import * as THREE from 'three';
export const V3 = THREE.Vector3, Col = THREE.Color;
export const smooth = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
export const lerp = (a, b, k) => a + (b - a) * k;
export const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
export const sstep = (a, b, x) => smooth((x - a) / (b - a));
/** 0 outside [a,d], ramps up a→b, holds, ramps down c→d */
export const win = (a, b, c, d, x) => x <= a || x >= d ? 0 : x < b ? smooth((x - a) / (b - a)) : x > c ? 1 - smooth((x - c) / (d - c)) : 1;
export function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function hash3(x, y, z) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 1274126177)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
export function vnoise(x, y, z) { const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const c = (a, b, d) => hash3(xi + a, yi + b, zi + d); const l = (a, b, t) => a + (b - a) * t;
  return l(l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v), l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v), w); }
export function fbm(x, y, z, o) { let a = .5, f = 1, s = 0; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f, z * f); f *= 2.03; a *= .5; } return s; }

/* ---------- flight path: keys [t, x, y, z], Hermite through keys with time-based tangents ---------- */
export class FlightPath {
  constructor(keys) {
    this.k = keys.map(k => ({ t: k[0], p: new V3(k[1], k[2], k[3]), v: new V3() }));
    const k = this.k, n = k.length;
    for (let i = 0; i < n; i++) { const a = k[Math.max(0, i - 1)], b = k[Math.min(n - 1, i + 1)]; k[i].v.subVectors(b.p, a.p).divideScalar(b.t - a.t); }
    this.t0 = k[0].t; this.t1 = k[n - 1].t; this._a = new V3(); this._b = new V3();
  }
  seg(t) { const k = this.k; let i = 0; while (i < k.length - 2 && t > k[i + 1].t) i++; return i; }
  pos(t, out = new V3()) {
    const k = this.k; if (t <= this.t0) return out.copy(k[0].p).addScaledVector(k[0].v, t - this.t0);
    if (t >= this.t1) { const l = k[k.length - 1]; return out.copy(l.p).addScaledVector(l.v, t - this.t1); }
    const i = this.seg(t), A = k[i], B = k[i + 1], h = B.t - A.t, s = (t - A.t) / h, s2 = s * s, s3 = s2 * s;
    const h00 = 2 * s3 - 3 * s2 + 1, h10 = s3 - 2 * s2 + s, h01 = -2 * s3 + 3 * s2, h11 = s3 - s2;
    return out.set(0, 0, 0).addScaledVector(A.p, h00).addScaledVector(A.v, h10 * h).addScaledVector(B.p, h01).addScaledVector(B.v, h11 * h);
  }
  vel(t, out = new V3()) { const e = .05; this.pos(t + e, this._a); this.pos(t - e, this._b); return out.subVectors(this._a, this._b).divideScalar(2 * e); }
  /** heading (three.js rotation.y, forward = -z), averaged over a window so turns stay gentle */
  yaw(t) { if (!this._yt) this._bake(); const f = (t - this._y0) * 20; if (f >= 0 && f < this._yt.length - 1) { const i = Math.floor(f), k = f - i, a = this._yt[i], b = this._yt[i + 1]; return a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k; } return this.yawExact(t); }
  _bake() { this._y0 = this.t0 - 40; const n = Math.ceil((this.t1 + 40 - this._y0) * 20) + 1; this._yt = new Float32Array(n); for (let i = 0; i < n; i++) this._yt[i] = this.yawExact(this._y0 + i / 20); }
  yawExact(t) { let x = 0, z = 0; const v = new V3(); for (let i = -3; i <= 3; i++) { this.vel(t + i * .5, v); const w = 1 - Math.abs(i) / 4; x += v.x * w; z += v.z * w; } return Math.atan2(-x, -z); }
  /** point beside the path: lateral metres to the right of travel, up metres above the path */
  beside(t, lateral, up = 0, out = new V3()) { const y = this.yaw(t); this.pos(t, out); out.x += Math.cos(y) * lateral; out.z += -Math.sin(y) * lateral; out.y += up; return out; }
  speed(t) { return this.vel(t, new V3()).length(); }
}
export const angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

/* ---------- geometry merging ---------- */
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new V3(), _p = new V3();
export function mat4(p, r, s) { p ??= [0, 0, 0]; r ??= [0, 0, 0]; s ??= [1, 1, 1]; return new THREE.Matrix4().compose(_p.set(...p), _q.setFromEuler(_e.set(r[0], r[1], r[2], 'YXZ')), _s.set(...(Array.isArray(s) ? s : [s, s, s]))); }
/** Collects parts per material key, then merges each key into one mesh (few draw calls). */
export class Builder {
  constructor() { this.parts = {}; }
  add(key, geo, p, r, s, color) { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(mat4(p, r, s)); (this.parts[key] ||= []).push({ g, color }); return this; }
  addM(key, geo, matrix, color) { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(matrix); (this.parts[key] ||= []).push({ g, color }); return this; }
  build(mats, parent) { const out = {}; for (const key in this.parts) { const geo = mergeParts(this.parts[key]); const m = new THREE.Mesh(geo, mats[key]); m.matrixAutoUpdate = false; m.updateMatrix(); parent?.add(m); out[key] = m; } this.parts = {}; return out; }
}
const _c = new Col();
export function mergeParts(parts) {
  let n = 0; for (const p of parts) n += p.g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Float32Array(n * 3); let o = 0;
  for (const { g, color } of parts) { const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, c = P.count;
    pos.set(P.array, o * 3); if (N) nor.set(N.array, o * 3); if (U) uv.set(U.array, o * 2);
    _c.set(color ?? 0xffffff); for (let i = 0; i < c; i++) { col[(o + i) * 3] = _c.r; col[(o + i) * 3 + 1] = _c.g; col[(o + i) * 3 + 2] = _c.b; }
    o += c; g.dispose(); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeBoundingSphere(); return geo;
}
/** box with its base at y=0 and UVs in metres / tile, so facade textures keep one scale */
export function boxGeo(w, h, d, tw = 8, th = 8) { const g = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0); const uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * dims[f][0] / tw, uv.getY(k) * dims[f][1] / th); } return g; }
export function cylGeo(rt, rb, h, seg = 16, tw = 8, th = 8, open = false) { const g = new THREE.CylinderGeometry(rt, rb, h, seg, 1, open).translate(0, h / 2, 0); const uv = g.attributes.uv; const circ = Math.PI * (rt + rb);
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * circ / tw, uv.getY(i) * h / th); return g; }
/** a thick beam between two points (box section) */
export function beamGeo(a, b, w, d = w) { const dir = new V3().subVectors(b, a); const len = dir.length(); const g = new THREE.BoxGeometry(w, len, d); const q = new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), dir.normalize());
  g.applyMatrix4(new THREE.Matrix4().compose(new V3().addVectors(a, b).multiplyScalar(.5), q, new V3(1, 1, 1))); return g; }
export function cylBetween(a, b, r, seg = 6) { const dir = new V3().subVectors(b, a); const len = dir.length(); const g = new THREE.CylinderGeometry(r, r, len, seg, 1, true); const q = new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), dir.normalize());
  g.applyMatrix4(new THREE.Matrix4().compose(new V3().addVectors(a, b).multiplyScalar(.5), q, new V3(1, 1, 1))); return g; }

/* ---------- canvas facade textures: {map, emi}; one tile = tw x th metres ---------- */
function canvasTex(c, srgb = true) { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function pair(W, H, draw) { const a = document.createElement('canvas'), b = document.createElement('canvas'); a.width = b.width = W; a.height = b.height = H; draw(a.getContext('2d'), b.getContext('2d'), W, H); return { map: canvasTex(a), emi: canvasTex(b) }; }
export function gothicTex(seed = 1) { const r = rng(seed); return pair(256, 256, (x, e, W, H) => {
  x.fillStyle = '#5a5a62'; x.fillRect(0, 0, W, H); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 16) for (let i = -1; i < W / 32 + 1; i++) { const off = (y / 16) % 2 ? 16 : 0; const v = 70 + r() * 40; x.fillStyle = `rgb(${v},${v},${v + 8})`; x.fillRect(i * 32 + off + 1, y + 1, 30, 14); }
  const arch = (c, X, Y, w, h) => { c.beginPath(); c.moveTo(X, Y + h); c.lineTo(X, Y + w * .6); c.quadraticCurveTo(X, Y, X + w / 2, Y - w * .15); c.quadraticCurveTo(X + w, Y, X + w, Y + w * .6); c.lineTo(X + w, Y + h); c.closePath(); };
  for (const cx of [40, 168]) { x.fillStyle = '#15161c'; arch(x, cx, 70, 48, 140); x.fill(); x.strokeStyle = '#8a8a90'; x.lineWidth = 6; x.stroke();
    const lit = r() < .55; if (lit) { const g = e.createLinearGradient(0, 70, 0, 210); g.addColorStop(0, '#ffb35a'); g.addColorStop(1, '#ff8a2a'); e.fillStyle = g; arch(e, cx + 4, 74, 40, 132); e.fill(); }
    x.strokeStyle = '#2a2a30'; x.lineWidth = 4; x.beginPath(); x.moveTo(cx + 24, 64); x.lineTo(cx + 24, 210); x.moveTo(cx, 140); x.lineTo(cx + 48, 140); x.stroke(); e.strokeStyle = '#000'; e.lineWidth = 5; e.beginPath(); e.moveTo(cx + 24, 64); e.lineTo(cx + 24, 210); e.moveTo(cx, 140); e.lineTo(cx + 48, 140); e.stroke(); }
  x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, 236, W, 20); }); }
export function brickTex(seed = 2) { const r = rng(seed); return pair(256, 256, (x, e, W, H) => {
  x.fillStyle = '#6a3a2a'; x.fillRect(0, 0, W, H); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 8) for (let i = -1; i < W / 20 + 1; i++) { const off = (y / 8) % 2 ? 10 : 0; const v = r(); x.fillStyle = `rgb(${110 + v * 40},${55 + v * 20},${40 + v * 14})`; x.fillRect(i * 20 + off, y, 19, 7); }
  for (const cx of [20, 140]) { x.fillStyle = '#2a2420'; x.fillRect(cx, 40, 96, 150); const lit = r() < .8;
    for (let a = 0; a < 4; a++) for (let b = 0; b < 6; b++) { const X = cx + 4 + a * 23, Y = 44 + b * 24; const k = r(); x.fillStyle = k < .2 ? '#4a4038' : '#3a3530'; x.fillRect(X, Y, 20, 21); if (lit && k > .12) { e.fillStyle = `rgb(255,${150 + k * 60 | 0},${60 + k * 40 | 0})`; e.fillRect(X, Y, 20, 21); } } }
  x.fillStyle = '#4a2a20'; x.fillRect(0, 200, W, 10); }); }
export function decoTex(seed = 3, base = '#d8cdb4') { const r = rng(seed); return pair(256, 512, (x, e, W, H) => {
  x.fillStyle = base; x.fillRect(0, 0, W, H); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  for (let i = 0; i < 8; i++) { const X = i * 32 + 9; for (let y = 6; y < H; y += 32) { const k = r(); x.fillStyle = k < .5 ? '#2c3440' : '#3a4452'; x.fillRect(X, y, 14, 24); if (k > .82) { e.fillStyle = k > .93 ? '#ffe7b0' : '#c9d8ff'; e.globalAlpha = .9; e.fillRect(X, y, 14, 24); e.globalAlpha = 1; } } }
  x.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 8; i++) x.fillRect(i * 32 + 2, 0, 4, H);
  x.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 8; i++) x.fillRect(i * 32 + 27, 0, 3, H); }); }
export function panelTex() { return pair(256, 256, (x, e, W, H) => {
  x.fillStyle = '#e9eef2'; x.fillRect(0, 0, W, H); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  x.strokeStyle = '#c4ccd4'; x.lineWidth = 3; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, H); x.stroke(); x.beginPath(); x.moveTo(0, i * 64); x.lineTo(W, i * 64); x.stroke(); }
  x.fillStyle = '#5d7a8e'; x.fillRect(0, 96, W, 40); e.fillStyle = '#7fd8ff'; e.globalAlpha = .55; for (let i = 0; i < 8; i++) e.fillRect(i * 32 + 4, 100, 24, 32); }); }
export function solarTex() { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#0f2348'; x.fillRect(0, 0, 128, 128);
  x.strokeStyle = '#7f95b8'; x.lineWidth = 2; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * 16, 0); x.lineTo(i * 16, 128); x.stroke(); x.beginPath(); x.moveTo(0, i * 16); x.lineTo(128, i * 16); x.stroke(); }
  x.fillStyle = 'rgba(120,170,255,.18)'; x.fillRect(0, 0, 128, 40); return canvasTex(c); }
export function signTex(text, w = 2048, h = 256, fg = '#ffe2a0', bg = '#1d120c') { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, w, h); x.strokeStyle = fg; x.lineWidth = 10; x.strokeRect(14, 14, w - 28, h - 28);
  x.fillStyle = fg; x.font = `800 ${h * .52}px Georgia, "Times New Roman", serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.letterSpacing = `${h * .06}px`; x.fillText(text, w / 2, h * .54);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
export function puffTex(seed = 7) { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const r = rng(seed);
  for (let i = 0; i < 16; i++) { const px = 34 + r() * 60, py = 34 + r() * 60, rad = 18 + r() * 26; const g = x.createRadialGradient(px, py, 0, px, py, rad); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }
  const t = new THREE.CanvasTexture(c); return t; }
export function dotTex() { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); }

/* ---------- sprite field: instanced quads that face the camera POSITION (no seams between 360 cube faces) ---------- */
export class SpriteField {
  constructor(n, { map, additive = false, fog = true, color = '#ffffff', opacity = 1, axis = false, depthTest = true } = {}) {
    const g = new THREE.InstancedBufferGeometry(); const base = new THREE.PlaneGeometry(1, 1); g.index = base.index; g.setAttribute('position', base.attributes.position); g.setAttribute('uv', base.attributes.uv);
    this.c = new Float32Array(n * 4); this.k = new Float32Array(n * 4); // center xyz + size ; color rgb + alpha
    this.aC = new THREE.InstancedBufferAttribute(this.c, 4); this.aK = new THREE.InstancedBufferAttribute(this.k, 4); this.aC.setUsage(THREE.DynamicDrawUsage); this.aK.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('aC', this.aC); g.setAttribute('aK', this.aK); g.instanceCount = n; this.n = n;
    this.u = { map: { value: map }, tint: { value: new Col(color) }, opacity: { value: opacity }, axis: { value: new V3(0, axis ? 1 : 0, 0) }, fogColor: { value: new Col() }, fogDensity: { value: 0 }, stretch: { value: 1 } };
    this.mat = new THREE.ShaderMaterial({ uniforms: this.u, transparent: true, depthWrite: false, depthTest, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, fog: false,
      vertexShader: `attribute vec4 aC; attribute vec4 aK; uniform vec3 axis; uniform float stretch; varying vec2 vUv; varying vec4 vK; varying float vD;
        void main(){ vUv=uv; vK=aK; vec3 c=aC.xyz; vec3 d=normalize(cameraPosition-c); vec3 up, rt;
          if(axis.y>.5){ up=vec3(0.,1.,0.); rt=normalize(cross(up,d)); } else { vec3 a=abs(d.y)>.95?vec3(1.,0.,0.):vec3(0.,1.,0.); rt=normalize(cross(a,d)); up=cross(d,rt); }
          vec3 p=c+rt*position.x*aC.w+up*position.y*aC.w*(axis.y>.5?stretch:1.); vD=length(cameraPosition-p); gl_Position=projectionMatrix*viewMatrix*vec4(p,1.); }`,
      fragmentShader: `uniform sampler2D map; uniform vec3 tint,fogColor; uniform float opacity,fogDensity; varying vec2 vUv; varying vec4 vK; varying float vD;
        void main(){ vec4 t=texture2D(map,vUv); float f=1.-exp(-fogDensity*fogDensity*vD*vD); vec3 col=mix(tint*vK.rgb,fogColor,clamp(f,0.,1.)*${additive ? '0.' : '1.'});
          float a=t.a*vK.a*opacity*${additive ? '(1.-clamp(f,0.,1.))' : '1.'}; if(a<.003) discard; gl_FragColor=vec4(col*${additive ? 't.rgb' : 'vec3(1.)'},a);
          #include <colorspace_fragment>
        }` });
    this.mesh = new THREE.Mesh(g, this.mat); this.mesh.frustumCulled = false;
  }
  set(i, x, y, z, size, r = 1, g = 1, b = 1, a = 1) { const o = i * 4; this.c[o] = x; this.c[o + 1] = y; this.c[o + 2] = z; this.c[o + 3] = size; this.k[o] = r; this.k[o + 1] = g; this.k[o + 2] = b; this.k[o + 3] = a; }
  hide(i) { this.k[i * 4 + 3] = 0; this.c[i * 4 + 3] = 0; }
  commit() { this.aC.needsUpdate = true; this.aK.needsUpdate = true; }
  fog(sceneFog) { this.u.fogColor.value.copy(sceneFog.color); this.u.fogDensity.value = sceneFog.density; }
}

/* ---------- people: one instanced mesh, limbs swing in the vertex shader ---------- */
function personGeo() {
  const parts = []; const P = (geo, p, part, skin, s) => { const g = geo.toNonIndexed(); g.applyMatrix4(mat4(p, [0, 0, 0], s || [1, 1, 1])); const n = g.attributes.position.count; g.setAttribute('aPart', new THREE.BufferAttribute(new Float32Array(n).fill(part), 1)); g.setAttribute('aSkin', new THREE.BufferAttribute(new Float32Array(n).fill(skin), 1)); parts.push(g); };
  P(new THREE.BoxGeometry(.42, .62, .25), [0, 1.3, 0], 0, 0);              // torso
  P(new THREE.BoxGeometry(.38, .14, .24), [0, .95, 0], 0, 0);              // hips
  P(new THREE.CylinderGeometry(.055, .065, .1, 6), [0, 1.65, 0], 0, 1);   // neck
  P(new THREE.SphereGeometry(.12, 10, 8), [0, 1.78, 0], 0, 1, [1, 1.12, 1.05]); // head
  for (const s of [-1, 1]) {
    P(new THREE.BoxGeometry(.16, .86, .18), [.11 * s, .47, 0], s < 0 ? 1 : 2, 0);   // legs (pivot hip .9)
    P(new THREE.BoxGeometry(.17, .07, .26), [.11 * s, .035, .04], s < 0 ? 1 : 2, 0);
    P(new THREE.BoxGeometry(.11, .6, .12), [.28 * s, 1.27, 0], s < 0 ? 3 : 4, 0);   // arms (pivot shoulder 1.57)
    P(new THREE.SphereGeometry(.055, 6, 5), [.28 * s, .93, 0], s < 0 ? 3 : 4, 1);   // hands
  }
  const g = mergeAttrGeos(parts); return g;
}
function mergeAttrGeos(list) { let n = 0; for (const g of list) n += g.attributes.position.count; const out = new THREE.BufferGeometry();
  for (const name of ['position', 'normal', 'aPart', 'aSkin']) { const sz = list[0].attributes[name].itemSize; const arr = new Float32Array(n * sz); let o = 0; for (const g of list) { arr.set(g.attributes[name].array, o); o += g.attributes[name].array.length; } out.setAttribute(name, new THREE.BufferAttribute(arr, sz)); }
  return out; }
let _personGeo = null;
export class People {
  /** opts: skin colour, envMats list to register, stride speed */
  constructor(n, { skin = '#e8c9b0', roughness = .8, stride = 7, emissive = null, envMats } = {}) {
    _personGeo ||= personGeo(); const g = _personGeo.clone();
    this.anim = new Float32Array(n * 2); this.aAnim = new THREE.InstancedBufferAttribute(this.anim, 2); this.aAnim.setUsage(THREE.DynamicDrawUsage); g.setAttribute('aAnim', this.aAnim);
    this.u = { uTime: { value: 0 }, uStride: { value: stride }, uSkin: { value: new Col(skin) } };
    const m = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness, envMapIntensity: .4, ...(emissive ? { emissive, emissiveIntensity: .25 } : {}) }); envMats?.push(m);
    m.onBeforeCompile = sh => { Object.assign(sh.uniforms, this.u);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>
        attribute float aPart; attribute float aSkin; attribute vec2 aAnim; uniform float uTime, uStride; varying float vSkin; varying float vLeg;
        vec3 swingX(vec3 p, vec3 piv, float a){ vec3 q=p-piv; float c=cos(a), s=sin(a); return piv+vec3(q.x, c*q.y-s*q.z, s*q.y+c*q.z); }`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>
        vSkin=aSkin; vLeg=step(.5,aPart)*step(aPart,2.5);
        float ph=uTime*uStride+aAnim.x; float g=clamp(aAnim.y,0.,1.); float sw=sin(ph)*g; float raise=clamp(-aAnim.y,0.,1.);
        if(aPart>.5&&aPart<1.5) transformed=swingX(transformed,vec3(0.,.9,0.),sw*.55);
        else if(aPart>1.5&&aPart<2.5) transformed=swingX(transformed,vec3(0.,.9,0.),-sw*.55);
        else if(aPart>2.5&&aPart<3.5) transformed=swingX(transformed,vec3(0.,1.57,0.),-sw*.45-raise*2.6);
        else if(aPart>3.5) transformed=swingX(transformed,vec3(0.,1.57,0.),sw*.45-raise*2.6);
        transformed.y+=abs(sw)*.035;`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        uniform vec3 uSkin; varying float vSkin; varying float vLeg;`).replace('#include <color_fragment>', `#include <color_fragment>
        diffuseColor.rgb=mix(diffuseColor.rgb*(1.-.35*vLeg),uSkin,vSkin);`); };
    this.mesh = new THREE.InstancedMesh(g, m, n); this.mesh.frustumCulled = false; this.n = n; this.mat = m;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); const c = new Col('#888'); for (let i = 0; i < n; i++) { this.mesh.setColorAt(i, c); this.place(i, 0, -9999, 0, 0, 0); }
  }
  /** gait: 0 stand, 1 walk, -1 arms raised */
  place(i, x, y, z, yaw, gait = 1, phase = 0, scale = 1) { const a = this.mesh.instanceMatrix.array, o = i * 16, c = Math.cos(yaw) * scale, s = Math.sin(yaw) * scale;
    a[o] = c; a[o + 1] = 0; a[o + 2] = -s; a[o + 3] = 0; a[o + 4] = 0; a[o + 5] = scale; a[o + 6] = 0; a[o + 7] = 0; a[o + 8] = s; a[o + 9] = 0; a[o + 10] = c; a[o + 11] = 0; a[o + 12] = x; a[o + 13] = y; a[o + 14] = z; a[o + 15] = 1;
    this.anim[i * 2] = phase; this.anim[i * 2 + 1] = gait; }
  color(i, c) { this.mesh.setColorAt(i, _c.set(c)); }
  commit(t) { this.u.uTime.value = t; this.mesh.instanceMatrix.needsUpdate = true; this.aAnim.needsUpdate = true; if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true; }
}

/* ---------- movers: instanced vehicles running along straight lanes ---------- */
export class Movers {
  constructor(geo, mat, lanes, perLane, seed = 5) { this.lanes = lanes; this.items = []; const r = rng(seed);
    for (const L of lanes) { const dir = new V3().subVectors(L.b, L.a); L.len = dir.length(); L.dir = dir.normalize(); L.yaw = Math.atan2(-L.dir.x, -L.dir.z); L.pitch = Math.asin(clamp(L.dir.y, -1, 1));
      const k = L.n ?? perLane; for (let i = 0; i < k; i++) this.items.push({ L, off: (i + r() * .6) / k * L.len, sp: (L.speed ?? 20) * (.85 + r() * .3), col: L.colors ? L.colors[Math.floor(r() * L.colors.length)] : null, s: L.scale ?? 1 }); }
    this.mesh = new THREE.InstancedMesh(geo, mat, this.items.length); this.mesh.frustumCulled = false; this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.items.forEach((it, i) => { if (it.col) this.mesh.setColorAt(i, _c.set(it.col)); });
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._e = new THREE.Euler(); this._p = new V3(); this._s = new V3(); }
  update(t) { this.items.forEach((it, i) => { const L = it.L; const d = ((it.off + it.sp * t) % L.len + L.len) % L.len; this._p.copy(L.a).addScaledVector(L.dir, d);
      if (L.bob) this._p.y += Math.sin(t * .8 + it.off) * L.bob; const fade = Math.min(1, d / 40, (L.len - d) / 40);
      this._m.compose(this._p, this._q.setFromEuler(this._e.set(L.pitch, L.yaw, 0, 'YXZ')), this._s.setScalar(it.s * Math.max(.001, fade))); this.mesh.setMatrixAt(i, this._m); });
    this.mesh.instanceMatrix.needsUpdate = true; }
}

/* ---------- lightning: jagged ribbon bolt, rebuilt per strike ---------- */
export function boltGeometry(a, b, seed, width = 1.6, branches = 3) {
  const r = rng(seed); const pts = [a.clone(), b.clone()];
  let disp = a.distanceTo(b) * .18; for (let it = 0; it < 6; it++) { const next = [pts[0]]; for (let i = 0; i < pts.length - 1; i++) { const m = new V3().lerpVectors(pts[i], pts[i + 1], .45 + r() * .1); m.x += (r() - .5) * disp; m.z += (r() - .5) * disp; m.y += (r() - .5) * disp * .3; next.push(m, pts[i + 1]); } pts.length = 0; pts.push(...next); disp *= .55; }
  const lines = [{ pts, w: width }];
  for (let k = 0; k < branches; k++) { const i0 = Math.floor(pts.length * (.15 + r() * .5)); const s = pts[i0]; const bp = [s.clone()]; let p = s.clone(); const dir = new V3(r() - .5, -.6 - r() * .4, r() - .5).normalize(); const L = a.distanceTo(b) * (.08 + r() * .14);
    for (let j = 0; j < 10; j++) { p = p.clone().addScaledVector(dir, L / 10); p.x += (r() - .5) * L * .12; p.z += (r() - .5) * L * .12; bp.push(p); } lines.push({ pts: bp, w: width * .5 }); }
  const pos = []; for (const { pts: P, w } of lines) for (let i = 0; i < P.length - 1; i++) { const A = P[i], B = P[i + 1];
    for (const ax of [new V3(w, 0, 0), new V3(0, 0, w)]) { const a1 = A.clone().sub(ax), a2 = A.clone().add(ax), b1 = B.clone().sub(ax), b2 = B.clone().add(ax); pos.push(a1.x, a1.y, a1.z, a2.x, a2.y, a2.z, b2.x, b2.y, b2.z, a1.x, a1.y, a1.z, b2.x, b2.y, b2.z, b1.x, b1.y, b1.z); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); return g; }
