// ARCHIVE engine — mesh generation, matrices, raster renderer and the per-frame scene builder.
const M4={
  id:()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  mul:(a,b)=>{const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;},
  // column-major from row-major 3x3 rotation R, translation t, scale s
  trs:(t,R,s)=>{s=s||[1,1,1];return [R[0][0]*s[0],R[1][0]*s[0],R[2][0]*s[0],0, R[0][1]*s[1],R[1][1]*s[1],R[2][1]*s[1],0, R[0][2]*s[2],R[1][2]*s[2],R[2][2]*s[2],0, t[0],t[1],t[2],1];},
  persp:(fovDeg,asp,n,f)=>{const q=1/Math.tan(fovDeg*Math.PI/360);return [q/asp,0,0,0,0,q,0,0,0,0,(f+n)/(n-f),-1,0,0,2*f*n/(n-f),0];},
  lookAt:(e,c,up)=>{const z=V.norm(V.sub(e,c)),x=V.norm(V.cross(up,z)),y=V.cross(z,x);
    return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-V.dot(x,e),-V.dot(y,e),-V.dot(z,e),1];},
  inv:m=>{const inv=new Array(16);
    inv[0]=m[5]*m[10]*m[15]-m[5]*m[11]*m[14]-m[9]*m[6]*m[15]+m[9]*m[7]*m[14]+m[13]*m[6]*m[11]-m[13]*m[7]*m[10];
    inv[4]=-m[4]*m[10]*m[15]+m[4]*m[11]*m[14]+m[8]*m[6]*m[15]-m[8]*m[7]*m[14]-m[12]*m[6]*m[11]+m[12]*m[7]*m[10];
    inv[8]=m[4]*m[9]*m[15]-m[4]*m[11]*m[13]-m[8]*m[5]*m[15]+m[8]*m[7]*m[13]+m[12]*m[5]*m[11]-m[12]*m[7]*m[9];
    inv[12]=-m[4]*m[9]*m[14]+m[4]*m[10]*m[13]+m[8]*m[5]*m[14]-m[8]*m[6]*m[13]-m[12]*m[5]*m[10]+m[12]*m[6]*m[9];
    inv[1]=-m[1]*m[10]*m[15]+m[1]*m[11]*m[14]+m[9]*m[2]*m[15]-m[9]*m[3]*m[14]-m[13]*m[2]*m[11]+m[13]*m[3]*m[10];
    inv[5]=m[0]*m[10]*m[15]-m[0]*m[11]*m[14]-m[8]*m[2]*m[15]+m[8]*m[3]*m[14]+m[12]*m[2]*m[11]-m[12]*m[3]*m[10];
    inv[9]=-m[0]*m[9]*m[15]+m[0]*m[11]*m[13]+m[8]*m[1]*m[15]-m[8]*m[3]*m[13]-m[12]*m[1]*m[11]+m[12]*m[3]*m[9];
    inv[13]=m[0]*m[9]*m[14]-m[0]*m[10]*m[13]-m[8]*m[1]*m[14]+m[8]*m[2]*m[13]+m[12]*m[1]*m[10]-m[12]*m[2]*m[9];
    inv[2]=m[1]*m[6]*m[15]-m[1]*m[7]*m[14]-m[5]*m[2]*m[15]+m[5]*m[3]*m[14]+m[13]*m[2]*m[7]-m[13]*m[3]*m[6];
    inv[6]=-m[0]*m[6]*m[15]+m[0]*m[7]*m[14]+m[4]*m[2]*m[15]-m[4]*m[3]*m[14]-m[12]*m[2]*m[7]+m[12]*m[3]*m[6];
    inv[10]=m[0]*m[5]*m[15]-m[0]*m[7]*m[13]-m[4]*m[1]*m[15]+m[4]*m[3]*m[13]+m[12]*m[1]*m[7]-m[12]*m[3]*m[5];
    inv[14]=-m[0]*m[5]*m[14]+m[0]*m[6]*m[13]+m[4]*m[1]*m[14]-m[4]*m[2]*m[13]-m[12]*m[1]*m[6]+m[12]*m[2]*m[5];
    inv[3]=-m[1]*m[6]*m[11]+m[1]*m[7]*m[10]+m[5]*m[2]*m[11]-m[5]*m[3]*m[10]-m[9]*m[2]*m[7]+m[9]*m[3]*m[6];
    inv[7]=m[0]*m[6]*m[11]-m[0]*m[7]*m[10]-m[4]*m[2]*m[11]+m[4]*m[3]*m[10]+m[8]*m[2]*m[7]-m[8]*m[3]*m[6];
    inv[11]=-m[0]*m[5]*m[11]+m[0]*m[7]*m[9]+m[4]*m[1]*m[11]-m[4]*m[3]*m[9]-m[8]*m[1]*m[7]+m[8]*m[3]*m[5];
    inv[15]=m[0]*m[5]*m[10]-m[0]*m[6]*m[9]-m[4]*m[1]*m[10]+m[4]*m[2]*m[9]+m[8]*m[1]*m[6]-m[8]*m[2]*m[5];
    const det=1/(m[0]*inv[0]+m[1]*inv[4]+m[2]*inv[8]+m[3]*inv[12]); return inv.map(x=>x*det);},
};
const I3=[[1,0,0],[0,1,0],[0,0,1]];
function basisFromY(dir){ // rotation whose +Y axis points along dir
  const y=V.norm(dir); const a=Math.abs(y[1])<.95?[0,1,0]:[1,0,0];
  const x=V.norm(V.cross(a,y)), z=V.cross(x,y); return [[x[0],y[0],z[0]],[x[1],y[1],z[1]],[x[2],y[2],z[2]]];
}
// ---------- procedural meshes ----------
const MESH={
  sphere(seg=48,ring=32){const P=[],N=[],U=[],I=[];
    for(let j=0;j<=ring;j++){const v=j/ring,th=v*Math.PI;for(let i=0;i<=seg;i++){const u=i/seg,ph=u*2*Math.PI;
      const n=[Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)];P.push(...n);N.push(...n);U.push(u,v);}}
    for(let j=0;j<ring;j++)for(let i=0;i<seg;i++){const a=j*(seg+1)+i,b=a+seg+1;I.push(a,a+1,b,b,a+1,b+1);}
    return {P,N,U,I};},
  roundedBox(b,r,seg=6){const P=[],N=[],U=[],I=[];
    const faces=[[0,1,2,1],[0,1,2,-1],[1,2,0,1],[1,2,0,-1],[2,0,1,1],[2,0,1,-1]];
    for(const [ax,ua,va,sg] of faces){const base=P.length/3;
      for(let j=0;j<=seg;j++)for(let i=0;i<=seg;i++){const v=[0,0,0];v[ax]=sg;v[ua]=(i/seg)*2-1;v[va]=(j/seg)*2-1;
        const s=[v[0]*(b[0]+r),v[1]*(b[1]+r),v[2]*(b[2]+r)];const inner=[clamp(s[0],-b[0],b[0]),clamp(s[1],-b[1],b[1]),clamp(s[2],-b[2],b[2])];
        let n=V.sub(s,inner); if(V.len(n)<1e-6){n=[0,0,0];n[ax]=sg;} n=V.norm(n);
        P.push(...V.add(inner,V.mul(n,r)));N.push(...n);U.push(i/seg,j/seg);}
      for(let j=0;j<seg;j++)for(let i=0;i<seg;i++){const a=base+j*(seg+1)+i,c=a+seg+1;
        if(sg>0)I.push(a,c,a+1,a+1,c,c+1);else I.push(a,a+1,c,a+1,c+1,c);}}
    return {P,N,U,I};},
  cylinder(seg=32,hseg=1,cap=true){const P=[],N=[],U=[],I=[]; // y from -1..1, radius 1
    for(let j=0;j<=hseg;j++)for(let i=0;i<=seg;i++){const a=i/seg*2*Math.PI;P.push(Math.cos(a),j/hseg*2-1,Math.sin(a));N.push(Math.cos(a),0,Math.sin(a));U.push(i/seg,j/hseg);}
    for(let j=0;j<hseg;j++)for(let i=0;i<seg;i++){const a=j*(seg+1)+i,b=a+seg+1;I.push(a,b,a+1,a+1,b,b+1);}
    if(cap)for(const y of [-1,1]){const c=P.length/3;P.push(0,y,0);N.push(0,y,0);U.push(.5,.5);
      for(let i=0;i<=seg;i++){const a=i/seg*2*Math.PI;P.push(Math.cos(a),y,Math.sin(a));N.push(0,y,0);U.push(.5,.5);}
      for(let i=0;i<seg;i++) y>0?I.push(c,c+i+2,c+i+1):I.push(c,c+i+1,c+i+2);}
    return {P,N,U,I};},
  torus(R,r,seg=96,tseg=16){const P=[],N=[],U=[],I=[]; // ring in XY plane (faces +Z)
    for(let j=0;j<=tseg;j++)for(let i=0;i<=seg;i++){const u=i/seg*2*Math.PI,v=j/tseg*2*Math.PI;
      const c=[Math.cos(u)*R,Math.sin(u)*R,0],n=[Math.cos(u)*Math.cos(v),Math.sin(u)*Math.cos(v),Math.sin(v)];
      P.push(c[0]+n[0]*r,c[1]+n[1]*r,n[2]*r);N.push(...n);U.push(i/seg,j/tseg);}
    for(let j=0;j<tseg;j++)for(let i=0;i<seg;i++){const a=j*(seg+1)+i,b=a+seg+1;I.push(a,a+1,b,b,a+1,b+1);}
    return {P,N,U,I};},
  disk(R,rings,seg,y=0,up=1){const P=[],N=[],U=[],I=[]; // XZ disk
    for(let j=0;j<=rings;j++)for(let i=0;i<=seg;i++){const rr=R*Math.pow(j/rings,1.15),a=i/seg*2*Math.PI;
      P.push(Math.cos(a)*rr,y,Math.sin(a)*rr);N.push(0,up,0);U.push(.5+Math.cos(a)*rr/R*.5,.5+Math.sin(a)*rr/R*.5);}
    for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){const a=j*(seg+1)+i,b=a+seg+1;up>0?I.push(a,b,a+1,a+1,b,b+1):I.push(a,a+1,b,a+1,b+1,b);}
    return {P,N,U,I};},
  wall(R,y0,y1,seg,hseg){const P=[],N=[],U=[],I=[];
    for(let j=0;j<=hseg;j++)for(let i=0;i<=seg;i++){const a=i/seg*2*Math.PI;P.push(Math.cos(a)*R,y0+(y1-y0)*j/hseg,Math.sin(a)*R);N.push(-Math.cos(a),0,-Math.sin(a));U.push(i/seg,j/hseg);}
    for(let j=0;j<hseg;j++)for(let i=0;i<seg;i++){const a=j*(seg+1)+i,b=a+seg+1;I.push(a,a+1,b,b,a+1,b+1);}
    return {P,N,U,I};},
  dome(cy,R,yStart,yEnd,seg,rings){const P=[],N=[],U=[],I=[];
    const t0=Math.acos((yStart-cy)/R),t1=Math.acos((yEnd-cy)/R);
    for(let j=0;j<=rings;j++){const th=t0+(t1-t0)*j/rings;for(let i=0;i<=seg;i++){const a=i/seg*2*Math.PI;
      const n=[Math.sin(th)*Math.cos(a),Math.cos(th),Math.sin(th)*Math.sin(a)];P.push(n[0]*R,cy+n[1]*R,n[2]*R);N.push(-n[0],-n[1],-n[2]);U.push(i/seg,j/rings);}}
    for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){const a=j*(seg+1)+i,b=a+seg+1;I.push(a,a+1,b,b,a+1,b+1);}
    return {P,N,U,I};},
  quad(sx=1,sy=1,seg=1){const P=[],N=[],U=[],I=[];
    for(let j=0;j<=seg;j++)for(let i=0;i<=seg;i++){P.push((i/seg*2-1)*sx,(j/seg*2-1)*sy,0);N.push(0,0,1);U.push(i/seg,j/seg);}
    for(let j=0;j<seg;j++)for(let i=0;i<seg;i++){const a=j*(seg+1)+i,b=a+seg+1;I.push(a,a+1,b,b,a+1,b+1);}
    return {P,N,U,I};},
  sprites(centres,seeds){const P=[],N=[],U=[],I=[];
    centres.forEach((c,k)=>{const b=P.length/3;for(const [u,v] of [[-1,-1],[1,-1],[1,1],[-1,1]]){P.push(...c);N.push(seeds[k],0,0);U.push(u,v);}I.push(b,b+1,b+2,b,b+2,b+3);});
    return {P,N,U,I};},
};
function cradleMesh(){ // lathe: bowl the sleeping ARCHIVE rests in
  const prof=[[0,-1.25],[.95,-1.25],[1.0,-1.18],[.98,-1.06],[.9,-1.02],[.78,-1.05],[.55,-1.1],[.3,-1.12],[0,-1.12]];
  return lathe(prof,64);
}
function pedestalMesh(top){const prof=[[0,-1.25],[.6,-1.25],[.62,-1.17],[.5,-1.1],[.2,-1.0],[.15,-.8],[.15,top-.12],[.32,top-.06],[.34,top],[0,top]];return lathe(prof,48);}
function lathe(prof,seg){const P=[],N=[],U=[],I=[];
  for(let j=0;j<prof.length;j++){const [r,y]=prof[j];const pr=prof[Math.max(j-1,0)],nx=prof[Math.min(j+1,prof.length-1)];
    let t=[nx[0]-pr[0],nx[1]-pr[1]];const l=Math.hypot(t[0],t[1])||1;const nn=[t[1]/l,-t[0]/l];
    for(let i=0;i<=seg;i++){const a=i/seg*2*Math.PI;P.push(Math.cos(a)*r,y,Math.sin(a)*r);N.push(Math.cos(a)*nn[0],nn[1],Math.sin(a)*nn[0]);U.push(i/seg,j/(prof.length-1));}}
  for(let j=0;j<prof.length-1;j++)for(let i=0;i<seg;i++){const a=j*(seg+1)+i,b=a+seg+1;I.push(a,b,a+1,a+1,b,b+1);}
  return {P,N,U,I};}

// ---------- renderer ----------
class RasterRenderer{
  constructor(canvas){
    this.c=canvas; const gl=canvas.getContext('webgl2',{preserveDrawingBuffer:true,antialias:false,depth:false});
    if(!gl) throw new Error('WebGL2 is not available in this browser.'); this.gl=gl;
    this.hdr=!!gl.getExtension('EXT_color_buffer_float'); gl.getExtension('OES_texture_float_linear');
    this.variants=new Map(); this.progScene=this.variant({mat:1,vmode:0,face:0,chest:0}); this.progSpace=this.prog(VS_FULL,FS_SPACE);
    this.progBright=this.prog(VS_FULL,FS_BRIGHT); this.progBlur=this.prog(VS_FULL,FS_BLUR); this.progComp=this.prog(VS_FULL,FS_COMPOSITE);
    this.tri=gl.createVertexArray(); gl.bindVertexArray(this.tri); const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    gl.bindVertexArray(null);
    this.meshes={}; this.buildMeshes(); this.size=[0,0]; this.locCache=new Map(); this.msaa=4;
  }
  prog(vs,fs){const gl=this.gl;const mk=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);
      if(!gl.getShaderParameter(x,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)+'\n'+s.split('\n').slice(0,3).join('\n'));return x;};
    const p=gl.createProgram();gl.attachShader(p,mk(gl.VERTEX_SHADER,vs));gl.attachShader(p,mk(gl.FRAGMENT_SHADER,fs));
    gl.bindAttribLocation(p,0,'aP');gl.bindAttribLocation(p,1,'aN');gl.bindAttribLocation(p,2,'aUV');gl.bindAttribLocation(p,0,'p');gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p;}
  // Specialised shader per material: SwiftShader (CPU) executes every branch of an uber-shader,
  // so each material gets its own program with constants folded in.
  variant(d){ const key=`${d.mat}|${d.vmode||0}|${d.face||0}|${d.chest||0}`; let p=this.variants.get(key);
    if(!p){ const vs=VS_SCENE.replace('/*VMODE*/',`const int uVMode=${d.vmode||0};`);
      const fs=FS_SCENE.replace('/*MAT*/',`const int uMat=${d.mat};`).replace('/*FACE*/',`const float uFace=${(d.face||0).toFixed(1)}, uChest=${(d.chest||0).toFixed(1)};`);
      p=this.prog(vs,fs); this.variants.set(key,p); }
    return p; }
  upload(name,m){const gl=this.gl;const vao=gl.createVertexArray();gl.bindVertexArray(vao);
    const put=(data,loc,n)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,gl.FLOAT,false,0,0);};
    put(m.P,0,3);put(m.N,1,3);put(m.U,2,2);const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(m.I),gl.STATIC_DRAW);gl.bindVertexArray(null);this.meshes[name]={vao,count:m.I.length};}
  buildMeshes(){
    this.upload('sphere',MESH.sphere(48,32)); this.upload('sphereLo',MESH.sphere(20,12));
    this.upload('ear',MESH.roundedBox([.05,.12,.12],.05,4));
    this.upload('cyl',MESH.cylinder(24,1,true)); this.upload('cylOpen',MESH.cylinder(48,8,false));
    this.upload('floor',MESH.disk(11.2,64,160,-1.25,1)); this.upload('wall',MESH.wall(11.2,-1.25,8.8,160,16));
    this.upload('dome',MESH.dome(-4,17,8.8,12.69,160,18));
    this.upload('pillar',MESH.roundedBox([.35,4.2,.5],.08,10)); this.upload('pillarBase',MESH.roundedBox([.6,.25,.75],.05,4));
    this.upload('cradle',cradleMesh()); this.upload('pedestal',pedestalMesh(-0.43));
    this.upload('ring',MESH.torus(2.45,.16,128,16)); this.upload('disc',MESH.quad(1,1,24)); this.upload('panel',MESH.quad(1,1,8));
    this.upload('sprite',MESH.sprites([[0,0,0]],[0]));
    const dc=[],ds=[]; for(let k=0;k<260;k++){const r=Math.sqrt(hash1(k*3.1))*10, a=hash1(k*7.7)*6.283; dc.push([Math.cos(a)*r,hash1(k*1.3)*7-1,Math.sin(a)*r]); ds.push(hash1(k*9.1));}
    this.upload('dust',MESH.sprites(dc,ds));
  }
  targets(w,h){ if(this.size[0]===w&&this.size[1]===h) return; this.size=[w,h]; const gl=this.gl;
    const fmt=this.hdr?gl.RGBA16F:gl.RGBA8, type=this.hdr?gl.HALF_FLOAT:gl.UNSIGNED_BYTE;
    const tex=(tw,th)=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,fmt,tw,th,0,gl.RGBA,type,null);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return {t,f,w:tw,h:th};};
    // multisampled HDR scene target
    this.msFB=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,this.msFB);
    const cr=gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER,cr); gl.renderbufferStorageMultisample(gl.RENDERBUFFER,this.msaa,fmt,w,h);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.RENDERBUFFER,cr);
    const dr=gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER,dr); gl.renderbufferStorageMultisample(gl.RENDERBUFFER,this.msaa,gl.DEPTH_COMPONENT24,w,h);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,dr);
    this.scene=tex(w,h);
    if(this.msaa===0){ this.msFB=this.scene.f; gl.bindFramebuffer(gl.FRAMEBUFFER,this.msFB);
      const d2=gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER,d2); gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,w,h);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,d2); }
    this.b1=tex(w>>2,h>>2); this.b2=tex(w>>2,h>>2); this.b3=tex(w>>3,h>>3); this.b4=tex(w>>3,h>>3);
  }
  setU(p,name,v){const gl=this.gl;if(!p._id) p._id=(this._pid=(this._pid||0)+1); const key=p._id+':'+name;
    let l=this.locCache.get(key); if(l===undefined){l=gl.getUniformLocation(p,name);this.locCache.set(key,l);} if(l===null) return;
    if(typeof v==='number') gl.uniform1f(l,v);
    else if(v.length===16) gl.uniformMatrix4fv(l,false,v); else if(v.length===9) gl.uniformMatrix3fv(l,false,v);
    else if(v.length===2) gl.uniform2fv(l,v); else if(v.length===3) gl.uniform3fv(l,v); else gl.uniform4fv(l,v);}
  draw(S,w,h){
    const gl=this.gl; if(this.c.width!==w||this.c.height!==h){this.c.width=w;this.c.height=h;} this.targets(w,h);
    const U=S.uniforms, L=buildDrawList(S), asp=w/h;
    const fov=U.camFov, view=M4.lookAt(U.camPos,U.camTgt,[Math.sin(U.camRoll||0),Math.cos(U.camRoll||0),0]);
    const projM=M4.persp(fov,asp,.03,120); const invVP=M4.inv(M4.mul(projM,view));
    gl.bindFramebuffer(gl.FRAMEBUFFER,this.msFB); gl.viewport(0,0,w,h);
    gl.clearColor(0,0,0,1); gl.clearDepth(1); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    // scene
    let p=null; const frameId=(this._fid=(this._fid||0)+1);
    const use=(d)=>{ const np=this.variant(d); if(np!==p){ p=np; gl.useProgram(p);
      if(p._fid!==frameId){ p._fid=frameId; for(const [k,v] of Object.entries(U)) if(typeof v==='number'||Array.isArray(v)||v instanceof Float32Array) this.setU(p,k,v);
        this.setU(p,'uView',view); this.setU(p,'uProj',projM); this.setU(p,'aspect',asp);} } };
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); this._cull=true;
    const run=(d)=>{ use(d); const m=this.meshes[d.mesh]; gl.bindVertexArray(m.vao);
      this.setU(p,'uModel',d.model); this.setU(p,'uLocal',d.local||M4.id());
      this.setU(p,'uColor',d.color||[1,1,1]); this.setU(p,'uAlpha',d.alpha==null?1:d.alpha); this.setU(p,'uSize',d.size||0);
      this.setU(p,'uFlick',d.flick||0);
      const want=!d.twoSided; if(want!==this._cull){ want?gl.enable(gl.CULL_FACE):gl.disable(gl.CULL_FACE); this._cull=want; }
      gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0); };
    gl.disable(gl.BLEND); gl.depthMask(true);
    const SK=this.skip||{}; const order=['floor','wall','dome']; const sorted=L.opaque.filter(d=>!order.includes(d.mesh)).concat(L.opaque.filter(d=>order.includes(d.mesh)));
    for(const d of sorted){ if(SK.opaque&&SK.opaque.includes(d.mesh)) continue; run(d);}
    // space background only where nothing was drawn (depth test at the far plane)
    gl.useProgram(this.progSpace); gl.disable(gl.CULL_FACE); gl.depthMask(false);
    for(const k of ['T','camPos','proj','tpZoom','tpSpin','tpCenter']) this.setU(this.progSpace,k,U[k]);
    this.setU(this.progSpace,'uInvVP',invVP); this.setU(this.progSpace,'aspect',asp);
    if(!SK.space){gl.bindVertexArray(this.tri); gl.drawArrays(gl.TRIANGLES,0,3);}
    // additive & blended layers
    gl.enable(gl.BLEND); p=null; this._cull=false; gl.disable(gl.CULL_FACE);
    for(const d of (SK.blend?[]:L.blend)){ if(d.mat===11) gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA); else gl.blendFunc(gl.ONE,gl.ONE); run(d); }
    gl.disable(gl.BLEND); gl.depthMask(true); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    // resolve MSAA → scene texture
    if(this.msaa>0){ gl.bindFramebuffer(gl.READ_FRAMEBUFFER,this.msFB); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,this.scene.f);
    gl.blitFramebuffer(0,0,w,h,0,0,w,h,gl.COLOR_BUFFER_BIT,gl.NEAREST); }
    // bloom chain
    const pass=(prog,dst,setup)=>{gl.useProgram(prog);gl.bindFramebuffer(gl.FRAMEBUFFER,dst?dst.f:null);gl.viewport(0,0,dst?dst.w:w,dst?dst.h:h);setup(prog);gl.bindVertexArray(this.tri);gl.drawArrays(gl.TRIANGLES,0,3);};
    const bind=(prog,name,tex,unit)=>{gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,tex.t);gl.uniform1i(gl.getUniformLocation(prog,name),unit);};
    if(!SK.bloom){pass(this.progBright,this.b1,pr=>{bind(pr,'src',this.scene,0);gl.uniform2f(gl.getUniformLocation(pr,'texel'),1/w,1/h);});
    const blur=(a,b)=>{pass(this.progBlur,b,pr=>{bind(pr,'src',a,0);gl.uniform2f(gl.getUniformLocation(pr,'dir'),1/a.w,0);});
                      pass(this.progBlur,a,pr=>{bind(pr,'src',b,0);gl.uniform2f(gl.getUniformLocation(pr,'dir'),0,1/a.h);});};
    blur(this.b1,this.b2); blur(this.b1,this.b2);
    pass(this.progBlur,this.b3,pr=>{bind(pr,'src',this.b1,0);gl.uniform2f(gl.getUniformLocation(pr,'dir'),.5/this.b1.w,0);});
    blur(this.b3,this.b4); blur(this.b3,this.b4);}
    pass(this.progComp,null,pr=>{bind(pr,'scene',this.scene,0);bind(pr,'bloomA',this.b1,1);bind(pr,'bloomB',this.b3,2);
      for(const k of ['exposure','fade','grain','T']) gl.uniform1f(gl.getUniformLocation(pr,k),U[k]); gl.uniform1f(gl.getUniformLocation(pr,'aspect'),asp);});
  }
}

// ---------- per-frame scene builder: frame state → draw list ----------
function buildDrawList(S){
  const U=S.uniforms, A=S.archive, op=[], bl=[];
  const Rb=A.Rb, P=A.pos;
  const toW=v=>V.add(P,mv(Rb,v)); // body-local → world
  const bodyM=M4.trs(P,Rb), bodyInv=M4.inv(bodyM);
  if(A.vis>.5){
    // head frame: neck pivot, rotated by Rh in body space
    const Rhw=mm(Rb,A.Rh), neckW=toW([0,.16,0]);
    const headFrame=M4.trs(neckW,Rhw), headInv=M4.inv(headFrame);
    const hc=V.add(neckW,mv(Rhw,[0,.43,0]));
    op.push({mesh:'sphere',mat:1,model:M4.trs(hc,Rhw,[.62,.48,.54]),local:headInv,face:1});
    for(const s of [-1,1]){ op.push({mesh:'ear',mat:4,model:M4.trs(V.add(neckW,mv(Rhw,[.6*s,.42,0])),Rhw),color:[.05,.15,.3]});
      op.push({mesh:'cyl',mat:9,model:M4.trs(V.add(neckW,mv(Rhw,[.665*s,.42,0])),mm(Rhw,[[0,-1,0],[1,0,0],[0,0,1]]),[.075,.012,.075]),color:[.3,.8,1.6]}); }
    // torso + lower body + neck + thruster
    op.push({mesh:'sphere',mat:1,model:M4.trs(toW([0,-.16,0]),Rb,[.35,.38,.31]),local:bodyInv,chest:1});
    op.push({mesh:'sphere',mat:1,model:M4.trs(toW([0,-.42,0]),Rb,[.22,.17,.2]),local:bodyInv});
    op.push({mesh:'cyl',mat:4,model:M4.trs(toW([0,.07,0]),Rb,[.11,.1,.11]),color:[0,0,0]});
    op.push({mesh:'cyl',mat:4,model:M4.trs(toW([0,-.56,0]),Rb,[.11,.07,.11]),local:bodyInv,chest:-1,color:[0,0,0]});
    op.push({mesh:'cyl',mat:9,model:M4.trs(toW([0,-.63,0]),Rb,[.085,.008,.085]),color:V.mul([.3,.8,1.6],.4+A.thrust)});
    // arms (rig solved in body space)
    for(const arm of [A.L,A.R]){
      const S0=toW(arm.S),E=toW(arm.E),H=toW(arm.H);
      const seg=(a,b,r)=>{const d=V.sub(b,a),l=V.len(d);op.push({mesh:'cyl',mat:1,model:M4.trs(V.mul(V.add(a,b),.5),basisFromY(d),[r,l/2,r])});};
      seg(S0,E,.065); seg(E,H,.058);
      op.push({mesh:'sphereLo',mat:4,model:M4.trs(S0,Rb,[.1,.1,.1]),color:[.05,.25,.5]});
      op.push({mesh:'sphereLo',mat:4,model:M4.trs(E,Rb,[.075,.075,.075]),color:[.05,.25,.5]});
      op.push({mesh:'sphere',mat:1,model:M4.trs(H,basisFromY(V.sub(H,E)),[.09,.11,.09])});
    }
    // thruster flame sprites (additive)
    const dn=mv(Rb,[0,-1,0]), base=toW([0,-.64,0]), th=A.thrust*(1+.12*Math.sin(U.T*61));
    if(th>.02) for(let k=0;k<6;k++){ const s=k/5; bl.push({mesh:'sprite',mat:12,vmode:1,model:M4.trs(V.add(base,V.mul(dn,s*.42)),I3),size:(.16-.1*s)*(.6+.4*th),color:V.mul([.35,.75,1.8],th*(1-s*.8)*.9)}); }
    bl.push({mesh:'sprite',mat:12,vmode:1,model:M4.trs(hc,I3),size:.9,color:V.mul([.15,.45,1],.05*A.power)});
  }
  // ---- the hall ----
  op.push({mesh:'floor',mat:2,model:M4.id()});
  op.push({mesh:'wall',mat:3,model:M4.id()}); op.push({mesh:'dome',mat:3,model:M4.id()});
  for(let i=0;i<12;i++){ const a=(i+.5)*Math.PI/6 - Math.PI/12*1, R=[[Math.cos(a),0,-Math.sin(a)],[0,1,0],[Math.sin(a),0,Math.cos(a)]];
    const c=[Math.cos(a)*8,0,Math.sin(a)*8];
    op.push({mesh:'pillar',mat:5,model:M4.trs([c[0],2.5,c[2]],R)}); op.push({mesh:'pillarBase',mat:5,model:M4.trs([c[0],-1.05,c[2]],R)}); }
  op.push({mesh:'cradle',mat:6,model:M4.id()});
  op.push({mesh:'pedestal',mat:6,model:M4.trs([U.orbPos[0],0,U.orbPos[2]],I3)});
  op.push({mesh:'ring',mat:7,model:M4.trs(U.portalPos,I3),local:M4.inv(M4.trs(U.portalPos,I3))});
  if(U.orbScale>.01){ const om=M4.trs(U.orbPos,I3,[U.orbScale,U.orbScale,U.orbScale]); op.push({mesh:'sphere',mat:8,model:om,local:M4.inv(om)});
    bl.push({mesh:'sprite',mat:12,vmode:1,model:M4.trs(U.orbPos,I3),size:.55+U.orbGlow*.35,color:V.mul([.3,.7,1.4],.35+U.orbGlow*.5)}); }
  // holograms
  for(let i=0;i<3;i++){ const ang=-2.3+i*1.15, c=[Math.cos(ang)*6.6,.75+i*.15,Math.sin(ang)*6.6];
    const tx=[-Math.sin(ang),0,Math.cos(ang)], nn=[Math.cos(ang),0,Math.sin(ang)], R=[[tx[0],0,nn[0]],[0,1,0],[tx[2],0,nn[2]]];
    const s=i===0?1+U.holoGlitch*.7:1; if(U.holoFlick>.01) bl.push({mesh:'panel',mat:10,model:M4.trs(c,R,[1.1*s,.7*s,1]),flick:i,twoSided:true,alpha:U.amb>0?1:0}); }
  // light shaft from the oculus + dust
  bl.push({mesh:'cylOpen',mat:13,model:M4.trs([0,4,0],I3,[2.6,5.3,2.6]),color:V.mul([.5,.65,1],.06*(.4+U.hallLight)*U.amb),twoSided:true});
  bl.push({mesh:'dust',mat:14,vmode:2,model:M4.id(),size:.02,color:V.mul([.7,.85,1],.9*U.amb)});
  // orb → portal beam
  if(U.orbBeam>.01){ const d=V.sub(U.portalPos,U.orbPos), l=V.len(d)*U.orbBeam, dir=V.norm(d);
    bl.push({mesh:'cylOpen',mat:13,model:M4.trs(V.add(U.orbPos,V.mul(dir,l/2)),basisFromY(dir),[.07,l/2,.07]),color:V.mul([.6,.9,1.6],U.orbBeam*1.6),twoSided:true}); }
  // portal disc
  if(U.portalOpen>.001){ const r=2.3*smooth(clamp(U.portalOpen,0,1));
    bl.push({mesh:'disc',mat:11,model:M4.trs(V.add(U.portalPos,[0,0,.02]),I3,[r,r,1]),twoSided:true});
    bl.push({mesh:'sprite',mat:12,vmode:1,model:M4.trs(V.add(U.portalPos,[0,0,.1]),I3),size:3.2*U.portalOpen,color:V.mul([1,.8,.55],.25*U.portalOpen)}); }
  return {opaque:op,blend:bl};
}
