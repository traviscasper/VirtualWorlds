// ARCHIVE engine — rasterized shaders (WebGL2). Same visual language as the look-dev raymarcher,
// but ~10x cheaper per pixel, which is what makes a 162,000-frame feature renderable.
const GLSL_COMMON = `
#define PI 3.14159265
uniform float T;
float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float hash2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
  mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*noise(p);p*=2.03;a*=.5;}return s;}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float sdCap2(vec2 p,vec2 a,vec2 b,float r){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
`;
const VS_SCENE = `#version 300 es
precision highp float;
in vec3 aP; in vec3 aN; in vec2 aUV;
uniform mat4 uModel, uView, uProj, uLocal;
uniform float proj, tpZoom, tpSpin, aspect; uniform vec3 tpCenter, camPos;
/*VMODE*/ uniform float uSize; uniform float T;
out vec3 vW; out vec3 vN; out vec3 vL; out vec2 vUV; out float vSeed;
vec4 project(vec3 w){
 vec4 pc=uProj*uView*vec4(w,1);
 if(proj>.001){
  vec3 d=w-tpCenter; float dist=length(d); d/=max(dist,1e-4);
  float th=min(acos(clamp(-d.y,-1.,1.)),3.); float a=atan(d.z,d.x)-tpSpin; float r=tan(th*.5)/tpZoom;
  vec4 sc=vec4(r*cos(a)*2./aspect, r*sin(a)*2., clamp(dist/60.,0.,1.)*2.-1., 1.);
  vec4 pn=pc/max(pc.w,.05); pn.z=clamp(pn.z,-1.,1.); pn.w=1.;
  pc=mix(pn,sc,smoothstep(0.,1.,proj));
 }
 return pc;
}
void main(){
 vSeed=0.;
 if(uVMode==0){
  vec4 w=uModel*vec4(aP,1); vW=w.xyz; vN=normalize(mat3(transpose(inverse(uModel)))*aN); vL=(uLocal*w).xyz; vUV=aUV;
  gl_Position=project(w.xyz);
 } else { // camera-facing sprites: aP = centre (model space), aUV = corner, aN.x = seed
  vec3 c=(uModel*vec4(aP,1)).xyz; float seed=aN.x; vSeed=seed;
  if(uVMode==2){ // drifting dust motes
   c+=vec3(sin(T*.13+seed*40.)*.6, mod(T*.05+seed*7.,6.)-1., cos(T*.11+seed*23.)*.6);
  }
  vW=c; vN=vec3(0,0,1); vL=vec3(0); vUV=aUV*.5+.5;
  vec4 pc=project(c);
  float s=uSize*(uVMode==2?(.4+.6*fract(seed*13.7)):1.);
  pc.xy+=aUV*s*vec2(1./aspect,1.)*(proj>.5?pc.w*.25:1.); 
  gl_Position=pc;
 }
}`;
const FS_SCENE = `#version 300 es
precision highp float;
in vec3 vW; in vec3 vN; in vec3 vL; in vec2 vUV; in float vSeed;
out vec4 O;
/*MAT*/ uniform vec3 uColor; uniform float uAlpha;
uniform vec3 camPos;
uniform vec3 aPos; uniform mat3 aMat; uniform vec4 eA,eB,mo; uniform float aPower,aChest,aThrust;
uniform float hallLight,holoFlick,holoGlitch,holoNet,amb;
uniform vec3 orbPos; uniform float orbScale,orbSpin,orbGlow;
uniform vec3 portalPos; uniform float portalOpen;
uniform vec3 shA, shB; // archive head/body shadow spheres (world)
/*FACE*/ uniform float uFlick;
`+GLSL_COMMON+`
float sphShadow(vec3 ro,vec3 rd,vec4 sph,float k){
 vec3 oc=ro-sph.xyz; float b=dot(oc,rd); float c=dot(oc,oc)-sph.w*sph.w; float h=b*b-c;
 float d=sqrt(max(0.,sph.w*sph.w-h))-sph.w; float t=-b-sqrt(max(h,0.));
 return (t<0.)?1.:smoothstep(0.,1.,2.5*k*d/t);
}
float eyeShape(vec2 f,float side){
 float open=eA.x*(side<0.?(1.-eB.z):1.); float sz=eA.z;
 vec2 c=vec2(side*.2+eB.x*.07,.04+eB.y*.06); vec2 q=f-c;
 float d=length(q/vec2(.085*sz,max(.11*sz*open,.004)))-1.; d*=.085*sz;
 d=max(d,-((q.x*side)*eB.w*.9-q.y+.13*sz-.15*eA.w));
 float hap=abs(length(q+vec2(0,.07))-.085*sz)-.022; hap=max(hap,-(q.y+.02));
 d=mix(d,hap,eA.y);
 float closed=sdCap2(q,vec2(-.08,0),vec2(.08,0),.016);
 d=mix(d,closed,smoothstep(.12,0.,open)*(1.-eA.y));
 return d;
}
vec3 faceEmit(vec3 q){
 vec2 f=vec2(q.x,q.y-.40);
 float e=min(eyeShape(f,-1.),eyeShape(f,1.));
 vec3 blue=vec3(.15,.65,1.);
 float aa=fwidth(e)*1.2+.002;
 vec3 col=blue*3.4*smoothstep(aa,-aa,e)+blue*.5*exp(-max(e,0.)*30.);
 for(float s=-1.;s<2.;s+=2.){vec2 hc=vec2(s*.2+eB.x*.07-.03,.04+eB.y*.06+.05*eA.z);float h=length(f-hc)-.018*eA.z;
  col+=vec3(1)*smoothstep(.004,-.004,h)*eA.x*(1.-eA.y)*(s<0.?(1.-eB.z):1.);}
 float mx=f.x/(.075*mo.z); vec2 mp=f-vec2(0,-.135);
 float arc=abs(mp.y+mo.x*.04*(1.-mx*mx))-.011; arc=max(arc,abs(f.x)-.075*mo.z);
 float om=(length(mp/vec2(.045*mo.z,.04))-1.)*.04;
 float md=mix(arc,om,mo.y);
 col+=blue*2.8*smoothstep(aa,-aa,md)+blue*.3*exp(-max(md,0.)*35.);
 return col*aPower;
}
vec3 orbColor(vec3 lp,vec3 n,vec3 rd){
 lp.xz=rot(orbSpin)*lp.xz;
 float h=fbm(lp*2.2+1.7);
 vec3 ocean=vec3(.02,.18,.45),land=mix(vec3(.12,.45,.18),vec3(.75,.68,.45),smoothstep(.6,.72,h));
 vec3 c=h>.52?land:ocean*(.7+.6*h);
 float cl=smoothstep(.55,.75,fbm(lp*3.+vec3(orbSpin*.2,0,0)+9.)); c=mix(c,vec3(1),cl*.8);
 float day=clamp(dot(n,normalize(vec3(.4,.8,.3)))*.8+.35,0.,1.);
 vec3 cityL=vec3(1.,.75,.35)*step(.52,h)*smoothstep(.8,.9,hash(floor(lp*40.)))*(1.-day)*2.;
 vec3 col=c*day*(.6+.6*orbGlow)+cityL;
 float rim=pow(1.-max(dot(n,-rd),0.),3.);
 return col+vec3(.3,.7,1.)*rim*(1.2+orbGlow*2.);
}
vec3 portalView(vec2 uv,float r){
 float a=atan(uv.y,uv.x); float rr=length(uv);
 float sw=fbm(vec3(a*2.+T*.6-rr*4.,rr*6.-T*.8,T*.1));
 vec3 swirl=mix(vec3(.1,.4,1.),vec3(1.,.8,.4),sw)*sw*1.6;
 vec2 v=uv*1.2;
 vec3 sky=mix(vec3(1.,.72,.45),vec3(.35,.6,1.),smoothstep(-.3,.9,v.y));
 sky+=vec3(1.,.9,.6)*exp(-length(v-vec2(.15,.05))*6.)*1.5;
 float x=v.x*7.; float b=floor(x); float hgt=-.35+hash2(vec2(b,3.))*.55+(abs(b)<2.?.3:0.);
 float bld=step(v.y,hgt)*step(fract(x),.86);
 float x2=v.x*13.; float b2=floor(x2); float hg2=-.45+hash2(vec2(b2,7.))*.3;
 vec3 city=mix(vec3(.55,.62,.9),vec3(.2,.25,.5),smoothstep(-.6,.4,v.y));
 vec3 win=vec3(1.,.85,.5)*step(.6,hash2(floor(v*vec2(70.,90.))))*.6;
 vec3 c=sky; c=mix(c,city*.8+win*.4,bld*.85); c=mix(c,vec3(.12,.3,.25),step(v.y,hg2)*step(fract(x2),.9)*.9);
 float clear=smoothstep(.95,.35,rr/r);
 return mix(swirl,c,clear*smoothstep(.3,1.,portalOpen))*1.25;
}
vec3 holoPanel(vec2 uv,float id){
 float fl=holoFlick*(.6+.4*step(.3,hash2(vec2(floor(T*14.),id))));
 vec3 hc=vec3(.2,.7,1.)*(.12+.15*step(.5,fract(uv.y*40.)));
 float edge=max(smoothstep(.03,0.,uv.x)+smoothstep(.97,1.,uv.x),smoothstep(.05,0.,uv.y)+smoothstep(.95,1.,uv.y));
 hc+=vec3(.3,.8,1.)*edge;
 vec2 g=uv*vec2(8.,5.); hc+=vec3(.4,.8,1.)*.25*step(.9,fract(g.x))*step(.5,hash2(floor(g)+id));
 if(id<.5){
  vec2 c=uv-.5; c.x*=1.6;
  for(int k=0;k<6;k++){float ak=float(k)*1.047+T*.15; vec2 nk=vec2(cos(ak),sin(ak))*.3;
   hc+=vec3(1.,.8,.4)*smoothstep(.035,.02,length(c-nk))*holoNet;
   float hh=clamp(dot(c,nk)/dot(nk,nk),0.,1.); float ld=length(c-nk*hh);
   vec3 lc=(k==4)?mix(vec3(1.,.15,.1),vec3(0),step(.5,fract(T*1.5))):vec3(.4,.8,1.);
   hc+=lc*smoothstep(.008,.0,ld)*holoNet;}
  hc+=vec3(1.,.9,.6)*smoothstep(.06,.03,length(c))*holoNet;
  hc=mix(hc,vec3(1.,.3,.4)*step(.5,hash2(floor(uv*vec2(20.,60.))+floor(T*20.))),holoGlitch*.6);
 }
 return hc*fl*1.5;
}
void main(){
 vec3 V=normalize(camPos-vW); vec3 rd=-V;
 float dist=length(camPos-vW);
 if(uMat>=10){ // ---------- additive / emissive layers ----------
  vec3 c=vec3(0); float a=1.;
  if(uMat==10){ c=holoPanel(vUV,uFlick); }
  else if(uMat==11){ vec2 uv=vUV*2.-1.; float rr=length(uv);
    c=portalView(uv,1.); c+=vec3(.5,.85,1.)*exp(-abs(rr-1.)*18.)*1.4; O=vec4(c*amb*0.+c,smoothstep(1.,.96,rr)); return; }
  else if(uMat==12){ vec2 uv=vUV*2.-1.; float g=exp(-dot(uv,uv)*4.)-.018; c=uColor*max(g,0.); }
  else if(uMat==13){ float f=abs(dot(normalize(vN),V)); c=uColor*pow(f,3.)*(.5+.5*smoothstep(-1.2,6.,vW.y)); }
  else if(uMat==14){ vec2 uv=vUV*2.-1.; float g=max(exp(-dot(uv,uv)*6.)-.003,0.); c=uColor*g*(.5+.5*sin(T*2.+vSeed*50.)); }
  O=vec4(c*uAlpha,1.); return;
 }
 vec3 n=normalize(vN); if(!gl_FrontFacing) n=-n;
 vec3 L=normalize(vec3(.25,1.,.2));
 vec3 key=vec3(1.,.86,.62)*(.25+1.6*hallLight)*amb;
 vec3 fill=vec3(.25,.45,1.)*(.12+.35*hallLight)*amb;
 vec3 alb=vec3(.5),emit=vec3(0); float spec=.3,gloss=32.,occ=1.,sh=1.;
 if(uMat==1){ // ARCHIVE white shell
  alb=vec3(.93,.95,.99); spec=.9; gloss=70.; occ=.78+.22*n.y;
  if(uFace>.5){ vec3 q=vL; float fe=pow(q.x/.47,2.)+pow((q.y-.40)/.33,2.);
   if(q.z>.18&&fe<1.){alb=vec3(.008,.01,.02);spec=1.5;gloss=120.;emit=faceEmit(q);emit+=vec3(.2,.5,1.)*smoothstep(.9,1.,fe)*.3*aPower;}
   else if(q.z>.1&&fe<1.08) {alb=vec3(.55,.75,1.); emit+=vec3(.15,.5,1.)*.6*aPower;} }
  if(uChest>.5){ vec3 lp=vL; float cl=length((lp.xy-vec2(0,-.08))/vec2(1.,1.1));
   if(lp.z>.15) emit+=vec3(.2,.7,1.)*(smoothstep(.1,.085,cl)*smoothstep(.04,.06,cl)*3.+smoothstep(.05,0.,cl)*2.6)*aChest;
   if(abs(lp.y+.02)<.012) emit+=vec3(.2,.6,1.)*1.6*aPower; }
 } else if(uMat==2){ // floor
  float rr=length(vW.xz); float an=atan(vW.z,vW.x);
  alb=vec3(.06,.08,.14); spec=.9; gloss=90.;
  float ring=abs(fract(rr*.5)-.5); float lit=smoothstep(rr-.5,rr+.5,hallLight*13.);
  float aa=fwidth(rr)*.6+.004;
  emit+=vec3(.15,.55,1.)*smoothstep(.03+aa,.0,ring)*.9*lit;
  emit+=vec3(1.,.7,.3)*smoothstep(.02+aa,.0,abs(fract(an*12./(2.*PI))-.5)*rr*.15)*.25*lit*step(2.,rr);
  float tile=step(.48,abs(fract(vW.x*.5)-.5))+step(.48,abs(fract(vW.z*.5)-.5)); alb+=vec3(.02)*tile;
  occ=mix(.55,1.,smoothstep(7.,6.,abs(rr-8.)*8.+6.)); 
 } else if(uMat==3){ // walls & dome
  alb=vec3(.1,.13,.24); spec=.25;
  float rib=smoothstep(.04,0.,abs(fract(atan(vW.z,vW.x)*12./(2.*PI))-.5)*.3);
  emit+=vec3(1.,.72,.35)*rib*.4*hallLight*smoothstep(4.,9.,vW.y);
  emit+=vec3(.1,.35,.9)*.3*hallLight*smoothstep(.95,1.,sin(vW.y*2.)*.5+.5);
 } else if(uMat==4){ // dark joints & thruster
  alb=vec3(.12,.16,.25); spec=1.; gloss=50.; occ=.8;
  emit+=uColor*aPower;
  if(uChest<-.5) emit+=vec3(.3,.7,1.)*aThrust*2.4*smoothstep(-.55,-.64,vL.y);
 } else if(uMat==5){ // pillars
  alb=vec3(.74,.76,.84); spec=.6; gloss=40.;
  emit+=vec3(.2,.6,1.)*smoothstep(.05,0.,abs(fract(vW.y*.25)-.5))*.7*hallLight;
  occ=mix(.6,1.,smoothstep(-1.25,.5,vW.y));
 } else if(uMat==6){ // cradle & pedestal
  alb=vec3(.8,.82,.88); spec=.7;
  emit+=vec3(.2,.6,1.)*smoothstep(.035,0.,abs(vW.y+1.08))*1.6*(.25+hallLight);
 } else if(uMat==7){ // portal ring
  alb=vec3(.55,.45,.3); spec=1.; gloss=30.;
  emit+=mix(vec3(1.,.7,.3),vec3(.3,.7,1.),.5+.5*sin(T*2.+atan(vL.y,vL.x)*2.))*portalOpen*2.8;
 } else if(uMat==8){ O=vec4(orbColor(vL,n,rd),1.); return; }
 else if(uMat==9){ O=vec4(uColor*aPower,1.); return; }
 if(uMat>=2&&uMat!=4){ vec3 so=vW+n*.02;
  sh=min(sphShadow(so,L,vec4(shA,.56),3.),sphShadow(so,L,vec4(shB,.37),3.));
  if(orbScale>.01) sh=min(sh,sphShadow(so,L,vec4(orbPos,orbScale),3.)); }
 float dif=max(dot(n,L),0.)*sh;
 vec3 H=normalize(L+V);
 float sp=pow(max(dot(n,H),0.),gloss)*spec*sh;
 float fr=pow(1.-max(dot(n,V),0.),4.);
 vec3 ol=orbPos-vW; float od=length(ol);
 vec3 orbL=vec3(.4,.75,1.)*(.25+orbGlow*1.6)*max(dot(n,ol/od),0.)/(1.+od*od*.5);
 vec3 pl=portalPos-vW; float pd=length(pl);
 vec3 porL=vec3(1.,.8,.5)*portalOpen*3.5*max(dot(n,pl/pd),0.)/(1.+pd*pd*.08);
 vec3 al=aPos-vW; float ad=length(al);
 vec3 selfL=(uMat==1||uMat==4)?vec3(0):vec3(.2,.6,1.)*(aPower*.35+aThrust*.6)*max(dot(n,al/ad),0.)/(1.+ad*ad*3.);
 vec3 ambL=fill*(.5+.5*n.y)*occ;
 // anime-style two-tone wrap on the hero shell
 if(uMat==1){ float w=smoothstep(.0,.12,dot(n,L)); dif=mix(.18,1.,w)*sh*max(dot(n,L)*.5+.5,0.); }
 vec3 col=alb*(key*dif+ambL+orbL+porL+selfL)+key*sp*.6+fr*vec3(.3,.55,1.)*.45*occ*(.3+hallLight)*amb+emit;
 float fogA=1.-exp(-dist*.035); col=mix(col,vec3(.03,.06,.14)*(.4+hallLight)*amb,fogA*.7);
 O=vec4(col,1.);
}`;
const VS_FULL = `#version 300 es
in vec2 p; out vec2 vUV; void main(){vUV=p*.5+.5; gl_Position=vec4(p,1,1);}`;
const FS_SPACE = `#version 300 es
precision highp float; in vec2 vUV; out vec4 O;
uniform mat4 uInvVP; uniform vec3 camPos; uniform float proj,tpZoom,tpSpin,aspect; uniform vec3 tpCenter;
`+GLSL_COMMON+`
void main(){
 vec4 a=uInvVP*vec4(vUV*2.-1.,1.,1.); vec3 rdP=normalize(a.xyz/a.w-camPos);
 vec3 rd=rdP;
 if(proj>.001){ vec2 uv=(vUV-.5)*vec2(aspect,1.); float r=length(uv)*tpZoom; float th=2.*atan(r); float an=atan(uv.y,uv.x)+tpSpin;
  rd=normalize(mix(rdP,vec3(sin(th)*cos(an),-cos(th),sin(th)*sin(an)),smoothstep(0.,1.,proj))); }
 vec3 c=vec3(.01,.015,.04);
 float n=fbm(rd*3.+vec3(0,0,T*.003));
 c+=vec3(.15,.05,.28)*pow(n,3.)*1.6+vec3(.02,.12,.3)*pow(fbm(rd*5.+3.),4.)*2.;
 c+=vec3(.8,.9,1.)*smoothstep(.985,1.,hash(floor(rd*220.)))*1.4;
 O=vec4(c,1.);
}`;
const FS_BRIGHT = `#version 300 es
precision highp float; in vec2 vUV; out vec4 O; uniform sampler2D src; uniform vec2 texel;
void main(){ vec3 c=vec3(0);
 for(int i=-1;i<=1;i+=2)for(int j=-1;j<=1;j+=2) c+=texture(src,vUV+vec2(i,j)*texel).rgb;
 c*=.25; float l=max(c.r,max(c.g,c.b)); O=vec4(c*smoothstep(.75,1.6,l),1.); }`;
const FS_BLUR = `#version 300 es
precision highp float; in vec2 vUV; out vec4 O; uniform sampler2D src; uniform vec2 dir;
void main(){ vec3 c=texture(src,vUV).rgb*.227;
 c+=(texture(src,vUV+dir*1.385).rgb+texture(src,vUV-dir*1.385).rgb)*.316;
 c+=(texture(src,vUV+dir*3.231).rgb+texture(src,vUV-dir*3.231).rgb)*.07; O=vec4(c,1.); }`;
const FS_COMPOSITE = `#version 300 es
precision highp float; in vec2 vUV; out vec4 O;
uniform sampler2D scene, bloomA, bloomB; uniform float exposure, fade, grain, T, aspect;
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 vec3 c=texture(scene,vUV).rgb;
 vec3 b=texture(bloomA,vUV).rgb*.9+texture(bloomB,vUV).rgb*1.2;
 c=(c+b*.85)*exposure;
 c=aces(c); c=pow(c,vec3(.4545));
 c=c*vec3(1.02,1.,.97)+vec3(0.,.004,.018);
 vec2 uv=(vUV-.5)*vec2(aspect,1.);
 c*=mix(.7,1.,smoothstep(1.25,.35,length(uv*vec2(.9,1.))));
 c+=(h2(gl_FragCoord.xy+fract(T*7.)*100.)-.5)*grain;
 O=vec4(c*fade,1.);
}`;
