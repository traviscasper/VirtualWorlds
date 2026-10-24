/* CHAPTER 5 — THE LIVING WORLD (36:00–45:00)
   Thalassa: a lagoon at dusk over a bioluminescent reef, forested islands, vertical farms and wind turbines.
   LUMEN, a small glowing creature, has drifted too far from the reef to trade light and is fading. ARCHIVE's
   tools make it worse. It learns to watch and wait, hears the reef talking in threes, and restarts the light
   exchange by becoming the bridge. The emotional centre of the film. At the end, the sky shows the network
   above everything, flickering: the failures are spreading.
   CH05_SC01 Thalassa (36:00–39:00) · CH05_SC02 Making it worse (39:00–42:00) · CH05_SC03 The light exchange (42:00–45:00)
   World id 5 = Thalassa (src/worlds/50_thalassa.glsl). */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
G.ARCHIVE_SFX_EXT = G.ARCHIVE_SFX_EXT || {};
const T0=2160, T1=2700, LAG=[0,0,-22], ROCK=[15.5,-.3,-24];

G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,V,clamp,lerp,sstep,Track,dialogue,SCENES} = K;
  const T=W.tr, PI=Math.PI;
  const D=(t,dur,text,emotion,scene,who='ARCHIVE')=>dialogue.push({character:who,text,start:t,end:t+dur,emotion,scene,audio:null,face:emotion});
  const TK=(t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'TOCK'); S(t,'tock_voice',{n:Math.max(2,Math.round(text.length/4))}); };
  const at=t=>A.tr.pos.at(t);
  const meta={CH05_SC01:'Thalassa',CH05_SC02:'Making it worse',CH05_SC03:'The light exchange'};
  for(const s of SCENES) if(meta[s.id]){ s.title=meta[s.id]; s.status='animated'; }

  // ---------- reef and creature state ----------
  T.thal=new Track([1,0,0,0]); T.reef=new Track([.7,0,0,0]); T.lumen=new Track([12.5,-.6,-30,.4],true); T.lumB=new Track([.8,0,1,0]);
  const RN=[]; for(let i=0;i<6;i++){ const a=i*1.047+.3, r=7+2.5*(i%2); RN.push([LAG[0]+Math.cos(a)*r,-2.2,LAG[2]+Math.sin(a)*r]); }
  const skyNodes=[]; for(let i=0;i<14;i++){ const a=i*.4488, r=30+5*Math.sin(i*1.7); skyNodes.push(LAG[0]+Math.cos(a)*r, 36+6*Math.sin(i*2.3), LAG[2]-20+Math.sin(a)*r*.6); }
  W.exts.push((t,s)=>{ if(t<T0-1||t>T1+1) return;
    s.U=Object.assign(s.U||{},{ uThal:[s.thal[0],s.thal[1],t*.45,s.thal[3]], uReef:[s.reef[0],s.reef[1],s.reef[2],t*.25], uLumen:s.lumen, uLumB:s.lumB, uRN:[].concat(...RN) });
    if(s.world>4.5){ s.loomN=skyNodes; s.loomC=[0,60,-42,0]; }
  });
  const lum=t=>T.lumen.at(t).slice(0,3);

  // ================= CH05_SC01 · Thalassa (2160–2340) =================
  T.world.cut(T0,5); T.tunnel.cut(T0,[0,0,0,0]); T.loom.cut(T0,[0,0,0,0]); T.loomB.cut(T0,[0,0,3,0]); T.orb.cut(T0,[0,-40,0,0]); T.orbGlow.cut(T0,0);
  T.holo.cut(T0,[0,0,0]); T.mirror.cut(T0,0); T.glitch.cut(T0,0); T.shelf.cut(T0,[-1,0,0]); T.ali.cut(T0,[0,-50,0,0]); T.bfly.cut(T0,0);
  T.exposure.cut(T0,6); T.exposure.to(T0,3,1,'out'); T.fade.cut(T0,1);
  T.portal.cut(T0,[0,10,34,2.6]); T.portalOpen.cut(T0,1); T.portalFX.cut(T0,[0,1,4,0]); T.portalOpen.to(T0+2,4,0,'inOut'); S(T0+2.2,'portal_close');
  T.tockVis.cut(T0,1); T.tockEye.cut(T0,[1,0,0,0]);
  A.tr.roll.cut(T0,0); A.tr.jitter.cut(T0,0); A.tr.power.cut(T0,1); A.tr.bob.cut(T0,1); A.tr.headYaw.cut(T0,0); A.tr.headPitch.cut(T0,0); A.tr.headTilt.cut(T0,0);
  A.place(T0,[0,10,32],PI); A.tr.thrust.cut(T0,1.2); A.flyTo(T0,3,[0,9,25],'out'); A.thrust(T0+1.4,2,.7);
  T.tockPos.cut(T0,[1,10.6,32.6]); T.tockPos.key(T0+3.2,[1.2,9.6,25.6],'out'); T.tockYaw.cut(T0,PI);
  S(T0,'sea',{d:540});
  T.thal.key(2190,[1,0,0,0],'lin').key(2300,[.55,0,0,0],'inOut');
  A.express(T0+.8,'surprised',.4); A.lookAt(T0+3.4,2,[-34,10,-36]); A.lookAt(T0+7,2,[32,10,-48]);
  C.shot(T0,[3,10.4,20],[0,9.4,30],44); C.move(T0,7,[4,10.6,18],[0,9.2,26],46,'inOut');
  A.express(2168,'excited',1); D(2169,1.4,'Whoa\u2026','surprised','CH05_SC01'); S(2169,'voice',{pattern:'whoa'});
  T.tockEye.key(2172,[1,0,0,0],'lin').key(2173,[.85,0,0,.7]); TK(2173.4,2.2,'Finally. Somewhere quiet.','happy','CH05_SC01');
  C.shot(2167,[-6,12,36],[0,4,-30],50); C.move(2167,16,[6,14,40],[0,4,-34],50,'inOut');
  A.lookAt(2178,2,[6,20,-66]); D(2180,2,'Gardens\u2026 in towers!','excited','CH05_SC01'); S(2180,'voice',{pattern:'giggle'});
  // the glide in across the water
  A.faceToward(2185,1,[-8,4,10]); A.path(2186,[[-8,4.2,10],[-4,2.2,-3],[2,1.5,-12],[5,1.3,-18]],26,'inOut'); A.thrust(2186,1,1); S(2186.4,'whoosh',{d:6,soft:1}); S(2198,'whoosh',{d:6,soft:1});
  for(let tt=2186;tt<=2213;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[1,.6,1]),'lin');
  A.express(2188,'happy',.6); A.arms(2192,.6,[2.4,1.1,.2],[2.4,1.1,.2]); A.rest(2200,1); A.spin(2203,1.8,1); S(2203.2,'voice',{pattern:'giggle'}); S(2203,'spin');
  C.shot(2185,[-12,5,18],[-6,3,4],50); for(const t of [2190,2195,2200,2205,2210]) C.via(t,V.add(at(t),[3.4,.9,5]),V.add(at(t+1),[0,-.4,-4]));
  // over the reef
  A.thrust(2212,1,.6); A.lookAt(2214,1.4,[4,-3,-20]); A.express(2214.4,'curious',.5);
  D(2217,1.4,'It\u2019s glowing!','excited','CH05_SC01'); S(2217,'voice',{pattern:'eep'});
  A.flyTo(2222,10,[1,1.1,-24],'inOut'); A.express(2226,'analyze',.6); A.scan(2228,3.4);
  for(let tt=2213;tt<=2232;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[1,.6,1]),'lin');
  C.shot(2212,[8,4,-8],[3,-1.5,-22],46); C.move(2212,20,[-4,3.4,-12],[2,-2,-24],44,'inOut');
  // dark patches
  T.reef.key(2236,[.7,0,0,0],'lin').key(2252,[.55,0,.35,0],'inOut');
  A.lookAt(2240,1.4,[9,-3,-27]); A.express(2240.4,'worried',.6);
  TK(2246,2.4,'Parts of it are going dark.','worried','CH05_SC01');
  A.flyTo(2250,9,[7,1.1,-25],'inOut'); A.thrust(2250,1,.6);
  C.shot(2240,[4,2.6,-16],[8,-2.4,-27],44); C.move(2240,20,[2,2.2,-18],[9,-2.4,-28],42,'lin');
  // Lumen, alone at the edge
  T.lumen.key(2262,[12.5,-.6,-30,.4],'lin'); for(let k=0;k<6;k++){ const t=2262+k*7; T.lumen.key(t+3.3,[12.5+Math.sin(k)*.4,-.6,-30+Math.cos(k)*.3,.4],'smooth'); }
  T.lumB.key(2270,[.8,0,1,0],'lin').key(2270.3,[.8,.6,1,0],'out').key(2270.9,[.8,0,1,0]).key(2271.4,[.8,.4,1,0],'out').key(2272,[.8,0,1,0]).key(2272.6,[.8,.15,1,0],'out').key(2273.4,[.8,0,1,0]);
  A.lookAt(2266,1.4,[12.5,-.6,-30]); A.express(2266.4,'surprised',.3); A.express(2270,'curious',.6);
  A.faceToward(2276,1,[12.5,-.6,-30]); A.flyTo(2277,10,[10.6,.9,-28.6],'inOut'); A.thrust(2277,1,.45); A.tr.bob.to(2277,4,.5); A.express(2280,'worried',.8);
  T.tockPos.key(2287,[9.6,1.8,-27.4],'inOut');
  T.lumen.key(2292,[12.5,-.6,-30,.4],'lin').key(2294,[12.4,-.55,-30,.22],'inOut').key(2296,[12.4,-.6,-30,.36]).key(2298,[12.4,-.6,-30,.18]).key(2302,[12.4,-.6,-30,.3]);
  A.tr.headPitch.to(2290,1,.3); D(2296,2,'Hey\u2026 are you okay?','worried','CH05_SC01'); S(2296,'voice',{pattern:'q'});
  TK(2303,2.4,'It is too far from the others.','soft','CH05_SC01');
  C.shot(2262,[4,3.4,-19],[12.5,-.8,-30],42); C.move(2262,14,[4.6,3.0,-19.6],[12.5,-.8,-30],38,'lin');
  C.shot(2287,[13.8,1.2,-26.2],[11.4,.2,-29.4],36); C.move(2287,24,[14.2,1.0,-25.8],[11.6,0,-29.6],34,'lin');
  C.shot(2311,[6,6,-14],[11,-.5,-30],46); C.move(2311,29,[4,7,-12],[11,-.5,-30],48,'inOut');
  A.tr.headPitch.to(2312,1,.1); A.express(2314,'thinking',1);

  // ================= CH05_SC02 · Making it worse (2340–2520) =================
  // attempt one: give it light
  A.express(2341,'determined',.4); D(2342,1.8,'Here. Take some light!','determined','CH05_SC02'); S(2342,'voice',{pattern:'hi'});
  A.activate(2344,4,2.2); A.power(2344,.6,1.5); A.power(2348,1,1); S(2344.2,'flare');
  T.lumen.key(2344.6,[12.4,-.6,-30,.3],'lin').key(2345.4,[12.9,-1.2,-30.6,.12],'out').key(2352,[14.6,-1.7,-27.6,.15],'inOut');
  T.lumB.key(2344.6,[.8,0,1,0],'lin').key(2345.4,[.6,0,.3,0],'out');
  A.express(2345.6,'surprised',.15); A.tr.jitter.key(2345.6,0,'lin').key(2345.8,.3).key(2346.6,0); A.express(2347,'worried',.6);
  TK(2349,2,'You startled it.','stern','CH05_SC02');
  C.shot(2340,[13.6,1.6,-25.4],[11.6,.3,-29.4],36); C.move(2340,12,[14,1.4,-25],[12.4,-.3,-29.6],36,'lin');
  // attempt two: push energy into the reef
  A.faceToward(2354,1,[9,-2,-27]); A.flyTo(2355,4,[9.4,.9,-25.6],'inOut'); A.thrust(2355,1,.6);
  A.express(2360,'determined',.4); A.reach(2361,.6,true); A.power(2361.4,.6,1.3); A.tr.jitter.key(2362,0,'lin').key(2363,.3).key(2367,.4).key(2368,0); S(2361.6,'push',{d:6});
  T.reef.key(2363,[.55,0,.35,0],'lin').key(2367.6,[.5,0,1,0],'in'); S(2367.4,'power_down');
  A.express(2368,'surprised',.15); D(2368.6,1.4,'No, no, no\u2014','worried','CH05_SC02'); S(2368.6,'voice',{pattern:'eep'}); A.rest(2369,.6); A.power(2369,1,1);
  A.express(2371,'frustrated',.6);
  C.shot(2354,[3,3,-20],[9,-1,-27],46); C.move(2354,16,[4.6,2.4,-21.4],[9,-1.4,-27],44,'lin');
  // Tock has no rule for this
  T.tockPos.key(2374,V.add(at(2374),[1,.4,.8]),'inOut');
  TK(2376,3,'Courier rule\u2026 I do not have a rule for this.','soft','CH05_SC02');
  A.express(2380,'sad',1); A.tr.headPitch.to(2380,1,.28);
  // ARCHIVE sits on the rock as night falls
  const SIT=[15.5,1.05,-24.2];
  A.faceToward(2386,1.4,SIT); A.flyTo(2387,7,SIT,'inOut'); A.thrust(2387,1,.5); A.thrust(2394,2,.25); A.tr.bob.to(2394,2,.15); A.faceToward(2394.4,2,[0,-1,-22]);
  T.tockPos.key(2396,[16.6,1.35,-23.6],'inOut'); T.tockEye.key(2396,[1,0,0,0],'lin').key(2397,[.7,0,-.2,0]);
  T.thal.key(2400,[.55,0,0,0],'lin').key(2462,[.05,0,0,0],'inOut');
  C.shot(2374,V.add(at(2374),[2.4,.8,2.6]),at(2374),40); C.move(2374,12,V.add(at(2374),[2.8,1,3]),at(2374),40,'lin');
  C.shot(2386,[22,3,-16],[14,1,-25],44); C.move(2386,30,[24,4,-12],[12,.6,-25],46,'inOut');
  // watching: the reef talks in threes
  A.tr.headPitch.to(2416,2,.12); A.express(2418,'thinking',2);
  C.shot(2416,[12.0,1.7,-22.4],[15.5,1.4,-24.2],36); C.move(2416,24,[12.3,1.8,-22.0],[15.5,1.5,-24.2],34,'lin');
  C.shot(2440,[17,4,-18],[4,-2,-24],50); C.move(2440,22,[18,5,-17],[2,-2,-24],50,'inOut');
  A.lookAt(2443,3,[4,-2,-22]); A.express(2450,'analyze',1);
  D(2466,2.2,'They\u2019re\u2026 talking. In threes.','thinking','CH05_SC02'); S(2466,'voice',{pattern:'q2'});
  T.lumB.key(2470,[.6,0,.3,0],'lin').key(2470.3,[.6,.35,.3,0],'out').key(2470.8,[.6,0,.3,0]).key(2471.2,[.6,.2,.3,0],'out').key(2471.8,[.6,0,.3,0]);
  A.lookAt(2469.6,1.2,lum(2470)); A.express(2472,'sad',1);
  D(2476,2.6,'And it\u2019s too far away to hear them.','sad','CH05_SC02'); S(2476,'voice',{pattern:'phew'});
  C.shot(2462,[12.9,1.6,-23.0],[15.5,1.45,-24.2],32); C.move(2462,20,[13.1,1.6,-23.1],[15.5,1.45,-24.2],30,'lin');
  T.tockPos.key(2488,[16.4,1.3,-23.2],'inOut'); T.tockEye.key(2488,[.7,0,-.2,0],'lin').key(2489,[.9,0,0,0]);
  TK(2492,1.8,'So what do we do?','curious','CH05_SC02');
  A.tr.headPitch.to(2496,1,0); A.express(2497,'relieved',1); D(2500,2.2,'We wait. And we listen.','relieved','CH05_SC02'); S(2500,'voice',{pattern:'hi'});
  C.shot(2482,[13.6,1.8,-20.8],[16,1.4,-24],36); C.move(2482,18,[13.4,1.9,-21.2],[16,1.4,-24],34,'lin');
  C.shot(2500,[30,8,-6],[10,0,-26],46); C.move(2500,20,[34,10,-2],[8,0,-26],46,'inOut');

  // ================= CH05_SC03 · The light exchange (2520–2700) =================
  const L0=lum(2520), N0=RN.reduce((b,n)=>V.len(V.sub(n,L0))<V.len(V.sub(b,L0))?n:b,RN[0]);
  const MID=V.add(V.lerp(L0,N0,.5),[0,.65,0]); MID[1]=Math.max(MID[1],.65);
  A.power(2521,3,.55); A.express(2521,'determined',1); A.tr.bob.to(2522,2,.4); A.thrust(2522,1,.45);
  A.faceToward(2523,1.4,MID); A.flyTo(2524,10,MID,'inOut'); A.faceToward(2534,2,L0);
  T.tockPos.key(2534,V.add(MID,[1.6,1.2,1.2]),'inOut');
  C.shot(2520,[20,3,-16],[13,.6,-26],46); C.move(2520,14,[14,2.6,-19],MID,42,'inOut');
  // three soft pulses... silence... again
  const pulse3=(t)=>{ [0,.7,1.4].forEach(k=>{ A.tr.power.key(t+k,.55,'lin'); A.tr.power.key(t+k+.18,1.0,'out'); A.tr.power.key(t+k+.5,.55,'in'); }); S(t,'soft3'); };
  pulse3(2540); A.activate(2540,2,1);
  C.shot(2538,V.add(MID,[1.6,.3,2]),V.add(MID,[0,.3,0]),34); C.move(2538,14,V.add(MID,[1.4,.3,1.8]),V.add(MID,[0,.3,0]),32,'lin');
  A.express(2546,'thinking',1); pulse3(2553); A.activate(2553,2,1);
  T.lumB.key(2558,[.6,0,.3,0],'lin').key(2558.3,[.65,.6,.5,0],'out').key(2558.9,[.65,0,.5,0]).key(2559.3,[.7,.7,.6,0],'out').key(2560,[.7,0,.6,0]).key(2560.4,[.75,.9,.7,0],'out').key(2561.2,[.75,.1,.8,0]);
  T.lumen.key(2557.8,[...lum(2557.8),.15],'lin').key(2561.2,[...lum(2557.8),.6],'out'); S(2558,'answer3');
  A.lookAt(2558,.5,lum(2558)); A.express(2558.4,'surprised',.2); A.express(2561,'happy',.6);
  C.shot(2552,[MID[0]-2.4,1.0,MID[2]+2.6],L0,34); C.move(2552,10,[MID[0]-2.2,.9,MID[2]+2.4],L0,30,'lin');
  // the chain restarts: the reef answers, the light spreads, Lumen comes home
  T.thal.key(2562,[.05,0,0,0],'lin').key(2572,[.05,1,0,0],'inOut'); S(2563,'exchange',{d:30});
  T.reef.key(2564,[.5,0,1,0],'lin').key(2590,[1,26,0,0],'inOut');
  T.lumen.key(2566,[...lum(2557.8),.6],'lin').key(2582,[...V.add(V.lerp(lum(2557.8),N0,.55),[0,.2,0]),1.2],'inOut');
  T.lumB.key(2564,[.75,.1,.8,0],'lin').key(2582,[1,.4,1,0],'inOut');
  A.power(2566,2,1); A.express(2568,'relieved',1.4); A.activate(2566,20,1);
  C.shot(2562,[MID[0]+3,3.4,MID[2]+6],[4,-2,-24],48); C.move(2562,14,[MID[0]+6,8,MID[2]+12],[2,-2,-24],54,'inOut');
  C.shot(2576,[-10,14,4],[2,-2,-22],52); C.move(2576,14,[-14,18,10],[2,-2,-24],54,'inOut');
  // a thank-you
  const LH=V.add(lum(2582),[0,.1,0]);
  const LT=V.add(MID,[0,-.6,1.2]); T.lumen.key(2592,[...LH,1.2],'lin').key(2597,[...LT,1.1],'inOut').key(2606,[...LT,1.1],'lin').key(2614,[...LH,1.1],'inOut');
  A.faceToward(2595,1.2,LT); A.reach(2598,.8); S(2599,'touch'); A.express(2599,'happy',.5); A.rest(2604,.8);
  T.tockEye.key(2603,[.9,0,0,0],'lin').key(2604,[.9,0,0,.8]); TK(2605,1.6,'You waited.','soft','CH05_SC03');
  D(2608,3.6,'It didn\u2019t need fixing. It needed someone to answer.','relieved','CH05_SC03'); S(2608,'voice',{pattern:'q2'});
  C.shot(2590.2,V.add(MID,[3.2,.5,.4]),V.add(MID,[0,-.2,.6]),36); C.move(2590.2,24,V.add(MID,[3.0,.45,.6]),V.add(MID,[0,-.2,.6]),34,'lin');
  // the whole lagoon, alive
  C.shot(2614.2,[24,16,8],[0,-2,-26],48); C.move(2614.2,30,[30,22,24],[0,0,-30],52,'inOut');
  A.tr.bob.to(2616,2,.8);
  // the network in the sky, flickering: it's spreading
  T.loom.key(2644,[0,0,0,0],'lin').key(2652,[1,0,0,0],'inOut'); S(2644,'loom_unfold',{d:8});
  T.thal.key(2652,[.05,1,0,0],'lin').key(2652.4,[.05,1,0,1],'out').key(2652.9,[.05,1,0,0]).key(2653.4,[.05,1,0,1],'out').key(2653.9,[.05,1,0,0]).key(2654.4,[.05,1,0,1],'out').key(2655.4,[.05,1,0,0]);
  T.reef.key(2652,[1,26,0,0],'lin').key(2652.5,[.6,26,0,0],'out').key(2653,[1,26,0,0]).key(2653.5,[.6,26,0,0],'out').key(2654,[1,26,0,0]).key(2654.5,[.6,26,0,0],'out').key(2655.6,[1,26,0,0]);
  S(2652,'pulse3');
  A.lookAt(2645,2,[0,62,-50]); A.express(2646,'surprised',.4); D(2648,2.6,'It\u2019s everywhere\u2026 it\u2019s all one network.','surprised','CH05_SC03'); S(2648,'voice',{pattern:'whoa'});
  A.express(2656,'worried',.5); TK(2657,2.4,'And it is failing everywhere.','worried','CH05_SC03');
  C.shot(2644,V.add(MID,[2.4,.6,4.2]),V.add(MID,[0,1.2,0]),50); C.move(2644,16,V.add(MID,[3.6,.4,6.4]),[0,34,-42],60,'inOut');
  // up into the network
  A.express(2661,'determined',.6); A.power(2661,1,1.15); D(2662,1.6,'Then we go up.','determined','CH05_SC03'); S(2662,'voice',{pattern:'hi'});
  const P6=V.add(MID,[0,14,0]); T.portal.cut(2663,[...P6,3]); T.portalFX.cut(2663,[0,0,0,0]); T.portalOpen.cut(2663,0);
  T.portalFX.key(2664,[0,0,0,0],'lin').key(2665,[.6,.2,0,0],'out').key(2669,[1,1,0,0],'inOut'); T.portalOpen.key(2669,0,'lin').key(2674,1,'out'); T.portalFX.key(2670,[1,1,1,0],'lin').key(2676,[1,1,1.6,0],'inOut');
  S(2664.4,'spark',{d:5}); S(2669.2,'portal_open');
  A.lookAt(2665,1,P6); A.flyTo(2677,4.2,V.add(P6,[0,3,0]),'in'); A.thrust(2677,2,1.5); A.express(2677.2,'excited',.4); S(2677.2,'whoosh',{d:4});
  for(let tt=2677;tt<=2681;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.5),[.6,-.4,.6]),'lin');
  C.shot(2663,V.add(MID,[4,1,6]),V.add(MID,[0,8,0]),50); C.move(2663,14,V.add(MID,[3,.6,4.6]),P6,46,'inOut');
  T.exposure.key(2679.4,1,'lin').key(2681.6,7,'in'); S(2679.6,'flash');
  T.portalOpen.key(2681.8,1,'lin').key(2682.2,0,'cut'); A.tr.pos.cut(2681.9,[0,-60,0]); T.tockVis.key(2681.8,1,'lin').key(2681.9,0,'cut');
  T.exposure.key(2682,7,'lin').key(2687,1,'out');
  C.shot(2682,[20,10,10],[0,-1,-24],48); C.move(2682,18,[26,12,16],[0,-1,-26],50,'inOut');
  T.fade.key(2694,1,'lin').key(2699.9,0,'inOut');
});

// =================== score for 36:00–45:00 ===================
G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,CH,beat,bar,theme}=K, e8=beat/2;
  // Thalassa at dusk: warm, open, gentle
  const warm=['Fmaj7','Cmaj7','Am7','G','Fmaj7','Cmaj7','Dm9','Gsus'];
  warm.forEach((c,b)=>{ const t0=2163+b*bar*1.2; chord(t0,bar*1.25,CH[c].map(x=>x+12),'strings',.24,{att:1.4}); add(t0,bar*1.2,CH[c][0]-12,'bass',.32,0);
    [0,1,2,3,2,1].forEach((k,j)=>add(t0+j*e8*1.2,e8,CH[c][k]+24,'pluck',.26,(j%2?.4:-.4))); });
  theme.forEach(([b,m,d])=>add(2186+b*beat*1.1,d*beat*1.15,m+12,'piano',.55,0));
  // reef wonder
  for(let k=0;k<30;k++) add(2214+k*.8,.6,[84,88,91,96,93,88][k%6],'celesta',.24,Math.sin(k)*.6);
  chord(2214,24,[53,57,60,64],'pad',.3,{att:3});
  // dark patches, Lumen alone: thinner, minor
  chord(2240,20,CH.Am7,'pad',.3,{att:3}); add(2262,40,45,'drone',.3,0,{att:4});
  [[2266,76],[2270,74],[2274,72],[2280,69],[2288,72],[2296,71],[2304,69]].forEach(([t,m])=>add(t,3.4,m,'piano',.4,0));
  // making it worse: a harsh flare, then a dissonant cluster
  chord(2344.2,1.6,[72,76,79,84],'brass',.35,{}); chord(2361.6,7,[49,52,55,58],'strings',.32,{att:1}); add(2367.4,1,31,'timp',1,0);
  // the long wait: sparse piano, the reef's three-note rhythm in bells, night falling
  ['Am7','Fmaj7','Cmaj7','Em7','Am7','Fmaj7','Dm9','Em7','Am7','Fmaj7','Cmaj7','G'].forEach((c,b)=>{ const t0=2396+b*10; chord(t0,10.4,CH[c].map(x=>x+12),'pad',.22,{att:3});
    if(b%2===0) CH[c].forEach((m,k)=>add(t0+1+k*.5,5,m+12,'piano',.26,k*.15-.2)); });
  for(let k=0;k<24;k++){ const t=2420+k*4; [0,.33,.66].forEach((o,j)=>add(t+o,1.2,[88,91,96][j],'bell',.12,.3)); }
  // three soft pulses, the answer, and the light spreading: the emotional centre
  [[2540,0],[2553,0]].forEach(([t])=>[0,.7,1.4].forEach((o,j)=>add(t+o,1.6,[76,79,86][j],'celesta',.45,-.2)));
  [0,.7,1.4].forEach((o,j)=>add(2558+o,2,[88,91,98][j],'bell',.5,.3));
  chord(2562,8,[48,55,60,64],'strings',.28,{att:3});
  ['Cmaj7','Am7','Fmaj7','G','Cmaj7','Em7','Fmaj7','Cmaj7'].forEach((c,b)=>{ const t0=2566+b*4.4; chord(t0,4.6,CH[c].map(x=>x+12),'strings',.26+b*.025,{att:.8}); add(t0,4.4,CH[c][0]-12,'bass',.4,0); });
  theme.forEach(([b,m,d])=>{ add(2570+b*beat*1.2,d*beat*1.25,m+24,'strings',.55,0,{att:.25}); add(2570+b*beat*1.2,d*beat*1.25,m+12,'piano',.5,0); });
  [84,88,91,96,100,103].forEach((m,k)=>add(2590+k*.14,4,m,'bell',.45,k*.18-.45));
  chord(2600,16,[48,55,60,64,67],'pad',.4,{att:2});
  chord(2616,26,[41,48,53,57,60,64],'pad',.32,{att:4}); [[0,64],[1,67],[2,74]].forEach(([b,m])=>add(2620+b*beat*1.5,beat*2,m+12,'celesta',.4,0));
  // the network above, flickering
  add(2644,20,34,'drone',.45,0,{att:3}); chord(2644,12,[46,53,58,61],'strings',.3,{att:3}); add(2652,1,33,'timp',1,0);
  chord(2662,6,[45,52,57,60],'brass',.4,{}); add(2669.2,1,33,'timp',1.1,0);
  add(2677,1,36,'timp',1.2,0); chord(2677,4,[48,55,60,64,67],'brass',.5,{});
  chord(2681.6,12,[48,55,60,64,67,72],'pad',.5,{att:.3}); [84,88,91,96].forEach((m,k)=>add(2681.6+k*.1,4,m,'bell',.5,k*.2-.3));
});

Object.assign(G.ARCHIVE_SFX_EXT,{
  sea:(S,c)=>{ for(let k=0;k<c.d;k+=4.5) S({t:c.t+k,d:5,i:'noiseSweep',f0:200+((k*17)%150),f1:600+((k*31)%300),g:.14}); },
  flare:(S,c)=>{ S({t:c.t,d:1.4,i:'noiseSweep',f0:800,f1:6000,g:.45}); S({t:c.t,d:.4,i:'chirp',f0:1200,f1:2400,g:.4}); },
  soft3:(S,c,u)=>{ [0,.7,1.4].forEach((k,j)=>S({t:c.t+k,d:.3,f:u.mtof([76,79,86][j]),i:'celesta',v:.4})); },
  answer3:(S,c,u)=>{ [0,1,2].forEach((k,j)=>S({t:c.t+k,d:.4,f:u.mtof([88,91,98][j]),i:'bell',v:.4,pan:.4})); },
  exchange:(S,c,u)=>{ for(let k=0;k<c.d;k+=.5) S({t:c.t+k,d:.3,f:u.mtof([84,88,91,96,100][Math.floor(k*2)%5]),i:'celesta',v:.16,pan:Math.sin(k*3)*.6}); },
});
})(typeof window!=='undefined'?window:globalThis);
