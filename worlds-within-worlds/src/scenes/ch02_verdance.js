/* CHAPTER 2 — THE FIRST WORLD (9:00–18:00)
   Verdance: a canal city at dawn. ARCHIVE meets TOCK, a rule-following courier drone.
   CH02_SC01 Arrival in Verdance (9:00–12:00) · CH02_SC02 Tock's tour (12:00–15:00) · CH02_SC03 The flicker (15:00–18:00)
   World layout: canal along -Z (|x|<3, z 30..-56), promenades |x| 3–6, tram guideways x=±9.5 (y≈6),
   kiosk at (5.4,1.7,-46), fountain plaza at (0,0,-70), lookout railing at z=-103.75. */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
G.ARCHIVE_SFX_EXT = G.ARCHIVE_SFX_EXT || {};
const T0 = 540;

G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,V,clamp,lerp,sstep,Track,dialogue,SCENES,REST_ARM} = K;
  const T = W.tr, PI = Math.PI;
  const D = (t,dur,text,emotion,scene,who='ARCHIVE')=>dialogue.push({character:who,text,start:t,end:t+dur,emotion,scene,audio:null,face:emotion});
  const TK = (t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'TOCK'); S(t,'tock_voice',{n:Math.max(2,Math.round(text.length/4))}); };
  const at = t=>A.tr.pos.at(t);

  // ---------- scene list ----------
  const meta={CH02_SC01:'Arrival in Verdance',CH02_SC02:'Tock\u2019s tour',CH02_SC03:'The flicker'};
  for(const s of SCENES) if(meta[s.id]){ s.title=meta[s.id]; s.status='animated'; }

  // ---------- city systems: tram and robot motion are integrals of speed (deterministic, no jumps) ----------
  const tramSpd=new Track(3.2), robSpd=new Track(1.0);
  tramSpd.key(900.4,3.2,'lin').key(901.6,0,'out').key(918.6,0,'lin').key(923,3.2,'in');
  robSpd.key(900.4,1,'lin').key(901,0,'out').key(918.8,0,'lin').key(921,1,'in');
  const DT=.05, N=Math.ceil((1080-T0)/DT)+2, tram=new Float64Array(N), rob=new Float64Array(N);
  for(let i=1;i<N;i++){ const x=T0+(i-1)*DT; tram[i]=tram[i-1]+tramSpd.at(x)*DT; rob[i]=rob[i-1]+robSpd.at(x)*DT; }
  const integ=(arr,t)=>{ const f=clamp((t-T0)/DT,0,N-2), i=Math.floor(f); return arr[i]+(arr[i+1]-arr[i])*(f-i); };
  // a right-hand car reaches z=-36 at 9:60 (the wave); cars sit where (z + phase) % 45 == 0
  const tramOff = ((36 - integ(tram,600)) % 45 + 45) % 45;
  const phase = t=>integ(tram,t)+tramOff;
  const carR = (t,k)=>45*k - phase(t);              // right guideway (x=+9.5), moving toward -z
  const carL = (t,k)=>45*k + phase(t) - 11;         // left guideway (x=-9.5), moving toward +z
  W.exts.push((t,s)=>{ s.cityU=[s.city[0], phase(t), integ(rob,t), s.city[3]];
    if(s.world>.5) s.holoDef=[ {c:[5.4,1.7,-46],n:[-1,0,0],u:[0,1,0],s:[.8,.5]}, {c:[0,-60,0],n:[0,0,1],u:[0,1,0],s:[.1,.1]}, {c:[0,-61,0],n:[0,0,1],u:[0,1,0],s:[.1,.1]} ]; });

  // ================= CH02_SC01 · Arrival in Verdance (540–720) =================
  // hand-off from Chapter 1's whiteout: reset the Archive's systems, switch worlds
  T.world.cut(T0,1); T.tunnel.cut(T0,[0,0,0,0]); T.orb.cut(T0,[0,-40,0,0]); T.orbGlow.cut(T0,0); T.loom.cut(T0,[0,0,0,0]);
  T.holo.cut(T0,[0,0,0]); T.mirror.cut(T0,0); T.glitch.cut(T0,0); T.shelf.cut(T0,[-1,0,0]); T.window.cut(T0,1);
  T.exposure.cut(T0,6); T.exposure.to(T0,3.5,1,'out'); T.fade.cut(T0,1);
  T.city.cut(T0,[1,0,0,0]);
  T.portal.cut(T0,[0,3.2,8,2.6]); T.portalOpen.cut(T0,1); T.portalFX.cut(T0,[0,1,0,1]);
  T.portalOpen.key(546,1,'lin').key(549,0,'in'); S(548.6,'portal_close');
  S(T0,'city_ambience',{d:360});
  A.tr.roll.cut(T0,0); A.tr.jitter.cut(T0,0); A.tr.power.cut(T0,1); A.tr.bob.cut(T0,1); A.tr.headYaw.cut(T0,0); A.tr.headPitch.cut(T0,0); A.tr.headTilt.cut(T0,0);
  A.place(T0,[0,3.4,8.8],PI); A.tr.thrust.cut(T0,1.3); A.arms(T0,.01,[2.85,.25,.1],[2.85,.25,.1]);
  A.flyTo(T0,1.8,[0,3.0,3.6],'out'); S(T0+.1,'whoosh',{d:2});
  A.tr.roll.key(T0+.05,0,'lin').key(T0+1.5,PI*2,'out'); A.tr.roll.cut(T0+1.51,0);
  A.express(T0+.1,'surprised',.2); A.rest(T0+1.6,.6); A.thrust(T0+1.6,1,.75);
  A.lookAt(542.2,1,[-6,4,-20]); A.lookAt(543.8,1.2,[8,5,-20]); A.express(543.6,'excited',.5);
  C.shot(T0,[2.6,2.5,-2.6],[0,3.1,6],46); C.move(T0,7.9,[3.3,2.7,-4.2],[0,3.1,4.5],44,'inOut');

  // the reveal
  A.lookAt(548,1.2,[0,5,-60]); A.express(549,'surprised',.5); D(551,1.2,'Whoa\u2026','surprised','CH02_SC01'); S(551,'voice',{pattern:'whoa'});
  A.express(553.6,'excited',.6); A.lookAt(555,2,[-12,9,-30]); A.lookAt(558,2,[12,8,-36]); A.lookAt(561,1.6,[0,4,-60]);
  C.shot(548,[.7,3.5,7.4],[0,3.2,0],42); C.move(548,14,[1.8,11.5,13],[0,4,-52],52,'inOut');

  // flight down the canal, low over the water
  A.faceToward(562.4,1,[0,1.4,-6]);
  A.path(563.4,[[0,1.7,-1.5],[1.1,1.0,-11],[-1.1,1.05,-20],[.6,1.5,-27],[2.2,2.6,-31]],13.6,'inOut'); A.thrust(563.4,1,1.1); S(563.6,'whoosh',{d:4});
  A.turnTo(566,3,PI+.25); A.turnTo(569.5,4,PI-.3); A.turnTo(573.5,3.5,PI+.15);
  A.express(565,'happy',.4); A.tr.roll.key(570.2,0,'lin').key(571.8,PI*2,'inOut'); A.tr.roll.cut(571.81,0); S(570.3,'spin'); S(570.4,'voice',{pattern:'giggle'});
  A.express(572,'playful',.4); A.thrust(576,1,.9);
  for(const [t,p] of [[563,[2.7,1.9,1.2]],[567,[2.9,1.6,-6]],[571,[-2.5,1.6,-14]],[575,[-2.4,1.8,-21]],[579,[-1.2,3.0,-26]]]) C.via(t,p,V.add(at(t+.6),[0,.2,-1.2]));

  // a wave to a passing tram (a right-hand car reaches z=-36 at 9:60); its lights blink back
  const waveAt=[6.4,6.2,-36.6];
  A.faceToward(577.4,1,waveAt); A.flyTo(578,6,waveAt,'inOut'); A.thrust(578,1,.95); A.thrust(584,1,.65); S(578.2,'whoosh',{d:4,soft:1});
  A.turnTo(584.4,1.6,PI/2); A.lookAt(586,1.4,[9.5,6.4,-10]); A.express(586.2,'curious',.5);
  A.lookAt(595.6,1.2,[9.5,6.4,-34]); A.express(596,'excited',.3); S(593,'tram_pass',{d:9});
  A.wave(597,3,'R'); S(597.2,'voice',{pattern:'hi'}); D(597.4,.8,'Hi!','excited','CH02_SC01');
  T.city.key(600.2,[1,0,0,0],'lin').key(600.35,[1,0,0,1],'out').key(600.6,[1,0,0,0]).key(600.8,[1,0,0,1],'out').key(601.1,[1,0,0,0]); S(600.3,'tram_horn');
  A.express(601.2,'playful',.3); A.tr.bob.key(601.2,1).key(601.5,2.4).key(603,1); S(601.4,'voice',{pattern:'giggle'});
  C.shot(584.2,[2.4,4.8,-45],[7.4,6.3,-34],46); C.move(584.2,19.6,[2.0,4.9,-46.5],[6.8,6.3,-36],44,'lin');

  // the kiosk: ARCHIVE tries every button
  const kioskP=[4.35,1.55,-46];
  A.faceToward(604.4,1,kioskP); A.flyTo(605,5,kioskP,'inOut'); A.thrust(605,1,.85); A.thrust(609.4,1,.6); S(605.2,'whoosh',{d:4,soft:1});
  A.turnTo(609.6,1.2,PI/2); A.lookAt(611,1,[5.4,1.7,-46]); A.express(611.2,'curious',.5);
  A.reach(614.4,.6); S(615.05,'poke'); T.holo.key(615,[0,0,0],'lin').key(616,[1,0,0],'out'); S(615.2,'kiosk'); A.rest(615.8,.5);
  A.express(616.2,'analyze',.5); A.scan(617,3.2); A.express(620.6,'happy',.4);
  A.point(622.4,1); S(623.05,'poke'); T.holo.key(623.1,[1,0,0],'lin').key(623.4,[1.8,0,0],'out').key(625,[1,0,0]); S(623.2,'jingle');
  A.express(623.4,'excited',.25); A.spin(624.2,1.4,1); A.armsUp(624.2,.4); A.rest(625.8,.5); S(624.3,'spin');
  A.reach(628,.4); S(628.45,'poke'); A.rest(628.6,.3); A.reach(629,.3); S(629.35,'poke'); A.rest(629.4,.3); S(629.5,'jingle');
  A.express(630,'playful',.4); D(631,1,'Again!','playful','CH02_SC01'); S(631,'voice',{pattern:'giggle'});
  T.holo.to(636,2,[.6,0,0]);
  C.shot(604.2,[1.6,3.0,-40.5],[4.6,1.7,-46],44); C.move(604.2,6,[2.2,2.4,-42],[4.7,1.7,-46],42,'inOut');
  C.shot(610.4,[6.35,1.95,-44.4],[4.3,1.85,-46.1],36); C.move(610.4,12,[6.2,1.9,-44.8],[4.3,1.85,-46.1],34,'lin');
  C.shot(622.6,[2.4,2.6,-42.6],[4.8,1.7,-46],42); C.move(622.6,17,[2.0,2.4,-43.2],[4.8,1.7,-46],40,'lin');

  // TOCK arrives
  T.tockVis.cut(639,1); T.tockPos.cut(639,[-2,12,-62]); T.tockYaw.cut(639,PI*.2); T.tockEye.cut(639,[1,0,0,0]);
  S(639,'tock_buzz',{d:441});
  T.tockPos.key(641,[-1.5,10,-58],'lin').key(644,[2.2,3.2,-48],'lin').key(646.2,[3.25,1.98,-46],'outBack');
  T.tockYaw.key(644,PI*.2,'lin').key(646,PI/2,'out');
  A.lookAt(641.2,.8,[-1,8,-56]); A.express(641.4,'surprised',.3); A.turnTo(642.4,1.4,-PI/2); A.lookAt(644,1.6,[3.25,2,-46]);
  // the scan, the rules
  T.tockPos.key(648,[3.25,1.98,-46],'lin').key(649,[3.3,2.5,-46],'inOut').key(650.4,[3.3,1.4,-46],'inOut').key(651.6,[3.25,1.98,-46],'inOut');
  T.tockEye.key(648,[1,0,0,0],'lin').key(648.6,[.55,0,.4,0]).key(650.4,[.55,0,-.5,0]).key(651.8,[.6,0,0,0]);
  S(648.2,'tock_scan',{d:3.4}); A.express(648.4,'worried',.4);
  TK(652.4,2.4,'Unregistered unit! State your purpose.','stern','CH02_SC01');
  A.express(655.2,'confused',.4); D(655.6,1.4,'Um\u2026 exploring?','confused','CH02_SC01'); S(655.6,'voice',{pattern:'q2'});
  T.tockEye.key(657.6,[.6,0,0,0],'lin').key(657.9,[.45,0,0,0]);
  TK(658,2.2,'Exploring is not on the schedule.','stern','CH02_SC01');
  // a wink, a flick of the propeller
  A.express(660.8,'wink',.25); S(661,'blip',{f:1400}); T.tockEye.key(661.4,[.45,0,0,0],'lin').key(661.8,[.9,.6,.2,0]).key(662.4,[.9,-.6,.2,0]).key(663,[.8,0,0,0]);
  A.express(662,'playful',.4);
  A.reach(665.2,.5); S(665.75,'poke'); A.rest(666,.5);
  T.tockYaw.key(665.8,PI/2,'lin').key(669.4,PI/2+PI*4,'out'); S(665.9,'tock_spin');
  T.tockPos.key(665.8,[3.25,1.98,-46],'lin').key(667,[3.0,2.3,-46.3],'inOut').key(668.4,[3.35,1.8,-45.8],'inOut').key(670,[3.25,1.98,-46],'inOut');
  T.tockEye.key(666,[.8,0,0,0],'lin').key(666.5,[.3,0,0,0]).key(670,[.3,.3,-.2,0]).key(672,[.5,-.3,-.2,0]).key(673.4,[.7,0,0,0]);
  A.express(666.4,'happy',.3); S(667,'voice',{pattern:'giggle'});
  TK(674.4,3.2,'\u2026Fine. Courier rule seven: escort all visitors.','grudging','CH02_SC01');
  T.tockEye.key(675,[.7,0,0,0],'lin').key(676,[.8,0,0,.45]);
  A.express(678,'excited',.3); A.armsUp(678.2,.4); A.rest(679.4,.6); D(678.4,.6,'Yes!','excited','CH02_SC01'); S(678.4,'voice',{pattern:'hi'});
  T.tockEye.key(679,[.8,0,0,.45],'lin').key(680,[.8,0,0,0]);
  TK(681.4,2.2,'Follow me. Stay in the lane.','stern','CH02_SC01');
  C.shot(639.4,[.6,3.0,-39.8],[3.4,3,-48],46); C.move(639.4,8.4,[1.2,2.6,-41],[3.8,2,-46.4],42,'inOut');
  C.shot(647.8,[3.7,2.5,-42.2],[3.85,1.95,-46],40); C.move(647.8,12.6,[3.75,2.45,-42.6],[3.85,1.95,-46],38,'lin');
  C.shot(660.4,[2.5,2.15,-45.4],[4.35,2.0,-46],30); C.move(660.4,5.4,[2.6,2.12,-45.5],[4.35,2.0,-46],29,'lin');
  C.shot(665.8,[3.9,2.4,-42.6],[3.85,1.95,-46],40); C.move(665.8,24,[3.85,2.3,-43.2],[3.85,1.95,-46],38,'lin');

  // up, up: the whole city as a tiny planet
  T.tockYaw.key(684,PI/2+PI*4,'lin').key(685.4,PI*4+PI*.1,'inOut');
  T.tockPos.key(684.4,[3.25,1.98,-46],'lin').key(694,[1.8,16,-50.5],'inOut');
  A.faceToward(685,1,[2,10,-50]); A.flyTo(686,8.4,[2.6,15.2,-49.4],'inOut'); A.thrust(686,1,1.3); A.thrust(694,1,.7); S(686.2,'whoosh',{d:7});
  A.express(686.4,'excited',.5); A.lookAt(695,2,[0,0,-45]); A.express(697,'surprised',.6);
  C.shot(685.6,[3.4,1.2,-38.5],[3,9,-48],52); C.move(685.6,6,[3.8,7,-40],[2.4,13,-49],52,'inOut');
  C.move(692,5.8,[.3,24,-48.3],[0,0,-48],60,'inOut');
  C.tr.planet.cut(697.6,1.1); C.tr.proj.key(698,0,'lin').key(704,1,'inOut').key(713,1,'lin').key(718.6,0,'inOut');
  C.tr.planet.key(698,1.1,'lin').key(704,1.7,'inOut').key(713,2.0,'lin').key(718.6,1.1,'inOut');
  C.tr.roll.key(704,0,'lin').key(713,1.2,'inOut').key(718.4,0,'inOut');
  S(698.2,'planet_morph',{d:5.8}); S(713.2,'planet_morph',{d:5.4,rev:1});
  D(706,1.6,'It\u2019s\u2026 a whole world.','happy','CH02_SC01'); S(706,'voice',{pattern:'whoa'});
  C.move(718.6,1.2,[4.6,18,-44],[2.2,15.6,-50],46,'inOut');

  // ================= CH02_SC02 · Tock's tour (720–900) =================
  T.tockPos.key(720.4,[1.8,16,-50.5],'lin').key(730,[1.5,5,-62],'inOut').key(733.6,[1.15,2.1,-64.8],'out');
  T.tockYaw.key(731,PI*4+PI*.1,'lin').key(733.6,PI*4-PI/2,'inOut');
  A.faceToward(720.6,1,[0,8,-62]); A.flyTo(721.2,11,[0,1.42,-64.6],'inOut'); A.thrust(721.2,1,1); A.thrust(731.4,1,.6); S(721.4,'whoosh',{d:8,soft:1});
  A.turnTo(731,2,PI); A.express(732.4,'curious',.5);
  TK(735,3,'This is the Fountain Plaza. Do not touch the fountain.','stern','CH02_SC02');
  A.lookAt(738.4,1,[0,1.2,-70]); A.express(739,'curious',.4); A.lookAt(740.6,.5,[1.15,2.1,-64.8]); A.express(741.2,'playful',.4); A.lookAt(742.2,.6,[0,1.2,-70]);
  C.shot(720,[4.4,17,-43],[1.8,10,-56],48); C.move(720,8,[5,7,-55],[.6,2.2,-64],46,'inOut');
  C.shot(733.4,[3.3,2.3,-60.6],[.5,1.85,-65],38); C.move(733.4,11.4,[3.1,2.25,-61],[.5,1.85,-65],36,'lin');

  // the musical fountain
  const JET = i=>[Math.cos(i*PI/2)*2.1,0,-70+Math.sin(i*PI/2)*2.1];
  const jetKeys=[[],[],[],[]];
  const shoot=(t,i,h,m)=>{ jetKeys[i].push([t,0],[t+.25,h],[t+.9,h*.85],[t+1.6,0]); S(t,'jet',{m}); };
  A.reach(744.8,.5,true); S(745.3,'touch');
  [[745.4,0,4.2,67],[746.2,1,3.6,71],[747,2,5.4,74],[748.6,3,4.4,79]].forEach(([t,i,h,m])=>shoot(t,i,h,m));
  A.rest(746,.5); A.express(745.6,'surprised',.3); A.express(747.6,'excited',.4);
  // ARCHIVE conducts
  const cond=[[750,0,4.6,67],[750.6,1,4.0,71],[751.2,2,5.6,74],[752.4,3,4.6,76],[753,2,4.0,74],[753.6,1,3.6,72],[754.2,0,5.2,71],[755.4,1,4.8,69],[756,2,5.8,71],[756.6,3,6.2,74],[757.2,1,6.4,79],[758.4,0,4.2,67],[758.8,2,4.2,74],[759.2,3,4.2,79],[759.6,1,4.2,83]];
  cond.forEach(([t,i,h,m])=>shoot(t,i,h,m));
  for(let k=0;k<10;k++){ const t=749.8+k*.95; A.arms(t,.3,k%2?[2.6,.6,.3]:[1.2,.3,.5],k%2?[1.2,.3,.5]:[2.6,.6,.3]); }
  A.rest(759.8,.6); A.express(750,'playful',.4);
  for(let i=0;i<4;i++){ const ks=jetKeys[i].sort((a,b)=>a[0]-b[0]); const cur=[0,0,0,0]; }
  // build the jets track from the per-jet envelopes (sampled on a shared clock so all four stay in one track)
  { const env=(i,t)=>{ let v=0; for(let j=0;j<jetKeys[i].length;j+=4){ const [a]=jetKeys[i][j]; const h=jetKeys[i][j+1][1]; const u=t-a;
        if(u>=0&&u<.25) v=Math.max(v,h*u/.25); else if(u>=.25&&u<.9) v=Math.max(v,lerp(h,h*.85,(u-.25)/.65)); else if(u>=.9&&u<1.6) v=Math.max(v,h*.85*(1-(u-.9)/.7)); } return v; };
    T.jets.cut(744,[0,0,0,0]); for(let t=745.2;t<=761.6;t+=.1) T.jets.key(t,[0,1,2,3].map(i=>env(i,t)),'lin'); T.jets.key(762,[0,0,0,0],'lin'); }
  // Tock panics, darts between the jets and gets soaked
  T.tockEye.key(751,[.8,0,0,0],'lin').key(751.3,[1.2,0,0,0]);
  T.tockPos.key(751.4,[1.15,2.1,-64.8],'lin').key(752.6,[1.6,2.6,-67.4],'inOut').key(754,[-1.4,2.4,-68.6],'inOut').key(755.4,[.5,2.2,-70.6],'inOut').key(756.8,[0,2.4,-67.9],'inOut');
  T.tockYaw.key(752,PI*4-PI/2,'lin').key(756.8,PI*4+PI*.6,'lin');
  TK(752.8,1.4,'Stop! Stop!','panic','CH02_SC02');
  T.tockPos.key(757.25,[0,2.4,-67.9],'lin').key(757.7,[0,5.6,-67.9],'out').key(759.4,[.4,3.4,-66.6],'inOut').key(761.4,[.3,2.3,-66.2],'inOut');
  T.tockYaw.key(757.3,PI*4+PI*.6,'lin').key(759.6,PI*8+PI*.6,'out'); S(757.3,'splash');
  T.tockEye.key(757.3,[1.2,0,0,0],'lin').key(757.5,[.2,0,0,0]).key(760,[.25,.2,0,0]);
  A.express(757.5,'surprised',.15); A.express(758.6,'playful',.3); S(758.8,'voice',{pattern:'giggle'});
  C.shot(744.6,[6.2,3.4,-59.6],[0,2.4,-69],48); C.move(744.6,7,[5.6,3.2,-60.6],[0,2.6,-69],48,'lin');
  C.shot(751.6,[3.6,2.6,-63.4],[0,2.8,-68.4],44); C.move(751.6,8.6,[3.3,2.8,-63.8],[0,3.2,-68],44,'lin');
  C.shot(760.2,[1.35,2.0,-62.8],[0,1.9,-64.6],34); C.move(760.2,14.6,[1.2,2.0,-63],[0,1.9,-64.6],32,'lin');

  // a soggy scolding, then the first smile
  T.tockPos.key(762.4,[.3,2.3,-66.2],'lin').key(764,[0,1.95,-65.75],'inOut'); T.tockYaw.key(762.4,PI*8+PI*.6,'lin').key(764,PI*8,'inOut');
  T.tockEye.key(763.4,[.25,.2,0,0],'lin').key(764.2,[.42,0,0,0]);
  TK(765,3,'Rule one. Do. Not. Touch.','stern','CH02_SC02'); A.express(765.4,'worried',.4);
  A.express(768.6,'sad',.5); D(769,1,'Sorry\u2026','sad','CH02_SC02'); S(769,'voice',{pattern:'phew'}); A.tr.headPitch.to(768.8,.6,.2);
  A.tr.headPitch.to(772,.6,0); A.express(772.2,'wink',.3); S(772.4,'blip',{f:1300});
  T.tockEye.key(773,[.42,0,0,0],'lin').key(774.2,[.75,0,0,0]);
  TK(775.2,3.4,'\u2026The fountain has never played music before.','soft','CH02_SC02');
  T.tockEye.key(777,[.75,0,0,0],'lin').key(778,[.8,0,0,.75]); T.tockPos.key(778.4,[0,1.95,-65.75],'lin').key(778.8,[0,2.12,-65.75],'out').key(779.4,[0,1.95,-65.75]);
  A.express(778.4,'happy',.4); S(778.6,'voice',{pattern:'giggle'});
  T.tockEye.key(783,[.8,0,0,.75],'lin').key(784,[.8,0,0,.2]);
  TK(786,2.6,'Faster on the tram. Come.','soft','CH02_SC02');
  C.shot(764.2,[2.45,2.1,-65.1],[0,1.95,-65.15],36); C.move(764.2,10,[2.35,2.08,-65.15],[0,1.95,-65.15],34,'lin');
  C.shot(774.4,[1.95,2.25,-64.75],[.1,1.98,-65.6],34); C.move(774.4,7,[1.85,2.22,-64.8],[.1,1.98,-65.6],32,'lin');
  C.shot(781.6,[2.5,2.1,-65.2],[0,1.95,-65.15],38); C.move(781.6,7.4,[2.6,2.4,-64.8],[0,1.95,-65.15],38,'lin');

  // the tram ride (left guideway, cars run toward +z): find a car passing z≈-62 near 13:10
  const kAt=(t,z)=>Math.round((z-phase(t)+11)/45);
  let tb=800, best=1e9; for(let t=796;t<=806;t+=.02){ const e=Math.abs(carL(t,kAt(t,-62))+62); if(e<best){best=e;tb=t;} }
  const kL=kAt(tb,-62);
  const roofA=t=>[-9.5,8.22,carL(t,kL)+.9], roofT=t=>[-9.5,7.95,carL(t,kL)+2.6];
  A.faceToward(789,1,[-9.5,8,-62]); A.flyTo(789.6,tb-789.6,roofA(tb),'inOut'); A.thrust(789.6,1,1); S(790,'whoosh',{d:5});
  T.tockPos.key(789.4,[0,1.95,-65.75],'lin').key(tb,roofT(tb),'inOut'); T.tockYaw.key(789.4,PI*8,'lin').key(tb,PI*8,'lin');
  for(let t=tb+.5;t<=tb+26;t+=.5){ A.tr.pos.key(t,roofA(t),'lin'); T.tockPos.key(t,roofT(t),'lin'); }
  A.turnTo(tb-1.5,1.5,0); A.thrust(tb,1,.45); A.tr.bob.to(tb,1,.3); S(tb,'thunk'); S(tb+.2,'tram_pass',{d:25});
  A.express(tb+.3,'excited',.4); A.armsUp(tb+1.6,.5); A.arms(tb+3.2,.6,[2.0,1.2,.2],[2.0,1.2,.2]); D(tb+2,1,'Wheee!','excited','CH02_SC02'); S(tb+2,'voice',{pattern:'yawn'});
  // reading the garden towers as they pass
  A.rest(tb+9,.6); A.express(tb+9.4,'analyze',.5); A.scan(tb+10,4); A.lookAt(tb+14.4,1,[-24,12,carL(tb+15,kL)]);
  TK(tb+15,4.4,'Every tower grows food. Every canal cools the city. Everything gives back.','proud','CH02_SC02');
  A.express(tb+19.6,'happy',.5); A.lookAt(tb+20,1,roofT(tb+21));
  C.shot(789.4,[-2.4,4.6,-55.6],[-8,6.8,-62],50); C.move(789.4,Math.max(tb-.6-789.4,.5),[-3.6,6.6,-57.5],[-9.2,7.8,-62],46,'inOut');
  for(let t=tb-.4;t<=tb+26;t+=1){ const z=carL(t,kL); C.via(t,[-5.4,8.6,z+3.8],[-9.4,8.1,z+.4]); }
  C.tr.fov.key(tb-.5,38,'lin');
  // hop off near the start of the canal and rest under the trees
  const tOff=tb+26, rest=[-3.4,1.12,carL(tOff,kL)>10?2:-4];
  A.tr.bob.to(tOff,1,1); A.thrust(tOff,1,.9); A.flyTo(tOff+.4,4.6,rest,'inOut'); A.turnTo(tOff+.6,3,-PI/2); S(tOff+.5,'whoosh',{d:4,soft:1});
  T.tockPos.key(tOff+.6,roofT(tOff+.6),'lin').key(tOff+5.4,[rest[0],rest[1]+1.22,rest[2]],'inOut');
  T.tockYaw.key(tOff+.6,PI*8,'lin').key(tOff+5.4,PI*8-PI/2,'inOut');
  C.shot(tOff,[-1.0,5.8,carL(tOff,kL)-6],[-6,3,carL(tOff,kL)-2],46); C.move(tOff,5.2,[0.4,2.6,rest[2]-5.5],[rest[0],1.6,rest[2]],42,'inOut');

  // a quiet moment by the water; Tock perches on ARCHIVE's head
  const ride=t=>[at(t)[0],at(t)[1]+1.22,at(t)[2]];
  for(let t=tOff+6;t<=899;t+=.5) T.tockPos.key(t,ride(t),'lin');
  A.tr.bob.to(tOff+6,2,.4); A.thrust(tOff+6,2,.5); A.express(tOff+6.4,'relieved',1);
  A.lookAt(tOff+9,2,[2,.4,rest[2]-12]); T.tockEye.key(tOff+8,[.8,0,0,.2],'lin').key(tOff+9,[.6,0,-.4,0]);
  A.activate(tOff+16,7,1); A.tr.headPitch.to(tOff+16,1,.3); A.express(tOff+16.2,'happy',.6);
  T.tockEye.key(tOff+17,[.6,0,-.4,0],'lin').key(tOff+18,[1.1,0,-.8,0]);
  TK(tOff+19,3.6,'That symbol\u2026 it\u2019s on the old gate. At the edge of the city.','curious','CH02_SC02');
  A.tr.headPitch.to(tOff+22.4,1,0); A.express(tOff+23,'analyze',.6); A.lookAt(tOff+24,2,[0,4,-110]);
  A.express(tOff+28,'thinking',1);
  C.shot(tOff+5.4,[-1.2,1.6,rest[2]+3.6],[rest[0],1.7,rest[2]],36); C.move(tOff+5.4,12,[-1.0,1.7,rest[2]+3.0],[rest[0],1.8,rest[2]],34,'lin');
  C.shot(tOff+17.4,[-3.55,2.35,rest[2]-1.45],[rest[0],2.05,rest[2]],30); C.move(tOff+17.4,7,[-3.55,2.3,rest[2]-1.35],[rest[0],2.05,rest[2]],28,'lin');
  C.shot(tOff+24.6,[-.6,4.4,rest[2]+7],[0,3,-80],44); C.move(tOff+24.6,899-(tOff+24.6),[-.4,4.2,rest[2]+6],[0,3,-90],42,'lin');

  // ================= CH02_SC03 · The flicker (900–1080) =================
  // three pulses: the city goes dark, trams and robots stop
  T.city.key(900.3,[1,0,0,0],'lin').key(900.45,[.05,0,0,0],'out').key(900.85,[1,0,0,0]).key(901.45,[.05,0,0,0],'out').key(901.85,[1,0,0,0]).key(902.45,[.05,0,0,0],'out').key(902.9,[.6,0,0,0]).key(903.4,[.08,0,0,0],'out');
  T.city.key(918,[.08,0,0,0],'lin').key(920.4,[1,0,0,0],'in');
  T.exposure.key(900.3,1,'lin'); [900.45,901.45,902.45].forEach(t=>T.exposure.key(t,.72,'out').key(t+.4,1)); T.exposure.key(903.4,.86,'out').key(918,.86,'lin').key(920.4,1,'in');
  S(900.4,'flicker3'); S(903.4,'power_down'); S(918,'power_up2');
  [900.45,901.45,902.45].forEach(t=>{ A.tr.emblem.key(t-.05,A.tr.emblem.at(t-.05),'lin'); A.tr.emblem.key(t,1.6,'out'); A.tr.emblem.key(t+.45,.2); });
  A.express(900.6,'surprised',.15); A.tr.bob.to(900.6,.4,1); T.tockEye.key(900.5,[.6,0,0,0],'lin').key(900.6,[1.25,0,0,0]);
  A.lookAt(901,1,[8,9,rest[2]-12]); A.lookAt(902.4,1,[-8,6,rest[2]-10]);
  A.express(903.6,'analyze',.4); A.scan(904,4.4);
  TK(906.4,2.6,'Minor fluctuation. Within tolerance.','stern','CH02_SC03');
  A.express(909.4,'thinking',.6); D(910,2.4,'Three pulses. Just like home.','thinking','CH02_SC03'); S(910,'voice',{pattern:'q2'});
  T.tockEye.key(912.4,[1.25,0,0,0],'lin').key(913,[.9,0,0,0]); TK(913.2,1,'Home?','curious','CH02_SC03');
  A.express(919.6,'curious',.5); A.lookAt(919,1.4,[9.5,6.4,rest[2]-6]);
  TK(921.6,1.6,'See? Nominal.','proud','CH02_SC03'); T.tockEye.key(921.4,[.9,0,0,0],'lin').key(922,[.8,0,0,.4]);
  C.shot(900,[2.6,3.4,rest[2]-8.6],[-2,3.4,rest[2]],50); C.move(900,3.2,[2.4,3.3,rest[2]-8],[-2,3.2,rest[2]],50,'lin');
  C.shot(903.2,[-1.5,1.85,rest[2]-1.75],[rest[0],2.0,rest[2]],34); C.move(903.2,12,[-1.6,1.85,rest[2]-1.6],[rest[0],2.0,rest[2]],32,'lin');
  C.shot(915.2,[5.4,7.6,rest[2]-14],[9.5,6.4,rest[2]-2],48); C.move(915.2,9.4,[5.0,7.4,rest[2]-15],[9.5,6.4,rest[2]-4],48,'lin');

  // a shimmer at the edge of the city
  const P2=[0,4.2,-112];
  T.portal.cut(924,[...P2,3.1]); T.portalFX.cut(924,[0,0,0,1]); T.portalOpen.cut(924,0);
  T.portalFX.key(926,[0,0,0,1],'lin').key(927,[.35,.15,0,1],'out').key(940,[.45,.55,0,1],'inOut');
  S(926.4,'spark',{d:12});
  A.lookAt(925.2,1.4,P2); A.express(925.6,'curious',.5); A.activate(926,12,.8);
  T.tockEye.key(927,[.8,0,0,.4],'lin').key(928,[.9,0,0,0]);
  C.shot(924.6,[rest[0]+.55,2.4,rest[2]+2.8],[0,4.3,-112],22); C.move(924.6,12,[rest[0]+.45,2.35,rest[2]+2.2],[0,4.3,-112],18,'lin');
  // the flight to the lookout; Tock protests and follows
  A.express(937.8,'determined',.4); A.tr.bob.to(938,1,1);
  A.faceToward(938.4,1,[0,3,-30]);
  A.path(939.4,[[-2.2,2.6,rest[2]-10],[-.6,4.4,-34],[.4,5.6,-58],[0,5.2,-82],[0,3.7,-100.6]],22,'inOut'); A.thrust(939.4,1,1.25); A.thrust(960.6,1,.7);
  S(939.6,'whoosh',{d:6}); S(947,'whoosh',{d:6}); S(955,'whoosh',{d:5});
  for(let t=939.4;t<=962;t+=.5) T.tockPos.key(t,V.add(at(t-.9),[.7,.45,1.3]),'lin');
  T.tockYaw.key(939,PI*8-PI/2,'lin').key(941,PI*7,'inOut');
  TK(942,2.6,'That is outside the schedule!','panic','CH02_SC03'); TK(953,1.4,'Wait for me!','panic','CH02_SC03');
  for(const t of [939,943,947,951,955]) C.via(t,V.add(at(t),[2.6,1.2,4.2]),V.add(at(t+.8),[0,0,-2]));
  C.shot(957,[6.2,2.6,-101.2],[0,3.8,-94],50); C.move(957,6,[5.4,2.8,-101.6],[0,3.8,-99],46,'inOut');

  // the old gate: a second portal forms beyond the edge
  const edge=[0,3.7,-100.6], tockEdge=[1.05,3.95,-100.75];
  T.tockPos.key(962.6,tockEdge,'inOut'); T.tockYaw.key(962.6,PI*7,'lin');
  A.turnTo(962,2,PI); A.lookAt(963,2,P2); A.express(963.4,'curious',.5); S(962,'cliff_wind',{d:118});
  T.portalFX.key(964,[.45,.55,0,1],'lin').key(972,[1,1,0,1],'inOut'); S(964.2,'spark',{d:8}); S(972,'ring_hum',{d:8});
  T.portalOpen.key(973,0,'lin').key(980,1,'out'); S(973,'portal_open');
  T.portalFX.key(978,[1,1,1.0,1],'lin').key(988,[1,1,2,1],'inOut');
  A.express(973.2,'surprised',.25); A.tr.jitter.key(973.2,0,'lin').key(973.4,.4).key(974.6,0);
  T.tockEye.key(973.2,[.9,0,0,0],'lin').key(973.4,[1.3,0,0,0]); T.tockPos.key(973.3,tockEdge,'lin').key(974,V.add(tockEdge,[.35,.3,.4]),'out');
  A.express(978,'excited',1); A.activate(978,12,1.2); A.lookAt(980,3,[1,5.5,-112]);
  D(986,1.8,'There are more worlds\u2026','excited','CH02_SC03'); S(986,'voice',{pattern:'whoa'});
  C.shot(963,[1.4,4.2,-94.6],[0,4.2,-112],44); C.move(963,15,[1.1,4.0,-96.4],[0,4.3,-112],42,'inOut');
  C.shot(978,[.6,4.0,-107.6],[.3,3.8,-100.7],36); C.move(978,12,[.5,3.95,-107.2],[.4,3.8,-100.7],34,'lin');

  // "Come with me?"
  A.turnTo(990.6,1.4,PI-1.3); A.lookAt(991.4,.8,V.add(tockEdge,[.35,.3,.4])); A.express(991.4,'curious',.5);
  D(992.4,1.6,'Come with me?','curious','CH02_SC03'); S(992.4,'voice',{pattern:'q'});
  T.tockYaw.key(994.4,PI*7,'lin').key(996,PI*6+.2,'inOut'); T.tockEye.key(995,[1.3,0,0,0],'lin').key(996,[.6,0,-.3,0]);
  TK(997,2.4,'My route is here. My schedule\u2026','sad','CH02_SC03');
  A.express(999.4,'sad',.8); A.tr.headPitch.to(999.6,1,.15);
  T.tockYaw.key(1002,PI*6+.2,'lin').key(1003.6,PI*7-.2,'inOut'); T.tockEye.key(1003,[.6,0,-.3,0],'lin').key(1004,[.85,0,0,0]);
  TK(1005,3,'Courier rule one: deliver the visitor safely.','soft','CH02_SC03');
  A.tr.headPitch.to(1006,.8,0); A.express(1006.4,'curious',.6);
  T.tockEye.key(1008.2,[.85,0,0,0],'lin').key(1009,[.85,0,0,.8]);
  TK(1009.4,2.2,'\u2026Wherever they are going.','happy','CH02_SC03');
  A.express(1011.8,'excited',.3); A.armsUp(1012,.4); A.rest(1013.6,.6); D(1012.4,.8,'Yes!','excited','CH02_SC03'); S(1012.4,'voice',{pattern:'hi'});
  // Tock settles on ARCHIVE's head
  A.reach(1014.6,.8,true); A.rest(1017,.8);
  T.tockPos.key(1015.6,V.add(tockEdge,[.35,.3,.4]),'lin').key(1018.4,ride(1018.4),'inOut');
  T.tockYaw.key(1016,PI*7-.2,'lin').key(1018.4,PI*7,'inOut'); A.express(1018.6,'happy',.5);
  C.shot(990.4,[2.6,3.9,-100.2],[.5,3.8,-100.7],36); C.move(990.4,13,[2.5,3.85,-100.3],[.5,3.8,-100.7],34,'lin');
  C.shot(1003.4,[.15,4.2,-102.9],[1.05,4.05,-100.6],30); C.move(1003.4,8.4,[.2,4.15,-103],[1.05,4.05,-100.6],29,'lin');
  C.shot(1011.8,[3.2,4.6,-97.6],[.4,4.0,-100.8],42); C.move(1011.8,9,[3.6,4.8,-96.8],[.3,4.2,-101],42,'inOut');

  // into the second portal
  A.turnTo(1021,1.6,PI); A.express(1022,'determined',.6); A.power(1022,1,.75); A.power(1023.4,1.2,1.15); S(1022.2,'breath',{d:3});
  D(1026,1.6,'Okay, Tock. Let\u2019s go see.','determined','CH02_SC03'); S(1026,'voice',{pattern:'hi'});
  TK(1028.4,1.2,'Hold on.','stern','CH02_SC03');
  A.flyTo(1030.4,4.6,[0,4.2,-114.5],'in'); A.thrust(1030.4,2,1.5); A.express(1030.6,'excited',.4); S(1030.6,'whoosh',{d:4.4});
  C.shot(1020.4,[0,6.4,-86],[0,4.1,-108],40); C.move(1020.4,10,[0,5.6,-92],[0,4.1,-110],40,'inOut');
  C.shot(1030.4,[.4,4.9,-97.6],[0,4.2,-110],48); C.move(1030.4,4.4,[0,4.4,-109.8],[0,4.2,-118],60,'in');
  T.exposure.key(1033.6,1,'lin').key(1036,7,'in'); S(1033.8,'flash');
  T.exposure.key(1036.2,7,'lin').key(1046,1,'out'); // held white, then the Orrery tease settles (CH03 starts at 18:00)
  T.city.key(1036,[1,0,0,0],'lin');
  A.tr.pos.key(1036.4,[0,4.2,-114.5],'lin');
  // after the flash: a held final image back in Verdance, the portal closing behind them
  T.portalOpen.key(1040,1,'lin').key(1052,0,'inOut'); T.portalFX.key(1052,[0,1,2,1],'lin');
  A.tr.power.key(1036.3,1,'lin');
  for(let t=1018.9;t<=1036.4;t+=.5) T.tockPos.key(t,ride(t),'lin');
  A.tr.pos.cut(1036.5,[0,-60,0]); T.tockVis.key(1036.45,1,'lin').key(1036.5,0,'cut');
  // stinger: high above Verdance, the portal closes far off ... and the city flickers three times again
  C.shot(1036.5,[0,11,-26],[0,4,-82],50); C.move(1036.5,38,[0,17,-4],[0,5,-92],50,'inOut');
  T.city.key(1057.8,[1,0,0,0],'lin').key(1058,[.05,0,0,0],'out').key(1058.4,[1,0,0,0]).key(1059,[.05,0,0,0],'out').key(1059.4,[1,0,0,0]).key(1060,[.05,0,0,0],'out').key(1061.2,[.7,0,0,0],'in');
  S(1057.9,'pulse3'); S(1060.2,'power_down');
  S(1052,'portal_close');
  T.fade.key(1074,1,'lin').key(1079.9,0,'inOut');
});

// =================== score for 9:00–18:00 ===================
G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,mtof}=K;
  const b=60/96, e8=b/2, bar=b*4;
  const C={ G:[43,50,55,59], Em7:[40,47,50,55], C:[48,52,55,60], D:[38,45,50,54], Am7:[45,52,55,60], Bm7:[47,54,57,62], Cmaj7:[48,55,59,64], Dsus:[38,45,50,55], Fmaj7:[41,48,52,57] };
  const prog=['G','Em7','C','D'];
  const vth=[[0,67,1],[1,71,1],[2,74,2],[4,76,1],[5,74,.5],[5.5,71,.5],[6,72,2],[8,72,1],[9,76,1],[10,79,2],[12,78,1],[13,74,1],[14,76,2]];
  const theme=(t0,inst,oct,v,o)=>vth.forEach(([bb,m,d])=>add(t0+bb*b,d*b*1.02,m+oct,inst,v,0,o||{}));
  const bed=(t0,bars,v=1,str=true)=>{ for(let k=0;k<bars;k++){ const c=C[prog[k%4]], t=t0+k*bar; if(str) chord(t,bar*1.02,c.map(x=>x+12),'strings',.24*v,{att:.5}); add(t,bar,c[0]-12,'bass',.42*v,0); } };
  const marimba=(t0,bars,v=1)=>{ for(let k=0;k<bars;k++){ const c=C[prog[k%4]]; for(let j=0;j<8;j++) add(t0+k*bar+j*e8,e8*.8,c[[0,2,1,3,2,1,3,2][j]]+24,'pluck',.42*v,(j%2?.35:-.35)); } };
  const tockMotif=(t0,v=1)=>[[0,55],[.5,62],[1,55],[1.5,62],[2,59],[2.75,57],[3,55]].forEach(([bb,m])=>{ add(t0+bb*b,e8*.5,m-12,'pluck',.75*v,-.2); add(t0+bb*b,.05,96,'pluck',.18*v,.5); });
  // arrival + reveal
  [79,83,86,91,95].forEach((m,k)=>add(540.2+k*.12,3,m,'bell',.5,k*.2-.4)); chord(540,8,[55,59,62,67],'pad',.4,{att:1});
  chord(548,4,C.G.map(x=>x+12),'pad',.38,{att:2}); theme(550,'strings',12,.62,{att:.2}); theme(550,'brass',0,.4); bed(550,4,1.1);
  add(550,1,31,'timp',.9,0); theme(560.1,'celesta',24,.35);
  // canal flight
  marimba(563.4,9); bed(563.4,9,.9,false); theme(568.4,'strings',12,.5,{att:.15});
  // tram wave, kiosk
  marimba(584.4,6,.6); [[597,79],[597.4,83],[597.8,86]].forEach(([t,m])=>add(t,.6,m,'celesta',.5,0));
  for(let k=0;k<12;k++) add(605+k*1.25,.4,[74,76,79,81][k%4]+12,'celesta',.3,(k%2?.3:-.3));
  chord(605,15,C.Cmaj7.map(x=>x+12),'pad',.25,{att:2}); marimba(620,5,.55);
  // Tock: clockwork motif
  add(639,6,43,'drone',.35,0,{att:1}); for(let k=0;k<3;k++) tockMotif(641+k*bar);
  chord(652.4,2.4,[43,50,56],'strings',.22,{att:.1}); chord(658,2.2,[43,50,56],'strings',.22,{att:.1});
  tockMotif(660.8,.6); [[665.9,96],[666.2,93],[666.5,89],[666.8,84],[667.1,79],[667.4,74]].forEach(([t,m])=>add(t,.25,m,'celesta',.4,0));
  marimba(674.4,4,.5); tockMotif(681.4); tockMotif(681.4+bar);
  // up to the tiny planet
  chord(686,8,C.Dsus.map(x=>x+12),'strings',.28,{att:3}); chord(694,6,C.G.map(x=>x+12),'pad',.4,{att:2});
  theme(698,'celesta',24,.4); chord(698,12,[55,59,62,66,71],'pad',.4,{att:3}); [91,95,98,102].forEach((m,k)=>add(704+k*.15,4,m,'bell',.35,k*.2-.3));
  chord(712,8,C.Em7.map(x=>x+12),'pad',.32,{att:3});
  // the plaza and the musical fountain (the jets themselves play the melody, as sound cues)
  marimba(721,6,.5); tockMotif(735); 
  for(let k=0;k<11;k++){ const t=745+k*1.5; chord(t,1.4,C[prog[k%4]].map(x=>x+12),'pluck',.3,{}); add(t,1.4,C[prog[k%4]][0]-12,'bass',.4,0); }
  for(let k=0;k<16;k++) add(751.6+k*.3,.2,74-k,'pluck',.35,(k%2?.4:-.4));
  add(757.3,1,31,'timp',.8,0);
  // scolding and the first smile
  tockMotif(765,.5); chord(768.6,4,C.Am7,'pad',.3,{att:1});
  [[775,67],[775.6,71],[776.2,74],[777.4,72],[778.6,71]].forEach(([t,m])=>add(t,1.4,m,'piano',.55,0)); chord(775,6,C.Cmaj7,'pad',.3,{att:2});
  // the tram ride
  { const t0=788; for(let k=0;k<Math.floor(38/e8);k++) add(t0+k*e8,e8*.6,C[prog[Math.floor(k/8)%4]][0]-12,'bass',.45,0);
    marimba(t0,19,.7); bed(t0,19,1); theme(t0+4,'strings',12,.62,{att:.15}); theme(t0+14,'brass',0,.45); theme(t0+24,'strings',24,.5,{att:.15}); add(t0+4,1,31,'timp',.8,0); }
  // rest by the water
  { const t0=840; const ar=['G','Em7','C','D','G','Em7','C','Dsus'];
    ar.forEach((c,k)=>{ const cc=C[c]; for(let j=0;j<6;j++) add(t0+k*bar*1.5+j*b,b*1.4,cc[j%4]+12,'piano',.32,(j%2?.2:-.2)); });
    chord(870,10,C.Em7.map(x=>x+12),'pad',.28,{att:3}); [[876,74],[877.2,76],[878.4,79],[880.6,78]].forEach(([t,m])=>add(t,2,m,'celesta',.4,0)); }
  // the flicker: the music stops
  add(900.45,1,31,'timp',1,0); add(901.45,1,31,'timp',1,0); add(902.45,1,31,'timp',1,0);
  add(903.4,15,30,'drone',.6,0,{att:1}); chord(903.4,14,[42,49,55],'strings',.22,{att:3});
  [[910,76],[910.6,79],[911.2,86]].forEach(([t,m])=>add(t,1.5,m,'bell',.4,0));
  chord(918,6,C.G.map(x=>x+12),'pad',.4,{att:2}); marimba(921,3,.4);
  // the shimmer: the Loom motif returns, quietly
  { const ch=[41,48,52,57]; for(let j=0;j<24;j++) add(926+j*e8,e8*.8,ch[[0,2,1,3,2,1,3,2][j%8]]+24,j%2?'pluck':'celesta',.3,j%2?.35:-.35);
    chord(926,12,[41,48,52,57].map(x=>x+12),'strings',.2,{att:3}); }
  // the flight to the edge: building
  { const t0=938; for(let k=0;k<Math.floor(24/e8);k++) add(t0+k*e8,e8*.6,C[prog[Math.floor(k/8)%4]][0]-12,'bass',.4+.004*k,0);
    marimba(t0,10,.6); bed(t0,10,1.1); tockMotif(942,.6); tockMotif(953,.6); }
  // the old gate: the ARCHIVE theme meets Verdance
  { const at=[[0,64,1],[1,67,1],[2,74,2],[4,72,1],[5,71,.5],[5.5,69,.5],[6,67,2],[8,64,1],[9,67,1],[10,69,1],[11,71,1],[12,72,1.5],[13.5,74,.5],[14,76,2.4]];
    add(973,1,31,'timp',1.1,0); chord(973,8,[36,43,48,55,60,64],'brass',.4,{});
    at.forEach(([bb,m,d])=>{ add(976+bb*.83,d*.83,m+12,'strings',.6,0,{att:.2}); add(976+bb*.83,d*.83,m,'brass',.4,0); });
    ['Cmaj7','Am7','Fmaj7','G'].forEach((c,k)=>{ chord(976+k*3.3,3.4,C[c].map(x=>x+12),'pad',.3,{att:.8}); add(976+k*3.3,3.3,C[c][0]-12,'bass',.45,0); }); }
  // come with me / wherever they are going
  chord(990,6,C.Em7.map(x=>x+12),'strings',.22,{att:2}); tockMotif(997,.4); chord(997,6,C.Am7.map(x=>x+12),'strings',.22,{att:2});
  [[1005,67],[1005.8,71],[1006.6,74],[1008.2,76],[1009.4,79]].forEach(([t,m])=>add(t,2,m,'piano',.5,0)); chord(1005,7,C.Cmaj7,'pad',.32,{att:2});
  chord(1012,8,C.G.map(x=>x+12),'strings',.34,{att:.5}); theme(1012.2,'celesta',24,.35);
  // the leap
  add(1030.4,1,31,'timp',1.1,0); chord(1030.4,4,[43,50,55,59,62],'brass',.5,{}); theme(1022,'strings',12,.5,{att:.2});
  chord(1033.8,9,[55,59,62,67,71,74,79],'pad',.55,{att:.3}); [91,95,98,103].forEach((m,k)=>add(1033.9+k*.12,6,m,'bell',.5,k*.2-.3)); add(1033.8,1,31,'timp',1.2,0);
  // the empty lookout: a single courier's bell, then the city again
  add(1061,4,91,'bell',.5,.3); chord(1046,26,C.G.map(x=>x+12),'pad',.3,{att:6}); [[1064,67],[1065.2,71],[1066.4,74]].forEach(([t,m])=>add(t,3,m,'celesta',.35,0));
});

// =================== sound effects for 9:00–18:00 ===================
Object.assign(G.ARCHIVE_SFX_EXT,{
  portal_close:(S,c)=>{ S({t:c.t,d:.8,i:'thump',f:52,k:3,g:.8}); S({t:c.t-.6,d:1.2,i:'noiseSweep',f0:3000,f1:200,g:.35}); },
  city_ambience:(S,c,u)=>{ for(let k=0;k<c.d;k+=1.7){ const h=Math.abs(Math.sin(k*12.9898)*43758.5453)%1;
      if(h>.45) S({t:c.t+k,d:.09,i:'chirp',f0:2600+h*1600,f1:3400+h*1200,g:.06,pan:h*1.6-.8});
      if(h>.75) S({t:c.t+k+.12,d:.07,i:'chirp',f0:3000+h*900,f1:3600,g:.05,pan:h*1.6-.8});
      S({t:c.t+k,d:2.2,i:'noiseSweep',f0:220,f1:380,g:.05}); } },
  tram_pass:(S,c)=>{ S({t:c.t,d:c.d,i:'noiseSweep',f0:200,f1:700,g:.3}); S({t:c.t,d:c.d,i:'hum',f0:140,f1:180,g:.22}); },
  tram_horn:(S,c,u)=>{ [0,.45].forEach(k=>{ S({t:c.t+k,d:.25,f:u.mtof(79),i:'bell',v:.5}); S({t:c.t+k,d:.25,f:u.mtof(83),i:'bell',v:.4}); }); },
  kiosk:(S,c,u)=>{ [84,88,91].forEach((m,k)=>S({t:c.t+k*.08,d:.15,f:u.mtof(m),i:'celesta',v:.5})); },
  jingle:(S,c,u)=>{ [79,83,86,91,86,91].forEach((m,k)=>S({t:c.t+k*.13,d:.2,f:u.mtof(m),i:'celesta',v:.5,pan:.3})); },
  tock_buzz:(S,c)=>{ for(let k=0;k<c.d;k+=.25) S({t:c.t+k,d:.5,i:'hum',f0:410,f1:410,g:.05,pan:.2}); },
  tock_scan:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:900,f1:1400,g:.12}); for(let k=0;k<c.d;k+=.4) S({t:c.t+k,d:.05,i:'chirp',f0:2400,f1:2600,g:.15}); },
  tock_spin:(S,c)=>{ S({t:c.t,d:3,i:'noiseSweep',f0:2400,f1:400,g:.3}); for(let k=0;k<10;k++) S({t:c.t+k*.3,d:.12,i:'chirp',f0:900-k*40,f1:700-k*40,g:.2}); },
  tock_voice:(S,c)=>{ for(let k=0;k<c.n;k++){ const f=520+((k*7)%5)*60; S({t:c.t+k*.13,d:.08,i:'chirp',f0:f,f1:f*(k%2?1.15:.85),g:.5,stem:'dialogue'}); } },
  jet:(S,c,u)=>{ S({t:c.t,d:.25,f:u.mtof(c.m),i:'bell',v:.55,pan:.2}); S({t:c.t,d:1.2,i:'noiseSweep',f0:1200,f1:3200,g:.22}); },
  splash:(S,c)=>{ S({t:c.t,d:1.4,i:'noiseSweep',f0:4000,f1:600,g:.6}); S({t:c.t,d:.4,i:'thump',f:90,k:8,g:.4}); },
  flicker3:(S,c)=>{ [0,1,2].forEach(k=>{ S({t:c.t+k,d:.6,i:'thump',f:40,k:3,g:.9}); S({t:c.t+k,d:.5,i:'crackle',g:1}); }); },
  power_down:(S,c)=>{ S({t:c.t,d:2.4,i:'hum',f0:220,f1:40,g:.6}); },
  power_up2:(S,c)=>{ S({t:c.t,d:2.6,i:'hum',f0:50,f1:240,g:.55}); S({t:c.t,d:2.6,i:'noiseSweep',f0:200,f1:2600,g:.25}); },
  cliff_wind:(S,c)=>{ for(let k=0;k<c.d;k+=2.2) S({t:c.t+k,d:3,i:'noiseSweep',f0:200+((k*41)%200),f1:600+((k*67)%400),g:.18}); },
});
})(typeof window!=='undefined'?window:globalThis);
