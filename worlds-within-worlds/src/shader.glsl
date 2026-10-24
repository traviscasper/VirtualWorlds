#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uRes; uniform float uTime; uniform int uQuality;
uniform vec3 uCamPos, uCamFwd, uCamRight, uCamUp; uniform float uFovT, uProjMix, uPlanetScale; uniform float uEquirect, uStereo, uIPD;
uniform vec3 uArcPos; uniform mat3 uArcR, uHeadR;
uniform vec4 uMega, uMegaB;   // Mega-ARCHIVE: position, visible | yaw, scale, charge, unused
uniform vec4 uHelp;           // the worlds' help beams, light poured into Magnus, unused, unused
uniform vec3 uShL, uElL, uHaL, uShR, uElR, uHaR;
uniform vec4 uEyeA, uEyeB; uniform vec2 uEyePow, uMouth;
uniform float uPower, uThrust;
uniform vec3 uEyeLW, uEyeRW, uChestW, uFlameA, uFlameB;
uniform float uHall, uWindow, uGlitch, uMirror, uMirrorRot;
uniform vec3 uHC[3]; uniform vec3 uHN[3]; uniform vec3 uHU[3]; uniform vec2 uHS[3]; uniform vec3 uHA;
uniform vec4 uOrb; uniform float uOrbSpin, uOrbGlow, uOrbPulse;
uniform vec4 uPortal; uniform vec3 uPortalN; uniform float uPortalOpen;
uniform float uExposure, uFade;
uniform vec4 uPortalFX;                       // rim forming, arc 0..1, Verdance view, fixed normal
uniform vec4 uLoom, uLoomB; uniform vec3 uLoomHub; uniform vec3 uLoomN[14];  // the Loom memory
uniform vec3 uShelf;                          // shelf-orb trail: front, intensity, flare
uniform vec4 uTunnel;
uniform vec2 uEyeC;                           // design 1.0: concentric-ring eyes, question-mark eye
uniform vec2 uEmblem;                         // chest emblem activity, ring phase
uniform vec3 uRingW;                          // hover-ring centre (world)
uniform float uWorld; uniform float uMem;                         // 0 = the Archive hall, 1 = Verdance, ...                         // amount, gold, phase

#define PI 3.14159265
int gMat;

// ---------- noise ----------
float hash11(float p){ p=fract(p*.1031); p*=p+33.33; p*=p+p; return fract(p); }
float hash12(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float hash13(vec3 p3){ p3=fract(p3*.1031); p3+=dot(p3,p3.zyx+31.32); return fract((p3.x+p3.y)*p3.z); }
float vnoise(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(mix(hash13(i),hash13(i+vec3(1,0,0)),f.x), mix(hash13(i+vec3(0,1,0)),hash13(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash13(i+vec3(0,0,1)),hash13(i+vec3(1,0,1)),f.x), mix(hash13(i+vec3(0,1,1)),hash13(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float a=.5,s=0.; for(int i=0;i<5;i++){ s+=a*vnoise(p); p=p*2.03+vec3(1.7,9.2,3.1); a*=.5; } return s; }

// ---------- SDF primitives ----------
float sdE(vec3 p, vec3 r){ float k0=length(p/r); float k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
float sdCap(vec3 p, vec3 a, vec3 b, float r){ vec3 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h)-r; }
float sdBox(vec3 p, vec3 b){ vec3 q=abs(p)-b; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.); }
float sdCylY(vec3 p, float r, float h){ vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h); return min(max(d.x,d.y),0.)+length(max(d,0.)); }
float smin(float a,float b,float k){ float h=clamp(.5+.5*(b-a)/k,0.,1.); return mix(b,a,h)-k*h*(1.-h); }

// ---------- ARCHIVE (robot-local space, faces +Z) ----------
vec3 headLocal(vec3 pl){ vec3 pv=vec3(0.,.02,0.); return (pl-pv)*uHeadR+pv; }
float sdHeadShell(vec3 ph){ return sdE(ph-vec3(0.,.42,0.), vec3(.64,.52,.56)); }
// ARCHIVE character design 1.0: headphone ear pods, articulated arms with dark hands,
// Worlds Within Worlds chest emblem (shaded), hover-ring propulsion, gold accents.
float robot(vec3 pl){
  vec3 ph = headLocal(pl);
  float head = sdHeadShell(ph);
  float visor = sdE(ph-vec3(0.,.40,.115), vec3(.535,.37,.49));
  vec3 pe = ph-vec3(0.,.42,0.); pe.x = abs(pe.x)-.615;
  vec2 dq = abs(vec2(length(pe.yz), pe.x))-vec2(.16,.07);
  float ear = min(max(dq.x,dq.y),0.)+length(max(dq,0.))-.016;
  float d = head; int m = 6;
  if(visor<d){ d=visor; m=7; }
  if(ear<d){ d=ear; m=8; }
  float body = sdE(pl-vec3(0.,-.32,0.), vec3(.33,.34,.3));
  float base = sdE(pl-vec3(0.,-.62,0.), vec3(.15,.07,.15));
  body = smin(body, base, .05);
  if(body<d){ d=body; m=6; }
  // hover ring
  vec3 hq = pl-vec3(0.,-.79,0.);
  float hring = length(vec2(length(hq.xz)-.29, hq.y*1.4))/1.4-.034;
  if(hring<d){ d=hring; m=15; }
  // arms: white segments, dark joints and hands
  float arm = min(min(sdCap(pl,uShL,uElL,.064), sdCap(pl,uElL,uHaL,.058)),
                  min(sdCap(pl,uShR,uElR,.064), sdCap(pl,uElR,uHaR,.058)));
  arm = min(arm, min(length(pl-uShL)-.098, length(pl-uShR)-.098));
  if(arm<d){ d=arm; m=9; }
  vec3 dL = normalize(uHaL-uElL+vec3(1e-4)), dR = normalize(uHaR-uElR+vec3(1e-4));
  vec3 tL = normalize(cross(dL,vec3(0.,0.,1.))+vec3(1e-4)), tR = normalize(cross(dR,vec3(0.,0.,1.))+vec3(1e-4));
  float hand = min(sdCap(pl,uHaL-dL*.01,uHaL+dL*.075,.066), sdCap(pl,uHaR-dR*.01,uHaR+dR*.075,.066));
  hand = min(hand, min(length(pl-uHaL-tL*.06+dL*.01)-.033, length(pl-uHaR+tR*.06+dR*.01)-.033));
  hand = min(hand, min(length(pl-uElL)-.072, length(pl-uElR)-.072));
  if(hand<d){ d=hand; m=14; }
  gMat = m; return d;
}

// ---------- The Archive hall (world space) ----------
float hall(vec3 p){
  float d = p.y; int m = 1;
  float r = length(p.xz);
  float ped = sdCylY(p-vec3(0.,.35,0.), 1.1, .35)-.04;
  if(ped<d){ d=ped; m=5; }
  float ring = length(vec2(r-.86, p.y-.74))-.055;
  if(ring<d){ d=ring; m=13; }
  float dock = sdCylY(p-vec3(4.,.06,2.), .62, .06)-.02;
  if(dock<d){ d=dock; m=11; }
  float dome = 16.5-length(p-vec3(0.,-4.,0.));
  if(r>9.9){
    float sh = max(min(12.-r, dome), max(r-12.6, length(p-vec3(0.,-4.,0.))-17.1));
    vec3 pw = p-vec3(0.,5.,-12.);
    float win = sdBox(pw, vec3(4.3,2.9,2.));
    sh = max(sh, -win);
    if(sh<d){ d=sh; m=2; }
    float sec = 2.*PI/24.;
    float a = atan(p.z,p.x);
    float ai = floor(a/sec+.5);
    float aa = a-ai*sec;
    vec2 q = vec2(r*cos(aa), r*sin(aa));
    float winSector = step(abs(ai*sec+PI*.5), .5);
    if(winSector<.5){
      float col = length(q-vec2(11.25,0.))-.34;
      if(col<d){ d=col; m=3; }
      float sy = clamp(floor(p.y/1.5+.5),1.,5.);
      float yy = p.y-sy*1.5;
      float shelf = sdBox(vec3(q.x-11.45, yy, q.y), vec3(.62,.035,1.45));
      if(shelf<d){ d=shelf; m=4; }
      float qy = q.y-clamp(floor(q.y/.72+.5),-1.,1.)*.72;
      float orb = length(vec3(q.x-11.25, yy-.26, qy))-.2;
      if(orb<d){ d=orb; m=12; }
    }
  } else {
    if(dome<d){ d=dome; m=2; }
    d = min(d, 10.2-r);
  }
  gMat = m; return d;
}

int wid(){ return int(uWorld+.5); }
vec3 glowPt(vec3 ro, vec3 rd, float tmax, vec3 E, vec3 col, float I, float r);
vec3 glowLine(vec3 ro, vec3 rd, float tmax, vec3 A, vec3 B, vec3 col, float I, float r);
/*CHARACTERS*/
/*WORLDS*/
float map(vec3 p){
  float d; int m;
  int w=wid(); if(w==0){ d = hall(p); m = gMat; } else if(w==1){ d = verdance(p, m); } else if(w==2){ d = orrery(p, m); } else if(w==3){ d = forest(p, m); } else if(w==4){ d = ferrum(p, m); } else if(w==5){ d = thalassa(p, m); } else if(w==6){ d = loomNet(p, m); } else if(w==7){ d = lost(p, m); } else { d = coreWorld(p, m); }
  d = wardens(p, m, d);
  d = keystone(p, m, d);
  if(uTockVis>.5){ float tb=length(p-uTock.xyz)-.42; if(tb<d){ if(tb>.15) d=tb; else { int mt; float dt=tock(p,mt); if(dt<d){ d=dt; m=mt; } } } }
  vec3 pl = (p-uArcPos)*uArcR;
  float bs = length(pl)-1.15;
  if(bs<d){
    if(bs>.3){ d = bs; }
    else { float dr = robot(pl); if(dr<d){ d=dr; m=gMat; } }
  }
  // MEGA-ARCHIVE: a giant hard-light ARCHIVE that mirrors ARCHIVE's own pose (ARCHIVE pilots it from the chest)
  if(uMega.w>.5){ vec3 q=p-uMega.xyz; float b=length(q)-1.3*uMegaB.y; if(b>.5) d=min(d,b);
    else { float c=cos(-uMegaB.x), s=sin(-uMegaB.x); vec3 pm=vec3(c*q.x+s*q.z,q.y,-s*q.x+c*q.z)/uMegaB.y; float dm=robot(pm)*uMegaB.y; if(dm<d){ d=dm; m=116; } } }
  gMat = m; return d;
}

vec3 calcN(vec3 p, float e){ vec2 k=vec2(1.,-1.);
  return normalize(k.xyy*map(p+k.xyy*e)+k.yyx*map(p+k.yyx*e)+k.yxy*map(p+k.yxy*e)+k.xxx*map(p+k.xxx*e)); }

float march(vec3 ro, vec3 rd, float tmax, int steps){
  float t=.01, d=1.;
  for(int i=0;i<200;i++){ if(i>=steps) break; d=map(ro+rd*t); if(abs(d)<.0008*t+.0004) return t; t+=d*.92; if(t>tmax) return -1.; }
  return d<.06 ? t : -1.;
}
float softShadow(vec3 ro, vec3 rd, float tmax, int steps){
  float res=1., t=.04;
  for(int i=0;i<40;i++){ if(i>=steps) break; float h=map(ro+rd*t); res=min(res,9.*h/t); t+=clamp(h,.04,.7); if(res<.02||t>tmax) break; }
  return clamp(res,0.,1.);
}

// ---------- ARCHIVE face ----------
float eyeShape(vec2 uv, float s, float wink){
  float size=uEyeB.x, open=max(uEyeA.x,.03), happy=clamp(max(uEyeA.w,wink),0.,1.);
  vec2 c = vec2(s*.185+uEyeA.y*.05, .03+uEyeA.z*.04);
  float w=.082*size, h=.112*size*open;
  vec2 d = uv-c; float aa=.005;
  float fill = 1.-smoothstep(-aa,aa,(length(d/vec2(w,h))-1.)*min(w,h));
  float top1 = c.y+h*(1.-.8*uEyeB.y)+(d.x*s)*uEyeB.y*1.1;
  float top2 = c.y+h*(1.-.45*uEyeB.w)-(d.x*s)*uEyeB.w*.9;
  fill *= 1.-smoothstep(-aa,aa,uv.y-min(top1,top2));
  vec2 ac = d-vec2(0.,-.03*size);
  float ring = abs(length(ac)-w*1.05)-.021*size;
  float arc = (1.-smoothstep(-aa,aa,ring))*smoothstep(-.012,.012,ac.y+.004);
  float shape = mix(fill, arc, happy);
  // concentric-ring eyes (curiosity / analysis)
  float rg = uEyeC.x;
  if(rg>.01){
    float R = .1*size*mix(1.,open,.5); float rr = length(d); float an = atan(d.y,d.x);
    float outer = 1.-smoothstep(-aa,aa,abs(rr-R)-.017*size);
    float gap = step(.17, fract(an/(2.*PI)+uTime*.12*s));
    outer *= mix(1., gap, smoothstep(.85,.6,rg));
    float midR = (1.-smoothstep(-aa,aa,abs(rr-R*.58)-.01*size))*smoothstep(.65,1.,rg)*step(.25,fract(an/(2.*PI)*3.-uTime*.3*s));
    float core = 1.-smoothstep(-aa,aa,rr-R*.27);
    shape = mix(shape, max(max(outer,midR),core), smoothstep(.12,.45,rg));
  }
  // question-mark eye (confused)
  if(uEyeC.y>.01 && s>0.){
    vec2 qd = (uv-c)/size; float ar = abs(length(qd-vec2(0.,.035))-.045)-.014;
    ar = max(ar, -min(-qd.x, .035-qd.y)*1.);                     // open at the lower left
    float stem = sdBox(vec3(qd-vec2(0.,-.022),0.), vec3(.013,.022,1.));
    float dotq = length(qd-vec2(0.,-.075))-.017;
    float q = 1.-smoothstep(-aa,aa,min(min(ar,stem),dotq)*size);
    shape = mix(shape, q, uEyeC.y);
  }
  return shape;
}
float sparkle(vec2 uv, float s){
  float size=uEyeB.x, open=uEyeA.x;
  vec2 c = vec2(s*.185+uEyeA.y*.05, .03+uEyeA.z*.04)+vec2(-.028,.04*open)*size;
  return (1.-smoothstep(.012*size,.02*size,length(uv-c)))*(1.-clamp(uEyeA.w*2.,0.,1.))*step(.35,open)*(1.-smoothstep(.1,.35,uEyeC.x))*(1.-uEyeC.y*float(s>0.));
}
float mouthShape(vec2 uv){ // small, low, wide smile (design 1.0); opens only for big reactions
  vec2 m = uv-vec2(0.,-.175);
  float x = clamp(m.x,-.066,.066);
  float yc = uMouth.x*((x*x)/(.066*.066)-1.)*.024;
  float line = 1.-smoothstep(.006,.011,length(vec2(m.x-x,m.y-yc)));
  float oe = 1.-smoothstep(-.003,.003,(length((m+vec2(0.,.012*uMouth.y))/vec2(.06,.01+.03*uMouth.y))-1.)*.03); oe *= step(-.003,m.y+.012*uMouth.y+.01+.03*uMouth.y-.001)*1.;
  return mix(line, oe, smoothstep(.3,.55,uMouth.y));
}
vec3 faceEmit(vec2 uv){
  float l = eyeShape(uv,1.,0.)*uEyePow.x;
  float r = eyeShape(uv,-1.,uEyeB.z)*uEyePow.y;
  float sp = sparkle(uv,1.)*uEyePow.x + sparkle(uv,-1.)*uEyePow.y*(1.-uEyeB.z);
  float mo = mouthShape(uv)*min(uEyePow.x,uEyePow.y);
  vec3 blue = vec3(.07,.42,1.);
  return blue*(l+r)*2.2 + vec3(.8,.95,1.)*sp*2.4 + blue*mo*2.0;
}

// ---------- background: stars, nebula, planet seen through the window ----------
vec3 hallSky(vec3 rd){
  vec3 col = vec3(.004,.006,.016);
  float neb = fbm(rd*2.4+vec3(3.,1.,7.));
  col += vec3(.10,.05,.20)*pow(neb,3.)*1.6 + vec3(.02,.06,.16)*pow(fbm(rd*4.1),2.)*.9;
  vec3 c = floor(rd*260.); float h = hash13(c);
  if(h>.996){ vec3 f = fract(rd*260.)-.5; col += vec3(.8,.9,1.)*(1.-smoothstep(0.,.35,length(f)))*(h-.996)*250.; }
  vec3 PD = normalize(vec3(.22,.30,-1.)); float ang = .27;
  vec3 SD = normalize(vec3(1.,.55,.15));
  float cd = dot(rd,PD);
  float edge = acos(clamp(cd,-1.,1.));
  if(edge<ang){
    vec3 cen = PD*100.; float R = 100.*sin(ang);
    float b = dot(-cen,rd); float cc = dot(cen,cen)-R*R; float hh = b*b-cc;
    vec3 p = rd*(-b-sqrt(max(hh,0.)));
    vec3 n = normalize(p-cen);
    vec3 nr = vec3(n.x*cos(uTime*.01)-n.z*sin(uTime*.01), n.y, n.x*sin(uTime*.01)+n.z*cos(uTime*.01));
    float land = smoothstep(.5,.56,fbm(nr*2.2));
    vec3 surf = mix(vec3(.02,.09,.24), mix(vec3(.10,.30,.12),vec3(.45,.40,.28),fbm(nr*5.)), land);
    float cl = smoothstep(.5,.75,fbm(nr*3.5+vec3(uTime*.004)));
    surf = mix(surf, vec3(.9), cl*.8);
    float dif = max(dot(n,SD),0.);
    vec3 night = vec3(1.,.7,.35)*land*step(.62,hash13(floor(nr*90.)))*smoothstep(.1,-.1,dot(n,SD))*.6;
    col = surf*dif*1.4 + night + vec3(.3,.55,1.)*pow(1.-max(dot(n,-rd),0.),3.)*1.3*(.3+dif);
  } else {
    col += vec3(.25,.5,1.)*exp(-(edge-ang)*60.)*.9;
  }
  return col;
}

vec3 sky(vec3 rd){ int w=wid(); return w==0 ? hallSky(rd) : (w==1 ? verdanceSky(rd) : (w==2 ? orrerySky(rd) : (w==3 ? forestSky(rd) : (w==4 ? ferrumSky(rd) : (w==5 ? thalassaSky(rd) : (w==6 ? netSky(rd) : (w==7 ? lostSky(rd) : coreSky(rd)))))))); }
vec3 envApprox(vec3 d){
  if(wid()>0) return sky(d)*.8;
  vec3 c = mix(vec3(.015,.02,.035), vec3(.04,.05,.08)+uHall*vec3(.16,.15,.14), smoothstep(-.35,.5,d.y));
  c += vec3(.55,.7,1.)*uWindow*smoothstep(.75,.95,-d.z)*smoothstep(-.1,.2,d.y)*1.4;
  c += vec3(1.,.8,.55)*uHall*smoothstep(.6,1.,d.y)*.5;
  c += vec3(1.,.75,.4)*uOrbGlow*.25*smoothstep(.0,-.6,d.y);
  return c;
}

// ---------- shading ----------
const vec3 KDIR = normalize(vec3(.22,.5,-1.));
const vec3 FDIR = normalize(vec3(-.35,1.,.55));

vec3 shade(vec3 p, vec3 n, vec3 rd, int m, bool lite){
  vec3 alb = vec3(.5); float spec=.3, gloss=32.; vec3 em = vec3(0.); float refl=0.;
  float r = length(p.xz);
  if(m==1){
    alb = vec3(.022,.026,.038); spec=.6; gloss=90.; refl=.55;
    float rings = 0.;
    for(int i=0;i<3;i++){ float fi=float(i); float R=2.4+fi*2.6;
      rings += (1.-smoothstep(.0,.035,abs(r-R)))*smoothstep(fi*.25,fi*.25+.2,uHall); }
    em += mix(vec3(1.,.72,.35),vec3(.25,.6,1.),step(3.,r))*rings*1.6;
    vec2 g = abs(fract(p.xz*.5)-.5);
    em += vec3(.1,.3,.6)*(1.-smoothstep(.0,.02,min(g.x,g.y)))*.18*uHall*smoothstep(10.5,3.,r);
    em += vec3(.25,.6,1.)*(1.-smoothstep(.0,.05,abs(r-11.7)))*uHall*1.2;
  } else if(m==2){
    alb = vec3(.06,.07,.095); spec=.2;
    if(p.y>8.5){ float rr = length(p.xz);
      em += vec3(.25,.55,1.)*(1.-smoothstep(.0,.06,abs(fract(rr*.33)-.5)*3.))*.25*uHall;
      em += vec3(1.,.78,.45)*(1.-smoothstep(1.4,1.6,rr))*uHall*.9; }
    em += vec3(.25,.6,1.)*(1.-smoothstep(.0,.06,abs(p.y-.25)))*uHall*.8;
  } else if(m==3){
    alb = vec3(.55,.58,.64); spec=.5; gloss=60.;
    float a = atan(p.z,p.x); float sec=2.*PI/24.; float aa = a-floor(a/sec+.5)*sec;
    float strip = 1.-smoothstep(.02,.05,abs(aa*r));
    em += vec3(.3,.65,1.)*strip*step(r,11.)*uHall*1.5*(.6+.4*sin(p.y*1.3-uTime*.8));
  } else if(m>=20 && m<=34){ verdanceMat(m,p,n,alb,em,spec,gloss); if(m==21) refl=.7;
  } else if(m>=40 && m<=49){ orreryMat(m,p,n,alb,em,spec,gloss);
  } else if(m>=50 && m<=59){ forestMat(m,p,n,alb,em,spec,gloss);
  } else if(m>=60 && m<=69){ ferrumMat(m,p,n,alb,em,spec,gloss); if(m==60) refl=.35;
  } else if(m>=70 && m<=79){ thalassaMatU(m,p,n,alb,em,spec,gloss);
  } else if(m>=90 && m<=99){ lostMat(m,p,n,alb,em,spec,gloss);
  } else if(m>=100 && m<=109){ coreMat(m,p,n,alb,em,spec,gloss);
  } else if(m>=110 && m<=112){ wardenMat(m,p,alb,em,spec,gloss);
  } else if(m==116){ vec3 q=(p-uMega.xyz)/uMegaB.y; alb=vec3(.02,.06,.1); spec=1.2; gloss=90.;
    float grid=max(smoothstep(.03,0.,abs(fract(q.y*6.)-.5)-.44),smoothstep(.03,0.,abs(fract(atan(q.z,q.x)*3.)-.5)-.45));
    float scan=step(.5,fract(q.y*2.-uTime*1.5));
    em=vec3(.3,.8,1.)*(.3+.25*scan+grid*1.4)*uMegaB.z+vec3(1.,.8,.45)*smoothstep(.12,.0,abs(length(q.xy-vec2(0.,-.29))-.1))*step(.15,q.z)*2.*uMegaB.z;
  } else if(m==113){ alb=vec3(.9,.7,.3); spec=1.6; gloss=150.; em=mix(vec3(1.,.8,.4),vec3(.4,.9,1.),.5+.5*sin(uTime*3.+p.y*8.))*(1.6+uKeyB.y);
  } else if(m==4){ alb = vec3(.1,.11,.14); spec=.4;
  } else if(m==12){
    float a = atan(p.z,p.x); vec3 cid = floor(vec3(a*30., p.y*.7, 1.));
    float h = hash13(cid);
    vec3 oc = mix(vec3(.25,.6,1.), mix(vec3(1.,.7,.35), vec3(.7,.4,1.), step(.7,h)), step(.45,h));
    alb = vec3(.04); spec=.9; gloss=120.;
    em += oc*(.08+uHall*(.35+.45*h)*(.7+.3*sin(uTime*(.5+h)+h*30.)));
    float sP = .4-a;
    float lit = step(-.03,sP)*(1.-smoothstep(uShelf.x-.015,uShelf.x+.03,sP));
    float fr0 = exp(-pow((sP-uShelf.x)*12.,2.))*step(0.,uShelf.x);
    em += vec3(1.,.86,.58)*(lit*1.4+fr0*4.)*uShelf.y + mix(oc,vec3(1.,.9,.7),.5)*uShelf.z*2.4*(.6+.4*h);
  } else if(m==5){ alb = vec3(.62,.64,.68); spec=.5; gloss=60.;
  } else if(m==13){ alb = vec3(.4,.35,.25); em += vec3(1.,.75,.4)*(uHall*.35+uOrbGlow*2.2);
  } else if(m==11){ alb = vec3(.09,.1,.13); spec=.5;
    vec2 dk = p.xz-vec2(4.,2.); em += vec3(.25,.6,1.)*(1.-smoothstep(.0,.03,abs(length(dk)-.5)))*(.25+uPower*1.2);
  } else {
    vec3 pl = (p-uArcPos)*uArcR; vec3 ph = headLocal(pl);
    alb = vec3(.86,.88,.92); spec=.6; gloss=70.;
    if(m==7){
      alb = vec3(.004,.005,.009); spec=1.2; gloss=180.; refl=.6;
      if(ph.z>.2) em += faceEmit(ph.xy-vec2(0.,.40))*uPower;
      float rim = 1.-smoothstep(.0,.006,abs(sdHeadShell(ph)));
      em += vec3(.25,.65,1.)*rim*.5*uPower;
    } else if(m==8){
      vec3 pe = ph-vec3(0.,.42,0.); float er = length(pe.yz); float face = step(.66,abs(ph.x));
      float ringE = (1.-smoothstep(.0,.016,abs(er-.1)))*face;
      float ringI = (1.-smoothstep(.0,.01,abs(er-.055)))*face;
      float goldR = (1.-smoothstep(.0,.012,abs(er-.15)))*face;
      alb = mix(vec3(.86,.88,.92), vec3(.9,.68,.32), goldR); spec=.9;
      if(er<.13) alb = mix(alb, vec3(.03,.05,.09), face);
      em += vec3(.25,.65,1.)*(ringE*2.6+ringI*1.6)*uPower + vec3(1.,.72,.35)*goldR*.25;
    } else if(m==14){
      alb = vec3(.05,.055,.07); spec=.9; gloss=90.;
    } else if(m==15){
      vec3 hq = pl-vec3(0.,-.79,0.); float an = atan(hq.z,hq.x);
      float dash = step(.3, fract(an/(2.*PI)*16.+uEmblem.y*2.5));
      alb = vec3(.05,.07,.1);
      em += vec3(.3,.78,1.)*(.5+.5*dash)*(.9+uThrust*2.4)*uPower;
    } else if(m==6 || m==9){
      if(pl.z>.12 && m==6 && pl.y<-.05){ // Worlds Within Worlds emblem: three nested rings
        vec2 cp = vec2(pl.x,pl.y+.29); float cd = length(cp); float an = atan(cp.y,cp.x);
        float act = uEmblem.x, ph0 = uEmblem.y;
        float r1 = 1.-smoothstep(.0,.009,abs(cd-.138));
        float r2 = 1.-smoothstep(.0,.013,abs(cd-.1));
        float r3 = 1.-smoothstep(.0,.008,abs(cd-.062));
        float core = 1.-smoothstep(.022,.03,cd);
        float seg1 = step(.3, fract(an/(2.*PI)*6.+ph0));
        float seg3 = step(.28, fract(-an/(2.*PI)*3.+ph0*1.7));
        float tick = (1.-smoothstep(.0,.01,abs(cd-.119)))*step(.82,fract(an/(2.*PI)*12.-ph0*.6));
        if(cd<.152){ alb = vec3(.025,.035,.06); spec=1.2; gloss=140.; }
        alb = mix(alb, vec3(.92,.7,.34), r2);
        vec3 bl = vec3(.3,.75,1.), gd = vec3(1.,.74,.36);
        em += (bl*r1*(.7+.7*seg1) + gd*r2*(1.1+.9*act) + bl*r3*(.4+1.2*seg3) + vec3(.85,.95,1.)*core*2.4 + gd*tick*1.2)*(1.+act*1.6)*uPower;
      }
      if(m==6 && abs(sdHeadShell(ph))<.02 && abs(ph.x)<.012 && ph.y>.62){ alb = vec3(.92,.7,.34); spec=1.; }
      if(pl.y<-.6 && m==6){ alb = vec3(.16,.17,.2);
        em += vec3(.3,.7,1.)*(1.-smoothstep(.0,.03,abs(length(pl.xz)-.08)))*step(pl.y,-.64)*(1.+uThrust*2.); }
      if(m==6 && abs(pl.y+.06)<.01 && length(pl.xz)>.2) em += vec3(.25,.6,1.)*.6*uPower;
    }
  }
  vec3 col = vec3(0.);
  int w=wid(); bool outdoor = w==1||w==3||w==5; vec3 LD = outdoor ? (w==5 ? SUN_T : SUN) : (w==2 ? normalize(ORR_C-p) : (w==4 ? normalize(vec3(.3,.85,.25)) : (w==6 ? normalize(vec3(-.25,.5,.35)) : (w==7 ? normalize(vec3(.3,.8,.2)) : (w==8 ? normalize(HS-p) : KDIR)))));
  float kd = max(dot(n,LD),0.);
  float sh = 1.;
  if(!lite && kd>0. && uQuality>0) sh = softShadow(p+n*.01, LD, w==8?length(HS-p)-HR-1.:outdoor||w==4||w==7?40.:(w==2?length(ORR_C-p)-2.3:14.), 28);
  vec3 kcol = outdoor ? (w==5 ? vec3(1.,.66,.42)*2.4*uThal.x+vec3(.25,.32,.6)*.35*(1.-uThal.x) : vec3(1.,.84,.64)*2.2) : (w==2 ? vec3(1.,.8,.55)*(1.6+uOrr.y)*(1.2/(1.+length(ORR_C-p)*.03)) : (w==4 ? vec3(.3,.34,.55)*.45 : (w==6 ? vec3(.5,.65,1.)*.9 : (w==7 ? vec3(.45,.3,.6)*.5+vec3(.8,.75,1.)*uLost.x*2.4 : (w==8 ? vec3(1.,.72,.42)*1.5*uCore.x : vec3(.62,.74,1.)*(.18+uWindow*1.1))))));
  vec3 fcol = outdoor ? vec3(.35,.5,.8)*.35 : (w==2 ? vec3(.35,.3,.8)*.35 : (w==4 ? vec3(.5,.15,.15)*.25 : (w==6 ? vec3(1.,.75,.4)*.45 : (w==7 ? vec3(1.,.7,.35)*(.15+uLost.w*.6) : (w==8 ? vec3(.35,.45,.9)*.3 : vec3(1.,.8,.58)*uHall*.85)))));
  float fd = max(dot(n,FDIR),0.);
  vec3 amb = outdoor ? (w==5 ? mix(vec3(.04,.06,.12),vec3(.2,.24,.36),uThal.x) : vec3(.2,.28,.42)) : (w==2 ? vec3(.07,.05,.13) : (w==4 ? vec3(.05,.04,.07) : (w==6 ? vec3(.06,.08,.15) : (w==7 ? vec3(.07,.04,.08) : (w==8 ? vec3(.06,.05,.1) : vec3(.025,.032,.055)+uHall*vec3(.07,.075,.09))))));
  float occ = 1.;
  if(!lite && uQuality>0){ float ao=0., sc=1.; for(int i=1;i<4;i++){ float hh=.06*float(i); ao+=(hh-map(p+n*hh))*sc; sc*=.6; } occ=clamp(1.-ao*3.,0.,1.); }
  col += alb*(kcol*kd*sh + fcol*fd + amb*(.6+.4*n.y))*occ;
  if(w==4) col += alb*ferrumLights(p,n)*occ;
  if(uOrbGlow>0.){ vec3 lv = uOrb.xyz-p; float ld=length(lv); lv/=ld;
    col += alb*vec3(1.,.78,.5)*uOrbGlow*max(dot(n,lv),0.)*1.6/(1.+ld*ld*.8); }
  if((m>=6 && m<=9) || m==14 || m==15){
    col += alb*vec3(.55,.62,.75)*(.22+.18*(1.-uHall))*max(dot(n,-rd)*.6+.4,0.)*occ;
    col += vec3(.35,.65,1.)*pow(1.-max(dot(n,-rd),0.),3.)*.35*(m==7?.3:1.);
  }
  vec3 h = normalize(LD-rd);
  col += kcol*spec*pow(max(dot(n,h),0.),gloss)*sh*kd*1.5;
  col += fcol*spec*.5*pow(max(dot(n,normalize(FDIR-rd)),0.),gloss)*.6;
  float fr = pow(1.-max(dot(n,-rd),0.),4.);
  if((m>=6 && m<=9) || m==14 || m==15) col += envApprox(reflect(rd,n))*(m==7?(.05+fr*.7):(.06+fr*.5))*occ;
  col += em;
  return col;
}

// ---------- analytic extras ----------
vec2 sph(vec3 ro, vec3 rd, vec4 s){ vec3 oc=ro-s.xyz; float b=dot(oc,rd); float c=dot(oc,oc)-s.w*s.w; float h=b*b-c; if(h<0.) return vec2(-1.); h=sqrt(h); return vec2(-b-h,-b+h); }

vec3 glowPt(vec3 ro, vec3 rd, float tmax, vec3 E, vec3 col, float I, float r){
  float tc = clamp(dot(E-ro,rd),0.,tmax); float d = length(ro+rd*tc-E);
  return col*I*(exp(-d*d/(r*r))*.55 + .06*r*r/(d*d+r*r));
}
vec3 glowSeg(vec3 ro, vec3 rd, float tmax, vec3 A, vec3 B, vec3 col, float I, float r){
  vec3 acc=vec3(0.); for(int i=0;i<4;i++){ float f=float(i)/3.; acc += glowPt(ro,rd,tmax,mix(A,B,f),col,I*(1.-f*.7),r*(1.-f*.4)); } return acc*.5;
}

vec4 orbShade(vec3 ro, vec3 rd, float tHit, vec3 behind){
  vec2 s = sph(ro,rd,uOrb);
  if(s.x<0. || s.x>tHit) return vec4(behind,0.);
  vec3 p = ro+rd*s.x; vec3 n = normalize(p-uOrb.xyz);
  float fr = pow(1.-max(dot(n,-rd),0.),3.);
  vec3 col = behind*.45;
  float pr = uOrb.w*.6;
  vec2 s2 = sph(ro,rd,vec4(uOrb.xyz,pr));
  float cs=cos(uOrbSpin), sn=sin(uOrbSpin);
  if(s2.x>0.){
    vec3 q = ro+rd*s2.x; vec3 np = normalize(q-uOrb.xyz);
    vec3 nr = vec3(np.x*cs-np.z*sn, np.y, np.x*sn+np.z*cs);
    float land = smoothstep(.48,.53,fbm(nr*2.6+7.));
    vec3 surf = mix(vec3(.03,.18,.45), mix(vec3(.12,.45,.18), vec3(.55,.5,.32), smoothstep(.6,.75,fbm(nr*6.))), land);
    float cl = smoothstep(.55,.78,fbm(nr*4.+vec3(uTime*.05)));
    surf = mix(surf, vec3(.95), cl*.7);
    float li = .45+.55*max(dot(np,normalize(vec3(.4,.6,.7))),0.);
    vec3 city = vec3(1.,.8,.4)*land*step(.86,hash13(floor(nr*55.)))*1.5;
    col = surf*li*(.5+uOrbGlow*.8) + city*(.3+uOrbGlow) + vec3(.35,.65,1.)*pow(1.-max(dot(np,-rd),0.),2.5)*1.2;
  }
  float ty = (uOrb.y-ro.y)/rd.y;
  if(ty>s.x && ty<s.y+.001){ vec3 q=ro+rd*ty-uOrb.xyz; float rr=length(q.xz)/uOrb.w;
    col += vec3(1.,.78,.42)*(1.-smoothstep(.0,.02,abs(rr-.82)))*(.6+uOrbGlow*1.5)*(.6+.4*sin(atan(q.z,q.x)*6.+uTime*2.)); }
  col += (s.y-s.x)/(2.*uOrb.w)*vec3(.25,.5,1.)*.25*(.4+uOrbGlow);
  col += envApprox(reflect(rd,n))*(.08+fr*.9) + vec3(.5,.75,1.)*fr*.25;
  col += vec3(1.,.9,.7)*pow(max(dot(reflect(rd,n),KDIR),0.),120.)*1.5;
  col += vec3(1.,.85,.6)*uOrbPulse*.8;
  return vec4(col,1.);
}

vec3 holoContent(vec2 p, vec2 S, int i, float act){
  vec2 pp = p*S;
  float gl = (i==1)?uGlitch:0.;
  p.x += (hash11(floor(p.y*18.)+floor(uTime*30.))-.5)*gl*.5;
  float a = .05;
  float edge = max(abs(p.x),abs(p.y));
  a += smoothstep(.965,.985,edge)*1.4;
  vec2 g = abs(fract(p*vec2(9.,6.))-.5);
  a += (1.-smoothstep(0.,.05,min(g.x,g.y)))*.06;
  vec3 col = vec3(.25,.72,1.);
  float mir = (i==1)?uMirror:0.;
  if(mir<.5){
    if(p.x<-.1){ float row=floor((p.y+1.)*7.); float fy=fract((p.y+1.)*7.);
      float w = hash11(row+float(i)*13.+floor(uTime*1.3)*.37);
      a += step((p.x+.92)/.8, w)*step(.25,fy)*step(fy,.7)*.55*step(-.92,p.x); }
    vec2 rc = pp-vec2(S.x*.45,0.); float rr = length(rc); float ang = atan(rc.y,rc.x);
    a += (1.-smoothstep(.0,.012,abs(rr-.24)))*.9;
    a += (1.-smoothstep(.0,.02,abs(rr-.16)))*step(.5,fract(ang/(2.*PI)*3.+uTime*.3+float(i)))*.9;
    col = mix(col, vec3(1.,.78,.4), (1.-smoothstep(.0,.03,abs(rr-.16)))*.6);
  } else {
    a += .25;
    float cr=cos(uMirrorRot), sr=sin(uMirrorRot);
    vec2 f = vec2(-pp.x, pp.y)/ (S.y*2.4);
    f = vec2(f.x*cr-f.y*sr, f.x*sr+f.y*cr)+vec2(0.,.0);
    col = mix(col, vec3(.02,.05,.1), .7);
    col += faceEmit(f)*1.1;
  }
  col = mix(col, vec3(1.,.4,.9), gl*.6) + vec3(1.)*gl*.3;
  float flick = .75+.25*hash11(floor(uTime*24.)+float(i)*7.);
  float scan = .82+.18*sin(p.y*S.y*220.);
  return col*a*flick*scan*act;
}

// a glimpse of Verdance, the First World, through the open portal
vec3 verdanceView(vec2 v){
  vec3 sky = mix(vec3(1.,.78,.5), vec3(.42,.68,1.), smoothstep(-.2,.9,v.y));
  sky += vec3(1.,.92,.65)*exp(-length(v-vec2(-.25,.12))*5.)*1.6;
  float x=v.x*6.; float b=floor(x); float h=-.18+hash11(b*3.7)*.5+(abs(b)<1.5?.25:0.);
  float tower=step(v.y,h)*step(.12,fract(x))*step(fract(x),.86);
  vec3 tc = mix(vec3(.62,.72,.9), vec3(.32,.42,.6), smoothstep(-.6,.5,v.y));
  float terr = step(.5,fract(v.y*14.))*tower;                    // green terraces on the towers
  tc = mix(tc, vec3(.25,.6,.3), terr*.55);
  tc += vec3(1.,.85,.55)*step(.7,hash12(floor(v*vec2(60.,80.))))*tower*.35;
  float x2=v.x*11.; float h2=-.42+hash11(floor(x2)*7.1)*.2;
  vec3 c = sky; c = mix(c, tc, tower*.92);
  c = mix(c, vec3(.18,.42,.26), step(v.y,h2));                   // parks in the foreground
  float canal = step(v.y,-.5);
  c = mix(c, mix(vec3(.3,.5,.75),sky*.7,.5)+vec3(.3)*step(.8,fract(v.x*30.+uTime*.3)), canal);
  return c;
}
// a glimpse of the Orrery (Chapter 3): miniature worlds floating in violet space
vec3 orreryView(vec2 v){
  vec3 c = mix(vec3(.08,.04,.18), vec3(.25,.12,.4), smoothstep(-1.,1.,v.y+v.x*.3));
  c += vec3(.8,.85,1.)*step(.985,hash12(floor(v*90.)));
  for(int i=0;i<6;i++){ float fi=float(i); vec2 pc2=vec2(sin(fi*2.3+uTime*.1),cos(fi*1.7))*.55; float rr=.05+.05*hash11(fi*3.1);
    float dd=length(v-pc2); vec3 pcol=mix(vec3(.3,.6,1.),vec3(1.,.7,.35),hash11(fi*7.3));
    c = mix(c, pcol*(.6+.5*(1.-dd/rr)), 1.-smoothstep(rr-.01,rr,dd)); c += pcol*exp(-max(dd-rr,0.)*30.)*.3; }
  return c;
}
vec3 pCol = vec3(0.); float pAlpha = 0.;
vec3 portalShade(vec3 ro, vec3 rd, float tHit){
  pAlpha = 0.;
  float act = max(uPortalOpen, uPortalFX.x);
  if(act<=.001) return vec3(0.);
  float dn = dot(rd,uPortalN); if(abs(dn)<1e-4) return vec3(0.);
  float t = dot(uPortal.xyz-ro,uPortalN)/dn; if(t<0. || t>tHit) return vec3(0.);
  vec3 q = ro+rd*t-uPortal.xyz;
  vec3 U = normalize(cross(uPortalN, vec3(0.,0.,1.)+vec3(1e-3)));
  U = abs(uPortalN.y)<.9 ? vec3(0.,1.,0.) : U;
  vec3 Rt = normalize(cross(U,uPortalN)); U = cross(uPortalN,Rt);
  vec2 pc = vec2(dot(q,Rt),dot(q,U)); float R = uPortal.w*uPortalOpen;
  float rr = length(pc)/uPortal.w;
  vec3 col = vec3(0.);
  if(uPortalOpen>.001){
    float r = length(pc)/max(R,1e-3); float a = atan(pc.y,pc.x);
    if(r<1.15){
      float sw = fbm(vec3(a*2.+log(max(r,.01))*3.-uTime*1.5, r*3., uTime*.25));
      vec3 inner = mix(vec3(.15,.4,1.), vec3(1.,.75,.4), smoothstep(.45,.8,sw))*(.6+sw);
      inner = mix(inner, vec3(.85,.92,1.)*1.6, smoothstep(.35,.0,r)*(1.-uPortalFX.z));
      vec2 vq = pc/uPortal.w*1.15;
      if(uPortalFX.z<=1.) inner = mix(inner, verdanceView(vq)*1.25, uPortalFX.z*smoothstep(.98,.55,r));
      else if(uPortalFX.z<=2.) inner = mix(inner, orreryView(vq)*1.3, clamp(uPortalFX.z-1.,0.,1.)*smoothstep(.98,.55,r));
      else if(uPortalFX.z<=3.) inner = mix(inner, ferrumView(vq)*1.3, clamp(uPortalFX.z-2.,0.,1.)*smoothstep(.98,.55,r));
      else inner = mix(inner, thalassaView(vq)*1.3, clamp(uPortalFX.z-3.,0.,1.)*smoothstep(.98,.55,r));
      float rim = (1.-smoothstep(.0,.06,abs(r-1.)))*2.5;
      col += vec3(.4,.75,1.)*rim; pAlpha = step(r,1.)*smoothstep(1.,.97,r); pCol = inner*1.3;
    }
  }
  if(uPortalFX.x>.001 && rr<1.3){ // the ring being traced in the window
    float ang01 = fract(atan(pc.x,pc.y)/(2.*PI)+1.);
    float arcM = step(ang01, uPortalFX.y);
    col += vec3(.55,.85,1.)*(1.-smoothstep(.0,.03,abs(rr-1.)))*2.4*arcM*uPortalFX.x;
    col += vec3(1.,.8,.5)*exp(-abs(rr-1.)*14.)*.35*arcM*uPortalFX.x;
    float ta = uPortalFX.y*2.*PI; vec2 tip = uPortal.w*vec2(sin(ta),cos(ta));
    float spk = exp(-length(pc-tip)*7.)*(1.-step(.999,uPortalFX.y));
    col += vec3(1.,.9,.7)*spk*3.*uPortalFX.x*(.7+.3*sin(uTime*60.));
  }
  return col;
}
// analytic glow along a segment (closest approach between the ray and the segment)
vec3 glowLine(vec3 ro, vec3 rd, float tmax, vec3 A, vec3 B, vec3 col, float I, float r){
  vec3 ba=B-A, w=ro-A; float baba=dot(ba,ba), bard=dot(ba,rd), baw=dot(ba,w), rdw=dot(rd,w);
  float den=max(baba-bard*bard,1e-6); float h=clamp((baw-bard*rdw)/den,0.,1.);
  float tt=clamp(bard*h-rdw,0.,tmax); vec3 d3=w+rd*tt-ba*h; float d2=dot(d3,d3);
  return col*I*(exp(-d2/(r*r))*.6 + .03*r*r/(d2+r*r));
}
// the Loom memory: 14 worlds, a ring of threads, cross-links and hub spokes
vec3 loomShade(vec3 ro, vec3 rd, float tmax){
  vec3 acc=vec3(0.);
  vec3 P = uLoomN[int(uLoomB.z)];
  float flick = .5+.5*sign(sin(uTime*38.));
  for(int i=0;i<14;i++){
    vec3 Ni=uLoomN[i];
    float bi = 1.; if(i==9) bi=1.-.9*smoothstep(.95,1.,uLoom.w); if(i==2) bi=1.-.9*smoothstep(.95,1.,uLoomB.x);
    float pul = uLoom.z*exp(-pow((length(Ni-P)-uLoom.y)*1.6,2.));
    vec3 nc = (i%3==0)?vec3(1.,.75,.4):((i%3==1)?vec3(.35,.7,1.):vec3(.7,.5,1.));
    acc += glowPt(ro,rd,tmax,Ni,nc,(.55+pul*2.2)*bi,.13);
    for(int e=0;e<2;e++){
      int j = (e==0)?(i+1)%14:(i+4)%14; vec3 Nj=uLoomN[j];
      float br = 0.; vec3 lc = vec3(.4,.72,1.);
      float s9 = (i==9||j==9)?uLoom.w:0., s2=(i==2||j==2)?uLoomB.x:0.; float s=max(s9,s2);
      float alive = s>=.999?0.:1.-smoothstep(.3,.95,s)*flick;
      lc = mix(lc, vec3(1.,.18,.12), smoothstep(0.,.4,s));
      float pm = uLoom.z*exp(-pow((length((Ni+Nj)*.5-P)-uLoom.y)*1.6,2.));
      acc += glowLine(ro,rd,tmax,Ni,Nj,lc+vec3(1.,.9,.6)*pm*2.,(.16+pm*.9)*alive,.035);
    }
    if(uLoomB.w>.01) acc += glowLine(ro,rd,tmax,uLoomHub,Ni,vec3(.6,.85,1.),.25*uLoomB.w,.03);
  }
  return acc*uLoom.x;
}
// the transit tunnel (screen-space; ARCHIVE stays rendered in front of it)
vec3 tunnelCol(vec3 rd){
  vec3 Z=vec3(0.,0.,-1.); float c=dot(rd,Z); vec3 pr=rd-Z*c;
  float rad=max(length(pr),1e-3); float z=abs(c)/rad; float ph=atan(pr.y,pr.x);
  float zz=z*.9+uTunnel.z;
  float st=fbm(vec3(ph*2.6, zz*.5, 0.)); float st2=fbm(vec3(ph*7., zz*1.4, 3.));
  vec3 base=mix(vec3(.12,.35,1.), vec3(1.,.72,.35), uTunnel.y);
  vec3 alt =mix(vec3(.75,.45,1.), vec3(1.,.95,.75), uTunnel.y);
  vec3 col=base*pow(st,2.5)*2.6 + alt*pow(st2,4.)*2.2;
  col += vec3(.7,.85,1.)*pow(.5+.5*sin(zz*5.),14.)*.5;
  vec2 g=vec2(ph*12./PI, zz*2.); col += vec3(1.)*step(.985,hash12(floor(g)))*smoothstep(.5,.0,length(fract(g)-.5))*1.5;
  col += mix(vec3(.6,.8,1.),vec3(1.,.9,.7),uTunnel.y)*exp(-rad*5.)*(c>0.?1.6+uTunnel.y*1.4:.5);
  return col;
}
vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.); }

void main(){
  vec2 uv = (gl_FragCoord.xy*2.-uRes)/uRes.y;
  vec3 rdP = normalize(uCamFwd + uFovT*(uv.x*uCamRight + uv.y*uCamUp));
  vec2 q = uv*uPlanetScale; float qr = length(q);
  float th = 2.*atan(qr*.5);
  vec3 hor = qr>1e-5 ? (q.x*uCamRight+q.y*uCamUp)/qr : uCamRight;
  vec3 rdS = normalize(uCamFwd*cos(th)+hor*sin(th));
  vec3 rd = normalize(mix(rdP, rdS, uProjMix));
  vec3 ro = uCamPos;
  if(uEquirect>.5){ // 360: the centre of the frame is always the film camera's forward direction
    vec2 e=gl_FragCoord.xy/uRes; float eye=0.;
    if(uStereo>.5){ eye = e.y>.5 ? -1. : 1.; e.y = fract(e.y*2.); }   // VR 3D: left eye on top, right eye below
    float lon=(e.x-.5)*6.2831853, lat=(e.y-.5)*3.1415927;
    rd=normalize(cos(lat)*sin(lon)*uCamRight + sin(lat)*uCamUp + cos(lat)*cos(lon)*uCamFwd);
    if(eye!=0.) ro = uCamPos + eye*uIPD*.5*(cos(lon)*uCamRight - sin(lon)*uCamFwd); }   // omni-directional stereo

  int steps = wid()>0 ? (uQuality>0 ? 200 : 110) : (uQuality>0 ? 150 : 80);
  float tmax = wid()==8 ? 400. : (wid()>0 ? 170. : 60.);
  float t = march(ro, rd, tmax, steps);
  vec3 col; float tHit = t>0. ? t : tmax;
  if(t>0.){
    vec3 p = ro+rd*t; map(p); int m = gMat;
    vec3 n = calcN(p, .0012*max(1.,t*.3));
    col = shade(p,n,rd,m,false);
    if((m==21 || m==51) && wid()>0){ n = normalize(n+vec3(fbm(p*1.6+vec3(uTime*.4,0.,uTime*.3))-.5,0.,fbm(p*1.6+vec3(3.,uTime*.35,0.))-.5)*.12); }
    if((m==1 || m==21 || m==51 || m==60) && uQuality>=0){
      vec3 rr = reflect(rd,n);
      float t2 = march(p+n*.02, rr, 30., uQuality>0?64:20);
      vec3 rc;
      if(t2>0.){ vec3 p2=p+n*.02+rr*t2; map(p2); int m2=gMat; vec3 n2=uQuality>0?calcN(p2,.004):vec3(0.,1.,0.); rc = shade(p2,n2,rr,m2,true); }
      else rc = sky(rr)*.6;
      rc += glowPt(p,rr,t2>0.?t2:30.,uEyeLW,vec3(.3,.75,1.),.5*uEyePow.x*uPower,.05)
          + glowPt(p,rr,t2>0.?t2:30.,uEyeRW,vec3(.3,.75,1.),.5*uEyePow.y*uPower,.05)
          + glowSeg(p,rr,t2>0.?t2:30.,uFlameA,uFlameB,vec3(.35,.7,1.),uThrust*.9,.09);
      float fr = .25+.75*pow(1.-max(dot(n,-rd),0.),5.);
      col += rc*.5*fr;
    }
    if(wid()==1){ col = mix(col, verdanceHaze(rd), (1.-exp(-t*.0042))*.7); }
    else if(wid()==2){ col = mix(col, vec3(.03,.02,.07), (1.-exp(-t*.008))*.6); }
    else if(wid()==3){ col = mix(col, forestHaze(rd), (1.-exp(-t*.006))*.75); }
    else if(wid()==4){ col = mix(col, ferrumHaze(rd), (1.-exp(-t*.007))*.8); }
    else if(wid()==5){ col = mix(col, thalassaHaze(rd), (1.-exp(-t*.005))*.7); }
    else if(wid()==7){ col = mix(col, lostSky(rd)*.8, (1.-exp(-t*.006))*.8); }
    else { float fog = 1.-exp(-t*.018);
    col = mix(col, vec3(.03,.045,.08)+uHall*vec3(.04,.045,.06), fog); }
  } else {
    col = sky(rd);
  }
  for(int i=0;i<3;i++){
    if(uHA[i]<=.001) continue;
    vec3 N=uHN[i]; float dn=dot(rd,N); if(abs(dn)<1e-4) continue;
    float th2 = dot(uHC[i]-ro,N)/dn; if(th2<0. || th2>tHit) continue;
    vec3 Rt = normalize(cross(uHU[i],N));
    vec3 hp = ro+rd*th2-uHC[i];
    vec2 pq = vec2(dot(hp,Rt),dot(hp,uHU[i]))/uHS[i];
    if(abs(pq.x)<1. && abs(pq.y)<1.) col += holoContent(pq,uHS[i],i,uHA[i]);
  }
  { vec3 pr = portalShade(ro,rd,tHit); col = mix(col, pCol, pAlpha) + pr; }
  if(uLoom.x>.001) col += loomShade(ro,rd,tHit);
  vec4 orb = vec4(0.);
  if(uOrb.w>.001){ orb = orbShade(ro,rd,tHit,col); col = orb.xyz; }
  if(uTunnel.x>.001){
    bool rob = t>0. && length(ro+rd*t-uArcPos)<1.3;
    vec3 tc = tunnelCol(rd);
    col = rob ? col + tc*.12*uTunnel.x : mix(col, tc, uTunnel.x);
  }
  col += glowPt(ro,rd,tHit,uEyeLW,vec3(.3,.75,1.),.55*uEyePow.x*uPower,.05);
  col += glowPt(ro,rd,tHit,uEyeRW,vec3(.3,.75,1.),.55*uEyePow.y*uPower,.05);
  col += glowPt(ro,rd,tHit,uChestW,vec3(.3,.7,1.),(.4+uEmblem.x*.5)*uPower,.07);
  col += glowSeg(ro,rd,tHit,uFlameA,uFlameB,vec3(.35,.7,1.),uThrust*.8,.08);
  col += glowPt(ro,rd,tHit,uRingW,vec3(.3,.75,1.),uThrust*.32*uPower,.26);
  if(uOrb.w>.001) col += glowPt(ro,rd,orb.w>0.?tHit+10.:tHit,uOrb.xyz,vec3(1.,.8,.5),uOrbGlow*.7,uOrb.w*1.6);
  col += vec3(.45,.6,1.)*pow(max(dot(rd,KDIR),0.),10.)*.12*uWindow*(1.-exp(-tHit*.06))*(wid()==0?1.:0.);
  if(wid()==2){ col += glowPt(ro,rd,tHit+40.,ORR_C,vec3(1.,.7,.35),.5+uOrr.y*.5,3.2);
    for(int i=0;i<6;i++) col += glowPt(ro,rd,tHit,uOW[i].xyz,vec3(.4,.6,1.),.12,uOW[i].w*1.25); }
  if(wid()==4) col += ferrumGlow(ro,rd,tHit);
  if(wid()==5){ col = thalassaWater(ro,rd,t,col,t>0.); col += thalassaGlow(ro,rd,tHit); }
  if(wid()==6){ col += netGlow(ro,rd,tHit) + galaxyShade(ro,rd,tHit); }
  if(wid()==7){ col += lostGlow(ro,rd,tHit); }
  if(wid()==8){ col += coreGlow(ro,rd,tHit);
    if(uHelp.x>.01){ vec3 M=uMega.w>.5?uMega.xyz:uArcPos;
      col += glowLine(ro,rd,tHit,M+vec3(-90.,40.,30.),M,vec3(.5,1.,.5),uHelp.x,.25) + glowLine(ro,rd,tHit,M+vec3(90.,30.,20.),M,vec3(1.,.4,.35),uHelp.x,.25)
           + glowLine(ro,rd,tHit,M+vec3(-60.,-50.,-30.),M,vec3(.3,.9,1.),uHelp.x,.25) + glowLine(ro,rd,tHit,M+vec3(50.,-40.,-60.),M,vec3(.75,.5,1.),uHelp.x,.25); }
    if(uHelp.y>.01) col += glowLine(ro,rd,tHit,uMega.xyz+vec3(0.,-.2,0.)*uMegaB.y,uWar[0].xyz,vec3(.5,.9,1.),uHelp.y*1.4,.35)+glowLine(ro,rd,tHit,uMega.xyz,uWar[0].xyz,vec3(1.,.9,.6),uHelp.y,.08);
    if(uMega.w>.5) col += glowPt(ro,rd,tHit,uMega.xyz,vec3(.3,.8,1.),.25*uMegaB.z,uMegaB.y*1.4); }
  for(int i=0;i<4;i++) if(uKey[i].w>.5) col += glowPt(ro,rd,tHit,uKey[i].xyz,vec3(1.,.82,.45),.35+uKeyB.y*.4,.45);
  if(uAli.w>.002){ vec4 al = aliciaShade(ro,rd,tHit); col = col*(1.-al.w) + al.xyz; }
  if(uBfly.w>.01) col += butterflyShade(ro,rd,tHit);
  if(wid()>0){ float lum=dot(col,vec3(.3,.59,.11)); col = mix(vec3(lum), col, 1.18); }
  if(uMem>.001){ float lm=dot(col,vec3(.3,.59,.11)); col=mix(col, vec3(lm)*vec3(1.12,.97,.78)*1.15+vec3(.03,.02,0.), .78*uMem);
    vec2 uq=gl_FragCoord.xy/uRes-.5; col*=1.-uMem*.55*smoothstep(.25,.75,length(uq)); }
  col *= uExposure;
  col = aces(col);
  col = pow(col, vec3(1./2.2));
  vec2 u01 = gl_FragCoord.xy/uRes;
  col *= .4+.6*pow(16.*u01.x*u01.y*(1.-u01.x)*(1.-u01.y),.2);
  col += (hash12(gl_FragCoord.xy+fract(uTime*7.13)*400.)-.5)*.022;
  col *= uFade;
  outColor = vec4(max(col,0.),1.);
}
