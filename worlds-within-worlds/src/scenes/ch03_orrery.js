/* CHAPTER 3 — WORLDS WITHIN WORLDS (18:00–27:00)
   The Orrery: a brass orrery adrift in a violet void with six miniature worlds. ARCHIVE learns to expand a
   world, flies inside it (a forest world), finds a tiny orrery on a stump, zooms in — and comes out back in
   the Orrery: worlds within worlds. Then a first glimpse of ALICIA, and a thread goes out.
   CH03_SC01 The Orrery (18:00–21:00) · CH03_SC02 Inside a world (21:00–24:00) · CH03_SC03 The glimpse (24:00–27:00)
   World ids: 2 = Orrery (src/worlds/20_orrery.glsl), 3 = forest world (src/worlds/30_forest.glsl). */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
G.ARCHIVE_SFX_EXT = G.ARCHIVE_SFX_EXT || {};
const T0 = 1080, T1 = 1620, C0 = [0,9,-30], TILT = .22;
const NAMES = ['forest','ocean','desert','floating islands','alien','habitat'];

G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,V,clamp,lerp,sstep,Track,dialogue,SCENES} = K;
  const T = W.tr, PI = Math.PI;
  const D = (t,dur,text,emotion,scene,who='ARCHIVE')=>dialogue.push({character:who,text,start:t,end:t+dur,emotion,scene,audio:null,face:emotion});
  const TK = (t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'TOCK'); S(t,'tock_voice',{n:Math.max(2,Math.round(text.length/4))}); };
  const at = t=>A.tr.pos.at(t);
  const meta={CH03_SC01:'The Orrery',CH03_SC02:'Inside a world',CH03_SC03:'The glimpse'};
  for(const s of SCENES) if(meta[s.id]){ s.title=meta[s.id]; s.status='animated'; }

  // ---------- orbital mechanics (orbit phase is the integral of speed: smooth, deterministic) ----------
  const spd=new Track(.035); spd.key(1108,.035,'lin').key(1114,.006,'inOut').key(1400,.006,'lin').key(1408,.035,'inOut');
  const DT=.05, N=Math.ceil((T1-T0)/DT)+2, ph=new Float64Array(N);
  for(let i=1;i<N;i++) ph[i]=ph[i-1]+spd.at(T0+(i-1)*DT)*DT;
  const phase=t=>{ const f=clamp((t-T0)/DT,0,N-2), i=Math.floor(f); return ph[i]+(ph[i+1]-ph[i])*(f-i); };
  const tilt=v=>[v[0], v[2]*Math.sin(TILT), v[2]*Math.cos(TILT)];
  const orbitPos=(i,t)=>{ const R=9+1.4*i, th=i*1.047+phase(t)*(1-.08*i)+.4; return V.add(C0,tilt([R*Math.cos(th),0,R*Math.sin(th)])); };
  const outer=k=>{ const a=k*PI/4+.3; return V.add(C0,tilt([26*Math.cos(a),0,26*Math.sin(a)])); };
  const HOLD=[0,3.4,-7.6];
  T.owR=new Track([1.3,1.25,1.2,1.3,1.15,1.1]); T.owHold=new Track(0); T.orr=new Track([0,0,0,0]);
  T.ali=new Track([9,6,-15,0]); T.aliB=new Track([2.8,0,0,0]); T.bfly=new Track(0);
  const owPos=(i,t,s)=>{ const p=orbitPos(i,t); return i===0 ? V.lerp(p,HOLD,s?s.owHold:T.owHold.at(t)) : p; };
  const bflyPos=t=>{ const u=t-1318; return [ -1.2+Math.sin(u*.9)*2.2+Math.sin(u*2.3)*.4, 3.2+Math.sin(u*1.7)*.6, -30-u*.42+Math.cos(u*.8)*1.5 ]; };
  W.exts.push((t,s)=>{
    if(t<T0-1||t>T1+1) return;
    const ow=[]; for(let i=0;i<6;i++){ ow.push(...owPos(i,t,s), s.owR[i]); }
    s.U={ uOW:ow, uOrr:[t*.05, s.orr[1], t, 0], uAli:s.ali, uAliB:s.aliB, uBfly:[...bflyPos(t), s.world>2.5?s.bfly:0] };
    if(s.world>1.5 && s.world<2.5){ const nodes=[]; for(let i=0;i<6;i++) nodes.push(...owPos(i,t,s)); for(let k=0;k<8;k++) nodes.push(...outer(k));
      s.loomN=nodes; s.loomC=[...C0,0]; }
  });

  // ================= CH03_SC01 · The Orrery (1080–1260) =================
  T.world.cut(T0,2); T.tunnel.cut(T0,[0,0,0,0]); T.portalOpen.cut(T0,.9); T.portal.cut(T0,[0,2.4,6.2,2.2]); T.portalFX.cut(T0,[0,1,0,0]);
  T.city.cut(T0,[1,0,0,0]); T.orb.cut(T0,[0,-40,0,0]); T.orbGlow.cut(T0,0); T.holo.cut(T0,[0,0,0]); T.mirror.cut(T0,0); T.shelf.cut(T0,[-1,0,0]);
  T.exposure.cut(T0,5); T.exposure.to(T0,3,1,'out'); T.fade.cut(T0,1);
  T.loom.cut(T0,[0,0,0,0]); T.loomB.cut(T0,[0,0,3,0]);
  T.portalOpen.to(T0+2,4,0,'inOut'); S(T0+2.4,'portal_close');
  T.tockVis.cut(T0,1);
  A.tr.roll.cut(T0,0); A.tr.jitter.cut(T0,0); A.tr.power.cut(T0,1); A.tr.bob.cut(T0,1); A.tr.headYaw.cut(T0,0); A.tr.headPitch.cut(T0,0); A.tr.headTilt.cut(T0,0);
  A.place(T0,[0,2.6,5.6],PI); A.tr.thrust.cut(T0,1.2); A.flyTo(T0,2.6,[0,1.5,2.4],'out'); A.thrust(T0+1,2,.65);
  T.tockPos.cut(T0,[.8,2.9,6.2]); T.tockYaw.cut(T0,PI); T.tockEye.cut(T0,[1,0,0,0]); T.tockPos.key(T0+2.8,[1.1,1.95,2.7],'out');
  A.express(T0+.5,'surprised',.4); A.lookAt(T0+3,2,[0,9,-30]);
  C.shot(T0,[1.4,1.7,-1.2],[0,1.8,3],40); C.move(T0,6,[1.8,1.5,-2.2],[0,1.9,2.6],42,'inOut');
  // the reveal
  A.express(T0+6.2,'excited',1); D(T0+8,1.4,'Whoa\u2026','surprised','CH03_SC01'); S(T0+8,'voice',{pattern:'whoa'});
  T.tockEye.key(T0+9,[1,0,0,0],'lin').key(T0+9.6,[1.3,0,.2,0]); TK(T0+10.4,2.4,'This is not on any map.','stern','CH03_SC01');
  T.orr.to(T0+6,8,[0,.6,0,0]);
  C.shot(T0+6.2,[-2.6,1.2,6.4],[0,4.5,-18],44); C.via(T0+13,[-4.5,6.5,10],[0,6,-20]); C.move(T0+13,7,[-6,10,14],[0,7,-24],56,'inOut');
  A.lookAt(T0+12,3,[10,9,-28]); A.lookAt(T0+16,3,[-9,8,-26]); A.express(T0+16,'curious',.8);
  // ARCHIVE sets off to see the worlds; Tock protests and follows
  TK(T0+22,2.2,'Wait! Rule four: stay on the platform!','panic','CH03_SC01');
  const tourStop=(i,t,lift=.4)=>{ const w=orbitPos(i,t); const r=1.25; const toward=V.norm(V.sub([0,2,4],w)); return V.add(V.add(w,V.mul(toward,r+1.25)),[0,lift,0]); };
  const visits=[[1,1104,12],[2,1118,13],[3,1133,15],[4,1150,14],[5,1166,16]];
  let prev=at(T0+20);
  A.express(T0+20,'playful',.4); S(T0+20.2,'voice',{pattern:'giggle'});
  const reactions={1:['curious','Ooh\u2026 an ocean!'],2:['thinking','It\u2019s so\u2026 sandy.'],3:['excited','Floating islands!'],4:['surprised','Whoa, shiny.'],5:['curious','Someone lives here.']};
  visits.forEach(([i,t0,dur])=>{ const stop=tourStop(i,t0+dur*.45); const w=orbitPos(i,t0+dur*.45);
    A.faceToward(t0-1.4,1,stop); A.flyTo(t0-1,4,stop,'inOut'); A.thrust(t0-1,1,1.1); A.thrust(t0+3,1,.6); S(t0-.8,'whoosh',{d:3.6,soft:1});
    A.faceToward(t0+3,1,w); A.lookAt(t0+3.4,1,w); A.express(t0+3.6,reactions[i][0],.5); D(t0+4.6,1.6,reactions[i][1],reactions[i][0],'CH03_SC01'); S(t0+4.6,'voice',{pattern:i===3?'giggle':'q'});
    if(i===3){ A.spin(t0+7,1.6,1); S(t0+7.1,'spin'); }
    if(i===4){ A.tr.jitter.key(t0+4,0,'lin').key(t0+4.2,.4).key(t0+5.2,0); }
    if(i===5){ A.scan(t0+6.6,3.4); S(t0+6.8,'scan'); }
    for(let tt=t0-1;tt<=t0+dur-1.2;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[.75,.55,.9]),'lin');
    const side=V.norm(V.cross([0,1,0],V.sub(w,stop)));
    const back=V.norm(V.sub(stop,w));
    C.shot(t0-1,V.add(stop,V.add(V.mul(back,2.2),V.add(V.mul(side,3.4),[0,1.0,0]))),V.lerp(stop,w,.45),44);
    C.move(t0-1,dur,V.add(stop,V.add(V.mul(back,.6),V.add(V.mul(side,3.6),[0,.6,0]))),V.lerp(stop,w,.5),42,'inOut');
    prev=stop; });
  T.tockEye.key(1150,[1,0,0,0],'lin').key(1151,[.7,0,0,0]); TK(1170,2.4,'Please. Return. To the platform.','stern','CH03_SC01');
  // the threads: they're connected here too
  T.loom.to(1181,6,[.75,0,0,0],'inOut'); T.loomB.to(1181,3,[0,0,5,.35]); S(1181,'loom_unfold',{d:6});
  const hab=orbitPos(5,1186);
  A.lookAt(1182,1.4,V.add(hab,[-4,1,2])); A.express(1182.2,'surprised',.4); A.activate(1182,8,1);
  A.reach(1189,.6); S(1189.6,'node_touch'); T.loom.key(1189.6,[.75,0,1,0],'cut').key(1193,[.75,14,0,0],'out'); S(1189.7,'ripple',{d:3});
  A.rest(1191,.6); A.express(1190,'happy',.4); D(1191.2,2,'They\u2019re connected. Like at home.','happy','CH03_SC01'); S(1191.2,'voice',{pattern:'q2'});
  C.shot(1180.6,V.add(at(1181),[3.2,1.6,4.4]),V.add(at(1181),[-2,1,-6]),50); C.move(1180.6,12.4,V.add(at(1181),[4.4,2.6,5.6]),V.add(at(1181),[-2,1.4,-7]),54,'inOut');
  // back to the platform; the forest world comes to meet them
  A.faceToward(1194,1,[0,1.6,1]); A.path(1195,[V.add(at(1195),[2,1,4]),[1.5,2.6,0],[0,1.6,.6]],9,'inOut'); A.thrust(1195,1,1); A.thrust(1203.6,1,.6); S(1195.4,'whoosh',{d:5,soft:1});
  for(let tt=1195;tt<=1206;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[.8,.55,.9]),'lin');
  T.tockPos.key(1207,[1.25,1.35,1.2],'inOut');
  C.shot(1194.6,[5.5,4,7],[0,2,0],48); C.move(1194.6,10,[4,3,6],[0,1.8,-1],46,'inOut');
  T.owHold.key(1205,0,'lin').key(1220,1,'inOut'); S(1205.4,'deep_tone'); A.turnTo(1205,1.4,PI); A.lookAt(1206,2,HOLD); A.express(1206.4,'curious',.6);
  TK(1214,2,'That one is coming closer.','panic','CH03_SC01');
  A.flyTo(1220,3,[0,2.4,-3.0],'inOut'); A.thrust(1220,1,.8); A.thrust(1223,1,.6); A.express(1223.4,'thinking',.6);
  A.reach(1226,.8); S(1226.8,'touch'); T.owR.key(1226.8,[1.3,1.25,1.2,1.3,1.15,1.1],'lin').key(1229,[2.0,1.25,1.2,1.3,1.15,1.1],'outBack'); S(1227,'grow',{d:2});
  A.express(1227.2,'surprised',.2); A.rest(1228.6,.6); A.express(1230,'excited',.6);
  TK(1233,2.6,'Do not. Touch. The planet.','stern','CH03_SC01'); A.express(1236,'playful',.4); D(1236.4,1.6,'Watch this.','playful','CH03_SC01'); S(1236.4,'voice',{pattern:'giggle'});
  C.shot(1205,[3.6,2.2,4.6],[0,3.2,-6],46); C.move(1205,15,[2.6,2.4,3.4],[0,3.1,-6.6],44,'inOut');
  C.shot(1220.2,[4.2,2.9,-3.6],[0,2.8,-5.2],40); C.move(1220.2,19.6,[3.8,2.7,-4.4],[0,2.9,-5.4],38,'lin');

  // ================= CH03_SC02 · Inside a world (1260–1440) =================
  // the expand gesture: arms wide, the world swells to fill everything
  A.arms(1240,.6,[1.4,.1,.2],[1.4,.1,.2]); A.arms(1242,2.4,[1.3,1.3,.2],[1.3,1.3,.2],'inOut'); A.activate(1240,8,1.4); A.express(1240.4,'determined',.4);
  T.owR.key(1241,[2.0,1.25,1.2,1.3,1.15,1.1],'lin').key(1250,[4.6,1.25,1.2,1.3,1.15,1.1],'inOut'); S(1241,'grow',{d:9});
  TK(1246,1.6,'This is a bad idea!','panic','CH03_SC02'); T.tockEye.key(1245.5,[1,0,0,0],'lin').key(1246,[1.35,0,0,0]);
  A.express(1250.4,'excited',.4); A.rest(1250.6,.6); D(1251,1.2,'Let\u2019s go in!','excited','CH03_SC02'); S(1251,'voice',{pattern:'hi'});
  A.flyTo(1253,4.4,[0,3.0,-6.4],'in'); A.thrust(1253,2,1.3); S(1253.4,'whoosh',{d:4});
  for(let tt=1250;tt<=1257.4;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.6),[.7,.5,.7]),'lin');
  C.shot(1240,[4.4,2.8,-2.6],[0,3.0,-5.4],46); C.move(1240,12.8,[2.6,3.0,.6],[0,3.3,-7],50,'inOut');
  C.shot(1252.8,[.2,3.0,-.2],[0,3.2,-7.6],52); C.move(1252.8,4.6,[0,3.2,-3.4],[0,3.3,-9],70,'in');
  T.exposure.key(1255.6,1,'lin').key(1257.4,6,'in'); S(1256,'world_dive');
  // inside: the forest world (world 3)
  T.world.cut(1257.5,3); T.loom.cut(1257.5,[0,0,0,0]); T.exposure.key(1257.5,6,'lin').key(1261,1,'out');
  const rx=z=>6*Math.sin(z*.05), riv=(z,y)=>[rx(z),y,z];
  A.place(1257.5,riv(18,6.5),PI); A.tr.thrust.cut(1257.5,1); A.flyTo(1257.5,4,riv(12,4.6),'out');
  T.tockPos.cut(1257.5,V.add(riv(18.5,7),[.8,.4,.9]));
  for(let tt=1257.5;tt<=1318;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[.85,.5,.9]),'lin');
  A.express(1258,'surprised',.3); A.express(1261,'excited',1); D(1262,1.6,'We\u2019re inside it!','excited','CH03_SC02'); S(1262,'voice',{pattern:'whoa'});
  TK(1265,2,'Impossible. Unscheduled. Beautiful.','soft','CH03_SC02');
  C.shot(1257.5,[3,9,30],[0,4,8],52); C.move(1257.5,9,[2,8,22],[0,3.6,4],50,'inOut');
  // flight down the river valley
  const rivPts=[]; for(let z=12;z>=-28;z-=5) rivPts.push(riv(z,3.2+Math.sin(z*.3)*.5));
  A.path(1268,rivPts,44,'inOut'); A.thrust(1268,1,1.15); S(1268.4,'whoosh',{d:6}); S(1280,'whoosh',{d:6}); S(1294,'whoosh',{d:6});
  for(let z=12,k=0;z>=-28;z-=5,k++){ const tt=1268+44*(k+1)/rivPts.length; A.turnTo(tt-44/rivPts.length,44/rivPts.length,PI+Math.atan(.3*Math.cos(z*.05))*.9,'smooth'); }
  A.express(1270,'happy',.6); A.arms(1274,.6,[2.4,1.1,.2],[2.4,1.1,.2]); A.rest(1284,1); A.spin(1290,1.8,1); S(1290.2,'voice',{pattern:'giggle'}); A.express(1296,'playful',.4);
  C.shot(1268,V.add(riv(16,5.5),[1.5,0,0]),riv(8,3.4),50);
  for(let k=1;k<=8;k++){ const tt=1268+k*5.5, p=at(tt); C.via(tt,V.add(p,[1.8*Math.sin(k),1.2,4.2]),V.add(p,[0,0,-3])); }
  // the butterfly
  T.bfly.key(1312,0,'lin').key(1314,1,'out');
  A.express(1314.4,'curious',.3); A.lookAt(1314.6,.6,bflyPos(1316)); D(1315,1,'Oh!','surprised','CH03_SC02'); S(1315,'voice',{pattern:'eep'});
  const chase=[]; for(let k=0;k<9;k++){ const tt=1318+k*2.8; chase.push(V.add(bflyPos(tt+.4),[0,-.4,1.1])); }
  A.path(1317.2,chase,25.2,'inOut'); A.thrust(1317.2,1,.9); A.express(1318,'playful',.4);
  for(let k=0;k<9;k++){ const tt=1318+k*2.8; A.faceToward(tt,1,bflyPos(tt+1.4)); }
  A.reach(1322,.4); A.rest(1323,.4); A.reach(1328.4,.4); A.rest(1329.2,.4); S(1322.3,'boop'); S(1328.6,'boop');
  T.tockPos.key(1318.5,V.add(at(1318),[1.6,.8,1.6]),'lin'); T.tockPos.key(1343,V.add(at(1342),[1.8,.9,1.4]),'lin');
  T.tockEye.key(1324,[1,0,0,0],'lin').key(1325,[.55,0,0,0]); TK(1326,2.4,'We are chasing an insect now?','stern','CH03_SC02');
  T.tockEye.key(1336,[.55,0,0,0],'lin').key(1337,[.9,0,0,.7]);
  A.tr.headTilt.to(1340,.4,.3); A.express(1340.2,'happy',.4); A.look(1340.2,.4,0,.6); D(1341,1.4,'It likes me!','happy','CH03_SC02'); S(1341,'voice',{pattern:'giggle'});
  T.bfly.key(1342.4,1,'lin').key(1344,0,'in'); A.tr.headTilt.to(1344,.4,0); A.look(1344,.4,0,0);
  for(let k=0;k<5;k++){ const tt=1317+k*5.6; C.via(tt,V.add(at(tt),[2.6,1,3.4]),V.lerp(at(tt),bflyPos(tt),.5)); }
  // the clearing and the stump
  const STUMP=[0,0,-44], stumpView=[1.1,1.6,-42.4];
  A.faceToward(1344.4,1,STUMP); A.flyTo(1345,5,stumpView,'inOut'); A.thrust(1345,1,.8); A.thrust(1350,1,.55); S(1345.4,'whoosh',{d:4,soft:1});
  T.tockPos.key(1350,[2.1,2.0,-42.2],'inOut'); A.lookAt(1350.4,1,[0,.95,-44]); A.express(1350.6,'analyze',.5); S(1351,'scan');
  TK(1354,2,'Is that\u2026 a tiny one?','curious','CH03_SC02'); A.scan(1356,3); D(1359.6,1.4,'A world. Inside a world.','thinking','CH03_SC02'); S(1359.6,'voice',{pattern:'q2'});
  C.shot(1344.4,[8,6,-30],[0,1,-44],46); C.move(1344.4,6,[5,3.6,-36],[0,1,-44],44,'inOut');
  C.shot(1350.4,[-1.6,1.3,-41.4],[.3,1.2,-43.6],38); C.move(1350.4,13,[-1.2,1.25,-41.9],[.2,1.15,-43.7],34,'lin');
  // zoom into the tiny orrery
  A.express(1364,'determined',.5); A.reach(1365,1); A.activate(1365,6,1.4);
  C.shot(1366,[.05,1.35,-42.6],[0,.95,-44],40); C.move(1366,5,[0,1.0,-43.7],[0,.95,-44.4],16,'in'); S(1366,'world_dive');
  T.exposure.key(1369.4,1,'lin').key(1371,6,'in');
  // ...and out the other side: the whole Orrery, from very far above
  T.world.cut(1371.1,2); T.bfly.cut(1371.1,0); T.exposure.key(1371.1,6,'lin').key(1374,1,'out'); T.loom.cut(1371.1,[.75,0,0,0]);
  T.owR.cut(1371.1,[4.6,1.25,1.2,1.3,1.15,1.1]);
  A.place(1371.1,[0,1.5,1.8],PI); T.tockPos.cut(1371.1,[1.1,1.9,2.2]);
  C.shot(1371.1,[0,95,60],[0,5,-20],40); C.move(1371.1,11,[3,4.5,9],[0,2.2,0],48,'inOut'); S(1371.2,'deep_tone');
  A.express(1381,'surprised',.3); A.tr.jitter.key(1381,0,'lin').key(1381.3,.4).key(1382.4,0);
  A.express(1383,'confused',.5); A.spin(1383.4,1.4,1); A.tr.headTilt.to(1385,.6,.3);
  TK(1386,2,'My processors hurt.','soft','CH03_SC02'); T.tockEye.key(1385.6,[1,0,0,0],'lin').key(1386.2,[.4,.4,-.3,0]);
  A.tr.headTilt.to(1389,.5,0); A.express(1389.2,'excited',.4); D(1390,2.6,'Worlds\u2026 inside worlds\u2026 inside worlds!','excited','CH03_SC02'); S(1390,'voice',{pattern:'giggle'});
  C.shot(1382.2,[1.5,2.1,-1.4],[0,1.9,1.8],40); C.move(1382.2,10,[1.3,2.0,-1.0],[0,1.9,1.8],38,'lin');
  // shrink the world back and send it home
  A.arms(1394,1,[1.3,1.3,.2],[1.3,1.3,.2]); A.arms(1395.2,2.4,[1.4,.05,.2],[1.4,.05,.2],'inOut'); A.activate(1394,6,1.2); A.express(1394.4,'determined',.4);
  T.owR.key(1395,[4.6,1.25,1.2,1.3,1.15,1.1],'lin').key(1400,[1.3,1.25,1.2,1.3,1.15,1.1],'inOut'); S(1395,'shrink',{d:5});
  T.owHold.key(1400,1,'lin').key(1414,0,'inOut'); A.rest(1400,.8); A.express(1400.6,'relieved',.6);
  // a quiet moment at the edge of the platform
  A.flyTo(1404,4,[3.2,.9,-2.6],'inOut'); A.thrust(1404,1,.6); A.tr.bob.to(1408,2,.5); A.faceToward(1404,2,[1,5,-24]); A.express(1410,'happy',1);
  T.tockPos.key(1405,[3.9,1.5,-2.3],'inOut'); T.tockPos.key(1410,[3.95,.95,-2.2],'inOut'); T.tockEye.key(1410,[.4,.4,-.3,0],'lin').key(1411,[.85,0,0,.6]);
  TK(1420,3,'Courier log: today, we went inside a planet.','soft','CH03_SC02');
  D(1426,1.8,'Best day ever.','happy','CH03_SC02'); S(1426,'voice',{pattern:'hi'});
  C.shot(1393.6,[4.2,2.8,-.4],[0,2.4,-4.6],48); C.move(1393.6,10,[4.6,3.2,.4],[0,2.6,-6],48,'inOut');
  C.shot(1404,[5.2,1.6,1.2],[2,1.6,-8],42); C.move(1404,36,[6.4,2.2,2.4],[1,2.6,-14],44,'inOut');

  // ================= CH03_SC03 · The glimpse (1440–1620) =================
  const ALI=[10,6.5,-16];
  T.ali.cut(1440,[...ALI,0]); T.aliB.cut(1440,[2.8,0,1.2,0]);
  T.ali.key(1443,[...ALI,0],'lin').key(1449,[...ALI,1],'inOut'); T.aliB.key(1443,[2.8,0,1.2,0],'lin').key(1449,[2.8,0,-.2,0],'inOut'); S(1443,'alicia',{d:30});
  A.lookAt(1446,1.2,ALI); A.express(1446.4,'surprised',.4); A.tr.bob.to(1446,1,1); A.thrust(1446,1,.8);
  T.tockEye.key(1447,[.85,0,0,.6],'lin').key(1447.6,[1.3,.4,0,0]); TK(1450,1.4,'Who is that?','curious','CH03_SC03');
  C.shot(1445.6,[1.6,1.6,1.6],ALI,40); C.move(1445.6,8,[2.2,1.7,.6],ALI,32,'inOut');
  // she lifts a hand toward the outer threads
  T.aliB.key(1456,[2.8,0,-.2,0],'lin').key(1459,[2.8,1,-.2,.6],'inOut');
  const N9=outer(3);
  C.shot(1455.6,V.add(ALI,[-4.2,.2,7.2]),V.add(ALI,[0,.3,0]),30); C.move(1455.6,6,V.add(ALI,[-3.8,.2,6.6]),V.add(ALI,[0,.4,0]),28,'lin');
  // ARCHIVE flies toward her; she fades as it arrives
  A.faceToward(1461.4,1,ALI); A.flyTo(1462,9,V.add(ALI,[-2.8,-.2,3.2]),'inOut'); A.thrust(1462,1,1); A.thrust(1470,1,.6); S(1462.2,'whoosh',{d:6,soft:1});
  D(1465,1.6,'Wait\u2014who are you?','curious','CH03_SC03'); S(1465,'voice',{pattern:'q'});
  T.ali.key(1468,[...ALI,1],'lin').key(1473.5,[...ALI,0],'inOut'); T.aliB.key(1468,[2.8,1,-.2,.6],'lin').key(1473.5,[2.8,.6,1.2,.6],'in'); S(1468.4,'shimmer');
  A.express(1474,'sad',.8); A.lookAt(1474.6,2,V.add(ALI,[0,1,0]));
  C.shot(1461.4,[4,2.6,2],[6,5,-12],48); C.move(1461.4,13,[6.8,5.4,-8.6],V.add(ALI,[-1.4,0,1.6]),40,'inOut');
  // where she pointed: an outer thread flickers... and goes out
  A.lookAt(1478,1.4,N9); A.express(1478.4,'curious',.5);
  T.loom.key(1479,[.75,0,0,0],'lin').key(1484,[.75,0,0,.6],'lin').key(1490.6,[.75,0,0,.75],'lin').key(1491,[.75,0,0,1],'cut'); S(1479.4,'thread_flicker',{d:11}); S(1491,'thread_snap');
  A.express(1491.2,'worried',.2); A.tr.jitter.key(1491.2,0,'lin').key(1491.4,.35).key(1492.4,0);
  T.tockPos.key(1478,V.add(at(1478),[1,.6,1.2]),'inOut');
  TK(1494,2.8,'That thread\u2026 it just went out.','worried','CH03_SC03'); A.express(1497.6,'determined',.6); A.activate(1497.6,10,1.2);
  C.shot(1477.6,V.add(at(1478),[2.4,1.4,4.6]),V.lerp(at(1478),N9,.6),46); C.move(1477.6,12,V.add(at(1478),[3,1.8,5.6]),V.lerp(at(1478),N9,.7),44,'lin');
  C.shot(1489.8,V.add(at(1490),[-1.6,.4,1.6]),V.add(at(1490),[0,.4,0]),34); C.move(1489.8,8,V.add(at(1490),[-1.4,.4,1.4]),V.add(at(1490),[0,.4,0]),32,'lin');
  // following the dead thread to a dark world, where a red door opens
  const nearN9=V.add(N9,V.mul(V.norm(V.sub([0,2,0],N9)),3.6));
  A.faceToward(1500,1,nearN9); A.flyTo(1501,13,nearN9,'inOut'); A.thrust(1501,1,1.2); A.thrust(1513,1,.6); S(1501.2,'whoosh',{d:6}); S(1507,'whoosh',{d:6});
  for(let tt=1500;tt<=1515;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[.8,.55,.9]),'lin');
  const tockN9=V.add(nearN9,[-1.1,.45,-.3]); T.tockPos.key(1516,tockN9,'inOut');
  C.shot(1500,V.add(at(1500),[3,2,5]),V.lerp(at(1500),N9,.5),50); C.move(1500,14,V.add(nearN9,[4.4,2.2,4]),N9,46,'inOut');
  const P3=V.add(N9,V.mul(V.norm(V.sub([0,2,0],N9)),1.2)); P3[1]+=.4;
  T.portal.cut(1516,[...P3,2.2]); T.portalFX.cut(1516,[0,0,0,0]);
  T.portalFX.key(1517,[0,0,0,0],'lin').key(1518,[.6,.2,0,0],'out').key(1524,[1,1,0,0],'inOut'); S(1517.4,'spark',{d:7}); S(1524,'ring_hum',{d:6});
  T.portalOpen.key(1525,0,'lin').key(1531,1,'out'); T.portalFX.key(1527,[1,1,2,0],'lin').key(1535,[1,1,3,0],'inOut'); S(1525.2,'portal_open');
  A.express(1517.6,'surprised',.3); A.lookAt(1518,1,P3); A.express(1526,'curious',.6); A.activate(1525,12,1);
  C.shot(1516,V.add(nearN9,[2.6,.8,3.2]),P3,44); C.move(1516,20,V.add(nearN9,[2,.6,2.4]),P3,40,'lin');
  // callback: Courier rule one
  A.turnTo(1537,1.2,A.tr.yaw.at(1537)+1.1); A.lookAt(1538,.8,tockN9); D(1539,1.4,'Red. Hm.','thinking','CH03_SC03'); S(1539,'voice',{pattern:'q2'});
  T.tockEye.key(1540,[.85,0,0,0],'lin').key(1541,[.85,0,0,.6]); TK(1541.6,2.2,'Courier rule one?','soft','CH03_SC03');
  A.express(1544,'happy',.5); D(1544.6,2.2,'Deliver the visitor safely.','happy','CH03_SC03'); S(1544.6,'voice',{pattern:'hi'});
  TK(1548,2,'\u2026Wherever they go.','happy','CH03_SC03');
  A.turnTo(1551,1.2,A.tr.yaw.at(1537)); A.lookAt(1551.6,1,P3); A.express(1552,'determined',.6); A.power(1553,1,.75); A.power(1554.2,1.2,1.15); S(1553.2,'breath',{d:3});
  C.shot(1536.6,V.add(at(1537),[1.8,.5,2.2]),V.lerp(at(1537),tockN9,.5),36); C.move(1536.6,20,V.add(at(1537),[2.2,.6,2.6]),V.lerp(at(1537),tockN9,.5),34,'lin');
  // through
  const dirIn=V.norm(V.sub(P3,nearN9)), past=V.add(P3,V.mul(dirIn,3));
  A.flyTo(1558,4,past,'in'); A.thrust(1558,2,1.5); A.express(1558.2,'excited',.4); S(1558.2,'whoosh',{d:4}); S(1558.4,'voice',{pattern:'giggle'});
  for(let tt=1558;tt<=1562;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.5),[.6,.5,.6]),'lin');
  C.shot(1557.6,V.add(nearN9,V.add(V.mul(dirIn,-3),[.8,.8,0])),P3,46); C.move(1557.6,4.2,V.add(P3,V.mul(dirIn,-.6)),V.add(P3,V.mul(dirIn,6)),66,'in');
  T.exposure.key(1559.8,1,'lin').key(1562,7,'in'); S(1560,'flash');
  // closing image: the Orrery turning on, one world dark at its edge
  T.portalOpen.key(1562.2,1,'lin').key(1563,0,'cut'); A.tr.pos.cut(1562.3,[0,-60,0]); T.tockVis.key(1562.2,1,'lin').key(1562.3,0,'cut');
  T.exposure.key(1562.4,7,'lin').key(1568,1,'out');
  C.shot(1562.4,[20,26,30],[0,8,-30],48); C.move(1562.4,50,[34,22,10],[0,8,-30],52,'inOut');
  T.fade.key(1612,1,'lin').key(1619.9,0,'inOut');
});

// =================== score for 18:00–27:00 ===================
G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,CH,beat,bar,theme}=K, e8=beat/2;
  // the Orrery: a music-box waltz (3/4) over wide pads
  const wb=beat*.95, wbar=wb*3, waltz=['Fmaj7','Cmaj7','Am7','G','Fmaj7','Em7','Dm9','Gsus'];
  for(let rep=0;rep<5;rep++) waltz.forEach((c,b)=>{ const t0=1086+(rep*8+b)*wbar; if(t0>1238) return; const ch=CH[c];
    add(t0,wb*.9,ch[0]-12,'bass',.35,0); [1,2].forEach(k=>add(t0+k*wb,wb*.6,ch[1]+12,'pluck',.28,k===1?-.3:.3));
    if(b%2===0) chord(t0,wbar*2.05,ch.map(x=>x+12),'pad',.26,{att:1.6});
    [0,2,3].forEach((k,j)=>add(t0+j*wb,wb*.8,ch[k%ch.length]+24+(rep%2?12:0),'celesta',.32,j?.35:-.35)); });
  theme.forEach(([b,m,d])=>add(1104+b*beat*1.3,d*beat*1.35,m+24,'bell',.32,.2));
  [84,88,91,96,100].forEach((m,k)=>add(1189.6+k*.12,2.6,m,'bell',.5,k*.2-.4));
  chord(1205,10,[29,36,41,45],'drone',.4,{att:3}); chord(1226.8,4,[65,69,72,77],'strings',.3,{att:.3});
  // the dive: rising strings, cut to air
  chord(1240,10,[45,52,57,60,64],'strings',.3,{att:4}); chord(1250,6,[48,55,60,64,67],'brass',.35,{att:2}); add(1257.5,1,36,'timp',1.1,0);
  // the forest world: pastoral, open
  const past=['Cmaj7','Fmaj7','Am7','G','Cmaj7','Fmaj7','Dm9','Gsus','Cmaj7','Am7','Fmaj7','G','Cmaj7','Fmaj7','Am7','Gsus'];
  past.forEach((c,b)=>{ const t0=1258+b*bar; const ch=CH[c]; chord(t0,bar*1.02,ch.map(x=>x+12),'strings',.22,{att:1}); add(t0,bar,ch[0]-12,'bass',.36,0);
    for(let j=0;j<8;j++) add(t0+j*e8,e8*.8,ch[[0,1,2,3,2,1,2,3][j]]+24,'pluck',.3,(j%2?.4:-.4)); });
  theme.forEach(([b,m,d])=>{ add(1270+b*beat,d*beat,m+12,'piano',.6,0); add(1294+b*beat,d*beat*1.05,m+24,'strings',.5,0,{att:.2}); });
  // butterfly: celesta flutter
  for(let k=0;k<40;k++) add(1314+k*.62,.3,[91,95,98,100,98,95][k%6],'celesta',.3,Math.sin(k)*.6);
  // the stump: mystery, then the zoom
  chord(1350,14,CH.Fadd9,'pad',.35,{att:2}); for(let k=0;k<10;k++) add(1351+k*1.2,1,[77,81,84,89][k%4],'bell',.3,.3);
  chord(1366,5,[41,48,53,57,60],'strings',.32,{att:2}); add(1371.1,1,29,'timp',1.2,0); chord(1371.1,8,[41,48,53,57,60,65],'brass',.4,{});
  // dizzy laughter, the world goes home, a quiet moment
  for(let k=0;k<12;k++) add(1383+k*.25,.2,72+k*2,'pluck',.35,(k%2?.4:-.4));
  chord(1394,6,[48,55,60,64],'strings',.3,{att:1});
  ['Cmaj7','Am7','Fmaj7','Gsus','Cmaj7','Em7','Fmaj7','Cmaj7'].forEach((c,b)=>{ const t0=1404+b*4.4; chord(t0,4.6,CH[c].map(x=>x+12),'pad',.24,{att:1.5});
    CH[c].forEach((m,k)=>add(t0+k*.3,3.6,m+12,'piano',.3,k*.15-.2)); });
  // Alicia: a high, still theme — bells over a choir-like pad
  chord(1443,30,[57,64,69,72,76],'pad',.42,{att:5}); add(1443,30,45,'drone',.35,0,{att:4});
  [[0,88],[1.6,91],[3.2,96],[6.4,95],[8,91],[9.6,88],[12.8,84],[16,88],[17.6,93],[19.2,96]].forEach(([b,m])=>add(1448+b,3,m,'bell',.38,.1));
  // the thread goes out
  add(1479,14,37,'drone',.55,0,{att:2}); chord(1479,12,[49,52,56],'strings',.3,{att:3}); add(1491,1,36,'timp',1.1,0); chord(1491,6,[37,44,49],'brass',.4,{});
  // the red door: low brass, tension, resolve
  chord(1500,16,[38,45,50,53],'strings',.32,{att:3}); for(let k=0;k<24;k++) add(1505+k*.5,.3,[50,53,57,53][k%4],'pluck',.3+k*.01,(k%2?.3:-.3));
  add(1525.2,1,33,'timp',1.2,0); chord(1525.2,8,[45,52,57,60],'brass',.45,{});
  ['Am7','Fmaj7','Cmaj7','G'].forEach((c,b)=>{ const t0=1537+b*5; chord(t0,5.2,CH[c].map(x=>x+12),'strings',.26,{att:1}); add(t0,5,CH[c][0]-12,'bass',.4,0); });
  [[0,64],[1,67],[2,74]].forEach(([b,m])=>add(1544.6+b*beat,beat*1.6,m+12,'celesta',.5,0));
  add(1558,1,36,'timp',1.2,0); chord(1558,4,[48,55,60,64,67],'brass',.5,{});
  chord(1562,12,[48,55,60,64,67,72],'pad',.5,{att:.3}); [84,88,91,96].forEach((m,k)=>add(1562+k*.1,4,m,'bell',.5,k*.2-.3));
  // closing: the Orrery turns on; one world dark
  waltz.slice(0,6).forEach((c,b)=>{ const t0=1572+b*wbar*2; chord(t0,wbar*2.1,CH[c].map(x=>x+12),'pad',.22,{att:2}); add(t0,wb,CH[c][1]+24,'celesta',.28,0); });
  add(1600,14,37,'drone',.3,0,{att:3});
});

Object.assign(G.ARCHIVE_SFX_EXT,{
  portal_close:(S,c)=>{ S({t:c.t,d:3,i:'noiseSweep',f0:3000,f1:200,g:.35}); S({t:c.t+2.6,d:.5,i:'thump',f:50,k:4,g:.6}); },
  scan:(S,c)=>{ for(let k=0;k<6;k++) S({t:c.t+k*.35,d:.12,i:'chirp',f0:1400,f1:2200,g:.2}); },
  grow:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:110,f1:55,g:.5}); S({t:c.t,d:c.d,i:'noiseSweep',f0:200,f1:1200,g:.3}); },
  shrink:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:55,f1:160,g:.45}); S({t:c.t,d:c.d,i:'noiseSweep',f0:1400,f1:250,g:.3}); },
  world_dive:(S,c)=>{ S({t:c.t,d:3.6,i:'noiseSweep',f0:200,f1:7000,g:.55}); S({t:c.t+3,d:1.2,i:'thump',f:36,k:1.2,g:1}); },
  alicia:(S,c,u)=>{ S({t:c.t,d:c.d,i:'hum',f0:220,f1:220,g:.12}); for(let k=0;k<8;k++) S({t:c.t+k*2.6,d:.2,f:u.mtof([96,100,103,108][k%4]),i:'bell',v:.18,pan:Math.sin(k)*.6}); },
  shimmer:(S,c)=>{ S({t:c.t,d:5,i:'noiseSweep',f0:6000,f1:1500,g:.25}); },
});
})(typeof window!=='undefined'?window:globalThis);
