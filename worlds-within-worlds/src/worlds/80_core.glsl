// ===================== WORLD MODULE: THE COSMIC CORE (Chapter 8) =====================
// The Heartstar inside a failing Dyson swarm (four tilted rings of collector panels), two great orbital
// infrastructure rings with lit spokes, the Conductor's Seat (a platform with a socket shaped like ARCHIVE's
// emblem), and a black hole at the edge of the sky with gravitational lensing and an accretion ring.
uniform vec4 uCore;   // star glow, swarm failure 0..1, seat glow, lensing strength
const vec3 HS=vec3(0.,0.,-120.), SEAT=vec3(0.,0.,-70.);
const float HR=18.;
const vec3 BHD=normalize(vec3(.78,.28,-.56));
vec3 coreRot(vec3 q, float ax, float ay){ float c=cos(ax), s=sin(ax); q=vec3(q.x, c*q.y-s*q.z, s*q.y+c*q.z); c=cos(ay); s=sin(ay); return vec3(c*q.x+s*q.z, q.y, -s*q.x+c*q.z); }
float coreWorld(vec3 p, out int m){
  vec3 q=p-HS; float d=length(q)-HR; m=100;
  // Dyson swarm: four rings of panels
  float rq=length(q);
  if(abs(rq-41.)<18.){
    for(int k=0;k<4;k++){ float fk=float(k); float R=28.+fk*8.5;
      vec3 r=coreRot(q,.35+fk*.42,fk*1.3+uTime*(.02+.006*fk));
      float a=atan(r.z,r.x); float N=36.+fk*8.; float sec=6.2832/N; float ia=floor(a/sec+.5);
      float on=step(uCore.y*1.15, hash11(ia*7.+fk*31.)); float ca=ia*sec;
      vec3 lp=vec3(cos(ca)*r.x+sin(ca)*r.z, r.y, -sin(ca)*r.x+cos(ca)*r.z)-vec3(R,0.,0.);
      float pnl=sdBox(lp,vec3(.12,1.6,1.3)); if(on<.5) pnl=max(pnl,.6);
      if(pnl<d){ d=pnl; m=101; } }
  } else d=min(d, abs(rq-41.)-17.);
  // two infrastructure rings with spokes
  for(int k=0;k<2;k++){ float fk=float(k); vec3 r=coreRot(q,1.2+fk*.9,.6+fk*2.+uTime*.01*(fk*2.-1.));
    float R=66.+fk*12.; float ring=length(vec2(length(r.xz)-R, r.y))-.9;
    float a=atan(r.z,r.x); float sec=6.2832/12.; float ca=floor(a/sec+.5)*sec;
    vec3 sp=vec3(cos(ca)*r.x+sin(ca)*r.z, r.y, -sin(ca)*r.x+cos(ca)*r.z);
    float spoke=max(sdCap(sp,vec3(HR+6.,0.,0.),vec3(R,0.,0.),.25), -1.);
    float rr=min(ring,spoke); if(rr<d){ d=rr; m=102; } }
  // the Conductor's Seat
  vec3 s=p-SEAT;
  float plat=sdCylY(s-vec3(0.,-1.6,0.),3.6,.25)-.06; if(plat<d){ d=plat; m=103; }
  float arch=length(vec2(length(s.xy-vec2(0.,.6))-2.2, s.z+.6))-.12; arch=max(arch,-(s.y+1.4)); if(arch<d){ d=arch; m=104; }
  float sock=length(vec2(length(s.xy-vec2(0.,.6))-1.1, s.z+.62))-.09; if(sock<d){ d=sock; m=104; }
  float disc=max(abs(s.z+.68)-.04, length(s.xy-vec2(0.,.6))-1.05); if(disc<d){ d=disc; m=105; }
  return d;
}
vec3 coreSky(vec3 rd){
  // gravitational lensing around the black hole
  float th=acos(clamp(dot(rd,BHD),-1.,1.)); float rs=.035*uCore.w;
  vec3 dir=rd;
  if(uCore.w>.01 && th<.5){ vec3 ax=normalize(cross(BHD,rd)+1e-5); float bend=rs*rs*2.2/max(th,rs);
    float c=cos(bend), s=sin(bend); dir=rd*c+cross(ax,rd)*s+ax*dot(ax,rd)*(1.-c); }
  vec3 col=vec3(.01,.006,.02);
  col+=vec3(.25,.08,.12)*pow(fbm(dir*2.2+vec3(1.,4.,2.)),3.)*1.8+vec3(.06,.1,.3)*pow(fbm(dir*3.6+7.),3.)*1.4;
  vec3 c=floor(dir*260.); col+=vec3(.85,.9,1.)*step(.996,hash13(c))*1.1;
  if(uCore.w>.01){
    if(th<rs) col=vec3(0.);
    float az=atan(dot(rd,normalize(cross(BHD,vec3(0.,1.,0.)))), dot(rd,vec3(0.,1.,0.)));
    float ringR=abs(th-rs*1.6); float disk=exp(-ringR*90./uCore.w)*(1.+.6*sin(az*3.+uTime*2.));
    col+=vec3(1.,.6,.3)*disk*1.8*uCore.w + vec3(1.,.85,.6)*exp(-abs(th-rs*1.05)*400.)*uCore.w;
  }
  vec3 hd=normalize(HS); col+=vec3(1.,.75,.4)*pow(max(dot(rd,hd),0.),6.)*.08*uCore.x;
  return col;
}
void coreMat(int m, vec3 p, vec3 n, inout vec3 alb, inout vec3 em, inout float spec, inout float gloss){
  if(m==100){ vec3 q=normalize(p-HS); float f=fbm(q*4.+vec3(uTime*.03)); float g=fbm(q*11.-vec3(uTime*.05));
    float gran=pow(fbm(q*26.+vec3(uTime*.1)),2.); float limb=pow(max(dot(n,normalize(-(p-HS))*-1.),0.),.4);
    alb=vec3(0.); em=mix(vec3(1.,.38,.1),vec3(1.,.85,.55),f)*(.7+1.1*g+1.2*gran)*mix(.55,1.,limb)*uCore.x; }
  else if(m==101){ alb=vec3(.08,.1,.16); spec=1.4; gloss=140.; float face=abs(dot(n,normalize(HS-p)));
    em+=vec3(.25,.5,1.)*.35*face; vec2 g=fract(vec2(p.y*.6,p.x*.6+p.z*.6)); em+=vec3(1.,.8,.5)*step(.92,g.x)*.4; }
  else if(m==102){ alb=vec3(.6,.6,.66); spec=.8; em+=vec3(.3,.7,1.)*step(.9,fract(length(p-HS)*.2))*.6; }
  else if(m==103){ vec3 s=p-SEAT; float r=length(s.xz); alb=vec3(.1,.11,.16); spec=.8;
    em+=vec3(.3,.7,1.)*(1.-smoothstep(0.,.05,abs(r-3.2)))*(1.+uCore.z*2.); alb=mix(alb,vec3(.85,.65,.3),step(abs(fract(r*.8)-.5),.04)*step(r,3.)); }
  else if(m==104){ alb=vec3(.88,.66,.32); spec=1.2; gloss=80.; em+=vec3(1.,.75,.35)*(.15+uCore.z*1.2); }
  else if(m==105){ vec3 s=p-SEAT; vec2 cp=s.xy-vec2(0.,.6); float cd=length(cp)/1.05; float an=atan(cp.y,cp.x);
    alb=vec3(.02,.03,.05); spec=1.2;
    float r1=1.-smoothstep(0.,.03,abs(cd-.92)), r2=1.-smoothstep(0.,.03,abs(cd-.66)), r3=1.-smoothstep(0.,.03,abs(cd-.4)), core=1.-smoothstep(.12,.18,cd);
    float seg=step(.3,fract(an/6.2832*6.+uTime*.1));
    em+=(vec3(.3,.75,1.)*r1*seg+vec3(1.,.74,.36)*r2+vec3(.3,.75,1.)*r3+vec3(.85,.95,1.)*core)*(.35+uCore.z*2.6); }
}
vec3 coreGlow(vec3 ro, vec3 rd, float tmax){
  vec3 acc=glowPt(ro,rd,tmax+400.,HS,vec3(1.,.6,.3),.32*uCore.x,HR*1.1);
  acc+=glowPt(ro,rd,tmax,SEAT+vec3(0.,.6,-.6),vec3(.4,.8,1.),.35*uCore.z,1.4);
  return acc;
}
