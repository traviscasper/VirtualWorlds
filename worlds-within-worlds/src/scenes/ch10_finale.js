/* CHAPTER 10 — A NEW BEGINNING (81:00–90:00)
   ARCHIVE and Tock revisit the worlds they helped — Ferrum lit and linked, Thalassa's reef alive, Verdance's
   trams and fountain — and Alicia, solid now, says farewell at the edge of Verdance before returning into every
   thread. Then the grand pull-back: the worlds become glowing spheres, the spheres become a network, the network
   becomes a cosmos. A new, unexplored portal opens. ARCHIVE looks at us, smiles, and flies in. Final title.
   CH10_SC01 Homecomings (81:00–84:00) · CH10_SC02 Farewell (84:00–87:00) · CH10_SC03 A new beginning (87:00–90:00)
   Reuses the world modules: Ferrum (4), Thalassa (5), Verdance (1), the Orrery (2) and the Loom (6). */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
G.ARCHIVE_SFX_EXT = G.ARCHIVE_SFX_EXT || {};
const T0=4860, T1=5400;

G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,V,clamp,lerp,sstep,Track,dialogue,SCENES,titles} = K;
  const T=W.tr, PI=Math.PI;
  const D=(t,dur,text,emotion,scene,who='ARCHIVE')=>dialogue.push({character:who,text,start:t,end:t+dur,emotion,scene,audio:null,face:emotion});
  const TK=(t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'TOCK'); S(t,'tock_voice',{n:Math.max(2,Math.round(text.length/4))}); };
  const AL=(t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'ALICIA'); S(t,'alicia_voice',{d:dur}); };
  const at=t=>A.tr.pos.at(t);
  const meta={CH10_SC01:'Homecomings',CH10_SC02:'Farewell',CH10_SC03:'A new beginning'};
  for(const s of SCENES) if(meta[s.id]){ s.title=meta[s.id]; s.status='animated'; }
  const faceYaw=(from,to)=>{ const d=V.sub(to,from); return Math.atan2(d[0],d[2]); };
  const follow=(t0,t1,off=[1,.6,1],lag=.8)=>{ for(let tt=t0;tt<=t1;tt+=.5) T.tockPos.key(tt,V.add(at(tt-lag),off),'lin'); };
  const hop=(t,world)=>{ T.exposure.key(t-1.2,1,'lin').key(t,5,'in'); T.world.cut(t,world); T.exposure.key(t,5,'lin').key(t+2,1,'out'); S(t-1,'whoosh',{d:2.4}); };
  // world-module uniforms for the revisits (each world healthy now)
  const LAG=[0,0,-22], RN=[]; for(let i=0;i<6;i++){ const a=i*1.047+.3, r=7+2.5*(i%2); RN.push([LAG[0]+Math.cos(a)*r,-2.2,LAG[2]+Math.sin(a)*r]); }
  const C0=[0,9,-30], TILT=.22, tilt=v=>[v[0],v[2]*Math.sin(TILT),v[2]*Math.cos(TILT)];
  const owPos=(i,t)=>{ const R=9+1.4*i, th=i*1.047+t*.035*(1-.08*i)+.4; return V.add(C0,tilt([R*Math.cos(th),0,R*Math.sin(th)])); };
  const outer=k=>{ const a=k*PI/4+.3; return V.add(C0,tilt([26*Math.cos(a),0,26*Math.sin(a)])); };
  T.fin=new Track([1,0,.03,0]);   // lattice scale (Loom), galaxy brightness, unused, unused
  T.lum=new Track([4,-.5,-24,1.2]);
  W.exts.push((t,s)=>{ if(t<T0-1||t>T1+1) return;
    const U={ uAli:s.ali, uAliB:s.aliB, uAliC:s.aliC, uMem:0 };
    const w=Math.round(s.world);
    if(w===4) Object.assign(U,{ uDist:[1,1,1,0], uRail:[118-(((9*(t-T0))%420)+420)%420,1,1,0], uLink:[.85,0,0,0], uLinkEnd:[12,9,-76], uMach:[0,0,0,0] });
    if(w===5) Object.assign(U,{ uThal:[.45,1,t*.45,0], uReef:[1,30,0,t*.25], uLumen:s.lum, uLumB:[1,.3,1,0], uRN:[].concat(...RN) });
    if(w===1){ s.cityU=[1,t*3.2,t*1.0,0]; }
    if(w===2){ const ow=[]; for(let i=0;i<6;i++) ow.push(...owPos(i,t),1.25); Object.assign(U,{ uOW:ow, uOrr:[t*.05,.6,t,0] });
      const nodes=[]; for(let i=0;i<6;i++) nodes.push(...owPos(i,t)); for(let k=0;k<8;k++) nodes.push(...outer(k)); s.loomN=nodes; s.loomC=[...C0,0]; }
    if(w===6){ const k=s.fin[1]; Object.assign(U,{ uNet:[t,0,1.2,s.fin[0]], uGal:[0,-30,-400,320], uGalB:[.5,t*.03,k,0] }); }
    s.U=Object.assign(s.U||{},U);
  });

  // ================= CH10_SC01 · Homecomings (4860–5040) =================
  // Ferrum: lit and linked, the train running, the far district bright again
  T.world.cut(T0,4); T.mem.cut(T0,0); T.core.cut(T0,[1,0,0,1]); T.loom.cut(T0,[0,0,0,0]); T.loomB.cut(T0,[0,0,3,0]);
  T.orb.cut(T0,[0,-40,0,0]); T.orbGlow.cut(T0,0); T.portalOpen.cut(T0,0); T.portalFX.cut(T0,[0,0,0,0]); T.holo.cut(T0,[0,0,0]); T.glitch.cut(T0,0);
  T.ali.cut(T0,[0,-60,0,0]); T.tockVis.cut(T0,1); T.tockEye.cut(T0,[.9,0,0,0]);
  T.exposure.cut(T0,5); T.exposure.to(T0,3,1,'out'); T.fade.cut(T0,0); T.fade.to(T0,2.5,1,'inOut');
  A.tr.roll.cut(T0,0); A.tr.jitter.cut(T0,0); A.tr.power.cut(T0,1); A.tr.bob.cut(T0,1); A.tr.headYaw.cut(T0,0); A.tr.headPitch.cut(T0,0); A.tr.headTilt.cut(T0,0);
  A.place(T0,[0,5,10],PI); A.tr.thrust.cut(T0,1); A.express(T0,'happy',.2); A.rest(T0,.01);
  A.path(T0+.5,[[1.5,6,-6],[-1,6.5,-26],[1,5.5,-46],[0,4.6,-60]],30,'inOut'); follow(T0,T0+31);
  S(T0,'city_hum',{d:62}); S(T0+.5,'whoosh',{d:6,soft:1});
  C.shot(T0,[3,6,-4],[0,5,10],46); for(const t of [4866,4872,4878,4884]) C.via(t,V.add(at(t),[3.6,1.4,7]),V.add(at(t+1.5),[0,1,-8]));
  A.lookAt(4869,1.2,[6.5,12.6,-20]); A.wave(4870,2.4,'R'); D(4870.4,1.4,'Hi, train!','playful','CH10_SC01'); S(4870.4,'voice',{pattern:'hi'}); S(4869,'train',{d:5});
  A.lookAt(4878,2,[0,30,-205]); D(4880,2.4,'The far district\u2019s bright again.','happy','CH10_SC01'); S(4880,'voice',{pattern:'q'});
  C.shot(4890,[5,9,-58],[0,6,-76],52); C.move(4890,14,[3,8,-61],[0,6,-78],50,'inOut');
  T.tockEye.key(4894,[.9,0,0,0],'lin').key(4895,[.85,0,0,.8]); TK(4895,1.8,'Still shared. Efficient.','proud','CH10_SC01');
  A.express(4898,'proud',.6);
  // Thalassa: the reef alive at dusk; Lumen comes to say hello
  hop(4906,5);
  A.place(4906,[0,6,20],PI); A.flyTo(4906,10,[2,1.4,-14],'inOut'); A.thrust(4906,1,.9); A.thrust(4916,1,.55); follow(4906,4917);
  T.lum.cut(4906,[4,-1.6,-24,1.2]); T.lum.key(4918,[4,-1.6,-24,1.2],'lin').key(4924,[3,-.45,-15.6,1.4],'inOut');
  C.shot(4906,[16,10,10],[0,-1,-22],50); C.move(4906,12,[12,8,4],[2,0,-18],48,'inOut');
  A.lookAt(4919,1.4,[3,-.4,-15.6]); A.express(4920,'happy',.6);
  for(const t of [4926,4930]){ A.tr.power.key(t,1,'lin'); [0,.5,1].forEach(o=>{ A.tr.power.key(t+o+.1,1.3,'out'); A.tr.power.key(t+o+.35,1,'in'); }); }
  S(4926,'soft3'); S(4928,'answer3');
  D(4932,1.6,'Hi, Lumen.','happy','CH10_SC01'); S(4932,'voice',{pattern:'hi'});
  T.tockEye.key(4934,[.85,0,0,.3],'lin').key(4935,[.6,0,0,0]); TK(4935.4,1.4,'Show-offs.','playful','CH10_SC01');
  C.shot(4918,V.add([2,1.4,-14],[2.4,.6,2.6]),[2.6,0,-15],38); C.move(4918,20,V.add([2,1.4,-14],[2.8,.8,3.2]),[2.6,-.2,-15.2],38,'lin');
  C.shot(4938,[22,14,8],[0,-2,-26],50); C.move(4938,12,[30,20,20],[0,-1,-30],54,'inOut');
  // Verdance: home for Tock
  hop(4950,1); T.city.cut(4950,[1,0,0,0]); T.jets.cut(4950,[2,2.4,2,2.4]);
  A.place(4950,[0,4,10],PI); A.path(4950.5,[[-1,3.6,-8],[1,3.2,-30],[0,3,-52],[2.6,2.2,-64]],26,'inOut'); follow(4950,4977);
  C.shot(4950,[3,4,-2],[0,3.6,10],46); for(const t of [4956,4962,4968,4974]) C.via(t,V.add(at(t),[3.4,1.2,6.4]),V.add(at(t+1.5),[0,0,-7]));
  A.express(4952,'excited',.6); D(4958,1.8,'The trams are running!','excited','CH10_SC01'); S(4958,'voice',{pattern:'giggle'});
  T.tockEye.key(4964,[.9,0,0,0],'lin').key(4965,[.9,0,0,.9]); TK(4965,2.2,'Home. On schedule, for once.','happy','CH10_SC01');
  A.lookAt(4978,1.6,[0,1.5,-70]); A.express(4978,'happy',.6); S(4978,'fountain_music',{d:20});
  C.shot(4977,[6,3,-58],[0,2,-70],46); C.move(4977,20,[8,4,-56],[0,2.4,-70],48,'inOut');
  D(4986,2.2,'It\u2019s playing music again.','relieved','CH10_SC01'); S(4986,'voice',{pattern:'hi'});
  TK(4992,2.6,'It never stopped. Not since you touched it.','soft','CH10_SC01');
  // a quiet moment at the canal
  A.flyTo(4998,8,[1.6,1.6,-40],'inOut'); A.thrust(4998,1,.6); T.tockPos.key(5006,[2.6,2,-39.4],'inOut'); A.faceToward(5006,2,[0,8,-110]);
  C.shot(4998,[0,3.4,-29],[1.6,2,-42],44); C.move(4998,24,[-.4,3.8,-27],[1.6,2.2,-44],44,'lin');
  TK(5010,3,'Courier log: the visitor saved every world.','proud','CH10_SC01');
  A.express(5014,'playful',.4); D(5014.6,2,'With a little help.','playful','CH10_SC01'); S(5014.6,'voice',{pattern:'giggle'});
  T.tockEye.key(5018,[.9,0,0,.9],'lin'); TK(5018.6,1.6,'A lot of help.','playful','CH10_SC01');
  // up to the lookout, sunset
  A.faceToward(5024,1,[0,4,-100]); A.path(5025,[[1,3.4,-60],[0,4.2,-84],[0,3.7,-99.6]],14,'inOut'); follow(5025,5039);
  C.shot(5024,[5,5,-34],[0,4,-70],50); C.move(5024,16,[4,6,-82],[0,4,-104],48,'inOut');

  // ================= CH10_SC02 · Farewell (5040–5220) =================
  const LK=[0,3.7,-99.6], ALI=[2.6,3.2,-102.4];
  T.tockPos.key(5040,V.add(LK,[-1.2,.5,.6]),'inOut'); A.faceToward(5040,1.4,[0,4,-130]); A.tr.bob.to(5041,2,.6);
  T.ali.cut(5046,[...ALI,0]); T.aliB.cut(5046,[2.4,0,1.2,0]); T.aliC.cut(5046,[faceYaw(ALI,LK),0,1,1]);
  T.ali.key(5047,[...ALI,0],'lin').key(5053,[...ALI,1],'inOut'); T.aliB.key(5047,[2.4,0,1.2,0],'lin').key(5053,[2.4,0,-.6,0],'inOut'); S(5047,'alicia',{d:30});
  A.lookAt(5050,1.4,V.add(ALI,[0,1,0])); A.express(5051,'surprised',.4); A.express(5054,'happy',.8);
  C.shot(5040,[5,4.6,-92],V.lerp(LK,ALI,.5),44); C.move(5040,18,[4,4.2,-94],V.lerp(LK,ALI,.5),40,'inOut');
  AL(5056,3,'I wanted to see one of them. With my own eyes.','warm','CH10_SC02');
  D(5060,1.8,'It\u2019s beautiful, right?','happy','CH10_SC02'); S(5060,'voice',{pattern:'q'});
  AL(5063,2.4,'It is. Because it\u2019s connected.','warm','CH10_SC02');
  C.shot(5055.6,V.add(ALI,[-.4,1.4,3.2]),V.add(ALI,[0,1.5,0]),30); C.move(5055.6,7,V.add(ALI,[-.4,1.4,3]),V.add(ALI,[0,1.5,0]),28,'lin');
  C.shot(5062.8,V.add(LK,[2.4,.4,-2.8]),V.lerp(LK,ALI,.45),38); C.move(5062.8,9,V.add(LK,[2.2,.4,-2.6]),V.lerp(LK,ALI,.45),36,'lin');
  // the goodbye and the gift
  AL(5072,3.4,'I belong in the Loom. Every thread is mine to keep now. But not alone.','warm','CH10_SC02');
  A.express(5076,'sad',.8); D(5077,1.8,'Will I see you again?','sad','CH10_SC02'); S(5077,'voice',{pattern:'q'});
  AL(5080,3.2,'Every time you open a door, I\u2019ll be on the other side of it.','warm','CH10_SC02');
  T.aliB.key(5084,[2.4,0,-.6,0],'lin').key(5086,[2.4,.8,-.6,0],'inOut');
  A.reach(5086,.8); S(5087,'touch_light'); A.activate(5087,14,2.2); A.express(5088,'surprised',.3); A.express(5090,'happy',.8);
  AL(5090,2.6,'Something to remember me by.','warm','CH10_SC02');
  C.shot(5071.6,V.add(ALI,[-1.4,1,4.6]),V.lerp(LK,ALI,.6),36); C.move(5071.6,14,V.add(ALI,[-1.2,1,4.2]),V.lerp(LK,ALI,.6),34,'lin');
  C.shot(5085.6,V.add(V.lerp(LK,ALI,.5),[.4,.4,2.6]),V.lerp(LK,ALI,.5),34); C.move(5085.6,10,V.add(V.lerp(LK,ALI,.5),[.4,.4,2.3]),V.lerp(LK,ALI,.5),30,'lin');
  T.tockEye.key(5096,[.9,0,0,0],'lin').key(5097,[.9,0,0,.9]); TK(5097,2.4,'Courier rule one applies to you too.','soft','CH10_SC02');
  AL(5100.4,2.4,'\u2026Deliver the visitor safely?','warm','CH10_SC02');
  TK(5103.4,1.8,'Wherever they go.','proud','CH10_SC02');
  C.shot(5096,[-4,4.8,-92],V.lerp(LK,ALI,.5),40); C.move(5096,10,[-4.6,5,-90],V.lerp(LK,ALI,.5),40,'lin');
  // she returns into the network as light
  T.aliB.key(5108,[2.4,.8,-.6,0],'lin').key(5110,[2.4,0,-.6,0],'inOut');
  T.ali.key(5110,[...ALI,1],'lin').key(5122,[...V.add(ALI,[0,7,-6]),0],'in'); T.aliB.key(5112,[2.4,0,-.6,0],'lin').key(5122,[2.4,0,1.2,0],'in'); S(5110,'ascend',{d:12});
  A.lookAt(5110,2,V.add(ALI,[0,2,0])); A.lookAt(5114,6,V.add(ALI,[0,8,-6])); A.express(5118,'relieved',1.4);
  C.shot(5108,V.add(LK,[1.6,.2,4.4]),V.add(ALI,[0,2.4,-2]),42); C.move(5108,16,V.add(LK,[1.8,0,5.4]),V.add(ALI,[0,7,-6]),46,'inOut');
  D(5126,1.6,'Bye, Alicia.','happy','CH10_SC02'); S(5126,'voice',{pattern:'hi'}); A.wave(5126.4,2.4,'R');
  // sunset at the edge of the world
  A.tr.bob.to(5130,2,.5); T.tockPos.key(5132,V.add(LK,[-.9,1.3,.2]),'inOut');
  C.shot(5130,[0,5,-90],[0,4.4,-130],44); C.move(5130,40,[0,6,-84],[0,5,-140],46,'inOut');
  TK(5150,2.2,'So. Where next?','curious','CH10_SC02');
  A.express(5154,'thinking',1); A.tr.headTilt.to(5156,.6,.25);
  D(5160,2.4,'Somewhere\u2026 nobody\u2019s been yet.','playful','CH10_SC02'); S(5160,'voice',{pattern:'giggle'});
  A.tr.headTilt.to(5163,.6,0); A.express(5164,'excited',.8);
  C.shot(5158,V.add(LK,[1.4,.3,-2.4]),V.add(LK,[0,.3,0]),32); C.move(5158,10,V.add(LK,[1.3,.3,-2.2]),V.add(LK,[0,.3,0]),30,'lin');
  // rising: the start of the pull-back
  A.flyTo(5172,12,V.add(LK,[0,22,-10]),'in'); A.thrust(5172,2,1.3); follow(5172,5184,[1,.6,1],.5); S(5172,'whoosh',{d:6});
  C.shot(5170,V.add(LK,[4,2,8]),V.add(LK,[0,6,-6]),50); C.move(5170,14,[8,40,-40],[0,6,-110],56,'inOut');
  // the worlds become glowing spheres
  hop(5186,2); A.tr.pos.cut(5186,[0,-500,0]); T.tockVis.key(5185.9,1,'lin').key(5186,0,'cut');
  T.loom.cut(5186,[.8,0,0,0]); T.loomB.cut(5186,[0,0,3,.5]);
  C.shot(5186,[0,12,-14],[0,9,-30],50); C.move(5186,18,[30,70,90],[0,9,-30],58,'inOut');
  // the spheres become a network, the network becomes a cosmos
  hop(5205,6); T.loom.cut(5205,[0,0,0,0]);
  T.fin.cut(5205,[1,0,0,0]); T.fin.key(5206,[1,0,0,0],'lin').key(5224,[.035,1,0,0],'inOut');
  C.shot(5205,[0,0,10],[0,0,-30],60); C.move(5205,19,[30,20,60],[0,-10,-200],64,'inOut'); S(5205,'scale_shift',{d:36});

  // ================= CH10_SC03 · A new beginning (5220–5400) =================
  T.fin.key(5232,[.035,1,0,0],'lin').key(5248,[1,.35,0,0],'inOut');
  C.move(5232,16,[3,1.6,6],[0,0,-6],50,'inOut');
  A.place(5240,[0,0,-2],PI); A.tr.thrust.cut(5240,.8); A.tr.bob.cut(5240,1); T.tockVis.key(5239.9,0,'lin').key(5240,1,'cut'); T.tockPos.cut(5240,[1.1,.7,-1.6]);
  A.express(5240,'happy',.1);
  // a new door, unlike any other
  const PN=[0,1.4,-14]; T.portal.cut(5246,[...PN,3.2]); T.portalFX.cut(5246,[0,0,0,1]);
  T.portalFX.key(5247,[0,0,0,1],'lin').key(5248,[.7,.2,0,1],'out').key(5256,[1,1,0,1],'inOut'); T.portalOpen.key(5256,0,'lin').key(5264,1,'out');
  S(5247.4,'spark',{d:9}); S(5256,'portal_open');
  A.lookAt(5248,1.4,PN); A.express(5249,'surprised',.4); A.express(5258,'excited',1);
  T.tockEye.key(5260,[.9,0,0,0],'lin').key(5261,[1.25,0,0,0]); TK(5262,2,'That one\u2019s not on any map.','curious','CH10_SC03');
  D(5266,2,'Then let\u2019s go see.','determined','CH10_SC03'); S(5266,'voice',{pattern:'hi'});
  C.shot(5248,[3,2,4],PN,46); C.move(5248,20,[2.4,1.6,2.6],V.add(PN,[0,0,0]),42,'inOut');
  // ARCHIVE looks at us and smiles
  A.turnTo(5270,1.6,0); A.tr.headYaw.to(5270,1.6,0); A.express(5271,'happy',.6);
  C.shot(5269.6,[0,.42,.05],[0,.42,-2],34); C.move(5269.6,10,[0,.42,-.15],[0,.42,-2],30,'lin');
  A.express(5274.4,'wink',.25); S(5274.5,'blip',{f:1400}); A.express(5275.8,'happy',.4);
  A.tr.bob.key(5276,1,'lin').key(5276.4,2.2).key(5277.6,1);
  // and flies in
  A.turnTo(5280,1.4,PI); A.flyTo(5282,5,V.add(PN,[0,0,-4]),'in'); A.thrust(5282,2,1.5); S(5282.2,'whoosh',{d:5}); S(5282.4,'voice',{pattern:'giggle'});
  for(let tt=5282;tt<=5287;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.4),[.6,.5,.6]),'lin');
  C.shot(5280,[1,1.4,3.6],PN,46); C.move(5280,7,V.add(PN,[0,.2,2.6]),V.add(PN,[0,0,-10]),70,'in');
  T.exposure.key(5285,1,'lin').key(5287.4,8,'in'); S(5285.4,'flash');
  T.fade.key(5288,1,'lin').key(5292,0,'inOut');
  // final title over black
  titles.push({t0:5300,t1:5385,main:'ARCHIVE',sub:'Worlds Within Worlds',credit:'Future Life Experiences'});
});

// =================== score for 81:00–90:00 ===================
G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,CH,beat,bar,theme}=K, e8=beat/2;
  // homecomings: each world's own colour, bright and warm
  for(let b=0;b<12;b++){ const c=CH[['Am7','Fmaj7','Cmaj7','G'][b%4]], t0=4862+b*bar*1.1; for(let j=0;j<8;j++) add(t0+j*e8*1.1,e8*.6,c[j%4]+12,'pluck',.3,(j%2?.35:-.35)); add(t0,bar,c[0]-12,'bass',.4,0); chord(t0,bar,c.map(x=>x+12),'strings',.2,{att:.8}); }
  theme.forEach(([b,m,d])=>add(4868+b*beat,d*beat,m+12,'brass',.45,0));
  // Thalassa
  chord(4906,44,[53,57,60,64],'pad',.32,{att:4}); for(let k=0;k<30;k++) add(4910+k*1.2,.6,[84,88,91,96,93,88][k%6],'celesta',.24,Math.sin(k)*.6);
  [[4926,[76,79,86]],[4928,[88,91,98]]].forEach(([t,ms])=>ms.forEach((m,k)=>add(t+k*.5,1.6,m,'bell',.4,0)));
  // Verdance: the town theme, with the fountain's melody
  ['Cmaj7','Fmaj7','Am7','G','Cmaj7','Fmaj7','Dm9','Gsus','Cmaj7','Am7','Fmaj7','G','Cmaj7','Em7','Fmaj7','Cmaj7','Am7','Fmaj7','G','Cmaj7'].forEach((c,b)=>{ const t0=4950+b*bar*1.1; chord(t0,bar*1.12,CH[c].map(x=>x+12),'strings',.22,{att:1}); add(t0,bar*1.1,CH[c][0]-12,'bass',.34,0);
    [0,1,2,3,2,1].forEach((k,j)=>add(t0+j*e8*1.1,e8,CH[c][k]+24,'pluck',.24,(j%2?.4:-.4))); });
  theme.forEach(([b,m,d])=>add(4978+b*beat,d*beat,m+24,'bell',.4,.2));
  // Alicia's farewell: her theme, whole, answered by ARCHIVE's
  chord(5046,60,[57,64,69,72,76],'pad',.42,{att:6}); add(5046,60,45,'drone',.25,0,{att:6});
  [[0,88],[1.6,91],[3.2,96],[6.4,95],[8,91],[9.6,88],[12.8,84],[16,88],[17.6,93],[19.2,96],[22.4,100],[25.6,96],[28.8,93],[32,91],[35.2,88]].forEach(([b,m])=>add(5050+b,3,m,'bell',.38,.1));
  theme.forEach(([b,m,d])=>add(5084+b*beat*1.2,d*beat*1.25,m+12,'piano',.55,0));
  chord(5108,16,[60,64,67,72,76,79],'strings',.3,{att:4}); for(let k=0;k<20;k++) add(5110+k*.6,.4,84+k,'celesta',.28,Math.sin(k)*.5);
  // sunset; "somewhere nobody's been yet"
  ['Cmaj7','Am7','Fmaj7','G','Cmaj7','Em7','Fmaj7','Gsus'].forEach((c,b)=>{ const t0=5130+b*5; chord(t0,5.2,CH[c].map(x=>x+12),'strings',.24,{att:1.4}); add(t0,5,CH[c][0]-12,'bass',.34,0); });
  // the grand pull-back: the full theme, building to the biggest statement of the film
  ['Cmaj7','Em7','Fmaj7','G','Am7','Em7','Fmaj7','G','Cmaj7','Am7','Fmaj7','Gsus','Cmaj7','Em7','Fmaj7','G','Am7','Fmaj7','G','Cmaj7'].forEach((c,b)=>{ const t0=5172+b*3.8; chord(t0,3.9,CH[c].map(x=>x+12),'strings',.3+b*.008,{att:.5}); chord(t0,3.8,[CH[c][0],CH[c][0]+7],'brass',.34+b*.008,{}); add(t0,3.8,CH[c][0]-12,'bass',.5,0); });
  theme.forEach(([b,m,d])=>{ add(5186+b*beat,d*beat,m+12,'brass',.6,0); add(5186+b*beat,d*beat,m+24,'strings',.62,0,{att:.12}); });
  theme.forEach(([b,m,d])=>{ add(5212+b*beat,d*beat,m+12,'brass',.65,0); add(5212+b*beat,d*beat,m+24,'strings',.66,0,{att:.12}); add(5212+b*beat,d*beat,m+24,'bell',.3,0); });
  [5186,5205,5224].forEach(t=>add(t,1,36,'timp',1.1,0));
  chord(5240,30,[48,55,60,64,67,72],'pad',.42,{att:3});
  // the new door; the wink; the leap
  chord(5256,10,[45,52,57,61,64],'strings',.32,{att:2}); add(5256,1,33,'timp',1,0);
  [[0,64],[1,67],[2,74]].forEach(([b,m])=>add(5271+b*beat*1.3,beat*2,m+12,'celesta',.5,0)); add(5274.5,.4,96,'celesta',.5,.3);
  add(5282,1,36,'timp',1.2,0); chord(5282,6,[48,55,60,64,67],'brass',.55,{});
  // the final title: the theme, last time, on piano and strings
  theme.forEach(([b,m,d])=>{ add(5300+b*beat*1.4,d*beat*1.5,m+12,'piano',.55,0); add(5300+b*beat*1.4,d*beat*1.5,m+24,'strings',.4,0,{att:.4}); });
  [['Cmaj7',5300],['Am7',5312],['Fmaj7',5324],['G',5336],['Cmaj7',5348]].forEach(([c,t])=>chord(t,12.4,CH[c].map(x=>x+12),'pad',.32,{att:2}));
  chord(5360,30,[36,43,48,52,55,60,64],'pad',.4,{att:4}); [84,88,91,96].forEach((m,k)=>add(5362+k*.3,8,m,'bell',.32,k*.2-.3));
});

Object.assign(G.ARCHIVE_SFX_EXT,{
  fountain_music:(S,c,u)=>{ for(let k=0;k<c.d;k+=.6) S({t:c.t+k,d:.3,f:u.mtof([84,88,91,96,91,88][Math.floor(k/.6)%6]),i:'celesta',v:.16,pan:.4}); },
  ascend:(S,c,u)=>{ S({t:c.t,d:c.d,i:'noiseSweep',f0:300,f1:6000,g:.25}); for(let k=0;k<8;k++) S({t:c.t+k*1.2,d:.5,f:u.mtof(84+k*2),i:'bell',v:.25}); },
});
})(typeof window!=='undefined'?window:globalThis);
