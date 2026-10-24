/* PACING PASS + ACTION INSERT 1 — "The Warden" (Chapter 1)
   Protected ranges keep the film's intentional quiet moments at full length; everything else that is slow and
   silent is tightened by the edit (see buildEdit in engine.js). The inserts are new scenes authored in story time
   beyond 90:00 and spliced into the cut; the time they need comes out of the tightened stretches, so the film
   stays exactly 90 minutes.
   Insert CH01_INS1 (story 5400–5452, spliced at story 470): just before ARCHIVE leaves the Archive, a dormant
   Warden — one of the network's old maintenance drones, starved and gone wrong — wakes and chases it around the
   hall. ARCHIVE escapes by out-thinking it, and the Wardens become the film's recurring visible threat. */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SFX_EXT = G.ARCHIVE_SFX_EXT || {};
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
// chapter outros where ARCHIVE has already left through the portal and the camera only drifts over the empty world
G.ARCHIVE_SPEED = (G.ARCHIVE_SPEED||[]).concat([[1041,1075,3.5],[1566,1615,3.5],[2104,2154,4]]);
G.ARCHIVE_PROTECT = (G.ARCHIVE_PROTECT||[]).concat([
  [0,24],          // the awakening
  [2416,2560],     // Thalassa: watching and waiting (the point of the scene)
  [3497,3545],     // the silence after Tock is swept away
  [3966,4064],     // Alicia's memory
  [4680,4732],     // Alicia becomes solid
  [5236,5400],     // the last door, the wink, the title
]);
const I0=5400, I1=5452, AT=470;
G.ARCHIVE_INSERTS = (G.ARCHIVE_INSERTS||[]).concat([{id:'CH01_INS1', at:AT, from:I0, to:I1, title:'The Warden'}]);

G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,V,Track,dialogue} = K;
  const T=W.tr, PI=Math.PI;
  const D=(t,dur,text,emotion,who='ARCHIVE')=>dialogue.push({character:who,text,start:t,end:t+dur,emotion,scene:'CH01_INS1',audio:null,face:emotion});
  const at=t=>A.tr.pos.at(t);
  // start the insert from exactly the state of story 469.9 (world, actor, camera)
  const SRC=469.9;
  for(const k in T) if(T[k].at) T[k].cut(I0,T[k].at(SRC));
  for(const k in A.tr) if(A.tr[k].at) A.tr[k].cut(I0,A.tr[k].at(SRC));
  for(const k in C.tr) if(C.tr[k].at) C.tr[k].cut(I0,C.tr[k].at(SRC));
  // the Warden
  T.war0=new Track([0,-60,0,0]); T.warB0=new Track([0,0,1,0]);
  W.exts.push((t,s)=>{ if(t<I0-.5||t>I1+.5) return; s.U=Object.assign(s.U||{},{ uWar:[...s.war0,0,-60,0,0,0,-60,0,0], uWarB:[...s.warB0,0,0,1,0,0,0,1,0] }); });
  const WP=T.war0, WB=T.warB0;
  const home=[-9.6,5.6,-4.2];
  WP.cut(I0,[...home,1]); WB.cut(I0,[Math.PI*.4,0,1.15,0]);
  // a red light wakes among the shelves
  S(I0+.6,'warden_wake'); A.tr.headYaw.to(I0+1,.8,-1.1); A.express(I0+1.2,'curious',.4);
  C.shot(I0,[-4.6,5.2,-2],home,40); C.move(I0,4,[-5.4,5.4,-2.6],home,32,'in');
  WP.key(I0+3,[...home,1],'lin').key(I0+6,[-5.4,5.2,-6.4,1],'inOut'); WB.key(I0+3,[Math.PI*.4,0,1.15,0],'lin').key(I0+5,[Math.PI*.75,0,1.15,.6],'inOut');
  D(I0+4.6,1.4,'Uh\u2026 hello?','curious'); S(I0+4.6,'voice',{pattern:'q'});
  D(I0+6.2,1.2,'INTRUDER.','cold','WARDEN'); S(I0+6.2,'warden_voice');
  A.express(I0+6.6,'surprised',.15); A.tr.headYaw.to(I0+6.6,.4,0);
  C.shot(I0+4,V.add(at(I0),[1.4,.4,-2.2]),V.add(at(I0),[0,.4,0]),32); C.move(I0+4,2.4,V.add(at(I0),[1.3,.4,-2]),V.add(at(I0),[0,.4,0]),30,'lin');
  C.shot(I0+6.4,[-1.6,5.8,-3.2],V.lerp([-5.4,5.2,-6.4],at(I0+6.4),.45),46);
  // the chase: around the hall between the pillars
  const ring=(a,y,r=6.2)=>[Math.cos(a)*r,y,Math.sin(a)*r];
  const path=[at(I0+7), ring(-1.2,5.2), ring(-.4,4.2), ring(.5,3.0), ring(1.3,4.6), ring(2.1,6.2), ring(2.9,3.6), ring(3.6,2.4,5.4), ring(4.3,4.4,5.8)];
  A.path(I0+7,path,20,'inOut'); A.thrust(I0+7,.6,1.6); S(I0+7,'whoosh',{d:4}); S(I0+12,'whoosh',{d:4}); S(I0+17,'whoosh',{d:4}); S(I0+22,'whoosh',{d:4});
  for(let k=0;k<8;k++){ const t=I0+7+k*2.5; A.faceToward(t,.6,path[Math.min(k+2,path.length-1)]); }
  A.express(I0+7.4,'worried',.3);
  for(let tt=I0+8;tt<=I0+27;tt+=.5){ const p=at(tt-1.3); WP.key(tt,[p[0],p[1]+.1,p[2],1],'lin'); const q=at(tt-.9); WB.key(tt,[Math.atan2(q[0]-p[0],q[2]-p[2]),0,1.15,.6+.4*Math.sin(tt*3)],'lin'); }
  S(I0+8,'warden_chase',{d:20});
  A.spin(I0+12.6,1.2,1); A.tr.roll.key(I0+18,0,'lin').key(I0+19.4,Math.PI*2,'inOut'); A.tr.roll.cut(I0+19.41,0); S(I0+12.7,'spin'); S(I0+18.2,'spin');
  D(I0+10,1.2,'Nope! Nope!','worried'); S(I0+10,'voice',{pattern:'eep'});
  T.tockVis.cut(I0,0);
  C.shot(I0+7,[3,6,6],[-2,4.6,-3],56); for(const t of [I0+10,I0+13,I0+16,I0+19,I0+22,I0+25]) C.via(t,V.add(at(t),[0,1.6,0]).map((x,i)=>x-[2.6,0,2.6][i]*Math.sign(at(t)[i]||1)),at(t+.6));
  // the trick: ARCHIVE stops dead beside a pillar; the Warden overshoots and hits it
  const P=[Math.cos(4.95)*7.6,3.6,Math.sin(4.95)*7.6];      // just inside a pillar
  A.flyTo(I0+27,1.6,V.add(P,[.9,0,1.4]),'out'); A.tr.jitter.key(I0+28.4,0,'lin').key(I0+28.6,.3).key(I0+29.4,0);
  A.faceToward(I0+28,.6,[0,3,-6]); A.express(I0+28,'determined',.3);
  WP.key(I0+27,[...V.add(at(I0+25.7),[0,.1,0]),1],'lin').key(I0+29.2,[...V.add(P,[-.4,0,-.5]),1],'in');
  S(I0+29.2,'warden_crash'); WB.key(I0+29.2,[0,0,1.15,.6],'lin').key(I0+29.6,[0,0,1.15,1],'out');
  WP.key(I0+30,[...V.add(P,[-.9,-.7,-.9]),1],'out').key(I0+34,[...V.add(P,[-1.2,-2.6,-1.1]),1],'in');
  D(I0+30.4,1.4,'Sorry!','playful'); S(I0+30.4,'voice',{pattern:'giggle'});
  C.shot(I0+26.8,V.add(P,[3.4,1.4,3]),P,46); C.move(I0+26.8,6,V.add(P,[3.8,1.6,3.6]),V.add(P,[0,-.6,0]),48,'lin');
  // dazed on the floor, visor flickering — it isn't evil. It's starving.
  WB.key(I0+34,[0,0,1.15,1],'lin');
  A.lookAt(I0+33.4,1,V.add(P,[-1.2,-2.6,-1.1])); A.express(I0+34,'sad',.8); A.scan(I0+35,2.4); S(I0+35.2,'scan');
  D(I0+38,2.6,'It\u2019s not angry\u2026 it\u2019s out of power.','sad'); S(I0+38,'voice',{pattern:'q2'});
  C.shot(I0+33,V.add(P,[-3,-1.6,1.6]),V.add(P,[-1,-2.2,-.8]),40); C.move(I0+33,8,V.add(P,[-3.4,-1.4,2]),V.lerp(V.add(P,[-1.2,-2.6,-1.1]),at(I0+36),.5),42,'lin');
  // back to the door, with one last look
  A.faceToward(I0+42,.8,[0,4.9,-8]); A.flyTo(I0+42.6,7,[0,4.9,-8],'inOut'); A.thrust(I0+42.6,1,1.1); A.thrust(I0+49,1,.7); S(I0+42.8,'whoosh',{d:4});
  A.express(I0+44,'determined',.6); A.faceToward(I0+49.6,1.4,[0,5,-11]);
  D(I0+46,2.2,'I\u2019ll come back for you too.','determined'); S(I0+46,'voice',{pattern:'hi'});
  WP.key(I0+49,[...V.add(P,[-1.2,-2.6,-1.1]),1],'lin');
  C.shot(I0+41.6,[5,6,-2],[0,4.6,-8],46); C.move(I0+41.6,10.4,[4,6.4,-3.5],[0,4.9,-9],44,'inOut');
});

Object.assign(G.ARCHIVE_SFX_EXT,{
  warden_wake:(S,c)=>{ S({t:c.t,d:.4,i:'chirp',f0:180,f1:520,g:.5}); S({t:c.t+.5,d:1.6,i:'hum',f0:60,f1:90,g:.4}); },
  warden_voice:(S,c)=>{ [0,.25,.5].forEach(k=>S({t:c.t+k,d:.2,i:'chirp',f0:220,f1:160,g:.55,stem:'dialogue'})); },
  warden_chase:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:95,f1:120,g:.35}); for(let k=0;k<c.d;k+=1.1) S({t:c.t+k,d:.15,i:'chirp',f0:900,f1:600,g:.15}); },
  warden_crash:(S,c)=>{ S({t:c.t,d:.8,i:'thump',f:70,k:6,g:1}); S({t:c.t,d:.6,i:'glitch',v:.8}); S({t:c.t+.3,d:1.4,i:'chirp',f0:400,f1:80,g:.4}); },
});
G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,CH,beat}=K, e8=beat/2, I0=5400;
  add(I0,7,38,'drone',.45,0,{att:1}); add(I0+6.2,1,36,'timp',1,0);
  for(let k=0;k<Math.floor(20/(e8*.75));k++){ const t=I0+7+k*e8*.75; add(t,e8*.5,[50,53,57,53,50,55,57,60][k%8]+(k>24?12:0),'pluck',.6,(k%2?.35:-.35)); }
  for(let k=0;k<20;k++) add(I0+7+k,.5,[38,38,41,43][k%4],'bass',.55,0);
  ['Dm9','Bbmaj7','Fadd9','Asus','Dm9','Bbmaj7','Fadd9','Asus'].forEach((c,b)=>chord(I0+7+b*2.5,2.6,CH[c].map(x=>x+12),'strings',.3,{att:.2}));
  add(I0+29.2,1,31,'timp',1.2,0); chord(I0+29.2,1.2,[49,52,56],'brass',.45,{});
  chord(I0+33,10,[45,48,52,55],'pad',.3,{att:2}); [[I0+38,72],[I0+39.5,71],[I0+41,69]].forEach(([t,m])=>add(t,2,m,'piano',.4,0));
  chord(I0+42.6,10,[48,55,60,64],'strings',.3,{att:1});
});
})(typeof window!=='undefined'?window:globalThis);
