/* STORY v2 — clarity layer: the storyteller's narration and readable hologram text.
   The narrator is not a character: a warm storyteller voice that frames the film (opening, each chapter, ending).
   Hologram text makes the stakes visible: network integrity, the Keystone shards, district loads, reef health.
   (Keystone shard pickups and Magnus are being animated in the following passes; see docs/PRODUCTION_PLAN.md §24.) */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
const NARR=[
  [1.0,'Long ago, every world was connected by a network of light called the Loom. Its rhythm kept them all in time.'],
  [8.0,'But the rhythm was failing. And deep in a forgotten Archive, the one who once kept it\u2026 was waking up.'],
  [73,'The tiny world was a map. It showed the four shards of the Keystone \u2014 the only thing that could restart the Loom\u2019s heart.'],
  [541,'The first shard was hidden in Verdance, the First World \u2014 a city that gives back everything it takes.'],
  [1081,'Between the worlds turns the Orrery, where every world holds another world inside it.'],
  [1621,'The second shard lay in Ferrum, a city of power\u2026 and of hunger. Someone was draining its light.'],
  [2161,'The third shard lay beneath Thalassa\u2019s sea, guarded by a reef that remembered everything.'],
  [2701,'With three shards, ARCHIVE could finally see the Loom itself \u2014 and the one hiding inside it.'],
  [3241,'The last shard waited beyond every map, in the Lost Worlds, where the storm had already won.'],
  [3781,'At the Core waited Magnus, the oldest of the Wardens. Afraid of going dark, he had taken the light for himself.'],
  [4321,'One robot could not hold the Loom. But no one was ever meant to.'],
  [4861,'And so the worlds were connected again \u2014 not by one heart, but by all of them.'],
  [5293,'Every world is connected. And every door\u2026 is a new beginning.'],
];
G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {dialogue,S} = K;
  const busy=(a,b)=>dialogue.some(d=>d.character!=='NARRATOR'&&d.start<b+.4&&d.end>a-.4);
  NARR.forEach(([t,text],i)=>{ const dur=Math.max(4,text.length*.068); let s=t;
    for(let k=0;k<40&&busy(s,s+dur);k++) s+=.5;          // slide into the next gap in the dialogue
    dialogue.push({id:`NARR-${String(i+1).padStart(2,'0')}`,character:'NARRATOR',text,start:s,end:s+dur,emotion:'warm storyteller',scene:'NARRATION',audio:null,face:null}); });
});
const P0=[1.6,2.95,-3.4], P2=[-3.2,2.55,1.4];
G.ARCHIVE_HOLOTEXT=(G.ARCHIVE_HOLOTEXT||[]).concat([
  // Chapter 1: the Archive's panels and the map
  {t0:51,t1:118,world:0,pos:P0,size:.11,lines:['LOOM NETWORK','INTEGRITY  37% \u25BC','WORLDS ONLINE 41/112'],alert:1},
  {t0:51,t1:118,world:0,pos:P2,size:.11,lines:['ARCHIVE UNIT','STATUS: AWAKE','LAST ACTIVE: 1,042 YEARS AGO']},
  {t0:73,t1:88,world:0,pos:[0,2.55,0],size:.12,lines:['KEYSTONE MAP','SHARDS FOUND  0 / 4'],color:'#FFD98A'},
  {t0:145,t1:166,world:0,pos:[0,6.7,0],size:.22,lines:['THE LOOM \u00B7 14 WORLDS IN VIEW']},
  {t0:179.2,t1:189,world:0,pos:[-2.6,6.2,-2.8],size:.2,lines:['THREAD LOST: NODE 9'],color:'#FF9A8A'},
  // Chapter 2: the flicker
  {t0:900,t1:913,lines:['\u26A0 POWER DRAIN DETECTED','SOURCE: UNKNOWN'],x:.05,y:.1,px:36,color:'#FFC48A'},
  // Chapter 4: Ferrum's grid
  {t0:1713.5,t1:1746,world:4,pos:[0,8.1,-85.9],size:.32,lines:['FERRUM GRID','EAST   112% \u25B2','WEST     3% \u25BC','LOAD: CRITICAL'],alert:3},
  {t0:1950,t1:1966,world:4,pos:[0,8.1,-85.9],size:.32,lines:['FERRUM GRID','EAST   56%','WEST   54%','LOAD BALANCED \u2713']},
  {t0:2004,t1:2016,lines:['ENERGY FLOW \u2192 CORE','RETURN: 0%'],x:.05,y:.1,px:36,color:'#E0A8FF',alert:1},
  // Chapter 5: the reef
  {t0:2228,t1:2238,lines:['REEF HEALTH  55%','LIGHT EXCHANGE: BROKEN'],x:.05,y:.1,px:36,alert:1},
  {t0:2586,t1:2600,lines:['REEF HEALTH  100%','LIGHT EXCHANGE: RESTORED \u2713'],x:.05,y:.1,px:36},
  // Chapter 6: Alicia's map
  {t0:2946,t1:2958,world:6,pos:[0,1.75,-103.3],size:.09,lines:['COSMIC CORE','ALL FLOW ENDS HERE'],color:'#FFD98A'},
  // Chapter 7: the choice
  {t0:3436,t1:3458,lines:['THREAD A   41%','THREAD B   17% \u25BC'],x:.05,y:.1,px:36,alert:1},
  // Chapter 8: the Seat
  {t0:3910,t1:3922,world:8,pos:[0,2.9,-70.6],size:.16,lines:['CONDUCTOR SEAT','ASSIGNED: ARCHIVE'],color:'#FFD98A'},
  // Chapter 9: restored
  {t0:4618,t1:4632,lines:['NETWORK INTEGRITY  100%','EVERY WORLD IN TIME \u2713'],x:.05,y:.1,px:36},
]);
})(typeof window!=='undefined'?window:globalThis);
