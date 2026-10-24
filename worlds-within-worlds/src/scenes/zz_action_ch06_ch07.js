/* ACTION INSERTS
   CH06_INS1 "Pulse surfing" (story 5830–5874, spliced at Ch 6 story 3020): a pack of Wardens comes out of the
   dark lattice; ARCHIVE and Tock ride a gold pulse along the threads, dive, and pull up hard so the pack overshoots.
   CH07_INS1 "Storm run" (story 5880–5924, spliced at Ch 7 story 3312): Wardens ambush ARCHIVE in the storm; one
   catches it; Tock rams the Warden and frees ARCHIVE; lightning takes the other. */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
G.ARCHIVE_SFX_EXT = G.ARCHIVE_SFX_EXT || {};
const A0=5830, A1=5874, AT_A=3020, B0=5880, B1=5924, AT_B=3312;
G.ARCHIVE_INSERTS=(G.ARCHIVE_INSERTS||[]).concat([{id:'CH06_INS1',at:AT_A,from:A0,to:A1,title:'Pulse surfing'},{id:'CH07_INS1',at:AT_B,from:B0,to:B1,title:'Storm run'}]);
G.ARCHIVE_HOLOTEXT=(G.ARCHIVE_HOLOTEXT||[]).concat([
  {t0:A0+2,t1:A0+7,lines:['\u26A0 WARDEN PACK \u00D73','RIDE THE PULSE \u2192'],x:.05,y:.1,px:36,color:'#FF9A8A'},
  {t0:B0+5,t1:B0+10,lines:['\u26A0 STORM CELL','2 WARDENS INBOUND'],x:.05,y:.1,px:36,color:'#FF9A8A'}]);
G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,V,Track,dialogue} = K;
  const T=W.tr, PI=Math.PI, at=t=>A.tr.pos.at(t);
  const D=(t,dur,text,emotion,scene,who='ARCHIVE')=>dialogue.push({character:who,text,start:t,end:t+dur,emotion,scene,audio:null,face:emotion});
  const TK=(t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'TOCK'); S(t,'tock_voice',{n:Math.max(2,Math.round(text.length/4))}); };
  const copy=(t0,src)=>{ for(const k in T) if(T[k].at) T[k].cut(t0,T[k].at(src)); for(const k in A.tr) if(A.tr[k].at) A.tr[k].cut(t0,A.tr[k].at(src)); for(const k in C.tr) if(C.tr[k].at) C.tr[k].cut(t0,C.tr[k].at(src)); };
  const ya=(p,q)=>Math.atan2(q[0]-p[0],q[2]-p[2]);
  T.p0=new Track([0,-60,0,0]); T.p1=new Track([0,-60,0,0]); T.p2=new Track([0,-60,0,0]);

  // ===================== CH06_INS1 · Pulse surfing =====================
  copy(A0,AT_A-.1); const SA=at(A0), TA=T.tockPos.at(A0), u=x=>A0+x;
  W.exts.push((t,s)=>{ if(t<A0-.5||t>A1+.5) return; const q=at(t);
    s.U=Object.assign(s.U||{},{ uNet:[t*(t>u(8)&&t<u(30)?3:1),.5,1.25,1], uGal:[0,-300,0,1], uGalB:[0,0,0,0], uAli:[0,-60,0,0], uAliB:[2,0,0,0],
      uWar:[...s.p0,...s.p1,...s.p2], uWarB:[ya(s.p0,q),0,1.1,.8, ya(s.p1,q),0,1.1,.8, ya(s.p2,q),0,1.1,.8] }); });
  T.p0.cut(u(0),[...V.add(SA,[-8,4,18]),1]); T.p1.cut(u(0),[...V.add(SA,[7,-3,20]),1]); T.p2.cut(u(0),[...V.add(SA,[0,8,24]),1]);
  S(u(.5),'warden_wake'); S(u(1),'warden_wake'); A.lookAt(u(1),1,V.add(SA,[0,2,20])); A.express(u(1.4),'surprised',.3);
  TK(u(2.6),1,'Company!','panic','CH06_INS1'); D(u(4),2,'Hold on\u2014let\u2019s catch a pulse!','excited','CH06_INS1'); S(u(4),'voice',{pattern:'hi'});
  C.shot(u(0),V.add(SA,[2,1,-4]),V.add(SA,[0,1,14]),52); C.move(u(0),6,V.add(SA,[2.6,1.4,-5]),V.add(SA,[0,2,16]),56,'inOut');
  const P=[SA,V.add(SA,[3,1,-30]),V.add(SA,[-4,-2,-62]),V.add(SA,[3,3,-92]),V.add(SA,[0,-7,-112]),V.add(SA,[0,5,-122]),V.add(SA,[-2,7,-134])];
  A.path(u(7),P,23,'in'); A.thrust(u(7),1,1.6); A.arms(u(8),.6,[2.85,.25,.1],[2.85,.25,.1]); A.express(u(8),'excited',.4); S(u(7.4),'pulse_ride',{d:22});
  for(let k=0;k<P.length-1;k++) A.faceToward(u(7+23*k/(P.length-1)),.6,P[k+1]);
  A.tr.roll.key(u(12),0,'lin').key(u(13),.6,'inOut').key(u(15),-.6,'inOut').key(u(17),.4,'inOut').key(u(19),0,'inOut');
  T.exposure.key(u(7),1,'lin').key(u(7.6),1.5,'out').key(u(9),1);
  for(let x=7;x<=24;x+=.5){ T.p0.key(u(x),[...V.add(at(u(x-1.3)),[-1.2,.4,0]),1],'lin'); T.p1.key(u(x),[...V.add(at(u(x-1.7)),[1.4,-.5,.4]),1],'lin'); T.p2.key(u(x),[...V.add(at(u(x-2.1)),[0,1.2,.6]),1],'lin'); }
  for(let x=5;x<=30;x+=.5) T.tockPos.key(u(x),V.add(at(u(x-.4)),[.9,.7,.6]),'lin');
  TK(u(15),1.6,'They are gaining!','panic','CH06_INS1'); D(u(18.6),1.4,'Down we go!','determined','CH06_INS1'); S(u(18.6),'voice',{pattern:'eep'});
  // the pull-up: the pack overshoots into the dark
  const low=V.add(SA,[0,-7,-112]);
  T.p0.key(u(24.6),[...V.add(low,[-1,-6,-6]),1],'in').key(u(28),[...V.add(low,[-3,-28,-14]),1],'lin');
  T.p1.key(u(24.8),[...V.add(low,[1,-7,-5]),1],'in').key(u(28.2),[...V.add(low,[6,-30,-12]),1],'lin');
  T.p2.key(u(25),[...V.add(low,[0,-5,-7]),1],'in').key(u(28.4),[...V.add(low,[0,-26,-18]),1],'lin');
  ['p0','p1','p2'].forEach((k,i)=>T[k].key(u(28.5+i*.1),[0,-60,0,0],'cut'));
  S(u(25),'whoosh',{d:3}); A.express(u(26),'happy',.4); S(u(26),'voice',{pattern:'giggle'});
  TK(u(29),1.6,'They\u2026 missed?','surprised','CH06_INS1'); D(u(31),1.6,'Pulses only go one way!','playful','CH06_INS1'); S(u(31),'voice',{pattern:'giggle'});
  C.shot(u(7),V.add(at(u(8)),[0,1.2,5]),at(u(9)),70); for(const x of [10,13,16,19,22]) C.via(u(x),V.add(at(u(x)),[1.6,.9,4.4]),at(u(x+.8)));
  C.shot(u(23.6),V.add(low,[6,2,6]),low,60); C.move(u(23.6),5,V.add(low,[7,4,4]),V.add(low,[0,-6,-4]),64,'inOut');
  C.shot(u(28.8),V.add(at(u(30)),[1.6,.4,-2.6]),V.add(at(u(30)),[0,.3,0]),38); C.move(u(28.8),5,V.add(at(u(31)),[1.5,.4,-2.4]),V.add(at(u(31)),[0,.3,0]),36,'lin');
  // a flash along the pulse, back onto Alicia's route
  T.exposure.key(u(37),1,'lin').key(u(38),5,'in').key(u(38.05),5,'cut').key(u(40),1,'out'); S(u(37.4),'flash');
  A.tr.pos.cut(u(38.05),SA); T.tockPos.cut(u(38.05),TA); A.tr.roll.cut(u(38.05),0); A.tr.yaw.cut(u(38.05),A.tr.yaw.at(AT_A)); A.rest(u(38.1),.6); A.thrust(u(38.1),1,A.tr.thrust.at(AT_A));
  C.shot(u(38.05),V.add(SA,[2.6,1.1,5]),SA,52); C.move(u(38.05),6,V.add(SA,[2.4,1,4.6]),SA,50,'lin');

  // ===================== CH07_INS1 · Storm run =====================
  copy(B0,AT_B-.1); const SB=at(B0), TB=T.tockPos.at(B0), v=x=>B0+x;
  const bolts=[[v(3),[30,40,SB[2]-30],[14,0,SB[2]-24]],[v(9.6),[-20,36,SB[2]-10],[-8,2,SB[2]-6]],[v(26.4),[10,40,SB[2]-14],null],[v(33),[-30,30,SB[2]-40],[-12,-4,SB[2]-36]]];
  W.exts.push((t,s)=>{ if(t<B0-.5||t>B1+.5) return; let fl=0,b0=[0,-50,0],b1=[0,-50,0],bi=0,seed=0;
    for(const [bt,a,b] of bolts){ const x=t-bt; if(x>=0&&x<.5){ const k=Math.exp(-x*8); if(k>bi){ bi=k; b0=a; b1=b||s.p1.slice(0,3); seed=bt; } fl=Math.max(fl,k); } }
    const q=at(t);
    s.U=Object.assign(s.U||{},{ uLost:[Math.max(fl,.08),seed,bi,0], uLostB:[0,.4,.9,.8], uThr:[0,0,0,0], uThrA:[0,-50,0], uThrB:[0,-50,0], uBolt0:b0, uBolt1:b1,
      uWar:[...s.p0,...s.p1,0,-60,0,0], uWarB:[ya(s.p0,q),0,1.15,s.p0[3]>.5?.9:0, ya(s.p1,q),0,1.15,.9, 0,0,1,0] }); });
  S(v(3),'thunder',{near:1}); S(v(9.6),'thunder',{near:1}); S(v(26.4),'thunder',{near:1}); S(v(33),'thunder',{near:0});
  // weaving through the debris
  const Q=[SB,V.add(SB,[4,2,-10]),V.add(SB,[-3,-1,-20]),V.add(SB,[2,3,-28])];
  A.path(v(1),Q,9,'inOut'); A.thrust(v(1),1,1.3); for(let k=0;k<Q.length-1;k++) A.faceToward(v(1+3*k),.5,Q[k+1]);
  A.express(v(2),'determined',.4); A.tr.jitter.key(v(3),0,'lin').key(v(3.2),.4).key(v(4.2),0);
  for(let x=1;x<=12;x+=.5) T.tockPos.key(v(x),V.add(at(v(x-.7)),[1,.6,.8]),'lin');
  C.shot(v(0),V.add(SB,[2,1.4,5]),V.add(SB,[0,1,-10]),54); C.move(v(0),9,V.add(at(v(9)),[2,1.2,6]),at(v(9.5)),56,'lin');
  // ambush
  const amb=at(v(10));
  T.p0.cut(v(9),[...V.add(amb,[-10,6,-8]),1]); T.p1.cut(v(9),[...V.add(amb,[10,4,-10]),1]);
  T.p0.key(v(12),[...V.add(amb,[-1.2,.3,-.6]),1],'in'); T.p1.key(v(12.6),[...V.add(amb,[3,1,-2]),1],'in'); S(v(9.4),'warden_wake'); S(v(9.8),'warden_wake');
  A.express(v(10.6),'surprised',.2); D(v(11),1,'Wardens!','surprised','CH07_INS1'); S(v(11),'voice',{pattern:'eep'});
  // one catches ARCHIVE
  A.tr.pos.key(v(12),amb,'lin'); for(let x=12.2;x<=18;x+=.4){ const w=V.add(amb,[-1.2+Math.sin(x*3)*.15,.3,-.6]); T.p0.key(v(x),[...w,1],'lin'); A.tr.pos.key(v(x),V.add(w,[1.15,-.55,.55]),'lin'); }
  S(v(12.1),'heavy_hit'); A.tr.jitter.key(v(12),0,'lin').key(v(12.3),.6).key(v(18),.6).key(v(18.3),0); A.express(v(12.4),'worried',.3);
  D(v(13.4),1.6,'Let go! Let GO!','worried','CH07_INS1'); S(v(13.4),'voice',{pattern:'eep'}); S(v(12.6),'strain',{d:5});
  C.shot(v(11.6),V.add(amb,[3,1,4]),V.add(amb,[-.4,.2,-.2]),40); C.move(v(11.6),6.6,V.add(amb,[2.6,.8,3.4]),V.add(amb,[-.4,.2,-.2]),36,'lin');
  // Tock rams the Warden
  T.tockPos.key(v(14),V.add(amb,[6,3,6]),'out').key(v(17.4),V.add(amb,[6,3,6]),'lin').key(v(18),V.add(amb,[-1,.4,-.4]),'in');
  TK(v(15),1.6,'Courier rule one!','determined','CH07_INS1'); S(v(18),'heavy_hit');
  T.p0.key(v(18.1),[...V.add(amb,[-1.2,.3,-.6]),1],'lin').key(v(21),[...V.add(amb,[-22,-6,-18]),1],'out').key(v(21.1),[0,-60,0,0],'cut');
  T.tockPos.key(v(19),V.add(amb,[-2,1,-1]),'out').key(v(21),V.add(amb,[1,.8,.6]),'inOut');
  A.tr.pos.key(v(18.4),V.add(amb,[.6,-.2,.4]),'out'); A.express(v(19),'surprised',.2);
  C.shot(v(17.4),V.add(amb,[5,2,7]),V.add(amb,[-.6,.3,-.3]),48); C.move(v(17.4),4,V.add(amb,[5.6,2.4,8]),V.add(amb,[-4,0,-3]),52,'inOut');
  // the other Warden lunges; lightning takes it
  T.p1.key(v(22),[...V.add(amb,[3,1,-2]),1],'lin').key(v(26.3),[...V.add(amb,[2,.6,-1.4]),1],'in');
  A.express(v(24),'worried',.3); A.tr.jitter.key(v(26.4),0,'lin').key(v(26.6),.5).key(v(27.6),0);
  T.p1.key(v(26.5),[...V.add(amb,[2,.6,-1.4]),1],'lin').key(v(29),[...V.add(amb,[6,-18,-8]),1],'in').key(v(29.1),[0,-60,0,0],'cut'); S(v(26.5),'warden_crash');
  C.shot(v(22),V.add(amb,[-4,1.6,5]),V.add(amb,[1.4,.6,-.8]),46); C.move(v(22),6,V.add(amb,[-4.6,2,5.6]),V.add(amb,[2,0,-2]),48,'lin');
  // partners
  A.express(v(29.6),'relieved',.6); D(v(30),1.6,'Thanks, partner.','warm','CH07_INS1'); S(v(30),'voice',{pattern:'hi'});
  T.tockEye.key(v(31.6),T.tockEye.at(v(31.6)),'lin').key(v(32.2),[.85,0,0,.8]); TK(v(32.4),2,'Rule one. Always.','proud','CH07_INS1');
  C.shot(v(29.4),V.add(amb,[1.6,.5,2.4]),V.add(amb,[.3,.4,0]),36); C.move(v(29.4),6,V.add(amb,[1.5,.5,2.2]),V.add(amb,[.3,.4,0]),34,'lin');
  // back on course
  A.faceToward(v(36),1,SB); A.flyTo(v(36.4),6.6,SB,'inOut'); A.thrust(v(36.4),1,1); A.turnTo(v(41),2,A.tr.yaw.at(AT_B));
  T.tockPos.key(v(36.4),V.add(amb,[1,.8,.6]),'lin').key(v(43.4),TB,'inOut');
  C.shot(v(35.6),V.add(SB,[4,3,8]),V.lerp(amb,SB,.5),52); C.move(v(35.6),8,V.add(SB,[3,2,6]),SB,48,'inOut');
});
G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,CH,beat,theme}=K;
  const A0=5830; add(A0,6,34,'drone',.5,0,{att:.5}); chord(A0+.5,4,[37,41,44],'brass',.4,{});
  for(let k=0;k<Math.floor(23/.2);k++) add(A0+7+k*.2,.15,[64,67,71,74,71,67][k%6]+(k>60?12:0),'pluck',.45,(k%2?.35:-.35));
  ['Em7','Cmaj7','Am7','G','Em7','Cmaj7'].forEach((c,b)=>{ chord(A0+7+b*3.8,3.9,CH[c].map(x=>x+12),'strings',.32,{att:.2}); add(A0+7+b*3.8,3.8,CH[c][0]-12,'bass',.55,0); });
  theme.forEach(([b,m,d])=>add(A0+12+b*beat*.7,d*beat*.7,m+12,'brass',.45,0));
  [[A0+26,84],[A0+26.3,88],[A0+26.6,91]].forEach(([t,m])=>add(t,.5,m,'celesta',.5,0)); add(A0+37.4,1,36,'timp',1,0);
  const B0=5880; add(B0,40,29,'drone',.5,0,{att:1}); for(let k=0;k<36;k++) add(B0+1+k,.5,[33,33,40,36][k%4],'bass',.55,0);
  chord(B0+10,8,[37,40,44,49],'strings',.34,{att:.3}); [B0+12.1,B0+18,B0+26.5].forEach(t=>{ add(t,1,31,'timp',1.2,0); chord(t,1,[49,52,56],'brass',.45,{}); });
  chord(B0+29.6,10,[48,55,60,64],'strings',.3,{att:1}); [[B0+32.4,76],[B0+32.8,79],[B0+33.2,86]].forEach(([t,m])=>add(t,1.4,m,'celesta',.45,0));
});
Object.assign(G.ARCHIVE_SFX_EXT,{
  pulse_ride:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:110,f1:330,g:.35}); for(let k=0;k<c.d;k+=1.5) S({t:c.t+k,d:1.6,i:'noiseSweep',f0:600,f1:3600,g:.18}); },
});
})(typeof window!=='undefined'?window:globalThis);
