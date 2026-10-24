/* CHAPTER 1 — THE AWAKENING, part 2 (2:00–9:00)
   Scene data only. Registered with the engine through ARCHIVE_SCENE_BUILDERS; the score and
   sound cues for this stretch are registered through ARCHIVE_SCORE_EXT / ARCHIVE_SFX_EXT.
   SC07 The orb remembers (2:00–4:00) · SC08 The door that wasn't there (4:00–6:00) · SC09 Into the portal (6:00–9:00) */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
G.ARCHIVE_SFX_EXT = G.ARCHIVE_SFX_EXT || {};

// ---- the Loom memory: 14 world-nodes on a flattened sphere (shared by camera/actor and shader) ----
const LOOM_N = 14, WIN_P = [0, 5, -11.2];
function loomUnit(i){ const y=1-2*(i+.5)/LOOM_N, r=Math.sqrt(1-y*y), ph=i*2.39996; return [Math.cos(ph)*r, y*.45, Math.sin(ph)*r]; }

G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,D,V,clamp,lerp,sstep,REST_ARM,ORB,FACING,DOCK,P1C,P1N} = K;
  const T = W.tr;
  const shelfPos = (s,y)=>{ const a=.4-s; return [11.25*Math.cos(a), y, 11.25*Math.sin(a)]; };   // orb on the wall at trail position s
  const trailPos = (s,y,r=9.3)=>{ const a=.4-s; return [r*Math.cos(a), y, r*Math.sin(a)]; };      // flight line inside the shelves
  const trailYaw = s=>{ const a=.4-s; return Math.atan2(Math.sin(a), -Math.cos(a)); };            // heading along the trail

  // ---------- world tracks used by this part ----------
  T.loom.cut(0,[0,0,0,0]);          // amount, pulse radius, pulse strength, break A (node 9)
  T.loomB.cut(0,[0,0,3,0]);         // break B (node 2), converge, pulse origin node, hub spokes
  T.loomRot.key(138,0,'lin').key(240,3.06,'lin');
  T.loomC.cut(0,[0,3.4,0,.4]);      // centre xyz, radius
  T.shelf.cut(0,[-1,0,0]);          // trail front, trail intensity, all-shelf flare
  T.portalFX.cut(0,[0,0,0,0]);      // rim forming, arc 0..1, view of Verdance, fixed normal
  T.tunnel.cut(0,[0,0,0,0]);        // amount, gold shift, phase, 0
  W.ext = (t,s)=>{ // derived per-frame state: node positions (deterministic)
    const c=s.loomC, rot=s.loomRot, conv=s.loomB[1], cs=Math.cos(rot), sn=Math.sin(rot); const out=[];
    for(let i=0;i<LOOM_N;i++){ const u=loomUnit(i); const p=[c[0]+(u[0]*cs-u[2]*sn)*c[3], c[1]+u[1]*c[3], c[2]+(u[0]*sn+u[2]*cs)*c[3]];
      const k=sstep(i*.035, i*.035+.5, conv); out.push(...V.lerp(p,WIN_P,k)); }
    s.loomN=out; };
  const nodeAt=(i,t)=>{ const s=W.state(t); W.ext(t,s); return s.loomN.slice(i*3,i*3+3); };

  // fix: level the camera after the tiny-planet roll
  C.tr.roll.key(119.6,0,'inOut');

  // ================= SC07 · The orb remembers (120–240) =================
  // three pulses from the orb, the small portal flicker dies away, and something far away answers
  T.portalOpen.key(120.4,.12,'lin').key(121.4,0,'out');
  T.orbPulse.key(120.9,0,'lin').key(121.0,.9,'out').key(121.6,0).key(121.95,0,'lin').key(122.05,.9,'out').key(122.6,0).key(122.95,0,'lin').key(123.05,1,'out').key(123.8,0);
  S(121,'pulse3');
  T.window.key(124.6,1,'lin').key(124.9,1.5,'out').key(125.3,1).key(125.5,1,'lin').key(125.8,1.5,'out').key(126.2,1).key(126.4,1,'lin').key(126.7,1.6,'out').key(127.3,1);
  S(124.8,'answer');
  A.express(120.6,'curious',.4);
  A.lookAt(124.2,.8,[0,5,-12]); A.express(124.4,'surprised',.25); A.tr.headTilt.to(125.6,.5,.18);
  A.lookAt(127.6,.7,ORB); A.express(127.8,'curious',.4); A.tr.headTilt.to(127.6,.5,0);
  C.shot(120,[.9,2.5,2.4],[0,1.7,.4],40); C.move(120,4,[1.15,2.45,2.75],[0,1.72,.3],38,'inOut');
  C.shot(124.1,[3.4,2.4,5.2],[0,3.6,-8],46); C.move(124.1,3.8,[3.1,2.5,4.8],[0,3.9,-8],45,'lin');

  // the orb rises and grows
  T.orb.to(128.2,6,[0,3.4,0,.5],'inOut'); T.orbGlow.to(128.2,6,1.7); S(128.2,'orb_rise',{d:6});
  A.flyTo(128.6,3,[0,2.15,2.7],'out'); A.express(128.6,'surprised',.2); A.arms(128.6,.4,[1.5,.6,.4],[1.5,.6,.4],'out');
  A.lookAt(130,3,[0,3.4,0]); A.rest(131.8,1); A.express(132.2,'curious',.6);
  C.shot(128,[1.9,1.0,4.6],[0,2.6,0],44); C.move(128,10,[1.3,1.25,3.9],[0,3.1,0],46,'inOut');

  // the Loom unfolds out of the orb
  T.loom.to(138,9,[1,0,0,0],'inOut'); T.loomB.to(138,1,[0,0,3,1]);
  T.loomC.to(138,9,[0,4.2,0,4.2],'inOut'); S(138,'loom_unfold',{d:9});
  T.loomB.to(147,5,[0,0,3,.25]);
  A.express(139,'surprised',.4); A.lookAt(139,2.5,[3,5,0]); A.lookAt(142,3,[-3,4.6,-1]);
  A.express(144.2,'excited',.5); D(146.5,1.4,'Whoa\u2026','surprised','CH01_SC07'); S(146.5,'voice',{pattern:'whoa'});
  C.move(138,12,[5.6,5.0,6.6],[0,4.1,0],54,'inOut');

  // ARCHIVE flies among the worlds
  A.faceToward(150,1,[2.2,3.6,2.4]);
  A.path(150.6,[[1.6,3.0,2.8],[3.4,4.3,1.2],[3.0,5.1,-1.8],[.4,4.6,-3.4],[-2.2,4.2,-2.0]],11.4,'inOut'); A.thrust(150.6,1,.95); S(150.8,'whoosh',{d:3,soft:1}); S(156,'whoosh',{d:3,soft:1});
  A.turnTo(152.6,2,Math.PI*.55); A.turnTo(155.2,2.4,Math.PI*1.05); A.turnTo(158.4,1.6,Math.PI*1.55);
  A.express(151,'happy',.4); A.spin(160.2,1.6,1); A.armsUp(160.2,.5); A.rest(161.8,.5); S(160.3,'spin'); S(160.4,'voice',{pattern:'giggle'});
  A.thrust(162,1,.65);
  C.shot(150,[5.9,3.5,4.2],[2.0,3.8,1.6],44);
  C.move(150,6,[5.2,5.4,2.6],[2.8,4.6,-.6],46,'inOut');
  C.move(156,6,[1.8,6.3,1.6],[-.8,4.5,-2.4],48,'inOut');

  // a touch sends a ripple through the whole network
  const n3=nodeAt(3,170); const reachPt=V.add(n3,V.mul(V.norm(V.sub([-2.2,4.2,-2.0],n3)),.75));
  A.faceToward(163,1.4,n3); A.flyTo(164,4.4,reachPt,'inOut'); A.express(164.4,'curious',.5); A.lookAt(167.6,.8,n3);
  A.reach(168.6,.6); S(169.95,'node_touch');
  T.loom.key(170,[1,0,1,0],'cut').key(173.2,[1,9,.0,0],'out'); S(170.1,'ripple',{d:3});
  T.loomB.to(169.9,.2,[0,0,3,.25]);
  A.express(170.2,'excited',.2); A.rest(171,.6); D(171.5,1.8,'They\u2019re all\u2026 connected.','happy','CH01_SC07'); S(171.5,'voice',{pattern:'q2'});
  A.express(173.4,'happy',.5);
  C.shot(163.2,V.add(reachPt,[1.6,.5,1.9]),V.lerp(reachPt,n3,.5),38); C.move(163.2,6.8,V.add(reachPt,[1.2,.35,1.45]),V.lerp(reachPt,n3,.55),34,'lin');
  C.shot(170.05,V.add(reachPt,[3.6,2.2,4.2]),[0,4.2,0],56); C.move(170.05,5,V.add(reachPt,[4.4,2.8,5.2]),[0,4.2,0],58,'out');

  // a thread flickers red and breaks
  const n9=nodeAt(9,180);
  T.loom.key(175.2,[1,9,0,0],'lin').key(178.8,[1,9,0,.65],'lin').key(179.25,[1,9,0,1],'cut');
  S(175.4,'thread_flicker',{d:3.8}); S(179.25,'thread_snap');
  A.lookAt(175.6,.6,n9); A.express(175.8,'worried',.3);
  A.faceToward(176.6,1,n9); A.express(179.3,'surprised',.1); D(179.5,.8,'No\u2014','worried','CH01_SC07'); S(179.5,'voice',{pattern:'eep'});
  const nearN9=V.add(n9,V.mul(V.norm(V.sub([0,4.2,0],n9)),.85));
  A.flyTo(180.2,2.6,nearN9,'inOut'); A.thrust(180.2,.6,1.1); A.thrust(182.6,.6,.7); A.faceToward(182,1,n9); S(180.3,'whoosh',{d:2.4});
  // ARCHIVE pushes energy into it: it nearly holds, then fails
  A.express(183.2,'determined',.3); A.reach(183.2,.6,true); A.power(183.4,.6,1.25); S(183.6,'push',{d:4});
  A.tr.jitter.key(183.8,0,'lin').key(185,.35).key(187.6,.6).key(188.4,0);
  T.loom.key(184.2,[1,9,0,1],'lin').key(186,[1,9,0,.42],'out').key(187.4,[1,9,0,.55],'lin').key(188.2,[1,9,0,1],'in');
  S(188.2,'thread_snap'); A.power(188.2,.4,1); A.express(188.3,'frustrated',.2); A.rest(188.6,.6);
  A.tr.yaw.key(188.6,A.tr.yaw.at(188.6)); // keep heading
  // and another one goes: the failures are spreading
  T.loomB.key(189.6,[0,0,3,.25],'lin').key(191.8,[.7,0,3,.25],'lin').key(192.2,[1,0,3,.25],'cut');
  S(190,'thread_flicker',{d:2.2}); S(192.2,'thread_snap'); A.lookAt(190.2,.7,nodeAt(2,191)); A.express(190.4,'worried',.3); A.express(192.4,'sad',.4);
  const d9=V.norm(V.sub(nearN9,n9)), s9=V.norm(V.cross([0,1,0],d9));
  const dR=V.norm(V.sub(reachPt,n9));
  C.shot(175.4,V.add(reachPt,V.add(V.mul(dR,2.2),V.add(V.mul(V.norm(V.cross([0,1,0],dR)),1.1),[0,.7,0]))),V.lerp(reachPt,n9,.55),48);
  C.move(175.4,4.5,V.add(reachPt,V.add(V.mul(dR,1.9),V.add(V.mul(V.norm(V.cross([0,1,0],dR)),.95),[0,.6,0]))),V.lerp(reachPt,n9,.6),46,'inOut');
  C.shot(180,V.add(V.lerp(reachPt,nearN9,.35),[4.6,.7,0]),V.lerp(reachPt,nearN9,.2),50);
  C.move(180,2.9,V.add(V.lerp(reachPt,nearN9,.75),[4.4,.6,0]),V.lerp(nearN9,n9,.3),48,'inOut');
  C.shot(183,V.add(n9,V.add(V.mul(d9,.35),V.add(V.mul(s9,2.1),[0,.35,0]))),V.lerp(nearN9,n9,.45),36);
  C.move(183,6,V.add(n9,V.add(V.mul(d9,.4),V.add(V.mul(s9,1.85),[0,.3,0]))),V.lerp(nearN9,n9,.45),34,'lin');
  C.shot(189.2,[4.8,6.2,6.0],[0,4.4,-1],52); C.move(189.2,5,[4.4,6.5,5.6],[0,4.4,-1],52,'lin');

  // the whole Loom streams toward the window; a ring flashes there
  T.loomB.to(195,8,[1,1,3,0],'inOut'); S(195,'stream',{d:8});
  T.loom.key(203,[1,9,0,1],'lin').key(206,[0,9,0,1],'inOut');
  T.window.key(203.2,1,'lin').key(203.6,2.2,'out').key(205.6,1);
  T.portal.cut(203,[0,5,-11.0,2.6]); T.portalFX.cut(203,[0,1,0,1]);
  T.portalFX.key(203.4,[1,1,0,1],'out').key(205.2,[0,1,0,1],'in'); S(203.4,'window_flash');
  A.faceToward(195.4,1.4,[0,5,-12]); A.express(195.6,'surprised',.4); A.lookAt(195.6,1.6,[0,5,-12]);
  A.flyTo(197,5,V.add(nearN9,[.0,.2,-1.2]),'inOut'); A.express(201,'curious',.6);
  D(206,1.6,'Where are you going?','curious','CH01_SC07'); S(206,'voice',{pattern:'q'});
  C.shot(195,[3.0,3.4,7.4],[0,4.6,-10],48); C.move(195,11,[2.4,3.8,6.4],[0,4.9,-10],46,'inOut');

  // the orb settles; a quiet, funny beat
  T.orb.to(206.4,5,[ORB[0],ORB[1],ORB[2],.36],'inOut'); T.orbGlow.to(206.4,5,.45);
  const atOrb=[.0,1.85,1.25];
  A.faceToward(207,1,ORB); A.flyTo(207.4,4.4,atOrb,'inOut'); A.thrust(207.4,1,.8); A.thrust(211,1,.6); A.lookAt(210.8,.8,ORB); A.express(211.4,'thinking',.6);
  A.reach(215.6,.5); S(216.1,'touch'); T.orbPulse.key(216.1,0,'lin').key(216.2,.25,'out').key(216.7,0); A.rest(216.6,.5);
  A.tr.headTilt.to(217,.5,.3); A.express(217.2,'confused',.4);
  A.reach(219.4,.25); A.rest(219.7,.2); A.reach(219.95,.25); A.rest(220.25,.2); A.reach(220.5,.25); A.rest(220.8,.3);
  S(219.6,'touch'); S(220.15,'touch'); S(220.7,'touch');
  T.orbSpin.key(220.8,T.orbSpin.at(220.8),'lin').key(222.6,T.orbSpin.at(220.8)+.6,'out'); S(220.9,'boop');
  A.tr.headTilt.to(221,.4,0); A.express(221.4,'frustrated',.3); A.arms(221.6,.6,[.9,.1,1.9],[.9,.1,1.9]); S(221.8,'voice',{pattern:'phew'});
  A.rest(224.4,.8); A.express(224.6,'sad',.8); A.lookAt(225,1.4,DOCK);
  A.lookAt(229.2,1.6,[0,5,-12]); A.express(229.6,'thinking',.8);
  C.shot(206.3,[4.6,3.2,5.4],[0,2.0,.4],42); C.move(206.3,5.2,[3.2,2.6,4.1],[0,1.9,.6],40,'inOut');
  C.shot(211.6,[1.45,2.05,2.75],[0,1.8,.55],32); C.move(211.6,12.5,[1.25,2.0,2.45],[0,1.8,.6],30,'lin');
  C.shot(224.2,[-1.0,2.2,2.5],[3.4,1.2,2.1],38); C.move(224.2,4.5,[-1.2,2.25,2.7],[3.6,1.3,2.0],38,'lin');
  C.shot(228.8,[.45,2.25,3.4],[0,4.4,-11],44); C.move(228.8,7.2,[.35,2.2,3.1],[0,4.6,-11],42,'lin');

  // one shelf orb wakes up across the hall
  T.shelf.key(235.8,[-1,0,0],'lin').key(236,[.03,1,0],'cut'); S(236,'shelf_chime',{m:84});
  const s0=shelfPos(.02,3.26);
  A.lookAt(236.3,.5,s0); A.express(236.4,'surprised',.15); A.express(237.4,'curious',.5);
  C.shot(236.2,[.9,2.3,3.9],[7,2.8,3.4],40); C.move(236.2,3.8,[.7,2.25,3.6],[8.5,3.0,3.8],38,'lin');

  // ================= SC08 · The door that wasn't there (240–360) =================
  const tp=(s,y)=>trailPos(s,y);
  A.faceToward(240,1,tp(.05,3)); A.flyTo(240.6,3.4,tp(.05,3.0),'inOut'); A.thrust(240.6,1,.95); S(240.7,'whoosh',{d:3});
  A.express(241,'excited',.4); A.lookAt(243.6,.5,s0);
  // the trail runs along the shelves; ARCHIVE follows
  T.shelf.key(244.2,[.03,1,0],'lin').key(258,[.75,1,0],'lin');
  for(let k=0;k<14;k++) S(244.6+k*.98,'shelf_chime',{m:[84,86,88,91,93,96][k%6]-(k%3?0:12)});
  A.turnTo(244,1,trailYaw(.2));
  A.path(244.4,[tp(.18,3.25),tp(.34,2.9),tp(.5,3.3),tp(.64,3.0),tp(.72,3.1)],13.6,'inOut'); A.thrust(244.4,1,.9);
  A.turnTo(249,4,trailYaw(.5)); A.turnTo(253,4,trailYaw(.72)); A.express(246,'happy',.5); A.lookAt(247,1,shelfPos(.4,3.3)); A.lookAt(252,1,shelfPos(.65,3.3));
  C.shot(244,[3.4,2.8,4.4],[9.4,3.2,2.6],42);
  C.via(251,[5.6,3.3,1.0],[9.8,3.2,-1.4]); C.via(258,[6.4,3.5,-1.9],[9.6,3.2,-4.0]);
  // the trail stalls; ARCHIVE helps it along
  A.express(258.4,'curious',.4); A.scan(259,3.4); S(259.2,'voice',{pattern:'q'});
  A.tr.headTilt.to(262.6,.4,.3); A.express(262.8,'confused',.4);
  const nextOrb=shelfPos(.8,3.26), tapAt=trailPos(.8,3.1,10.55);
  A.tr.headTilt.to(263.4,.4,0); A.faceToward(263.4,.8,nextOrb); A.flyTo(263.6,2,tapAt,'inOut'); A.express(263.8,'determined',.4);
  A.point(265.4,1.2); S(266.45,'poke'); A.tr.yaw.key(266.6,A.tr.yaw.at(266.6));
  T.shelf.key(266.5,[.75,1,0],'lin').key(266.6,[.85,1,0],'out'); S(266.6,'shelf_chime',{m:91});
  A.express(266.8,'proud',.3); A.tr.bob.key(266.8,1).key(267.1,2.2).key(268.4,1); D(267,1,'Ha!','proud','CH01_SC08'); S(267,'voice',{pattern:'giggle'});
  C.shot(258.2,trailPos(.42,4.3,7.2),[9.6,3.1,-3.4],44); C.move(258.2,7.6,trailPos(.48,4.1,7.5),[9.9,3.2,-3.9],42,'lin');
  // and it races off, ARCHIVE zipping after it
  T.shelf.key(268.2,[.85,1,0],'lin').key(282,[1.56,1,0],'in');
  for(let k=0;k<16;k++) S(268.6+k*.82-k*k*.012,'shelf_chime',{m:[86,88,91,93,95,98][k%6]});
  A.faceToward(268,.8,tp(1.0,3.2));
  A.path(268.6,[tp(.92,3.15),tp(1.1,3.5),tp(1.3,3.2),tp(1.48,3.4)],13.2,'in'); A.thrust(268.6,1,1.15); S(270,'whoosh',{d:4}); S(276,'whoosh',{d:4});
  A.turnTo(270,4,trailYaw(1.1)); A.turnTo(274,4,trailYaw(1.3)); A.turnTo(278,3.6,trailYaw(1.5)); A.express(269,'excited',.4);
  C.shot(268,[4.2,4.6,1.4],[6.4,3.4,-6.2],50); C.move(268,14,[1.4,4.2,-3.2],[3.6,3.5,-8.6],48,'inOut');
  // every awakened orb flares at once; the window brightens
  T.shelf.key(282.2,[1.56,1,0],'lin').key(282.6,[1.56,1,1],'out').key(284.8,[1.56,.8,0]); S(282.3,'shelf_flare');
  T.window.to(282.4,4,1.5);
  A.thrust(282,1,.7); A.express(282.4,'surprised',.3); A.lookAt(282.5,.8,[0,5,-12]);

  // in front of the window: a quiet look at the stars
  const winFront=[0,4.6,-8.2];
  A.faceToward(284.4,1.2,[0,5,-12]); A.flyTo(284.8,5,winFront,'inOut'); A.thrust(284.8,1,.85); A.thrust(289.6,1,.55); S(285,'whoosh',{d:4,soft:1});
  A.lookAt(290.4,2.4,[2.6,7.4,-30]); A.express(290.6,'relieved',1.2); A.tr.bob.to(290,3,.6);
  A.reach(297.6,1.4); A.express(298,'happy',.8); A.rest(301.6,1.2); A.express(302,'thinking',1);
  C.shot(284.2,[3.6,4.2,-1.4],[0,4.8,-9],46); C.move(284.2,5.6,[2.2,4.3,-3.2],[0,4.8,-9.5],44,'inOut');
  C.shot(290,[.75,3.9,-3.4],[0,5.1,-12],40); C.move(290,15,[.45,4.15,-5.3],[0,5.3,-12],38,'lin');

  // sparks gather and trace a ring in the window
  T.portal.cut(305,[0,5,-11.0,2.6]); T.portalFX.cut(305,[0,0,0,1]);
  T.portalFX.key(306,[0,0,0,1],'lin').key(306.8,[1,.08,0,1],'out').key(312,[1,.42,0,1],'inOut').key(313,[1,.42,0,1],'lin').key(321.6,[1,1,0,1],'inOut');
  S(306.6,'spark',{d:6}); S(313.2,'spark',{d:8.4}); S(321.6,'ring_hum',{d:9});
  A.express(306.8,'surprised',.2); A.tr.bob.to(306.8,.6,1); A.flyTo(307,1.4,[0,4.4,-6.6],'outExpo'); A.tr.jitter.key(307,0,'lin').key(307.2,.6).key(308.4,0);
  A.arms(307,.3,[1.8,.8,.3],[1.8,.8,.3],'out'); A.rest(309,.8); A.express(309.4,'curious',.6); D(309.6,.8,'Huh?','surprised','CH01_SC08'); S(309.6,'voice',{pattern:'q'});
  A.lookAt(312,2,[2,6.5,-11]); A.lookAt(315,3,[-2,6.4,-11]); A.lookAt(318.5,3,[0,5,-11]);
  A.express(322,'surprised',.3); A.lookAt(324,1.2,ORB); A.express(324.4,'thinking',.6); A.lookAt(327,1.2,[0,5,-11]);
  C.shot(305.6,[6.2,3.7,-5.0],[0,4.8,-10.4],44); C.move(305.6,9.9,[5.6,3.9,-5.6],[0,4.9,-10.6],42,'lin');
  C.shot(315.6,[.85,4.75,-9.6],[0,4.55,-6.6],34); C.move(315.6,6.1,[.7,4.7,-9.3],[0,4.5,-6.6],32,'lin');
  C.shot(321.8,[2.6,3.2,-.4],[0,5,-11],48); C.move(321.8,8.1,[2.2,3.4,-1.6],[0,5,-11],46,'lin');

  // the ring opens partway; wind, light, a glimpse
  T.portalOpen.key(330,0,'lin').key(340,.35,'inOut').key(358,.62,'inOut');
  T.portalFX.key(330,[1,1,0,1],'lin').key(345,[1,1,0,1],'lin').key(358,[1,1,.45,1],'inOut');
  S(330.2,'portal_open',{small:1}); S(331,'wind',{d:29});
  A.express(330.4,'surprised',.3); A.flyTo(330.6,3,[0,4.25,-5.2],'out'); A.express(334,'worried',.6);
  D(341,1.2,'\u2026A door?','curious','CH01_SC08'); S(341,'voice',{pattern:'q2'}); A.express(340.6,'curious',.6);
  A.flyTo(347,8,[0,4.55,-6.1],'inOut'); A.thrust(347,1,.6); A.express(352,'excited',1);
  T.shelf.key(330,[1.56,.8,0],'lin').key(358,[1.56,1,.2],'lin');
  C.shot(330,[1.6,1.4,3.6],[0,4.4,-10],52); C.move(330,14.9,[1.2,1.8,1.2],[0,4.7,-10],48,'inOut');
  C.shot(345,[-1.4,4.0,-2.6],[0,4.9,-10.2],42); C.move(345,15,[-.9,4.3,-3.8],[0,5,-10.6],40,'inOut');

  // ================= SC09 · Into the portal (360–540) =================
  T.portalOpen.key(361,.62,'lin').key(368,1,'out'); T.portalFX.key(361,[1,1,.45,1],'lin').key(375,[1,1,1,1],'inOut');
  S(361,'portal_open'); T.window.to(361,6,1.9);
  A.express(361.2,'surprised',.25); A.tr.jitter.key(361.2,0,'lin').key(361.4,.5).key(362.6,0);
  A.express(366,'excited',1.2); A.lookAt(366,3,[1.5,5.6,-11]);
  C.shot(361,[1.5,4.2,-.9],[0,5,-11],44); C.move(361,16.9,[.9,4.45,-2.6],[0,5,-11],40,'inOut');

  // ARCHIVE approaches... and stops
  A.flyTo(378.4,7.6,[0,4.9,-8.3],'inOut'); A.thrust(378.4,1,.7); A.express(379,'curious',.8);
  A.express(386.2,'worried',.3); A.tr.jitter.key(386,0,'lin').key(386.4,.35).key(387.6,0); S(386.2,'servo');
  A.head(387.6,1,.9,0,.1); A.head(389.6,.9,0,0,0); A.express(389.8,'thinking',.6);
  C.shot(378,[2.6,4.3,-5.4],[0,4.9,-9.6],40); C.move(378,9,[1.9,4.6,-6.8],[0,4.95,-9.6],36,'inOut');
  C.shot(387.2,[.55,5.15,-10.3],[0,4.9,-8.3],34); C.move(387.2,4.7,[.45,5.1,-10.1],[0,4.9,-8.3],32,'lin');

  // it looks back at home and returns to the orb
  A.turnTo(392,2.2,0); A.lookAt(393,1.4,ORB); A.express(393.4,'sad',1);
  const backAtOrb=[0,1.85,-1.2];
  A.path(396.2,[[.3,4.2,-6.2],[.6,2.9,-3.0],backAtOrb],7.8,'inOut'); A.thrust(396.2,1,.85); A.thrust(403,1,.6); S(396.6,'whoosh',{d:4,soft:1});
  A.lookAt(404.2,.8,ORB); A.express(404.4,'worried',.8); D(405,1.5,'If I go\u2026','worried','CH01_SC09'); S(405,'voice',{pattern:'q2'});
  C.shot(392,[.6,5.3,-10.2],[0,3.2,1.5],44); C.move(392,11.9,[.4,5.0,-9.6],[0,2.4,0],46,'inOut');
  C.shot(404,[1.3,2.2,1.4],[0,1.82,-.9],32); C.move(404,7.5,[1.1,2.15,1.2],[0,1.82,-.85],30,'lin');

  // the orb answers: three chimes, and the whole Archive glows with it
  T.orbGlow.to(411.6,1.6,1.4); T.orbPulse.key(412,0,'lin').key(412.2,.9,'out').key(413.4,0); S(412,'boot_chime');
  T.shelf.key(414.6,[1.56,1,.2],'lin').key(415.4,[1.56,1,1.2],'out').key(418.6,[1.56,1,.3]); S(414.8,'shelf_flare');
  T.window.key(414.8,1.9,'lin').key(415.6,2.4,'out').key(418.6,1.9);
  A.express(412.4,'surprised',.3); A.lookAt(415,1.6,[-6,4,4]); A.lookAt(417,1.6,[6,4,4]); A.lookAt(419,1,ORB); A.express(419.4,'relieved',.8);
  A.reach(420.6,.8,true); S(421.4,'touch'); T.orbSpin.key(421.4,T.orbSpin.at(421.4),'lin').key(427,T.orbSpin.at(421.4)+1.4,'out');
  A.rest(422.6,.7); A.express(423,'happy',.6); D(424,1.8,'Okay. I\u2019ll come back.','happy','CH01_SC09'); S(424,'voice',{pattern:'hi'});
  T.orbGlow.to(425,3,.6);
  C.shot(411.6,[-3.2,3.6,4.6],[0,2.4,-.6],50); C.move(411.6,8.5,[-3.8,4.4,5.4],[0,2.8,-1],54,'inOut');
  C.shot(420.2,[1.2,2.1,1.25],[0,1.8,-.8],32); C.move(420.2,7.8,[.95,2.05,1.0],[0,1.8,-.8],30,'lin');

  // a goodbye to the mirror panel on the way out
  const inFront=V.add(P1C,V.add(V.mul(P1N,.95),[0,-.1,0]));
  T.holo.to(428,1,[.7,1,.7]); T.mirror.to(428.4,.5,1);
  A.faceToward(428,1,inFront); A.flyTo(428.6,4,inFront,'inOut'); A.thrust(428.6,1,.85); A.thrust(432,1,.6); S(428.8,'whoosh',{d:3,soft:1});
  A.faceToward(432,1.2,P1C); A.head(432.8,.8,0,.05,0); A.express(433.2,'happy',.5);
  A.express(434.6,'wink',.25); S(434.7,'blip',{f:1400}); A.express(435.8,'happy',.4);
  A.wave(436.4,2.2,'R'); S(436.6,'voice',{pattern:'hi'}); D(436.6,1,'Bye!','happy','CH01_SC09');
  T.mirror.to(440,1.2,0); T.holo.to(440.4,2,[.7,.55,.7]);
  C.shot(428.2,[3.2,2.6,2.6],[5.0,1.9,-1.0],42); C.move(428.2,4.3,[3.4,2.4,1.6],[5.3,1.8,-1.2],40,'inOut');
  const side=V.norm(V.cross([0,1,0],P1N));
  const mid=V.lerp(inFront,P1C,.45);
  C.shot(432.6,V.add(mid,V.add(V.mul(side,2.5),V.add(V.mul(P1N,1.5),[0,.25,0]))),mid,40);
  C.move(432.6,7.6,V.add(mid,V.add(V.mul(side,2.2),V.add(V.mul(P1N,1.3),[0,.2,0]))),mid,38,'lin');

  // back to the portal; a breath; resolve
  const porFront=[0,4.9,-8.0];
  A.faceToward(441,1.2,[3,3,-4.5]); A.path(441.6,[[3.6,3.0,-4.4],[1.2,4.4,-6.8],porFront],8.6,'inOut'); A.thrust(441.6,1,.95); A.thrust(449.6,1,.6); S(442,'whoosh',{d:5,soft:1});
  A.turnTo(446,4,Math.PI); A.express(442.2,'excited',.6); A.express(450.4,'thinking',1);
  A.power(452.4,1.4,.7); A.tr.headPitch.to(452.4,1.4,.22); A.power(454.4,1.6,1.15); A.tr.headPitch.to(454.4,1.6,-.05); S(452.6,'breath',{d:3.4});
  A.express(455,'determined',.8); A.tr.headPitch.to(458,.3,.16); A.tr.headPitch.to(458.4,.4,0); S(458.1,'servo');
  D(463,1.6,'Okay. Let\u2019s go see.','determined','CH01_SC09'); S(463,'voice',{pattern:'hi'}); A.thrust(462,4,.95);
  C.shot(441.2,[-2.6,3.6,1.6],[2.0,3.6,-5.0],46); C.move(441.2,9,[-1.8,4.4,-2.2],[0,4.8,-8.6],44,'inOut');
  C.shot(450.4,[3.0,4.95,-8.0],[0,4.95,-9.3],38); C.move(450.4,9.3,[2.6,4.95,-8.4],[0,4.95,-9.3],36,'lin');
  C.shot(459.8,[.35,5.05,-10.25],[0,4.95,-8.0],32); C.move(459.8,10,[.3,5.0,-10.1],[0,4.95,-8.0],30,'lin');

  // the plunge: wide, then chase through the portal
  A.express(470.6,'excited',.6); A.armsUp(474.6,.6); A.arms(475.6,.5,[2.85,.25,.1],[2.85,.25,.1]);
  A.flyTo(476,4.4,[0,5,-14],'in'); A.thrust(476,2,1.5); S(476.2,'whoosh',{d:4.4}); S(476.4,'voice',{pattern:'giggle'});
  C.shot(470,[0,6.6,4.8],[0,4.9,-9],46); C.move(470,7.9,[0,6.2,2.6],[0,4.95,-10],44,'inOut');
  C.shot(478,[.25,5.35,-6.2],[0,5,-12],50);
  C.move(478,3,[0,5.25,-11.7],[0,5,-17],62,'in');
  T.tunnel.key(480.4,[0,0,0,0],'lin').key(481.6,[1,0,6,0],'in'); S(480.6,'tunnel',{d:47});

  // the transit tunnel (481–528): ARCHIVE has the time of its life
  T.tunnel.key(528,[1,1,140,0],'lin');
  T.tunnel.key(510,[1,0,94,0],'lin'); // gold rises from 510
  A.flyTo(481,2.4,[0,5,-15.5],'out');
  A.express(482,'excited',.6); A.tr.bob.to(482,2,1.4);
  A.tr.roll.key(489.6,0,'lin').key(491.8,Math.PI*2,'inOut'); A.tr.roll.cut(491.81,0); S(489.8,'spin'); S(490,'voice',{pattern:'giggle'});
  A.rest(493,1); A.express(494,'happy',.5);
  A.head(498.6,.8,-1.0,0,.2); A.express(499,'happy',.4); A.wave(499.4,2,'L'); A.head(502.2,.8,0,0,0);
  D(504.6,1.6,'Wheeee!','excited','CH01_SC09'); S(504.6,'voice',{pattern:'yawn'}); A.armsUp(504.4,.5); A.arms(506.6,.6,[2.85,.25,.1],[2.85,.25,.1]);
  A.express(510.2,'surprised',.4); A.lookAt(510.4,1,[0,5,-40]); A.express(513,'curious',.8);
  A.express(518,'determined',.6); A.thrust(518,3,1.4);
  C.shot(481.2,[0,5.4,-12.4],[0,5,-17],56);
  C.via(488,[1.6,5.7,-13.1],[0,5,-15.5]); C.via(496,[-1.1,5.3,-13.0],[0,5.05,-15.5]);
  C.via(503,[-.9,5.15,-17.4],[0,5.05,-15.5]); C.via(512,[.7,5.25,-17.8],[0,5,-15.4]);
  C.via(519,[.25,5.4,-13.2],[0,5,-17]); C.move(519,9,[0,5.25,-13.6],[0,5,-20],48,'inOut');

  // light at the end: whiteout, then black to close the chapter
  T.exposure.key(522,1,'lin').key(530,5.5,'in').key(536.6,12,'lin');
  T.fade.key(537.2,1,'lin').key(539.9,0,'inOut');
  S(527.5,'flash');
});

// =================== score for 2:00–9:00 ===================
G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,CH,beat,bar,theme}=K, e8=beat/2;
  // aftermath: three pulses (theme head), distant answer
  add(120,18,36,'drone',.6,0,{att:3}); add(120,18,43,'drone',.35,0,{att:4});
  [[121,76],[122.05,79],[123.05,86]].forEach(([t,m])=>{ add(t,1.5,m,'bell',.75,0); add(t,1.5,m-12,'celesta',.4,0); });
  [[124.8,88],[125.7,91],[126.6,98]].forEach(([t,m])=>add(t,2,m,'bell',.28,.6));
  chord(128.2,5,CH.Fadd9,'pad',.35,{att:2}); chord(133.2,5,CH.Dm9,'pad',.38,{att:2});
  for(let k=0;k<16;k++) add(128.4+k*.6,.4,[79,83,86,88][k%4]+(k>8?12:0),'celesta',.32,Math.sin(k)*.5);
  // the Loom: network leitmotif — a rolling celesta/pluck ostinato over wide chords
  const loomProg=['Fmaj7','G','Em7','Am7','Fmaj7','G','Cmaj7','Cmaj7'];
  loomProg.forEach((c,b)=>{ const t0=138+b*bar; const ch=CH[c];
    chord(t0,bar*1.02,ch.map(x=>x+12),'strings',.26,{att:.9}); add(t0,bar,ch[0]-12,'bass',.42,0);
    [0,2,1,3,2,1,3,2].forEach((k,j)=>add(t0+j*e8,e8*.8,ch[k]+24,j%2?'pluck':'celesta',.45,j%2?.35:-.35)); });
  theme.forEach(([b,m,d])=>add(150+b*beat,d*beat*1.05,m+12,'strings',.62,-.1,{att:.3}));
  // touch → ripple: bell cascade
  [84,88,91,96,100,103].forEach((m,k)=>add(170+k*.13,2.5,m,'bell',.55,k*.18-.45));
  chord(170,5,[60,64,67,71,76],'pad',.4,{att:.4});
  // the breaking threads: tension
  add(175.2,20,37,'drone',.6,0,{att:2}); chord(175.2,6,CH.Fm6,'strings',.3,{att:1.2});
  chord(181,6,CH.Dm9,'strings',.3,{att:1}); add(179.25,1,36,'timp',1,0); add(188.2,1,36,'timp',1,0); add(192.2,1,34,'timp',1.1,0);
  for(let k=0;k<10;k++) add(183.4+k*.42,.3,[61,62,61,63][k%4],'pluck',.4+.04*k,(k%2?.3:-.3));
  chord(189.6,6,[41,48,51,56],'pad',.42,{att:1});
  // the stream to the window: swell
  chord(195,4,CH.Bbmaj7.map(x=>x+12),'strings',.36,{att:2}); chord(199,4.4,CH.Asus.map(x=>x+12),'strings',.4,{att:1.5});
  chord(199,4.4,[45,52],'brass',.35,{}); add(203.4,1,33,'timp',1.1,0); [88,93,95,100].forEach((m,k)=>add(203.4+k*.1,3,m,'bell',.45,k*.2-.3));
  // quiet beat at the orb: solo piano, comic celesta boops
  [[206.5,'Am7'],[211.3,'Fmaj7'],[216.1,'Cmaj7'],[220.9,'Em7'],[225.7,'Am7'],[230.5,'Fmaj7']].forEach(([t,c])=>{
    CH[c].forEach((m,k)=>add(t+k*.18,4,m+12,'piano',.4,k*.15-.2)); add(t,4.8,CH[c][0]-12,'bass',.3,0); });
  [[0,64,1.4],[1.5,67,1.2],[3,69,2.6]].forEach(([b,m,d])=>add(212+b,d,m+12,'piano',.55,0));
  [[219.6,96],[220.15,98],[220.7,101]].forEach(([t,m])=>add(t,.2,m,'celesta',.45,.3)); add(221,.3,72,'pluck',.6,0);
  [[0,76],[1.2,74],[2.4,72],[3.6,69]].forEach(([b,m])=>add(225.8+b,1.4,m,'piano',.45,0));
  // the shelf trail: playful pizzicato, a stall, then a dash
  const pz=[[0,67],[1,72],[2,74],[3,72],[4,76],[5,74],[6,72],[7,74]];
  for(let rep=0;rep<4;rep++) pz.forEach(([k,m])=>{ const t=244.4+rep*8*e8*1.0+k*e8; if(t<258) add(t,e8*.6,m+(rep%2?12:0),'pluck',.7,(k%2?.3:-.3)); });
  for(let k=0;k<20;k++){ const t=244.4+k*beat; if(t<258) add(t,beat*.5,[36,43,40,43][k%4],'pluck',.8,0); }
  chord(244.4,13.6,CH.Cmaj7,'pad',.22,{att:2});
  for(let k=0;k<8;k++) add(258.6+k*1.0,.15,k%2?88:84,'pluck',.25,(k%2?.4:-.4)); // tick... tock... (the stall)
  const e16=e8*.75;
  for(let k=0;k<52;k++){ const t=268.4+k*e16; if(t<282) add(t,e16*.7,[72,76,79,84,79,76][k%6]+(k>26?12:0),'pluck',.6,(k%2?.35:-.35)); }
  ['Cmaj7','Am7','Fmaj7','G'].forEach((c,b)=>{ const t0=268.4+b*3.4; chord(t0,3.5,CH[c].map(x=>x+12),'strings',.3,{att:.4}); add(t0,3.4,CH[c][0]-12,'bass',.5,0); });
  chord(282.3,5,[60,64,67,72,76],'brass',.4,{}); add(282.3,1,36,'timp',1,0); [84,88,91,96].forEach((m,k)=>add(282.3+k*.1,3,m,'bell',.5,k*.2-.3));
  // the window: the theme, slow and spacious
  chord(285,10,CH.Cmaj7.map(x=>x+12),'pad',.32,{att:3}); chord(295,10,CH.Em7.map(x=>x+12),'pad',.32,{att:3});
  theme.forEach(([b,m,d])=>add(288+b*beat*1.4,d*beat*1.5,m+12,'piano',.6,0));
  add(285,20,36,'drone',.35,0,{att:4});
  // sparks: mystery
  chord(305.5,16,CH.Fadd9,'pad',.32,{att:3}); add(305.5,24,29,'drone',.55,0,{att:3});
  for(let k=0;k<24;k++) add(306.6+k*.62,.3,[89,93,96,100,98,93][k%6],'celesta',.28+.01*k,Math.sin(k*1.7)*.6);
  chord(321.6,8,[53,60,65,69,72],'pad',.42,{att:.3}); [77,81,84,89].forEach((m,k)=>add(321.6+k*.12,4,m,'bell',.5,k*.2-.3));
  // the door opens partway: low strings, timpani roll
  chord(330,15,[36,43,48],'strings',.3,{att:4}); chord(345,15,[38,45,50,53],'strings',.36,{att:3});
  for(let k=0;k<36;k++){ const t=346+k*.4; add(t,.4,36,'timp',.12+k*.012,0); }
  // fully open: the theme in brass and strings
  add(361,1,36,'timp',1.2,0); chord(361,6,[36,43,48,55,60,64],'brass',.45,{});
  const T5=362.4; theme.forEach(([b,m,d])=>{ add(T5+b*beat,d*beat,m+12,'brass',.55,.1); add(T5+b*beat,d*beat,m+24,'strings',.6,-.1,{att:.2}); });
  ['Cmaj7','Em7','Fmaj7','Gsus','Am7','Em7','Fmaj7','G'].forEach((c,b)=>{ const t0=T5+b*bar/2; chord(t0,bar/2,CH[c].map(x=>x+12),'strings',.3,{att:.4}); add(t0,bar/2,CH[c][0]-12,'bass',.5,0); });
  // hesitation and the look back: thin, sad
  chord(378.4,8,CH.Am7.map(x=>x+12),'strings',.22,{att:2}); chord(386.4,6,CH.Fmaj7.map(x=>x+12),'strings',.2,{att:2});
  [[392,76],[393.6,74],[395.2,72],[396.8,71],[398.4,69],[401,67]].forEach(([t,m])=>add(t,1.8,m,'piano',.5,0));
  chord(396,8,CH.Am7,'pad',.28,{att:2}); chord(404,8,CH.Fm6,'pad',.3,{att:2});
  // the Archive answers: warm theme in celesta
  chord(412,8,CH.Cmaj7.map(x=>x+12),'pad',.4,{att:1}); add(412,8,36,'bass',.35,0);
  theme.slice(0,7).forEach(([b,m,d])=>add(414.6+b*beat,d*beat,m+24,'celesta',.5,0));
  chord(420.6,8,CH.Fmaj7.map(x=>x+12),'strings',.28,{att:1.2}); chord(424.6,4,CH.G.map(x=>x+12),'strings',.28,{att:1}); 
  // mirror goodbye: a short pizzicato reprise
  pz.forEach(([k,m])=>add(431.6+k*e8,e8*.6,m+12,'pluck',.6,(k%2?.3:-.3))); add(434.7,.4,96,'celesta',.5,.3);
  [[436.6,76],[437.2,79],[437.8,84]].forEach(([t,m])=>add(t,.8,m,'celesta',.45,0));
  // resolve: rising ostinato and crescendo
  const rise=['Am7','Fmaj7','Cmaj7','G','Am7','Fmaj7','Cmaj7','Gsus'];
  rise.forEach((c,b)=>{ const t0=442+b*3.5; chord(t0,3.6,CH[c].map(x=>x+12),'strings',.22+b*.025,{att:.6}); add(t0,3.5,CH[c][0]-12,'bass',.45+b*.02,0);
    for(let j=0;j<7;j++) add(t0+j*e8,e8*.7,CH[c][j%4]+24,'pluck',.35+b*.03,(j%2?.3:-.3)); });
  add(470,1,36,'timp',1.1,0); chord(470,6,[48,55,60,64,67],'brass',.5,{}); add(476,1,31,'timp',1.2,0);
  chord(476,4.4,[43,50,55,59,62],'brass',.55,{});
  // the tunnel: driving, joyful
  for(let k=0;k<Math.floor(46/e8);k++){ const t=481.4+k*e8; add(t,e8*.6,[36,36,43,36,41,41,43,43][Math.floor(k/4)%8],'bass',.5,0); }
  const tun=['Cmaj7','Am7','Fmaj7','G'];
  for(let b=0;b<14;b++){ const c=tun[b%4], t0=481.4+b*bar*.85; chord(t0,bar*.86,CH[c].map(x=>x+12),'strings',.3,{att:.3});
    for(let j=0;j<8;j++) add(t0+j*bar*.85/8,.25,CH[c][j%4]+24+(j%3?0:12),'celesta',.35,(j%2?.4:-.4)); }
  theme.forEach(([b,m,d])=>{ add(490+b*beat*.85,d*beat*.85,m+12,'brass',.5,0); add(510+b*beat*.85,d*beat*.85,m+24,'strings',.62,0,{att:.1}); });
  add(510,1,36,'timp',1.1,0); add(520,1,36,'timp',1.1,0);
  // into the light
  chord(527.5,9,[48,55,60,64,67,72,76],'pad',.55,{att:.3}); chord(527.5,7,[48,55,60,64],'brass',.5,{});
  [84,88,91,96,100].forEach((m,k)=>add(527.6+k*.12,5,m,'bell',.55,k*.2-.4)); add(527.5,1,36,'timp',1.2,0);
});

// =================== sound effects for 2:00–9:00 ===================
Object.assign(G.ARCHIVE_SFX_EXT,{
  pulse3:(S,c,u)=>{ [0,1.05,2.05].forEach(k=>{ S({t:c.t+k,d:.5,i:'thump',f:44,k:2.5,g:.7}); }); },
  answer:(S,c,u)=>{ [0,.9,1.8].forEach((k,j)=>S({t:c.t+k,d:.2,f:u.mtof([88,91,98][j]),i:'bell',v:.3,pan:.5})); },
  loom_unfold:(S,c)=>{ S({t:c.t,d:c.d,i:'noiseSweep',f0:200,f1:3200,g:.35}); S({t:c.t,d:c.d,i:'hum',f0:65,f1:130,g:.45}); },
  node_touch:(S,c,u)=>{ S({t:c.t,d:.2,f:u.mtof(96),i:'bell',v:.7}); S({t:c.t,d:.5,i:'thump',f:60,k:5,g:.5}); },
  ripple:(S,c)=>{ S({t:c.t,d:c.d,i:'noiseSweep',f0:900,f1:200,g:.35}); },
  thread_flicker:(S,c)=>{ S({t:c.t,d:c.d,i:'crackle',g:.9}); S({t:c.t,d:c.d,i:'glitch',v:.5}); },
  thread_snap:(S,c)=>{ S({t:c.t,d:.6,i:'thump',f:80,k:9,g:.9}); S({t:c.t,d:.4,i:'chirp',f0:1800,f1:300,g:.5}); },
  push:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:110,f1:330,g:.5}); },
  stream:(S,c)=>{ S({t:c.t,d:c.d,i:'noiseSweep',f0:300,f1:2600,g:.5}); S({t:c.t,d:c.d,i:'hum',f0:90,f1:180,g:.35}); },
  window_flash:(S,c)=>{ S({t:c.t,d:1,i:'thump',f:38,k:1.4,g:.9}); },
  boop:(S,c)=>{ S({t:c.t,d:.18,i:'chirp',f0:520,f1:380,g:.45}); },
  shelf_chime:(S,c,u)=>{ S({t:c.t,d:.2,f:u.mtof(c.m||88),i:'bell',v:.35,pan:.5}); },
  shelf_flare:(S,c,u)=>{ [84,88,91,96,100].forEach((m,k)=>S({t:c.t+k*.07,d:.3,f:u.mtof(m),i:'bell',v:.4,pan:k*.3-.6})); S({t:c.t,d:2.4,i:'noiseSweep',f0:500,f1:5000,g:.3}); },
  spark:(S,c)=>{ S({t:c.t,d:c.d,i:'crackle',g:1.2}); S({t:c.t,d:c.d,i:'hum',f0:220,f1:440,g:.25}); },
  ring_hum:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:73,f1:73,g:.55}); S({t:c.t,d:.8,i:'thump',f:46,k:1.6,g:.8}); },
  portal_open:(S,c)=>{ S({t:c.t,d:1.4,i:'thump',f:c.small?48:34,k:c.small?2:1,g:1}); S({t:c.t,d:c.small?4:7,i:'noiseSweep',f0:150,f1:c.small?1800:4200,g:.55}); },
  wind:(S,c)=>{ for(let k=0;k<c.d;k+=2) S({t:c.t+k,d:2.6,i:'noiseSweep',f0:250+((k*37)%300),f1:700+((k*53)%500),g:.22}); },
  breath:(S,c)=>{ S({t:c.t,d:1.4,i:'noiseSweep',f0:300,f1:900,g:.18}); S({t:c.t+1.6,d:1.8,i:'noiseSweep',f0:900,f1:250,g:.18}); },
  tunnel:(S,c)=>{ for(let k=0;k<c.d;k+=1.5) S({t:c.t+k,d:2,i:'noiseSweep',f0:400+((k*91)%900),f1:2600+((k*57)%1800),g:.3}); S({t:c.t,d:c.d,i:'hum',f0:80,f1:160,g:.3}); },
  flash:(S,c)=>{ S({t:c.t,d:9,i:'noiseSweep',f0:200,f1:9000,g:.5}); S({t:c.t,d:2,i:'thump',f:32,k:.8,g:1}); },
});
})(typeof window!=='undefined'?window:globalThis);
