// ===================== WORLD MODULE: THE GREAT NETWORK (Chapter 6) =====================
// Inside the Loom: an endless jittered lattice of glowing threads (each node is a world), with light pulses
// that all flow one way, toward the Cosmic Core (far along -Z). Threads fray and flicker as the network fails.
// There is no solid geometry here; the lattice is drawn as accumulated glow. A spiral galaxy can be shown at
// any scale (from filling the sky to a hologram between Alicia's hands).
uniform vec4 uNet;    // pulse phase, fray amount, brightness, lattice scale
uniform vec4 uGal;    // galaxy centre xyz, radius
uniform vec4 uGalB;   // tilt, rotation, brightness, core-marker strength
const vec3 CORE_DIR = normalize(vec3(.12,.06,-1.));
float loomNet(vec3 p, out int m){ m=80; return 30.; }
vec3 netNode(vec3 c, float S){ return (c+.5)*S + (vec3(hash13(c),hash13(c+3.1),hash13(c+7.7))-.5)*S*.42; }
vec3 netSky(vec3 rd){
  vec3 col=vec3(.004,.006,.018);
  col += vec3(.06,.08,.22)*pow(fbm(rd*2.+vec3(2.,7.,1.)),3.)*2.4 + vec3(.15,.05,.2)*pow(fbm(rd*3.3+5.),4.)*2.;
  vec3 c=floor(rd*260.); col += vec3(.8,.85,1.)*step(.996,hash13(c))*.9;
  float cd=max(dot(rd,CORE_DIR),0.); col += vec3(1.,.75,.4)*(pow(cd,1500.)*5.+pow(cd,120.)*.18);
  return col;
}
// distance from p to segment ab, also returning the parameter along it
float segD(vec3 p, vec3 a, vec3 b, out float h){ vec3 pa=p-a, ba=b-a; h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h); }
vec3 netGlow(vec3 ro, vec3 rd, float tmax){
  float S = 9.*max(uNet.w,.02), th=.05*S/9.;
  vec3 acc=vec3(0.); float t=.2;
  for(int i=0;i<64;i++){
    if(t>min(tmax,90.*max(uNet.w,.15))) break;
    vec3 p=ro+rd*t; vec3 c=floor(p/S);
    float dmin=1e3; vec3 g=vec3(0.);
    vec3 N0=netNode(c,S);
    for(int k=0;k<6;k++){
      vec3 e = k%3==0?vec3(1.,0.,0.):(k%3==1?vec3(0.,1.,0.):vec3(0.,0.,1.));
      vec3 ca = k<3?c:c-e, cb = ca+e;
      vec3 A=netNode(ca,S), B=netNode(cb,S); float h; float d=segD(p,A,B,h);
      float sid=hash13(ca*1.3+e*7.); float alive=step(uNet.y, sid*1.05);
      float flick=step(uNet.y*.6, sid)*(1.-alive)*step(.5,fract(uTime*7.+sid*13.));
      float dirSign = sign(dot(B-A,CORE_DIR)+1e-4); float hh = dirSign>0.? h : 1.-h;
      float pul = smoothstep(.08,0.,abs(fract(hh*1.5-uNet.x*.6+sid*5.)-.5)-.4);
      vec3 col = mix(vec3(.25,.55,1.), vec3(.6,.4,1.), sid)*(alive*.9+flick*.6) + vec3(1.,.8,.45)*pul*alive*1.6;
      g += col*(exp(-d/th)*.9 + exp(-d/(th*10.))*.012); dmin=min(dmin,d);
    }
    float nd=length(p-N0); g += vec3(.8,.9,1.)*(exp(-nd/(th*5.))*1.2+exp(-nd/(th*30.))*.012)*(.6+.4*sin(uTime*2.+hash13(c)*20.));
    float st=clamp(dmin*.5,.08,S*.25);
    acc += g*st*exp(-t*.02/max(uNet.w,.15));
    t += st;
  }
  return acc*uNet.z*.55;
}
vec3 galaxyShade(vec3 ro, vec3 rd, float tmax){
  if(uGalB.z<=.001) return vec3(0.);
  float ct=cos(uGalB.x), st=sin(uGalB.x); vec3 N=vec3(0.,ct,st);
  float dn=dot(rd,N); if(abs(dn)<1e-4) return vec3(0.);
  float t=dot(uGal.xyz-ro,N)/dn; if(t<0.||t>tmax+500.) return vec3(0.);
  vec3 h=ro+rd*t-uGal.xyz; vec3 U=vec3(1.,0.,0.), Wv=normalize(cross(N,U)); vec2 q=vec2(dot(h,U),dot(h,Wv))/uGal.w;
  float r=length(q); if(r>1.2) return vec3(0.);
  float a=atan(q.y,q.x);
  float arms=pow(.5+.5*cos(2.*(a-log(max(r,.02))*2.6-uGalB.y)),3.);
  float dust=fbm(vec3(q*6.,1.));
  float dens=arms*exp(-r*2.6)*(.6+.8*dust)+exp(-r*14.)*1.6;
  vec3 col=mix(vec3(1.,.8,.55),vec3(.45,.6,1.),smoothstep(.05,.6,r))*dens*2.;
  col+=vec3(1.)*step(.985,hash12(floor(q*90.)))*arms*exp(-r*2.)*1.5;
  vec2 cm=vec2(.52,-.18); float mk=exp(-length(q-cm)*40.)*uGalB.w*(1.2+.8*sin(uTime*4.)); col+=vec3(1.,.7,.3)*mk*4.;
  col+=vec3(1.,.7,.3)*smoothstep(.01,0.,abs(length(q-cm)-.05))*uGalB.w*2.;
  return col*uGalB.z*smoothstep(1.2,.9,r);
}
