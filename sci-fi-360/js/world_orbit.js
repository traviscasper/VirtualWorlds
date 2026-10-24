/* WORLD 4 · A SUSTAINABLE FUTURE — orbital habitats where technology keeps life going. */
import * as THREE from 'three';
import { V3, Col, lerp, clamp, smooth, sstep, win, rng, fbm, FlightPath, Builder, boxGeo, cylGeo, beamGeo, cylBetween, panelTex, solarTex, SpriteField, puffTex, dotTex, People, Movers, mat4 } from './lib.js';

export function buildOrbit(ctx) {
  const group = new THREE.Group(); group.name = 'orbit';
  const path = new FlightPath([[116, 0, -60, 900], [123, 0, -20, 760], [130, 0, 0, 620], [137, 0, 0, 480], [144, 4, -8, 340], [151, 12, -20, 200], [158, 14, -28, 70], [165, 4, -26, -50], [171, -10, -20, -140], [177, -20, -14, -200], [184, -26, -10, -232]]);
  const r = rng(2100);
  const pt = panelTex(); const hull = ctx.mat('#ffffff', { map: pt.map, emissiveMap: pt.emi, emissive: '#ffffff', emissiveIntensity: .9, roughness: .35, metalness: .25, envMapIntensity: .9, vertexColors: true });
  const white = ctx.mat('#ffffff', { roughness: .3, metalness: .2, envMapIntensity: .9, vertexColors: true });
  const dark = ctx.mat('#2a3340', { roughness: .4, metalness: .7, envMapIntensity: .8 });
  const lightB = new THREE.MeshBasicMaterial({ color: new Col('#bfe9ff').multiplyScalar(2.2) }), lightW = new THREE.MeshBasicMaterial({ color: new Col('#fff6e0').multiplyScalar(2.2) });
  const st = solarTex(); st.repeat.set(1, 1); const solar = ctx.mat('#ffffff', { map: st, roughness: .25, metalness: .6, envMapIntensity: 1.3, emissive: '#0a1a40', emissiveIntensity: .4 });
  const grass = ctx.mat('#ffffff', { roughness: .9, vertexColors: true, envMapIntensity: .3, flatShading: true });
  const rock = ctx.mat('#7d7468', { roughness: .95, flatShading: true, envMapIntensity: .3 });
  const water = ctx.mat('#3f8fb8', { roughness: .08, metalness: .3, envMapIntensity: 1.5, emissive: '#0c3048', emissiveIntensity: .5 });
  const B = new Builder();
  /* ---- glass dome shader (ribs from uv; fresnel rim) ---- */
  const domeMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { tint: { value: new Col('#cfefff') } },
    vertexShader: `varying vec3 vN; varying vec3 vW; varying vec2 vUv; void main(){ vUv=uv; vW=(modelMatrix*vec4(position,1.)).xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }`,
    fragmentShader: `uniform vec3 tint; varying vec3 vN; varying vec3 vW; varying vec2 vUv;
      void main(){ vec3 v=normalize(cameraPosition-vW); float f=1.-abs(dot(normalize(vN),v)); float a=.05+.5*pow(f,3.);
        vec2 g=vec2(vUv.x*48.,vUv.y*14.); vec2 d=abs(fract(g)-.5); float line=1.-smoothstep(.0,.06,min(d.x,d.y)); a=max(a,line*.55); vec3 c=mix(tint,vec3(1.),line*.6);
        gl_FragColor=vec4(c,a);
        #include <colorspace_fragment>
      }` });
  /* ---- ring habitat: we fly through its centre at t = 137 ---- */
  const RING = { c: new V3(0, 0, 480), R: 165, tube: 22 };
  const ring = new THREE.Group(); ring.position.copy(RING.c); group.add(ring);
  { const rb = new Builder(); rb.add('hull', new THREE.TorusGeometry(RING.R, RING.tube, 28, 220), [0, 0, 0], null, [1, 1, .62], '#f2f5f8');
    for (let k = 0; k < 36; k++) { const a = k / 36 * Math.PI * 2; rb.add('dark', boxGeo(4, RING.tube * 2.3, 34, 4, 4), [Math.cos(a) * RING.R, Math.sin(a) * RING.R, 0], [0, 0, a - Math.PI / 2]); if (k % 3 === 0) rb.add('lightB', new THREE.SphereGeometry(1.4, 8, 6), [Math.cos(a) * (RING.R - RING.tube - 1), Math.sin(a) * (RING.R - RING.tube - 1), 0]); }
    for (let k = 0; k < 12; k++) { const a = (k + .5) / 12 * Math.PI * 2; const p = new V3(Math.cos(a) * (RING.R + RING.tube + 2), Math.sin(a) * (RING.R + RING.tube + 2), 0); rb.add('solar', boxGeo(26, 1, 60, 26, 60), [p.x, p.y, p.z], [0, 0, a - Math.PI / 2]); }
    rb.build({ hull, dark, lightB, solar }, ring);
    // the inner window band shows the farmland inside
    const c = document.createElement('canvas'); c.width = 2048; c.height = 128; const x = c.getContext('2d'); const fr = rng(9);
    for (let i = 0; i < 2048; i += 8) { const g = fr(); x.fillStyle = g < .55 ? `rgb(${60 + g * 60 | 0},${120 + g * 80 | 0},${50 + g * 30 | 0})` : g < .75 ? '#9fbf5a' : g < .85 ? '#3a8fb8' : '#e8e6dc'; x.fillRect(i, 18, 8, 92); }
    x.fillStyle = '#d8e0e8'; for (let i = 0; i < 2048; i += 64) x.fillRect(i, 0, 4, 128); x.fillRect(0, 0, 2048, 18); x.fillRect(0, 110, 2048, 18);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.repeat.set(3, 1); t.anisotropy = 8;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(RING.R - RING.tube * .62, RING.R - RING.tube * .62, 26, 220, 1, true).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: '#ffffff', emissiveIntensity: .55, roughness: .2, metalness: .1, side: THREE.BackSide, envMapIntensity: .8 }));
    ctx.envMats.push(band.material); ring.add(band); }
  /* ---- biosphere platform A (right): the great dome with a waterfall ---- */
  const A = { c: new V3(132, -110, 190), R: 120 };
  const fallU = { uTime: { value: 0 } };
  function biosphere(P, R, opts = {}) { const top = P.y;
    B.add('white', cylGeo(R * 1.25, R * 1.12, 10, 64, 8, 8), [P.x, top - 10, P.z], null, null, '#e6ebf0'); B.add('dark', new THREE.ConeGeometry(R * 1.12, R * .55, 48).rotateX(Math.PI).translate(0, -R * .275, 0), [P.x, top - 10, P.z]);
    B.add('lightB', new THREE.TorusGeometry(R * 1.25, .9, 6, 96), [P.x, top - 2, P.z], [Math.PI / 2, 0, 0]);
    // landscape mound with vertex-coloured meadows
    const g = new THREE.CircleGeometry(R * .97, 48, 0, Math.PI * 2); g.rotateX(-Math.PI / 2); const Pp = g.attributes.position; const col = new Float32Array(Pp.count * 3); const cc = new Col();
    const gp = new THREE.PlaneGeometry(R * 1.94, R * 1.94, 48, 48).rotateX(-Math.PI / 2); const P2 = gp.attributes.position; const col2 = new Float32Array(P2.count * 3);
    for (let i = 0; i < P2.count; i++) { const x = P2.getX(i), z = P2.getZ(i); const d = Math.hypot(x, z) / (R * .97); let h = d > 1 ? -2 : (1 - d * d) * R * .22 * (.6 + fbm(x * .02 + P.x, z * .02, 3, 3) * .8); if (opts.lake && Math.hypot(x - opts.lake[0], z - opts.lake[1]) < opts.lake[2]) h = Math.min(h, 1);
      P2.setY(i, h); cc.set('#4f8f3a').lerp(new Col('#86b84a'), fbm(x * .05, z * .05, 7, 2)); if (h < 2) cc.set('#c9c29a'); col2.set([cc.r, cc.g, cc.b], i * 3); }
    gp.setAttribute('color', new THREE.BufferAttribute(col2, 3)); gp.computeVertexNormals(); B.add('grass', gp, [P.x, top, P.z]);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2), domeMat); dome.position.copy(P); dome.renderOrder = 5; group.add(dome);
    B.add('white', new THREE.TorusGeometry(R, 1.4, 8, 96), [P.x, top + .5, P.z], [Math.PI / 2, 0, 0], null, '#ffffff');
    // white terraced buildings around the rim
    const br = rng(Math.floor(P.x * 13 + P.z)); for (let i = 0; i < (opts.houses ?? 26); i++) { const a = br() * Math.PI * 2, d = R * (.62 + br() * .3); const x = P.x + Math.cos(a) * d, z = P.z + Math.sin(a) * d; const h = 4 + br() * 12;
      B.add('white', boxGeo(8 + br() * 10, h, 8 + br() * 10, 4, 4), [x, top + 1, z], [0, a, 0], null, '#f4f2ec'); B.add('grass', boxGeo(6, .8, 6), [x, top + h + 1, z], [0, a, 0], null, '#5e9a3e'); if (br() < .5) B.add('lightW', new THREE.BoxGeometry(6, 1, .3), [x + Math.cos(a) * 5, top + h * .6, z + Math.sin(a) * 5], [0, -a, 0]); }
    return top; }
  biosphere(A.c, A.R, { lake: [-40, -10, 34], houses: 30 });
  // central rock spire with the waterfall, on the side facing the flight path
  { const sp = A.c.clone().add(new V3(-30, 0, -6)); const g = new THREE.CylinderGeometry(9, 22, 78, 9, 6); const P = g.attributes.position; const rr = rng(4); for (let i = 0; i < P.count; i++) P.setXYZ(i, P.getX(i) * (.8 + rr() * .45), P.getY(i), P.getZ(i) * (.8 + rr() * .45)); g.translate(0, 39, 0); g.computeVertexNormals();
    B.add('rock', g, [sp.x, A.c.y, sp.z]); B.add('grass', new THREE.SphereGeometry(11, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), [sp.x, A.c.y + 76, sp.z], null, [1, .4, 1], '#4f8f3a');
    const lake = new THREE.Mesh(new THREE.CircleGeometry(34, 40).rotateX(-Math.PI / 2), water); lake.position.set(A.c.x - 40, A.c.y + 1.4, A.c.z - 10); group.add(lake);
    const fm = new THREE.ShaderMaterial({ uniforms: fallU, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform float uTime; varying vec2 vUv; float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
        float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
        void main(){ vec2 q=vec2(vUv.x*16.,vUv.y*4.-uTime*2.6); float s=n(q)*.55+n(q*vec2(1.,3.)+7.)*.45; float a=smoothstep(.2,.8,s)*smoothstep(0.,.15,vUv.x)*smoothstep(1.,.85,vUv.x);
          gl_FragColor=vec4(mix(vec3(.6,.82,.95),vec3(1.),s)*1.2,a*.9);
          #include <colorspace_fragment>
        }` });
    const wg = new THREE.PlaneGeometry(16, 76, 8, 8); const WP = wg.attributes.position; for (let i = 0; i < WP.count; i++) { const v = (WP.getY(i) + 38) / 76; WP.setZ(i, Math.pow(1 - v, 2) * 8); } wg.translate(0, 38, 0);
    const wf = new THREE.Mesh(wg, fm); wf.position.set(sp.x - 14, A.c.y, sp.z - 2); wf.rotation.y = -Math.PI / 2; group.add(wf);
    A.fall = wf.position.clone().add(new V3(0, 40, 0)); A.spray = wf.position.clone(); }
  // river from the lake to the rim
  { const rv = new THREE.Mesh(new THREE.PlaneGeometry(9, 70).rotateX(-Math.PI / 2), water); rv.position.set(A.c.x - 80, A.c.y + 1.2, A.c.z - 30); rv.rotation.y = .7; group.add(rv); }
  // secondary domes on platform A's far side
  biosphere(A.c.clone().add(new V3(150, 6, -120)), 64, { houses: 14 }); biosphere(A.c.clone().add(new V3(170, -4, 120)), 56, { houses: 12 });
  /* ---- platform B: ahead, framed for the final message ---- */
  const BP = new V3(-110, -96, -540); biosphere(BP, 86, { lake: [20, 30, 22], houses: 22 }); biosphere(BP.clone().add(new V3(-150, 10, -60)), 52, { houses: 10 }); biosphere(BP.clone().add(new V3(140, -8, -90)), 46, { houses: 10 });
  /* ---- trees in every dome ---- */
  const treeGeo = (() => { const b = new Builder(); b.add('t', new THREE.CylinderGeometry(.35, .55, 4, 6).translate(0, 2, 0), null, null, null, '#6a4a2e'); b.add('t', new THREE.IcosahedronGeometry(3, 0), [0, 5.6, 0], null, [1, 1.25, 1], '#ffffff'); b.add('t', new THREE.IcosahedronGeometry(2.2, 0), [.6, 8.2, .3], null, null, '#ffffff'); return b.build({ t: null }).t.geometry; })();
  const treeMat = ctx.mat('#ffffff', { vertexColors: true, roughness: .85, flatShading: true, envMapIntensity: .35 });
  const domes = [[A.c, A.R], [A.c.clone().add(new V3(150, 6, -120)), 64], [A.c.clone().add(new V3(170, -4, 120)), 56], [BP, 86], [BP.clone().add(new V3(-150, 10, -60)), 52], [BP.clone().add(new V3(140, -8, -90)), 46]];
  const treeList = []; { const tr = rng(17); for (const [c, R] of domes) { const n = Math.round(R * R * .055); for (let i = 0; i < n; i++) { const a = tr() * Math.PI * 2, d = Math.sqrt(tr()) * R * .9; const x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d; const dd = d / (R * .97); const h = (1 - dd * dd) * R * .22 * (.6 + fbm((x - c.x) * .02 + c.x, (z - c.z) * .02, 3, 3) * .8);
    if (c === A.c && (Math.hypot(x - (A.c.x - 40), z - (A.c.z - 10)) < 38 || Math.hypot(x - (A.c.x - 30), z - (A.c.z - 6)) < 26)) continue; const s = .8 + tr() * 1.1; const top = c.y + h; if (top + 12 * s > c.y + Math.sqrt(Math.max(0, R * R - d * d)) - 2) continue; treeList.push([x, top, z, s, tr()]); } } }
  const trees = new THREE.InstancedMesh(treeGeo, treeMat, treeList.length); { const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new Col(); treeList.forEach(([x, y, z, s, k], i) => { trees.setMatrixAt(i, m.compose(new V3(x, y, z), q.setFromEuler(e.set(0, k * 6.28, 0)), new V3(s, s, s))); trees.setColorAt(i, c.set(k < .3 ? '#2f7a3a' : k < .6 ? '#4f9a3a' : k < .8 ? '#7fb04a' : '#e8a0b8')); }); }
  group.add(trees);
  /* ---- solar arrays ---- */
  function array(p, yaw, n, w = 22, l = 46) { B.add('dark', boxGeo(4, 4, n * (w + 2) + 20, 4, 4).rotateX(Math.PI / 2).translate(0, 0, 0), [p.x, p.y, p.z], [0, yaw, 0]);
    for (let i = 0; i < n; i++) { const o = -n * (w + 2) / 2 + i * (w + 2) + w / 2; for (const s of [-1, 1]) { const q = p.clone().add(new V3(Math.cos(yaw) * (l / 2 + 4) * s - Math.sin(yaw) * o, 0, -Math.sin(yaw) * (l / 2 + 4) * s - Math.cos(yaw) * o)); B.add('solar', boxGeo(l, .6, w, l, w), [q.x, q.y, q.z], [0, yaw, .35]); } } }
  array(A.c.clone().add(new V3(330, 40, 20)), .1, 14); array(A.c.clone().add(new V3(260, 90, 340)), .4, 10); array(BP.clone().add(new V3(-330, 60, -40)), -.2, 12); array(new V3(-420, 120, 300), .9, 12);
  /* ---- transit tubes with capsules ---- */
  const tubes = []; const glassTube = new THREE.MeshBasicMaterial({ color: '#bfe8ff', transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide });
  for (const pts of [[new V3(RING.R + 10, -10, 480), new V3(240, -40, 400), new V3(232, -96, 300)], [A.c.clone().add(new V3(-110, -4, -60)), new V3(40, -80, -120), new V3(-40, -95, -330), BP.clone().add(new V3(70, 2, 70))], [A.c.clone().add(new V3(60, -6, -110)), A.c.clone().add(new V3(110, 0, -130))], [BP.clone().add(new V3(-80, 2, -20)), BP.clone().add(new V3(-110, 6, -50))]]) {
    const curve = new THREE.CatmullRomCurve3(pts); const tg = new THREE.TubeGeometry(curve, 80, 4.5, 12, false); const m = new THREE.Mesh(tg, glassTube); m.renderOrder = 4; group.add(m);
    B.addM('lightB', new THREE.TubeGeometry(curve, 80, .35, 4, false), new THREE.Matrix4().makeTranslation(0, -4.4, 0)); for (let k = 0; k <= 10; k++) { const p = curve.getPointAt(k / 10); B.add('white', new THREE.TorusGeometry(5, .7, 6, 20), [p.x, p.y, p.z], null, null, '#e8edf2'); } tubes.push(curve); }
  const capGeo = new THREE.CapsuleGeometry(2.6, 7, 6, 12).rotateX(Math.PI / 2); const capMat = ctx.mat('#ffffff', { roughness: .2, metalness: .3, emissive: '#7fd8ff', emissiveIntensity: .35 });
  const caps = new THREE.InstancedMesh(capGeo, capMat, tubes.length * 4); caps.frustumCulled = false; group.add(caps);
  /* ---- the wheel station (ahead-left, far) ---- */
  const wheel = new THREE.Group(); wheel.position.set(-760, 150, -1400); wheel.lookAt(0, 0, -200); group.add(wheel); const wheelSpin = new THREE.Group(); wheel.add(wheelSpin);
  { const wb = new Builder(); wb.add('hull', new THREE.TorusGeometry(380, 34, 20, 160), null, null, [1, 1, .55], '#eef2f6'); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; wb.addM('white', beamGeo(new V3(0, 0, 0), new V3(Math.cos(a) * 360, Math.sin(a) * 360, 0), 10), new THREE.Matrix4(), '#d8e0e8'); }
    wb.add('white', new THREE.CylinderGeometry(48, 48, 90, 32).rotateX(Math.PI / 2), null, null, null, '#e8edf2'); wb.add('lightB', new THREE.TorusGeometry(50, 3, 8, 48)); for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; wb.add('lightW', new THREE.SphereGeometry(5, 8, 6), [Math.cos(a) * 380, Math.sin(a) * 380, 22]); }
    wb.build({ hull, white, lightB, lightW }, wheelSpin); }
  /* ---- shuttles ---- */
  const shGeo = (() => { const b = new Builder(); b.add('s', new THREE.SphereGeometry(1, 16, 10), null, null, [2.2, 1.2, 5.5], '#f2f4f6'); b.add('s', new THREE.BoxGeometry(11, .4, 3), [0, -.3, 2], null, null, '#c8d2dc'); b.add('s', new THREE.SphereGeometry(.9, 10, 8), [0, .5, -2.5], null, [1.2, .8, 1.8], '#2a6a9a'); return b.build({ s: null }).s.geometry; })();
  const shMat = ctx.mat('#ffffff', { vertexColors: true, roughness: .3, metalness: .4, envMapIntensity: 1, emissive: '#2a4050', emissiveIntensity: .3 });
  const lanes = [[new V3(-300, 60, 900), new V3(-120, -40, -500)], [new V3(400, 80, -400), new V3(150, -40, 500)], [new V3(-900, 200, -1300), new V3(-60, -60, -480)], [new V3(80, 140, 900), new V3(240, -60, 120)], [new V3(-200, -50, -480), new V3(300, 40, -1200)], [new V3(-500, 30, 300), new V3(-120, -30, 900)], [new V3(600, 40, 600), new V3(-400, 120, 700)], [new V3(-80, 90, -900), new V3(900, 160, -600)]];
  const shuttles = new Movers(shGeo, shMat, lanes.map(([a, b]) => ({ a, b, speed: 45, n: 2, bob: .8 })), 2, 21); group.add(shuttles.mesh);
  const trail = new SpriteField(lanes.length * 2 * 3, { map: dotTex(), additive: true, color: '#9fe0ff' }); group.add(trail.mesh);
  /* ---- people on terraces ---- */
  const people = new People(140, { skin: '#d7b08f', stride: 6, envMats: ctx.envMats }); group.add(people.mesh); const pr = rng(66); const walkers = [];
  for (let i = 0; i < 140; i++) { const [c, R] = domes[i % 3 === 0 ? 0 : i % 3 === 1 ? 3 : 0]; walkers.push({ c, R: R * (.55 + pr() * .35), a: pr() * 6.28, sp: (pr() < .5 ? -1 : 1) * (.012 + pr() * .01), ph: pr() * 6 }); people.color(i, ['#f2f2f2', '#e0a040', '#4a8ac8', '#c84a5a', '#5aa86a', '#f0d080'][i % 6]); }
  B.build({ hull, white, dark, lightB, lightW, solar, grass, rock }, group);
  /* sparkle of the falls spray */
  const spray = new SpriteField(30, { map: puffTex(3), color: '#f2fbff', opacity: .5 }); group.add(spray.mesh);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new V3(1, 1, 1), _p = new V3();
  function update(t, C) {
    fallU.uTime.value = t; ring.rotation.z = t * .06; wheelSpin.rotation.z = -t * .025;
    let k = 0; tubes.forEach((c, i) => { for (let j = 0; j < 4; j++, k++) { const u = ((t * 18 / c.getLength()) + j / 4 + i * .3) % 1; const p = c.getPointAt(u), q = c.getTangentAt(u); _q.setFromUnitVectors(new V3(0, 0, -1), q); caps.setMatrixAt(k, _m.compose(p, _q, _s)); } }); caps.instanceMatrix.needsUpdate = true;
    shuttles.update(t); shuttles.items.forEach((it, i) => { const L = it.L; const d = ((it.off + it.sp * t) % L.len + L.len) % L.len; for (let j = 0; j < 3; j++) { _p.copy(L.a).addScaledVector(L.dir, d + 8 + j * 3); trail.set(i * 3 + j, _p.x, _p.y, _p.z, 3 - j * .7, 1, 1, 1, .8 - j * .25); } }); trail.commit();
    walkers.forEach((w, i) => { const a = w.a + t * w.sp; const x = w.c.x + Math.cos(a) * w.R, z = w.c.z + Math.sin(a) * w.R; people.place(i, x, w.c.y + 1.2, z, -a + (w.sp > 0 ? 0 : Math.PI), 1, w.ph, 1); }); people.commit(t);
    for (let i = 0; i < 30; i++) { const q = (t * .25 + i / 30) % 1; spray.set(i, A.spray.x - 10 + Math.sin(i) * 8, A.spray.y + 2 + q * 14, A.spray.z + Math.cos(i * 1.7) * 8, 6 + q * 12, 1, 1, 1, (1 - q) * .7); } spray.commit();
    return { flash: 0 };
  }
  const anchors = { ring: new V3(RING.c.x + RING.R * .7, RING.c.y + RING.R * .7, RING.c.z), dome: A.c.clone().add(new V3(0, 60, 0)), falls: A.fall, earth: new V3(0, -900, -400), wheel: wheel.position.clone(), domeB: BP.clone().add(new V3(0, 40, 0)), shuttles: new V3(-120, 0, -500) };
  const telescope = [
    { t0: 110, t1: 139, name: 'RING HABITAT', fact: 'FARMLAND ON THE INSIDE · SPIN MAKES GRAVITY', at: anchors.ring, size: 260 },
    { t0: 139, t1: 152, name: 'BIOSPHERE DOME', fact: 'FOREST · LAKE · WATER RECYCLED IN A LOOP', at: A.fall, size: 90 },
    { t0: 152, t1: 166, name: 'SOLAR WINGS', fact: 'SUNLIGHT POWERS EVERY HABITAT', at: A.c.clone().add(new V3(330, 40, 20)), size: 300 },
    { t0: 166, t1: 200, name: 'HOME', fact: 'ONE PLANET · STILL THE ONLY ONE WITH LIFE WE KNOW OF', at: anchors.earth, size: 600 } ];
  return { id: 'orbit', group, path, update, anchors, telescope, A, BP };
}
