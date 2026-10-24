/* CHAPTER 9 — THE RESTORATION (72:00–81:00)
   ARCHIVE, linked to the Heartstar, cannot hold the rhythm alone; the threads begin to slip. Tock returns out of
   the dark carrying Verdance's signal. One by one every world ARCHIVE helped takes a share of the melody —
   Verdance's chimes, Ferrum's machine rhythm, Thalassa's song, the Orrery's music box — until the full theme
   plays and the Loom locks into time. Lost worlds reassemble, portals reopen. Because the load is shared, the
   Seat lets ARCHIVE go, and Alicia, no longer holding everything alone, becomes solid for the first time.
   CH09_SC01 Alone at the Seat (72:00–75:00) · CH09_SC02 Every world answers (75:00–78:00) · CH09_SC03 Free (78:00–81:00)
   Uses existing world modules: the Core (8) plus a montage across the Lost Worlds (7), the Loom (6), Thalassa (5),
   Ferrum (4) and Verdance (1). */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
G.ARCHIVE_SFX_EXT = G.ARCHIVE_SFX_EXT || {};
const T0=4320, T1=4860, HS=[0,0,-120], SEAT=[0,0,-70], ALI=[3.4,.4,-66.6];

G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,V,clamp,lerp,sstep,Track,dialogue,SCENES} = K;
  const T=W.tr, PI=Math.PI;
  const D=(t,dur,text,emotion,scene,who='ARCHIVE')=>dialogue.push({character:who,text,start:t,end:t+dur,emotion,scene,audio:null,face:emotion});
  const TK=(t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'TOCK'); S(t,'tock_voice',{n:Math.max(2,Math.round(text.length/4))}); };
  const AL=(t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'ALICIA'); S(t,'alicia_voice',{d:dur}); };
  const at=t=>A.tr.pos.at(t);
  const meta={CH09_SC01:'Alone at the Seat',CH09_SC02:'Every world answers',CH09_SC03:'Free'};
  for(const s of SCENES) if(meta[s.id]){ s.title=meta[s.id]; s.status='animated'; }
  const faceYaw=(from,to)=>{ const d=V.sub(to,from); return Math.atan2(d[0],d[2]); };
  const far=[]; for(let i=0;i<14;i++){ const a=i*.4488, e=Math.sin(i*2.1)*.5; far.push(HS[0]+Math.cos(a)*Math.cos(e)*190, HS[1]+Math.sin(e)*190, HS[2]+Math.sin(a)*Math.cos(e)*190); }
  T.mont=new Track([0,0,0,0]); // montage helpers: loom brightness, lost gate, lost world-B break, unused
  W.exts.push((t,s)=>{ if(t<T0-1||t>T1+1) return;
    const U={ uCore:s.core, uMem:0, uAli:s.ali, uAliB:s.aliB, uAliC:s.aliC };
    if(s.world>7.5){ s.loomN=far; s.loomC=[...HS,0]; }
    if(s.world>5.5&&s.world<6.5) U.uNet=[t,s.mont[0]*0+Math.max(0,.8-s.mont[1]),1.2,1];
    if(s.world>6.5&&s.world<7.5){ U.uLost=[0,0,0,1]; U.uLostB=[s.mont[2],0,1.4,1.2]; }
    s.U=Object.assign(s.U||{},U);
  });
  const SAT=V.add(SEAT,[0,.9,.6]);

  // ================= CH09_SC01 · Alone at the Seat (4320–4500) =================
  T.world.cut(T0,8); T.mem.cut(T0,0); T.fade.cut(T0,0); T.fade.to(T0,3,1,'inOut'); T.exposure.cut(T0,1);
  T.core.cut(T0,[1,.5,1,1]); T.loom.cut(T0,[.8,0,0,0]); T.loomB.cut(T0,[0,0,3,1.2]); T.portalOpen.cut(T0,0); T.portalFX.cut(T0,[0,0,0,0]);
  T.orb.cut(T0,[0,-40,0,0]); T.orbGlow.cut(T0,0); T.tockVis.cut(T0,0);
  T.ali.cut(T0,[...ALI,1]); T.aliB.cut(T0,[2.6,0,-.3,0]); T.aliC.cut(T0,[faceYaw(ALI,SAT),0,.45,1]);
  A.tr.roll.cut(T0,0); A.tr.jitter.cut(T0,.3); A.tr.power.cut(T0,1.5); A.tr.bob.cut(T0,.2); A.tr.headYaw.cut(T0,0); A.tr.headPitch.cut(T0,0); A.tr.headTilt.cut(T0,0);
  A.place(T0,SAT,0); A.tr.thrust.cut(T0,.4); A.express(T0,'determined',.1); A.arms(T0,.01,[1.6,.9,.3],[1.6,.9,.3]);
  S(T0,'core_hum',{d:180}); S(T0,'heartbeat');
  // the rhythm: three pulses, again and again
  for(let k=0;k<18;k++){ const t=T0+4+k*4.2; [0,.45,.9].forEach(o=>{ A.tr.emblem.key(t+o,1.2,'lin'); A.tr.emblem.key(t+o+.15,2.4,'out'); A.tr.emblem.key(t+o+.4,1.2,'in'); }); }
  C.shot(T0,V.add(SEAT,[0,1.2,4]),SAT,34); C.move(T0,14,V.add(SEAT,[0,1.4,6]),SAT,38,'inOut');
  D(4334,2,'Hold\u2026 hold\u2026','determined','CH09_SC01'); S(4334,'voice',{pattern:'q2'});
  T.core.key(4336,[1,.5,1,1],'lin').key(4352,[1.15,.32,1.3,1],'inOut');
  C.shot(4340,[22,8,-36],V.lerp(SEAT,HS,.3),52); C.move(4340,18,[30,12,-24],V.lerp(SEAT,HS,.4),56,'inOut');
  // it slips
  T.core.key(4360,[1.15,.32,1.3,1],'lin').key(4380,[.9,.62,1,1],'in'); S(4362,'panels_fail',{d:18});
  T.loom.key(4362,[.8,0,0,0],'lin').key(4374,[.8,0,0,.8],'inOut'); T.loomB.key(4366,[0,0,3,1.2],'lin').key(4378,[.8,0,3,.9],'inOut');
  A.tr.jitter.key(4360,.3,'lin').key(4380,.7); A.express(4364,'frustrated',.6); A.power(4372,6,.7);
  T.aliB.key(4366,[2.6,0,-.3,0],'lin').key(4368,[2.6,0,.35,0],'inOut').key(4370,[2.6,0,.1,0]).key(4372,[2.6,0,.45,0]);
  AL(4368,2.6,'It\u2019s too much for one\u2014','faint','CH09_SC01'); S(4368.2,'glitch',{d:1});
  D(4372,2,'I won\u2019t let go.','frustrated','CH09_SC01'); S(4372,'voice',{pattern:'eep'});
  C.shot(4360,V.add(SAT,[1.3,.3,1.9]),SAT,30); C.move(4360,20,V.add(SAT,[1.2,.3,1.75]),SAT,28,'lin');
  A.express(4384,'sad',1.4); A.tr.headPitch.to(4386,2,.25);
  C.shot(4380,[-6,3,-52],V.lerp(SAT,ALI,.5),44); C.move(4380,16,[-8,4,-48],V.lerp(SAT,ALI,.5),46,'inOut');
  D(4392,2.4,'I can\u2019t\u2026 hold it\u2026 alone\u2026','sad','CH09_SC01'); S(4392,'voice',{pattern:'phew'});
  // a small light out of the dark
  const TK0=[0,8,40], TKS=V.add(SEAT,[1.3,1.9,1.8]);
  T.tockVis.key(4398,0,'lin').key(4398.1,1,'cut'); T.tockEye.cut(4398,[1,0,0,0]); T.tockYaw.cut(4398,PI);
  T.tockPos.cut(4398,TK0); T.tockPos.key(4420,V.add(SEAT,[2,3,14]),'inOut').key(4428,TKS,'inOut');
  for(const [t,p] of [[4398,TK0],[4420,V.add(SEAT,[2,3,14])],[4428,TKS]]) T.orb.key(t,[...V.add(p,[0,-.5,0]),.26],'inOut');
  T.orbGlow.key(4398,0,'lin').key(4400,1.3,'out'); S(4398,'chime_far');
  A.tr.headPitch.to(4404,1.4,0); A.lookAt(4405,2,V.add(SEAT,[2,4,30])); A.express(4406,'surprised',.6);
  C.shot(4398,V.add(SEAT,[-1,1.6,-3]),V.add(SEAT,[0,4,30]),40); C.move(4398,14,V.add(SEAT,[-1.4,1.8,-3.6]),V.add(SEAT,[1,3,16]),40,'inOut');
  TK(4416,3,'Courier rule one: deliver\u2026 the signal!','determined','CH09_SC01');
  A.express(4420,'excited',.4); D(4421,1.4,'TOCK!','excited','CH09_SC01'); S(4421,'voice',{pattern:'hi'});
  A.lookAt(4424,2,TKS); C.shot(4420,V.add(SEAT,[4,2.4,6]),V.lerp(SAT,TKS,.5),40); C.move(4420,12,V.add(SEAT,[3.4,2.2,5.2]),V.lerp(SAT,TKS,.5),36,'inOut');
  T.tockEye.key(4430,[1,0,0,0],'lin').key(4431,[.9,0,0,.8]); TK(4432,3.2,'I followed Verdance\u2019s signal. It wanted to help.','happy','CH09_SC01');
  A.express(4436,'happy',.6); D(4437,2.2,'You came back.','happy','CH09_SC01'); S(4437,'voice',{pattern:'q'});
  TK(4440.6,2.6,'You are my visitor. I deliver.','proud','CH09_SC01');
  C.shot(4432,V.lerp(SAT,TKS,.5),V.lerp(SAT,TKS,.5),30); C.shot(4432,V.add(V.lerp(SAT,TKS,.5),[.4,.4,2.6]),V.lerp(SAT,TKS,.5),32); C.move(4432,14,V.add(V.lerp(SAT,TKS,.5),[.4,.4,2.4]),V.lerp(SAT,TKS,.5),30,'lin');
  // the signal goes into the Seat
  T.orb.key(4448,[...V.add(TKS,[0,-.5,0]),.26],'lin').key(4454,[...V.add(SEAT,[0,.6,-.4]),.2],'inOut').key(4456,[...V.add(SEAT,[0,.6,-.6]),0],'in');
  S(4455.6,'signal_in'); A.express(4456,'surprised',.3);
  T.core.key(4456,[.9,.62,1,1],'lin').key(4464,[1,.45,1.3,1],'out'); A.power(4456,4,1.3); A.tr.jitter.key(4456,.7,'lin').key(4466,.35);
  T.loom.key(4456,[.8,0,0,.8],'lin').key(4466,[.85,0,0,0],'inOut');
  D(4466,2.2,'Verdance\u2026 is holding with me!','excited','CH09_SC01'); S(4466,'voice',{pattern:'giggle'});
  C.shot(4446,V.add(SEAT,[2.2,1.2,3.2]),V.add(SEAT,[0,.8,0]),36); C.move(4446,14,V.add(SEAT,[1.8,1,2.6]),V.add(SEAT,[0,.7,-.4]),32,'inOut');
  C.shot(4460,[16,6,-50],V.lerp(SEAT,HS,.3),50); C.move(4460,20,[22,9,-44],V.lerp(SEAT,HS,.35),52,'inOut');
  AL(4472,3,'It\u2019s a share. The worlds can carry a share.','hopeful','CH09_SC01');
  A.express(4476,'determined',.6); D(4478,2.6,'Then let\u2019s ask them all.','determined','CH09_SC01'); S(4478,'voice',{pattern:'hi'});

  // ================= CH09_SC02 · Every world answers (4500–4680) =================
  // windows open around the Core: each world answers with its part of the melody
  const W1=V.add(SEAT,[-4,3.2,5]), W2=V.add(SEAT,[4.6,3.6,4]), W3=V.add(SEAT,[-3.4,5.2,2]), W4=V.add(SEAT,[3.2,5.6,1.6]);
  const win=(t,pos,view,snd)=>{ T.portal.cut(t,[...pos,1.3]); T.portalFX.cut(t,[0,0,view,0]); T.portalOpen.key(t,0,'lin').key(t+1.2,1,'out').key(t+7,1,'lin').key(t+8,0,'in'); S(t,snd); };
  win(4500,W1,1,'answer_verdance'); win(4509,W2,2.9,'answer_ferrum'); win(4518,W3,3.9,'answer_thalassa'); win(4527,W4,1.6,'answer_orrery');
  T.core.key(4500,[1,.45,1.3,1],'lin').key(4536,[1.3,.05,1.5,1],'inOut'); T.loom.key(4500,[.85,0,0,0],'lin').key(4536,[1,0,0,0],'inOut'); T.loomB.key(4500,[.8,0,3,.9],'lin').key(4536,[0,0,3,1.6],'inOut');
  A.tr.jitter.key(4500,.35,'lin').key(4536,0); A.power(4500,30,1.1);
  A.lookAt(4500.5,1,W1); A.express(4501,'happy',.5); A.lookAt(4509.5,1,W2); A.lookAt(4518.5,1,W3); A.lookAt(4527.5,1,W4);
  A.express(4520,'excited',1);
  C.shot(4500,V.add(SEAT,[0,2.6,10]),V.add(SEAT,[0,3,2]),50); C.move(4500,36,V.add(SEAT,[0,3.4,13]),V.add(SEAT,[0,3.2,2]),54,'inOut');
  TK(4512,1.6,'Ferrum\u2019s on the line!','excited','CH09_SC02'); TK(4521,1.8,'Thalassa too!','excited','CH09_SC02');
  D(4530,2.6,'We\u2019re holding it\u2026 together!','excited','CH09_SC02'); S(4530,'voice',{pattern:'giggle'});
  // montage: the network heals
  const MS=[ [4537,7,'lost'], [4551,6,'loom'], [4563,5,'thalassa'], [4574,4,'ferrum'], [4584,1,'verdance'] ];
  T.mont.cut(4537,[0,0,1,0]); T.mont.key(4538,[0,0,1,0],'lin').key(4550,[0,0,0,0],'inOut'); T.mont.key(4551,[0,0,0,0],'lin').key(4561,[0,.8,0,0],'inOut');
  T.world.cut(4537,7); T.tockVis.key(4536.9,1,'lin').key(4537,0,'cut'); A.tr.pos.cut(4537,[0,-500,0]);
  T.exposure.key(4536,1,'lin').key(4537,3,'in').key(4538.4,1,'out'); S(4537,'whoosh',{d:3});
  C.shot(4537,[-6,4,-112],[12,-3,-160],52); C.move(4537,13,[-10,6,-108],[14,-2,-162],56,'inOut');
  T.world.cut(4551,6); C.shot(4551,[0,0,10],[0,0,-30],60); C.move(4551,11,[2,1,-20],[0,0,-60],60,'lin');
  T.world.cut(4563,5); C.shot(4563,[24,16,8],[0,-2,-26],48); C.move(4563,10,[30,20,20],[0,0,-30],52,'inOut');
  T.world.cut(4574,4); C.shot(4574,[30,40,-20],[0,20,-130],46); C.move(4574,9,[40,46,-6],[0,26,-150],48,'inOut');
  T.world.cut(4584,1); C.shot(4584,[0,11,-26],[0,4,-82],50); C.move(4584,10,[0,15,-10],[0,5,-90],50,'inOut');
  [4551,4563,4574,4584,4594].forEach(t=>{ T.exposure.key(t-.6,1,'lin').key(t,2.2,'in').key(t+1.2,1,'out'); S(t,'whoosh',{d:2,soft:1}); });
  // back to the Core: the full theme, the swarm alight
  T.world.cut(4594,8); A.tr.pos.cut(4594,SAT); T.tockVis.key(4593.9,0,'lin').key(4594,1,'cut'); T.tockPos.cut(4594,TKS);
  T.core.cut(4594,[1.35,0,1.6,1]); T.portalOpen.cut(4594,0);
  C.shot(4594,[40,20,10],HS,50); C.move(4594,24,[60,30,-30],HS,58,'inOut');
  A.express(4596,'happy',.6); A.tr.jitter.cut(4594,0);
  C.shot(4618,V.add(SAT,[1.4,.4,2.2]),SAT,32); C.move(4618,12,V.add(SAT,[1.3,.4,2]),SAT,30,'lin');
  D(4620,2.4,'Every world\u2026 in time.','relieved','CH09_SC02'); S(4620,'voice',{pattern:'hi'});
  A.express(4622,'relieved',1.4);
  T.tockEye.key(4626,[1,0,0,0],'lin').key(4627,[.9,0,0,.8]); TK(4628,1.6,'Nominal.','proud','CH09_SC02');
  C.shot(4630,V.add(SEAT,[-3,2,8]),V.lerp(SAT,TKS,.5),40); C.move(4630,14,V.add(SEAT,[-3.6,2.2,9]),V.lerp(SAT,TKS,.5),40,'lin');
  AL(4645,3.4,'ARCHIVE\u2026 the Seat doesn\u2019t need you anymore. Not alone.','warm','CH09_SC02');
  A.lookAt(4645,1.4,V.add(ALI,[0,1.4,0])); A.express(4648,'curious',.8);
  C.shot(4644,V.add(ALI,[-.6,1.4,3.6]),V.add(ALI,[0,1.6,0]),30); C.move(4644,6,V.add(ALI,[-.6,1.4,3.4]),V.add(ALI,[0,1.6,0]),28,'lin');
  // the Seat opens
  T.core.key(4652,[1.35,0,1.6,1],'lin').key(4656,[1.35,0,.6,1],'inOut'); S(4652.4,'seat_release');
  A.arms(4653,1.2,[.25,.35,.5],[.25,.35,.5]); A.tr.bob.to(4654,2,1); A.thrust(4654,2,1); A.power(4654,2,1);
  A.flyTo(4656,5,V.add(SAT,[0,1.6,3]),'inOut'); A.turnTo(4657,3,PI*0+.0);
  A.express(4658,'surprised',.4); A.express(4661,'excited',.6); A.spin(4663,1.8,1); A.armsUp(4663,.5); A.rest(4665,.6); S(4663,'spin'); S(4663.2,'voice',{pattern:'giggle'});
  D(4666,1.6,'I\u2019m free!','excited','CH09_SC02'); S(4666,'voice',{pattern:'hi'});
  T.tockPos.key(4657,TKS,'lin').key(4664,V.add(SAT,[1.3,2.6,3.6]),'inOut');
  C.shot(4650,V.add(SEAT,[3,1.6,7]),V.add(SEAT,[0,1.6,1.6]),40); C.move(4650,30,V.add(SEAT,[3.6,2,8.4]),V.add(SEAT,[0,2.2,2.6]),42,'inOut');

  // ================= CH09_SC03 · Free (4680–4860) =================
  // Alicia, no longer holding everything alone, becomes solid
  T.aliC.key(4680,[faceYaw(ALI,SAT),0,.45,1],'lin').key(4694,[faceYaw(ALI,V.add(SAT,[0,1.6,3])),0,1,1],'inOut');
  T.aliB.key(4680,[2.6,0,-.3,0],'lin').key(4694,[2.6,0,-.6,0],'inOut'); S(4680,'solidify',{d:14});
  A.lookAt(4682,2,V.add(ALI,[0,1.4,0])); A.express(4686,'surprised',1);
  C.shot(4680,V.add(ALI,[-2.6,1.5,4.4]),V.add(ALI,[0,1.3,0]),36); C.move(4680,16,V.add(ALI,[-2.2,1.5,3.8]),V.add(ALI,[0,1.4,0]),32,'inOut');
  AL(4697,3,'I\u2019m\u2026 not fading. For the first time in so long.','warm','CH09_SC03');
  A.express(4700,'happy',1); D(4701,2.2,'Because you\u2019re not holding it alone.','happy','CH09_SC03'); S(4701,'voice',{pattern:'hi'});
  C.shot(4700,V.add(at(4700),[1.4,.3,-2.2]),V.add(at(4700),[0,.3,0]),32); C.move(4700,4,V.add(at(4700),[1.3,.3,-2]),V.add(at(4700),[0,.3,0]),30,'lin');
  // she reaches out; ARCHIVE reaches back
  const MEET=V.lerp(V.add(SAT,[0,1.6,3]),V.add(ALI,[0,1.6,0]),.45);
  A.faceToward(4704,1.4,V.add(ALI,[0,1.4,0])); A.flyTo(4705,5,V.lerp(V.add(SAT,[0,1.6,3]),V.add(ALI,[0,1.6,0]),.32),'inOut');
  T.aliB.key(4706,[2.6,0,-.6,0],'lin').key(4709,[2.6,.75,-.6,0],'inOut'); A.reach(4709,1); S(4710.4,'touch_light');
  AL(4712,2.8,'You did it. You all did.','warm','CH09_SC03');
  D(4716,1.6,'We did.','happy','CH09_SC03'); S(4716,'voice',{pattern:'hi'});
  T.tockPos.key(4708,V.add(MEET,[0,1.4,1.2]),'inOut');
  T.tockEye.key(4718,[.9,0,0,.8],'lin'); TK(4719,2.4,'Visitor\u2026 delivered.','proud','CH09_SC03');
  const mdir=V.norm(V.sub(V.add(ALI,[0,1.6,0]),V.add(SAT,[0,1.6,3]))), mside=V.norm(V.cross([0,1,0],mdir)); const MC=V.lerp(V.add(SAT,[0,1.6,3]),V.add(ALI,[0,1.4,0]),.5);
  C.shot(4704,V.add(MC,V.add(V.mul(mside,5.2),[0,.5,0])),MC,44); C.move(4704,20,V.add(MC,V.add(V.mul(mside,4.6),[0,.6,0])),MC,40,'lin');
  A.rest(4724,1); T.aliB.key(4724,[2.6,.75,-.6,0],'lin').key(4727,[2.6,0,-.6,0],'inOut');
  // the three of them watch the Heartstar, alive again
  A.faceToward(4730,2,HS); A.flyTo(4731,6,V.add(SEAT,[-1.2,2.2,4]),'inOut'); T.tockPos.key(4737,V.add(SEAT,[-2.2,2.8,4.4]),'inOut');
  T.ali.key(4730,[...ALI,1],'lin').key(4737,[...V.add(SEAT,[1.4,1.0,4.6]),1],'inOut'); T.aliC.key(4737,[faceYaw(V.add(SEAT,[1.4,1,4.6]),HS),0,1,1],'inOut');
  A.express(4740,'relieved',2); A.tr.bob.to(4740,2,.6);
  C.shot(4730,V.add(SEAT,[0,3,16]),V.add(SEAT,[0,2,0]),44); C.move(4730,30,V.add(SEAT,[0,3.4,22]),V.add(SEAT,[0,1.4,-20]),48,'inOut');
  AL(4764,3.4,'There are still worlds that went dark. They\u2019ll need visiting.','warm','CH09_SC03');
  A.express(4768,'happy',.6); D(4769,2,'I know a good courier.','playful','CH09_SC03'); S(4769,'voice',{pattern:'giggle'});
  T.tockEye.key(4772,[.9,0,0,0],'lin').key(4773,[.9,0,0,.9]); TK(4773.4,1.8,'The best courier.','proud','CH09_SC03');
  C.shot(4762,[-6,4,-54],V.add(SEAT,[0,2.6,4.4]),40); C.move(4762,20,[-8,5,-50],V.add(SEAT,[0,2.6,4.4]),42,'lin');
  // the network, whole: a vast pull-back
  C.shot(4782,V.add(SEAT,[0,4,10]),HS,50); C.move(4782,60,[120,90,140],HS,58,'inOut');
  T.core.key(4782,[1.35,0,.6,1],'lin').key(4830,[1.5,0,.6,1.2],'inOut'); T.loom.key(4782,[1,0,0,0],'lin').key(4830,[1,0,0,0],'lin');
  T.fade.key(4850,1,'lin').key(4859.9,0,'inOut');
});

// =================== score for 72:00–81:00 ===================
G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,CH,beat,bar,theme}=K, e8=beat/2;
  // alone at the Seat: the three-pulse heartbeat, a straining drone
  add(4320,90,24,'drone',.5,0,{att:4});
  for(let k=0;k<18;k++){ const t=4324+k*4.2; [0,.45,.9].forEach((o,j)=>add(t+o,.6,[36,36,43][j],'timp',.35+.02*k,0)); }
  chord(4336,24,[45,52,57,60],'strings',.3,{att:4}); chord(4360,24,[44,47,51,56],'strings',.34,{att:3});
  [[4384,'Am7'],[4389,'Fmaj7'],[4394,'Dm9']].forEach(([t,c])=>CH[c].forEach((m,k)=>add(t+k*.3,4.4,m+12,'piano',.3,k*.15-.2)));
  // Tock returns: Verdance's chime, far away, then close
  [[4398,88],[4398.4,91],[4398.8,96],[4408,88],[4408.4,91],[4408.8,96],[4418,88],[4418.4,91],[4418.8,96]].forEach(([t,m],i)=>add(t,2,m,'bell',.2+i*.03,.3));
  ['Cmaj7','Am7','Fmaj7','G'].forEach((c,b)=>{ const t0=4421+b*5; chord(t0,5.2,CH[c].map(x=>x+12),'strings',.3,{att:1}); add(t0,5,CH[c][0]-12,'bass',.4,0); });
  // each world joins with its own part of the melody
  const th=theme;
  th.forEach(([b,m,d])=>add(4456+b*beat,d*beat,m+24,'bell',.4,.3));                          // Verdance: chimes
  th.forEach(([b,m,d])=>add(4500+b*beat,d*beat,m+24,'celesta',.4,-.3));
  for(let k=0;k<48;k++) add(4509+k*e8,e8*.5,[48,55,52,55][k%4],'pluck',.5,(k%2?.3:-.3));        // Ferrum: machine rhythm
  for(let k=0;k<12;k++) add(4509+k*beat*2,.6,36,'timp',.5,0);
  add(4518,10,57,'strings',.45,0,{att:2}); add(4521,8,64,'strings',.4,0,{att:2}); add(4524,6,69,'strings',.38,0,{att:2}); // Thalassa: a long song
  th.forEach(([b,m,d])=>add(4527+b*beat*.95,d*beat*.95,m+24,'celesta',.38,.2));                 // Orrery: music box
  // montage: the full theme, everything together
  ['Cmaj7','Em7','Fmaj7','G','Am7','Em7','Fmaj7','G','Cmaj7','Am7','Fmaj7','Gsus','Cmaj7','Em7','Fmaj7','Cmaj7'].forEach((c,b)=>{ const t0=4537+b*3.6; chord(t0,3.7,CH[c].map(x=>x+12),'strings',.36,{att:.4}); chord(t0,3.6,[CH[c][0],CH[c][0]+7],'brass',.38,{}); add(t0,3.6,CH[c][0]-12,'bass',.55,0); });
  th.forEach(([b,m,d])=>{ add(4540+b*beat,d*beat,m+12,'brass',.6,0); add(4540+b*beat,d*beat,m+24,'strings',.62,0,{att:.12}); });
  th.forEach(([b,m,d])=>{ add(4565+b*beat,d*beat,m+12,'brass',.6,0); add(4565+b*beat,d*beat,m+24,'strings',.62,0,{att:.12}); add(4565+b*beat,d*beat,m+24,'bell',.3,0); });
  [4537,4551,4563,4574,4584,4594].forEach(t=>add(t,1,36,'timp',1,0));
  chord(4594,24,[48,55,60,64,67,72],'pad',.5,{att:2}); [84,88,91,96,100].forEach((m,k)=>add(4594+k*.14,5,m,'bell',.45,k*.2-.4));
  // free!
  chord(4652,6,[60,64,67,72],'strings',.4,{att:.2}); [[4663,72],[4663.3,76],[4663.6,79],[4663.9,84]].forEach(([t,m])=>add(t,.4,m,'pluck',.6,0));
  // Alicia, solid: her theme, warm and whole, with the main theme answering
  chord(4680,40,[57,64,69,72,76],'pad',.42,{att:5}); add(4680,40,45,'drone',.25,0,{att:5});
  [[0,88],[1.6,91],[3.2,96],[6.4,95],[8,91],[9.6,88],[12.8,84],[16,88],[17.6,93],[19.2,96],[22.4,100]].forEach(([b,m])=>add(4684+b,3,m,'bell',.4,.1));
  th.forEach(([b,m,d])=>add(4706+b*beat*1.1,d*beat*1.15,m+12,'piano',.55,0));
  // watching the star; the vast pull-back
  ['Cmaj7','Am7','Fmaj7','G','Cmaj7','Em7','Fmaj7','Cmaj7'].forEach((c,b)=>{ const t0=4730+b*6.5; chord(t0,6.6,CH[c].map(x=>x+12),'strings',.26,{att:1.4}); add(t0,6.5,CH[c][0]-12,'bass',.36,0); });
  th.forEach(([b,m,d])=>add(4790+b*beat*1.4,d*beat*1.5,m+12,'strings',.5,0,{att:.4}));
  chord(4820,38,[36,43,48,52,55,60,64],'pad',.45,{att:6});
});

Object.assign(G.ARCHIVE_SFX_EXT,{
  chime_far:(S,c,u)=>{ for(let k=0;k<3;k++) S({t:c.t+k*10,d:.4,f:u.mtof(96),i:'bell',v:.2+k*.1,pan:.3}); },
  signal_in:(S,c,u)=>{ S({t:c.t,d:1.6,i:'noiseSweep',f0:400,f1:5000,g:.4}); [84,88,91,96].forEach((m,k)=>S({t:c.t+k*.1,d:.4,f:u.mtof(m),i:'bell',v:.4})); },
  answer_verdance:(S,c,u)=>{ S({t:c.t,d:2,i:'noiseSweep',f0:400,f1:3000,g:.3}); },
  answer_ferrum:(S,c)=>{ S({t:c.t,d:.6,i:'thump',f:80,k:6,g:.6}); S({t:c.t,d:2,i:'noiseSweep',f0:300,f1:2500,g:.3}); },
  answer_thalassa:(S,c)=>{ S({t:c.t,d:3,i:'hum',f0:110,f1:165,g:.35}); S({t:c.t,d:2,i:'noiseSweep',f0:300,f1:2000,g:.25}); },
  answer_orrery:(S,c,u)=>{ for(let k=0;k<6;k++) S({t:c.t+k*.25,d:.3,f:u.mtof([84,88,91,96,91,88][k]),i:'celesta',v:.35}); },
  seat_release:(S,c)=>{ S({t:c.t,d:.8,i:'thump',f:70,k:4,g:.8}); S({t:c.t,d:3,i:'noiseSweep',f0:2000,f1:300,g:.3}); },
  solidify:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:220,f1:330,g:.2}); S({t:c.t,d:c.d,i:'noiseSweep',f0:500,f1:4000,g:.15}); },
  touch_light:(S,c,u)=>{ [88,91,96,100].forEach((m,k)=>S({t:c.t+k*.12,d:.5,f:u.mtof(m),i:'bell',v:.4})); },
});
})(typeof window!=='undefined'?window:globalThis);
