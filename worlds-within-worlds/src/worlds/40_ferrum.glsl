// ===================== WORLD MODULE: FERRUM, THE BROKEN CITY (Chapter 4) =====================
// A dense red-and-blue city at night. Avenue along -Z (|x|<9), elevated rail over it (x=0, y=11),
// substation plaza at z -62..-90 with two district power cores (A east, B west), district C far down
// the avenue (z<-150). ARCHIVE's over-complicated holographic machine stands in the plaza.
uniform vec4 uDist;     // power: district A, B, C, flicker
uniform vec4 uRail;     // train z, train visible, lamp power, unused
uniform vec4 uLink;     // A–B link amount, leak beam, unused, unused
uniform vec3 uLinkEnd;  // where ARCHIVE is carrying the cable end
uniform vec4 uMach;     // machine build 0..1, wobble, collapse 0..1, spin
const vec3 CORE_A = vec3(12.,0.,-76.), CORE_B = vec3(-12.,0.,-76.), MACH = vec3(0.,0.,-72.);
const vec3 LEAK_A = vec3(4.,34.,-205.), LEAK_B = vec3(10.,140.,-230.);
float ferrumDistrict(vec3 p){ return p.z<-150. ? uDist.z : (p.x>0. ? uDist.x : uDist.y); }
float plazaMask(vec3 p){ return step(-92.,p.z)*step(p.z,-60.)*step(abs(p.x),22.); }
float ferrum(vec3 p, out int m){
  float d = p.y; m=60;
  // city blocks (period 12) except the avenue and the plaza
  vec2 cell = floor(p.xz/12.+.5); vec2 lc = p.xz-cell*12.;
  float h = 14.+34.*pow(hash12(cell*1.7),1.6)+(cell.y<-12.?10.:0.);
  bool open = abs(cell.x*12.)<9. || (cell.y*12.<-56. && cell.y*12.>-96. && abs(cell.x*12.)<26.);
  if(!open){ float b = sdBox(vec3(lc.x,p.y-h*.5,lc.y), vec3(4.4,h*.5,4.4));
    float top = sdBox(vec3(lc.x,p.y-h-2.5,lc.y), vec3(2.6,2.5,2.6)); b=min(b,top);
    if(b<d){ d=b; m=61; } }
  d = min(d, 6.-max(abs(lc.x),abs(lc.y))+1.5); // never step past the next cell's building
  // elevated rail: deck, pylons, train
  float deck = sdBox(vec3(p.x-6.5,p.y-11.,0.), vec3(1.5,.3,1e3)); if(deck<d){ d=deck; m=62; }
  float pz = p.z-24.*floor(p.z/24.+.5); float pyl = sdBox(vec3(p.x-6.5,p.y-5.4,pz), vec3(.45,5.4,.45)); if(pyl<d){ d=pyl; m=62; }
  if(uRail.y>.5){ float tz=p.z-uRail.x; float car=1e3; for(int i=0;i<3;i++){ car=min(car, sdBox(vec3(p.x-6.5,p.y-12.6,tz-float(i)*7.4), vec3(1.25,1.15,3.4))-.25); } if(car<d){ d=car; m=63; } }
  // power cores
  for(int k=0;k<2;k++){ vec3 c = k==0?CORE_A:CORE_B; vec3 q=p-c;
    float core = sdCylY(q-vec3(0.,7.,0.), 2.2, 7.)-.1; if(core<d){ d=core; m=64+k; }
    float coil = length(vec2(length(q.xz)-2.6, q.y-3.-4.*floor((q.y-1.)/4.+.5)+1.))-.18; coil=max(coil, q.y-13.); coil=max(coil,-q.y+1.);
    if(coil<d){ d=coil; m=66+k; } }
  // the holographic machine
  if(uMach.x>.01){ vec3 q=p-MACH; float sc=1.-uMach.z*.0; float sag=uMach.z;
    q.y += sag*sag*q.x*.25; q.x += sin(uTime*14.)*.06*uMach.y;
    float mc=1e3;
    if(uMach.x>.05){ vec3 g=q-vec3(-2.2,2.4,0.); float a=atan(g.y,g.x)+uMach.w; float r=1.2+.12*step(.5,fract(a*12./6.2832));
      mc=min(mc, max(abs(length(g.xy)-r+.1)-.12, abs(g.z)-.12)); }
    if(uMach.x>.22){ vec3 g=q-vec3(.4,3.6,0.); float a=atan(g.y,g.x)-uMach.w*1.6; float r=.8+.1*step(.5,fract(a*10./6.2832));
      mc=min(mc, max(abs(length(g.xy)-r+.08)-.1, abs(g.z)-.1)); }
    if(uMach.x>.38) mc=min(mc, sdCap(q,vec3(-3.6,0.,0.),vec3(-2.6,4.6,.6),.14));
    if(uMach.x>.5){ for(int i=0;i<4;i++){ float fi=float(i); mc=min(mc, sdCap(q,vec3(-1.+fi*.9,5.+sin(fi*2.)*.4,.0),vec3(-.1+fi*.9,5.+sin(fi*2.+2.)*.4,.0),.12)); } }
    if(uMach.x>.62){ vec3 g=q-vec3(2.6,1.2+abs(sin(uTime*3.))*1.6*uMach.y,0.); mc=min(mc,length(g)-.35); }
    if(uMach.x>.74){ vec3 g=q-vec3(2.6,4.2,0.); float pa=sin(uTime*2.4)*.9*uMach.y; vec3 bob=vec3(sin(pa)*1.3,-cos(pa)*1.3,0.); mc=min(mc, min(sdCap(g,vec3(0.),bob,.04), length(g-bob)-.22)); }
    if(uMach.x>.86){ vec3 g=q-vec3(0.,.6,0.); mc=min(mc, max(sdCylY(g,1.6,.6), -sdCylY(g,1.3,.7))); }
    if(mc<d){ d=mc; m=68; } }
  return d;
}
vec3 ferrumSky(vec3 rd){
  float sy=rd.y; vec3 col=mix(vec3(.32,.07,.08),vec3(.03,.025,.07),smoothstep(-.05,.45,sy));
  float cl=fbm(vec3(rd.xz/(max(sy,.04)+.15)*1.1,uTime*.01)); col += vec3(.45,.1,.12)*pow(cl,2.)*smoothstep(.0,.3,sy)*(.5+.5*uDist.x);
  vec3 c=floor(rd*200.); col += vec3(.7,.75,1.)*step(.997,hash13(c))*smoothstep(.2,.5,sy)*.8;
  return col;
}
vec3 ferrumHaze(vec3 rd){ return mix(vec3(.2,.06,.08), vec3(.06,.05,.12), smoothstep(-.1,.4,rd.y)); }
vec3 ferrumLights(vec3 p, vec3 n){ // core glow + street lamps as cheap point lights
  vec3 acc=vec3(0.);
  vec3 la=CORE_A+vec3(0.,7.,0.)-p; float da=length(la); acc += vec3(1.,.35,.2)*uDist.x*max(dot(n,la/da),0.)*7./(1.+da*da*.06);
  vec3 lb=CORE_B+vec3(0.,7.,0.)-p; float db=length(lb); acc += vec3(.25,.5,1.)*uDist.y*max(dot(n,lb/db),0.)*7./(1.+db*db*.06);
  float lz = -12.*floor(-p.z/12.+.5); float side = p.x>0.?7.6:-7.6; vec3 l=vec3(side,6.,lz)-p; float dl=length(l);
  acc += vec3(1.,.7,.45)*uRail.z*ferrumDistrict(p)*max(dot(n,l/dl),0.)*1.6/(1.+dl*dl*.3);
  if(uLink.x>.01){ vec3 lc=(CORE_A+CORE_B)*.5+vec3(0.,9.,0.)-p; float dc=length(lc); acc += vec3(1.,.8,.5)*uLink.x*max(dot(n,lc/dc),0.)*8./(1.+dc*dc*.05); }
  return acc;
}
void ferrumMat(int m, vec3 p, vec3 n, inout vec3 alb, inout vec3 em, inout float spec, inout float gloss){
  float P = ferrumDistrict(p); float fl = 1.-uDist.w*step(.5,hash11(floor(uTime*18.)+floor(p.z/12.)));
  if(m==60){ alb=vec3(.05,.05,.06); spec=.9; gloss=60.;
    float lane=(1.-smoothstep(.0,.06,abs(abs(p.x)-3.)))*step(abs(p.x),9.)*step(.5,fract(p.z*.25)); em += vec3(1.,.85,.6)*lane*.3;
    if(abs(p.x)>9.&&plazaMask(p)<.5) alb=vec3(.12,.11,.12);
    float pr=length(p.xz-MACH.xz); if(plazaMask(p)>.5) em += vec3(.3,.6,1.)*smoothstep(.43,.48,abs(fract(pr*.25)-.5))*.25*max(uDist.x,uDist.y);
  } else if(m==61){ alb=vec3(.035,.032,.045); spec=.5; gloss=50.;
    float along = abs(n.x)>.5 ? p.z : p.x; vec2 w=vec2(fract(along/1.6), fract(p.y/2.2));
    float win = step(.3,w.x)*step(w.x,.7)*step(.35,w.y)*step(w.y,.65);
    float on = step(.55, hash12(floor(vec2(along/1.6, p.y/2.2))+floor(p.xz/12.)*3.));
    vec3 wc = hash12(floor(p.xz/12.))>.5 ? vec3(1.,.35,.22) : vec3(.3,.55,1.);
    em += mix(vec3(1.,.8,.55),wc,.6)*win*on*.9*P*fl;
    float neon = smoothstep(.465,.49,abs(fract(p.y/9.)-.5)); em += wc*neon*1.8*P*fl;
  } else if(m==62){ alb=vec3(.16,.15,.17); spec=.6; em += vec3(.3,.6,1.)*(1.-smoothstep(.0,.05,abs(p.y-10.7)))*.8*max(uDist.x,uDist.y);
  } else if(m==63){ alb=vec3(.7,.72,.76); spec=1.; gloss=80.; if(abs(p.y-12.9)<.45) { alb=vec3(.05); em += vec3(1.,.85,.6)*1.2*max(uDist.x,uDist.y)*fl; }
  } else if(m==64||m==65){ float pw = m==64?uDist.x:uDist.y; alb=vec3(.12,.12,.14); spec=.8;
    vec3 cc = m==64?vec3(1.,.35,.2):vec3(.25,.55,1.); em += cc*smoothstep(.36,.44,abs(fract(p.y*.5)-.5))*1.6*pw*fl;
  } else if(m==66||m==67){ float pw = m==66?uDist.x:uDist.y; alb=vec3(.7,.5,.25); spec=1.; em += (m==66?vec3(1.,.4,.2):vec3(.3,.6,1.))*2.2*pw*fl;
  } else if(m==68){ alb=vec3(.02,.05,.08); spec=.6; float sc=.5+.5*sin(p.y*30.+uTime*6.);
    em += mix(vec3(.25,.8,1.),vec3(1.,.4,.3),uMach.z)*(1.4+sc*.8)*(1.-uMach.z*.6)*(.7+.3*step(.5,hash11(floor(uTime*24.))));
  }
}
vec3 ferrumGlow(vec3 ro, vec3 rd, float tmax){
  vec3 acc=vec3(0.);
  if(uLink.x>.001){ vec3 a=CORE_B+vec3(0.,9.,0.); acc += glowLine(ro,rd,tmax,a,uLinkEnd,vec3(1.,.8,.45),1.4*uLink.x,.12) + glowLine(ro,rd,tmax,a,uLinkEnd,vec3(1.,.9,.7),.6*uLink.x,.04); }
  if(uLink.y>.001){ acc += glowLine(ro,rd,tmax+400.,LEAK_A,LEAK_B,vec3(.8,.3,1.),.9*uLink.y,.9) + glowLine(ro,rd,tmax+400.,LEAK_A,LEAK_B,vec3(1.,.7,1.),.5*uLink.y,.25); }
  acc += glowPt(ro,rd,tmax,CORE_A+vec3(0.,14.4,0.),vec3(1.,.35,.2),.8*uDist.x,1.2) + glowPt(ro,rd,tmax,CORE_B+vec3(0.,14.4,0.),vec3(.3,.55,1.),.8*uDist.y,1.2);
  return acc;
}
vec3 thalassaView(vec2 v){
  vec3 c = mix(vec3(.05,.35,.4), vec3(.5,.85,.9), smoothstep(-.6,.8,v.y));
  float hills = -.1+.15*sin(v.x*5.)+.08*sin(v.x*13.+1.); c = mix(c, vec3(.1,.4,.2), step(v.y,hills)*.9);
  c = mix(c, vec3(.1,.45,.55), step(v.y,-.35)); c += vec3(.4,1.,.8)*step(.985,hash12(floor(v*70.)))*step(v.y,-.35);
  return c;
}
