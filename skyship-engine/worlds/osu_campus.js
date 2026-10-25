/* WORLD · THE OHIO STATE UNIVERSITY — the Columbus campus as it is today, built from OpenStreetMap data
   (data/gis/osu-campus.json, made by tools/gis/osm_world.py). Buildings, streets, paths, the Olentangy River,
   Mirror Lake and the Oval come from the map; Ohio Stadium and Orton Hall's bell tower get hand-modelled detail.

   Origin (0,0) is the centre of the Oval; metres; x = east, z = south, y = up.
   Map data (c) OpenStreetMap contributors, ODbL 1.0.

   Module interface (shared with the other skyship worlds): build(ctx) → { group, path, update(t), anchors, telescope, colliders } */
import * as THREE from 'three';
import { V3, Col, FlightPath, Builder, boxGeo, cylGeo, People } from '../../sci-fi-360/js/lib.js';
import { loadRegion, buildCity, Route, PathMovers, Walkers } from '../js/gis.js';

const DATA = await loadRegion('osu-campus');

/* approximate positions, used only if a name is missing from the map data (lat, lon) */
const FALLBACK = {
  thompson: [39.99930, -83.01530], oval: [39.99935, -83.01405], orton: [40.00028, -83.01338], univhall: [40.00010, -83.01254],
  mirrorlake: [39.99760, -83.01230], union: [39.99760, -83.00870], stadium: [40.00163, -83.01972], river: [40.00050, -83.02290],
  highst: [39.99790, -83.00700], power: [40.00300, -83.01600] };
const NAMES = {
  thompson: ['William Oxley Thompson Memorial Library', 'Thompson Library', 'Thompson Memorial Library'], oval: ['The Oval'],
  orton: ['Orton Hall'], univhall: ['University Hall'], mirrorlake: ['Mirror Lake'], union: ['Ohio Union'], stadium: ['Ohio Stadium'],
  river: ['Olentangy River'], power: ['McCracken Power Plant', 'McCracken Power', 'Combined Heat and Power'] };

export function buildOSUCampus(ctx) {
  const group = new THREE.Group(); group.name = 'osu-campus';
  const o = DATA.origin, kx = 111320 * Math.cos(o.lat * Math.PI / 180), kz = 110574;
  const fromLL = ([la, lo]) => ({ x: (lo - o.lon) * kx, z: -(la - o.lat) * kz, h: 0, r: 30 });

  /* ---------------- the city from map data ---------------- */
  const autumn = ['#3f8a3e', '#c7642a', '#e0a53a', '#9c3b25', '#6aa845', '#d98b2b'];
  const city = buildCity(ctx, DATA, { seed: 21, trees: { parks: 330, woods: 80, max: 5000 }, treeShades: autumn,
    skip: b => b.n && /ohio stadium/i.test(b.n) });
  group.add(city.group);
  const P = {}; const missing = [];
  for (const k in FALLBACK) { let f = null; for (const nm of NAMES[k] || []) { f = city.find(nm); if (f) break; } if (!f) missing.push(k); P[k] = f || fromLL(FALLBACK[k]); }
  if (missing.length) console.info('[osu-campus] using approximate positions for:', missing.join(', '));
  const colliders = city.colliders;

  const B = new Builder();
  const M = { stone: ctx.mat('#ffffff', { vertexColors: true, roughness: .85, envMapIntensity: .3 }), seat: ctx.mat('#ffffff', { vertexColors: true, roughness: .7, envMapIntensity: .3, side: THREE.DoubleSide }),
    grass: ctx.mat('#ffffff', { vertexColors: true, roughness: .95, envMapIntensity: .2 }), glass: ctx.mat('#9fc3e0', { roughness: .2, metalness: .5, envMapIntensity: 1.2 }),
    paint: ctx.mat('#ffffff', { vertexColors: true, roughness: .8 }), glow: new THREE.MeshBasicMaterial({ color: new Col('#ffe7b0').multiplyScalar(1.6) }) };

  /* ---------------- Ohio Stadium: a horseshoe open to the south, rotunda at the north end ---------------- */
  { const S = P.stadium, cx = S.x, cz = S.z; const R0 = 58, R1 = 112, LEN = 80;      // field radius, outer radius, straight length
    const tier = (r0, r1, y0, y1, col) => {          // a ring of seating from radius r0→r1, rising y0→y1, around a horseshoe outline
      const seg = 28; for (let i = 0; i < seg; i++) { const a0 = Math.PI * i / seg, a1 = Math.PI * (i + 1) / seg;   // north semicircle (a from 0 → π)
        quadFan(B, 'seat', cx, cz - LEN / 2, r0, r1, a0, a1, y0, y1, col); }
      for (const sd of [-1, 1]) { const x0 = cx + sd * r0, x1 = cx + sd * r1;      // straight sides running south
        rampBox(B, 'seat', x0, x1, cz - LEN / 2, cz + LEN / 2, y0, y1, col); } };
    tier(R0, 78, 1, 16, '#9aa3ab'); tier(78, 96, 16, 30, '#8d969f'); tier(96, R1, 30, 41, '#7f8992');
    for (let i = 0; i <= 28; i++) { const a = Math.PI * i / 28; B.add('stone', boxGeo(4, 43, 4), [cx + Math.cos(a) * (R1 + 1), 0, cz - LEN / 2 - Math.sin(a) * (R1 + 1)], [0, -a, 0], null, '#d6cdb9'); }
    for (const sd of [-1, 1]) for (let k = 0; k <= 6; k++) B.add('stone', boxGeo(4, 43, 4), [cx + sd * (R1 + 1), 0, cz - LEN / 2 + k * LEN / 6], null, null, '#d6cdb9');
    // the field and markings
    B.add('grass', boxGeo(R0 * 2 - 6, .4, LEN + R0), [cx, 0, cz - 2], null, null, '#3f8f3a');
    for (let k = -5; k <= 5; k++) B.add('paint', boxGeo(48, .5, .5), [cx, .05, cz + k * 9.14 - 2], null, null, '#ffffff');
    // the rotunda (modelled on the Pantheon's dome) at the north end
    const rz = cz - LEN / 2 - R1 - 10; B.add('stone', cylGeo(19, 19, 26, 28), [cx, 0, rz], null, null, '#e4dccb');
    B.add('stone', new THREE.SphereGeometry(19, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), [cx, 26, rz], null, null, '#c9c2b2');
    for (let i = 0; i < 6; i++) B.add('stone', boxGeo(2.2, 24, 2.2), [cx - 12 + i * 4.8, 0, rz + 19.5], null, null, '#f2ecdf');
    colliders.push([cx - R1, 0, cz - LEN / 2 - R1, cx + R1, 43, cz + LEN / 2, 'Ohio Stadium'], [cx - 19, 0, rz - 19, cx + 19, 45, rz + 19, 'Ohio Stadium rotunda']);
    P.rotunda = { x: cx, z: rz, h: 45 }; P.stadium = { ...S, h: 43 };
  }

  /* ---------------- Orton Hall's bell tower (the map has the hall; this adds the tower) ---------------- */
  { const t = P.orton, tx = t.x + (t.r || 15) * .45, tz = t.z - (t.r || 15) * .2;
    B.add('stone', boxGeo(8, 34, 8), [tx, 0, tz], null, null, '#cdbf9e'); B.add('stone', boxGeo(9.4, 2, 9.4), [tx, 34, tz], null, null, '#b9aa88');
    B.add('stone', new THREE.ConeGeometry(6.4, 9, 4).rotateY(Math.PI / 4).translate(0, 4.5, 0), [tx, 36, tz], null, null, '#6d5a49');
    B.add('glow', boxGeo(8.2, 2.4, 1.2), [tx, 29, tz], null, null);
    colliders.push([tx - 5, 0, tz - 5, tx + 5, 45, tz + 5, 'Orton Hall bell tower']); P.ortonTower = { x: tx, z: tz, h: 45 }; }
  B.build(M, group);

  /* ---------------- life on campus ---------------- */
  const rd = DATA.roads;
  // students on the footpaths of the Oval and around Mirror Lake
  const near = (pts, c, r) => pts.some(([x, z]) => Math.hypot(x - c.x, z - c.z) < r);
  const footRoutes = rd.filter(r => ['footway', 'path', 'pedestrian'].includes(r.c) && r.pts.length > 1 && (near(r.pts, P.oval, 230) || near(r.pts, P.mirrorlake, 120) || near(r.pts, P.union, 120)))
    .map(r => Route.outAndBack(r.pts)).filter(r => r.len > 25).slice(0, 90);
  const nPeople = Math.min(320, footRoutes.length * 4);
  let walkers = null;
  if (nPeople) { const people = new People(nPeople, { envMats: ctx.envMats }); group.add(people.mesh); walkers = new Walkers(people, footRoutes.map(route => ({ route, n: 4 })), 12); }
  // campus buses and traffic on the named streets
  const vehMat = ctx.mat('#ffffff', { vertexColors: true, roughness: .35, metalness: .2, envMapIntensity: .9 });
  const busGeo = (() => { const b = new Builder(); b.add('v', boxGeo(2.6, 3.0, 12), [0, .3, 0], null, null, '#f4f4f4'); b.add('v', boxGeo(2.65, .9, 12.05), [0, 1.7, 0], null, null, '#1e2730'); b.add('v', boxGeo(2.68, .5, 12.1), [0, .7, 0], null, null, '#bb0000'); return b.build({ v: null }).v.geometry; })();
  const carGeo = (() => { const b = new Builder(); b.add('v', boxGeo(1.9, 1.0, 4.4), [0, .3, 0], null, null, '#ffffff'); b.add('v', boxGeo(1.7, .7, 2.3), [0, 1.3, -.2], null, null, '#22303a'); return b.build({ v: null }).v.geometry; })();
  const streets = (names, cls) => rd.filter(r => (names.some(n => (r.n || '').includes(n)) || cls?.includes(r.c)) && r.pts.length > 1 && !['footway', 'path', 'cycleway', 'steps', 'pedestrian', 'service'].includes(r.c));
  const busLanes = streets(['Woody Hayes', 'College Road', 'West 12th', 'Neil Avenue', 'Lane Avenue', 'West Woodruff'], null).map(r => ({ route: Route.outAndBack(r.pts, 2.2), n: 1, speed: 9, y: .2 })).filter(l => l.route.len > 120).slice(0, 14);
  const carLanes = streets(['High Street', 'Olentangy River', 'Lane Avenue', 'West 11th', 'West 15th', 'West 18th'], ['primary', 'secondary']).map(r => ({ route: Route.outAndBack(r.pts, 3.2), n: 3, speed: 12, y: .2, colors: ['#c62828', '#e0e0e0', '#2b4c7e', '#3a3a3a', '#8c8c8c', '#1f6b4f'] })).filter(l => l.route.len > 100).slice(0, 30);
  const buses = new PathMovers(busGeo, vehMat, busLanes, 3), cars = new PathMovers(carGeo, vehMat, carLanes, 5); group.add(buses.mesh, cars.mesh);
  // kayaks on the Olentangy
  let kayaks = null; { const rv = DATA.rivers.find(r => /olentangy/i.test(r.n)); if (rv && rv.pts.length > 1) { const kg = new THREE.CapsuleGeometry(.4, 3.4, 3, 8).rotateX(Math.PI / 2).scale(1, .6, 1);
      kayaks = new PathMovers(kg, ctx.mat('#ffffff', { vertexColors: true, roughness: .4 }), [{ route: Route.outAndBack(rv.pts, 6), n: 5, speed: 1.6, y: .45, colors: ['#ff7a1a', '#ffd23f', '#e53935'] }], 8); group.add(kayaks.mesh); } }

  /* ---------------- flight path (world time, seconds) ---------------- */
  // heights clear the tallest building within 70 m of each waypoint by at least 28 m
  const clearY = (x, z, base) => { let h = 0; for (const c of colliders) { const dx = Math.max(c[0] - x, 0, x - c[3]), dz = Math.max(c[2] - z, 0, z - c[5]); if (Math.hypot(dx, dz) < 70) h = Math.max(h, c[4]); } return Math.max(base, h + 28); };
  const dir = (a, b) => { const dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1; return { x: dx / l, z: dz / l }; };
  const off = (p, d, along, side) => ({ x: p.x + d.x * along - d.z * side, z: p.z + d.z * along + d.x * side });
  const S = P.stadium, river = P.river;
  const W = [                                        // [t, point, min height]
    [0, { x: river.x - 20, z: S.z + 420 }, 70], [7, { x: river.x - 10, z: S.z + 170 }, 72], [13, { x: S.x - 150, z: S.z - 20 }, 80],
    [19, { x: S.x - 30, z: P.rotunda.z - 70 }, 88], [25, off(P.thompson, dir(P.thompson, P.oval), -150, -20), 78],
    [31, off(P.thompson, dir(P.thompson, P.oval), 70, 10), 62], [36, P.oval, 50], [41, { x: P.ortonTower.x - 20, z: P.ortonTower.z + 70 }, 58],
    [46, { x: P.mirrorlake.x - 40, z: P.mirrorlake.z - 40 }, 52], [51, { x: P.mirrorlake.x + 90, z: P.mirrorlake.z + 10 }, 55],
    [56, { x: P.union.x - 60, z: P.union.z - 30 }, 68], [61, { x: P.highst.x - 10, z: P.union.z - 120 }, 110], [66, { x: P.highst.x + 20, z: P.union.z - 330 }, 300],
    [71, { x: P.highst.x + 40, z: P.union.z - 520 }, 650] ];
  const path = new FlightPath(W.map(([t, p, y]) => [t, p.x, clearY(p.x, p.z, y), p.z]));

  /* ---------------- anchors (what ARCHIVE, hotspots and the telescope point at) ---------------- */
  const a = (p, y) => new V3(p.x, y ?? Math.max(4, (p.h || 0) * .7), p.z);
  const anchors = { river: a({ x: river.x, z: S.z + 120 }, 2), stadium: a(P.stadium, 30), rotunda: a(P.rotunda, 30), thompson: a(P.thompson, Math.max(20, P.thompson.h * .8)),
    oval: a(P.oval, 2), orton: a(P.ortonTower, 30), univhall: a(P.univhall), mirrorlake: a(P.mirrorlake, 1.5), union: a(P.union, 14), highst: a(P.highst, 3),
    energy: a(P.power, Math.max(10, P.power.h || 12)), campus: new V3(P.oval.x, 0, P.oval.z) };
  const telescope = [
    { t0: -9, t1: 8, name: 'OLENTANGY RIVER', fact: '5TH AVE DAM REMOVED · 2012', at: anchors.river, size: 220 },
    { t0: 8, t1: 19, name: 'OHIO STADIUM', fact: 'OPENED 1922 · 102,780 SEATS', at: anchors.stadium, size: 260 },
    { t0: 19, t1: 30, name: 'THOMPSON LIBRARY', fact: 'OPENED 1913 · RENOVATED 2009', at: anchors.thompson, size: 110 },
    { t0: 30, t1: 38, name: 'THE OVAL', fact: 'NAMED IN 1910', at: anchors.oval, size: 300 },
    { t0: 38, t1: 44, name: 'ORTON HALL', fact: 'OPENED 1893 · OHIO STONE', at: anchors.orton, size: 70 },
    { t0: 44, t1: 53, name: 'MIRROR LAKE', fact: 'RESTORED 2018 · NATIVE PLANTS', at: anchors.mirrorlake, size: 120 },
    { t0: 53, t1: 60, name: 'OHIO UNION', fact: 'OPENED 2010 · LEED SILVER', at: anchors.union, size: 120 },
    { t0: 60, t1: 90, name: 'OHIO STATE', fact: 'COLUMBUS CAMPUS · MAPPED FROM OPENSTREETMAP', at: anchors.campus, size: 1600 } ];

  function update(t) { walkers?.update(t); buses.update(t); cars.update(t); kayaks?.update(t); }
  return { id: 'osu-campus', group, path, update, anchors, telescope, colliders, stats: city.stats };
}

/* ---------------- stadium helpers ---------------- */
function quadFan(B, key, cx, cz, r0, r1, a0, a1, y0, y1, col) {
  const p = (r, a, y) => new V3(cx + Math.cos(a) * r, y, cz - Math.sin(a) * r);
  const g = new THREE.BufferGeometry().setFromPoints([p(r0, a0, y0), p(r1, a0, y1), p(r1, a1, y1), p(r0, a0, y0), p(r1, a1, y1), p(r0, a1, y0)]);
  orientUp(g); g.computeVertexNormals(); B.add(key, g, null, null, null, col);
  const back = new THREE.BufferGeometry().setFromPoints([p(r1, a0, 0), p(r1, a1, 0), p(r1, a1, y1), p(r1, a0, 0), p(r1, a1, y1), p(r1, a0, y1)]); back.computeVertexNormals(); B.add(key, back, null, null, null, '#b9b2a2');
}
function rampBox(B, key, x0, x1, z0, z1, y0, y1, col) {
  const v = (x, y, z) => new V3(x, y, z);
  const g = new THREE.BufferGeometry().setFromPoints([v(x0, y0, z0), v(x1, y1, z0), v(x1, y1, z1), v(x0, y0, z0), v(x1, y1, z1), v(x0, y0, z1)]); orientUp(g); g.computeVertexNormals(); B.add(key, g, null, null, null, col);
  const wx = x1, back = new THREE.BufferGeometry().setFromPoints([v(wx, 0, z0), v(wx, 0, z1), v(wx, y1, z1), v(wx, 0, z0), v(wx, y1, z1), v(wx, y1, z0)]); back.computeVertexNormals(); B.add(key, back, null, null, null, '#b9b2a2');
}
function orientUp(g) { const p = g.attributes.position; for (let i = 0; i < p.count; i += 3) { const ax = p.getX(i), az = p.getZ(i), bx = p.getX(i + 1) - ax, bz = p.getZ(i + 1) - az, cx = p.getX(i + 2) - ax, cz = p.getZ(i + 2) - az;
  if (bz * cx - bx * cz < 0) { for (const k of ['X', 'Y', 'Z']) { const t = p['get' + k](i + 1); p['set' + k](i + 1, p['get' + k](i + 2)); p['set' + k](i + 2, t); } } } p.needsUpdate = true; }
