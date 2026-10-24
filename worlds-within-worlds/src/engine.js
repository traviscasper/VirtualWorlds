/* ARCHIVE: Worlds Within Worlds — production engine (deterministic).
   renderFrame(t) always produces the same image for the same t. */
(function (G) {
'use strict';
const FPS = 30, FILM_SECONDS = 5400;

// ---------------- math ----------------
const V = {
  add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
  mul:(a,s)=>[a[0]*s,a[1]*s,a[2]*s], dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  len:a=>Math.hypot(a[0],a[1],a[2]), norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];},
  lerp:(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],
};
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const M = {
  rx:a=>{const c=Math.cos(a),s=Math.sin(a);return [1,0,0, 0,c,-s, 0,s,c];},
  ry:a=>{const c=Math.cos(a),s=Math.sin(a);return [c,0,s, 0,1,0, -s,0,c];},
  rz:a=>{const c=Math.cos(a),s=Math.sin(a);return [c,-s,0, s,c,0, 0,0,1];},
  mul:(A,B)=>{const R=new Array(9);for(let i=0;i<3;i++)for(let j=0;j<3;j++)R[i*3+j]=A[i*3]*B[j]+A[i*3+1]*B[3+j]+A[i*3+2]*B[6+j];return R;},
  ap:(A,v)=>[A[0]*v[0]+A[1]*v[1]+A[2]*v[2],A[3]*v[0]+A[4]*v[1]+A[5]*v[2],A[6]*v[0]+A[7]*v[1]+A[8]*v[2]],
  colMajor:A=>new Float32Array([A[0],A[3],A[6],A[1],A[4],A[7],A[2],A[5],A[8]]),
};
function hash(n){ let x=Math.imul((n|0)^0x9e3779b9,0x85ebca6b); x^=x>>>13; x=Math.imul(x,0xc2b2ae35); x^=x>>>16; return (x>>>0)/4294967296; }
function vnoise1(t,seed=0){ const i=Math.floor(t), f=t-i, u=f*f*(3-2*f); return lerp(hash(i*7+seed*131),hash((i+1)*7+seed*131),u)*2-1; }

// ---------------- easing & tracks ----------------
const EASE = {
  lin:x=>x, smooth:x=>x*x*(3-2*x), inOut:x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,
  out:x=>1-Math.pow(1-x,3), in:x=>x*x*x, outBack:x=>{const c=1.70158,d=c+1;return 1+d*Math.pow(x-1,3)+c*Math.pow(x-1,2);},
  cut:x=>x>=1?1:0, outExpo:x=>x>=1?1:1-Math.pow(2,-10*x),
};
class Track {
  constructor(v0, spline=false){ this.k=[{t:-1e9,v:v0,e:'lin'}]; this.spline=spline; }
  key(t,v,e='smooth'){ const k={t,v:Array.isArray(v)?v.slice():v,e}; let i=this.k.length; while(i>0&&this.k[i-1].t>t)i--; this.k.splice(i,0,k); return this; }
  to(t,dur,v,e='smooth'){ this.key(t,this.at(t),'lin'); this.key(t+Math.max(dur,1e-3),v,e); return this; }
  cut(t,v){ this.key(t-1e-4,this.at(t-1e-4),'lin'); this.key(t,v,'cut'); return this; }
  idx(t){ const k=this.k; let lo=0,hi=k.length-1; while(lo<hi){const m=(lo+hi+1)>>1; if(k[m].t<=t)lo=m; else hi=m-1;} return lo; }
  at(t){
    const k=this.k, i=this.idx(t);
    if(i>=k.length-1) return clone(k[k.length-1].v);
    const a=k[i], b=k[i+1]; const u=clamp((t-a.t)/(b.t-a.t),0,1); const w=(EASE[b.e]||EASE.smooth)(u);
    if(typeof a.v==='number') return a.v+(b.v-a.v)*w;
    if(this.spline && a.v.length===3 && b.e!=='cut'){
      if(Math.abs(a.v[0]-b.v[0])+Math.abs(a.v[1]-b.v[1])+Math.abs(a.v[2]-b.v[2])<1e-6) return a.v.slice(); // a hold stays put
      const p0=(i>0&&k[i-1].t>-1e8&&k[i].e!=='cut')?k[i-1].v:a.v, p3=(i+2<k.length&&k[i+2].e!=='cut')?k[i+2].v:b.v;
      return a.v.map((_,j)=>catmull(p0[j],a.v[j],b.v[j],p3[j],w));
    }
    return a.v.map((x,j)=>x+(b.v[j]-x)*w);
  }
}
function clone(v){ return Array.isArray(v)?v.slice():v; }
function catmull(p0,p1,p2,p3,t){ const t2=t*t,t3=t2*t; return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3); }

// ---------------- expressions ----------------
// open, lookX, lookY, happy, size, brow, wink, sad, smile, mouthOpen
const EXPR = {
  neutral:   [1, 0, 0, 0, 1,   0, 0, 0,  .3, 0, 0,0],
  happy:     [.9,0, 0, 1, 1,   0, 0, 0,  .95,.15, 0,0],
  curious:   [1.05,0,.1,0,1.1, 0, 0, 0,  .2, .05, .62,0],
  thinking:  [.72,.35,.45,0,1, 0, 0, 0, -.05,0, 1,0],
  excited:   [1.1,0, .1,.55,1.18,0,0,0,  1, .6, 0,0],
  surprised: [1.25,0,.05,0,1.32,0,0,0,   0, .85, 0,0],
  confused:  [.9,-.2,.1,0,1,   0, 0, .45, -.3,0, 0,1],
  determined: [.72,0, 0, 0, 1,   1, 0, 0,  .1, 0, 0,0],
  wink:      [1, 0, 0, .3, 1,   0, 1, 0,  .9, .1, 0,0],
  worried:   [1.05,0,-.05,0,1,  0, 0, .85,-.5, .1, 0,0],
  frustrated: [.62,0, 0, 0, 1,   .8,0, 0, -.6, 0, 0,0],
  relieved:  [.72,0, 0, .7, 1,  0, 0, 0,  .6, 0, 0,0],
  sad:       [.72,0,-.3, 0, 1,  0, 0, 1, -.8, 0, 0,0],
  proud:     [.85,0, .1,.8,1.05,0, 0, 0,  1, .1, 0,0],
  sleepy:    [.12,0,-.3, 0, 1,  0, 0, .2, 0, 0, 0,0],
  off:       [.05,0, 0, 0, 1,   0, 0, 0,  0, 0, 0,0],

  playful:    [1,.3,.12,.55,1.06, 0, .0, 0,  1, .35, 0,0],
  analyze:    [1, 0, 0, 0, 1.12,  0, 0, 0,  .1, 0, 1,0],
};
const EXPR_KEYS=['open','lookX','lookY','happy','size','brow','wink','sad','smile','mouthOpen','ring','qmark'];

// ---------------- ARCHIVE actor (behavior library) ----------------
const REST_ARM=[.25,.35,.5];
class ArchiveActor {
  constructor(){
    const T=this.tr={
      pos:new Track([0,1.5,0],true), yaw:new Track(0), pitch:new Track(0), roll:new Track(0),
      headYaw:new Track(0), headPitch:new Track(0), headTilt:new Track(0),
      armL:new Track(REST_ARM.slice()), armR:new Track(REST_ARM.slice()),
      waveL:new Track(0), waveR:new Track(0), eyePow:new Track([1,1]),
      power:new Track(1), thrust:new Track(.6), bob:new Track(1), blink:new Track(1), jitter:new Track(0), emblem:new Track(.15),
    };
    EXPR_KEYS.forEach((k,i)=>T[k]=new Track(EXPR.neutral[i]));
    this.events=[];
  }
  place(t,pos,yaw){ this.tr.pos.cut(t,pos); if(yaw!==undefined) this.tr.yaw.cut(t,yaw); return this; }
  flyTo(t,dur,pos,e='inOut'){ this.tr.pos.to(t,dur,pos,e); this.events.push({t,type:'fly',dur}); return this; }
  path(t,pts,dur,e='inOut'){ const n=pts.length; pts.forEach((p,i)=>{ if(i===0) this.tr.pos.key(t,this.tr.pos.at(t),'lin'); this.tr.pos.key(t+dur*(i+1)/n,p,i===n-1?'out':'lin'); }); return this; }
  turnTo(t,dur,yaw,e='inOut'){ this.tr.yaw.to(t,dur,yaw,e); return this; }
  faceToward(t,dur,target){ const p=this.tr.pos.at(t+dur); const d=V.sub(target,p); return this.turnTo(t,dur,Math.atan2(d[0],d[2])); }
  lookAt(t,dur,target){
    const p=this.tr.pos.at(t+dur), yaw=this.tr.yaw.at(t+dur);
    const d=V.sub(target,V.add(p,[0,.4,0]));
    let hy=Math.atan2(d[0],d[2])-yaw; hy=Math.atan2(Math.sin(hy),Math.cos(hy));
    const hp=Math.atan2(d[1],Math.hypot(d[0],d[2]));
    this.tr.headYaw.to(t,dur,clamp(hy,-1.1,1.1)); this.tr.headPitch.to(t,dur,clamp(hp,-.6,.7)); return this;
  }
  head(t,dur,yaw,pitch,tilt=0,e='smooth'){ this.tr.headYaw.to(t,dur,yaw,e); this.tr.headPitch.to(t,dur,pitch,e); this.tr.headTilt.to(t,dur,tilt,e); return this; }
  express(t,name,blend=.35){ const v=EXPR[name]; EXPR_KEYS.forEach((k,i)=>this.tr[k].to(t,blend,v[i])); this.events.push({t,type:'expr',name}); return this; }
  look(t,dur,x,y){ this.tr.lookX.to(t,dur,x); this.tr.lookY.to(t,dur,y); return this; }
  arms(t,dur,L,R,e='smooth'){ if(L) this.tr.armL.to(t,dur,L,e); if(R) this.tr.armR.to(t,dur,R,e); return this; }
  rest(t,dur=.5){ return this.arms(t,dur,REST_ARM,REST_ARM); }
  wave(t,dur,side='R'){ const a=side==='R'?'armR':'armL', w=side==='R'?'waveR':'waveL';
    this.tr[a].to(t,.35,[2.55,.55,.9]); this.tr[w].to(t,.3,1); this.tr[w].to(t+dur-.3,.3,0); this.tr[a].to(t+dur,.45,REST_ARM); return this; }
  point(t,dur,side='R'){ const a=side==='R'?'armR':'armL'; this.tr[a].to(t,.4,[1.45,.15,.05]); this.tr[a].to(t+dur,.5,REST_ARM); return this; }
  reach(t,dur,both=false){ this.tr.armR.to(t,dur,[1.35,.05,.15]); if(both) this.tr.armL.to(t,dur,[1.35,.05,.15]); return this; }
  armsUp(t,dur){ return this.arms(t,dur,[2.7,.9,.3],[2.7,.9,.3],'out'); }
  power(t,dur,v){ this.tr.power.to(t,dur,v); return this; }
  thrust(t,dur,v){ this.tr.thrust.to(t,dur,v); return this; }
  spin(t,dur,turns=1){ const y=this.tr.yaw.at(t); this.tr.yaw.to(t,dur,y+turns*Math.PI*2,'inOut'); return this; }
  scan(t,dur){ const y0=this.tr.headYaw.at(t); this.tr.headYaw.to(t,dur*.3,y0-.8); this.tr.headYaw.to(t+dur*.3,dur*.45,y0+.8); this.tr.headYaw.to(t+dur*.75,dur*.25,y0); this.tr.emblem.to(t,.3,1).to(t+dur-.3,.4,.15); this.events.push({t,type:'scan',dur}); return this; }
  activate(t,dur,v=1){ this.tr.emblem.to(t,.4,v); this.tr.emblem.to(t+dur,.8,.15); return this; }
  // evaluated state (pure function of t)
  state(t){
    const T=this.tr, s={};
    for(const k in T) s[k]=T[k].at(t);
    const bob=s.bob;
    s.pos=[s.pos[0]+Math.sin(t*.73)*.012*bob, s.pos[1]+(Math.sin(t*2.05)*.035+Math.sin(t*1.31+1)*.018)*bob, s.pos[2]+Math.cos(t*.61)*.012*bob];
    const j=s.jitter; if(j>0){ s.pos[0]+=vnoise1(t*25,1)*.04*j; s.pos[1]+=vnoise1(t*27,2)*.03*j; }
    const pa=T.pos.at(t-.08), pb=T.pos.at(t+.08), vel=V.mul(V.sub(pb,pa),1/.16);
    const yv=(T.yaw.at(t+.06)-T.yaw.at(t-.06))/.12;
    const fw=[Math.sin(s.yaw),0,Math.cos(s.yaw)], rt=[Math.cos(s.yaw),0,-Math.sin(s.yaw)];
    s.pitch+=clamp(V.dot(vel,fw)*.09,-.35,.35); s.roll+=clamp(-V.dot(vel,rt)*.1-yv*.05,-.45,.45);
    // blink (deterministic)
    const bi=Math.floor(t/3.3), bt=bi*3.3+.4+hash(bi*13+5)*2.4, bd=Math.abs(t-bt);
    let blink=bd<.09?(1-Math.cos(bd/.09*Math.PI))*.5:1;
    if(hash(bi*29+1)>.72){ const bt2=bt+.24, bd2=Math.abs(t-bt2); if(bd2<.09) blink=Math.min(blink,(1-Math.cos(bd2/.09*Math.PI))*.5); }
    s.open*=lerp(1,blink,s.blink);
    if(s.waveR>0){ s.armR=s.armR.slice(); s.armR[2]+=Math.sin(t*11)*.5*s.waveR; s.armR[1]+=Math.sin(t*11+.5)*.15*s.waveR; }
    if(s.waveL>0){ s.armL=s.armL.slice(); s.armL[2]+=Math.sin(t*11)*.5*s.waveL; s.armL[1]+=Math.sin(t*11+.5)*.15*s.waveL; }
    s.thrustOut=s.thrust*(.82+.18*vnoise1(t*31,3))*s.power;
    return s;
  }
}
function armChain(side,a){ // side +1 = robot's +X
  const S=[side*.36,-.2,.03];
  const dirU=M.ap(M.rx(-a[0]),M.ap(M.rz(side*a[1]),[0,-1,0]));
  const dirF=M.ap(M.rx(-(a[0]+a[2])),M.ap(M.rz(side*a[1]),[0,-1,0]));
  const E=V.add(S,V.mul(dirU,.2)); const H=V.add(E,V.mul(dirF,.19)); return [S,E,H];
}

// ---------------- camera director ----------------
class CameraDirector {
  constructor(){ this.tr={ pos:new Track([0,2,6],true), tgt:new Track([0,1.5,0],true), fov:new Track(45), roll:new Track(0),
    proj:new Track(0), planet:new Track(2.4), shake:new Track(0) }; }
  shot(t,pos,tgt,fov){ this.tr.pos.cut(t,pos); this.tr.tgt.cut(t,tgt); if(fov) this.tr.fov.cut(t,fov); return this; }
  move(t,dur,pos,tgt,fov,e='inOut'){ this.tr.pos.to(t,dur,pos,e); if(tgt) this.tr.tgt.to(t,dur,tgt,e); if(fov) this.tr.fov.to(t,dur,fov,e); return this; }
  via(t,pos,tgt,e='lin'){ this.tr.pos.key(t,pos,e); if(tgt) this.tr.tgt.key(t,tgt,e); return this; }
  state(t){ const s={}; for(const k in this.tr) s[k]=this.tr[k].at(t);
    if(s.shake>0){ s.pos=V.add(s.pos,[vnoise1(t*18,7)*.03*s.shake,vnoise1(t*19,8)*.03*s.shake,0]); }
    s.pos=V.add(s.pos,[Math.sin(t*.37)*.012,Math.sin(t*.29)*.01,0]); // handheld breathing
    return s; }
}

// ---------------- world state (orb, holograms, hall) ----------------
class World { constructor(){ this.tr={ hall:new Track(0), window:new Track(.15), exposure:new Track(1), fade:new Track(1),
  holo:new Track([0,0,0]), glitch:new Track(0), mirror:new Track(0),
  orb:new Track([0,.75,0,0]), orbSpin:new Track(0), orbGlow:new Track(0), orbPulse:new Track(0),
  portal:new Track([0,1.6,-3,1.2]), portalOpen:new Track(0),
  loom:new Track([0,0,0,0]), loomB:new Track([0,0,3,0]), loomRot:new Track(0), loomC:new Track([0,3.4,0,.4]),
  shelf:new Track([-1,0,0]), portalFX:new Track([0,0,0,0]), tunnel:new Track([0,0,0,0]),
  world:new Track(0), city:new Track([1,0,0,0]), jets:new Track([0,0,0,0]),
  tockPos:new Track([0,-50,0],true), tockYaw:new Track(0), tockEye:new Track([1,0,0,0]), tockVis:new Track(0) }; this.events=[]; this.exts=[]; }
  state(t){ const s={}; for(const k in this.tr) s[k]=this.tr[k].at(t); if(this.ext) this.ext(t,s); for(const f of this.exts) f(t,s); return s; } }

// ---------------- scene registry ----------------
const CHAPTERS=[
 ['CH01','The Awakening','ARCHIVE wakes in the Archive and finds a world in a sphere.'],
 ['CH02','The First World','Verdance, a bright civilisation, and the first flicker.'],
 ['CH03','Worlds Within Worlds','The Orrery of nested worlds; a pathway vanishes.'],
 ['CH04','The Broken City','Ferrum loses power district by district.'],
 ['CH05','The Living World','Thalassa\u2019s ecosystem teaches patience.'],
 ['CH06','The Great Network','The Loom: thousands of threads, many fraying.'],
 ['CH07','The Lost Worlds','Fragments, storms, and choices that cost.'],
 ['CH08','The Cosmic Core','The Heartstar and the truth about the Archive.'],
 ['CH09','The Restoration','Every world ARCHIVE met helps carry the load.'],
 ['CH10','A New Beginning','Reconnected worlds and a new portal.'],
];
const SCENES=[
 {id:'CH01_SC01',start:0,end:14,title:'Two points of light',status:'animated'},
 {id:'CH01_SC02',start:14,end:34,title:'Power-up',status:'animated'},
 {id:'CH01_SC03',start:34,end:56,title:'The Archive revealed',status:'animated'},
 {id:'CH01_SC04',start:56,end:78,title:'The mirror panel',status:'animated'},
 {id:'CH01_SC05',start:78,end:102,title:'A world in a sphere',status:'animated'},
 {id:'CH01_SC06',start:102,end:120,title:'Worlds within worlds',status:'animated'},
 {id:'CH01_SC07',start:120,end:240,title:'The orb remembers',status:'animated'},
 {id:'CH01_SC08',start:240,end:360,title:'The door that wasn\u2019t there',status:'animated'},
 {id:'CH01_SC09',start:360,end:540,title:'Into the portal',status:'animated'},
];
for(let c=1;c<10;c++){ const base=c*540; for(let s=0;s<3;s++) SCENES.push({id:`CH${String(c+1).padStart(2,'0')}_SC0${s+1}`,start:base+s*180,end:base+(s+1)*180,title:'Planned',status:'planned'}); }

// ---------------- the film: CH01 opening (0–120 s) ----------------
function buildFilm(){
  const A=new ArchiveActor(), C=new CameraDirector(), W=new World();
  const sfx=[], dialogue=[];
  const S=(t,name,o={})=>sfx.push(Object.assign({t,name},o));
  const D=(t,dur,text,emotion,scene)=>dialogue.push({character:'ARCHIVE',text,start:t,end:t+dur,emotion,scene,audio:null,face:emotion});
  const DOCK=[4,.8,2], DOCK_YAW=Math.atan2(-4,-2)+.35;
  const ORB=[0,1.72,0];
  const P1C=[5.6,1.75,-1.6], P1N=V.norm([-.55,0,1]);
  W.holoDef=[ {c:[1.6,2.6,-3.4],n:V.norm([.15,0,1]),u:[0,1,0],s:[.95,.55]},
              {c:P1C,n:P1N,u:[0,1,0],s:[.8,.5]},
              {c:[-3.2,2.2,1.4],n:V.norm([1,0,-.2]),u:[0,1,0],s:[.9,.55]} ];

  // SC01 — darkness, two points of light
  A.place(0,DOCK,DOCK_YAW); A.tr.power.cut(0,0); A.tr.thrust.cut(0,0); A.tr.bob.cut(0,0); A.tr.blink.cut(0,0);
  A.tr.headPitch.cut(0,-.14); A.tr.headTilt.cut(0,.1); A.tr.eyePow.cut(0,[0,0]);
  EXPR_KEYS.forEach((k,i)=>A.tr[k].cut(0,EXPR.off[i])); A.tr.size.cut(0,.35);
  const fwd=[Math.sin(DOCK_YAW),0,Math.cos(DOCK_YAW)];
  const face=V.add(DOCK,[0,.38,0]);
  const eyeOff=V.mul([Math.cos(DOCK_YAW),0,-Math.sin(DOCK_YAW)],-.17);
  C.shot(0,V.add(face,V.add(V.mul(fwd,1.25),[.05,-.22,0])),V.add(V.add(face,eyeOff),[0,-.02,0]),24);
  C.move(0,8.6,V.add(face,V.add(V.mul(fwd,1.2),[0,-.21,0])),V.add(V.add(face,V.mul(eyeOff,.8)),[0,-.02,0]),24,'lin');
  C.move(8.6,5.4,V.add(face,V.add(V.mul(fwd,1.35),[-.06,-.2,0])),V.add(face,[0,-.03,0]),34,'inOut');
  W.tr.fade.cut(0,1); W.tr.window.cut(0,.04); W.tr.exposure.cut(0,1);
  A.power(3.6,1.2,.35); A.tr.eyePow.to(3.6,1.4,[0,.9],'out'); A.tr.open.to(3.6,1.0,.2); S(3.8,'ping',{f:88});
  A.tr.size.to(6.4,1.6,.8); A.tr.open.to(6.4,1.6,.55); S(6.6,'hum_rise');
  A.tr.eyePow.to(8.8,1.0,[1,1],'out'); S(9.0,'ping',{f:83});
  A.tr.size.to(9.6,1.2,1); A.tr.open.to(9.6,1.2,.8);
  A.tr.blink.to(10.2,.1,1); A.look(10.6,.5,.3,0); A.look(11.4,.5,-.3,0); A.look(12.2,.4,0,0);
  A.express(12.5,'curious',.5); S(12.4,'boot_chime'); D(12.9,.8,'\u2026hello?','curious','CH01_SC01'); S(12.9,'voice',{pattern:'q'});
  W.tr.window.to(10,4,.2);

  // SC02 — power-up and lift-off
  A.power(14,4,1,'out'); S(14.2,'power_up'); S(15.6,'servo');
  A.tr.thrust.key(16,0,'lin').key(16.3,.5,'out').key(16.7,.05).key(17.4,.6,'out').key(17.8,.1).key(18.6,.75,'out').key(19.2,.55);
  S(16.0,'sputter',{d:3});
  A.tr.bob.to(19,3,1);
  A.flyTo(19.4,3.6,V.add(DOCK,[0,.75,0]),'out'); S(19.4,'lift');
  A.head(18.5,1.6,0,0,0); A.express(19,'neutral',.6);
  A.tr.headTilt.key(23.0,.18).key(23.4,-.18).key(23.8,.12).key(24.2,0); S(23,'shake');
  A.armsUp(24.6,.9); A.tr.headPitch.to(24.6,.9,.35); A.express(24.6,'happy',.5); S(25,'voice',{pattern:'yawn'});
  A.rest(26.6,.8); A.tr.headPitch.to(26.6,.8,0);
  W.tr.hall.to(26.5,7,1,'inOut'); S(26.5,'lights_on');
  W.tr.window.to(26,8,1);
  C.move(14,6,V.add(face,V.add(V.mul(fwd,1.8),[.35,-.12,0])),V.add(face,[0,-.05,0]),36,'inOut');
  C.move(20,5,V.add(DOCK,V.add(V.mul(fwd,2.6),[1.,.55,.4])),V.add(DOCK,[0,.95,0]),36,'inOut');
  C.move(25.5,8.5,V.add(DOCK,V.add(V.mul(fwd,3.6),[2.0,.9,1.0])),V.add(DOCK,[-.6,1.3,-.5]),42,'inOut');

  // SC03 — the Archive revealed
  const P_A=[2.9,1.85,.6];
  A.lookAt(34,1.2,[-4,2.6,1]); A.express(34.2,'curious');
  A.lookAt(36.6,1.2,[6,2.4,-4]); A.lookAt(39,1.6,[0,6,-10]); A.express(39.2,'surprised',.4); S(39.3,'voice',{pattern:'whoa'}); D(39.4,.9,'Whoa.','surprised','CH01_SC03');
  A.express(41.2,'excited',.5);
  A.faceToward(41.5,1.2,P_A); A.head(41.5,1,0,.1,0);
  A.flyTo(42.5,4.5,P_A,'inOut'); A.thrust(42.5,1,1); A.thrust(46.5,1,.65); S(42.5,'whoosh',{d:3.5});
  A.spin(47.6,1.6,1); A.armsUp(47.6,.5); A.rest(49.2,.5); A.express(47.6,'happy',.3); S(47.7,'voice',{pattern:'giggle'}); S(47.6,'spin');
  A.faceToward(50,1.6,[0,3,-12]); A.lookAt(50,1.6,[0,4.5,-12]); A.express(50.4,'curious',.6);
  C.shot(34,[7.2,1.2,5.6],[2.6,1.7,.8],38);
  C.move(34,12,[6.8,5.8,6.4],[0,3.2,-7.5],52,'inOut');
  C.move(46,10,[5.6,3.0,5.0],[1.6,2.4,-3],46,'inOut');
  W.tr.holo.to(49,1.5,[.15,.25,.1]); W.tr.holo.to(51,4,[.9,.7,.85]); S(49.2,'holo_on');

  // SC04 — the mirror panel
  const inFront=V.add(P1C,V.add(V.mul(P1N,.95),[0,-.1,0]));
  A.lookAt(56,.6,P1C); A.express(56.3,'curious'); S(56.2,'voice',{pattern:'q'});
  A.faceToward(57.2,1,P1C); A.flyTo(57.4,3.4,inFront,'inOut'); A.thrust(57.4,1,.85); A.thrust(60.5,.8,.6);
  A.head(60.8,.8,0,.08,.25); A.express(60.9,'thinking',.5); A.look(61.6,.6,.25,.1); A.look(62.4,.6,-.25,.1);
  W.tr.holo.to(58,1,[.9,1,.85]);
  A.reach(63.2,.6); A.express(63.2,'curious',.3); A.tr.headTilt.to(63.2,.5,0); S(63.75,'poke');
  W.tr.glitch.key(63.8,0,'lin').key(63.9,1,'out').key(64.5,.25).key(64.7,.8).key(65.1,0);
  W.tr.mirror.key(64.4,0,'lin').key(64.6,1,'out');
  S(63.85,'glitch',{d:1.2});
  A.express(64.35,'surprised',.12); A.flyTo(64.35,.8,V.add(inFront,V.add(V.mul(P1N,1.3),[0,.25,0])),'outExpo');
  A.tr.jitter.key(64.35,0,'lin').key(64.45,1).key(65.3,0); A.arms(64.35,.2,[1.9,.9,.2],[1.9,.9,.2],'out');
  S(64.4,'voice',{pattern:'eep'}); D(64.4,.6,'Eep!','surprised','CH01_SC04');
  A.rest(65.6,.7); A.express(66,'confused',.5);
  A.flyTo(66.6,1.8,V.add(inFront,V.add(V.mul(P1N,.55),[0,.05,0])),'inOut'); A.head(66.8,1.2,0,0,0);
  W.tr.mirror.key(66.0,1); // the panel now mirrors ARCHIVE's face
  A.tr.headTilt.to(68.4,.6,.35); S(68.5,'servo');
  A.tr.headTilt.to(69.4,.6,-.35); S(69.4,'servo');
  A.tr.headTilt.to(70.2,.4,0); A.express(70.4,'wink',.25); S(70.5,'blip',{f:1400});
  A.express(71.3,'happy',.3); A.tr.bob.key(71.3,1).key(71.6,2.4).key(73,1); S(71.4,'voice',{pattern:'giggle'}); D(71.5,1.6,'Heh. That\u2019s me.','happy','CH01_SC04');
  A.wave(72.6,1.8,'R'); S(72.8,'voice',{pattern:'hi'});
  W.tr.mirror.to(75,1.2,0); W.tr.holo.to(75,2,[.7,.55,.7]);
  A.express(75.4,'proud',.5);
  C.shot(56,[4.6,2.2,3.4],[4.0,1.8,-.4],40);
  C.move(56,5,[3.2,2.0,1.9],[5.0,1.8,-1.0],38,'inOut');
  C.shot(61,V.add(inFront,[-.75,.25,1.15]),V.lerp(inFront,P1C,.6),34);
  C.move(61,3.3,V.add(inFront,[-.55,.2,.95]),V.lerp(inFront,P1C,.65),32,'lin');
  C.shot(64.3,V.add(inFront,[-2.4,.4,1.9]),V.add(inFront,[.1,.15,0]),40);
  C.tr.shake.key(64.3,0,'lin').key(64.4,1).key(65.0,0);
  C.shot(67.2,V.add(V.lerp(inFront,P1C,.5),V.add(V.mul(V.norm(V.cross([0,1,0],P1N)),2.0),[0,.15,0])),V.lerp(inFront,P1C,.5),36);
  C.move(67.2,6,V.add(V.lerp(inFront,P1C,.5),V.add(V.mul(V.norm(V.cross([0,1,0],P1N)),1.75),[0,.1,.15])),V.lerp(inFront,P1C,.5),34,'lin');
  C.shot(73.4,V.add(inFront,[-1.8,.6,2.6]),V.add(inFront,[.2,.1,-.2]),42);
  C.move(73.4,4.6,V.add(inFront,[-2.6,1.1,3.3]),V.add(inFront,[-.5,.2,-.6]),44,'inOut');

  // SC05 — a world in a sphere
  W.tr.orbGlow.to(77.4,2,.6); S(77.4,'deep_tone'); W.tr.orb.cut(78.6,[0,.78,0,.0]);
  A.express(78.3,'surprised',.3); A.lookAt(78.3,.6,[0,1,0]); A.faceToward(78.8,1,[0,1.4,0]);
  W.tr.orb.to(79.2,5.2,[ORB[0],ORB[1],ORB[2],.36],'inOut'); W.tr.orbGlow.to(79.2,5,1.0); S(79.2,'orb_rise',{d:5});
  A.express(80.4,'curious',.6);
  const facing=[0,1.72,1.18];
  A.flyTo(84.4,3.8,facing,'inOut'); A.turnTo(84.6,3.4,Math.PI+.0); A.thrust(84.4,1,.85); A.thrust(87.4,.8,.6); S(84.6,'whoosh',{d:3,soft:1});
  A.lookAt(88.1,.6,ORB); A.head(88.6,1.2,.0,-.25,.3); A.express(88.4,'thinking',.5); D(89.2,1,'What are you?','curious','CH01_SC05'); S(89.2,'voice',{pattern:'q2'});
  A.express(90.3,'excited',.3); A.reach(90.4,.6,true); A.head(90.4,.5,0,-.2,0); S(90.95,'touch');
  W.tr.orbSpin.key(91,0,'lin').key(92,.7,'in').key(93,3,'lin').key(94,9,'lin').key(95,18,'lin').key(95.9,29,'lin').key(97.1,34,'out');
  W.tr.orbGlow.key(92,1.0).key(94,1.6).key(95.9,2.0).key(97.4,1.2);
  A.express(92.1,'happy',.3); A.arms(92.1,.4,[1.2,.4,.4],[1.6,-.1,.1]); S(92.1,'voice',{pattern:'giggle'});
  A.arms(92.6,.3,[1.25,.05,.15],[1.25,.05,.15]); S(92.6,'spin_up',{d:3.4});
  A.express(93.6,'worried',.3); A.tr.jitter.key(93.5,0,'lin').key(94.5,.5).key(95.9,1.2).key(97.2,0);
  C.tr.shake.key(93.5,0,'lin').key(95.5,.8).key(97.1,0);
  A.express(95.8,'determined',.15); A.arms(95.7,.25,[1.35,-.12,.25],[1.35,-.12,.25],'out'); A.tr.yaw.key(95.9,Math.PI).key(96.3,Math.PI+.35).key(96.8,Math.PI-.15).key(97.2,Math.PI);
  S(97.1,'thunk'); A.express(97.4,'relieved',.4); S(97.5,'voice',{pattern:'phew'});
  A.head(98.3,.7,.85,0,.15); A.express(98.4,'wink',.3); D(98.5,.9,'\u2026oops.','relieved','CH01_SC05');
  A.head(99.8,.8,0,-.15,0); A.express(99.9,'curious',.4); A.rest(99.4,.8);
  W.tr.orbPulse.key(100.6,0,'lin').key(100.8,1,'out').key(102.4,0); S(100.6,'pulse');
  C.shot(78,[-1.6,2.4,6.2],[1.6,1.6,0],40);
  C.move(78,6.4,[-2.4,2.1,5.2],[0,1.3,0],38,'inOut');
  C.shot(84.4,[2.6,2.3,3.6],[0,1.65,.5],36);
  C.move(84.4,4,[1.6,2.0,3.0],[0,1.7,.6],34,'inOut');
  C.shot(88.4,[.8,2.05,-1.2],[0,1.72,.45],30);
  C.move(88.4,2.5,[.65,1.95,-1.0],[0,1.72,.5],28,'lin');
  C.shot(90.9,[2.4,2.3,2.6],[0,1.68,.55],36);
  C.move(90.9,6.2,[2.0,2.1,2.0],[0,1.7,.55],32,'inOut');
  C.shot(97.2,[-.9,1.9,3.0],[0,1.75,1.0],32);
  C.move(97.2,4.8,[-1.5,2.9,3.6],[0,1.6,.5],38,'inOut');

  // SC06 — worlds within worlds (tiny-planet reveal)
  C.move(102,4.2,[.15,4.6,.35],[0,1.4,0],60,'inOut');
  C.tr.planet.cut(102,1.1); C.tr.proj.key(105.6,0,'lin').key(110,1,'inOut');
  C.tr.planet.key(105.6,1.1,'lin').key(110,2.6,'inOut').key(115.4,2.9,'lin').key(119.5,1.1,'inOut');
  C.tr.roll.key(105.6,0,'lin').key(116,1.05,'inOut');
  C.tr.proj.key(115.4,1,'lin').key(119.5,0,'inOut');
  C.tr.pos.key(115.4,[.15,4.6,.35],'lin'); C.tr.tgt.key(115.4,[0,1.4,0],'lin');
  C.tr.pos.key(119.6,[.9,2.5,2.4],'inOut'); C.tr.tgt.key(119.6,[0,1.7,.4],'inOut');
  C.tr.fov.key(115.4,60,'lin').key(119.6,40,'inOut');
  A.lookAt(102.4,1,[0,4.6,.3]); A.express(102.6,'surprised',.5); A.express(104.5,'excited',.6); A.armsUp(106,.8); A.rest(109.5,1);
  A.express(110,'happy',.6); S(105.8,'planet_morph',{d:4.4}); S(110.1,'title_hit'); S(115.6,'planet_morph',{d:4,rev:1});
  A.lookAt(116,2,ORB); A.express(117,'determined',.8);
  W.tr.portalOpen.key(118,0,'lin').key(120,.12); W.tr.portal.cut(0,[0,1.72,-.9,1.1]);
  const titles=[{t0:110.6,t1:117.2,main:'ARCHIVE',sub:'Worlds Within Worlds',credit:'Future Life Experiences'}];
  for(const build of (G.ARCHIVE_SCENE_BUILDERS||[])) build({A,C,W,S,D,EXPR,V,M,clamp,lerp,sstep,hash,vnoise1,Track,REST_ARM,ORB,FACING:facing,DOCK,P1C,P1N,titles,dialogue,sfx,SCENES});
  // Inserted scenes live one after another in story time (beyond 90:00). Without a hold at each insert's end, a
  // track the insert never keys again would slowly blend toward the NEXT insert's starting state (for example, the
  // world drifting from the Archive to Verdance halfway through the Warden chase). Freeze every track at its last
  // value inside each insert.
  if(!G.ARCHIVE_NO_HOLD) for(const ins of (G.ARCHIVE_INSERTS||[])){
    for(const group of [W.tr,A.tr,C.tr]) for(const name in group){ const tr=group[name]; if(!(tr instanceof Track)) continue;
      const ks=tr.k; let last=null; for(const k of ks){ if(k.t>=ins.from-1e-3 && k.t<ins.to) last=k; }
      if(!last) continue; const nxt=ks.find(k=>k.t>last.t); if(!nxt) continue;
      tr.key(ins.to,clone(last.v),'lin'); } }
  dialogue.sort((a,b)=>a.start-b.start);
  const perScene={}; for(const d of dialogue){ if(!d.id){ const k=d.scene||'FILM'; perScene[k]=(perScene[k]||0)+1; d.id=`${k}-${String(perScene[k]).padStart(2,'0')}`; } }
  const holoText=(G.ARCHIVE_HOLOTEXT||[]).slice();
  return {A,C,W,sfx,dialogue,titles,holoText};
}

const FILM = buildFilm();

// Placeholder state for planned scenes (keeps the 90-minute timeline navigable).

// ======================= THE EDIT: output time ↔ story time =======================
// Scenes are authored in "story time". The edit maps the 90-minute output timeline onto story time so the film
// can be paced without re-keying anything: slow stretches play faster, and new scenes (action inserts, authored
// at story times beyond 90:00 and registered in ARCHIVE_INSERTS) are spliced in. Total output stays 5,400 s.
function buildEdit(){
  const inserts=(G.ARCHIVE_INSERTS||[]).slice().sort((a,b)=>a.at-b.at);
  const protect=(G.ARCHIVE_PROTECT||[]);
  const DT=.5, N=Math.round(FILM_SECONDS/DT);
  // which half-second cells of story time are "slow": ARCHIVE nearly still, nobody speaking, no camera cut nearby
  const cutK=FILM.C.tr.pos.k; const cuts=[]; for(let i=1;i<cutK.length;i++) if(cutK[i].t-cutK[i-1].t<.01) cuts.push(cutK[i].t);
  const talk=new Uint8Array(N); for(const d of FILM.dialogue){ for(let c=Math.max(0,Math.floor((d.start-1)/DT));c<Math.min(N,Math.ceil((d.end+1.2)/DT));c++) talk[c]=1; }
  const prot=new Uint8Array(N); for(const [a,b] of protect) for(let c=Math.max(0,Math.floor(a/DT));c<Math.min(N,Math.ceil(b/DT));c++) prot[c]=1;
  for(const ins of inserts){ const c=Math.round(ins.at/DT); for(let k=c-4;k<c+4;k++) if(k>=0&&k<N) prot[k]=1; }
  const slow=new Uint8Array(N);
  for(let c=0;c<N;c++){ const t=c*DT; const p0=FILM.A.tr.pos.at(t), p1=FILM.A.tr.pos.at(t+DT);
    const v=Math.hypot(p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2])/DT; slow[c]=(v<1.2 && !talk[c] && !prot[c])?1:0; }
  // a run of slow cells keeps its first 3 s and last 2 s at normal speed; the middle is eligible for speed-up
  // explicit speed-ups for empty chapter outros (G.ARCHIVE_SPEED = [[storyFrom, storyTo, speed], ...])
  const fixedSp=new Float32Array(N); for(const [a0,b0,sp] of (G.ARCHIVE_SPEED||[])) for(let k=Math.max(0,Math.floor(a0/DT));k<Math.min(N,Math.ceil(b0/DT));k++) fixedSp[k]=sp;
  const elig=new Uint8Array(N); let c=0;
  while(c<N){ if(!slow[c]){c++;continue;} let e=c; while(e<N&&slow[e]) e++; const L=(e-c)*DT;
    if(L>8){ for(let k=c+6;k<e-4;k++) elig[k]=1; } c=e; }
  for(let k=0;k<N;k++) if(fixedSp[k]) elig[k]=0;
  const fixedSaved=fixedSp.reduce((s,x)=>s+(x?DT-DT/x:0),0);
  const insLen=inserts.reduce((s,i)=>s+(i.to-i.from),0)-fixedSaved;
  const elDur=elig.reduce((s,x)=>s+x,0)*DT;
  // choose one speed for all eligible cells so that the film stays exactly 5,400 s
  let speed=1; const need=insLen; if(need>0&&elDur>0){ speed=elDur/Math.max(elDur-need,elDur*.35); }
  speed=Math.min(speed,2.6);
  // segments in output order
  const segs=[]; let o=0;
  const pushSeg=(s0,s1,sp,kind)=>{ if(s1-s0<1e-6) return; const last=segs[segs.length-1];
    if(last&&last.kind===kind&&Math.abs(last.s1-s0)<1e-6&&last.speed===sp){ last.s1=s1; last.o1=last.o0+(last.s1-last.s0)/sp; o=last.o1; return; }
    segs.push({o0:o,o1:o+(s1-s0)/sp,s0,s1,speed:sp,kind}); o+=(s1-s0)/sp; };
  let ii=0;
  for(let k=0;k<N;k++){ const t=k*DT;
    while(ii<inserts.length && inserts[ii].at<=t+1e-6){ const I=inserts[ii]; pushSeg(I.from,I.to,1,'insert:'+I.id); ii++; }
    pushSeg(t,t+DT,fixedSp[k]||(elig[k]?speed:1),'story'); }
  // exact length: trim or pad the very end (the closing title hold)
  const over=o-FILM_SECONDS; const L=segs[segs.length-1]; L.s1-=over*L.speed; L.o1=FILM_SECONDS;
  return {segs,speed,inserts,elDur,saved:elDur-elDur/speed};
}
let EDIT=null;
function edit(){ if(!EDIT) EDIT=buildEdit(); return EDIT; }
function outToStory(t){ const S=edit().segs; let lo=0,hi=S.length-1; while(lo<hi){ const m=(lo+hi+1)>>1; if(S[m].o0<=t) lo=m; else hi=m-1; }
  const s=S[lo]; return {tt:s.s0+(clamp(t,s.o0,s.o1)-s.o0)*s.speed, seg:s}; }
function storyToOut(ts){ for(const s of edit().segs) if(ts>=s.s0&&ts<s.s1) return {t:s.o0+(ts-s.s0)/s.speed, speed:s.speed}; return null; }

// ======================= COVERAGE: automatic extra camera angles =======================
// Long authored shots of ARCHIVE are intercut with reaction close-ups and side angles every ~4.5 s.
let _cuts=null;
function shotBounds(tt){ if(!_cuts){ const k=FILM.C.tr.pos.k; _cuts=[0]; for(let i=1;i<k.length;i++) if(k[i].t-k[i-1].t<.01) _cuts.push(k[i].t); _cuts.push(1e9); _cuts.sort((a,b)=>a-b); }
  let lo=0,hi=_cuts.length-1; while(lo<hi){ const m=(lo+hi+1)>>1; if(_cuts[m]<=tt) lo=m; else hi=m-1; } return [_cuts[lo],_cuts[lo+1]]; }
function coverage(tt,a,c,w){
  if(G.ARCHIVE_NO_COVERAGE) return c;
  const [s0,s1]=shotBounds(tt); if(s1-s0<9) return c;
  const k=Math.floor((tt-s0)/4.5); if(k%2===0 || s1-tt<2 || tt-s0<3) return c;
  if((c.proj||0)>.01 || w.exposure>1.4 || w.fade<.99 || (w.tunnel&&w.tunnel[0]>.01) || (w.mem||0)>.01) return c;
  const P=a.pos; if(P[1]<-40) return c;
  const dT=Math.hypot(c.tgt[0]-P[0],c.tgt[1]-P[1],c.tgt[2]-P[2]); if(dT>5) return c;
  const head=[P[0],P[1]+.45,P[2]], fy=a.yaw, alt=Math.floor((tt-s0)/9)%2;
  const ang=fy+(alt?.75:-.55)+(hash(Math.floor(s0)*7)-.5)*.3, dist=alt?2.9:2.0, hgt=alt?.55:.2;
  return Object.assign({},c,{ pos:[head[0]+Math.sin(ang)*dist, head[1]+hgt, head[2]+Math.cos(ang)*dist], tgt:alt?[P[0],P[1]+.25,P[2]]:head, fov:alt?40:32, roll:0 });
}

function placeholderState(t){
  return { idle:true };
}

function sceneAt(t){ for(const s of SCENES) if(t>=s.start && t<s.end) return s; return SCENES[SCENES.length-1]; }
function chapterAt(t){ const i=clamp(Math.floor(t/540),0,9); return {index:i,id:CHAPTERS[i][0],title:CHAPTERS[i][1],start:i*540,end:(i+1)*540}; }

// ---------------- evaluate: t -> full frame state ----------------
function evaluate(t){
  const m=outToStory(t); let tt=m.tt, slate=null;
  const scene=sceneAt(Math.min(tt,FILM_SECONDS-.01)), ins=m.seg.kind.startsWith('insert:')?m.seg.kind.slice(7):null;
  if(!ins && scene.status!=='animated'){ tt=60+((tt-scene.start)%40); slate=scene; } // loop an idle beat behind the slate
  const a=FILM.A.state(tt), w=FILM.W.state(tt); let c=FILM.C.state(tt);
  if(slate){ c.proj=0; } else c=coverage(tt,a,c,w);
  return {t, tt, scene, insert:ins, chapter:chapterAt(Math.min(tt,FILM_SECONDS-.01)), a, c, w, slate};
}

// ---------------- emblem phase: integral of activity, so ring speed changes never jump ----------------
let _emb=null;
function emblemPhase(t){
  const dt=.05; if(!_emb){ const n=Math.ceil(FILM_SECONDS/dt)+2; _emb=new Float64Array(n); let acc=0; const E=FILM.A.tr.emblem, Th=FILM.A.tr.thrust;
    for(let i=0;i<n;i++){ _emb[i]=acc; const x=i*dt; acc+=(.18+E.at(x)*.9+Th.at(x)*.25)*dt; } }
  const f=clamp(t/dt,0,_emb.length-2), i=Math.floor(f); return _emb[i]+(_emb[i+1]-_emb[i])*(f-i);
}

// ---------------- Alicia's arm rig (model space, faces +Z, ~1.7 units tall) ----------------
function aliciaRig(raise,hold){ const out=[];
  for(const side of [-1,1]){ const S=[.155*side,.445,0];
    let H=[.2*side,.13,.06]; if(side>0) H=V.lerp(H,[.36,.62,.22],raise); H=V.lerp(H,[.075*side,.33,.21],hold);
    const dv=V.sub(H,S), L=Math.min(V.len(dv),.385), dir=V.norm(dv), a=.2, b=.19;
    const x=(a*a-b*b+L*L)/(2*L), h=Math.sqrt(Math.max(a*a-x*x,0));
    let pole=[side*.4,-.6,-.4]; pole=V.norm(V.sub(pole,V.mul(dir,V.dot(pole,dir))));
    out.push(...S, ...V.add(V.add(S,V.mul(dir,x)),V.mul(pole,h)), ...V.add(S,V.mul(dir,L))); }
  return out; }

// ---------------- uniforms ----------------
function computeUniforms(st, W, H){
  const {a,c,w}=st, U={};
  U.uRes=[W,H]; U.uTime=st.tt;
  const fwd=V.norm(V.sub(c.tgt,c.pos));
  let upRef=Math.abs(fwd[1])>.985?[0,0,-1]:[0,1,0];
  let right=V.norm(V.cross(fwd,upRef)), up=V.cross(right,fwd);
  const roll=st.equirect?0:c.roll, cr=Math.cos(roll), sr=Math.sin(roll);  // 360 frames keep the horizon level
  const r2=V.add(V.mul(right,cr),V.mul(up,sr)), u2=V.sub(V.mul(up,cr),V.mul(right,sr));
  U.uCamPos=c.pos; U.uCamFwd=fwd; U.uCamRight=r2; U.uCamUp=u2; U.uFovT=Math.tan(c.fov*Math.PI/360);
  U.uProjMix=st.equirect?0:clamp(c.proj,0,1); U.uPlanetScale=c.planet; U.uEquirect=st.equirect?1:0; U.uStereo=st.stereo?1:0; U.uIPD=.064;
  const R=M.mul(M.ry(a.yaw),M.mul(M.rx(a.pitch),M.rz(a.roll)));
  const Hh=M.mul(M.ry(a.headYaw),M.mul(M.rx(-a.headPitch),M.rz(a.headTilt)));
  U.uArcPos=a.pos; U.uArcR=M.colMajor(R); U.uHeadR=M.colMajor(Hh);
  const L=armChain(1,a.armL), Rr=armChain(-1,a.armR);
  U.uShL=L[0];U.uElL=L[1];U.uHaL=L[2];U.uShR=Rr[0];U.uElR=Rr[1];U.uHaR=Rr[2];
  U.uEyeA=[a.open,a.lookX,a.lookY,a.happy]; U.uEyeB=[a.size,a.brow,a.wink,a.sad];
  U.uEyePow=a.eyePow; U.uMouth=[a.smile,a.mouthOpen]; U.uEyeC=[a.ring,a.qmark]; U.uEmblem=[a.emblem,emblemPhase(st.tt)]; U.uPower=a.power; U.uThrust=a.thrustOut;
  const pv=[0,.02,0], toW=pl=>V.add(a.pos,M.ap(R,pl)), headToBody=ph=>V.add(M.ap(Hh,V.sub(ph,pv)),pv);
  const ex=.185+a.lookX*.05, ey=.43+a.lookY*.04;
  U.uEyeLW=toW(headToBody([ex,ey,.55])); U.uEyeRW=toW(headToBody([-ex,ey,.55]));
  U.uChestW=toW([0,-.27,.33]); U.uFlameA=toW([0,-.84,0]); U.uFlameB=toW([0,-.84-.26*a.thrustOut,0]); U.uRingW=toW([0,-.79,0]);
  U.uHall=w.hall; U.uWindow=w.window; U.uGlitch=w.glitch; U.uMirror=w.mirror; U.uMirrorRot=-a.headTilt;
  const hd=w.holoDef||FILM.W.holoDef; U.uHC=[].concat(...hd.map(h=>h.c)); U.uHN=[].concat(...hd.map(h=>h.n)); U.uHU=[].concat(...hd.map(h=>h.u)); U.uHS=[].concat(...hd.map(h=>h.s));
  U.uHA=w.holo; U.uOrb=w.orb; U.uOrbSpin=w.orbSpin; U.uOrbGlow=w.orbGlow; U.uOrbPulse=w.orbPulse;
  U.uPortal=w.portal; U.uPortalN=w.portalFX[3]>.5?[0,0,1]:V.norm(V.sub(c.pos,w.portal.slice(0,3))); U.uPortalOpen=w.portalOpen;
  U.uPortalFX=w.portalFX; U.uLoom=w.loom; U.uLoomB=w.loomB; U.uLoomHub=w.loomC.slice(0,3); U.uLoomN=w.loomN||new Array(42).fill(0);
  U.uShelf=w.shelf; U.uTunnel=w.tunnel;
  U.uWorld=w.world; U.uCity=w.cityU||w.city; U.uJets=w.jets; U.uTock=[...w.tockPos,w.tockYaw]; U.uTockE=w.tockEye; U.uTockVis=w.tockVis;
  U.uOW=new Array(24).fill(0); U.uOrr=[0,0,0,0]; U.uAli=[0,-50,0,0]; U.uAliB=[2,0,0,0]; U.uBfly=[0,-50,0,0]; U.uDist=[1,1,1,0]; U.uRail=[0,0,0,0]; U.uLink=[0,0,0,0]; U.uLinkEnd=[0,0,0]; U.uMach=[0,0,0,0]; U.uThal=[1,0,0,0]; U.uReef=[1,0,0,0]; U.uLumen=[0,-50,0,-1]; U.uLumB=[1,0,0,0]; U.uRN=new Array(18).fill(0); U.uNet=[0,0,0,1]; U.uGal=[0,-500,0,1]; U.uGalB=[0,0,0,0]; U.uLost=[0,0,0,0]; U.uLostB=[0,0,0,0]; U.uThr=[0,0,0,0]; U.uThrA=[0,-50,0]; U.uThrB=[0,-50,0]; U.uBolt0=[0,-50,0]; U.uBolt1=[0,-50,0]; U.uCore=[1,0,0,0]; U.uMem=0; U.uWar=[0,-60,0,0, 0,-60,0,0, 0,-60,0,0]; U.uWarB=[0,0,1,0, 0,0,1,0, 0,0,1,0]; U.uKey=[0,-60,0,0, 0,-60,0,0, 0,-60,0,0, 0,-60,0,0]; U.uKeyB=[0,0,0,0]; U.uLev=[0,-200,0,0]; U.uLevB=[0,0,0,1]; U.uMega=[0,-300,0,0]; U.uMegaB=[0,1,0,0]; U.uHelp=[0,0,0,0];
  if(w.U) Object.assign(U,w.U); // world-module uniforms supplied by scene files
  { // Alicia: face the camera unless a scene sets her yaw (uAliC.w=1); solve her arms
    const B=U.uAliB, Cc=U.uAliC||[0,0,0,0]; let yaw=Cc[0];
    if(!(Cc[3]>.5)){ const d=V.sub(c.pos,U.uAli.slice(0,3)); yaw=Math.atan2(d[0],d[2]); }
    U.uAliC=[yaw,Cc[1],Cc[2],1]; U.uAliJ=aliciaRig(B[1],Cc[1]); }
  U.uExposure=w.exposure; U.uFade=w.fade*(st.slate?.55:1);
  return U;
}

// ---------------- WebGL renderer ----------------
class Renderer {
  // One small shader program per world, compiled on first use. A single program holding all nine worlds is too
  // large for some graphics drivers (notably Windows/Direct3D), which fail to link it. Each world's program
  // fixes wid() to a constant, so the compiler drops every other world's code.
  constructor(canvas, shaderSrc){
    const gl=canvas.getContext('webgl2',{preserveDrawingBuffer:true,antialias:false,alpha:false,powerPreference:'high-performance'});
    if(!gl) throw new Error('WebGL2 is not available in this browser.');
    this.gl=gl; this.canvas=canvas; this.quality=1; this.src=shaderSrc; this.progs={};
    const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    this.prog(0);                       // compile the opening world now so errors surface immediately
  }
  prog(w){
    if(this.progs[w]) return this.progs[w];
    const gl=this.gl;
    const vs=`#version 300 es
in vec2 p; void main(){ gl_Position=vec4(p,0.,1.); }`;
    let fs=this.src.replace(/int wid\(\)\{[^}]*\}/, `int wid(){ return ${w}; }`);
    const why=(log)=>log||(gl.isContextLost()?'the graphics driver reset (context lost)':'no details from the driver');
    const mk=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(`Shader compile failed (world ${w}): `+why(gl.getShaderInfoLog(s)));return s;};
    const pr=gl.createProgram(); gl.attachShader(pr,mk(gl.VERTEX_SHADER,vs)); gl.attachShader(pr,mk(gl.FRAGMENT_SHADER,fs));
    gl.bindAttribLocation(pr,0,'p'); gl.linkProgram(pr); if(!gl.getProgramParameter(pr,gl.LINK_STATUS)) throw new Error(`Shader link failed (world ${w}): `+why(gl.getProgramInfoLog(pr)));
    const loc={}; const n=gl.getProgramParameter(pr,gl.ACTIVE_UNIFORMS);
    for(let i=0;i<n;i++){ const info=gl.getActiveUniform(pr,i); const name=info.name.replace('[0]',''); loc[name]={l:gl.getUniformLocation(pr,info.name),type:info.type}; }
    return this.progs[w]={pr,loc};
  }
  set(name,v){ const u=this.loc[name]; if(!u) return; const gl=this.gl, l=u.l;
    switch(u.type){ case gl.FLOAT: gl.uniform1f(l,v); break; case gl.FLOAT_VEC2: gl.uniform2fv(l,v); break;
      case gl.FLOAT_VEC3: gl.uniform3fv(l,v); break; case gl.FLOAT_VEC4: gl.uniform4fv(l,v); break;
      case gl.FLOAT_MAT3: gl.uniformMatrix3fv(l,false,v); break; case gl.INT: gl.uniform1i(l,v); break; } }
  render(st){
    const gl=this.gl, W=this.canvas.width, H=this.canvas.height; gl.viewport(0,0,W,H);
    const U=computeUniforms(st,W,H); const w=Math.max(0,Math.min(8,Math.round(U.uWorld||0)));
    const P=this.prog(w); gl.useProgram(P.pr); this.loc=P.loc;
    for(const k in U) this.set(k,U[k]); this.set('uQuality',this.quality);
    // Draw in horizontal strips: Windows resets the graphics driver if one GPU job runs longer than ~2 s, which
    // a heavy full-frame shot at film quality can do. Short strips keep every job well under that.
    const n=Math.max(1,this.tiles|0);
    if(n===1) gl.drawArrays(gl.TRIANGLES,0,3);
    else { gl.enable(gl.SCISSOR_TEST); for(let i=0;i<n;i++){ const y0=Math.floor(H*i/n), y1=Math.floor(H*(i+1)/n); gl.scissor(0,y0,W,y1-y0); gl.drawArrays(gl.TRIANGLES,0,3); gl.flush(); } gl.disable(gl.SCISSOR_TEST); }
  }
}

// ---------------- 2D overlay: titles, slates, captions ----------------
function drawOverlay(ctx, st, W, H, opts={}){
  if(st.stereo && !opts._eye){ // VR 3D: draw the 360 overlay once, then copy it into each eye's half (top = left eye)
    const oc=drawOverlay._eyeCanvas||(drawOverlay._eyeCanvas=document.createElement('canvas')); oc.width=W; oc.height=Math.round(H/2);
    const ox=oc.getContext('2d'); ox.clearRect(0,0,oc.width,oc.height);
    drawOverlay(ox,Object.assign({},st,{stereo:false}),W,oc.height,Object.assign({},opts,{_eye:true}));
    ctx.drawImage(oc,0,0); ctx.drawImage(oc,0,oc.height); return; }
  if(st.equirect && !opts._inner){ // 360 frame: titles, captions and readouts in a 16:9 window straight ahead; world labels on the sphere
    ctx.save(); ctx.translate(W/3,H*.3125); drawOverlay(ctx,Object.assign({},st,{equirectInner:true}),W/3,H*.375,Object.assign({},opts,{_inner:true})); ctx.restore();
    drawHoloText(ctx,Object.assign({},st,{equirectOuter:true}),W,H); return; }
  ctx.clearRect(0,0,W,H);
  const s=H/1080, t=st.tt;
  for(const ti of FILM.titles){ if(t<ti.t0-.01||t>ti.t1+.01) continue;
    const k=sstep(ti.t0,ti.t0+1.6,t)*(1-sstep(ti.t1-1.4,ti.t1,t));
    ctx.save(); ctx.globalAlpha=k; ctx.textAlign='center'; ctx.fillStyle='#EAF4FF';
    ctx.shadowColor='rgba(80,170,255,.9)'; ctx.shadowBlur=28*s;
    const sp=lerp(.55,.32,sstep(ti.t0,ti.t1,t));
    ctx.font=`600 ${118*s}px Montserrat, "Segoe UI", "DejaVu Sans", Helvetica, Arial, sans-serif`;
    drawSpaced(ctx,ti.main,W/2,H*.5,sp*118*s);
    ctx.shadowBlur=12*s; ctx.font=`400 ${38*s}px Montserrat, "Segoe UI", "DejaVu Sans", Helvetica, Arial, sans-serif`;
    ctx.globalAlpha=k*sstep(ti.t0+1.2,ti.t0+2.4,t); drawSpaced(ctx,ti.sub,W/2,H*.5+70*s,.18*38*s);
    ctx.globalAlpha=k*sstep(ti.t0+2.2,ti.t0+3.4,t)*.75; ctx.font=`500 ${22*s}px Montserrat, "Segoe UI", "DejaVu Sans", Helvetica, Arial, sans-serif`;
    drawSpaced(ctx,ti.credit,W/2,H*.5+120*s,.3*22*s); ctx.restore(); }
  if(st.slate){ const sc=st.slate; ctx.save(); ctx.fillStyle='rgba(5,10,28,.55)'; ctx.fillRect(0,H*.38,W,H*.24);
    ctx.textAlign='center'; ctx.fillStyle='#F2C46B'; ctx.font=`600 ${30*s}px "DejaVu Sans", Helvetica, Arial, sans-serif`;
    ctx.fillText(`${sc.id}  ${st.chapter.title}`,W/2,H*.47);
    ctx.fillStyle='#CFE0FF'; ctx.font=`400 ${24*s}px "DejaVu Sans", Helvetica, Arial, sans-serif`;
    ctx.fillText('Planned scene \u2014 not yet animated. Story beat: '+CHAPTERS[st.chapter.index][2],W/2,H*.53); ctx.restore(); }
  drawHoloText(ctx,st,W,H);
  if(opts.captions){ for(const d of FILM.dialogue){ if(t>=d.start&&t<=d.end+.6){ ctx.save(); ctx.textAlign='center'; ctx.font=`500 ${34*s}px "DejaVu Sans", Helvetica, Arial, sans-serif`;
    ctx.fillStyle='rgba(0,0,0,.55)'; const w=ctx.measureText(d.text).width+40*s; ctx.fillRect(W/2-w/2,H*.86-40*s,w,56*s); ctx.fillStyle='#fff'; ctx.fillText(d.text,W/2,H*.86); ctx.restore(); } } }
}
// readable hologram text: world-anchored labels and screen HUD readouts, drawn crisp over the frame
function drawHoloText(ctx,st,W,H){
  const tt=st.tt, c=st.c, w=st.w; if(!FILM.holoText||!FILM.holoText.length) return;
  const f=V.norm(V.sub(c.tgt,c.pos)); let r=V.norm(V.cross(f,[0,1,0])), u=V.cross(r,f);
  const cr=Math.cos(c.roll||0), sr=Math.sin(c.roll||0); const r2=V.add(V.mul(r,cr),V.mul(u,sr)), u2=V.sub(V.mul(u,cr),V.mul(r,sr));
  const ft=Math.tan(c.fov*Math.PI/360), s=H/1080;
  for(const h of FILM.holoText){ if(tt<h.t0||tt>h.t1) continue; if(h.world!=null && Math.round(w.world)!==h.world) continue;
    const k=sstep(h.t0,h.t0+.6,tt)*(1-sstep(h.t1-.6,h.t1,tt)); if(k<=0) continue;
    let x,y,px;
    if(h.pos && st.equirectInner) continue;              // world labels are placed on the full 360 frame instead
    if(!h.pos && st.equirectOuter) continue;              // screen readouts go in the front window
    if(h.pos && st.equirectOuter){ const d=V.sub(h.pos,c.pos), lx=V.dot(d,r2), ly=V.dot(d,u2), lz=V.dot(d,f), dist=Math.hypot(lx,ly,lz);
      x=W*(.5+Math.atan2(lx,lz)/(2*Math.PI)); y=H*(.5-Math.atan2(ly,Math.hypot(lx,lz))/Math.PI); px=Math.max((h.size||.12)/dist/Math.PI*H,13*s); px=Math.min(px,64*s); }
    else if(h.pos){ const d=V.sub(h.pos,c.pos), z=V.dot(d,f); if(z<.3) continue; x=W/2+V.dot(d,r2)/(z*ft)*H/2; y=H/2-V.dot(d,u2)/(z*ft)*H/2;
      { // hide a floating label while ARCHIVE is in front of it (the labels are drawn over the picture, so without this
        // they would show through the robot)
        const a=st.a&&st.a.pos; if(a){ const da=V.sub(a,c.pos), za=V.dot(da,f);
          if(za>.2 && za<z){ const ax=W/2+V.dot(da,r2)/(za*ft)*H/2, ay=H/2-V.dot(da,u2)/(za*ft)*H/2, ar=1.1/(za*ft)*H/2;
            if(Math.hypot(x-ax,y-ay)<ar) continue; } } }
      px=Math.max((h.size||.12)/(z*ft)*H/2,13*s); if(x<-W*.2||x>W*1.2||y<-H*.2||y>H*1.2) continue; px=Math.min(px,64*s); }
    else { x=(h.x??.06)*W; y=(h.y??.1)*H; px=(h.px||24)*s; }
    const flick=.88+.12*Math.sin(tt*31+(h.t0||0)); ctx.save(); ctx.globalAlpha=k*flick;
    ctx.textAlign=h.pos?'center':'left'; ctx.textBaseline='middle';
    const col=h.color||'#9FE6FF', lines=h.lines; ctx.font=`600 ${px}px "DejaVu Sans Mono", Menlo, Consolas, monospace`;
    if(h.panel!==false){ const wid=Math.max(...lines.map(l=>ctx.measureText(l).width))+px*1.2, hei=lines.length*px*1.35+px*.6;
      const x0=h.pos?x-wid/2:x-px*.6, y0=y-px*.95; ctx.fillStyle='rgba(20,80,130,.22)'; ctx.fillRect(x0,y0,wid,hei);
      ctx.strokeStyle='rgba(140,220,255,.55)'; ctx.lineWidth=Math.max(1,px*.06); ctx.strokeRect(x0,y0,wid,hei); }
    ctx.shadowColor='rgba(80,200,255,.9)'; ctx.shadowBlur=px*.5;
    lines.forEach((l,i)=>{ ctx.fillStyle=(h.alert&&i===h.alert)?'#FF8A7A':col; ctx.fillText(l,x,y+i*px*1.35); });
    ctx.restore(); }
}
function drawSpaced(ctx,txt,x,y,sp){ const chars=[...txt]; const widths=chars.map(c=>ctx.measureText(c).width); const total=widths.reduce((a,b)=>a+b,0)+sp*(chars.length-1);
  let cx=x-total/2; const al=ctx.textAlign; ctx.textAlign='left'; chars.forEach((c,i)=>{ctx.fillText(c,cx,y);cx+=widths[i]+sp;}); ctx.textAlign=al; }

// ---------------- manifest ----------------
function manifest(){ return { title:'ARCHIVE: Worlds Within Worlds', org:'Future Life Experiences', fps:FPS, seconds:FILM_SECONDS, frames:FILM_SECONDS*FPS,
  resolution:[1920,1080], chapters:CHAPTERS.map((c,i)=>({id:c[0],title:c[1],start:i*540,end:(i+1)*540,beat:c[2]})),
  scenes:SCENES, dialogue:FILM.dialogue, sfxCues:FILM.sfx.length, engineVersion:'0.5.0', edit:(()=>{ const E=edit(); return {speedUp:+E.speed.toFixed(3), secondsTightened:+E.saved.toFixed(1), inserts:E.inserts.map(i=>({id:i.id,at:i.at,length:i.to-i.from})), segments:E.segs.length}; })(), characterDesign:'ARCHIVE 1.0' }; }

G.ARCHIVE = Object.assign(G.ARCHIVE||{}, { edit, outToStory, storyToOut, FPS, FILM_SECONDS, EXPR, EXPR_KEYS, CHAPTERS, SCENES, FILM, evaluate, computeUniforms, Renderer, drawOverlay, sceneAt, chapterAt, manifest, util:{V,M,clamp,lerp,sstep,hash,vnoise1,Track} });
})(typeof window!=='undefined'?window:globalThis);
