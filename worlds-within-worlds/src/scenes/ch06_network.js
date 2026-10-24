/* CHAPTER 6 — THE GREAT NETWORK (45:00–54:00)
   Inside the Loom: an endless lattice of glowing threads where every node is a world and every pulse flows
   one way, toward the Cosmic Core. ARCHIVE and Tock peek into nodes (Verdance, Thalassa, Ferrum). ALICIA —
   the Loom's holographic AI — appears properly for the first time, shrinks a galaxy into a hologram map and
   shows them the Core. They follow her map until the threads ahead begin to break.
   CH06_SC01 The Loom (45:00–48:00) · CH06_SC02 Alicia (48:00–51:00) · CH06_SC03 The map (51:00–54:00)
   World id 6 = the Loom (src/worlds/60_loom.glsl). */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
G.ARCHIVE_SFX_EXT = G.ARCHIVE_SFX_EXT || {};
const T0=2700, T1=3240;

G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,V,clamp,lerp,sstep,Track,dialogue,SCENES} = K;
  const T=W.tr, PI=Math.PI;
  const D=(t,dur,text,emotion,scene,who='ARCHIVE')=>dialogue.push({character:who,text,start:t,end:t+dur,emotion,scene,audio:null,face:emotion});
  const TK=(t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'TOCK'); S(t,'tock_voice',{n:Math.max(2,Math.round(text.length/4))}); };
  const AL=(t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'ALICIA'); S(t,'alicia_voice',{d:dur}); };
  const at=t=>A.tr.pos.at(t);
  const meta={CH06_SC01:'The Loom',CH06_SC02:'Alicia',CH06_SC03:'The map'};
  for(const s of SCENES) if(meta[s.id]){ s.title=meta[s.id]; s.status='animated'; }

  // ---------- network state ----------
  T.net=new Track([.12,1,1]);           // fray, brightness, lattice scale  (phase = time)
  T.gal=new Track([0,0,0,0]); T.aliHold=new Track(0);           // shrink 0..1, brightness, core marker, guide mode
  const GAL_FAR=[0,-40,-420], ALI=[0,.4,-104], HANDS=[0,1.06,-103.55];
  const guide=t=>{ const k=clamp((t-2978)/62,0,1); const z=-103-k*k*(3-2*k)*95; return [Math.sin(t*.5)*.6, .9+Math.sin(t*.7)*.4, z]; };
  W.exts.push((t,s)=>{ if(t<T0-1||t>T1+1) return;
    const g=s.gal, k=g[0]; let c=V.lerp(GAL_FAR,HANDS,k), r=Math.exp(lerp(Math.log(300),Math.log(.8),k));
    if(g[3]>0){ c=V.lerp(c,guide(t),g[3]); r=lerp(r,.55,g[3]); }
    s.U=Object.assign(s.U||{},{ uNet:[t,s.net[0],s.net[1],s.net[2]], uGal:[...c,r], uGalB:[lerp(.45,1.1,k),t*.05,g[1],g[2]], uAli:s.ali, uAliB:s.aliB, uAliC:[0,s.aliHold,0,0] });
  });
  T.aliHold.key(2930,0,'lin').key(2934,1,'inOut').key(2974,1,'lin').key(2977,0,'inOut');

  // ================= CH06_SC01 · The Loom (2700–2880) =================
  T.world.cut(T0,6); T.tunnel.cut(T0,[0,0,0,0]); T.loom.cut(T0,[0,0,0,0]); T.loomB.cut(T0,[0,0,3,0]); T.orb.cut(T0,[0,-40,0,0]); T.orbGlow.cut(T0,0);
  T.holo.cut(T0,[0,0,0]); T.mirror.cut(T0,0); T.glitch.cut(T0,0); T.shelf.cut(T0,[-1,0,0]); T.bfly.cut(T0,0);
  T.ali.cut(T0,[...ALI,0]); T.aliB.cut(T0,[3.4,0,1.2,0]);
  T.exposure.cut(T0,6); T.exposure.to(T0,3,1,'out'); T.fade.cut(T0,1);
  T.portalOpen.cut(T0,0); T.portalFX.cut(T0,[0,0,0,0]);
  T.tockVis.cut(T0,1); T.tockEye.cut(T0,[1,0,0,0]);
  A.tr.roll.cut(T0,0); A.tr.jitter.cut(T0,0); A.tr.power.cut(T0,1); A.tr.bob.cut(T0,1); A.tr.headYaw.cut(T0,0); A.tr.headPitch.cut(T0,0); A.tr.headTilt.cut(T0,0);
  A.place(T0,[0,-3,10],PI); A.tr.thrust.cut(T0,1.2); A.flyTo(T0,3,[0,0,6],'out'); A.thrust(T0+1.4,2,.7);
  T.tockPos.cut(T0,[1,-2.4,10.6]); T.tockPos.key(T0+3.2,[1.2,.6,6.6],'out'); T.tockYaw.cut(T0,PI);
  S(T0,'net_hum',{d:540});
  A.express(T0+.8,'surprised',.4); A.lookAt(T0+3.4,2,[-10,6,-10]); A.lookAt(T0+7,2,[10,-4,-14]);
  C.shot(T0,[2.4,.6,1],[0,0,8],46); C.move(T0,8,[3.6,1,-1],[0,.2,6],50,'inOut');
  A.express(2708,'excited',1); D(2709,2,'We\u2019re inside the network\u2026','surprised','CH06_SC01'); S(2709,'voice',{pattern:'whoa'});
  T.tockEye.key(2713,[1,0,0,0],'lin').key(2714,[1.3,.3,.2,0]); TK(2714.4,2,'My map has no edges.','worried','CH06_SC01');
  C.shot(2708,[-6,3,14],[0,0,0],56); C.move(2708,17,[-9,5,20],[0,0,-6],62,'inOut');
  A.spin(2719,1.8,1); S(2719.2,'voice',{pattern:'giggle'}); S(2719,'spin');
  // along the threads
  A.faceToward(2725,1,[0,0,-20]); A.path(2726,[[-1.5,1.2,-8],[1.5,-.8,-24],[-1,.6,-40],[0,0,-56]],30,'inOut'); A.thrust(2726,1,1.05); S(2726.4,'whoosh',{d:6}); S(2740,'whoosh',{d:6});
  for(let tt=2726;tt<=2757;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[1,.6,1]),'lin');
  A.express(2728,'happy',.6); A.arms(2733,.6,[2.4,1.1,.2],[2.4,1.1,.2]); A.rest(2742,1);
  C.shot(2725,[4,2,4],[0,0,-10],52); for(const t of [2730,2736,2742,2748,2754]) C.via(t,V.add(at(t),[2.6,1.2,5.4]),V.add(at(t+1.4),[0,0,-6]));
  A.lookAt(2744,1.4,[0,0,-200]); A.express(2744.4,'analyze',.5); D(2747,2.2,'They\u2019re all going the same way.','thinking','CH06_SC01'); S(2747,'voice',{pattern:'q2'});
  // a node opens: Verdance
  const NV=[2.6,1.2,-66];
  T.portal.cut(2758,[...NV,1.7]); T.portalFX.cut(2758,[0,0,1,0]); T.portalOpen.key(2758,0,'lin').key(2762,1,'out'); S(2758.4,'node_open');
  A.faceToward(2757,1,NV); A.flyTo(2758,4,V.add(NV,[-1.6,-.6,3.2]),'inOut'); A.thrust(2758,1,.6);
  T.tockPos.key(2763,V.add(NV,[.4,-.2,3.6]),'inOut');
  A.express(2763,'excited',.3); D(2763.6,1.2,'Verdance! Hi!','excited','CH06_SC01'); S(2763.6,'voice',{pattern:'hi'}); A.wave(2764,2,'R');
  T.tockEye.key(2767,[1,0,0,0],'lin').key(2768,[.85,0,0,.8]); TK(2768.4,1.6,'Hello, home.','soft','CH06_SC01');
  T.portalOpen.key(2774,1,'lin').key(2777,0,'inOut');
  C.shot(2757.6,V.add(NV,[-4,1.2,7]),NV,44); C.move(2757.6,10,V.add(NV,[-3.2,.6,6.2]),NV,40,'inOut');
  C.shot(2767.6,V.add(NV,[1.8,-.2,1.4]),V.add(NV,[.2,-.3,3.6]),34); C.move(2767.6,9,V.add(NV,[1.9,-.2,1.6]),V.add(NV,[.2,-.3,3.6]),32,'lin');
  // another: Thalassa
  const NT=[-3,-1,-82];
  A.faceToward(2778,1,NT); A.flyTo(2779,6,V.add(NT,[1.4,.5,3.2]),'inOut'); A.thrust(2779,1,.9); A.thrust(2785,1,.6);
  for(let tt=2779;tt<=2786;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[1,.6,1]),'lin');
  T.portal.cut(2784,[...NT,1.7]); T.portalFX.cut(2784,[0,0,3.9,0]); T.portalOpen.key(2784,0,'lin').key(2788,1,'out'); S(2784.4,'node_open');
  A.express(2789,'happy',.5); D(2790,1.8,'The reef\u2026 Lumen\u2019s okay.','happy','CH06_SC01'); S(2790,'voice',{pattern:'hi'});
  T.portalOpen.key(2800,1,'lin').key(2803,0,'inOut');
  C.shot(2778,[4,2,-70],[-2,0,-80],48); C.move(2778,10,[3,1.2,-74],NT,44,'inOut');
  C.shot(2788,V.add(NT,[3,.6,6]),V.lerp(NT,at(2790),.5),40); C.move(2788,15,V.add(NT,[3.4,.8,6.6]),V.lerp(NT,at(2790),.5),40,'lin');
  // fraying
  T.net.key(2806,[.12,1,1],'lin').key(2830,[.42,1,1],'inOut'); S(2810,'fray',{d:30});
  A.faceToward(2804,1,[0,0,-110]); A.flyTo(2805,10,[0,0,-92],'inOut'); A.thrust(2805,1,.9); A.thrust(2815,1,.6);
  for(let tt=2805;tt<=2816;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[1,.6,1]),'lin');
  A.lookAt(2817,1.4,[6,3,-100]); A.lookAt(2821,1.4,[-6,-3,-100]); A.express(2818,'worried',.6);
  TK(2823,2,'Threads are snapping.','worried','CH06_SC01'); A.express(2828,'determined',1);
  D(2832,2.4,'It\u2019s worse than Ferrum. Worse than Thalassa.','worried','CH06_SC01'); S(2832,'voice',{pattern:'q2'});
  C.shot(2804,[5,3,-80],[0,0,-100],54); C.move(2804,24,[7,4,-84],[0,0,-108],58,'inOut');
  C.shot(2828,V.add(at(2830),[1.8,.4,-2.6]),V.add(at(2830),[0,.3,0]),36); C.move(2828,14,V.add(at(2830),[1.6,.4,-2.4]),V.add(at(2830),[0,.3,0]),34,'lin');
  A.tr.bob.to(2842,2,.6); C.shot(2842,[-8,3,-80],[0,0,-110],50); C.move(2842,38,[-10,5,-76],[0,0,-116],52,'inOut');
  A.lookAt(2850,3,[0,0,-200]); A.express(2856,'thinking',1);

  // ================= CH06_SC02 · Alicia (2880–3060) =================
  A.flyTo(2880,4,[0,0,-97],'inOut'); A.thrust(2880,1,.6); T.tockPos.key(2884,[1.4,.7,-96.4],'inOut');
  T.ali.key(2884,[...ALI,0],'lin').key(2892,[...ALI,1],'inOut'); T.aliB.key(2884,[3.4,0,1.2,0],'lin').key(2892,[3.4,0,-.3,0],'inOut'); S(2884,'alicia',{d:40});
  A.express(2885,'surprised',.4); A.lookAt(2885,1,V.add(ALI,[0,1,0])); T.tockEye.key(2886,[1,0,0,0],'lin').key(2886.6,[1.35,0,.3,0]);
  AL(2894,2.6,'You came. I hoped you would.','warm','CH06_SC02');
  A.express(2898,'curious',.6); D(2899,2,'You\u2019re\u2026 her. From the panel.','curious','CH06_SC02'); S(2899,'voice',{pattern:'q'});
  AL(2903.6,3.2,'I am the Loom\u2019s keeper. Its mind, if you like.','warm','CH06_SC02');
  TK(2908.8,2,'Is she\u2026 on the schedule?','curious','CH06_SC02'); A.express(2911,'playful',.4); S(2911.2,'voice',{pattern:'giggle'});
  T.aliB.key(2913,[3.4,0,-.3,0],'lin').key(2914,[3.4,0,-.3,.5],'inOut').key(2916,[3.4,0,-.3,0],'inOut');
  AL(2915.4,4.6,'The threads pull one way now, toward the Core. The worlds take, and nothing comes back.','sad','CH06_SC02');
  A.express(2918,'worried',.8);
  C.shot(2884,[3,1,-88],[0,1.4,-104],44); C.move(2884,10,[2.4,.8,-90],[0,1.6,-104],40,'inOut');
  C.shot(2894,V.add(ALI,[-1.6,.4,6.2]),V.add(ALI,[0,.9,0]),32); C.move(2894,4.4,V.add(ALI,[-1.4,.4,5.8]),V.add(ALI,[0,.9,0]),30,'lin');
  C.shot(2898.4,V.add(at(2898),[1.4,.3,-2.4]),V.add(at(2898),[0,.3,0]),34); C.move(2898.4,5,V.add(at(2898),[1.3,.3,-2.2]),V.add(at(2898),[0,.3,0]),32,'lin');
  C.shot(2903.4,[-3.6,1.6,-94],[0,1.2,-102],40); C.move(2903.4,16,[-4.2,1.8,-92],[0,1.2,-102],42,'lin');
  // the galaxy: vast, then small enough to hold
  T.aliB.key(2922,[3.4,0,-.3,0],'lin').key(2924.4,[3.4,1,-.3,0],'inOut');
  T.gal.key(2923,[0,0,0,0],'lin').key(2929,[0,1,0,0],'inOut'); S(2923,'galaxy',{d:8});
  T.gal.key(2931,[0,1,0,0],'lin').key(2944,[1,1,0,0],'inOut'); S(2931,'shrink',{d:13});
  A.lookAt(2924,2,[0,-20,-300]); A.express(2924.4,'surprised',.6); A.lookAt(2934,8,HANDS);
  T.gal.key(2945,[1,1,0,0],'lin').key(2947,[1,1,1,0],'out');
  AL(2947.4,4,'Here. The Cosmic Core. Everything flows there now.','serious','CH06_SC02');
  C.shot(2922,[4,2,-86],[0,-10,-300],60); C.move(2922,9,[5,3,-84],[0,-12,-300],64,'inOut');
  C.shot(2931,[3.6,2.2,-92],[0,2,-160],56); C.move(2931,13,[2,1.4,-98.4],HANDS,40,'inOut');
  C.shot(2945,V.add(HANDS,[1.4,.5,1.8]),HANDS,34); C.move(2945,8,V.add(HANDS,[1.2,.4,1.6]),HANDS,30,'lin');
  A.express(2953,'determined',.6); D(2954,2,'Then that\u2019s where we go.','determined','CH06_SC02'); S(2954,'voice',{pattern:'hi'});
  T.aliB.key(2958,[3.4,1,-.3,0],'lin').key(2959,[3.4,.8,.35,0],'inOut').key(2960.4,[3.4,.8,-.1,0]).key(2961.4,[3.4,.8,.4,0],'inOut').key(2963,[3.4,.8,0,0]);
  AL(2959,3.8,'It\u2019s far. And I can\u2019t hold this form for long.','faint','CH06_SC02'); S(2959.2,'glitch',{d:1});
  A.express(2964,'determined',.4); D(2965,2.4,'Then hold on. We\u2019re coming.','determined','CH06_SC02'); S(2965,'voice',{pattern:'hi'});
  T.aliB.key(2968,[3.4,.8,0,0],'lin').key(2969,[3.4,.8,0,.6],'inOut').key(2970.6,[3.4,.8,0,0],'inOut');
  AL(2970,2,'\u2026Follow the map.','warm','CH06_SC02');
  C.shot(2953,V.add(at(2953),[1.6,.4,-2.4]),V.add(at(2953),[0,.3,0]),34); C.move(2953,6,V.add(at(2953),[1.4,.4,-2.2]),V.add(at(2953),[0,.3,0]),32,'lin');
  C.shot(2959,V.add(ALI,[-2.4,.5,7.4]),V.add(ALI,[0,1,0]),34); C.move(2959,6,V.add(ALI,[-2.2,.5,7]),V.add(ALI,[0,1,0]),32,'lin');
  C.shot(2965,[3.6,1.4,-92],[0,1,-101],42); C.move(2965,13,[4.4,1.8,-90],[0,1,-103],44,'lin');
  // she fades; the map becomes their guide
  T.ali.key(2973,[...ALI,1],'lin').key(2978,[...ALI,.12],'inOut'); T.aliB.key(2973,[3.4,.8,0,0],'lin').key(2978,[3.4,.3,.8,0],'inOut');
  T.gal.key(2976,[1,1,1,0],'lin').key(2980,[1,1,.6,1],'inOut');
  A.faceToward(2979,1,[0,0,-130]); A.path(2980,[[0,.4,-108],[1.4,1.2,-128],[-1,.8,-150],[.4,1,-172],[0,.8,-192]],60,'inOut'); A.thrust(2980,1,1);
  for(let tt=2980;tt<=3041;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[1,.6,1]),'lin');
  A.express(2981,'determined',1); S(2981,'whoosh',{d:6}); S(3000,'whoosh',{d:6}); S(3020,'whoosh',{d:6});
  C.shot(2979,[4,2,-96],[0,.8,-110],52); for(const t of [2986,2994,3002,3010,3018,3026,3034]) C.via(t,V.add(at(t),[2.6,1.1,5]),V.add(at(t+1.5),[0,0,-6]));
  // a node: Ferrum, still shared
  const NF=[3.2,.4,-152];
  T.portal.cut(3004,[...NF,1.7]); T.portalFX.cut(3004,[0,0,2.9,0]); T.portalOpen.key(3004,0,'lin').key(3008,1,'out').key(3016,1,'lin').key(3019,0,'inOut'); S(3004.4,'node_open');
  A.lookAt(3007,1,NF); A.express(3007.4,'happy',.4); D(3009,2,'Ferrum! They kept it shared!','happy','CH06_SC02'); S(3009,'voice',{pattern:'giggle'});
  T.tockEye.key(3012,[1,0,0,0],'lin').key(3013,[.85,0,0,.7]); TK(3013,1.4,'Efficient.','proud','CH06_SC02');
  AL(3040,3.2,'\u2026the threads ahead are breaking. Be careful\u2026','faint','CH06_SC02');
  T.ali.key(3039,[0,-60,0,0],'cut'); A.express(3041,'worried',.6);

  // ================= CH06_SC03 · The map (3060–3240) =================
  // a scale shift: the whole lattice shrinks to a web, then opens again
  T.net.key(3058,[.42,1,1],'lin').key(3080,[.42,1.6,.08],'inOut').key(3090,[.42,1.6,.08],'lin').key(3108,[.5,1,1],'inOut'); S(3058,'scale_shift',{d:50});
  A.express(3062,'surprised',.6); A.lookAt(3062,4,[0,10,-150]); D(3080,2.6,'It\u2019s\u2026 bigger than all the stars.','surprised','CH06_SC03'); S(3080,'voice',{pattern:'whoa'});
  C.shot(3056,V.add(at(3056),[2,1,4]),at(3056),50); C.move(3056,22,V.add(at(3056),[18,10,40]),V.add(at(3056),[0,0,-30]),70,'inOut');
  C.move(3090,18,V.add(at(3056),[2.4,1,4.6]),V.add(at(3056),[0,0,-6]),50,'inOut');
  A.express(3100,'determined',.8);
  // fraying faster; the map flickers
  A.faceToward(3110,1,[0,0,-230]); A.path(3111,[[0,1,-206],[-1.2,.6,-220],[.6,.4,-236]],34,'inOut'); A.thrust(3111,1,.75);
  for(let tt=3111;tt<=3146;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[1,.6,1]),'lin');
  T.net.key(3112,[.5,1,1],'lin').key(3150,[.78,1,1],'inOut'); S(3112,'fray',{d:40});
  T.gal.key(3120,[1,1,.6,1],'lin').key(3121,[1,.4,.6,1]).key(3121.8,[1,1,.6,1]).key(3130,[1,1,.6,1],'lin').key(3131,[1,.3,.4,1]).key(3132,[1,.8,.6,1]).key(3150,[1,.3,.3,1],'inOut');
  A.express(3118,'worried',.6); TK(3124,2.4,'The map is getting weaker.','worried','CH06_SC03');
  A.tr.jitter.key(3134,0,'lin').key(3134.3,.35).key(3135.4,0); S(3134,'thread_snap'); A.express(3134.2,'surprised',.2); A.express(3137,'determined',.6);
  C.shot(3110,[5,2,-196],[0,.6,-214],54); for(const t of [3118,3126,3134,3142]) C.via(t,V.add(at(t),[2.8,1.2,5.6]),V.add(at(t+1.5),[0,0,-6]));
  // the edge of the map
  A.flyTo(3150,8,[0,.5,-244],'inOut'); A.thrust(3150,1,.6); A.tr.bob.to(3156,2,.7);
  T.tockPos.key(3158,[1.2,1.1,-243.4],'inOut');
  T.net.key(3156,[.78,1,1],'lin').key(3168,[.9,1,1],'inOut');
  A.lookAt(3159,2,[0,0,-300]); A.express(3160,'worried',.8);
  T.tockEye.key(3168,[1,0,0,0],'lin').key(3169,[.7,0,-.2,0]); TK(3170,2.4,'This is the end of my map.','sad','CH06_SC03');
  A.tr.headYaw.to(3174,1,-.7); A.express(3175,'happy',.5); D(3176,2.4,'Then we draw a new one.','determined','CH06_SC03'); S(3176,'voice',{pattern:'hi'}); A.tr.headYaw.to(3179,1,0);
  T.tockEye.key(3179,[.7,0,-.2,0],'lin').key(3180,[.9,0,0,.7]); TK(3181,1.4,'Courier rule one.','proud','CH06_SC03');
  A.express(3185,'determined',.6); A.power(3185,1,1.15); S(3185.2,'breath',{d:3});
  C.shot(3150,[6,2,-232],[0,.4,-246],48); C.move(3150,17,[4,1.4,-236],[0,.5,-248],44,'inOut');
  C.shot(3167,V.add([0,.5,-244],[1.6,.4,-2.6]),[.6,.8,-243.6],34); C.move(3167,22,V.add([0,.5,-244],[1.4,.4,-2.4]),[.6,.8,-243.6],32,'lin');
  // into the dark
  A.faceToward(3190,1,[0,0,-300]); A.flyTo(3191,30,[0,0,-300],'in'); A.thrust(3191,2,1.2); S(3191.2,'whoosh',{d:6});
  for(let tt=3191;tt<=3222;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.6),[.7,.4,.7]),'lin');
  C.shot(3190,[0,3,-236],[0,0,-260],50); C.move(3190,40,[0,4,-232],[0,0,-290],46,'lin');
  T.fade.key(3232,1,'lin').key(3239.9,0,'inOut');
});

// =================== score for 45:00–54:00 ===================
G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,CH,beat,bar,theme}=K, e8=beat/2;
  // the Loom: shimmering arpeggios over a deep drone, mysterious and vast
  add(2700,90,29,'drone',.45,0,{att:4}); add(2700,90,36,'drone',.3,0,{att:5});
  const net=['Fadd9','Dm9','Bbmaj7','Cmaj7'];
  for(let b=0;b<14;b++){ const t0=2706+b*bar*1.1, ch=CH[net[b%4]]; chord(t0,bar*1.15,ch.map(x=>x+12),'pad',.26,{att:2});
    for(let j=0;j<8;j++) add(t0+j*e8*1.1,e8,ch[j%ch.length]+24+(j>3?12:0),'celesta',.25,(j%2?.45:-.45)); }
  theme.forEach(([b,m,d])=>add(2726+b*beat,d*beat,m+12,'strings',.45,0,{att:.3}));
  // nodes: home motifs
  [[2763.6,[76,79,84]],[2790,[72,76,79]]].forEach(([t,ms])=>ms.forEach((m,k)=>add(t+k*.3,2.2,m,'bell',.4,.2)));
  // fraying
  chord(2806,30,[37,44,49,52],'strings',.28,{att:4}); for(let k=0;k<16;k++) add(2810+k*1.6,.4,[61,62,61,64][k%4],'pluck',.3,(k%2?.4:-.4));
  // Alicia: her theme, high bells over a warm, still pad
  chord(2884,40,[57,64,69,72,76],'pad',.4,{att:6}); add(2884,40,45,'drone',.3,0,{att:5});
  [[0,88],[1.6,91],[3.2,96],[6.4,95],[8,91],[9.6,88],[12.8,84],[16,88],[17.6,93],[19.2,96],[24,95],[26,91],[28,88]].forEach(([b,m])=>add(2890+b,3,m,'bell',.36,.1));
  // the galaxy shrinking
  chord(2923,8,[41,48,53,57,60,64],'strings',.32,{att:3}); chord(2931,13,[45,52,57,60,64],'strings',.3,{att:2});
  for(let k=0;k<26;k++) add(2931+k*.5,.3,96-k,'celesta',.3,Math.sin(k)*.5);
  add(2947,1,33,'timp',1,0); chord(2947,6,[45,52,57,61],'brass',.4,{});
  // "Then hold on. We're coming." → the guided flight: the theme, full and determined
  ['Am7','Fmaj7','Cmaj7','G','Am7','Fmaj7','Dm9','Gsus','Cmaj7','Am7','Fmaj7','G','Cmaj7','Em7','Fmaj7','G'].forEach((c,b)=>{ const t0=2980+b*3.8; chord(t0,3.9,CH[c].map(x=>x+12),'strings',.26,{att:.5}); add(t0,3.8,CH[c][0]-12,'bass',.45,0);
    for(let j=0;j<6;j++) add(t0+j*.63,.4,CH[c][j%4]+24,'pluck',.28,(j%2?.4:-.4)); });
  theme.forEach(([b,m,d])=>{ add(2990+b*beat,d*beat,m+12,'brass',.45,0); add(3014+b*beat,d*beat,m+24,'strings',.5,0,{att:.15}); });
  // scale shift: awe
  chord(3058,30,[36,43,48,52,55,59,64],'pad',.42,{att:6}); add(3080,1,29,'timp',1,0);
  // fraying faster; the edge; "we draw a new one"
  add(3112,80,34,'drone',.45,0,{att:3}); chord(3112,36,[46,53,58,61],'strings',.3,{att:4});
  [[3176,[64,67,74]],[3181,[72,76,79]]].forEach(([t,ms])=>ms.forEach((m,k)=>add(t+k*beat,beat*1.5,m+12,'celesta',.45,0)));
  chord(3185,12,[45,52,57,60,64],'strings',.32,{att:2}); add(3191,1,33,'timp',1.1,0); chord(3191,10,[45,52,57,60],'brass',.4,{});
  chord(3205,30,[33,40,45],'pad',.3,{att:4});
});

Object.assign(G.ARCHIVE_SFX_EXT,{
  net_hum:(S,c)=>{ for(let k=0;k<c.d;k+=5) S({t:c.t+k,d:5.6,i:'hum',f0:55+((k*7)%10),f1:58+((k*11)%10),g:.14}); },
  node_open:(S,c,u)=>{ S({t:c.t,d:2.4,i:'noiseSweep',f0:400,f1:3000,g:.3}); [84,88,91].forEach((m,k)=>S({t:c.t+.4+k*.12,d:.3,f:u.mtof(m),i:'bell',v:.3})); },
  fray:(S,c)=>{ for(let k=0;k<c.d;k+=2.6) S({t:c.t+k,d:.3,i:'chirp',f0:1600,f1:400,g:.18}); S({t:c.t,d:c.d,i:'crackle',g:.6}); },
  galaxy:(S,c)=>{ S({t:c.t,d:c.d,i:'noiseSweep',f0:100,f1:2000,g:.35}); S({t:c.t,d:c.d,i:'hum',f0:40,f1:80,g:.4}); },
  scale_shift:(S,c)=>{ S({t:c.t,d:22,i:'noiseSweep',f0:3000,f1:150,g:.35}); S({t:c.t+32,d:18,i:'noiseSweep',f0:150,f1:3000,g:.3}); },
  alicia_voice:(S,c,u)=>{ const n=Math.max(2,Math.round(c.d*2.6)); for(let k=0;k<n;k++){ const f=u.mtof([79,81,84,83,79,76][k%6]); S({t:c.t+k*.36,d:.3,i:'chirp',f0:f,f1:f*1.04,g:.22,stem:'dialogue'}); } },
});
})(typeof window!=='undefined'?window:globalThis);
