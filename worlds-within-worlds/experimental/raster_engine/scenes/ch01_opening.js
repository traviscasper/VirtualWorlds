// CHAPTER 1 — THE AWAKENING · opening sequence (film time 0:00–2:00)
// Scene data only. The engine (core.js + shader.js) is shared by every chapter.
EXPRESSIONS.dot    =[.08,0,.6,0, 0,0,1,0, .2,0,.01];
EXPRESSIONS.oneEye =[1,0,1,0,  .1,0,1,0, .3,0,.6];

const wrapPi=a=>Math.atan2(Math.sin(a),Math.cos(a));
const angLerp=(a,b,t)=>a+wrapPi(b-a)*t;
// piecewise motion: hold between segments, Catmull-Rom spline within
function motion(segs,start){
  return t=>{ let last=start;
    for(const s of segs){ if(t<s.t[0]) return last;
      if(t<=s.t[1]){ const u=EASE[s.ease||'io']((t-s.t[0])/(s.t[1]-s.t[0])); return spline(s.pts)(u); }
      last=s.pts[s.pts.length-1]; }
    return last; };
}
const ORB=[3.4,-0.1,-3.6], PORTAL=[0,1.4,-10.9], PANEL0=[-4.4,.75,-4.92];

const ch01Pos=motion([
  {t:[16,16.3],pts:[[0,-.4,0],[0,-.3,0]],ease:'out'},
  {t:[16.3,17],pts:[[0,-.3,0],[0,-.43,0]],ease:'in'},
  {t:[17,18],pts:[[0,-.43,0],[0,-.4,0]]},
  {t:[18.2,21.5],pts:[[0,-.4,0],[0,.55,0]],ease:'out'},
  {t:[24.5,32],pts:[[0,.55,0],[1.9,.9,1.3],[0,1.3,2.6],[-2.1,.95,1.2],[-1.6,.7,-1.2],[-3.0,.55,-3.35]]},
  {t:[40,46],pts:[[-3.0,.55,-3.35],[-3.55,.6,-3.95]]},
  {t:[46.6,47.5],pts:[[-3.55,.6,-3.95],[-3.68,.62,-4.1]],ease:'in'},
  {t:[48,49.3],pts:[[-3.68,.62,-4.1],[-2.9,.85,-3.2],[-2.3,.75,-2.6]],ease:'out'},
  {t:[61,66],pts:[[-2.3,.75,-2.6],[-.5,1.35,-1.2],[1.8,.8,-2.0],[2.9,.35,-2.75]]},
  {t:[66,72],pts:[[2.9,.35,-2.75],[3.9,.25,-2.8],[4.25,.2,-3.8],[3.6,.2,-4.55],[2.6,.15,-4.0],[2.6,.1,-3.25]]},
  {t:[110,116],pts:[[2.6,.1,-3.25],[1.9,.35,-4.2],[1.3,.45,-5.0]]},
  {t:[118.6,121],pts:[[1.3,.45,-5.0],[.95,.55,-5.7]],ease:'in'},
],[0,-.4,0]);

const ch01YawKeys=track([[0,0],[24,0],[31,-2.41],[40,-2.41],[59.2,-2.41],[61,-4.54],[72,-4.32],[101,-4.32],[103,-2.81],[116,-2.81],[117,-5.4],[118.3,-5.4],[119.2,-2.81]]);
const autoYawW=track([[0,0],[24.4,0],[25,1],[31.2,1],[32,0],[60.8,0],[61.4,1],[71.2,1],[72,0]]);
function ch01Yaw(t){
  const w=autoYawW(t), base=ch01YawKeys(t); if(w<=0) return base;
  const a=ch01Pos(t-.05), b=ch01Pos(t+.05); const dx=b[0]-a[0], dz=b[2]-a[2];
  if(dx*dx+dz*dz<1e-7) return base;
  return angLerp(base,Math.atan2(dx,dz),w);
}

const CH01={
  id:'CH01_SC01-SC05', chapter:1, start:0, end:120,
  archive:{
    pos:ch01Pos, yaw:ch01Yaw,
    thrust:track([[0,0],[14,0],[14.2,.35],[16,.4],[16.4,1.1],[18,1],[48,1],[48.2,1.6],[49.5,1],[61,1],[61.6,1.45],[65.5,1.4],[66.5,1],[118.6,1],[119.5,1.3]]),
    thrustFlicker:t=>(t>14&&t<16.2)?(hash1(Math.floor(t*14))>.45?1:.15):1,
    power:track([[0,0],[3.4,0],[4.2,.55],[8.5,.6],[9,1]]),
    chest:track([[0,0],[11,0],[11.15,1,'linear'],[11.3,.2,'linear'],[11.5,1,'linear']]),
    headPitch:track([[0,.28],[9.4,.28],[10,0],[50,0],[50.5,-.1],[53.5,0],[88,0],[90,-.25],[98,-.1],[100,0],[104,-.12],[110,0]]),
    headYaw:track([[0,0],[10.4,0],[11,.45],[11.8,.45],[12.4,-.45],[13.2,-.45],[13.8,0],[58,0],[58.5,-.8],[59.6,-.8],[61,0],[84.4,0],[85,.3],[86.3,.35],[86.9,0]]),
    headRoll:track([[0,0],[51.5,0],[52,.28],[53.6,.28],[54,-.12],[57.8,-.12],[58.2,0],[84.6,0],[85.1,.3],[86.3,.3],[86.8,0],[111,0],[111.5,-.2],[113,0]]),
    expr:[[0,'sleep'],[3.6,'dot',.5],[8.6,'oneEye',.25],[9.6,'neutral',.15],[10.4,'curious'],
      [14.2,'surprised',.12],[16.4,'worried'],[18.2,'surprised',.1],[19.6,'happy'],[24.5,'excited'],[31.5,'happy'],
      [33,'curious'],[46,'determined'],[48,'surprised',.08],[49.6,'worried'],[51.4,'curious'],[54,'thinking'],
      [58,'curious',.15],[61,'excited'],[66,'curious'],[72,'happy'],[78,'excited'],[81.2,'surprised',.1],
      [82.2,'worried'],[84.2,'surprised',.08],[85,'confused'],[86.5,'wink',.15],[87.6,'happy'],[89,'curious'],
      [91,'surprised'],[93.5,'excited'],[99,'happy'],[100.5,'curious'],[103,'surprised'],[108,'excited'],
      [111,'curious'],[113.5,'determined'],[116.6,'happy'],[118.4,'determined']],
    handR:[[0,'tuck'],[14,'tuck'],[14.6,'rest'],[18.2,'up','out'],[19.6,'rest'],[24.5,'cheer'],[27,'rest'],
      [44,'rest'],[45.5,'reach'],[46.6,'reach'],[47.4,'point','in'],[48,'up','out'],[50.2,'brace'],[51.6,'rest'],
      [76,'rest'],[77.4,'reach'],[78,'point','in'],[78.5,'reach'],[80.6,'reach'],[81,[.5,.1,.2],'in'],[82.2,'brace','out'],
      [83,'hold'],[84.6,'hold'],[85.2,'shrug'],[86.6,'rest'],[102.6,'rest'],[103.2,'brace','out'],[105.5,'rest'],
      [116.4,'rest'],[116.8,'wave'],[117.9,'wave'],[118.4,'rest']],
    handL:[[0,'tuck'],[14,'tuck'],[14.6,'rest'],[18.2,'up','out'],[19.6,'rest'],[24.5,'cheer'],[27,'rest'],
      [48,'rest'],[48.2,'up','out'],[50.2,'brace'],[51.6,'rest'],[54,'chin'],[57.8,'rest'],
      [82,'rest'],[82.4,'brace','out'],[83,'hold'],[84.6,'hold'],[85.2,'shrug'],[86.6,'rest'],
      [102.8,'rest'],[103.3,'brace','out'],[105.5,'rest']],
    handFxR:t=> (t>116.8&&t<117.9)?[Math.sin((t-116.8)*14)*.07,0,0]:[0,0,0],
  },
  camera:null, env:null, overlay:null,
};

// ---- environment timeline ----
const envT={
  amb:track([[0,0],[12,0],[16,.2],[20,.3],[24,1]]),
  hallLight:track([[0,0],[20,0],[24.5,1,'linear']]),
  holoFlick:track([[0,0],[22,0],[22.3,.8,'linear'],[22.5,.1,'linear'],[23,.9,'linear']]),
  holoGlitch:track([[0,0],[47.5,0],[47.7,1,'linear'],[49.2,.6],[50.2,0]]),
  holoNet:track([[0,0],[50,0],[51.5,1],[58,1],[60,.55]]),
  orbGlow:track([[0,.15],[22,.15],[24,.3],[57.8,.3],[58.2,.95,'out'],[60,.45],[78,.45],[78.2,.8],[79,.5],[88,.5],[93,1.6],[98,1.4],[100,1.1],[104,.7]]),
  orbBeam:track([[0,0],[100,0],[102.5,1,'out'],[110,1],[113,.25]]),
  portalOpen:track([[0,0],[101,0],[103,.06],[103.4,.12,'linear'],[110,1,'out']]),
  spinRate:track([[0,.12],[78,.12],[78.2,.9,'out'],[79.5,.4],[80.8,.4],[81.1,6,'in'],[83.6,26,'in'],[84.2,0,'linear'],[86,0],[87.5,.12]]),
};
// integrate spin rate deterministically
function orbSpinAt(t){let s=0;const dt=1/120;for(let x=0;x<t;x+=dt)s+=envT.spinRate(x)*dt;return s;}
let _spinCache={t:-1,v:0};
CH01.env=t=>{
  let spin; if(t>=_spinCache.t && t-_spinCache.t<2){ // incremental integration for sequential rendering
    let s=_spinCache.v; const dt=1/120; for(let x=_spinCache.t;x<t;x+=dt)s+=envT.spinRate(x)*dt; spin=s; }
  else spin=orbSpinAt(t);
  _spinCache={t,v:spin};
  const wob=t>81&&t<84.4?Math.sin(t*40)*.02*(t-81):0;
  return { amb:envT.amb(t), hallLight:envT.hallLight(t), holoFlick:envT.holoFlick(t), holoGlitch:envT.holoGlitch(t),
    holoNet:envT.holoNet(t), orbPos:[ORB[0]+wob,ORB[1]+Math.sin(t*1.3)*.03,ORB[2]], orbScale:.35, orbSpin:spin,
    orbGlow:envT.orbGlow(t), orbBeam:envT.orbBeam(t), portalPos:PORTAL, portalOpen:envT.portalOpen(t),
    beam:envT.amb(t) };
};

// ---- camera director (shot list) ----
const A_=t=>ch01Pos(t);
const head=t=>{const p=A_(t);return [p[0],p[1]+.55,p[2]]};
const around=(c,yaw,d,h)=>[c[0]+Math.sin(yaw)*d,c[1]+h,c[2]+Math.cos(yaw)*d];
const shake=(t,amt)=>[Math.sin(t*23)*amt,Math.sin(t*31+1)*amt,Math.sin(t*19+2)*amt];
const SHOTS=[
 {id:'CH01_SH01',t:[0,14],  f:(t,u)=>({pos:V.lerp([0,.17,1.3],[0,.12,2.05],EASE.io(clamp((t-4)/10,0,1))),tgt:[0,.15,0],fov:30})},
 {id:'CH01_SH02',t:[14,24], f:(t,u)=>({pos:spline([[0,.12,2.05],[.6,.0,2.8],[1.4,.2,3.6],[3.6,2.2,6.4],[5.6,3.5,7.6]])(EASE.io(u)),
    tgt:V.lerp(head(t),[0,.6,-1],smooth(clamp((t-19)/5,0,1))),fov:mix(32,44,smooth(clamp((t-18)/6,0,1)))})},
 {id:'CH01_SH03',t:[24,32], f:(t,u)=>({pos:spline([[5.6,3.5,7.6],[2,3.1,8.4],[-3.5,2.6,7.2],[-5.6,2.2,4.4]])(EASE.io(u)),tgt:V.lerp(A_(t-.25),[0,.6,0],.25),fov:44})},
 {id:'CH01_SH04',t:[32,40], f:(t,u)=>({pos:spline([[-1.0,1.5,.9],[-1.3,1.15,-.6],[-1.7,1.0,-1.7]])(EASE.io(u)),tgt:V.lerp(head(t),PANEL0,.25),fov:40})},
 {id:'CH01_SH05',t:[40,48], f:(t,u)=>({pos:V.lerp([-1.55,1.25,-2.9],[-2.0,1.05,-3.35],EASE.io(u)),tgt:V.lerp(head(t),PANEL0,.45),fov:40})},
 {id:'CH01_SH06',t:[48,54], f:(t,u)=>{const c=A_(t); return {pos:V.add(around([-2.6,.75,-2.9],-2.41+.85,2.6,.2),shake(t,t<49.5?.03*(49.5-t):0)),tgt:V.lerp(V.lerp(head(t),c,.4),PANEL0,.45),fov:42}}},
 {id:'CH01_SH07',t:[54,58], f:(t,u)=>({pos:around(head(54),-2.41+.4+u*.12,1.35,-.05),tgt:head(t),fov:30})},
 {id:'CH01_SH08',t:[58,61], f:(t,u)=>({pos:around(head(58),-2.41-.55,1.6,.05),tgt:V.lerp(head(t),ORB,smooth(clamp((t-59.5)/1.5,0,1))*.4),fov:34})},
 {id:'CH01_SH09',t:[61,66], f:(t,u)=>{const p=A_(t-.75); return {pos:[p[0]-.2,p[1]+.55,p[2]+.9],tgt:A_(t+.35),fov:46}}},
 {id:'CH01_SH10',t:[66,72], f:(t,u)=>{const a=-.9+u*1.6; return {pos:[ORB[0]+Math.sin(a)*2.9,.85-u*.2,ORB[2]+Math.cos(a)*2.9],tgt:V.lerp(ORB,A_(t),.45),fov:40}}},
 {id:'CH01_SH11',t:[72,88], f:(t,u)=>{ const base=around(ORB,Math.atan2(.8,-.35)+.75,mix(2.1,1.7,EASE.io(clamp((t-72)/6,0,1))),.42);
    const s=(t>81&&t<84.3)?shake(t,.012*(t-81)):[0,0,0];
    return {pos:V.add(base,s),tgt:V.lerp(ORB,head(t),.5),fov:34}}},
 {id:'CH01_SH12',t:[88,100.5], f:(t,u)=>{ const p0=around(ORB,Math.atan2(.8,-.35)+.75,1.7,.42);
    const up=smooth(clamp((t-88)/3,0,1)); const pos=V.lerp(p0,[0,6.5,.35],up);
    const tgt=V.lerp(V.lerp(ORB,head(88),.5),[0,-1.25,-.4],up);
    const proj=smooth(clamp((t-90.5)/3,0,1))*(1-smooth(clamp((t-97.5)/3,0,1)));
    return {pos,tgt,fov:mix(34,60,up),proj,tpCenter:[0,1.6,0],tpZoom:.62,tpSpin:(t-90)*.11}}},
 {id:'CH01_SH13',t:[100.5,110], f:(t,u)=>({pos:spline([[4.6,1.4,-.6],[4.2,1.1,-1.4],[3.8,.95,-1.9]])(EASE.io(u)),tgt:V.lerp(head(t),PORTAL,.55),fov:44})},
 {id:'CH01_SH14',t:[110,120.01], f:(t,u)=>{ const p=A_(t), y=-2.81, fw=[Math.sin(y),0,Math.cos(y)], sd=[Math.cos(y),0,-Math.sin(y)];
    const back=mix(2.2,1.75,EASE.io(u));
    return {pos:[p[0]-fw[0]*back+sd[0]*.55,p[1]+.3,p[2]-fw[2]*back+sd[2]*.55],tgt:V.lerp(head(t),PORTAL,.6),fov:40}}},
];
CH01.shots=SHOTS;
CH01.camera=t=>{ for(const s of SHOTS){ if(t>=s.t[0]&&t<s.t[1]) return {...s.f(t,(t-s.t[0])/(s.t[1]-s.t[0])),shot:s.id}; }
  const s=SHOTS[SHOTS.length-1]; return {...s.f(t,1),shot:s.id}; };

// ---- on-screen titles ----
CH01.overlay=t=>{
  const out=[];
  const fadeIn=(a,b,c,d)=>clamp(Math.min((t-a)/(b-a),(d-t)/(d-c)),0,1);
  const k1=fadeIn(4.2,5.4,7.4,8.4); if(k1>0) out.push({kind:'presents',alpha:k1,lines:['Future Life Experiences','presents']});
  const k2=fadeIn(25,27,30.5,32.5); if(k2>0) out.push({kind:'title',alpha:k2,lines:['ARCHIVE','Worlds Within Worlds'],rise:(t-25)*.004});
  return out;
};

// ---- sound cues (consumed by the score/SFX renderer) ----
CH01.sfx=[
  [3.6,'eyeDot'],[5.2,'pulse'],[6.8,'pulse'],[8.6,'eyeOn'],[9.6,'eyeOn2'],[10.4,'curious'],[11,'chestOn'],
  [14.1,'sputter'],[16.3,'ignite'],[18.2,'yelp'],[19.6,'happy'],[20,'powerUp'],[22.2,'holoOn'],
  [24.6,'whooshSoft'],[27.5,'whooshSoft'],[29.8,'whooshSoft'],[33,'curious'],[45.4,'servo'],[47.4,'boop'],
  [47.6,'glitch'],[48,'yelp'],[48.1,'whooshFast'],[50,'holoStable'],[51.6,'curious'],[54,'thinking'],
  [58,'chime'],[58.4,'curious'],[61,'whooshFast'],[63.6,'whooshSoft'],[66.5,'whooshSoft'],[72.4,'happy'],
  [78,'boop'],[78.1,'spinSmall'],[81,'spinUp'],[81.2,'yelp'],[84.2,'clunk'],[85.2,'confused'],[86.5,'wink'],
  [88.5,'shimmer'],[90.6,'tinyPlanet'],[97.6,'tinyPlanetRev'],[100,'beam'],[103,'portalBoom'],[103.2,'portalSwirl'],
  [110,'portalBoom2'],[111,'curious'],[116.6,'happy'],[118.6,'whooshSoft'],
];
CH01.dialogue=[ // placeholders — no final voice yet
  {id:'CH01_D01',character:'ARCHIVE',text:'…Hello?',start:33.2,end:34.4,emotion:'curious',scene:'CH01_SC02',audio:null,faceCue:'mouthTalk'},
  {id:'CH01_D02',character:'ARCHIVE',text:'Oops.',start:84.6,end:85.3,emotion:'confused',scene:'CH01_SC04',audio:null,faceCue:'mouthTalk'},
  {id:'CH01_D03',character:'ARCHIVE',text:'Where do you go?',start:111.2,end:112.8,emotion:'curious',scene:'CH01_SC05',audio:null,faceCue:'mouthTalk'},
];
CH01.scenes=[
  {id:'CH01_SC01',title:'A light in the dark',t:[0,14]},
  {id:'CH01_SC02',title:'Systems online',t:[14,40]},
  {id:'CH01_SC03',title:'The flickering hologram',t:[40,72]},
  {id:'CH01_SC04',title:'The miniature world',t:[72,100]},
  {id:'CH01_SC05',title:'The portal',t:[100,120]},
];
