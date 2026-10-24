/* ACTION INSERT CH04_INS1 "Wardens in Ferrum" (story 5780–5816, spliced at Ch 4 story 1929)
   As ARCHIVE grabs the cable, two Wardens drop out of the dark, hungry for its power. ARCHIVE leads them on a
   chase around the plaza and down the avenue, then times a dive across the elevated rail so the surging train
   knocks them aside. Back to the cable; the story continues. */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
const I0=5780, I1=5816, AT=1929, TOPB=[-12,9,-76];
G.ARCHIVE_INSERTS=(G.ARCHIVE_INSERTS||[]).concat([{id:'CH04_INS1',at:AT,from:I0,to:I1,title:'Wardens in Ferrum'}]);
G.ARCHIVE_HOLOTEXT=(G.ARCHIVE_HOLOTEXT||[]).concat([{t0:I0+2,t1:I0+8,lines:['\u26A0 2 WARDENS','TARGET: CABLE POWER'],x:.05,y:.1,px:36,color:'#FF9A8A'}]);
G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,V,Track,dialogue} = K;
  const T=W.tr, PI=Math.PI, u=x=>I0+x, at=t=>A.tr.pos.at(t);
  const D=(t,dur,text,emotion,who='ARCHIVE')=>dialogue.push({character:who,text,start:t,end:t+dur,emotion,scene:'CH04_INS1',audio:null,face:emotion});
  const TK=(t,dur,text,emotion)=>{ D(t,dur,text,emotion,'TOCK'); S(t,'tock_voice',{n:Math.max(2,Math.round(text.length/4))}); };
  for(const k in T) if(T[k].at) T[k].cut(I0,T[k].at(AT-.1));
  for(const k in A.tr) if(A.tr[k].at) A.tr[k].cut(I0,A.tr[k].at(AT-.1));
  for(const k in C.tr) if(C.tr[k].at) C.tr[k].cut(I0,C.tr[k].at(AT-.1));
  const S0=at(I0), TK0=T.tockPos.at(I0);
  // the train: parked far south, surges north and ends where the story has it (rear car at z 22.5)
  const car0=t=>{ const x=t-I0; if(x<16) return -150; if(x<21.6) return -150+(x-16)/5.6*65.2; const s=Math.min(1,(x-21.6)/8.4); return -84.8+(22.5+84.8)*(1-(1-s)*(1-s)); };
  const hand=t=>V.add(at(t),[0,-.15,.25]);
  T.wa=new Track([0,-60,0,0]); T.wb=new Track([0,-60,0,0]); T.wcl=new Track([.6,.6]);
  W.exts.push((t,s)=>{ if(t<I0-.5||t>I1+.5) return;
    const ya=(p)=>{ const q=at(t); return Math.atan2(q[0]-p[0],q[2]-p[2]); };
    s.U=Object.assign(s.U||{},{ uDist:s.dist, uRail:[car0(t),1,1,0], uLink:[.45,0,0,0], uLinkEnd:hand(t), uMach:[0,0,0,0],
      uWar:[...s.wa,...s.wb,0,-60,0,0], uWarB:[ya(s.wa),0,1.15,s.wcl[0], ya(s.wb),0,1.15,s.wcl[1], 0,0,1,0] }); });
  // they drop out of the dark
  T.wa.cut(u(0),[-4,32,-70,1]); T.wb.cut(u(0),[6,32,-84,1]); T.wa.key(u(3.6),[-6,13,-72,1],'out'); T.wb.key(u(4),[-2,14,-82,1],'out'); S(u(.6),'warden_wake'); S(u(1.2),'warden_wake');
  A.lookAt(u(1),1,[0,24,-76]); A.express(u(1.4),'surprised',.3);
  TK(u(2.5),2,'Wardens! They want the power!','panic'); D(u(5.6),2,'Then they\u2019ll have to catch me!','playful'); S(u(5.6),'voice',{pattern:'giggle'});
  C.shot(u(0),V.add(S0,[3,1.6,6]),[-2,22,-76],52); C.move(u(0),5,V.add(S0,[4,2,7]),[-4,14,-76],54,'inOut');
  // the chase: across the plaza, down the avenue, and back up toward the rail
  const P=[S0,[-2,8,-84],[3,6,-100],[-1,7,-118],[-4,10,-100],[-1,12,-82],[2.5,12.6,-71.5],[6.5,12.8,-70],[11,11.5,-69]];
  A.path(u(4.4),P,16.8,'inOut'); A.thrust(u(4.4),1,1.5); S(u(4.6),'whoosh',{d:4}); S(u(9),'whoosh',{d:4}); S(u(14),'whoosh',{d:4}); S(u(18),'whoosh',{d:3});
  for(let k=0;k<P.length-1;k++) A.faceToward(u(4.4+16.8*k/(P.length-1)),.5,P[k+1]);
  A.express(u(6),'excited',.3); A.spin(u(11),1.2,1); S(u(11),'spin');
  for(let x=5.4;x<=21.4;x+=.4){ T.wa.key(u(x),[...at(u(x-1.1)),1],'lin'); T.wb.key(u(x),[...V.add(at(u(x-1.6)),[.6,-.4,.5]),1],'lin'); }
  T.wcl.key(u(5),[.6,.6],'lin').key(u(12),[1,1],'inOut');
  for(let x=4;x<=21;x+=.5) T.tockPos.key(u(x),V.add(at(u(x-2)),[0,2.2,2]),'lin');
  D(u(18.6),1.6,'Tock\u2014when I say now\u2026','determined'); S(u(18.6),'voice',{pattern:'q'}); TK(u(20.3),.8,'Now what?!','panic'); S(u(19.6),'train',{d:5});
  D(u(20.9),.6,'NOW!','determined'); S(u(20.9),'voice',{pattern:'eep'}); T.tockPos.key(u(21),[1,16,-74],'out');
  // the train takes the Wardens
  S(u(21.6),'heavy_hit'); S(u(21.8),'warden_crash');
  T.wa.key(u(21.6),[6.5,12.7,-70.5,1],'lin').key(u(23),[7.5,15,-50,1],'out').key(u(25),[8.5,1.2,-42,1],'in');
  T.wb.key(u(21.8),[6.3,12.4,-71.4,1],'lin').key(u(23.3),[5,14,-54,1],'out').key(u(25.4),[4.4,1.2,-47,1],'in');
  T.wcl.key(u(21.6),[1,1],'lin').key(u(25),[.1,.1],'out');
  C.tr.shake.key(u(21.4),0,'lin').key(u(21.7),1.4).key(u(23),0);
  C.shot(u(4.2),[-10,10,-66],at(u(6)),54); for(const x of [7,9.5,12,14.5,17]) C.via(u(x),V.add(at(u(x)),[-2.4,1.6,5]),at(u(x+.6)));
  C.shot(u(19.4),[-1,12.4,-62],[5,12.6,-71],52); C.move(u(19.4),4,[-1.6,12.8,-61],[6.5,12.6,-70],50,'lin');
  // an apology, a promise, and back to the cable
  A.faceToward(u(23),1,[6,1,-45]); A.express(u(23.4),'sad',.6); D(u(24),2.4,'Sorry! You\u2019ll get your share. I promise.','warm'); S(u(24),'voice',{pattern:'q2'});
  A.flyTo(u(27),6.4,S0,'inOut'); A.thrust(u(27),1,1); A.faceToward(u(27),1,S0); A.turnTo(u(32),2,A.tr.yaw.at(AT)); S(u(27.2),'whoosh',{d:4,soft:1});
  TK(u(29.4),1.4,'You planned that?','stern'); A.express(u(31),'playful',.4); D(u(31.2),1,'\u2026Mostly.','playful'); S(u(31.2),'voice',{pattern:'giggle'});
  T.tockPos.key(u(26),[2,9,-64],'inOut').key(u(34),TK0,'inOut');
  C.shot(u(23),[12,4,-34],[6,4,-48],46); C.move(u(23),4,[11,4.4,-36],[7,3,-46],44,'lin');
  C.shot(u(27),[0,14,-56],V.lerp(at(u(30)),S0,.4),52); C.move(u(27),9,V.add(S0,[5,2,8]),S0,48,'inOut');
});
G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,CH,beat}=K, I0=5780;
  add(I0,4,36,'drone',.5,0,{att:.5}); chord(I0+.6,3.4,[37,40,44],'brass',.4,{});
  for(let k=0;k<Math.floor(16.8/.25);k++) add(I0+4.4+k*.25,.18,[57,60,64,60,57,62,64,67][k%8]+(k>40?12:0),'pluck',.5,(k%2?.35:-.35));
  for(let k=0;k<17;k++) add(I0+4.4+k,.6,[33,33,40,36][k%4],'bass',.6,0);
  ['Am7','Fmaj7','Dm9','Em7'].forEach((c,b)=>chord(I0+4.4+b*4.2,4.3,CH[c].map(x=>x+12),'strings',.3,{att:.2}));
  add(I0+21.6,1,31,'timp',1.3,0); chord(I0+21.6,1.4,[45,52,57,61],'brass',.5,{});
  chord(I0+24,6,CH.Am7.map(x=>x+12),'pad',.3,{att:1}); [[I0+31.2,79],[I0+31.5,83]].forEach(([t,m])=>add(t,.4,m,'celesta',.5,0));
});
})(typeof window!=='undefined'?window:globalThis);
