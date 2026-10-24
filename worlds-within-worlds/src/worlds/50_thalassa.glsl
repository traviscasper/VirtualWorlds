// ===================== WORLD MODULE: THALASSA, THE LIVING WORLD (Chapter 5) =====================
// A lagoon at dusk turning to night. Clear shallow water over a bioluminescent reef (centre LAG, r<16),
// forested islands beyond, three vertical-farm towers on their own islands, wind turbines, a rock at the
// lagoon's edge, and LUMEN, a small glowing jellyfish-like creature. Water is not an SDF surface: geometry
// below y=0 is tinted by the underwater path and the surface reflection is added in the main pass.
uniform vec4 uThal;     // daylight 1..0, light-exchange amount, exchange phase, sky flicker
uniform vec4 uReef;     // global health, restoration wave radius, dark-patch amount, rhythm phase
uniform vec4 uLumen;    // Lumen position xyz, glow
uniform vec4 uLumB;     // Lumen size, bell pulse, tentacle sway, unused
uniform vec3 uRN[6];    // reef light-nodes
const vec3 LAG = vec3(0.,0.,-22.), ROCK = vec3(15.5,-.3,-24.);
const vec3 SUN_T = normalize(vec3(.62,.16,-.77));
const vec3 BHOLE=vec3(-15.,0.,-44.);  // the blue hole with the sunken temple
uniform vec4 uLev; uniform vec4 uLevB;   // leviathan: position, visible | yaw, pitch, swim phase, scale
const vec3 FARM0=vec3(-34.,0.,-36.), FARM1=vec3(32.,0.,-48.), FARM2=vec3(6.,0.,-66.);
float thTerr(vec2 xz){
  float r = length(xz-LAG.xz);
  float base = -3.1 + .5*(vnoise(vec3(xz*.3,2.))-.5);
  float isl = 6.*(vnoise(vec3(xz*.035,0.))-.47) + 2.*(vnoise(vec3(xz*.11,5.))-.5);
  float h = mix(base, max(isl,-3.6), smoothstep(17.,30.,r));
  h = max(h, 1.6-max(length(xz-FARM0.xz)-9.,0.)*.45); h = max(h, 1.6-max(length(xz-FARM1.xz)-9.,0.)*.45); h = max(h, 1.6-max(length(xz-FARM2.xz)-9.,0.)*.45);
  float bh=length(xz-BHOLE.xz); h=mix(-14.5+.6*vnoise(vec3(xz*.4,7.)), h, smoothstep(6.,10.5,bh)); // carve last, so nothing refills the hole
  return h;
}
float lumenSDF(vec3 p){
  vec3 q=(p-uLumen.xyz)/max(uLumB.x,.05);
  float bell=max(length(q*vec3(1.,1.3,1.))-.42, -q.y-.02); bell=max(bell,-(length(q-vec3(0.,-.12,0.))-.3));
  float tent=1e3; for(int i=0;i<5;i++){ float a=float(i)*1.2566; vec3 b=vec3(cos(a)*.24,-.02,sin(a)*.24);
    vec3 e=b+vec3(sin(uTime*1.3+float(i))*.12*uLumB.z,-.9,cos(uTime*1.1+float(i))*.12*uLumB.z); tent=min(tent,sdCap(q,b,e,.025)); }
  return min(bell,tent)*max(uLumB.x,.05);
}
float thalassa(vec3 p, out int m){
  float h = thTerr(p.xz); float d=(p.y-h)*.55; m=70;
  // reef corals on the lagoon floor
  float r = length(p.xz-LAG.xz);
  if(r<17. && p.y<0.){ vec2 c=floor(p.xz/2.6); vec2 cc=(c+.5)*2.6+(vec2(hash12(c),hash12(c+4.))-.5)*1.2;
    float s=.35+.5*hash12(c+9.); vec3 b=vec3(cc.x,-3.05,cc.y);
    float coral=smin(length(p-b-vec3(0.,s*.6,0.))-s*.55, sdCap(p,b,b+vec3(.3,s*1.6,.1),.12),.25);
    coral=smin(coral, sdCap(p,b,b+vec3(-.25,s*1.3,-.2),.1),.2);
    if(length(cc-LAG.xz)<16. && coral<d){ d=coral; m=72; } d=min(d,1.3); }
  // trees on the islands
  if(h>.4 && p.y<12.){ vec2 c=floor(p.xz/5.); vec2 tc=(c+.5)*5.+(vec2(hash12(c+1.),hash12(c+2.))-.5)*2.;
    float th=thTerr(tc); if(th>.6 && hash12(c+3.)>.3){ vec3 tb=vec3(tc.x,th,tc.y); float sc=.7+.5*hash12(c+5.);
      float tr=sdCap(p,tb,tb+vec3(0.,1.8*sc,0.),.15*sc); if(tr<d){ d=tr; m=71; }
      float cn=length((p-tb-vec3(0.,2.6*sc,0.))/vec3(1.2,1.5,1.2))-sc; cn*=.8; if(cn<d){ d=cn; m=73; } } }
  // vertical farms
  for(int k=0;k<3;k++){ vec3 f = k==0?FARM0:(k==1?FARM1:FARM2); vec3 q=p-f-vec3(0.,1.,0.);
    float tw = sdCylY(q-vec3(0.,11.,0.), 2.6, 11.); float ter = sdCylY(vec3(q.x,q.y-2.75*floor(q.y/2.75+.5),q.z), 3.4, .18);
    ter=max(ter, q.y-21.6); ter=max(ter,-q.y); float farm=min(tw,ter);
    if(farm<d){ d=farm; m=74; } }
  // wind turbines
  for(int k=0;k<2;k++){ vec3 b = k==0?FARM0+vec3(-6.,1.2,7.):FARM1+vec3(7.,1.2,6.); vec3 q=p-b;
    float tw=sdCap(q,vec3(0.),vec3(0.,10.,0.),.22); vec3 hb=q-vec3(0.,10.,.4);
    float ang=uTime*(1.1+float(k)*.2); float bl=1e3;
    for(int j=0;j<3;j++){ float a=ang+float(j)*2.094; vec3 dirb=vec3(cos(a),sin(a),0.); bl=min(bl,sdCap(hb,vec3(0.),dirb*4.2,.12)); }
    float tb=min(min(tw,bl),length(hb)-.35); if(tb<d){ d=tb; m=75; } }
  // the sunken temple at the bottom of the blue hole: six columns, an arch, an altar
  { vec3 q=p-vec3(BHOLE.x,-14.,BHOLE.z); if(length(q)<9.){
      float a=atan(q.z,q.x), sec=6.2832/6., ca=floor(a/sec+.5)*sec; vec3 cq=vec3(cos(ca)*q.x+sin(ca)*q.z,q.y,-sin(ca)*q.x+cos(ca)*q.z)-vec3(4.2,0.,0.);
      float col=sdCap(cq,vec3(0.),vec3(0.,3.6,0.),.32)-.02*sin(q.y*12.);
      float ring=length(vec2(length(q.xz)-4.2,q.y-3.8))-.28;
      float arch=max(length(vec2(length(q.xy-vec2(0.,1.))-2.4,q.z+4.4))-.35,-q.y);
      float alt=sdCylY(q-vec3(0.,.45,0.),1.1,.45)-.05;
      float tmp=min(min(col,ring),min(arch,alt)); if(tmp<d){ d=tmp; m=79; } } else d=min(d,length(q)-8.5); }
  // the leviathan: a vast gentle creature with glowing stripes
  if(uLev.w>.5){ vec3 q=p-uLev.xyz; float lb=length(q)-12.*uLevB.w; if(lb>.5) d=min(d,lb); else {
      float c=cos(-uLevB.x), s=sin(-uLevB.x); q=vec3(c*q.x+s*q.z,q.y,-s*q.x+c*q.z); float cp=cos(-uLevB.y), sp=sin(-uLevB.y); q=vec3(q.x,cp*q.y-sp*q.z,sp*q.y+cp*q.z); q/=uLevB.w;
      float sw=sin(uLevB.z-q.z*.35)*.5*smoothstep(2.,-8.,q.z);
      vec3 bq=q-vec3(sw,0.,0.); float body=sdE(bq-vec3(0.,0.,0.),vec3(2.3,1.7,7.5));
      body=smin(body,sdE(bq-vec3(0.,-.2,5.4),vec3(2.,1.4,2.6)),1.);
      vec3 fq=bq-vec3(0.,0.,-8.6); float fl=sdE(fq,vec3(3.6,.35,1.2)+vec3(0.,0.,0.))*.8;
      vec3 pq=vec3(abs(bq.x)-2.4,bq.y+.5,bq.z-1.5); pq.xy=mat2(.9,-.44,.44,.9)*pq.xy; float pf=sdE(pq,vec3(2.6,.25,1.4))*.8;
      float lev=smin(smin(body,fl,.6),pf,.5)*uLevB.w; if(lev<d){ d=lev; m=78; } } }
  // the rock at the lagoon's edge
  float rk=length((p-ROCK)/vec3(1.4,.9,1.2))-1.; rk*=.85; rk+= .08*vnoise(p*3.); if(rk<d){ d=rk; m=77; }
  // Lumen
  if(uLumen.w>-.5){ float lb=length(p-uLumen.xyz)-1.3*uLumB.x; if(lb<.3){ float lm=lumenSDF(p); if(lm<d){ d=lm; m=76; } } else d=min(d,lb); }
  return d;
}
vec3 thalassaSky(vec3 rd){
  float sy=rd.y, day=uThal.x;
  vec3 top=mix(vec3(.02,.03,.09),vec3(.12,.22,.48),day), hor=mix(vec3(.1,.08,.16),vec3(1.,.55,.3),day);
  vec3 col=mix(hor,top,smoothstep(-.02,.45,sy));
  float sd=max(dot(rd,SUN_T),0.); col+=vec3(1.,.6,.3)*(pow(sd,8.)*.6+pow(sd,600.)*5.)*day;
  vec3 c=floor(rd*230.); col+=vec3(.85,.9,1.)*step(.996,hash13(c))*smoothstep(.05,.3,sy)*(1.-day)*1.4;
  float cl=smoothstep(.55,.8,fbm(vec3(rd.xz/(max(sy,.05)+.12)*1.3,uTime*.008))); col=mix(col,mix(vec3(.08,.08,.14),vec3(1.,.7,.55),day),cl*.5*smoothstep(0.,.2,sy));
  col += vec3(.5,.7,1.)*uThal.w*smoothstep(.0,.3,sy)*.35;   // distant flicker in the sky (failures spreading)
  return col;
}
vec3 thalassaHaze(vec3 rd){ return mix(mix(vec3(.08,.08,.14),vec3(.9,.6,.45),uThal.x), mix(vec3(.03,.05,.12),vec3(.4,.5,.75),uThal.x), smoothstep(-.1,.4,rd.y)); }
float reefLife(vec3 p){ float dw = length(p.xz-uLumen.xz); float wave = smoothstep(uReef.y, uReef.y-3., dw);
  float dark = uReef.z*(1.-smoothstep(3.,7.,length(p.xz-vec2(9.,-27.))));
  return clamp(max(uReef.x, wave)-dark,0.,1.); }
void thalassaMat(int m, vec3 p, vec3 n, inout vec3 alb, inout vec3 em, inout float spec, inout float gloss);
void thalassaMatU(int m, vec3 p, vec3 n, inout vec3 alb, inout vec3 em, inout float spec, inout float gloss){
  thalassaMat(m,p,n,alb,em,spec,gloss);
  if(p.y<-.4){ // light scattered through the water reaches everything below the surface, with dancing caustics
    float cau=pow(fbm(vec3(p.xz*.7,uTime*.6)),3.)*2.2; em += alb*(vec3(.22,.45,.5)*(.6+.4*uThal.x)*(.4+.6*max(n.y,0.))+vec3(.5,.9,.9)*cau*.55)*(.5+.5*smoothstep(-16.,-2.,p.y)); }
}
void thalassaMat(int m, vec3 p, vec3 n, inout vec3 alb, inout vec3 em, inout float spec, inout float gloss){
  if(m==70){ float f=fbm(p*.4); if(p.y<-.3) alb=mix(vec3(.55,.5,.38),vec3(.4,.38,.3),f); else if(p.y<.5) alb=vec3(.75,.68,.5); else alb=mix(vec3(.18,.4,.15),vec3(.3,.5,.2),f); spec=.05; }
  else if(m==71){ alb=vec3(.3,.2,.12); }
  else if(m==72){ float life=reefLife(p); float h=hash12(floor(p.xz/2.6));
    vec3 cc = h<.33?vec3(.2,1.,.9):(h<.66?vec3(.9,.35,1.):vec3(.4,.6,1.));
    alb=mix(vec3(.35,.33,.32),cc*.5,life); spec=.4;
    float beat = .55+.45*pow(.5+.5*sin(uReef.w*6.2832*3.+h*2.),4.);
    em += cc*life*beat*(.9+.6*uThal.y)*(1.-.6*uThal.x); }
  else if(m==73){ alb=mix(vec3(.1,.3,.12),vec3(.2,.42,.15),fbm(p*.8)); spec=.05; }
  else if(m==74){ vec3 q=p; float ring=fract((q.y-1.)/2.75); alb=vec3(.82,.84,.8); spec=.5;
    if(ring<.14) alb=mix(vec3(.2,.5,.18),vec3(.35,.6,.25),fbm(p*2.));
    float a=atan(p.z-0.,p.x); vec2 w=vec2(fract(a*6.), fract(p.y*.8)); em += vec3(1.,.82,.55)*step(.6,w.x)*step(.5,w.y)*step(.12,ring)*.6*(1.-uThal.x*.7); }
  else if(m==75){ alb=vec3(.9,.92,.94); spec=.6; }
  else if(m==76){ vec3 q=(p-uLumen.xyz)/max(uLumB.x,.05); alb=vec3(.1,.2,.3);
    em += mix(vec3(.3,.7,1.),vec3(.8,.5,1.),.5+.5*q.y)*uLumen.w*(1.2+.8*uLumB.y)*(q.y>-.05?1.:.6); }
  else if(m==78){ vec3 q=p-uLev.xyz; alb=vec3(.08,.16,.22); spec=.8; gloss=60.;
    float st=smoothstep(.12,.0,abs(fract(dot(q,vec3(.35,.1,.25))*1.2)-.5)-.3); em+=vec3(.3,.9,1.)*st*.9+vec3(.5,.9,1.)*step(.94,hash13(floor(q*2.)))*1.2; }
  else if(m==79){ alb=vec3(.62,.66,.6)*(.8+.3*fbm(p*1.2)); spec=.2;
    float gl=smoothstep(.05,0.,abs(fract(p.y*1.5+.3*sin(p.x*2.+p.z*2.))-.5)-.42); em+=vec3(.3,.9,1.)*gl*1.6; }
  else if(m==77){ alb=vec3(.3,.29,.28)*(.8+.3*fbm(p*2.)); spec=.2; }
}
// water surface + light exchange glows, applied after the hit is shaded
vec3 thalassaWater(vec3 ro, vec3 rd, float t, vec3 col, bool hit){
  if(ro.y<0.){ // underwater: absorption, scattering, and the bright rippled surface seen from below
    float tw = rd.y>0. ? -ro.y/rd.y : 1e4; float dist = hit ? min(t,tw) : min(tw,60.);
    vec3 deep=mix(vec3(.004,.025,.045),vec3(.02,.12,.15),clamp(1.+ro.y*.08,0.,1.))*(.5+.5*uThal.x);
    if(!hit || t>tw){ if(tw<1e3){ vec3 sp=ro+rd*tw; float rip=fbm(vec3(sp.xz*.5,uTime*.5)); col=vec3(.35,.75,.8)*(.6+.8*rip)*(.4+.6*uThal.x); } else col=deep; }
    float cau=hit&&t<tw ? pow(fbm(vec3((ro+rd*t).xz*.8,uTime*.6)),3.)*1.6 : 0.;
    col = (col+cau*vec3(.4,.8,.8)*(.3+.7*uThal.x))*exp(-dist*vec3(.05,.02,.015))*1.3 + deep*(1.-exp(-dist*.03));
    return col; }
  if(ro.y>0. && rd.y<0.){ float tw=-ro.y/rd.y; if(!hit || t>tw){
    float under = hit ? t-tw : 30.;
    vec3 sp=ro+rd*tw;
    col = col*exp(-under*vec3(.42,.11,.08)) + vec3(.02,.12,.14)*(1.-exp(-under*.25))*(.25+.75*uThal.x);
    vec3 nn=normalize(vec3((fbm(vec3(sp.xz*.6,uTime*.4))-.5)*.25,1.,(fbm(vec3(sp.xz*.6+7.,uTime*.4))-.5)*.25));
    float fr=.02+.98*pow(1.-max(dot(-rd,nn),0.),5.);
    vec3 rc=thalassaSky(reflect(rd,nn));
    col = mix(col, rc, fr*.95) + vec3(1.,.7,.45)*pow(max(dot(reflect(rd,nn),SUN_T),0.),120.)*uThal.x*2.;
  } }
  return col;
}
vec3 thalassaGlow(vec3 ro, vec3 rd, float tmax){
  vec3 acc=vec3(0.);
  float ex=uThal.y;
  for(int i=0;i<6;i++){ vec3 N=uRN[i];
    acc += glowPt(ro,rd,tmax,N,vec3(.3,.9,1.),(.18+.5*ex)*uReef.x,.35);
    if(ex>.01){ float k=fract(uThal.z+float(i)*.17); vec3 P=mix(N,uLumen.xyz,k);
      acc += glowLine(ro,rd,tmax,N,uLumen.xyz,vec3(.3,.8,1.),.12*ex,.03) + glowPt(ro,rd,tmax,P,vec3(.6,1.,1.),.7*ex,.12); } }
  acc += glowPt(ro,rd,tmax,uLumen.xyz,vec3(.5,.8,1.),.9*uLumen.w,.6*uLumB.x);
  for(int j=0;j<10;j++){ float fj=float(j); vec3 fp=LAG+vec3(sin(uTime*.2+fj*2.1)*11.,-1.4+sin(uTime*.5+fj)*.6,cos(uTime*.17+fj*1.3)*11.);
    acc += glowPt(ro,rd,tmax,fp,vec3(.4,1.,.85),.25*uReef.x*(.5+.5*sin(uTime*3.+fj)),.12); }
  return acc;
}
