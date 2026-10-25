/* WORLD · SUSTAINABLE ORBITAL HABITAT (expanded) — builds on sci-fi-360/js/world_orbit.js without changing it.
   Everything from the original is kept (ring habitat, biosphere domes with the lake and waterfall, solar wings,
   transit tubes and capsules, the wheel station, shuttles, people on the terraces, views of Earth). This module adds
   the LIFE SUPPORT COMMONS: four explorable stations that show how a habitat keeps people alive —
     FOOD   · a vertical farm under grow lights
     WATER  · a closed-loop recycling plant (tanks and a glowing loop)
     ENERGY · solar wings, a spinning flywheel store and a battery bank
     AIR    · algae photobioreactors that turn CO2 into oxygen
   …and a new, slower flight path that visits them. Local time runs 116–172 (the original world used 116–184). */
import * as THREE from 'three';
import { V3, Col, lerp, rng, FlightPath, Builder, boxGeo, cylGeo, cylBetween, solarTex, SpriteField, dotTex, puffTex } from '../../sci-fi-360/js/lib.js';
import { buildOrbit } from '../../sci-fi-360/js/world_orbit.js';

export function buildOrbitalHabitat(ctx) {
  const base = buildOrbit(ctx);
  const group = base.group; group.name = 'orbital-habitat';
  const B = new Builder();
  const white = ctx.mat('#ffffff', { roughness: .3, metalness: .2, envMapIntensity: .9, vertexColors: true });
  const dark = ctx.mat('#2a3340', { roughness: .4, metalness: .7, envMapIntensity: .8 });
  const st = solarTex(); const solar = ctx.mat('#ffffff', { map: st, roughness: .25, metalness: .6, envMapIntensity: 1.3, emissive: '#0a1a40', emissiveIntensity: .4 });
  const glowB = new THREE.MeshBasicMaterial({ color: new Col('#8fe4ff').multiplyScalar(2) });
  const glowG = new THREE.MeshBasicMaterial({ color: new Col('#7dffb0').multiplyScalar(1.8) });
  const glowP = new THREE.MeshBasicMaterial({ color: new Col('#ff7ad9').multiplyScalar(1.7) });
  const leafM = ctx.mat('#ffffff', { roughness: .85, vertexColors: true, envMapIntensity: .3, emissive: '#1a4a1a', emissiveIntensity: .35 });
  const glassM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { tint: { value: new Col('#cfefff') } },
    vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ vW=(modelMatrix*vec4(position,1.)).xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.); }`,
    fragmentShader: `uniform vec3 tint; varying vec3 vN; varying vec3 vW; void main(){ vec3 v=normalize(cameraPosition-vW); float f=1.-abs(dot(normalize(vN),v)); gl_FragColor=vec4(tint,.06+.5*pow(f,3.));
      #include <colorspace_fragment>
    }` });

  /* ---- the Commons: a truss spine to the left of the new flight path ---- */
  const SPX = -112, SPY = -20, SPINE_Y = SPY - 38;   // the spine runs below eye level so it never blocks the view
  const C = { farm: new V3(SPX, SPY, 0), water: new V3(SPX, SPY, -80), energy: new V3(SPX, SPY, -160), air: new V3(SPX, SPY, -240) };
  B.addM('white', cylBetween(new V3(SPX + 26, SPINE_Y, 60), new V3(SPX + 26, SPINE_Y, -300), 3.2, 12), new THREE.Matrix4(), '#e8edf2');
  for (let z = 50; z >= -290; z -= 20) { B.add('white', new THREE.TorusGeometry(4.2, .6, 6, 16), [SPX + 26, SPINE_Y, z], null, null, '#f2f5f8'); B.add('glowB', new THREE.SphereGeometry(.7, 8, 6), [SPX + 26, SPINE_Y + 4.6, z]); }
  // docking arms from the spine to each station
  for (const k in C) { const p = C[k]; B.addM('white', cylBetween(new V3(SPX + 26, SPINE_Y, p.z), new V3(p.x + 6, p.y - 24, p.z), 1.8, 8), new THREE.Matrix4(), '#dfe6ec'); }

  /* FOOD · vertical farm: a glass cylinder of stacked grow floors under pink-white LEDs */
  const farmSpin = new THREE.Group(); farmSpin.position.copy(C.farm); group.add(farmSpin);
  { const fb = new Builder(); const R = 17, H = 64; const lv = 11;
    for (let i = 0; i < lv; i++) { const y = -H / 2 + 3 + i * (H - 6) / (lv - 1);
      fb.add('white', cylGeo(R - .5, R - .5, .8, 40), [0, y, 0], null, null, '#e9eef2');
      const rr = rng(40 + i); for (let k = 0; k < 28; k++) { const a = k / 28 * Math.PI * 2, d = 6 + rr() * 9; fb.add('leaf', new THREE.IcosahedronGeometry(1.1 + rr() * .5, 0), [Math.cos(a) * d, y + 1.3, Math.sin(a) * d], null, [1, .7, 1], ['#5fbf4a', '#7fd85a', '#4aa83e', '#e8d04a', '#d8603a'][Math.floor(rr() * 5)]); }
      fb.add('glowP', new THREE.TorusGeometry(R - 1.2, .22, 6, 64).rotateX(Math.PI / 2), [0, y + 4.2, 0]); }
    fb.add('white', cylGeo(4, 4, H, 16), [0, -H / 2, 0], null, null, '#f2f5f8'); fb.add('white', cylGeo(R + 1, R + 1, 2, 48), [0, H / 2, 0], null, null, '#f2f5f8'); fb.add('white', cylGeo(R + 1, R + 1, 2, 48), [0, -H / 2 - 2, 0], null, null, '#f2f5f8');
    fb.build({ white, leaf: leafM, glowP }, farmSpin);
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 48, 1, true), glassM); shell.renderOrder = 5; farmSpin.add(shell); }

  /* WATER · closed-loop recycling: three tanks (levels rise and fall), pipes with flowing light */
  const tanks = []; const loopU = { uTime: { value: 0 } };
  { const P = C.water; const pos = [new V3(P.x, P.y + 12, P.z - 6), new V3(P.x - 16, P.y - 8, P.z + 6), new V3(P.x + 6, P.y - 14, P.z + 10)];
    const waterM = new THREE.MeshStandardMaterial({ color: '#3fa6e0', emissive: '#1a6aa0', emissiveIntensity: .6, roughness: .1, metalness: .2, transparent: true, opacity: .9 }); ctx.envMats.push(waterM);
    pos.forEach((p, i) => { const r = 9; const glass = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), glassM); glass.position.copy(p); glass.renderOrder = 5; group.add(glass);
      const w = new THREE.Mesh(new THREE.SphereGeometry(r * .92, 28, 16, 0, Math.PI * 2, Math.PI * .35, Math.PI * .65), waterM); w.position.copy(p); group.add(w); tanks.push({ w, ph: i * 2.1 });
      B.add('white', new THREE.TorusGeometry(r, .5, 6, 40), [p.x, p.y, p.z], [Math.PI / 2, 0, 0], null, '#f2f5f8'); });
    const loopM = new THREE.ShaderMaterial({ uniforms: loopU, transparent: true, depthWrite: false,
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform float uTime; varying vec2 vUv; void main(){ float d=fract(vUv.x*14.-uTime*1.4); float a=smoothstep(0.,.15,d)*smoothstep(.6,.3,d); gl_FragColor=vec4(vec3(.55,.9,1.)*1.6,.25+.75*a);
        #include <colorspace_fragment>
      }` });
    const curve = new THREE.CatmullRomCurve3(pos, true);
    const pipe = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 1.1, 8, true), loopM); group.add(pipe);
    B.add('white', boxGeo(14, 10, 12, 4, 4), [P.x + 8, P.y - 26, P.z - 8], null, null, '#e6ebef'); B.add('glowB', boxGeo(14.2, .8, 12.2), [P.x + 8, P.y - 20, P.z - 8]); }

  /* ENERGY · solar wings, a flywheel ring that spins, a battery bank with charge bars */
  const fly = new THREE.Group(); fly.position.copy(C.energy).add(new V3(0, 6, 0)); fly.rotation.z = Math.PI / 2; group.add(fly);
  const bars = [];
  { const P = C.energy; const fb = new Builder(); fb.add('white', new THREE.TorusGeometry(13, 1.6, 10, 64), [0, 0, 0], null, null, '#eef2f6'); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; fb.addM('white', cylBetween(new V3(), new V3(Math.cos(a) * 13, Math.sin(a) * 13, 0), .5, 6), new THREE.Matrix4(), '#d8e0e8'); }
    fb.add('glowB', new THREE.TorusGeometry(13, .4, 6, 64), [0, 0, 1.7]); fb.build({ white, glowB }, fly);
    for (const sd of [-1, 1]) { B.addM('dark', cylBetween(new V3(P.x, P.y, P.z), new V3(P.x - 18, P.y + sd * 46, P.z), .8, 6), new THREE.Matrix4());
      for (let i = 0; i < 5; i++) B.add('solar', boxGeo(.6, 8, 26, 8, 26), [P.x - 18, P.y + sd * (10 + i * 9) - 4, P.z], null, null); }
    B.add('white', boxGeo(10, 22, 18, 4, 4), [P.x + 6, P.y - 30, P.z], null, null, '#e6ebef');
    const barM = new THREE.MeshBasicMaterial({ color: new Col('#7dffb0').multiplyScalar(1.6) });
    for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.5, 18, 1.8).translate(0, 9, 0), barM); b.position.set(P.x + 11.3, P.y - 30 + 2, P.z - 7.5 + i * 3); group.add(b); bars.push({ b, ph: i * .9 }); } }

  /* AIR · algae photobioreactors: a ring of glowing green tubes, bubbles rising */
  const bubbles = new SpriteField(160, { map: dotTex(), additive: true, color: '#d8ffe6' }); group.add(bubbles.mesh);
  const tubesA = [];
  { const P = C.air; const tubeM = new THREE.MeshStandardMaterial({ color: '#3fd16a', emissive: '#22a84a', emissiveIntensity: .9, roughness: .15, metalness: .1, transparent: true, opacity: .82 }); ctx.envMats.push(tubeM);
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; const x = P.x + Math.cos(a) * 14, z = P.z + Math.sin(a) * 14; const m = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 34, 14), tubeM); m.position.set(x, P.y, z); group.add(m); tubesA.push(new V3(x, P.y, z)); }
    B.add('white', new THREE.TorusGeometry(15, 1, 6, 48), [P.x, P.y + 17.5, P.z], [Math.PI / 2, 0, 0], null, '#f2f5f8'); B.add('white', new THREE.TorusGeometry(15, 1, 6, 48), [P.x, P.y - 17.5, P.z], [Math.PI / 2, 0, 0], null, '#f2f5f8');
    B.add('white', cylGeo(6, 6, 36, 20), [P.x, P.y - 18, P.z], null, null, '#e6ebef'); B.add('glowG', new THREE.TorusGeometry(6.2, .3, 6, 32), [P.x, P.y + 10, P.z], [Math.PI / 2, 0, 0]); }

  /* ---- floating labels so each station reads in the 360 video too ---- */
  const labels = [];
  function label(text, sub, at, w = 34) { const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const x = c.getContext('2d');
    x.fillStyle = 'rgba(5,18,36,.72)'; x.beginPath(); x.roundRect(8, 8, 1008, 240, 40); x.fill(); x.lineWidth = 6; x.strokeStyle = 'rgba(127,227,255,.75)'; x.stroke();
    x.fillStyle = '#f4fbff'; x.font = '700 92px Montserrat, "Segoe UI", sans-serif'; x.textAlign = 'center'; x.fillText(text, 512, 128); x.fillStyle = '#7fe3ff'; x.font = '600 44px "IBM Plex Mono", monospace'; x.fillText(sub, 512, 200);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })); m.position.copy(at); m.renderOrder = 7; group.add(m); labels.push(m); }
  label('FOOD', 'VERTICAL FARM', C.farm.clone().add(new V3(18, 40, 0)));
  label('WATER', 'CLOSED-LOOP RECYCLING', C.water.clone().add(new V3(18, 30, 0)));
  label('ENERGY', 'SOLAR · FLYWHEEL · BATTERY', C.energy.clone().add(new V3(18, 30, 0)));
  label('AIR', 'ALGAE MAKE OXYGEN', C.air.clone().add(new V3(18, 28, 0)));

  B.build({ white, dark, solar, glowB, glowG, glowP }, group);

  /* ---- new flight path: ring → biosphere → the four stations → pull back to Earth ---- */
  const path = new FlightPath([[116, 0, -46, 1000], [120, 0, -30, 860], [124, 0, -12, 700], [128, 0, 0, 560], [132, 0, 0, 470], [136, 4, -10, 330], [140, 12, -24, 190], [144, -8, -24, 60],
    [147, -40, -20, 0], [151, -44, -18, -80], [155, -45, -16, -160], [159, -44, -14, -240], [163, -30, 8, -320], [167, -20, 40, -390], [172, -10, 76, -450]]);

  const _v = new V3();
  function update(t, C2) {
    const r = base.update(t, C2) || {};
    farmSpin.rotation.y = t * .08; fly.rotation.x = t * 1.6; loopU.uTime.value = t;
    tanks.forEach(k => { k.w.scale.y = .78 + .2 * Math.sin(t * .5 + k.ph); });
    bars.forEach(k => { k.b.scale.y = .45 + .5 * (.5 + .5 * Math.sin(t * .6 + k.ph)); });
    for (let i = 0; i < 160; i++) { const p = tubesA[i % tubesA.length]; const q = ((t * .35 + i * .0613) % 1); bubbles.set(i, p.x + Math.sin(i * 7.1) * .6, p.y - 16 + q * 32, p.z + Math.cos(i * 3.3) * .6, .7 + (i % 3) * .2, 1, 1, 1, Math.sin(q * Math.PI) * .9); } bubbles.commit();
    for (const m of labels) m.lookAt(C2.shipPos);
    return r;
  }
  const anchors = { ...base.anchors, farm: C.farm.clone().add(new V3(0, 10, 0)), water: C.water.clone(), energy: C.energy.clone().add(new V3(0, 6, 0)), air: C.air.clone(),
    ringCentre: new V3(0, 0, 480), commons: new V3(SPX + 26, SPINE_Y, -120), earthView: new V3(0, -900, -700) };
  const telescope = [
    { t0: 100, t1: 133, name: 'RING HABITAT', fact: 'FARMLAND INSIDE · SPIN MAKES GRAVITY', at: base.anchors.ring, size: 260 },
    { t0: 133, t1: 145, name: 'BIOSPHERE DOME', fact: 'FOREST · LAKE · WATER IN A LOOP', at: base.anchors.falls, size: 90 },
    { t0: 145, t1: 149.5, name: 'FOOD · VERTICAL FARM', fact: 'STACKED FIELDS UNDER LEDS', at: anchors.farm, size: 70 },
    { t0: 149.5, t1: 153.5, name: 'WATER · RECYCLING', fact: 'THE ISS RECOVERS ABOUT 98% OF ITS WATER', at: anchors.water, size: 60 },
    { t0: 153.5, t1: 157.5, name: 'ENERGY · SUN + STORAGE', fact: 'SOLAR WINGS · FLYWHEEL · BATTERIES', at: anchors.energy, size: 90 },
    { t0: 157.5, t1: 162, name: 'AIR · ALGAE REACTORS', fact: 'CO2 IN · OXYGEN OUT', at: anchors.air, size: 60 },
    { t0: 162, t1: 220, name: 'HOME', fact: 'ONE PLANET · STILL THE ONLY ONE WITH LIFE WE KNOW OF', at: base.anchors.earth, size: 600 } ];
  // boxes for the path-clearance QA (stations, tanks, flywheel, reactors, the ring tube and dome A)
  const colliders = [ [C.farm.x - 18, C.farm.y - 34, C.farm.z - 18, C.farm.x + 18, C.farm.y + 34, C.farm.z + 18, 'vertical farm'], [C.water.x - 26, C.water.y - 24, C.water.z - 17, C.water.x + 16, C.water.y + 22, C.water.z + 18, 'water tanks'],
    [C.energy.x - 20, C.energy.y - 41, C.energy.z - 15, C.energy.x + 12, C.energy.y + 60, C.energy.z + 15, 'energy station'], [C.air.x - 16, C.air.y - 36, C.air.z - 16, C.air.x + 16, C.air.y + 18, C.air.z + 16, 'algae reactors'],
    [SPX + 22, SPINE_Y - 5, -300, SPX + 30, SPINE_Y + 5, 60, 'Commons spine'] ];
  return { id: 'orbital-habitat', group, path, update, anchors, telescope, colliders };
}
