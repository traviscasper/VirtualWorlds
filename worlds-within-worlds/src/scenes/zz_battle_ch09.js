/* STORY v2 — CH09_INS1 "Magnus" (story 5680–5760, spliced at Ch 9 story 4482)
   Magnus, the Warden Prime, comes for the Keystone in the Seat. ARCHIVE alone is swatted aside. Then every world
   ARCHIVE helped sends its light — Verdance, Ferrum, Thalassa, the Orrery — and ARCHIVE becomes MEGA-ARCHIVE, a
   giant hard-light version of itself that mirrors its every move. They clash; but instead of striking the final
   blow, Mega-ARCHIVE pours light into Magnus. His visor turns from red to blue: he was only afraid of the dark.
   He stays, a friend, and helps the worlds hold the rhythm for the rest of the film. */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
G.ARCHIVE_SFX_EXT = G.ARCHIVE_SFX_EXT || {};
const I0=5680, I1=5760, AT=4482, SEAT=[0,0,-70], SAT=[0,.9,-69.4], ALI=[3.4,.4,-66.6], FRIEND=[17,7,-86];
G.ARCHIVE_INSERTS=(G.ARCHIVE_INSERTS||[]).concat([{id:'CH09_INS1',at:AT,from:I0,to:I1,title:'Magnus'}]);
G.ARCHIVE_HOLOTEXT=(G.ARCHIVE_HOLOTEXT||[]).concat([
  {t0:I0+4,t1:I0+10,lines:['\u26A0 WARDEN PRIME: MAGNUS','TARGET: KEYSTONE'],x:.05,y:.1,px:36,color:'#FF9A8A'},
  {t0:I0+29,t1:I0+35,lines:['MEGA-ARCHIVE','POWER: EVERY WORLD'],x:.05,y:.1,px:36,color:'#9FE6FF'},
  {t0:I0+62,t1:I0+70,lines:['MAGNUS','STATUS: RESTORED \u2713'],x:.05,y:.1,px:36,color:'#9FE6FF'},
]);
G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,V,Track,dialogue} = K;
  const T=W.tr, PI=Math.PI, u=x=>I0+x, at=t=>A.tr.pos.at(t);
  const D=(t,dur,text,emotion,who='ARCHIVE')=>dialogue.push({character:who,text,start:t,end:t+dur,emotion,scene:'CH09_INS1',audio:null,face:emotion});
  const TK=(t,dur,text,emotion)=>{ D(t,dur,text,emotion,'TOCK'); S(t,'tock_voice',{n:Math.max(2,Math.round(text.length/4))}); };
  const MG=(t,dur,text,emotion)=>{ D(t,dur,text,emotion,'MAGNUS'); S(t,'magnus_voice',{d:dur}); };
  for(const k in T) if(T[k].at) T[k].cut(I0,T[k].at(AT-.1));
  for(const k in A.tr) if(A.tr[k].at) A.tr[k].cut(I0,A.tr[k].at(AT-.1));
  for(const k in C.tr) if(C.tr[k].at) C.tr[k].cut(I0,C.tr[k].at(AT-.1));
  const TK0=T.tockPos.at(I0);
  T.magP=new Track([40,70,-120]); T.magB=new Track([0,0,16,0]); T.megaP=new Track([0,-300,0,0]); T.megaB=new Track([0,1,0,0]); T.help=new Track([0,0,0,0]);
  const yawTo=(a,b)=>Math.atan2(b[0]-a[0],b[2]-a[2]);
  W.exts.push((t,s)=>{
    if(t>=I0-.5&&t<=I1+.5){ const mp=s.magP, mg=s.megaP;
      s.U=Object.assign(s.U||{},{ uWar:[...mp,1,0,-60,0,0,0,-60,0,0], uWarB:[yawTo(mp,mg[3]>.5?mg:at(t)),s.magB[1],16,s.magB[3], 0,0,1,0, 0,0,1,0],
        uMega:mg, uMegaB:[yawTo(mg,mp),s.megaB[1],s.megaB[2],0], uHelp:s.help }); return; }
    if(t>AT && t<4860 && s.world>7.5) s.U=Object.assign(s.U||{},{ uWar:[...FRIEND,1,0,-60,0,0,0,-60,0,0], uWarB:[yawTo(FRIEND,SEAT),1,16,0, 0,0,1,0, 0,0,1,0] });
  });
  const MP=T.magP, MB=T.magB, XP=T.megaP, XB=T.megaB, H=T.help;
  // he arrives
  T.core.key(u(0),T.core.at(u(0)),'lin').key(u(5),[.8,.55,1.3,1],'inOut'); S(u(0),'magnus_hum',{d:20}); S(u(1),'warden_wake');
  MP.cut(u(0),[40,70,-120]); MP.key(u(6),[14,10,-84],'inOut');
  A.lookAt(u(1),1.4,[30,50,-110]); A.express(u(1.4),'surprised',.3); A.tr.jitter.key(u(1.4),0,'lin').key(u(1.6),.3).key(u(2.6),0);
  MG(u(6.4),2.6,'The light\u2026 is MINE.','cold'); TK(u(9.4),1.6,'That is Magnus!','panic');
  C.shot(u(0),[-14,6,-46],[18,30,-100],52); C.move(u(0),8,[-18,8,-42],[14,12,-86],56,'inOut');
  // he reaches for the Keystone; Alicia stands in his way
  MB.key(u(10),[0,0,16,0],'lin').key(u(11.4),[0,0,16,1],'out'); MP.key(u(10),[14,10,-84],'lin').key(u(12),[8,6,-78],'inOut');
  T.ali.key(u(10),T.ali.at(u(10)),'lin').key(u(11.6),[1.2,.6,-71.6,1],'inOut'); T.aliB.key(u(11.6),[2.6,1,-.3,0],'inOut'); S(u(11.8),'glitch',{d:1});
  C.shot(u(9.6),[-10,6,-44],[4,6,-74],52); C.move(u(9.6),4,[-12,7,-42],[4,6,-74],54,'lin');
  // ARCHIVE alone: swatted aside
  A.thrust(u(12.6),1,1.2); A.flyTo(u(12.6),2,[1,6,-66],'inOut'); A.faceToward(u(12.6),1,[8,6,-78]); A.express(u(13),'determined',.3);
  D(u(13.4),1.6,'Leave her alone!','determined'); S(u(13.4),'voice',{pattern:'eep'});
  MP.key(u(15),[8,6,-78],'lin').key(u(15.8),[4,6.4,-72],'in'); S(u(15.8),'heavy_hit');
  A.flyTo(u(15.9),1.6,[-6,3,-57],'outExpo'); A.tr.roll.key(u(15.9),0,'lin').key(u(17.5),PI*2,'out'); A.tr.roll.cut(u(17.51),0); A.tr.jitter.key(u(15.9),0,'lin').key(u(16.1),.6).key(u(18.6),0);
  A.express(u(16),'surprised',.1); A.express(u(18.4),'frustrated',.6); D(u(19),2.2,'I can\u2019t stop him alone\u2026','sad'); S(u(19),'voice',{pattern:'phew'});
  C.tr.shake.key(u(15.6),0,'lin').key(u(15.9),1.6).key(u(17.5),0);
  C.shot(u(12.4),[-5,8,-52],V.lerp([1,6,-66],[8,6,-78],.5),50); C.move(u(12.4),7.6,[-9,9,-48],[-2,4,-62],54,'inOut');
  // every world sends its light
  H.key(u(20),[0,0,0,0],'lin').key(u(26),[1,0,0,0],'inOut'); S(u(20.4),'help_arrives',{d:7});
  A.lookAt(u(21),1.4,[-40,30,-40]); A.lookAt(u(23),1.4,[40,20,-50]); A.express(u(22),'surprised',.6);
  D(u(23.6),2.6,'Verdance\u2026 Ferrum\u2026 Thalassa\u2026 everyone!','excited'); S(u(23.6),'voice',{pattern:'whoa'});
  C.shot(u(20),[-6,1.6,-48],[-6,3,-57],56); C.move(u(20),8,[-14,10,-36],[-6,4,-57],70,'inOut');
  // Mega-ARCHIVE
  const MX=[-2,11,-60];
  A.flyTo(u(27),2,MX,'inOut'); A.faceToward(u(27),1.4,[8,6,-78]);
  XP.cut(u(28),[...MX,1]); XB.cut(u(28),[0,1,.4,0]); XB.key(u(33),[0,11,1,0],'outBack'); S(u(28),'mega_form',{d:6});
  A.arms(u(28.4),1.6,[1.3,1.3,.2],[1.3,1.3,.2]); A.express(u(30),'determined',.6);
  TK(u(32),1,'Whoa.','awe'); D(u(33.4),1.4,'Together!','determined'); S(u(33.4),'voice',{pattern:'hi'});
  for(let x=28;x<=70;x+=.5) A.tr.pos.key(u(x),XP.at(u(x)).slice(0,3),'lin');
  C.shot(u(28),[-20,4,-30],V.add(MX,[0,2,0]),50); C.move(u(28),6,[-28,8,-22],V.add(MX,[0,-2,0]),58,'inOut');
  // the clash
  MP.key(u(34),[4,6.4,-72],'lin').key(u(36),[10,10,-76],'inOut').key(u(37),[3,10.4,-66],'in'); S(u(37),'heavy_hit');
  A.arms(u(36.4),.5,[1.3,1.3,.2],[1.3,1.3,.2],'out'); XP.key(u(37),[...MX,1],'lin').key(u(37.6),[-4,11,-58,1],'out');
  C.tr.shake.key(u(36.9),0,'lin').key(u(37.1),1.8).key(u(38.6),0); T.exposure.key(u(36.9),1,'lin').key(u(37.05),1.6,'out').key(u(37.6),1);
  A.arms(u(39.4),.4,[1.6,.6,.3],[2.85,.25,.1],'out'); S(u(39.8),'heavy_hit'); XP.key(u(39.4),[-4,11,-58,1],'lin').key(u(40),[-1,11,-62,1],'in');
  MP.key(u(39.8),[3,10.4,-66],'lin').key(u(42),[16,12,-82],'out'); C.tr.shake.key(u(39.7),0,'lin').key(u(39.9),1.6).key(u(41.4),0);
  A.express(u(40),'determined',.3); MG(u(43),1.6,'You cannot\u2014','cold');
  // they circle the Seat
  for(let k=0;k<=8;k++){ const a=.4+k*.32, b=a+PI; XP.key(u(44+k*.75),[Math.cos(b)*13,11+Math.sin(k)*1.2,-70+Math.sin(b)*13,1],'lin'); MP.key(u(44+k*.75),[Math.cos(a)*14,11,-70+Math.sin(a)*14,1].slice(0,3),'lin'); }
  MB.key(u(44),[0,0,16,1],'lin').key(u(50),[0,0,16,.4],'lin');
  // he grabs the giant's arm; ARCHIVE breaks free and takes hold of him
  const e1=XP.at(u(50)).slice(0,3), e2=MP.at(u(50));
  MP.key(u(51),V.lerp(e2,e1,.4),'in'); S(u(51),'heavy_hit'); A.arms(u(51),.4,[2.85,.25,.1],[1.3,1.3,.2],'out');
  A.tr.jitter.key(u(51),0,'lin').key(u(51.4),.5).key(u(54),.5).key(u(54.4),0); S(u(51.4),'strain',{d:3});
  MB.key(u(51),[0,0,16,.4],'lin').key(u(51.4),[0,0,16,1],'out');
  A.arms(u(54.4),.6,[2.85,.25,.1],[2.85,.25,.1],'out'); A.express(u(54.6),'determined',.3);
  C.shot(u(43.6),[0,30,-40],[0,10,-70],60); C.move(u(43.6),7,[-10,34,-46],[0,10,-70],62,'inOut');
  C.shot(u(50.6),V.add(V.lerp(e1,e2,.5),[22,10,34]),V.lerp(e1,e2,.5),50); C.move(u(50.6),5,V.add(V.lerp(e1,e2,.5),[26,12,38]),V.lerp(e1,e2,.5),52,'lin');
  // instead of a final blow: light
  H.key(u(56),[1,0,0,0],'lin').key(u(58),[.6,1,0,0],'inOut'); S(u(56.4),'light_pour',{d:9});
  MB.key(u(58),[0,0,16,1],'lin').key(u(64),[0,1,16,.1],'inOut'); MP.key(u(56),MP.at(u(56)),'lin').key(u(64),V.add(MP.at(u(56)),[0,-1.5,0]),'inOut');
  MG(u(61),3,'\u2026I was afraid\u2026 of the dark.','soft');
  A.express(u(64),'happy',.6); D(u(64.6),2.6,'You don\u2019t have to hold it alone.','warm'); S(u(64.6),'voice',{pattern:'q2'});
  MG(u(68),1.6,'\u2026Together.','warm');
  C.shot(u(56),V.add(V.lerp(e1,e2,.5),[-24,8,32]),V.lerp(e1,e2,.5),50); C.move(u(56),8,V.add(V.lerp(e1,e2,.5),[-20,6,28]),V.lerp(e1,e2,.6),46,'inOut');
  C.shot(u(64),V.add(e2,[-16,6,22]),V.add(e2,[0,3,0]),44); C.move(u(64),6,V.add(e2,[-14,5,20]),V.add(e2,[0,3,0]),42,'lin');
  // the giant fades back into ARCHIVE; Magnus, blue-eyed, takes his place as a friend
  XB.key(u(70),[0,11,1,0],'lin').key(u(74),[0,1,0,0],'in'); XP.key(u(74.1),[0,-300,0,0],'cut'); H.key(u(70),[.6,1,0,0],'lin').key(u(74),[0,0,0,0],'inOut'); S(u(70),'mega_fade',{d:4});
  A.arms(u(70),1,[.25,.35,.5],[.25,.35,.5]); A.rest(u(74),1);
  A.flyTo(u(74.2),5.4,SAT,'inOut'); A.faceToward(u(74.2),1,SAT); A.turnTo(u(78),1.6,A.tr.yaw.at(AT));
  MP.key(u(70),MP.at(u(70)),'lin').key(u(79),FRIEND,'inOut');
  T.core.key(u(66),T.core.at(u(66)),'lin').key(u(78),T.core.at(AT),'inOut');
  T.ali.key(u(72),T.ali.at(u(72)),'lin').key(u(78),T.ali.at(AT),'inOut'); T.aliB.key(u(72),[2.6,0,-.3,0],'inOut');
  T.tockPos.key(u(70),T.tockPos.at(u(70)),'lin').key(u(79),TK0,'inOut');
  TK(u(75),2,'Courier log: the big one is nice now.','happy');
  C.shot(u(70),[-24,14,-28],[4,6,-74],54); C.move(u(70),10,[-20,10,-36],[4,4,-74],50,'inOut');
});
G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,CH,beat,theme}=K, I0=5680;
  add(I0,20,24,'drone',.6,0,{att:1}); chord(I0+1,8,[37,40,44,49],'brass',.45,{}); add(I0+6.4,1,31,'timp',1.2,0);
  for(let k=0;k<16;k++) add(I0+8+k*.75,.4,[38,41,38,44][k%4],'bass',.55,0);
  chord(I0+15.8,1.2,[37,44,49],'brass',.5,{}); add(I0+15.8,1,29,'timp',1.3,0);
  [[I0+18.4,'Am7'],[I0+20,'Fmaj7']].forEach(([t,c])=>CH[c].forEach((m,k)=>add(t+k*.2,1.6,m+12,'piano',.35,0)));
  chord(I0+20,8,[48,55,60,64,67],'strings',.32,{att:3}); [[I0+21,84],[I0+22,88],[I0+23,91],[I0+24,96]].forEach(([t,m])=>add(t,2,m,'bell',.5,0));
  add(I0+28,1,36,'timp',1.2,0); chord(I0+28,6,[36,43,48,52,55,60],'brass',.55,{});
  theme.forEach(([b,m,d])=>{ add(I0+33.4+b*beat*.8,d*beat*.8,m+12,'brass',.6,0); add(I0+33.4+b*beat*.8,d*beat*.8,m+24,'strings',.6,0,{att:.1}); });
  for(let k=0;k<44;k++){ const t=I0+34+k*.5; add(t,.3,[36,36,43,36,41,41,43,43][Math.floor(k/2)%8],'bass',.55,0); if(k%4===0) add(t,.6,36,'timp',.7,0); }
  [I0+37,I0+39.8,I0+51].forEach(t=>{ add(t,1,31,'timp',1.2,0); chord(t,.8,[49,53,56],'brass',.45,{}); });
  chord(I0+56,10,[57,64,69,72,76],'pad',.45,{att:2}); [[0,88],[1.6,91],[3.2,96],[6.4,95],[8,100]].forEach(([b,m])=>add(I0+57+b,3,m,'bell',.42,.1));
  theme.forEach(([b,m,d])=>add(I0+64+b*beat*1.2,d*beat*1.25,m+12,'piano',.55,0));
  chord(I0+70,10,[48,55,60,64,67],'strings',.3,{att:2});
});
Object.assign(G.ARCHIVE_SFX_EXT,{
  magnus_voice:(S,c)=>{ const n=Math.max(2,Math.round(c.d*2)); for(let k=0;k<n;k++) S({t:c.t+k*.45,d:.35,i:'chirp',f0:110,f1:80,g:.6,stem:'dialogue'}); },
  heavy_hit:(S,c)=>{ S({t:c.t,d:1,i:'thump',f:40,k:3,g:1.2}); S({t:c.t,d:.8,i:'noiseSweep',f0:3000,f1:200,g:.5}); },
  help_arrives:(S,c,u)=>{ [84,88,91,96].forEach((m,k)=>S({t:c.t+k*1.4,d:2,f:u.mtof(m),i:'bell',v:.4,pan:k*.5-.75})); S({t:c.t,d:c.d,i:'noiseSweep',f0:200,f1:5000,g:.35}); },
  mega_form:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:55,f1:220,g:.6}); S({t:c.t,d:c.d,i:'noiseSweep',f0:100,f1:7000,g:.45}); S({t:c.t+c.d-.6,d:1,i:'thump',f:36,k:1,g:1}); },
  light_pour:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:220,f1:440,g:.35}); },
  mega_fade:(S,c)=>{ S({t:c.t,d:c.d,i:'noiseSweep',f0:6000,f1:300,g:.35}); },
});
})(typeof window!=='undefined'?window:globalThis);
