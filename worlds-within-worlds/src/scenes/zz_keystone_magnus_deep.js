/* STORY v2 — the Keystone, Magnus, and the deep temple
   · Keystone shards: 1 rises from Verdance's fountain (Ch 2), 2 ejects from Ferrum's core when the grid is shared
     (Ch 4), 3 lies on the altar of Thalassa's sunken temple (Ch 5 insert), 4 rises from the green world ARCHIVE
     saved (Ch 7). At the Core (Ch 8) the four come together as the Keystone in the Seat.
   · Magnus, the Warden Prime, is first seen in Ferrum, towering in the far district, drinking the leak.
   · CH05_INS1 "The deep temple" (story 5600–5664, spliced at story 2629): the healed reef wakes a leviathan, which
     carries ARCHIVE and Tock down a blue hole to the sunken temple; Wardens follow; the leviathan saves them. */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
G.ARCHIVE_SFX_EXT = G.ARCHIVE_SFX_EXT || {};
const I0=5600, I1=5664, AT=2629;
G.ARCHIVE_INSERTS=(G.ARCHIVE_INSERTS||[]).concat([{id:'CH05_INS1',at:AT,from:I0,to:I1,title:'The deep temple'}]);
const HUD=(t0,t1,lines,extra={})=>Object.assign({t0,t1,lines,x:.05,y:.1,px:36,color:'#FFD98A'},extra);
const CNT=(t0,t1,n)=>({t0,t1,lines:[`KEYSTONE ${'\u25C6'.repeat(n)}${'\u25C7'.repeat(4-n)} ${n}/4`],x:.73,y:.07,px:28,color:'#FFD98A',panel:false});
G.ARCHIVE_HOLOTEXT=(G.ARCHIVE_HOLOTEXT||[]).concat([
  HUD(781,792,['KEYSTONE SHARD FOUND','1 / 4  \u2014  VERDANCE']), CNT(792,1620,1),
  HUD(1955,1966,['KEYSTONE SHARD FOUND','2 / 4  \u2014  FERRUM'],{x:.05,y:.82}), CNT(1966,2629,2),
  HUD(I0+8,I0+14,['SHARD 3 DETECTED','DEPTH 14 m \u2014 BLUE HOLE']), HUD(I0+33,I0+40,['KEYSTONE SHARD FOUND','3 / 4  \u2014  THALASSA']), CNT(2629,3584,3),
  HUD(3584,3596,['KEYSTONE COMPLETE','4 / 4  \u2014  ALL SHARDS']), CNT(3596,4232,4),
  {t0:1996,t1:2012,world:4,pos:[-8,51,-150],size:2.2,lines:['UNKNOWN \u00B7 WARDEN PRIME','ENERGY DRAW: 100%'],color:'#FF9A8A'},
]);

G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,V,Track,dialogue} = K;
  const T=W.tr, PI=Math.PI;
  const at=t=>A.tr.pos.at(t), chest=t=>V.add(at(t),[0,-.27,.35]);
  const D=(t,dur,text,emotion,scene,who='ARCHIVE')=>dialogue.push({character:who,text,start:t,end:t+dur,emotion,scene,audio:null,face:emotion});
  const TK=(t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'TOCK'); S(t,'tock_voice',{n:Math.max(2,Math.round(text.length/4))}); };
  // ---------- shard tracks (one per shard) ----------
  const K4=[0,1,2,3].map(()=>new Track([0,-60,0,0])); K4.forEach((k,i)=>T['key'+i]=k);
  const fly=(k,t0,from,t1,mid,t2,toFn)=>{ k.cut(t0,[...from,1]); k.key(t1,[...mid,1],'inOut'); for(let tt=t1+.25;tt<=t2;tt+=.25) k.key(tt,[...V.lerp(mid,toFn(t2),(tt-t1)/(t2-t1)),1],'lin'); k.key(t2+.05,[0,-60,0,0],'cut'); S(t2,'shard_get'); };
  // 1 · Verdance fountain
  fly(K4[0],776,[0,1.2,-70],779,[0,3.3,-68.2],781,chest); S(776,'shard_rise');
  A.express(779,'excited',.3); D(779.2,1.4,'A shard!','excited','CH02_SC02'); S(779.2,'voice',{pattern:'eep'}); A.activate(781,3,1.8);
  // 2 · Ferrum core A
  fly(K4[1],1952,[12,14.6,-76],1953.6,[11,12.4,-76],1955,chest); S(1952,'shard_rise'); A.activate(1955,3,1.8);
  // 4 · the green world ARCHIVE held on to (Ch 7)
  fly(K4[3],3578,[-9,4,-145],3581.5,[-3,2.6,-134],3584,chest); S(3578,'shard_rise'); A.activate(3584,3,1.8);
  D(3585,2.2,'The last shard\u2026 thank you.','relieved','CH07_SC02'); S(3585,'voice',{pattern:'hi'});
  // Ch 8: the four shards leave ARCHIVE's chest and become the Keystone in the Seat's socket
  const SOCK=[0,.6,-69.3], off=[[0,.38,0],[.38,0,0],[0,-.38,0],[-.38,0,0]];
  K4.forEach((k,i)=>{ k.cut(4222,[...chest(4222),1]); k.key(4225,[...V.add(chest(4225),V.mul(off[i],2.4)),1],'out'); k.key(4229,[...V.add(SOCK,off[i]),1],'inOut'); k.key(4656,[...V.add(SOCK,off[i]),1],'lin'); k.key(4657,[0,-60,0,0],'cut'); });
  S(4225,'shard_rise'); S(4229,'keystone_lock');
  W.exts.push((t,s)=>{ const vis=K4.some((k,i)=>s['key'+i][3]>.5); if(!vis) return;
    s.U=Object.assign(s.U||{},{ uKey:[].concat(...K4.map((k,i)=>s['key'+i])), uKeyB:[t*1.2,.6,0,0] }); });

  // ---------- Magnus in Ferrum: towering in the far district, drinking the leak ----------
  T.mag=new Track([0,-60,0,0]); T.mag.cut(1995,[-8,40,-150,1]); T.mag.key(2008,[-8,40,-150,1],'lin').key(2013,[-8,72,-170,1],'in'); T.mag.key(2013.05,[0,-60,0,0],'cut');
  W.exts.push((t,s)=>{ if(t<1994||t>2014) return; s.U=Object.assign(s.U||{},{ uWar:[...s.mag,0,-60,0,0,0,-60,0,0], uWarB:[0,0,14,0, 0,0,1,0, 0,0,1,0] }); });
  S(1996,'magnus_hum',{d:16});
  C.shot(1997.6,[-2,5.5,-92],[-8,38,-150],38); C.move(1997.6,2.3,[-2.2,5.4,-92.6],[-8,40,-150],36,'lin'); // a clear look up the avenue at Magnus
  TK(2012,1.8,'Something up there is drinking it.','worried','CH04_SC03');

  // ======================= CH05_INS1 · The deep temple =======================
  for(const k in T) if(T[k].at) T[k].cut(I0,T[k].at(AT-.1));
  for(const k in A.tr) if(A.tr[k].at) A.tr[k].cut(I0,A.tr[k].at(AT-.1));
  for(const k in C.tr) if(C.tr[k].at) C.tr[k].cut(I0,C.tr[k].at(AT-.1));
  const S0=at(I0), TK0=T.tockPos.at(I0);
  const LAG=[0,0,-22], RN=[]; for(let i=0;i<6;i++){ const a=i*1.047+.3, r=7+2.5*(i%2); RN.push([LAG[0]+Math.cos(a)*r,-2.2,LAG[2]+Math.sin(a)*r]); }
  T.levP=new Track([-6,-12,-30],true); T.levV=new Track(0); T.w0=new Track([0,-60,0,0]); T.w1=new Track([0,-60,0,0]);
  const L=T.levP; const u=x=>I0+x;
  L.cut(u(0),[-6,-12,-30]); L.key(u(5),[-6,.4,-28],'out').key(u(7),[-6.4,-.3,-29],'inOut').key(u(11),[-7,-.4,-31],'inOut')
   .key(u(16),[-11,-3.4,-37],'inOut').key(u(22),[-15,-4.2,-43],'inOut').key(u(30),[-14,-3.6,-45],'inOut')
   .key(u(38),[-16,-3.4,-42],'inOut').key(u(42),[-14.5,-8.4,-44],'in').key(u(45),[-15,-5.4,-44],'out')
   .key(u(52),[-10,1.6,-34],'out').key(u(54),[-9,-1,-33],'in').key(u(60),[-8,-14,-30],'in');
  T.levV.cut(u(0),1); T.levV.key(u(60),1,'lin').key(u(60.1),0,'cut');
  const levAt=t=>L.at(t), levYaw=t=>{ const a=levAt(t-.15), b=levAt(t+.15); return Math.atan2(b[0]-a[0],b[2]-a[2]); }, levPitch=t=>{ const a=levAt(t-.15), b=levAt(t+.15); return -Math.atan2(b[1]-a[1],Math.hypot(b[0]-a[0],b[2]-a[2])+1e-4)*.8; };
  W.exts.push((t,s)=>{ if(t<I0-.5||t>I1+.5) return;
    s.U=Object.assign(s.U||{},{ uThal:[.32,1,t*.45,0], uReef:[1,30,0,t*.25], uLumen:[4,-1.6,-24,1.2], uLumB:[1,.3,1,0], uRN:[].concat(...RN),
      uLev:[...levAt(t),s.levV], uLevB:[levYaw(t),levPitch(t),t*2.2,1], uWar:[...s.w0,...s.w1,0,-60,0,0], uWarB:[0,0,1.1,.7, 0,0,1.1,.7, 0,0,1,0] }); });
  const ride=t=>V.add(levAt(t),[0,2.2,0]);
  // the leviathan rises
  S(u(1),'leviathan_rise'); A.lookAt(u(2),1.2,[-6,0,-28]); A.express(u(3),'surprised',.2); A.tr.jitter.key(u(4.6),0,'lin').key(u(4.8),.3).key(u(5.8),0);
  TK(u(5),1.6,'That is\u2026 large.','worried','CH05_INS1'); S(u(7),'whale_song',{d:4});
  A.express(u(8),'curious',.6); D(u(9.6),1.4,'Down there?','curious','CH05_INS1'); S(u(9.6),'voice',{pattern:'q'});
  C.shot(u(0),V.add(S0,[3,1.2,4]),[-6,0,-28],50); C.move(u(0),11,V.add(S0,[4,1.8,6]),[-6,.5,-28],54,'inOut');
  // aboard, and down the blue hole
  A.faceToward(u(11),.6,ride(u(12.5))); A.flyTo(u(11.4),1.4,ride(u(12.8)),'inOut');
  for(let x=12.8;x<=24;x+=.25) A.tr.pos.key(u(x),ride(u(x)),'lin');
  A.turnTo(u(13),2,levYaw(u(14))); A.express(u(13),'excited',.4); D(u(13.4),1.4,'Wheee\u2014blub!','excited','CH05_INS1'); S(u(13.4),'voice',{pattern:'giggle'});
  for(let x=11;x<=24;x+=.5) T.tockPos.key(u(x),V.add(ride(u(x)),[.8,.6,.8]),'lin');
  TK(u(16),2.2,'I am not rated for submersion!','panic','CH05_INS1'); S(u(16.4),'dive_bubbles',{d:8});
  C.shot(u(11),[-2,2.4,-22],levAt(u(13)),52); C.move(u(11),5,[-4,.6,-26],levAt(u(16)),56,'inOut');
  C.shot(u(16),[-11,-1.8,-33],levAt(u(19)),58); C.move(u(16),8,[-12,-5.6,-36],levAt(u(23)),58,'inOut');
  // the temple
  const ALT=[-15,-12.55,-44], FRONT=[-15,-11.8,-42.3];
  A.flyTo(u(24.2),4,FRONT,'inOut'); A.faceToward(u(26),1.4,ALT); A.express(u(26),'surprised',.4); S(u(25),'temple_glow',{d:6});
  T.tockPos.key(u(28),V.add(FRONT,[1.2,.5,.6]),'inOut');
  C.shot(u(24),[-19.6,-10.4,-41.4],[-15,-12,-44],54); C.move(u(24),6,[-19.1,-11,-41.8],[-15,-12.4,-44],50,'inOut');
  K4[2].cut(u(30),[...ALT,1]); K4[2].key(u(31.6),[...V.add(ALT,[0,.9,0]),1],'out'); for(let x=31.85;x<=33;x+=.25) K4[2].key(u(x),[...V.lerp(V.add(ALT,[0,.9,0]),chest(u(33)),(x-31.6)/1.4),1],'lin');
  K4[2].key(u(33.05),[0,-60,0,0],'cut'); S(u(30),'shard_rise'); S(u(33),'shard_get'); A.reach(u(31.4),.5); A.rest(u(33),.5); A.activate(u(33),3,1.8);
  A.express(u(33.4),'excited',.3); D(u(33.6),1.2,'Three!','excited','CH05_INS1'); S(u(33.6),'voice',{pattern:'hi'});
  C.shot(u(30),V.add(FRONT,[1.6,.4,1.6]),V.lerp(FRONT,ALT,.5),36); C.move(u(30),4,V.add(FRONT,[1.4,.4,1.4]),V.lerp(FRONT,ALT,.5),34,'lin');
  // Wardens dive in after the shard
  const W0=T.w0, W1=T.w1, circ=(a,r,y)=>[-15+Math.cos(a)*r,y,-44+Math.sin(a)*r];
  W0.cut(u(34),[-12,.5,-40,1]); W1.cut(u(34),[-18,.5,-47,1]); W0.key(u(37),[...circ(.8,3.4,-10.8),1],'in'); W1.key(u(37.4),[...circ(2.6,3.6,-11.4),1],'in');
  S(u(34),'warden_wake'); A.express(u(35),'worried',.3); TK(u(35.6),1.4,'Wardens!','panic','CH05_INS1');
  const dodge=[]; for(let k=0;k<6;k++) dodge.push(circ(1.6+k*1.05,3.2,-11.4+Math.sin(k)*.8));
  A.path(u(36.6),dodge,5.2,'inOut'); A.thrust(u(36.6),1,1.5); S(u(36.6),'whoosh',{d:3}); S(u(39),'warden_chase',{d:4});
  for(let x=37.4;x<=41.6;x+=.4){ const p=at(u(x-.9)), q=at(u(x-1.3)); W0.key(u(x),[...p,1],'lin'); W1.key(u(x+.2),[...V.add(q,[.4,-.3,.3]),1],'lin'); }
  // the leviathan sweeps through and bats them away with its tail
  S(u(42),'leviathan_swat'); W0.key(u(42.2),[...at(u(41.4)),1],'lin').key(u(44.5),[-5,-2,-60,1],'out').key(u(44.6),[0,-60,0,0],'cut');
  W1.key(u(42.4),[...at(u(41)),1],'lin').key(u(44.8),[-28,-3,-30,1],'out').key(u(44.9),[0,-60,0,0],'cut');
  A.express(u(42.6),'surprised',.2); A.tr.jitter.key(u(42.4),0,'lin').key(u(42.6),.35).key(u(43.6),0);
  C.shot(u(36.4),[-15,-6.4,-37],[-15,-11.2,-44],58); C.move(u(36.4),8.6,[-10.6,-7.6,-41],[-15,-10.6,-44],60,'inOut');
  // up and out, a breach, a thank-you
  A.flyTo(u(45),1.4,ride(u(46.4)),'inOut'); for(let x=46.4;x<=52;x+=.25) A.tr.pos.key(u(x),ride(u(x)),'lin');
  A.tr.pos.key(u(53.4),V.add(ride(u(52)),[1,2.4,1.2]),'out'); S(u(52),'splash');
  for(let x=45;x<=53;x+=.5) T.tockPos.key(u(x),V.add(at(u(x)),[.9,.6,.9]),'lin');
  A.express(u(52.4),'excited',.3); A.faceToward(u(53.6),1,levAt(u(55))); A.wave(u(54.4),2,'R');
  D(u(54.6),1.6,'Thank you!','happy','CH05_INS1'); S(u(54.6),'voice',{pattern:'hi'}); S(u(55.4),'whale_song',{d:3});
  C.shot(u(45),[-15,-3,-36],levAt(u(48)),56); C.move(u(45),6.6,[-12,-1,-30],levAt(u(51)),58,'inOut');
  C.shot(u(51.6),[-2,3,-26],[-9,2,-33],50); C.move(u(51.6),6,[-1,3.6,-24],[-9,1,-33],50,'lin');
  // back to the story
  A.faceToward(u(57.6),1,S0); A.flyTo(u(58),5.6,S0,'inOut'); A.turnTo(u(62),1.6,A.tr.yaw.at(AT)); T.tockPos.key(u(58),V.add(at(u(58)),[.9,.6,.9]),'lin').key(u(63.6),TK0,'inOut');
  C.shot(u(57.6),V.add(S0,[4,2,6]),S0,46); C.move(u(57.6),6.4,V.add(S0,[3,1.6,5]),S0,44,'inOut');
});

G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,CH,beat,theme}=K;
  [[776,84],[776.4,88],[776.8,91],[781,96]].forEach(([t,m])=>add(t,2,m,'bell',.5,0));
  [[1952,84],[1952.4,88],[1955,96]].forEach(([t,m])=>add(t,2,m,'bell',.5,0));
  [[3578,84],[3578.4,88],[3578.8,91],[3584,96]].forEach(([t,m])=>add(t,2,m,'bell',.5,0));
  chord(1996,16,[37,40,44,49],'brass',.32,{}); add(1996,16,25,'drone',.5,0,{att:2});
  chord(4225,8,[60,64,67,72,76],'strings',.36,{att:.5});
  // the deep temple: awe, a dive, the temple, a chase, a breach
  const I0=5600; chord(I0,11,[41,48,53,57,60],'pad',.42,{att:3}); add(I0+1,10,29,'drone',.45,0,{att:2});
  ['Dm9','Bbmaj7','Fadd9','Cmaj7'].forEach((c,b)=>{ chord(I0+11+b*3.2,3.3,CH[c].map(x=>x+12),'strings',.32,{att:.4}); add(I0+11+b*3.2,3.2,CH[c][0]-12,'bass',.45,0); });
  chord(I0+24,9,[45,52,57,60,64],'pad',.4,{att:2}); for(let k=0;k<12;k++) add(I0+25+k*.7,.6,[81,84,88,93][k%4],'celesta',.3,Math.sin(k)*.5);
  [[I0+33,84],[I0+33.3,88],[I0+33.6,91],[I0+33.9,96]].forEach(([t,m])=>add(t,2,m,'bell',.5,0));
  for(let k=0;k<20;k++) add(I0+34+k*.4,.25,[50,53,57,53][k%4]+(k>10?12:0),'pluck',.55,(k%2?.35:-.35));
  add(I0+42,1,31,'timp',1.2,0); chord(I0+42,1.4,[49,53,56],'brass',.45,{});
  theme.forEach(([b,m,d])=>add(I0+45+b*beat*.85,d*beat*.85,m+12,'brass',.5,0));
  add(I0+52,1,36,'timp',1.2,0); chord(I0+52,8,[48,55,60,64,67],'strings',.4,{att:.2});
});
Object.assign(G.ARCHIVE_SFX_EXT,{
  shard_rise:(S,c)=>{ S({t:c.t,d:2.6,i:'hum',f0:220,f1:440,g:.3}); S({t:c.t,d:2,i:'noiseSweep',f0:500,f1:4000,g:.25}); },
  shard_get:(S,c,u)=>{ [84,88,91,96].forEach((m,k)=>S({t:c.t+k*.08,d:.5,f:u.mtof(m),i:'bell',v:.45})); S({t:c.t,d:.5,i:'thump',f:80,k:5,g:.5}); },
  keystone_lock:(S,c)=>{ S({t:c.t,d:1,i:'thump',f:60,k:4,g:.9}); S({t:c.t,d:3,i:'hum',f0:110,f1:220,g:.45}); },
  magnus_hum:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:38,f1:34,g:.55}); for(let k=0;k<c.d;k+=4) S({t:c.t+k,d:1.2,i:'thump',f:30,k:1,g:.4}); },
  leviathan_rise:(S,c)=>{ S({t:c.t,d:5,i:'noiseSweep',f0:150,f1:1200,g:.45}); S({t:c.t+3.8,d:2,i:'noiseSweep',f0:2000,f1:300,g:.6}); },
  whale_song:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:110,f1:175,g:.45}); S({t:c.t+c.d*.5,d:c.d*.5,i:'hum',f0:175,f1:98,g:.4}); },
  dive_bubbles:(S,c)=>{ for(let k=0;k<c.d;k+=.35) S({t:c.t+k,d:.12,i:'chirp',f0:600+((k*170)%500),f1:1200,g:.12}); },
  temple_glow:(S,c,u)=>{ S({t:c.t,d:c.d,i:'hum',f0:147,f1:147,g:.25}); },
  leviathan_swat:(S,c)=>{ S({t:c.t,d:1.4,i:'noiseSweep',f0:200,f1:2400,g:.6}); S({t:c.t+.4,d:.8,i:'thump',f:50,k:3,g:.9}); },
});
})(typeof window!=='undefined'?window:globalThis);
