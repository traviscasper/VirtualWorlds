// ARCHIVE engine core: math, keyframe tracks, rig, expressions, camera, renderer.
const FPS = 30, FILM_SECONDS = 5400;
const V = {
  add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
  mul:(a,s)=>[a[0]*s,a[1]*s,a[2]*s], dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  len:a=>Math.hypot(a[0],a[1],a[2]), norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l]},
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]], lerp:(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t)
};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const EASE={ linear:t=>t, io:smooth, in:t=>t*t, out:t=>1-(1-t)*(1-t), hold:t=>0,
  back:t=>{const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)}, expo:t=>t===1?1:1-Math.pow(2,-10*t)};
// deterministic hash (no Math.random anywhere in the engine)
const hash1=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s)};

// Keyframe track: keys = [[time, value, ease?], ...]; value may be number or array.
function track(keys){
  return t=>{
    if(t<=keys[0][0]) return keys[0][1];
    for(let i=0;i<keys.length-1;i++){
      const a=keys[i], b=keys[i+1];
      if(t<b[0]){ const e=EASE[b[2]||'io']((t-a[0])/(b[0]-a[0]));
        return Array.isArray(a[1]) ? V.lerp(a[1],b[1],e) : mix(a[1],b[1],e); }
    }
    return keys[keys.length-1][1];
  };
}
// Catmull-Rom spline through points, param u in [0,1]
function spline(pts){
  return u=>{
    const n=pts.length-1, x=clamp(u,0,1)*n, i=Math.min(Math.floor(x),n-1), f=x-i;
    const p0=pts[Math.max(i-1,0)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(i+2,n)];
    return [0,1,2].map(k=>0.5*((2*p1[k])+(-p0[k]+p2[k])*f+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*f*f+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*f*f*f));
  };
}

// ---------- Expression library (face parameters) ----------
// open, happy(arc eyes), size, squint | lookX, lookY, wink(left closed), slope | mouthCurve, mouthOpen, mouthWidth
const EXPRESSIONS = {
  neutral:   [1,0,1,0,   0,0,0,0,    .5,0,1],
  happy:     [1,1,1,0,   0,0,0,0,    1,0,1.1],
  curious:   [1.1,0,1.12,0, .25,.15,0,0, .35,.15,.8],
  thinking:  [.9,0,1,.25, .55,.55,0,.3, .05,0,.7],
  excited:   [1,.75,1.15,0, 0,.1,0,0, 1,.65,1.2],
  surprised: [1.25,0,1.25,0, 0,.05,0,0, 0,1,.9],
  confused:  [1,0,1,.3,  -.2,.2,.35,.6, -.25,0,.8],
  determined:[.9,0,1,.55, 0,0,0,.9,   .15,0,.9],
  wink:      [1,.5,1,0,  0,0,1,0,    1,0,1.1],
  worried:   [1,0,1.05,.35, 0,-.1,0,-.8, -.6,.1,.8],
  frustrated:[.8,0,1,.6, 0,-.1,0,1,  -.4,0,1],
  relieved:  [.75,.4,1,0, 0,-.15,0,-.2, .8,0,1],
  sad:       [.75,0,.95,.3, 0,-.45,0,-.9, -1,0,.8],
  proud:     [.8,.9,1,0, 0,.2,0,0,    1,0,1.2],
  sleep:     [0,0,1,0,   0,-.2,0,0,  .2,0,.6],
};
function expressionAt(keys,t){ // keys: [[time,name,blend?]]
  let cur=EXPRESSIONS[keys[0][1]], out=cur.slice();
  for(let i=1;i<keys.length;i++){
    const [kt,name,bl=.3]=keys[i]; if(t<kt) break;
    const e=smooth(clamp((t-kt)/bl,0,1)); const nx=EXPRESSIONS[name];
    out=out.map((v,j)=>mix(v,nx[j],e));
  }
  return out;
}
// deterministic blinks: one every ~3.5–5s, skipped while asleep
function blinkAt(t){
  const slot=Math.floor(t/4.2), start=slot*4.2+hash1(slot)*2.6, d=t-start;
  return (d>0&&d<.16)? Math.sin(d/.16*Math.PI) : 0;
}

// ---------- Rotation helpers (row-major 3x3 as arrays of rows) ----------
function rotYXZ(yaw,pitch,roll){
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch),cz=Math.cos(roll),sz=Math.sin(roll);
  const Ry=[[cy,0,sy],[0,1,0],[-sy,0,cy]], Rx=[[1,0,0],[0,cx,-sx],[0,sx,cx]], Rz=[[cz,-sz,0],[sz,cz,0],[0,0,1]];
  return mm(mm(Ry,Rx),Rz);
}
function mm(A,B){return A.map(r=>[0,1,2].map(j=>r[0]*B[0][j]+r[1]*B[1][j]+r[2]*B[2][j]))}
function mv(A,v){return A.map(r=>r[0]*v[0]+r[1]*v[1]+r[2]*v[2])}
function tr(A){return [0,1,2].map(i=>[A[0][i],A[1][i],A[2][i]])}
// pack row-major matrix M into column-major Float32 for GLSL (so shader's M*v == mv(M,v))
function glMat(M){return new Float32Array([M[0][0],M[1][0],M[2][0],M[0][1],M[1][1],M[2][1],M[0][2],M[1][2],M[2][2]])}

// ---------- ARCHIVE rig: two-bone IK arms in body-local space ----------
const ARM={upper:.24, fore:.22, shoulder:[.40,-.02,0]};
function solveArm(side,hand){ // hand target in body-local
  const S=[ARM.shoulder[0]*side,ARM.shoulder[1],ARM.shoulder[2]];
  let d=V.sub(hand,S), L=V.len(d); const maxL=ARM.upper+ARM.fore-.005;
  if(L>maxL){d=V.mul(d,maxL/L);L=maxL;}
  const H=V.add(S,d), dir=V.norm(d);
  const a=(ARM.upper*ARM.upper-ARM.fore*ARM.fore+L*L)/(2*L), h=Math.sqrt(Math.max(ARM.upper*ARM.upper-a*a,0));
  let pole=[side*.35,-.25,-.7]; pole=V.norm(V.sub(pole,V.mul(dir,V.dot(pole,dir))));
  const E=V.add(V.add(S,V.mul(dir,a)),V.mul(pole,h));
  return {S,E,H};
}
// Named hand poses (body-local targets); 'side' = +1 right, -1 left
const HAND_POSES={
  rest:    s=>[.47*s,-.38,.1],
  tuck:    s=>[.38*s,-.32,.16],
  up:      s=>[.5*s,.42,.08],
  reach:   s=>[.22*s,-.02,.48],
  point:   s=>[.3*s,.08,.48],
  wave:    s=>[.6*s,.34,.12],
  cheer:   s=>[.55*s,.45,.05],
  chin:    s=>[.12*s,.0,.34],
  hold:    s=>[.2*s,-.08,.44],
  brace:   s=>[.32*s,.1,.38],
  shrug:   s=>[.6*s,-.08,.08],
};
function handAt(keys,side,t){ // keys [[time, poseName or [x,y,z], ease]]
  const conv=k=>[k[0], typeof k[1]==='string'?HAND_POSES[k[1]](side):[k[1][0]*side,k[1][1],k[1][2]], k[2]];
  return track(keys.map(conv))(t);
}

// ---------- Evaluate full ARCHIVE state at time t from a scene description ----------
function evalArchive(A,t){
  const pos=A.pos(t);
  // derive banking/pitch from motion (finite differences — deterministic)
  const dt=1/30, p0=A.pos(t-dt), p1=A.pos(t+dt);
  const vel=V.mul(V.sub(p1,p0),1/(2*dt));
  const yaw=A.yaw(t), yawRate=(A.yaw(t+dt)-A.yaw(t-dt))/(2*dt);
  const fwd=[Math.sin(yaw),0,Math.cos(yaw)];
  const speed=V.dot(vel,fwd);
  const thrust=A.thrust(t);
  const hoverAmt=clamp(thrust,0,1);
  const bob=Math.sin(t*2.1)*.035*hoverAmt + Math.sin(t*3.7+1)*.012*hoverAmt;
  const roll=clamp(-yawRate*.22,-.6,.6)+(A.roll?A.roll(t):0);
  const pitch=clamp(speed*.07,-.35,.45)+(A.pitch?A.pitch(t):0);
  const Rb=rotYXZ(yaw,pitch,roll);
  const hy=A.headYaw?A.headYaw(t):0, hp=A.headPitch?A.headPitch(t):0, hr=A.headRoll?A.headRoll(t):0;
  const Rh=rotYXZ(hy,hp,hr);
  const face=expressionAt(A.expr,t);
  const asleep=A.power(t)<.5;
  const bl=asleep?0:blinkAt(t);
  face[0]*=1-bl*.95;
  // idle sway on hands
  const sway=s=>[Math.sin(t*1.7+s)*.02*hoverAmt, Math.sin(t*2.1+s*2)*.025*hoverAmt, 0];
  const hl=V.add(handAt(A.handL,-1,t),sway(0)), hr2=V.add(handAt(A.handR,1,t),sway(1.3));
  if(A.handFxR) { const f=A.handFxR(t); hr2[0]+=f[0]; hr2[1]+=f[1]; hr2[2]+=f[2]; }
  const L=solveArm(-1,hl), Rr=solveArm(1,hr2);
  return {pos:V.add(pos,[0,bob,0]),Rb,Rh,L,R:Rr,face,thrust:thrust*(A.thrustFlicker?A.thrustFlicker(t):1),
          power:A.power(t),chest:A.chest(t),vis:A.vis?A.vis(t):1};
}

// ---------- Renderer ----------
class Renderer{
  constructor(canvas){
    this.c=canvas; const gl=canvas.getContext('webgl2',{preserveDrawingBuffer:true,antialias:false});
    if(!gl) throw new Error('WebGL2 is not available in this browser.');
    this.gl=gl;
    const vs=`#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0,1);}`;
    const mk=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));return s;};
    const pr=gl.createProgram(); gl.attachShader(pr,mk(gl.VERTEX_SHADER,vs)); gl.attachShader(pr,mk(gl.FRAGMENT_SHADER,ARCHIVE_FRAG));
    gl.bindAttribLocation(pr,0,'p'); gl.linkProgram(pr);
    if(!gl.getProgramParameter(pr,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr); this.pr=pr;
    const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    this.loc={};
  }
  u(name){ if(!(name in this.loc)) this.loc[name]=this.gl.getUniformLocation(this.pr,name); return this.loc[name]; }
  draw(S,w,h){
    const gl=this.gl; if(this.c.width!==w||this.c.height!==h){this.c.width=w;this.c.height=h;}
    gl.viewport(0,0,w,h);
    gl.uniform2f(this.u('R'),w,h);
    for(const [k,v] of Object.entries(S.uniforms)){
      const l=this.u(k); if(l===null) continue;
      if(v instanceof Float32Array && v.length===9) gl.uniformMatrix3fv(l,false,v);
      else if(Array.isArray(v)){ if(v.length===2)gl.uniform2fv(l,v); else if(v.length===3)gl.uniform3fv(l,v); else gl.uniform4fv(l,v);}
      else gl.uniform1f(l,v);
    }
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
}

// Build the uniform block for one frame from a scene + its local time
function frameState(scene,t){
  const A=evalArchive(scene.archive,t);
  const cam=scene.camera(t);
  const env=scene.env(t);
  const f=A.face;
  const U={
    T:t, camPos:cam.pos, camTgt:cam.tgt, camFov:cam.fov, camRoll:cam.roll||0,
    proj:cam.proj||0, tpCenter:cam.tpCenter||[0,0,0], tpZoom:cam.tpZoom||1, tpSpin:cam.tpSpin||0,
    aPos:A.pos, aMat:glMat(tr(A.Rb)), hMat:glMat(tr(A.Rh)),
    sL:A.L.S,eL:A.L.E,wL:A.L.H,sR:A.R.S,eR:A.R.E,wR:A.R.H,
    aThrust:A.thrust,aChest:A.chest,aPower:A.power,aVis:A.vis,
    eA:[f[0],f[1],f[2],f[3]], eB:[f[4],f[5],f[6],f[7]], mo:[f[8],f[9],f[10],1],
    exposure:1, grain:.018, beam:1, fade:1,
    shA:V.add(A.pos,mv(A.Rb,[0,.6,0])), shB:V.add(A.pos,mv(A.Rb,[0,-.2,0])),
  };
  Object.assign(U,env);
  return {uniforms:U, overlay:scene.overlay?scene.overlay(t):null, archive:A};
}
