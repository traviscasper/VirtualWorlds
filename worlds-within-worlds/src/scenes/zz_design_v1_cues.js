/* ARCHIVE character design 1.0 — performance cues for Chapter 1.
   Adds the new design's expressive layers on top of the existing animation without changing
   any motion or camera: chest-emblem activity at discoveries, scanning, portals and energy moments;
   concentric-ring "analysis" eyes; the playful expression. Loaded after the chapter scene files. */
(function(G){
'use strict';
G.ARCHIVE_SCENE_BUILDERS = G.ARCHIVE_SCENE_BUILDERS || [];
G.ARCHIVE_SCENE_BUILDERS.push(function(K){
  const {A} = K;
  // emblem activity: [start, hold seconds, level]
  [[14.5,3,1],[79.4,6,.8],[90.9,6,1],[103,12,.9],[124.6,2.4,.6],[138,22,1],[169.9,4,1.2],[183.3,5,1.4],
   [236,2.4,.6],[266.4,2,.9],[282.2,3,.9],[306.6,16,.9],[330,48,1],[412,8,1.1],[454.4,4,1.2],[476,52,1]]
   .forEach(([t,d,v])=>A.activate(t,d,v));
  // analysis eyes while reading the Loom and the forming ring
  A.express(141.2,'analyze',.4); A.express(312,'analyze',.5); A.express(318.4,'curious',.5);
  // playful beats
  A.express(48.2,'playful',.3); A.express(160.6,'playful',.3); A.express(496,'playful',.4);
});
})(typeof window!=='undefined'?window:globalThis);
