/* CHAPTER 8 — THE COSMIC CORE (63:00–72:00)
   The Heartstar inside a failing Dyson swarm, orbital rings, a black hole bending the sky at the edge. Alicia,
   strongest here, shows ARCHIVE a memory: long ago ARCHIVE conducted the network's rhythm, and during an energy
   crisis it was Alicia who powered it down, then held everything alone. The Conductor's Seat bears ARCHIVE's
   emblem. To restore the network ARCHIVE must link itself to the Heartstar — possibly forever. It commits.
   CH08_SC01 The Heartstar (63:00–66:00) · CH08_SC02 The memory (66:00–69:00) · CH08_SC03 The Seat (69:00–72:00)
   World id 8 = the Cosmic Core (src/worlds/80_core.glsl); the memory uses the Archive hall (world 0) with a memory grade. */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
G.ARCHIVE_SFX_EXT = G.ARCHIVE_SFX_EXT || {};
const T0=3780, T1=4320, HS=[0,0,-120], SEAT=[0,0,-70];

G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,V,clamp,lerp,sstep,Track,dialogue,SCENES,DOCK} = K;
  const T=W.tr, PI=Math.PI;
  const D=(t,dur,text,emotion,scene,who='ARCHIVE')=>dialogue.push({character:who,text,start:t,end:t+dur,emotion,scene,audio:null,face:emotion});
  const AL=(t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'ALICIA'); S(t,'alicia_voice',{d:dur}); };
  const at=t=>A.tr.pos.at(t);
  const meta={CH08_SC01:'The Heartstar',CH08_SC02:'The memory',CH08_SC03:'The Seat'};
  for(const s of SCENES) if(meta[s.id]){ s.title=meta[s.id]; s.status='animated'; }

  T.core=new Track([1,.35,0,1]); T.mem=new Track(0); T.aliC=new Track([0,0,.45,0]);
  const far=[]; for(let i=0;i<14;i++){ const a=i*.4488, e=Math.sin(i*2.1)*.5; far.push(HS[0]+Math.cos(a)*Math.cos(e)*190, HS[1]+Math.sin(e)*190, HS[2]+Math.sin(a)*Math.cos(e)*190); }
  W.exts.push((t,s)=>{ if(t<T0-1||t>T1+1) return;
    s.U=Object.assign(s.U||{},{ uCore:s.core, uMem:s.mem, uAli:s.ali, uAliB:s.aliB, uAliC:s.aliC });
    if(s.world>7.5){ s.loomN=far; s.loomC=[...HS,0]; }
  });
  const faceYaw=(from,to)=>{ const d=V.sub(to,from); return Math.atan2(d[0],d[2]); };

  // ================= CH08_SC01 · The Heartstar (3780–3960) =================
  T.world.cut(T0,8); T.tunnel.cut(T0,[0,0,0,0]); T.orb.cut(T0,[0,-40,0,0]); T.orbGlow.cut(T0,0); T.holo.cut(T0,[0,0,0]); T.mirror.cut(T0,0); T.glitch.cut(T0,0);
  T.shelf.cut(T0,[-1,0,0]); T.bfly.cut(T0,0); T.ali.cut(T0,[0,-60,0,0]); T.portalOpen.cut(T0,0); T.portalFX.cut(T0,[0,0,0,0]); T.tockVis.cut(T0,0);
  T.loom.cut(T0,[.45,0,0,0]); T.loomB.cut(T0,[0,0,3,.6]);
  T.exposure.cut(T0,5); T.exposure.to(T0,4,1,'out'); T.fade.cut(T0,0); T.fade.to(T0,2,1,'inOut');
  A.tr.roll.cut(T0,0); A.tr.jitter.cut(T0,0); A.tr.power.cut(T0,1); A.tr.bob.cut(T0,1); A.tr.headYaw.cut(T0,0); A.tr.headPitch.cut(T0,0); A.tr.headTilt.cut(T0,0);
  A.place(T0,[0,5,64],PI); A.tr.thrust.cut(T0,1.2); A.flyTo(T0,6,[0,4,50],'out'); A.thrust(T0+3,2,.7);
  S(T0,'core_hum',{d:540});
  A.express(T0+1,'surprised',.6); A.lookAt(T0+4,3,HS);
  C.shot(T0,[3,4,40],[0,4,64],44); C.move(T0,8,[4,5,36],[0,4.4,56],48,'inOut');
  A.express(3790,'excited',1.4); D(3792,1.6,'Whoa\u2026','surprised','CH08_SC01'); S(3792,'voice',{pattern:'whoa'});
  C.shot(3789,[-30,24,90],[0,0,-120],50); C.move(3789,20,[-46,30,70],[0,0,-120],54,'inOut');
  // the empty space beside it
  A.tr.headYaw.to(3802,1.2,.9); A.express(3803,'sad',1); A.tr.headYaw.to(3808,1.2,0);
  D(3805,2.4,'Tock would have a rule for this.','sad','CH08_SC01'); S(3805,'voice',{pattern:'phew'});
  C.shot(3801,V.add(at(3801),[1.8,.4,-2.6]),V.add(at(3801),[0,.3,0]),34); C.move(3801,9,V.add(at(3801),[1.6,.4,-2.4]),V.add(at(3801),[0,.3,0]),32,'lin');
  // along the swarm: panels going dark, the network pouring in
  A.faceToward(3812,1,[10,6,-10]); A.path(3813,[[8,6,20],[14,10,-14],[6,12,-44],[-4,8,-58]],46,'inOut'); A.thrust(3813,1,1); S(3813.4,'whoosh',{d:8}); S(3836,'whoosh',{d:8});
  A.express(3815,'curious',1);
  C.shot(3812,[20,8,40],[6,6,-20],54); for(const t of [3820,3828,3836,3844,3852]) C.via(t,V.add(at(t),[4,2,8]),V.add(at(t+2),[0,-1,-10]));
  T.core.key(3830,[1,.35,0,1],'lin').key(3850,[.85,.5,0,1],'inOut'); S(3832,'panels_fail',{d:16});
  A.lookAt(3834,2,[20,10,-100]); A.express(3836,'analyze',.6); A.scan(3838,3.4);
  D(3846,2.6,'Everything flows in\u2026 and the panels are failing.','worried','CH08_SC01'); S(3846,'voice',{pattern:'q2'});
  // the black hole, close
  A.lookAt(3862,2,V.add(at(3862),[78,28,-56])); A.express(3862.4,'surprised',.6);
  T.core.key(3860,[.85,.5,0,1],'lin').key(3870,[.85,.5,0,1.8],'inOut').key(3884,[.85,.5,0,1],'inOut');
  C.shot(3860,V.add(at(3860),[-3,1,4]),V.add(at(3860),[78,28,-56]),58); C.move(3860,22,V.add(at(3860),[-4,1.6,6]),V.add(at(3860),[78,28,-56]),40,'inOut');
  D(3874,2,'Even the light bends here.','surprised','CH08_SC01'); S(3874,'voice',{pattern:'whoa'});
  // the Seat
  A.faceToward(3884,1.4,SEAT); A.flyTo(3886,12,V.add(SEAT,[0,1.2,7]),'inOut'); A.thrust(3886,1,.9); A.thrust(3898,1,.55);
  C.shot(3884,[10,6,-40],SEAT,48); C.move(3884,14,[7,4,-50],SEAT,44,'inOut');
  A.lookAt(3899,2,V.add(SEAT,[0,.6,-.6])); A.express(3900,'curious',.8);
  T.core.key(3900,[.85,.5,0,1],'lin').key(3908,[.85,.5,.35,1],'inOut'); S(3902,'seat_wake',{d:6});
  A.express(3910,'surprised',.4); A.activate(3908,14,1.4);
  D(3912,2.4,'That\u2019s\u2026 my emblem.','surprised','CH08_SC01'); S(3912,'voice',{pattern:'q'});
  C.shot(3898,V.add(SEAT,[2.4,1.6,10]),V.add(SEAT,[0,.6,0]),40); C.move(3898,16,V.add(SEAT,[1.6,1.4,8]),V.add(SEAT,[0,.6,0]),34,'inOut');
  C.shot(3914,V.add(SEAT,[1.2,.9,1.6]),V.add(SEAT,[0,.6,-.6]),30); C.move(3914,8,V.add(SEAT,[1,.8,1.4]),V.add(SEAT,[0,.6,-.6]),26,'lin');
  // Alicia, stronger here than anywhere
  const ALI=[3.4,.4,-66.6];
  T.ali.cut(3922,[...ALI,0]); T.aliB.cut(3922,[2.6,0,1.2,0]); T.aliC.cut(3922,[faceYaw(ALI,V.add(SEAT,[0,1.2,7])),0,.45,1]);
  T.ali.key(3924,[...ALI,0],'lin').key(3932,[...ALI,1],'inOut'); T.aliB.key(3924,[2.6,0,1.2,0],'lin').key(3932,[2.6,0,-.3,0],'inOut'); S(3924,'alicia',{d:30});
  A.lookAt(3927,1.4,V.add(ALI,[0,1,0])); A.express(3928,'surprised',.6);
  AL(3936,2.6,'You made it. Alone?','soft','CH08_SC01');
  A.express(3940,'sad',.6); D(3940.6,2.4,'Tock\u2026 the storm took Tock.','sad','CH08_SC01'); S(3940.6,'voice',{pattern:'phew'});
  AL(3945,3.2,'I\u2019m sorry. I know what it is to lose someone to the dark.','sad','CH08_SC01');
  C.shot(3924,V.add(SEAT,[-4,1.6,10]),V.add(ALI,[0,1,0]),40); C.move(3924,12,V.add(SEAT,[-3.4,1.4,9]),V.add(ALI,[0,1,0]),36,'inOut');
  C.shot(3936,V.add(ALI,[-.6,1.4,3.6]),V.add(ALI,[0,1.6,0]),30); C.move(3936,4.4,V.add(ALI,[-.6,1.4,3.4]),V.add(ALI,[0,1.6,0]),28,'lin');
  C.shot(3940.4,V.add(at(3940),[1.4,.3,-2.2]),V.add(at(3940),[0,.3,0]),32); C.move(3940.4,4.4,V.add(at(3940),[1.3,.3,-2.0]),V.add(at(3940),[0,.3,0]),30,'lin');
  C.shot(3944.8,[-5,2,-56],V.lerp(ALI,at(3945),.5),40); C.move(3944.8,15.2,[-6,2.4,-54],V.lerp(ALI,at(3945),.5),40,'lin');

  // ================= CH08_SC02 · The memory (3960–4140) =================
  AL(3962,3,'Let me show you who you were.','soft','CH08_SC02');
  T.aliB.key(3964,[2.6,0,-.3,0],'lin').key(3966,[2.6,1,-.3,0],'inOut');
  T.exposure.key(3966,1,'lin').key(3968.4,5,'in'); S(3966.2,'memory_in');
  // the memory: the Archive hall, long ago
  const M0=3968.5;
  T.world.cut(M0,0); T.mem.cut(M0,1); T.exposure.key(M0,5,'lin').key(M0+3,1,'out');
  T.orb.cut(M0,[0,1.72,0,.36]); T.orbGlow.cut(M0,.5); T.loom.cut(M0,[.9,0,0,0]); T.loomB.cut(M0,[0,0,3,.2]); T.loomC.cut(M0,[0,4.2,0,4.2]);
  T.hall.cut(M0,1); T.window.cut(M0,1);
  const ALM=[-3.6,1.2,-3.2]; T.ali.cut(M0,[...ALM,.95]); T.aliB.cut(M0,[2.3,0,-.4,0]); T.aliC.cut(M0,[faceYaw(ALM,[0,4.4,0]),0,.75,1]);
  A.place(M0,[0,4.4,0],PI*.8); A.tr.thrust.cut(M0,.8); A.tr.power.cut(M0,1); A.express(M0,'happy',.1);
  for(let k=0;k<10;k++){ const t=M0+1+k*2.4; A.arms(t,1.2,[2.2,.9,.3],[1.2,.4,.6]); A.arms(t+1.2,1.2,[1.2,.4,.6],[2.2,.9,.3]); }
  A.activate(M0,30,1.4); A.turnTo(M0+2,20,PI*1.8,'lin');
  S(M0+.4,'memory_hall',{d:26});
  C.shot(M0,[6.6,5.4,7.4],[0,3.6,0],48); C.move(M0,24,[-6,6.2,8],[0,3.8,0],50,'inOut');
  AL(3973,3.6,'You were the conductor. You kept every world in time.','warm','CH08_SC02');
  // the crisis: the lights fail, the threads fray
  const M1=M0+24;
  T.hall.key(M1,1,'lin').key(M1+.3,.3,'out').key(M1+.6,.9).key(M1+.9,.25,'out').key(M1+1.4,.8).key(M1+2,.2,'out').key(M1+6,.35);
  T.loom.key(M1,[.9,0,0,0],'lin').key(M1+4,[.9,0,0,.7],'inOut'); T.loomB.key(M1,[0,0,3,.2],'lin').key(M1+4,[.6,0,3,.2],'inOut'); S(M1,'brownout',{d:5});
  A.express(M1+.5,'worried',.5);
  AL(M1+3,3.6,'Then the energy ran low. Everything was failing at once.','sad','CH08_SC02');
  C.shot(M1,[3.4,4.6,4.4],[0,4.3,0],38); C.move(M1,8,[3.0,4.5,4.0],[0,4.3,0],36,'lin');
  // she powers ARCHIVE down
  const M2=M1+9;
  T.aliB.key(M2,[2.3,0,-.4,0],'lin').key(M2+1.4,[2.3,1,-.4,0],'inOut');
  A.faceToward(M2+1,1.4,ALM); A.flyTo(M2+2,5,V.add(DOCK,[0,.75,0]),'inOut'); A.express(M2+2,'sleepy',4); A.tr.headPitch.to(M2+5,2,-.14);
  A.thrust(M2+5,2,0); A.tr.bob.to(M2+5,2,0); A.power(M2+6,3,0); A.flyTo(M2+7,2,DOCK,'in'); S(M2+6,'power_down');
  AL(M2+2,3.4,'I powered you down to save them. I thought I could hold it alone.','sad','CH08_SC02');
  T.ali.key(M2+5,[...ALM,.95],'lin').key(M2+9,[...V.add(DOCK,[-1.4,.6,1.4]),.95],'inOut'); T.aliC.key(M2+9,[faceYaw(V.add(DOCK,[-1.4,.6,1.4]),DOCK),0,.75,1],'lin');
  C.shot(M2,[7.2,2.6,6.8],V.lerp(at(M2+5),ALM,.4),44); C.move(M2,12,[7.6,2.2,6],[3,1.2,1.2],42,'inOut');
  // years, alone
  const M3=M2+13;
  T.hall.key(M3,.35,'lin').key(M3+6,.12,'inOut'); T.loom.key(M3,[.9,0,0,.7],'lin').key(M3+8,[.4,0,0,.7],'inOut');
  T.ali.key(M3,[...V.add(DOCK,[-1.4,.6,1.4]),.95],'lin').key(M3+8,[...V.add(DOCK,[-1.4,.6,1.4]),.35],'inOut'); T.aliB.key(M3,[2.3,1,-.4,0],'lin').key(M3+3,[2.3,0,.2,0],'inOut');
  AL(M3+1,3.6,'I held it for as long as I could. Every year, a little less of me.','faint','CH08_SC02');
  C.shot(M3,[-3,6,9],[2,1,1],52); C.move(M3,10,[-4,8,11],[2,1,1],56,'inOut');
  // back to the Core
  const M4=M3+10.5;
  T.exposure.key(M4-1.6,1,'lin').key(M4,5,'in');
  T.world.cut(M4,8); T.mem.cut(M4,0); T.exposure.key(M4,5,'lin').key(M4+3,1,'out');
  T.orb.cut(M4,[0,-40,0,0]); T.orbGlow.cut(M4,0); T.loom.cut(M4,[.45,0,0,0]); T.loomB.cut(M4,[0,0,3,.6]);
  T.ali.cut(M4,[...ALI,1]); T.aliB.cut(M4,[2.6,0,-.3,0]); T.aliC.cut(M4,[faceYaw(ALI,V.add(SEAT,[0,1.2,7])),0,.45,1]);
  A.place(M4,V.add(SEAT,[0,1.2,7]),PI); A.tr.thrust.cut(M4,.6); A.tr.power.cut(M4,1); A.tr.bob.cut(M4,.6); A.tr.headPitch.cut(M4,0); A.express(M4,'sad',.1);
  C.shot(M4,V.add(SEAT,[3,1.6,12]),V.lerp(ALI,V.add(SEAT,[0,1.2,7]),.5),42); C.move(M4,8,V.add(SEAT,[2.4,1.4,11]),V.lerp(ALI,V.add(SEAT,[0,1.2,7]),.5),40,'lin');
  // the confession
  const M5=M4+4;
  AL(M5,4,'It was never meant to be held by one. Not by you. Not by me.','sad','CH08_SC02');
  A.express(M5+4.4,'thinking',.8); D(M5+6,2.4,'You were holding it alone. All this time.','sad','CH08_SC02'); S(M5+6,'voice',{pattern:'q2'});
  T.aliB.key(M5+8,[2.6,0,-.3,0],'lin').key(M5+9,[2.6,0,.25,0],'inOut').key(M5+10.4,[2.6,0,-.2,0],'inOut');
  AL(M5+9,2.6,'And I\u2019m almost out of time.','faint','CH08_SC02'); S(M5+9.2,'glitch',{d:.8});
  C.shot(M5,V.add(ALI,[-.6,1.4,3.6]),V.add(ALI,[0,1.6,0]),30); C.move(M5,6,V.add(ALI,[-.6,1.4,3.4]),V.add(ALI,[0,1.6,0]),28,'lin');
  C.shot(M5+6,V.add(at(M5+6),[1.4,.3,-2.2]),V.add(at(M5+6),[0,.3,0]),32); C.move(M5+6,3,V.add(at(M5+6),[1.3,.3,-2]),V.add(at(M5+6),[0,.3,0]),30,'lin');
  C.shot(M5+9,V.add(ALI,[-1.2,1.2,4.6]),V.add(ALI,[0,1.4,0]),32); C.move(M5+9,8,V.add(ALI,[-1,1.2,4.2]),V.add(ALI,[0,1.4,0]),30,'lin');
  C.shot(M5+17,[-6,3,-52],V.lerp(ALI,V.add(SEAT,[0,1.2,7]),.5),44); C.move(M5+17,4140-(M5+17),[-7,3.4,-50],V.lerp(ALI,V.add(SEAT,[0,1.2,7]),.5),44,'lin');
  A.express(M5+18,'determined',3);

  // ================= CH08_SC03 · The Seat (4140–4320) =================
  AL(4140,4,'The Seat links a conductor to the Heartstar. It could hold the rhythm again.','serious','CH08_SC03');
  AL(4145,3.6,'But if you take it\u2026 you may never leave it.','sad','CH08_SC03');
  A.lookAt(4140,1.4,V.add(SEAT,[0,.6,-.6])); A.express(4146,'worried',1);
  C.shot(4140,V.add(SEAT,[1.4,1,2]),V.add(SEAT,[0,.6,-.6]),32); C.move(4140,9,V.add(SEAT,[1.2,.9,1.8]),V.add(SEAT,[0,.6,-.6]),28,'lin');
  // remembering the worlds it met
  T.portal.cut(4152,[...V.add(SEAT,[-3,2.6,4]),1.2]); T.portalFX.cut(4152,[0,0,1,0]);
  T.portalOpen.key(4152,0,'lin').key(4154,1,'out').key(4158,1,'lin').key(4159,0,'in');
  T.portalFX.key(4158.9,[0,0,1,0],'lin').key(4159,[0,0,3.9,0],'cut');
  T.portalOpen.key(4159.2,0,'lin').key(4161,1,'out').key(4165,1,'lin').key(4166,0,'in');
  T.portalFX.key(4165.9,[0,0,3.9,0],'lin').key(4166,[0,0,2.9,0],'cut');
  T.portalOpen.key(4166.2,0,'lin').key(4168,1,'out').key(4172,1,'lin').key(4173,0,'in');
  A.lookAt(4152,1,V.add(SEAT,[-3,2.6,4])); A.express(4153,'happy',1);
  D(4155,2.2,'Verdance\u2026 Thalassa\u2026 Ferrum\u2026','happy','CH08_SC03'); S(4155,'voice',{pattern:'q'});
  C.shot(4151.6,V.add(SEAT,[3,1.8,12]),V.add(SEAT,[-1.4,2,5]),40); C.move(4151.6,22,V.add(SEAT,[2.4,1.6,11]),V.add(SEAT,[-1.4,2,5]),38,'lin');
  A.express(4174,'thinking',1); D(4176,3,'Tock would say: deliver the visitor safely.','soft','CH08_SC03'); S(4176,'voice',{pattern:'q2'});
  D(4181,2.4,'All of them are my visitors.','determined','CH08_SC03'); S(4181,'voice',{pattern:'hi'});
  C.shot(4174,V.add(at(4174),[1.3,.3,-2.1]),V.add(at(4174),[0,.3,0]),30); C.move(4174,12,V.add(at(4174),[1.2,.3,-1.95]),V.add(at(4174),[0,.3,0]),28,'lin');
  // the commitment
  A.express(4187,'determined',.6); A.activate(4187,40,2); A.power(4187,1.4,1.25); S(4187.2,'resolve',{d:3});
  D(4189,2.8,'Then I\u2019ll hold it. As long as it takes.','determined','CH08_SC03'); S(4189,'voice',{pattern:'hi'});
  T.aliB.key(4192,[2.6,0,-.3,0],'lin').key(4193,[2.6,.6,-.3,.4],'inOut');
  AL(4193,2,'ARCHIVE\u2026','sad','CH08_SC03');
  C.shot(4186,V.add(at(4186),[1.6,.6,-3.2]),V.add(at(4186),[0,.3,0]),36); C.move(4186,6,V.add(at(4186),[1.4,.5,-2.8]),V.add(at(4186),[0,.3,0]),32,'lin');
  C.shot(4192,V.add(ALI,[-.4,1.4,3.4]),V.add(ALI,[0,1.6,0]),30); C.move(4192,4,V.add(ALI,[-.4,1.4,3.2]),V.add(ALI,[0,1.6,0]),28,'lin');
  // to the Seat
  A.faceToward(4198,1.2,SEAT); A.flyTo(4199,10,V.add(SEAT,[0,.9,.6]),'inOut'); A.thrust(4199,1,.6); S(4199.2,'whoosh',{d:8,soft:1});
  A.turnTo(4207,3,0); A.tr.bob.to(4206,2,.2);
  T.core.key(4206,[.85,.5,.35,1],'lin').key(4214,[.85,.5,1,1],'inOut'); S(4208,'seat_wake',{d:8});
  C.shot(4198,V.add(SEAT,[6,2,9]),V.add(SEAT,[0,1,0]),44); C.move(4198,14,V.add(SEAT,[4,1.6,7]),V.add(SEAT,[0,1,0]),40,'inOut');
  A.express(4214,'determined',1); D(4218,1.6,'I\u2019m ready.','determined','CH08_SC03'); S(4218,'voice',{pattern:'hi'});
  T.aliC.key(4214,[faceYaw(ALI,V.add(SEAT,[0,.9,.6])),0,.45,1],'inOut');
  C.shot(4212,V.add(SEAT,[0,1.2,4.2]),V.add(SEAT,[0,1.1,.6]),36); C.move(4212,12,V.add(SEAT,[0,1.1,3.2]),V.add(SEAT,[0,1.1,.6]),30,'lin');
  // the threads of every world rush in; the star answers
  T.loom.key(4224,[.45,0,0,0],'lin').key(4236,[1,0,0,0],'inOut'); T.loomB.key(4224,[0,0,3,.6],'lin').key(4236,[0,0,3,1.4],'inOut'); S(4224,'link_start',{d:20});
  T.core.key(4224,[.85,.5,1,1],'lin').key(4244,[1.4,.5,1.6,1],'in');
  A.power(4226,4,1.6); A.tr.jitter.key(4232,0,'lin').key(4240,.4).key(4246,.6);
  C.shot(4224,[24,10,-30],V.add(SEAT,[0,1,0]),52); C.move(4224,22,[40,18,-10],V.lerp(SEAT,HS,.4),60,'inOut');
  T.exposure.key(4246,1,'lin').key(4252,9,'in'); S(4246.4,'flash');
  T.ali.key(4246,[...ALI,1],'lin').key(4252,[...ALI,0],'in');
  // black, and a single heartbeat of light
  T.fade.key(4254,1,'lin').key(4258,0,'inOut');
  T.exposure.key(4258,9,'lin').key(4259,1,'cut');
  S(4290,'heartbeat');
});

// =================== score for 63:00–72:00 ===================
G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,CH,beat,bar,theme}=K, e8=beat/2;
  // the Heartstar: grand, slow, golden
  add(3780,140,24,'drone',.5,0,{att:8}); chord(3786,30,[36,43,48,52,55,59],'pad',.42,{att:8});
  theme.forEach(([b,m,d])=>add(3792+b*beat*1.6,d*beat*1.7,m,'brass',.45,0));
  chord(3816,32,[41,48,53,57,60,64],'strings',.3,{att:6});
  for(let k=0;k<30;k++) add(3820+k*1.4,.6,[84,88,91,95,91,88][k%6],'celesta',.2,Math.sin(k)*.6);
  chord(3858,26,[37,44,49,52],'pad',.36,{att:4}); add(3870,1,29,'timp',.9,0);
  chord(3900,20,[45,52,57,60,64],'strings',.3,{att:3}); [[3912,76],[3913,79],[3914,86]].forEach(([t,m])=>add(t,2,m,'bell',.45,0));
  // Alicia here: her theme, fuller
  chord(3924,36,[57,64,69,72,76],'pad',.42,{att:6});
  [[0,88],[1.6,91],[3.2,96],[6.4,95],[8,91],[9.6,88],[12.8,84],[16,88],[17.6,93],[19.2,96],[24,95],[26,91],[28,88]].forEach(([b,m])=>add(3928+b,3,m,'bell',.38,.1));
  // the memory: the theme on a music box, nostalgic, then broken
  const mb=[[0,76],[1,79],[2,86],[4,84],[5,83],[5.5,81],[6,79],[8,76],[9,79],[10,81],[11,83],[12,84],[13.5,86],[14,88]];
  mb.forEach(([b,m])=>add(3969+b*beat*1.15,beat*1.2,m,'celesta',.48,0));
  chord(3969,22,[48,55,60,64,67],'pad',.3,{att:3});
  chord(3992.5,8,[44,47,51,56],'strings',.32,{att:1}); add(3992.5,1,31,'timp',.9,0);
  [[4002,'Am7'],[4007,'Fmaj7'],[4012,'Dm9'],[4017,'Am7']].forEach(([t,c])=>CH[c].forEach((m,k)=>add(t+k*.3,4.4,m+12,'piano',.3,k*.15-.2)));
  // the confession and "almost out of time"
  chord(4028,24,[45,52,57,60],'strings',.3,{att:4}); [[4031,72],[4033,71],[4035,69],[4041,67],[4043,64]].forEach(([t,m])=>add(t,2.6,m,'piano',.4,0));
  chord(4052,40,[41,48,53,57],'pad',.28,{att:6}); add(4070,40,29,'drone',.35,0,{att:5});
  // the Seat: the worlds remembered, then resolve
  chord(4140,12,[45,52,57,60,64],'strings',.28,{att:3});
  [[4152,[76,79,84]],[4159,[72,76,79]],[4166,[69,72,76]]].forEach(([t,ms])=>ms.forEach((m,k)=>add(t+k*.3,2.4,m,'bell',.36,.2)));
  chord(4174,12,[48,55,60,64],'pad',.32,{att:3});
  theme.forEach(([b,m,d])=>{ add(4187+b*beat,d*beat,m+12,'strings',.5,0,{att:.2}); add(4187+b*beat,d*beat,m,'brass',.4,0); });
  ['Am7','Fmaj7','Cmaj7','G','Am7','Fmaj7','Dm9','Gsus','Cmaj7','Cmaj7'].forEach((c,b)=>{ const t0=4198+b*4.8; chord(t0,4.9,CH[c].map(x=>x+12),'strings',.24+b*.03,{att:.8}); add(t0,4.8,CH[c][0]-12,'bass',.45,0); });
  add(4224,22,24,'drone',.55,0,{att:2}); for(let k=0;k<22;k++) add(4224+k*1,.6,36,'timp',.2+k*.04,0);
  chord(4246,8,[36,43,48,52,55,60,64],'brass',.55,{}); add(4246,1,24,'timp',1.3,0);
  [84,88,91,96].forEach((m,k)=>add(4290+k*.2,4,m,'bell',.3,0));
});

Object.assign(G.ARCHIVE_SFX_EXT,{
  core_hum:(S,c)=>{ for(let k=0;k<c.d;k+=5) S({t:c.t+k,d:5.6,i:'hum',f0:41,f1:43,g:.2}); },
  panels_fail:(S,c)=>{ for(let k=0;k<c.d;k+=1.4) S({t:c.t+k,d:.5,i:'chirp',f0:900,f1:200,g:.16}); },
  seat_wake:(S,c,u)=>{ S({t:c.t,d:c.d,i:'hum',f0:110,f1:220,g:.35}); [72,76,79].forEach((m,k)=>S({t:c.t+k*.6,d:.4,f:u.mtof(m),i:'bell',v:.35})); },
  memory_in:(S,c)=>{ S({t:c.t,d:2.6,i:'noiseSweep',f0:6000,f1:400,g:.4}); },
  memory_hall:(S,c,u)=>{ for(let k=0;k<c.d;k+=2.4) S({t:c.t+k,d:.3,f:u.mtof([76,79,86][Math.floor(k/2.4)%3]),i:'bell',v:.18}); },
  link_start:(S,c)=>{ S({t:c.t,d:c.d,i:'noiseSweep',f0:100,f1:6000,g:.55}); S({t:c.t,d:c.d,i:'hum',f0:40,f1:160,g:.6}); },
  heartbeat:(S,c)=>{ S({t:c.t,d:.6,i:'thump',f:45,k:3,g:.9}); S({t:c.t+.45,d:.6,i:'thump',f:42,k:3,g:.7}); },
});
})(typeof window!=='undefined'?window:globalThis);
