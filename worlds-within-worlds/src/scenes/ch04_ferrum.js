/* CHAPTER 4 — THE BROKEN CITY (27:00–36:00)
   Ferrum: a dense red-and-blue city at night whose districts are losing power. ARCHIVE builds a gloriously
   over-complicated holographic machine that fails, then finds the simple fix: share power between districts.
   The city steadies, but a neighbouring district dims and its energy streams up into the sky and never comes
   back — the chapter's clue. Alicia flickers in a panel for a moment.
   CH04_SC01 Ferrum (27:00–30:00) · CH04_SC02 The machine (30:00–33:00) · CH04_SC03 The leak (33:00–36:00)
   World id 4 = Ferrum (src/worlds/40_ferrum.glsl). */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCORE_EXT = G.ARCHIVE_SCORE_EXT || [];
G.ARCHIVE_SFX_EXT = G.ARCHIVE_SFX_EXT || {};
const T0=1620, T1=2160;
const CORE_A=[12,0,-76], CORE_B=[-12,0,-76], MACH=[0,0,-72], LEAK_A=[4,34,-205];

G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A,C,W,S,V,clamp,lerp,sstep,Track,dialogue,SCENES} = K;
  const T=W.tr, PI=Math.PI;
  const D=(t,dur,text,emotion,scene,who='ARCHIVE')=>dialogue.push({character:who,text,start:t,end:t+dur,emotion,scene,audio:null,face:emotion});
  const TK=(t,dur,text,emotion,scene)=>{ D(t,dur,text,emotion,scene,'TOCK'); S(t,'tock_voice',{n:Math.max(2,Math.round(text.length/4))}); };
  const PA=(t,dur,text,scene)=>{ D(t,dur,text,'neutral',scene,'CITY'); S(t,'pa'); };
  const at=t=>A.tr.pos.at(t);
  const meta={CH04_SC01:'Ferrum',CH04_SC02:'The machine',CH04_SC03:'The leak'};
  for(const s of SCENES) if(meta[s.id]){ s.title=meta[s.id]; s.status='animated'; }

  // ---------- city state ----------
  T.dist=new Track([1,1,1,0]); T.mach=new Track([0,0,0,0]); T.link=new Track([0,0,0,0]); T.lamps=new Track(1);
  const tspd=new Track(9); tspd.key(1676,9,'lin').key(1681,0,'out').key(1950,0,'lin').key(1955,9,'in');
  const DT=.05, N=Math.ceil((T1-T0)/DT)+2, ti=new Float64Array(N), sp=new Float64Array(N);
  const mspin=new Track(0); mspin.key(1838,0,'lin').key(1842,4,'in').key(1866,9,'lin').key(1872,0,'out');
  for(let i=1;i<N;i++){ const x=T0+(i-1)*DT; ti[i]=ti[i-1]+tspd.at(x)*DT; sp[i]=sp[i-1]+mspin.at(x)*DT; }
  const integ=(arr,t)=>{ const f=clamp((t-T0)/DT,0,N-2), i=Math.floor(f); return arr[i]+(arr[i+1]-arr[i])*(f-i); };
  const trainZ=t=>{ const z=integ(ti,t); return 118-(((z%420)+420)%420); };
  const topA=V.add(CORE_A,[0,9,0]), topB=V.add(CORE_B,[0,9,0]);
  const linkEnd=t=> t<1928 ? topB : (t<1946 ? V.add(at(t),[0,-.15,.25]) : topA);
  W.exts.push((t,s)=>{ if(t<T0-1||t>T1+1) return;
    s.U=Object.assign(s.U||{},{ uDist:s.dist, uRail:[trainZ(t),1,s.lamps,0], uLink:s.link, uLinkEnd:linkEnd(t), uMach:[s.mach[0],s.mach[1],s.mach[2],integ(sp,t)], uAli:s.ali, uAliB:s.aliB });
    if(s.world>3.5) s.holoDef=[ {c:[-6.5,4.2,-64],n:V.norm([.5,0,1]),u:[0,1,0],s:[1.4,.85]}, {c:[0,7.2,-86],n:[0,0,1],u:[0,1,0],s:[2.2,1.2]}, {c:[6.5,4.2,-64],n:V.norm([-.5,0,1]),u:[0,1,0],s:[1.4,.85]} ];
  });

  // ================= CH04_SC01 · Ferrum (1620–1800) =================
  T.world.cut(T0,4); T.tunnel.cut(T0,[0,0,0,0]); T.loom.cut(T0,[0,0,0,0]); T.loomB.cut(T0,[0,0,3,0]); T.orb.cut(T0,[0,-40,0,0]); T.orbGlow.cut(T0,0);
  T.holo.cut(T0,[0,0,0]); T.mirror.cut(T0,0); T.glitch.cut(T0,0); T.shelf.cut(T0,[-1,0,0]); T.ali.cut(T0,[0,-50,0,0]); T.bfly.cut(T0,0);
  T.exposure.cut(T0,6); T.exposure.to(T0,3,1,'out'); T.fade.cut(T0,1);
  T.portal.cut(T0,[0,3.4,9,2.2]); T.portalOpen.cut(T0,1); T.portalFX.cut(T0,[0,1,3,0]); T.portalOpen.to(T0+2,4,0,'inOut'); S(T0+2.2,'portal_close');
  T.tockVis.cut(T0,1); T.tockEye.cut(T0,[1,0,0,0]);
  A.tr.roll.cut(T0,0); A.tr.jitter.cut(T0,0); A.tr.power.cut(T0,1); A.tr.bob.cut(T0,1); A.tr.headYaw.cut(T0,0); A.tr.headPitch.cut(T0,0); A.tr.headTilt.cut(T0,0);
  A.place(T0,[0,3.4,8],PI); A.tr.thrust.cut(T0,1.2); A.flyTo(T0,2.8,[0,3,1],'out'); A.thrust(T0+1.2,2,.65);
  T.tockPos.cut(T0,[.9,3.8,8.6]); T.tockPos.key(T0+3,[1.2,3.5,1.6],'out'); T.tockYaw.cut(T0,PI);
  S(T0,'city_hum',{d:540});
  A.express(T0+.6,'surprised',.4); A.lookAt(T0+3,2,[-14,30,-40]); A.lookAt(T0+6,2,[14,26,-30]);
  C.shot(T0,[2.4,2.2,-5],[0,3.2,4],42); C.move(T0,8,[3.2,1.8,-6.4],[0,3.6,2],46,'inOut');
  A.express(T0+7,'excited',.8); D(T0+8.6,1.2,'Whoa\u2026','surprised','CH04_SC01'); S(T0+8.6,'voice',{pattern:'whoa'});
  T.tockEye.key(T0+10,[1,0,0,0],'lin').key(T0+10.6,[.45,0,0,0]); TK(T0+11,2,'Too bright. Too loud.','stern','CH04_SC01');
  // the train passes overhead
  A.lookAt(1631.6,1,[0,12.5,-14]); A.lookAt(1633.4,1.6,[0,12.5,10]); A.express(1632,'surprised',.3); S(1632.6,'train',{d:5});
  C.shot(1630,[-4.6,1.6,-1],[0,8,-6],56); C.move(1630,8,[-5.2,1.4,-2.4],[0,9,-2],58,'lin');
  A.express(1636,'happy',.6); TK(1640,2.4,'Stay close. Cities eat small drones.','stern','CH04_SC01');
  A.express(1642.6,'playful',.4); D(1643,1.4,'Not this one!','playful','CH04_SC01'); S(1643,'voice',{pattern:'giggle'});
  C.shot(1638,[1.6,2.6,-3.2],[0,3,1],36); C.move(1638,10,[1.8,2.8,-3.6],[0,3.1,1],36,'lin');
  // down the avenue toward the plaza
  A.faceToward(1648,1.2,[0,4,-30]); A.path(1649,[[-2,4.2,-12],[1.5,6,-26],[-2.5,4.8,-40],[0,4,-52]],22,'inOut'); A.thrust(1649,1,1.05); S(1649.4,'whoosh',{d:5}); S(1660,'whoosh',{d:5});
  for(let tt=1649;tt<=1672;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[.9,.55,.9]),'lin');
  A.express(1650,'excited',.5); A.lookAt(1656,2,[-12,24,-30]); A.lookAt(1662,2,[12,20,-50]);
  C.shot(1648,[4,3,2],[0,4,-14],48); for(const t of [1652,1656,1660,1664,1668]) C.via(t,V.add(at(t),[3.4,1.6,6.2]),V.add(at(t+1),[0,0,-6]));
  // the first failure
  T.dist.key(1674.6,[1,1,1,0],'lin').key(1675,[1,.6,1,1],'out').key(1676,[1,.9,1,1]).key(1677,[1,.3,1,1],'out').key(1679,[1,.15,1,0],'in').key(1688,[.75,.03,1,0],'inOut');
  S(1675,'brownout',{d:4}); S(1679,'power_down');
  A.express(1675.2,'surprised',.3); A.tr.jitter.key(1675.2,0,'lin').key(1675.4,.4).key(1676.4,0); A.lookAt(1676,2,[-16,16,-60]);
  PA(1682,3.2,'Load exceeded. District West offline.','CH04_SC01');
  A.express(1683,'worried',.6); T.tockEye.key(1683,[.45,0,0,0],'lin').key(1684,[1.2,0,0,0]);
  C.shot(1674,V.add(at(1674),[-3,1.2,-5]),V.add(at(1674),[-6,6,-14]),50); C.move(1674,12,V.add(at(1674),[-3.6,1.6,-6]),V.add(at(1674),[-8,8,-16]),52,'inOut');
  // into the substation plaza
  A.faceToward(1689,1,[0,4,-66]); A.flyTo(1690,7,[0,3.4,-63],'inOut'); A.thrust(1690,1,.9); A.thrust(1696,1,.6); S(1690.2,'whoosh',{d:5,soft:1});
  for(let tt=1690;tt<=1698;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[.9,.55,.9]),'lin');
  T.tockPos.key(1699,[1.3,3.9,-62.6],'inOut');
  A.lookAt(1698,1.6,V.add(CORE_A,[0,8,0])); A.lookAt(1701,1.6,V.add(CORE_B,[0,8,0]));
  TK(1704,2.6,'Unstable grid. Do not touch anything.','stern','CH04_SC01');
  A.lookAt(1708,1,[0,4,-76]); A.express(1708.4,'determined',.6); D(1709,1.6,'We have to help.','determined','CH04_SC01'); S(1709,'voice',{pattern:'q2'});
  C.shot(1689,[14,9,-42],[0,6,-76],50); C.move(1689,10,[10,7,-50],[0,6,-76],48,'inOut');
  C.shot(1699,[3,3.6,-58],[0,6,-76],48); C.move(1699,13,[3.6,3.4,-57],[-2,6,-76],48,'lin');
  // diagnostics
  T.holo.to(1713,1.2,[1,1,1]); S(1713.2,'holo_on');
  A.flyTo(1714,4,[0,4.6,-80.6],'inOut'); A.faceToward(1714,1.6,[0,7.2,-86]); A.thrust(1714,1,.8); A.thrust(1718,1,.6);
  T.tockPos.key(1718.4,[1.6,5.4,-80],'inOut');
  A.express(1718.4,'analyze',.5); A.scan(1719,4); S(1719.2,'scan');
  D(1724,2.2,'Too much here\u2026 nothing there.','thinking','CH04_SC01'); S(1724,'voice',{pattern:'q2'});
  A.lookAt(1727,1,[-6.5,4.2,-64]); A.lookAt(1729,1,[6.5,4.2,-64]); A.express(1730,'thinking',.6);
  TK(1734,3,'The east district has power to spare. The west has none.','soft','CH04_SC01');
  A.express(1738,'thinking',.6); A.tr.headTilt.to(1738,.6,.25);
  C.shot(1713,[3.6,5.2,-75.6],[0,6.6,-86],44); C.move(1713,13,[2.8,5.0,-76.8],[0,6.6,-86],40,'lin');
  C.shot(1726,[-2.4,5.4,-84],[0,4.8,-80.4],36); C.move(1726,14,[-2.0,5.2,-84.4],[0,4.8,-80.4],34,'lin');
  // ...and gets the wrong idea, enthusiastically
  A.tr.headTilt.to(1741,.4,0); A.express(1741.2,'excited',.2); A.armsUp(1741.4,.4); A.rest(1742.8,.5); D(1741.6,1.2,'I know!','excited','CH04_SC01'); S(1741.6,'voice',{pattern:'hi'});
  T.tockEye.key(1742.6,[1.2,0,0,0],'lin').key(1743.4,[.5,0,0,0]); TK(1744,1.6,'Oh no.','worried','CH04_SC01');
  C.shot(1740,[2.2,4.8,-77.8],[0,4.8,-80.6],34); C.move(1740,8,[2.4,4.9,-77.4],[0,4.8,-80.6],34,'lin');
  // a slow city beat: lights hum, ARCHIVE gathers parts (sparks of hologram)
  A.flyTo(1748,6,[0,2.6,-68],'inOut'); A.faceToward(1748,1.4,MACH); A.thrust(1748,1,.8); A.thrust(1754,1,.6); A.activate(1752,46,1.2);
  T.tockPos.key(1754,[3.4,3.6,-66],'inOut');
  C.shot(1748,[8,6,-56],[0,2,-72],46); C.move(1748,52,[6,4.6,-60],[0,2.4,-72],44,'inOut');
  A.express(1756,'determined',.6); A.reach(1760,.6,true); S(1760.4,'holo_on'); A.rest(1764,.6);
  D(1770,2.2,'It needs\u2026 a few parts.','determined','CH04_SC01'); S(1770,'voice',{pattern:'q'});
  TK(1776,2.4,'How many is a few?','stern','CH04_SC01'); A.express(1779,'playful',.4); D(1779.6,1,'Lots.','playful','CH04_SC01'); S(1779.6,'voice',{pattern:'giggle'});

  // ================= CH04_SC02 · The machine (1800–1980) =================
  const steps=[1800,1806,1811,1816,1821,1826,1831,1836];
  steps.forEach((t,k)=>{ T.mach.key(t,[k/8,0,0,0],'lin').key(t+.6,[(k+1)/8+.001,0,0,0],'outBack'); S(t+.2,k%2?'boing':'clank');
    const ang=k*.9, pos=V.add(MACH,[Math.cos(ang)*3.4,2.2+Math.sin(k*1.3)*1.2,Math.sin(ang)*2.2+1]);
    A.flyTo(t-1.6,1.4,pos,'inOut'); A.faceToward(t-1.6,.8,V.add(MACH,[0,2.4,0])); A.reach(t-.3,.3,k%2===0); A.rest(t+.5,.3); });
  A.thrust(1798,1,.9); A.express(1800,'excited',.5); S(1800.2,'voice',{pattern:'giggle'}); S(1820,'voice',{pattern:'hi'});
  TK(1814,1.6,'What does it do?','curious','CH04_SC02'); A.express(1816.6,'thinking',.3); D(1817.6,1.4,'It\u2026 helps!','playful','CH04_SC02'); S(1817.6,'voice',{pattern:'q'});
  T.tockEye.key(1826,[.5,0,0,0],'lin').key(1827,[.35,0,.2,0]);
  C.shot(1798,[5.2,3.6,-62],[0,2.6,-72],46); C.move(1798,40,[-5.6,4.4,-62.4],[0,2.8,-72],48,'inOut');
  // it runs!
  A.flyTo(1838,2,[2.6,3,-64.6],'inOut'); A.faceToward(1838,1,V.add(MACH,[0,2.4,0])); A.thrust(1838,1,.6);
  T.tockPos.key(1838,[4.2,3.8,-64],'inOut');
  T.mach.key(1838,[1,0,0,0],'lin').key(1842,[1,1,0,0],'in'); S(1840,'machine',{d:30});
  A.express(1842,'excited',.5); A.armsUp(1843,.5); A.rest(1845,.6); D(1843,1,'Yes!','excited','CH04_SC02'); S(1843,'voice',{pattern:'hi'});
  T.dist.key(1844,[.75,.03,1,0],'lin').key(1848,[.75,.2,1,1],'inOut').key(1851,[.7,.08,1,1]).key(1856,[.65,.15,1,1]);
  C.shot(1842,[9,3.6,-68.4],[1,2.8,-68.4],50); C.move(1842,12,[9.6,3.9,-68.8],[1,2.8,-68.6],50,'lin');
  // ...wobbles, overheats, and collapses
  T.mach.key(1856,[1,1,0,0],'lin').key(1866,[1,1.8,.35,0],'in'); A.express(1858,'worried',.5); TK(1861,1.6,'Is it supposed to do that?','worried','CH04_SC02');
  A.express(1866,'surprised',.15); T.mach.key(1872,[1,1.6,.6,0],'lin').key(1873.4,[1,0,1,0],'in').key(1876,[0,0,1,0],'in'); S(1872.6,'collapse');
  T.dist.key(1872,[.65,.15,1,1],'lin').key(1873.6,[.42,.02,1,1],'out').key(1876,[.45,.02,1,0]);
  A.flyTo(1872.6,.8,[3.8,3.4,-62.6],'outExpo'); A.tr.jitter.key(1872.6,0,'lin').key(1872.8,.7).key(1874.6,0); A.arms(1872.6,.2,[1.9,.9,.2],[1.9,.9,.2],'out'); S(1872.8,'voice',{pattern:'eep'});
  PA(1877,2.6,'Load exceeded. District East unstable.','CH04_SC02');
  A.rest(1878,.6); A.express(1878.4,'frustrated',.4); A.express(1882,'sad',1);
  C.shot(1856,[5.2,3.4,-60.6],[0,3,-72],44); C.tr.shake.key(1866,0,'lin').key(1872.6,1.2).key(1875,0); C.move(1856,22,[6.6,4,-58.8],[0,2.6,-72],46,'inOut');
  // a quiet word from Tock
  A.flyTo(1883,4,[2.4,.9,-64],'inOut'); A.thrust(1883,1,.5); A.tr.bob.to(1884,2,.4); A.tr.headPitch.to(1885,1,.25);
  T.tockPos.key(1888,[3.2,1.3,-63.6],'inOut'); T.tockEye.key(1888,[.35,0,.2,0],'lin').key(1889,[.8,0,0,0]);
  TK(1892,3.6,'Courier rule twelve: the simplest route is usually the right one.','soft','CH04_SC02');
  A.tr.headPitch.to(1897,.8,0); A.express(1897.4,'curious',.6); A.lookAt(1899,1.4,V.add(CORE_A,[0,8,0])); A.lookAt(1902,1.4,V.add(CORE_B,[0,8,0]));
  A.express(1904,'analyze',.5); A.lookAt(1906,1,[0,9,-76]); A.express(1909,'excited',.3); D(1909.6,1.6,'Share it!','excited','CH04_SC02'); S(1909.6,'voice',{pattern:'hi'});
  C.shot(1883,[5.6,1.6,-60.6],[2.6,1.4,-64],38); C.move(1883,18,[5,1.5,-61],[2.8,1.6,-64],34,'lin');
  C.shot(1901,[-1.4,1.6,-62],[2.6,1.8,-64.4],36); C.move(1901,10,[-1.6,1.7,-61.6],[2.6,1.8,-64.4],34,'lin');
  // the simple fix: carry the cable across
  A.tr.bob.to(1911,1,1); A.faceToward(1911,1,topB); A.flyTo(1912,8,V.add(topB,[3.3,.6,0]),'inOut'); A.thrust(1912,1,1); S(1912.4,'whoosh',{d:5});
  for(let tt=1912;tt<=1920;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[.9,.6,.9]),'lin');
  A.faceToward(1920,1,topB); A.reach(1922,.6,true); S(1924,'clank'); A.activate(1922,30,1.4);
  T.link.key(1927.5,[0,0,0,0],'lin').key(1928.2,[.45,0,0,0],'out'); S(1928,'cable',{d:18});
  A.express(1928,'determined',.4); A.faceToward(1928,1.2,topA);
  A.path(1929,[[-5,9.6,-75.6],[0,9.2,-76],[5,9.6,-76.4],V.add(topA,[-3.3,.6,0])],16.4,'inOut'); A.thrust(1929,1,1.3);
  A.tr.jitter.key(1929,0,'lin').key(1930,.25).key(1944,.35).key(1945.6,0);
  T.tockPos.key(1930,V.add(at(1930),[0,1.2,1]),'inOut'); TK(1935,1.6,'Almost! Almost!','panic','CH04_SC02');
  A.faceToward(1945,.8,topA); A.reach(1945.4,.4,true); S(1946,'plug');
  T.link.key(1946,[.45,0,0,0],'lin').key(1947,[1.1,0,0,0],'out').key(1950,[.85,0,0,0]);
  T.dist.key(1946,[.45,.02,1,0],'lin').key(1949,[.9,.85,1,0],'inOut'); S(1946.4,'power_up2'); T.lamps.key(1946,1,'lin');
  PA(1951,2.6,'Load balanced. All districts nominal.','CH04_SC02');
  A.rest(1947,.6); A.express(1947.4,'excited',.3); A.spin(1948,1.6,1); A.armsUp(1948,.5); A.rest(1950,.6); S(1948,'voice',{pattern:'giggle'}); S(1948.2,'spin');
  T.tockEye.key(1953,[.8,0,0,0],'lin').key(1954,[.85,0,0,.8]); TK(1955,1.4,'Efficient.','proud','CH04_SC02');
  A.express(1957,'proud',.5); D(1957.6,1.8,'Simplest route.','proud','CH04_SC02'); S(1957.6,'voice',{pattern:'hi'});
  C.shot(1911,[-4,4,-62],[-12,8,-76],50); C.move(1911,9,[-6,6,-64],[-12,9,-76],48,'inOut');
  C.shot(1928,[0,4,-56],[0,9,-76],54); for(const t of [1932,1936,1940,1944]) C.via(t,V.add(at(t),[0,-2.6,9]),V.add(at(t),[0,0,-2]));
  C.shot(1946.2,[0,5,-60],[0,8,-76],56); C.move(1946.2,14,[0,12,-50],[0,9,-90],60,'inOut');
  C.shot(1960.2,V.add(topA,[-4,1,5]),V.add(at(1960),[0,0,0]),40); C.move(1960.2,19.8,V.add(topA,[-4.6,1.4,6]),at(1960),40,'lin');
  A.lookAt(1962,2,[0,20,-150]); A.express(1966,'happy',.8); A.tr.bob.to(1966,2,.6);

  // ================= CH04_SC03 · The leak (1980–2160) =================
  T.dist.key(1984,[.9,.85,1,0],'lin').key(1990,[.9,.85,.7,1],'inOut').key(1996,[.9,.85,.45,0],'inOut');
  S(1985,'brownout',{d:5}); A.lookAt(1986,1.6,[0,24,-200]); A.express(1986.4,'worried',.6);
  T.link.key(1994,[.85,0,0,0],'lin').key(2004,[.85,1,0,0],'inOut'); S(1994.4,'leak',{d:60});
  TK(1998,2,'The far district\u2026 it\u2019s fading.','worried','CH04_SC03');
  A.express(2003,'analyze',.5); A.scan(2004,3.4);
  D(2009,2.8,'It\u2019s going\u2026 up. And it\u2019s not coming back.','worried','CH04_SC03'); S(2009,'voice',{pattern:'q2'});
  C.shot(1984,V.add(topA,[-3.4,2,4]),[0,30,-205],46); C.move(1984,16,V.add(topA,[-3,2.6,3.2]),[4,50,-210],44,'inOut');
  C.shot(2000,[6,9.6,-66.5],V.add(at(2000),[0,.3,0]),36); C.move(2000,12,[5.8,9.7,-67],V.add(at(2000),[0,.3,0]),34,'lin');
  // Alicia flickers in the big panel for a moment
  const ALIP=[0,7.2,-84.8];
  T.ali.key(2014,[...ALIP,0],'lin').key(2015,[...ALIP,.7],'out').key(2016.2,[...ALIP,.3]).key(2017,[...ALIP,.75],'out').key(2019.4,[...ALIP,0],'in');
  T.aliB.cut(2014,[2.6,0,.6,0]); T.aliB.key(2015,[2.6,0,-.1,0],'out').key(2019.4,[2.6,.5,.9,0],'in'); T.glitch.key(2014,0,'lin').key(2014.3,1,'out').key(2019.6,0);
  S(2014.2,'glitch',{d:1.2}); S(2015,'alicia',{d:5});
  D(2015.4,2.6,'\u2026hold\u2026 on\u2026','faint','CH04_SC03','ALICIA');
  A.lookAt(2014.2,.6,ALIP); A.express(2014.4,'surprised',.2); D(2020,1.4,'It\u2019s her!','surprised','CH04_SC03'); S(2020,'voice',{pattern:'eep'});
  TK(2022.4,1.6,'Who is she?','curious','CH04_SC03'); A.express(2024,'thinking',.6); D(2025,2.4,'I don\u2019t know. But she needs help.','determined','CH04_SC03'); S(2025,'voice',{pattern:'q2'});
  C.shot(2013.8,[3.2,8.6,-74],ALIP,40); C.move(2013.8,6,[2.8,8.2,-76],ALIP,30,'in');
  C.shot(2019.8,V.add(at(2020),[1.8,.6,-2.4]),V.add(at(2020),[0,.3,0]),34); C.move(2019.8,10,V.add(at(2020),[1.6,.6,-2.2]),V.add(at(2020),[0,.3,0]),32,'lin');
  // follow the leak up
  const up1=[2,26,-150], up2=[4,40,-195], top=[8,66,-214];
  A.faceToward(2030,1,up1); A.path(2031,[[8,14,-100],up1,up2,top],26,'inOut'); A.thrust(2031,1,1.25); A.thrust(2056,1,.7); S(2031.4,'whoosh',{d:6}); S(2041,'whoosh',{d:6}); S(2050,'whoosh',{d:5});
  for(let tt=2031;tt<=2057;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.8),[1,.6,1]),'lin');
  A.express(2032,'determined',.6); TK(2036,1.6,'Wait for me!','panic','CH04_SC03');
  C.shot(2030.6,[6,9,-72],[6,14,-100],52); for(const t of [2036,2042,2048,2054]) C.via(t,V.add(at(t),[4.6,1.4,8]),V.add(at(t+1.4),[0,1.2,-4]));
  // where the energy goes: a teal door opens at the top of the leak
  const P5=[8.6,70,-219]; T.portal.cut(2058,[...P5,3]); T.portalFX.cut(2058,[0,0,0,0]); T.portalOpen.cut(2058,0);
  T.portalFX.key(2059,[0,0,0,0],'lin').key(2060,[.6,.2,0,0],'out').key(2068,[1,1,0,0],'inOut'); S(2059.4,'spark',{d:9}); S(2068,'ring_hum',{d:6});
  T.portalOpen.key(2069,0,'lin').key(2076,1,'out'); T.portalFX.key(2071,[1,1,3,0],'lin').key(2080,[1,1,4,0],'inOut'); S(2069.2,'portal_open');
  A.lookAt(2059,1,P5); A.express(2059.4,'surprised',.3); A.express(2070,'curious',.6); A.activate(2069,14,1);
  T.tockPos.key(2060,V.add(top,[1.3,.4,.6]),'inOut');
  TK(2080,2.2,'Next stop: unscheduled.','soft','CH04_SC03'); A.express(2083,'happy',.4); D(2083.6,1.4,'My favourite kind.','happy','CH04_SC03'); S(2083.6,'voice',{pattern:'giggle'});
  A.express(2088,'determined',.6); A.power(2088,1,.75); A.power(2089.2,1.2,1.15); S(2088.2,'breath',{d:3});
  C.shot(2058,V.add(top,[6,1,6]),P5,46); C.move(2058,22,V.add(top,[4.6,.6,4.6]),P5,42,'lin');
  C.shot(2080,V.add(top,[2,.5,-2.8]),V.add(top,[0,.3,0]),34); C.move(2080,12,V.add(top,[1.8,.5,-2.5]),V.add(top,[0,.3,0]),32,'lin');
  const dirIn=V.norm(V.sub(P5,top)), past=V.add(P5,V.mul(dirIn,3));
  A.faceToward(2092,.8,P5); A.flyTo(2093,4,past,'in'); A.thrust(2093,2,1.5); A.express(2093.2,'excited',.4); S(2093.2,'whoosh',{d:4});
  for(let tt=2093;tt<=2097;tt+=.5) T.tockPos.key(tt,V.add(at(tt-.5),[.6,.5,.6]),'lin');
  C.shot(2092.6,V.add(top,V.add(V.mul(dirIn,-4),[1,1,0])),P5,46); C.move(2092.6,4.2,V.add(P5,V.mul(dirIn,-.6)),V.add(P5,V.mul(dirIn,6)),66,'in');
  T.exposure.key(2094.8,1,'lin').key(2097,7,'in'); S(2095,'flash');
  // closing image: Ferrum lit and linked, the far district dim, the leak still rising
  T.portalOpen.key(2097.2,1,'lin').key(2097.6,0,'cut'); A.tr.pos.cut(2097.3,[0,-60,0]); T.tockVis.key(2097.2,1,'lin').key(2097.3,0,'cut');
  T.exposure.key(2097.4,7,'lin').key(2103,1,'out');
  C.shot(2097.4,[30,40,-20],[0,20,-130],46); C.move(2097.4,60,[44,52,10],[0,30,-150],48,'inOut');
  T.fade.key(2152,1,'lin').key(2159.9,0,'inOut');
});

// =================== score for 27:00–36:00 ===================
G.ARCHIVE_SCORE_EXT.push(function(K){
  const {add,chord,CH,beat,bar,theme}=K, e8=beat/2;
  // Ferrum: a driving minor pulse, synth-like plucks over low strings
  const prog=['Am7','Fmaj7','Dm9','Em7'];
  for(let b=0;b<16;b++){ const t0=1624+b*bar; if(t0>1672) break; const c=CH[prog[b%4]];
    for(let j=0;j<8;j++) add(t0+j*e8,e8*.6,c[j%4]+12,'pluck',.32,(j%2?.35:-.35)); add(t0,bar,c[0]-12,'bass',.45,0); chord(t0,bar,c,'strings',.18,{att:.6}); }
  theme.slice(0,7).forEach(([b,m,d])=>add(1636+b*beat,d*beat,m+12-3,'brass',.4,0));
  // the brownout: everything sags
  add(1675,14,33,'drone',.5,0,{att:1}); chord(1679,8,[45,48,52],'strings',.28,{att:2});
  // the plaza and diagnostics: tense, thinking
  chord(1690,24,[45,52,57,60],'pad',.3,{att:3}); for(let k=0;k<20;k++) add(1714+k*1.1,.3,[81,84,88,91][k%4],'celesta',.25,Math.sin(k)*.5);
  // "I know!" → the machine: comic, bouncy, building
  add(1741.6,.6,84,'celesta',.6,0); add(1742,.6,88,'celesta',.6,0);
  const comic=[[0,67],[1,72],[2,71],[3,67],[4,74],[5,72],[6,71],[7,69]];
  for(let rep=0;rep<9;rep++) comic.forEach(([k,m])=>{ const t=1798+rep*8*e8+k*e8; add(t,e8*.55,m+(rep%3===2?12:0),'pluck',.6,(k%2?.3:-.3)); });
  for(let k=0;k<36;k++) add(1798+k*beat,beat*.4,[36,43,40,43][k%4],'pluck',.75,0);
  chord(1838,4,[48,52,55,60],'brass',.4,{}); for(let k=0;k<28;k++) add(1842+k*.5,.3,[72,76,79,84][k%4]+(k>16?1:0),'pluck',.45+k*.01,(k%2?.4:-.4));
  // collapse, silence, a sad piano
  add(1873,1,31,'timp',1.2,0); chord(1873,1.2,[37,44,49],'brass',.5,{});
  [[1880,'Am7'],[1885,'Fmaj7'],[1890,'Dm9'],[1895,'Em7']].forEach(([t,c])=>CH[c].forEach((m,k)=>add(t+k*.25,4.4,m+12,'piano',.35,k*.15-.2)));
  // the idea and the carry: rising, then the theme in full when the power returns
  chord(1909.6,2,[60,64,67,72],'strings',.35,{att:.1});
  ['Am7','Fmaj7','Cmaj7','Gsus','Am7','Fmaj7','Cmaj7','G'].forEach((c,b)=>{ const t0=1912+b*4.2; chord(t0,4.3,CH[c].map(x=>x+12),'strings',.22+b*.03,{att:.5}); add(t0,4.2,CH[c][0]-12,'bass',.45,0); });
  add(1946,1,36,'timp',1.2,0); chord(1946,6,[48,55,60,64,67],'brass',.5,{});
  theme.forEach(([b,m,d])=>{ add(1947+b*beat,d*beat,m+12,'brass',.5,0); add(1947+b*beat,d*beat,m+24,'strings',.55,0,{att:.15}); });
  // the leak: eerie, rising, unresolved
  add(1985,40,34,'drone',.5,0,{att:3}); chord(1994,20,[46,53,58,61],'pad',.36,{att:4});
  for(let k=0;k<16;k++) add(1995+k*1.2,.8,70+k,'celesta',.22,Math.sin(k*1.3)*.5);
  // Alicia in the panel: her bells, broken
  [[2015,88],[2015.6,91],[2016.9,96],[2017.5,95]].forEach(([t,m])=>add(t,2.2,m,'bell',.4,.1));
  // the climb and the teal door
  ['Dm9','Bbmaj7','Fadd9','Asus'].forEach((c,b)=>{ const t0=2031+b*6.5; chord(t0,6.6,CH[c].map(x=>x+12),'strings',.3,{att:1}); add(t0,6.5,CH[c][0]-12,'bass',.45,0); });
  add(2069.2,1,33,'timp',1.1,0); chord(2069.2,8,[45,52,57,61,64],'brass',.42,{});
  [[0,64],[1,67],[2,74]].forEach(([b,m])=>add(2083.6+b*beat,beat*1.6,m+12,'celesta',.5,0));
  add(2093,1,36,'timp',1.2,0); chord(2093,4,[48,55,60,64,67],'brass',.5,{});
  chord(2097,12,[48,55,60,64,67,72],'pad',.5,{att:.3}); [84,88,91,96].forEach((m,k)=>add(2097+k*.1,4,m,'bell',.5,k*.2-.3));
  chord(2110,40,[33,40,45,48],'pad',.28,{att:4}); add(2120,30,34,'drone',.3,0,{att:3});
});

Object.assign(G.ARCHIVE_SFX_EXT,{
  city_hum:(S,c)=>{ for(let k=0;k<c.d;k+=3) S({t:c.t+k,d:3.4,i:'noiseSweep',f0:120+((k*13)%60),f1:220+((k*29)%90),g:.12}); },
  train:(S,c)=>{ S({t:c.t,d:c.d,i:'noiseSweep',f0:200,f1:900,g:.5}); S({t:c.t,d:c.d,i:'hum',f0:90,f1:70,g:.35}); },
  brownout:(S,c)=>{ S({t:c.t,d:c.d,i:'crackle',g:1}); S({t:c.t,d:c.d,i:'hum',f0:120,f1:60,g:.4}); },
  pa:(S,c,u)=>{ S({t:c.t-.6,d:.3,f:u.mtof(79),i:'bell',v:.5}); S({t:c.t-.3,d:.3,f:u.mtof(74),i:'bell',v:.5});
    for(let k=0;k<8;k++) S({t:c.t+k*.2,d:.15,i:'chirp',f0:300+((k*5)%3)*40,f1:280,g:.35,stem:'dialogue'}); },
  clank:(S,c)=>{ S({t:c.t,d:.3,i:'thump',f:180,k:14,g:.6}); S({t:c.t,d:.2,i:'chirp',f0:1800,f1:900,g:.25}); },
  boing:(S,c)=>{ S({t:c.t,d:.5,i:'chirp',f0:300,f1:900,g:.45}); },
  machine:(S,c)=>{ for(let k=0;k<c.d;k+=.25) S({t:c.t+k,d:.12,i:'chirp',f0:400+(k*80)%600,f1:500+(k*60)%700,g:.18}); S({t:c.t,d:c.d,i:'hum',f0:90,f1:200,g:.3}); },
  collapse:(S,c)=>{ S({t:c.t,d:1.4,i:'thump',f:60,k:3,g:1}); S({t:c.t,d:2,i:'glitch',v:.8}); for(let k=0;k<6;k++) S({t:c.t+.2+k*.18,d:.3,i:'thump',f:200-k*20,k:10,g:.4}); },
  cable:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:70,f1:110,g:.4}); S({t:c.t,d:c.d,i:'crackle',g:.5}); },
  plug:(S,c)=>{ S({t:c.t,d:.6,i:'thump',f:90,k:6,g:.9}); S({t:c.t,d:.3,i:'chirp',f0:900,f1:2400,g:.4}); },
  leak:(S,c)=>{ S({t:c.t,d:c.d,i:'hum',f0:50,f1:70,g:.35}); for(let k=0;k<c.d;k+=4) S({t:c.t+k,d:4.4,i:'noiseSweep',f0:300,f1:2400,g:.12}); },
});
})(typeof window!=='undefined'?window:globalThis);
