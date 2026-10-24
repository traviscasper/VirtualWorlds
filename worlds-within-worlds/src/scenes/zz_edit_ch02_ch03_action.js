/* ACTION INSERTS 2 and 3
   CH02_INS1 "Runaway tram" (story 5460–5502, spliced at Ch 2 story 836): ARCHIVE goes back for another ride on
   the roof of an east-side tram; it speeds up, brakes hard at Fountain Plaza and flings ARCHIVE into the fountain.
   CH03_INS1 "River race" (story 5510–5550, spliced at Ch 3 story 1344): inside the forest world, ARCHIVE and Tock
   race down the river; Tock takes a shortcut over the trees. */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
G.ARCHIVE_SFX_EXT = G.ARCHIVE_SFX_EXT || {};
const A0=5460, A1=5502, AT_A=836;   // runaway tram
const B0=5510, B1=5550, AT_B=1344;  // river race
G.ARCHIVE_INSERTS = (G.ARCHIVE_INSERTS||[]).concat([
  {id:'CH02_INS1', at:AT_A, from:A0, to:A1, title:'Runaway tram'},
  {id:'CH03_INS1', at:AT_B, from:B0, to:B1, title:'River race'}]);

G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,V,Track,dialogue} = K;
  const T=W.tr, PI=Math.PI;
  const at=t=>A.tr.pos.at(t);
  const copyState=(t0,src)=>{ for(const k in T) if(T[k].at) T[k].cut(t0,T[k].at(src)); for(const k in A.tr) if(A.tr[k].at) A.tr[k].cut(t0,A.tr[k].at(src)); for(const k in C.tr) if(C.tr[k].at) C.tr[k].cut(t0,C.tr[k].at(src)); };
  const D=(t,dur,text,emotion,scene,who='ARCHIVE')=>dialogue.push({character:who,text,start:t,end:t+dur,emotion,scene,audio:null,face:emotion});
  const TK=(t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'TOCK'); S(t,'tock_voice',{n:Math.max(2,Math.round(text.length/4))}); };

  // ===================== CH02_INS1 · Runaway tram =====================
  copyState(A0,AT_A-.1);
  const start=at(A0), tockStart=T.tockPos.at(A0);
  // tram motion: speed profile from boarding (u=8) on; the car's centre z = 2 - distance travelled
  const v=u=> u<10?4 : u<15?4+(u-10)*1.6 : u<16?12 : u<18.5?12*(1-(u-16)/2.5) : 0;
  const DT=.05, N=Math.ceil((A1-A0)/DT)+2, dist=new Float64Array(N); for(let i=1;i<N;i++){ const u=(i-1)*DT; dist[i]=dist[i-1]+v(u)*DT; }
  const travelled=u=>{ const f=Math.max(0,Math.min(u/DT,N-2)), i=Math.floor(f); return dist[i]+(dist[i+1]-dist[i])*(f-i); };
  const d8=travelled(8), carZ=t=>2-(travelled(t-A0)-d8);           // also valid before boarding (car approaching from +z)
  const ph=t=>45-carZ(t);                                          // east-side car k=1 sits at z = -phase + 45
  W.exts.push((t,s)=>{ if(t<A0-.5||t>A1+.5) return; s.cityU=[1,ph(t),t*1.0,0]; });
  TK(A0+1,2.2,'Rule nine: do not ride on the roof.','stern','CH02_INS1');
  A.express(A0+3,'playful',.3); D(A0+3.4,1.2,'Just once!','playful','CH02_INS1'); S(A0+3.4,'voice',{pattern:'giggle'});
  const roof=t=>[9.5,8.25,carZ(t)];
  A.faceToward(A0+4,.8,roof(A0+8)); A.flyTo(A0+4.4,3.6,roof(A0+8),'inOut'); A.thrust(A0+4.4,1,1.1);
  for(let u=8;u<=16.8;u+=.25) A.tr.pos.key(A0+u,roof(A0+u),'lin');
  A.turnTo(A0+8,.6,PI); A.arms(A0+8.4,.6,[2.4,1.1,.2],[2.4,1.1,.2]); A.express(A0+8.6,'excited',.4); A.thrust(A0+8,1,.5);
  D(A0+9,1.6,'Wheeeee!','excited','CH02_INS1'); S(A0+9,'voice',{pattern:'yawn'});
  for(let u=4;u<=17;u+=.5) T.tockPos.key(A0+u,[8.6,9.9,carZ(A0+u)+3.8],'lin');
  TK(A0+13,1.6,'It is speeding up!','panic','CH02_INS1');
  A.express(A0+14.6,'worried',.3); D(A0+15,1.2,'Is that bad?','worried','CH02_INS1'); S(A0+15,'voice',{pattern:'q'});
  TK(A0+16.2,1,'BRAKES!','panic','CH02_INS1'); S(A0+16,'tram_brake',{d:2.5});
  // flung forward and left, into the fountain
  const F=[0,1.5,-70], f0=roof(A0+16.8);
  const arc=[]; for(let k=1;k<=8;k++){ const s=k/8; arc.push([A0+16.8+s*1.8,[f0[0]+(F[0]-f0[0])*s, f0[1]+(F[1]-f0[1])*s+Math.sin(s*PI)*3.2, f0[2]+(F[2]-f0[2])*s]]); }
  for(const [t,p] of arc) A.tr.pos.key(t,p,'lin');
  A.tr.roll.key(A0+16.8,0,'lin').key(A0+18.6,PI*2,'lin'); A.tr.roll.cut(A0+18.61,0); A.arms(A0+16.8,.2,[1.6,.8,.2],[1.6,.8,.2],'out');
  A.express(A0+16.8,'surprised',.1); S(A0+16.9,'voice',{pattern:'eep'});
  A.tr.pos.key(A0+18.9,[0,.7,-70],'out'); S(A0+18.7,'splash');
  T.jets.key(A0+18.6,T.jets.at(A0+18.6),'lin').key(A0+18.8,[3.2,3.2,3.2,3.2],'out').key(A0+21,[1.2,1.2,1.2,1.2],'in');
  A.tr.pos.key(A0+20,[0,2.2,-70],'outBack'); A.rest(A0+19.6,.6); A.express(A0+20.2,'confused',.4); A.tr.jitter.key(A0+20,0,'lin').key(A0+20.2,.3).key(A0+21.4,0);
  D(A0+20.8,1,'\u2026Ow.','confused','CH02_INS1'); S(A0+20.8,'voice',{pattern:'phew'});
  T.tockPos.key(A0+18,V.add(roof(A0+18),[0,1.4,3]),'lin').key(A0+22,[1.4,3.2,-68.4],'inOut');
  T.tockEye.key(A0+22,T.tockEye.at(A0+22),'lin').key(A0+22.6,[.45,0,0,0]); TK(A0+23,1.2,'Rule nine.','stern','CH02_INS1');
  A.express(A0+24.6,'happy',.4); D(A0+25,1.2,'Worth it.','happy','CH02_INS1'); S(A0+25,'voice',{pattern:'giggle'});
  T.tockEye.key(A0+26.4,[.45,0,0,0],'lin').key(A0+27,[.85,0,0,.6]);
  // back to where the story continues
  A.faceToward(A0+29,1,start); A.flyTo(A0+30,9,start,'inOut'); A.thrust(A0+30,1,.9); A.thrust(A0+39,1,A.tr.thrust.at(AT_A)); S(A0+30.2,'whoosh',{d:5,soft:1});
  A.turnTo(A0+39,2,A.tr.yaw.at(AT_A)); A.express(A0+39,'happy',.6);
  T.tockPos.key(A0+30,[1.4,3.2,-68.4],'lin').key(A0+40,tockStart,'inOut');
  // cameras
  C.shot(A0,[2,5,16],[6,7.4,6],48); C.move(A0,8,[2.6,5.4,13],[8,7.6,3],46,'inOut');
  for(let u=8;u<=12;u+=.5) C.tr.pos.key(A0+u,[4.6,9.6,carZ(A0+u)+3.2],'lin'), C.tr.tgt.key(A0+u,[9.5,8.4,carZ(A0+u)],'lin');
  C.shot(A0+12,[7,7.6,carZ(A0+12)-6.5],[9.5,8.4,carZ(A0+12)],50);
  for(let u=12.5;u<=16;u+=.5) C.tr.pos.key(A0+u,[7,7.6,carZ(A0+u)-6.5],'lin'), C.tr.tgt.key(A0+u,[9.5,8.4,carZ(A0+u)],'lin');
  C.shot(A0+16,[-7,5,-56],[4,5,-67],52); C.move(A0+16,3,[-7.4,4.6,-57],[1.6,3,-69],50,'lin');
  C.shot(A0+19,[2.8,2.6,-64.8],[0,1.8,-70],40); C.move(A0+19,9,[2.6,2.4,-65.4],[0,1.9,-70],38,'lin');
  C.shot(A0+28,[4,4,-58],V.lerp([0,2.2,-70],start,.3),48); C.move(A0+28,14,V.add(start,[3,2,6]),start,46,'inOut');

  // ===================== CH03_INS1 · River race =====================
  copyState(B0,AT_B-.1);
  const bStart=at(B0), bTock=T.tockPos.at(B0);
  const rx=z=>6*Math.sin(z*.05), riv=(z,y=.95)=>[rx(z),y,z];
  TK(B0+.8,1.2,'Race you.','playful','CH03_INS1'); A.express(B0+1.6,'excited',.3); D(B0+2,1.4,'You\u2019re on!','excited','CH03_INS1'); S(B0+2,'voice',{pattern:'hi'});
  // to the start line
  A.faceToward(B0+2.6,.6,riv(-48)); A.flyTo(B0+3,3,riv(-48),'inOut'); T.tockPos.key(B0+6,V.add(riv(-48),[1.2,.5,0]),'inOut');
  S(B0+6.2,'race_start');
  // the race: skimming down the river bends
  const pts=[]; for(let z=-48;z>=-150;z-=8.5) pts.push(riv(z,.9+.15*Math.sin(z)));
  A.path(B0+6.6,pts,18,'in'); A.thrust(B0+6.6,1,1.5); A.express(B0+7,'determined',.4); S(B0+7,'whoosh',{d:6}); S(B0+13,'whoosh',{d:6}); S(B0+19,'whoosh',{d:6});
  for(let k=0;k<pts.length-1;k++){ const t=B0+6.6+18*k/(pts.length-1); A.faceToward(t,.5,pts[k+1]); }
  A.tr.roll.key(B0+11,0,'lin').key(B0+12,-.5,'inOut').key(B0+13.4,.5,'inOut').key(B0+14.6,0,'inOut');
  // Tock: alongside, then up and over the trees
  for(let k=0;k<=8;k++){ const t=B0+6.6+k*1; T.tockPos.key(t,V.add(at(t+.2),[-1.6,.9,-.6]),'lin'); }
  T.tockPos.key(B0+16,[2,8,-100],'inOut').key(B0+22.6,V.add(riv(-150),[0,1.4,-3]),'inOut');
  TK(B0+14.8,1.4,'See you at the finish!','playful','CH03_INS1');
  D(B0+17,1.2,'Hey!','surprised','CH03_INS1'); S(B0+17,'voice',{pattern:'eep'});
  A.express(B0+24.4,'frustrated',.3); D(B0+25,1.6,'That\u2019s cheating!','frustrated','CH03_INS1'); S(B0+25,'voice',{pattern:'eep'});
  T.tockEye.key(B0+25.6,T.tockEye.at(B0+25.6),'lin').key(B0+26.2,[.85,0,0,.9]); TK(B0+26.4,2.6,'Courier rule three: know the shortcuts.','proud','CH03_INS1');
  A.express(B0+29.4,'happy',.4); S(B0+29.4,'voice',{pattern:'giggle'});
  // back to the clearing, high over the trees
  A.faceToward(B0+30,.8,bStart); A.path(B0+30.6,[[0,9,-130],[0,9,-80],bStart],9,'inOut'); A.thrust(B0+30.6,1,1.1); A.thrust(B0+39.6,.4,A.tr.thrust.at(AT_B));
  A.turnTo(B0+38,1.6,A.tr.yaw.at(AT_B)); A.tr.roll.cut(B0+30,0);
  T.tockPos.key(B0+31,V.add(riv(-150),[0,3,0]),'lin').key(B0+39.6,bTock,'inOut');
  // cameras: low chase over the water, side tracking, overhead
  C.shot(B0,V.add(bStart,[2.6,1,3.2]),bStart,40); C.move(B0,6,[3,4,-42],riv(-48),46,'inOut');
  for(let u=6.6;u<=14;u+=.5){ const p=at(B0+u); C.tr.pos.key(B0+u,[p[0]+.6,p[1]+.55,p[2]+3.6],'lin'); C.tr.tgt.key(B0+u,V.add(at(B0+u+.6),[0,.1,-2]),'lin'); }
  C.tr.fov.key(B0+6.6,58,'lin');
  C.shot(B0+14,[12,14,-110],[0,2,-120],50); C.move(B0+14,6,[10,16,-122],[0,2,-136],52,'lin');
  C.shot(B0+20,V.add(at(B0+20),[-3,1,-4]),at(B0+20),46); C.move(B0+20,4,V.add(at(B0+24),[-3,1.2,-4.4]),at(B0+24),44,'lin');
  C.shot(B0+24.2,V.add(riv(-150),[2.4,1.4,-3.4]),V.lerp(at(B0+25),V.add(riv(-150),[0,1.4,-3]),.5),38); C.move(B0+24.2,6,V.add(riv(-150),[2.2,1.4,-3]),V.lerp(at(B0+25),V.add(riv(-150),[0,1.4,-3]),.5),36,'lin');
  C.shot(B0+30.4,[8,16,-110],at(B0+33),56); C.move(B0+30.4,9.6,V.add(bStart,[3,3,6]),bStart,46,'inOut');
});

G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,CH,beat}=K, e8=beat/2;
  // runaway tram: a galloping pluck figure that speeds up, a crash chord, then a comic tag
  let t=5460+4, step=.36; while(t<5476.4){ add(t,.2,[72,76,79,76][Math.round((t-5464)/step)%4],'pluck',.55,0); t+=step; step=Math.max(.16,step*.975); }
  for(let k=0;k<8;k++) add(5468+k*1.1,.6,[36,43][k%2],'bass',.5,0);
  ['Cmaj7','G','Am7','Fmaj7'].forEach((c,b)=>chord(5468+b*2.2,2.3,CH[c].map(x=>x+12),'strings',.3,{att:.2}));
  add(5478.7,1,36,'timp',1.1,0); chord(5478.7,.8,[60,64,67,71],'brass',.4,{});
  [[5480.8,67],[5481.1,64],[5481.4,60]].forEach(([t,m])=>add(t,.3,m,'pluck',.5,0));
  [[5485,72],[5485.3,76],[5485.6,79],[5485.9,84]].forEach(([t,m])=>add(t,.3,m,'celesta',.5,0));
  chord(5490,12,CH.Cmaj7.map(x=>x+12),'pad',.28,{att:2});
  // river race: driving 16ths over the pastoral harmony, a raspberry when Tock wins
  for(let k=0;k<Math.floor(18/(e8*.5));k++) add(5516.6+k*e8*.5,e8*.4,[72,76,79,84,79,76][k%6],'pluck',.4,(k%2?.4:-.4));
  ['Cmaj7','Fmaj7','Am7','G','Cmaj7','Fmaj7','Dm9','Gsus'].forEach((c,b)=>{ chord(5516.6+b*2.25,2.3,CH[c].map(x=>x+12),'strings',.28,{att:.2}); add(5516.6+b*2.25,2.2,CH[c][0]-12,'bass',.5,0); });
  [[5536.4,79],[5536.7,78],[5537,77],[5537.3,74]].forEach(([t,m])=>add(t,.35,m,'brass',.4,0));
  chord(5540,10,CH.Fmaj7.map(x=>x+12),'pad',.28,{att:2});
});
Object.assign(G.ARCHIVE_SFX_EXT,{
  tram_brake:(S,c)=>{ S({t:c.t,d:c.d,i:'noiseSweep',f0:4000,f1:900,g:.5}); S({t:c.t,d:c.d,i:'chirp',f0:2400,f1:1800,g:.3}); },
  splash:(S,c)=>{ S({t:c.t,d:1.6,i:'noiseSweep',f0:2000,f1:300,g:.7}); S({t:c.t,d:.5,i:'thump',f:60,k:5,g:.6}); },
  race_start:(S,c,u)=>{ [0,.6,1.2].forEach((k,j)=>S({t:c.t+k,d:.2,f:u.mtof(j<2?84:96),i:'bell',v:.5})); },
});
})(typeof window!=='undefined'?window:globalThis);
