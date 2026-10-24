// ===================== WORLD MODULE: THE LOST WORLDS (Chapter 7) =====================
// Fragments of broken worlds drifting in a violet-red energy storm. Two failing worlds (A: green, with a
// village; B: blue ocean) hang on by flickering threads; B can break into chunks. Lightning bolts, storm
// clouds, and at the end the vast golden gate of the Cosmic Core far ahead.
uniform vec4 uLost;    // storm flash, bolt seed, bolt intensity, gate glow
uniform vec4 uLostB;   // world B break 0..1, world A crack, world A light, world B light
uniform vec4 uThr;     // thread A amount, thread B amount, flicker A, flicker B
uniform vec3 uThrA, uThrB;   // thread anchor points (ARCHIVE's hands / Tock)
uniform vec3 uBolt0, uBolt1; // lightning endpoints
const vec3 PA=vec3(-14.,2.,-150.), PB=vec3(16.,-3.,-160.), GATE=vec3(0.,22.,-560.);
const float RA=7., RB=6.5;
float lostBShape(vec3 p){
  float d=1e3; float br=uLostB.x;
  for(int k=0;k<7;k++){ float fk=float(k); vec3 dir=normalize(vec3(sin(fk*2.4),cos(fk*1.7)*.8,sin(fk*3.7+1.)));
    vec3 c=PB+dir*(RB*.45+br*(6.+fk*1.5)) + vec3(0.,-br*br*4.*hash11(fk),0.);
    float s=length(p-c)-RB*.62*(1.-br*.35); d=smin(d,s,mix(1.6,.2,br)); }
  return d;
}
float lost(vec3 p, out int m){
  float d=40.; m=90;
  // drifting fragments of broken worlds
  vec3 c=floor(p/16.); vec3 cc=(c+.5)*16.+(vec3(hash13(c),hash13(c+2.),hash13(c+5.))-.5)*5.;
  float keep=step(.62,hash13(c+9.))*step(9.,length(cc.xy-vec2(0.,1.)))*step(16.,length(cc-PA))*step(16.,length(cc-PB));
  if(keep>.5){ vec3 q=p-cc; float a=uTime*.05*(hash13(c+1.)-.5)+hash13(c)*6.28; float ca=cos(a), sa=sin(a);
    q.xz=mat2(ca,-sa,sa,ca)*q.xz; q.xy=mat2(cos(a*.7),-sin(a*.7),sin(a*.7),cos(a*.7))*q.xy;
    vec2 sz=vec2(2.+2.4*hash13(c+4.),2.+2.*hash13(c+6.));
    float slab=sdBox(q,vec3(sz.x,.7,sz.y))-.15; float rock=sdE(q-vec3(0.,-1.,0.),vec3(sz.x*.85,1.9,sz.y*.85));
    float frag=smin(slab,rock,.6); if(frag<d){ d=frag; m=hash13(c+8.)>.6?92:91; }
  }
  vec3 lc=abs(fract(p/16.)*16.-8.); d=min(d, 8.-max(lc.x,max(lc.y,lc.z))+.1);   // never step past the next cell's fragment
  float a=length(p-PA)-RA+ .25*vnoise(p*.5)*uLostB.y; if(a<d){ d=a; m=93; }
  float b=lostBShape(p); if(b<d){ d=b; m=94; }
  vec3 g=p-GATE; float gate=length(vec2(length(g.xy)-40., g.z))-2.4; if(gate<d){ d=gate; m=95; }
  return d;
}
vec3 lostSky(vec3 rd){
  float sy=rd.y;
  vec3 col=mix(vec3(.035,.01,.03),vec3(.008,.008,.025),smoothstep(-.4,.6,sy));
  float cl=fbm(rd*2.4+vec3(uTime*.02,0.,uTime*.015)); float cl2=fbm(rd*5.+vec3(-uTime*.04,1.,0.));
  col+=vec3(.2,.04,.16)*pow(cl,3.)*1.3 + vec3(.08,.06,.22)*pow(cl2,3.5)*1.2;
  col+=vec3(.7,.6,1.)*uLost.x*pow(cl,1.5)*1.1;
  vec3 gd=normalize(GATE); float gg=max(dot(rd,gd),0.); col+=vec3(1.,.75,.4)*uLost.w*(pow(gg,200.)*.4+pow(gg,12.)*.05);
  vec3 c=floor(rd*220.); col+=vec3(.8,.85,1.)*step(.997,hash13(c))*.5;
  return col;
}
void lostMat(int m, vec3 p, vec3 n, inout vec3 alb, inout vec3 em, inout float spec, inout float gloss){
  if(m==91||m==92){ float top=smoothstep(.5,.9,n.y);
    alb=mix(vec3(.18,.15,.16),vec3(.28,.24,.22),fbm(p*.6));
    if(m==91) alb=mix(alb,vec3(.2,.36,.16),top);
    else { alb=mix(alb,vec3(.3,.3,.34),top); vec2 w=fract(p.xz*1.3); em+=vec3(1.,.75,.45)*step(.75,w.x)*step(.75,w.y)*top*step(.6,hash12(floor(p.xz*1.3)))*.5; }
    em+=vec3(.6,.3,1.)*smoothstep(.64,.7,fbm(p*.9))*.3*(1.-top);
  } else if(m==93){ vec3 q=normalize(p-PA); float f=fbm(q*3.);
    alb=mix(vec3(.2,.42,.18),vec3(.35,.5,.25),f); alb=mix(alb,vec3(.12,.3,.55),step(f,.4));
    float crack=smoothstep(.03,0.,abs(fbm(q*5.)-.5))*uLostB.y; em+=vec3(1.,.4,.6)*crack*1.5;
    em+=vec3(1.,.8,.5)*step(.92,hash13(floor(q*40.)))*step(.45,f)*uLostB.z*1.4;
  } else if(m==94){ vec3 q=normalize(p-PB); float f=fbm(q*3.+2.);
    alb=mix(vec3(.04,.2,.45),vec3(.1,.3,.55),f); alb=mix(alb,vec3(.5,.55,.35),smoothstep(.65,.7,f));
    em+=vec3(.3,.7,1.)*uLostB.w*.25; em+=vec3(1.,.4,.6)*uLostB.x*smoothstep(.04,0.,abs(fbm(q*6.)-.5))*1.4;
  } else if(m==95){ alb=vec3(.9,.65,.3); spec=1.2; gloss=80.; em+=vec3(1.,.75,.35)*(.3+uLost.w*1.8);
  } else { alb=vec3(.1); }
}
vec3 lostGlow(vec3 ro, vec3 rd, float tmax){
  vec3 acc=vec3(0.);
  if(uThr.x>.001){ float f=mix(1.,step(.4,fract(uTime*9.)),uThr.z); vec3 E=PA+normalize(uThrA-PA)*RA;
    acc+=glowLine(ro,rd,tmax,uThrA,E,vec3(.4,.85,1.),1.1*uThr.x*f,.06)+glowLine(ro,rd,tmax,uThrA,E,vec3(.5,.8,1.),.15*uThr.x*f,.4); }
  if(uThr.y>.001){ float f=mix(1.,step(.45,fract(uTime*11.+.3)),uThr.w); vec3 E=PB+normalize(uThrB-PB)*RB;
    acc+=glowLine(ro,rd,tmax,uThrB,E,vec3(.4,.85,1.),1.1*uThr.y*f,.06)+glowLine(ro,rd,tmax,uThrB,E,vec3(.5,.8,1.),.15*uThr.y*f,.4); }
  if(uLost.z>.01){ vec3 A=uBolt0, B=uBolt1; vec3 prev=A;
    for(int i=1;i<=7;i++){ float f=float(i)/7.; vec3 P=mix(A,B,f); if(i<7) P+=(vec3(hash11(uLost.y*13.+f*7.),hash11(uLost.y*17.+f*3.),hash11(uLost.y*5.+f*11.))-.5)*length(B-A)*.18;
      acc+=glowLine(ro,rd,tmax+200.,prev,P,vec3(.85,.8,1.),2.4*uLost.z,.08)+glowLine(ro,rd,tmax+200.,prev,P,vec3(.6,.4,1.),.4*uLost.z,.9); prev=P; } }
  if(uLost.w>.01){ vec3 g=GATE; acc+=glowPt(ro,rd,tmax+600.,g,vec3(1.,.8,.45),uLost.w*.5,7.); }
  return acc;
}
