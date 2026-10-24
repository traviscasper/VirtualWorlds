/* CHAPTER 7 — THE LOST WORLDS (54:00–63:00)
   Beyond the edge of the map: fragments of broken worlds adrift in an energy storm. Two failing worlds hang
   on by flickering threads; ARCHIVE can hold only one. Tock takes the other — and the storm sweeps Tock away.
   ARCHIVE goes on alone, harder and more determined, until the storm parts on the golden gate of the Core.
   CH07_SC01 Shattered (54:00–57:00) · CH07_SC02 The choice (57:00–60:00) · CH07_SC03 Alone (60:00–63:00)
   World id 7 = the Lost Worlds (src/worlds/70_lost.glsl). */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
G.ARCHIVE_SFX_EXT = G.ARCHIVE_SFX_EXT || {};
const T0=3240, T1=3780, PA=[-14,2,-150], PB=[16,-3,-160], GATE=[0,22,-560];

G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,V,clamp,lerp,sstep,Track,dialogue,SCENES} = K;
  const T=W.tr, PI=Math.PI;
  const D=(t,dur,text,emotion,scene,who='ARCHIVE')=>dialogue.push({character:who,text,start:t,end:t+dur,emotion,scene,audio:null,face:emotion});
  const TK=(t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'TOCK'); S(t,'tock_voice',{n:Math.max(2,Math.round(text.length/4))}); };
  const AL=(t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'ALICIA'); S(t,'alicia_voice',{d:dur}); };
  const at=t=>A.tr.pos.at(t);
  const meta={CH07_SC01:'Shattered',CH07_SC02:'The choice',CH07_SC03:'Alone'};
  for(const s of SCENES) if(meta[s.id]){ s.title=meta[s.id]; s.status='animated'; }

  // ---------- storm and thread state ----------
  T.lost=new Track([0,0,0,0]); T.lostB=new Track([0,.2,1,1]); T.thr=new Track([0,0,0,0]);
  const bolts=[]; // [time, from, to]
  const bolt=(t,a,b)=>{ bolts.push([t,a,b]); S(t,'thunder',{near:V.len(V.sub(a,at(t)))<30?1:0}); };
  const handR=t=>V.add(at(t),[.45,-.05,-.35]), handL=t=>V.add(at(t),[-.45,-.05,-.35]);
  let thrBsrc=null;
  W.exts.push((t,s)=>{ if(t<T0-1||t>T1+1) return;
    let fl=0, b0=[0,-50,0], b1=[0,-50,0], bi=0, seed=0;
    for(const [bt,a,b] of bolts){ const u=t-bt; if(u>=0&&u<.45){ const k=Math.exp(-u*9)*(u<.05?u/.05:1); if(k>bi){ bi=k; b0=a; b1=b; seed=bt; } } }
    for(const [bt] of bolts){ const u=t-bt; if(u>=0&&u<.6) fl=Math.max(fl,Math.exp(-u*7)); }
    const ambient = .08*Math.max(0,Math.sin(t*1.7)*Math.sin(t*.63+1)) ;
    s.U=Object.assign(s.U||{},{ uLost:[Math.max(fl*s.lost[0],ambient*s.lost[0]),seed,bi*s.lost[0],s.lost[3]], uLostB:s.lostB, uThr:s.thr,
      uThrA:handR(t), uThrB:thrBsrc?thrBsrc(t):handL(t), uBolt0:b0, uBolt1:b1, uAli:s.ali, uAliB:s.aliB });
  });

  // ================= CH07_SC01 · Shattered (3240–3420) =================
  T.world.cut(T0,7); T.tunnel.cut(T0,[0,0,0,0]); T.loom.cut(T0,[0,0,0,0]); T.loomB.cut(T0,[0,0,3,0]); T.orb.cut(T0,[0,-40,0,0]); T.orbGlow.cut(T0,0);
  T.holo.cut(T0,[0,0,0]); T.mirror.cut(T0,0); T.glitch.cut(T0,0); T.shelf.cut(T0,[-1,0,0]); T.bfly.cut(T0,0); T.ali.cut(T0,[0,-60,0,0]);
  T.portalOpen.cut(T0,0); T.portalFX.cut(T0,[0,0,0,0]);
  T.exposure.cut(T0,.2); T.exposure.to(T0,6,1,'inOut'); T.fade.cut(T0,0); T.fade.to(T0,4,1,'inOut');
  T.lost.cut(T0,[1,0,0,0]);
  T.tockVis.cut(T0,1); T.tockEye.cut(T0,[1,0,0,0]);
  A.tr.roll.cut(T0,0); A.tr.jitter.cut(T0,0); A.tr.power.cut(T0,1); A.tr.bob.cut(T0,1); A.tr.headYaw.cut(T0,0); A.tr.headPitch.cut(T0,0); A.tr.headTilt.cut(T0,0);
  A.place(T0,[0,1,6],PI); A.tr.thrust.cut(T0,.9); A.flyTo(T0,8,[0,1,-4],'inOut'); A.thrust(T0+4,2,.7);
  T.tockPos.cut(T0,[1,1.6,6.6]); for(let tt=T0;tt<=T0+9;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[1,.6,1]),'lin'); T.tockYaw.cut(T0,PI);
  S(T0,'storm',{d:540});
  A.express(T0+2,'worried',1); A.lookAt(T0+5,2,[-20,6,-40]); A.lookAt(T0+8,2,[20,-4,-40]);
  C.shot(T0,[3,2.4,-6],[0,1,4],46); C.move(T0,12,[4,2.8,-9],[0,1.2,0],50,'inOut');
  D(3253,1.6,'Where\u2026 are we?','worried','CH07_SC01'); S(3253,'voice',{pattern:'q'});
  T.tockEye.key(3256,[1,0,0,0],'lin').key(3257,[.8,0,-.2,0]); TK(3257,2,'Off every map.','worried','CH07_SC01');
  bolt(3261,[40,40,-120],[30,-10,-110]);
  C.shot(3260,[-8,3,8],[10,4,-60],56); C.move(3260,14,[-10,4,12],[10,4,-70],60,'inOut');
  A.express(3263,'sad',1); D(3266,2.4,'These were worlds. Pieces of worlds.','sad','CH07_SC01'); S(3266,'voice',{pattern:'phew'});
  // through the debris field
  A.faceToward(3274,1,[0,1,-30]); A.path(3275,[[2,2,-22],[-2.5,.4,-44],[1.5,1.6,-66],[-1,1,-88],[0,1.2,-106]],40,'inOut'); A.thrust(3275,1,1); S(3275.4,'whoosh',{d:6}); S(3292,'whoosh',{d:6});
  for(let tt=3275;tt<=3316;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[1,.6,1]),'lin');
  A.express(3277,'determined',1);
  C.shot(3274,[5,3,-8],[0,1,-24],52); for(const t of [3281,3288,3295,3302,3309]) C.via(t,V.add(at(t),[3,1.4,6]),V.add(at(t+1.5),[0,0,-6]));
  bolt(3284,[-30,30,-70],[-22,-6,-64]); bolt(3298.4,[18,26,-96],[8,2,-90]); A.tr.jitter.key(3298.5,0,'lin').key(3298.7,.45).key(3299.8,0); A.express(3298.6,'surprised',.15);
  A.arms(3299,.3,[1.6,.8,.2],[1.6,.8,.2],'out'); A.rest(3301,.6); A.express(3301,'worried',.6);
  TK(3300,1.2,'Too close!','panic','CH07_SC01');
  // two worlds ahead, both failing
  T.thr.key(3312,[0,0,0,0],'lin'); A.flyTo(3316,6,[0,1,-126],'inOut'); A.thrust(3316,1,.6); A.faceToward(3317,2,[0,0,-155]);
  T.tockPos.key(3322,[1.3,1.7,-125.4],'inOut');
  A.lookAt(3323,1.6,PA); A.lookAt(3327,1.6,PB); A.express(3324,'analyze',.6); A.scan(3329,3.4);
  T.lostB.key(3322,[0,.2,1,1],'lin').key(3340,[.06,.6,.8,.7],'inOut'); S(3330,'crack',{d:10});
  D(3334,2.4,'They\u2019re coming loose\u2026 both of them.','worried','CH07_SC01'); S(3334,'voice',{pattern:'q2'});
  C.shot(3316,[4,3,-112],[0,0,-155],58); C.move(3316,18,[2,4,-114],[0,0,-158],60,'inOut');
  C.shot(3334,V.add(at(3334),[1.6,.4,-2.4]),V.add(at(3334),[0,.3,0]),34); C.move(3334,8,V.add(at(3334),[1.5,.4,-2.2]),V.add(at(3334),[0,.3,0]),32,'lin');
  // the threads appear, thin and flickering
  T.thr.key(3342,[0,0,0,0],'lin').key(3348,[.5,.5,1,1],'inOut'); S(3342,'loom_unfold',{d:6});
  T.lost.key(3348,[1,0,0,0],'lin'); bolt(3352,[0,40,-140],[2,6,-150]); bolt(3363,[30,30,-150],[20,2,-158]);
  A.express(3350,'determined',.6); TK(3356,2,'Their threads are snapping!','panic','CH07_SC01');
  C.shot(3342,[0,6,-112],[0,0,-155],62); C.move(3342,22,[0,8,-108],[0,0,-155],64,'inOut');
  T.lostB.key(3364,[.06,.6,.8,.7],'lin').key(3380,[.12,.8,.6,.5],'inOut');
  A.flyTo(3368,8,[0,1,-130],'inOut'); A.thrust(3368,1,.7); A.express(3376,'determined',1);
  C.shot(3366,V.add(at(3368),[3,1.6,5]),V.lerp(at(3368),PA,.4),48); C.move(3366,20,V.add(at(3368),[4,2,6]),V.lerp(at(3368),PB,.4),50,'inOut');
  D(3388,2.2,'Hold on. I\u2019ve got you.','determined','CH07_SC01'); S(3388,'voice',{pattern:'hi'});
  C.shot(3386,V.add([0,1,-130],[1.6,.4,2.4]),[0,1.2,-130],36); C.move(3386,34,V.add([0,1,-130],[1.8,.6,3]),[0,1.2,-131],38,'lin');
  A.tr.bob.to(3392,2,.5); A.express(3400,'thinking',1);

  // ================= CH07_SC02 · The choice (3420–3600) =================
  // ARCHIVE grabs thread A
  A.faceToward(3420,1,PA); A.reach(3421,.6); S(3421.6,'grab'); A.activate(3421,40,1.6);
  T.thr.key(3421.6,[.5,.5,1,1],'lin').key(3423,[1.2,.5,0,1],'out'); T.lostB.key(3423,[.12,.8,.6,.5],'lin').key(3430,[.12,.35,1,.5],'inOut');
  A.express(3423,'determined',.4); A.power(3423,1,1.2);
  C.shot(3420,V.add(at(3420),[2.6,.8,3.6]),V.lerp(at(3420),PA,.3),46); C.move(3420,14,V.add(at(3420),[3,1,4.4]),V.lerp(at(3420),PA,.35),48,'lin');
  // B is breaking. ARCHIVE reaches with the other hand, too far
  T.lostB.key(3432,[.12,.35,1,.5],'lin').key(3446,[.35,.35,1,.3],'in'); S(3433,'crack',{d:12});
  A.tr.headYaw.to(3434,.8,-.9); A.express(3434.4,'worried',.3);
  A.arms(3437,1.4,null,[1.5,-.35,.05]); A.tr.jitter.key(3437,0,'lin').key(3440,.35).key(3452,.55).key(3454,0);
  A.flyTo(3437,6,[3.4,.6,-131],'inOut');
  T.thr.key(3440,[1.2,.5,0,1],'lin').key(3446,[1.2,.8,.4,1],'inOut');
  T.lostB.key(3446,[.35,.35,1,.3],'lin').key(3452,[.38,.6,.7,.3],'inOut');
  TK(3444,1.8,'ARCHIVE, you can\u2019t hold both!','panic','CH07_SC02');
  A.express(3448,'frustrated',.4); D(3449,2,'I have to\u2014!','frustrated','CH07_SC02'); S(3449,'voice',{pattern:'eep'});
  T.thr.key(3450,[1.2,.8,.4,1],'lin').key(3454,[.75,.6,1,1],'in'); S(3452,'strain',{d:6});
  C.shot(3434,[0,3,-118],V.add(at(3440),[0,0,-14]),56); C.move(3434,20,[2,4,-116],V.add(at(3446),[0,0,-14]),58,'inOut');
  C.shot(3446,V.add(at(3446),[1.4,.3,-2.2]),V.add(at(3446),[0,.3,0]),32); C.move(3446,8,V.add(at(3446),[1.3,.3,-2.0]),V.add(at(3446),[0,.3,0]),30,'lin');
  // the choice. Tock takes the other thread.
  A.express(3456,'sad',.6); A.tr.headYaw.to(3456,1,0);
  T.tockEye.key(3458,[1,0,0,0],'lin').key(3459,[1.25,0,0,0]); TK(3459.4,1.6,'I\u2019ll take that one!','determined','CH07_SC02');
  const tockB=V.add(PB,V.mul(V.norm(V.sub([3.4,.6,-131],PB)),RBplus(6.5,4.5)));
  function RBplus(r,m){ return r+m; }
  T.tockPos.key(3460,V.add(at(3460),[1.2,.6,.8]),'lin').key(3466,tockB,'inOut'); S(3460.2,'whoosh',{d:4,soft:1});
  thrBsrc=t=> t<3466 ? handL(t) : V.add(T.tockPos.at(t),[0,-.3,0]);
  A.arms(3465.6,.8,null,[.25,.35,.5]); A.flyTo(3464,4,[0,1,-130],'inOut');
  T.thr.key(3466,[.75,.6,1,1],'lin').key(3468,[1.2,1,0,.3],'out'); T.lostB.key(3466,[.38,.6,.7,.3],'lin').key(3474,[.32,.3,1,.6],'inOut'); S(3466.2,'grab');
  A.express(3468,'relieved',.6); D(3469,1.4,'Tock!','surprised','CH07_SC02'); S(3469,'voice',{pattern:'eep'});
  TK(3471.4,2.6,'Courier rule one: deliver the visitor safely!','determined','CH07_SC02');
  C.shot(3459,V.lerp(at(3459),PB,.3),V.lerp(at(3459),PB,.75),50); C.move(3459,10,V.add(tockB,[-4,2,8]),tockB,44,'inOut');
  C.shot(3469,[0,3,-114],[6,0,-150],58); C.move(3469,12,[2,3.4,-116],[6,0,-152],58,'lin');
  // the storm surges
  T.lost.key(3482,[1,0,0,0],'lin').key(3486,[1.8,0,0,0],'in');
  bolt(3484,[30,40,-150],[18,-2,-158]); bolt(3486.6,[-10,40,-140],[8,0,-152]); bolt(3489,[24,30,-170],tockB);
  S(3482,'surge',{d:12});
  A.express(3484,'worried',.3); A.tr.jitter.key(3484,0,'lin').key(3485,.4).key(3496,.5).key(3498,0);
  TK(3490,1,'ARCHIVE\u2014!','panic','CH07_SC02');
  const swept=[ [3489.2,tockB], [3491,V.add(tockB,[6,4,-8])], [3493,V.add(tockB,[16,10,-30])], [3495,V.add(tockB,[30,18,-70])] ];
  swept.forEach(([t,p],i)=>T.tockPos.key(t,p,i?'in':'lin'));
  T.tockEye.key(3489.2,[1.25,0,0,0],'lin').key(3489.6,[1.35,0,0,0]);
  T.thr.key(3489.2,[1.2,1,0,.3],'lin').key(3491,[1.2,.3,0,1],'out').key(3492.6,[1.2,0,0,1],'in'); S(3491.4,'thread_snap');
  T.tockVis.key(3495,1,'lin').key(3495.2,0,'cut');
  T.lostB.key(3489,[.32,.3,1,.6],'lin').key(3500,[.55,.3,1,.2],'in');
  A.express(3491,'surprised',.15); A.arms(3491.2,.4,null,[1.5,-.35,.05]);
  D(3492.4,1.6,'TOCK!','sad','CH07_SC02'); S(3492.4,'voice',{pattern:'eep'});
  C.shot(3482,[0,4,-110],[8,0,-152],62); C.tr.shake.key(3482,0,'lin').key(3486,1.4).key(3498,.4).key(3502,0); C.move(3482,10,[-2,5,-112],[10,2,-156],62,'lin');
  C.shot(3492,V.add(tockB,[-6,2,10]),V.add(tockB,[20,10,-40]),50); C.move(3492,4,V.add(tockB,[-5,2.4,8]),V.add(tockB,[28,16,-66]),46,'in');
  // silence
  T.lost.key(3500,[1.8,0,0,0],'lin').key(3508,[.6,0,0,0],'out');
  A.rest(3497,1); A.express(3498,'sad',1.2); A.tr.headPitch.to(3500,2,.25); A.tr.bob.to(3500,3,.3); A.thrust(3500,3,.4);
  C.shot(3497,V.add([0,1,-130],[1.4,.5,-2.6]),[0,1.2,-130],34); C.move(3497,22,V.add([0,1,-130],[1.2,.6,-2.3]),[0,1.15,-130],30,'lin');
  // B, without its thread, cracks apart; A holds in ARCHIVE's hand
  T.lostB.key(3512,[.55,.3,1,.2],'lin').key(3540,[1,.3,1,0],'inOut'); S(3512,'breakup',{d:20});
  A.tr.headPitch.to(3518,1.4,0); A.lookAt(3519,1.6,PB);
  C.shot(3519,[-6,3,-122],[12,-3,-160],52); C.move(3519,22,[-8,4,-120],[14,-4,-164],54,'inOut');
  A.express(3530,'sad',1);
  D(3544,2.8,'I couldn\u2019t hold them both.','sad','CH07_SC02'); S(3544,'voice',{pattern:'phew'});
  C.shot(3541,V.add([0,1,-130],[1.6,.4,-2.4]),[0,1.15,-130],32); C.move(3541,24,V.add([0,1,-130],[1.4,.35,-2.2]),[0,1.15,-130],30,'lin');
  // A steadies and reconnects
  T.thr.key(3560,[1.2,0,0,1],'lin').key(3572,[1.5,0,0,1],'inOut'); T.lostB.key(3560,[1,.3,1,0],'lin').key(3576,[1,0,1.4,0],'inOut'); S(3562,'restore',{d:12});
  A.lookAt(3562,2,PA); A.express(3568,'relieved',1.4);
  C.shot(3565,[-4,3,-118],[-12,2,-148],50); C.move(3565,35,[-6,5,-116],[-14,2,-150],52,'inOut');
  T.thr.key(3586,[1.5,0,0,1],'lin').key(3592,[.9,0,0,1],'inOut').key(3596,[0,0,0,1],'in'); S(3594,'node_open');
  A.arms(3590,1,[.25,.35,.5],[.25,.35,.5]);

  // ================= CH07_SC03 · Alone (3600–3780) =================
  A.express(3600,'sad',1.4); A.lookAt(3602,2,[40,30,-240]); A.tr.bob.to(3602,2,.4);
  C.shot(3600,[2.4,.8,-126],[20,10,-200],46); C.move(3600,20,[3,1.2,-124],[24,12,-210],48,'lin');
  D(3612,2.2,'You said rule one\u2026','sad','CH07_SC03'); S(3612,'voice',{pattern:'phew'});
  // determination
  A.express(3624,'determined',2); A.activate(3624,20,1.8); A.power(3626,1.4,1.2); S(3626,'resolve',{d:3});
  D(3630,2.6,'I\u2019ll find you. After I fix this.','determined','CH07_SC03'); S(3630,'voice',{pattern:'hi'});
  C.shot(3622,V.add([0,1,-130],[1.3,.3,-2.1]),[0,1.2,-130],30); C.move(3622,14,V.add([0,1,-130],[1.2,.3,-2.0]),[0,1.2,-130],28,'lin');
  // the storm parts on the gate of the Core
  T.lost.key(3638,[.6,0,0,0],'lin').key(3652,[.25,0,0,1],'inOut'); S(3640,'gate_reveal',{d:14});
  T.portal.cut(3638,[...GATE,37.5]); T.portalFX.cut(3638,[0,1,0,1]); T.portalOpen.key(3640,0,'lin').key(3656,1,'inOut');
  AL(3646,3,'\u2026ARCHIVE\u2026 the Core\u2026 it\u2019s close\u2026','faint','CH07_SC03');
  A.faceToward(3640,2,GATE); A.lookAt(3642,2,GATE); A.express(3648,'surprised',.6);
  C.shot(3638,[0,2,-118],GATE,40); C.move(3638,22,[0,4,-110],V.add(GATE,[0,-6,0]),36,'inOut');
  // the long flight, alone
  A.path(3662,[[0,3,-170],[0,8,-260],[0,14,-360],[0,18,-450]],70,'inOut'); A.thrust(3662,1,1.1);
  A.express(3664,'determined',1); S(3662.4,'whoosh',{d:8}); S(3690,'whoosh',{d:8}); S(3715,'whoosh',{d:8});
  C.shot(3662,[6,3,-140],[0,4,-200],50); for(const t of [3672,3684,3696,3708,3720]) C.via(t,V.add(at(t),[3.4,1.6,7]),V.add(at(t+2),[0,1,-10]));
  C.shot(3732,V.add(at(3740),[10,-4,30]),GATE,46); C.move(3732,42,V.add(at(3740),[16,-8,60]),GATE,40,'inOut');
  T.lost.key(3732,[.25,0,0,1],'lin').key(3770,[.15,0,0,1.6],'inOut');
  T.fade.key(3772,1,'lin').key(3779.9,0,'inOut');
});

// =================== score for 54:00–63:00 ===================
G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,CH,beat,bar,theme}=K, e8=beat/2;
  // shattered: low, dark, storm-driven
  add(3240,180,29,'drone',.55,0,{att:6}); add(3240,180,36,'drone',.3,0,{att:8});
  chord(3246,24,[41,44,48,51],'pad',.32,{att:6}); chord(3270,40,[38,41,45,48],'strings',.26,{att:5});
  for(let k=0;k<40;k++) add(3275+k*1,.3,[50,53,49,53][k%4],'pluck',.28,(k%2?.4:-.4));
  theme.slice(0,7).forEach(([b,m,d])=>add(3266+b*beat*1.6,d*beat*1.6,m+12-3,'piano',.4,0));
  chord(3320,40,[45,48,52,55],'strings',.3,{att:4}); add(3342,1,33,'timp',1,0);
  // the choice: strain, rising, the snap
  for(let k=0;k<30;k++){ const t=3420+k*1.1; add(t,.9,[45,47,48,50][k%4]+(k>15?12:0),'strings',.2+k*.008,0,{att:.2}); }
  chord(3421.6,10,[45,52,57,60],'brass',.36,{}); add(3459.4,1,36,'timp',1,0); chord(3466,8,[48,55,60,64],'strings',.34,{att:.5});
  chord(3482,12,[37,44,49,52,56],'brass',.45,{}); for(let k=0;k<16;k++) add(3482+k*.5,.4,36,'timp',.3+k*.04,0);
  add(3491.4,1.2,31,'timp',1.3,0);
  // silence after Tock: solo piano, the theme broken
  [[3500,64],[3502,67],[3504.5,74],[3510,72],[3512,71],[3514.5,69]].forEach(([t,m])=>add(t,3,m,'piano',.45,0));
  chord(3512,28,[40,47,52,55],'pad',.3,{att:4}); add(3544,1,28,'timp',.6,0);
  chord(3560,20,[48,55,60,64],'strings',.26,{att:5});
  // alone → determination: the theme in low brass, slow, then rising strings
  [[3600,'Am7'],[3610,'Fmaj7'],[3620,'Dm9']].forEach(([t,c])=>chord(t,10.4,CH[c],'pad',.3,{att:3}));
  theme.forEach(([b,m,d])=>add(3626+b*beat*1.3,d*beat*1.3,m-12,'brass',.42,0));
  chord(3638,16,[45,52,57,61,64],'strings',.32,{att:4}); add(3652,1,33,'timp',1.1,0);
  ['Am7','Fmaj7','Cmaj7','G','Am7','Fmaj7','Dm9','Gsus','Am7','Fmaj7','Cmaj7','G','Fmaj7','G','Am7','Am7'].forEach((c,b)=>{ const t0=3662+b*4.6; chord(t0,4.7,CH[c].map(x=>x+12),'strings',.24+b*.012,{att:.6}); add(t0,4.6,CH[c][0]-12,'bass',.42,0);
    for(let j=0;j<6;j++) add(t0+j*.76,.4,CH[c][j%4]+24,'pluck',.24,(j%2?.4:-.4)); });
  theme.forEach(([b,m,d])=>add(3700+b*beat,d*beat,m+12,'brass',.48,0));
  chord(3740,36,[45,52,57,60,64,69],'pad',.42,{att:4});
});

Object.assign(G.ARCHIVE_SFX_EXT,{
  storm:(S,c)=>{ for(let k=0;k<c.d;k+=3.5) S({t:c.t+k,d:4,i:'noiseSweep',f0:120+((k*23)%150),f1:500+((k*41)%400),g:.18}); },
  thunder:(S,c)=>{ S({t:c.t,d:.2,i:'crackle',g:2}); S({t:c.t+(c.near?0:.3),d:2.4,i:'thump',f:c.near?45:32,k:1.2,g:c.near?1.1:.7}); S({t:c.t,d:1.6,i:'noiseSweep',f0:3000,f1:200,g:.4}); },
  crack:(S,c)=>{ for(let k=0;k<c.d;k+=1.3) S({t:c.t+k,d:.4,i:'thump',f:70+((k*30)%40),k:8,g:.4}); },
  grab:(S,c)=>{ S({t:c.t,d:.5,i:'thump',f:90,k:6,g:.7}); S({t:c.t,d:1.2,i:'hum',f0:220,f1:330,g:.4}); },
  strain:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:110,f1:70,g:.5}); S({t:c.t,d:c.d,i:'crackle',g:.8}); },
  surge:(S,c)=>{ S({t:c.t,d:c.d,i:'noiseSweep',f0:200,f1:4000,g:.6}); S({t:c.t,d:c.d,i:'hum',f0:50,f1:110,g:.5}); },
  breakup:(S,c)=>{ for(let k=0;k<c.d;k+=1.6) S({t:c.t+k,d:1.4,i:'thump',f:40+((k*9)%20),k:2,g:.5}); },
  restore:(S,c,u)=>{ for(let k=0;k<8;k++) S({t:c.t+k*.5,d:.4,f:u.mtof([72,76,79,84,88,91,96,100][k]),i:'bell',v:.3}); },
  resolve:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:80,f1:240,g:.5}); },
  gate_reveal:(S,c)=>{ S({t:c.t,d:c.d,i:'noiseSweep',f0:150,f1:2600,g:.35}); S({t:c.t+c.d*.6,d:2,i:'thump',f:36,k:1,g:.9}); },
});
})(typeof window!=='undefined'?window:globalThis);
