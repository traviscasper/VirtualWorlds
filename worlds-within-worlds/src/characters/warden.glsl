// ===================== CHARACTER: THE WARDENS (the Loom's maintenance drones) =====================
// The network's old caretakers. Starved of energy they turned into hoarders: red-eyed, grabbing, chasing
// anything that carries power. When the network is restored (Ch 9) their visors turn blue again.
// Up to three at once. Body: armoured sphere with a visor slit, a spinning rotor ring on top, two claw arms.
uniform vec4 uWar[3];    // position xyz, visible (0/1)
uniform vec4 uWarB[3];   // yaw, restored (0 red .. 1 blue), scale, claw open
float wardenOne(vec3 p, int i, out int m){
  vec4 W=uWar[i], B=uWarB[i]; float sc=max(B.z,.1);
  vec3 q=(p-W.xyz)/sc; float c=cos(-B.x), s=sin(-B.x); q=vec3(c*q.x+s*q.z, q.y, -s*q.x+c*q.z);
  float body=sdE(q,vec3(.46,.4,.46)); m=110;
  float band=length(vec2(length(q.xz)-.46,q.y+.02))-.05; if(band<body){ body=smin(body,band,.02); }
  float visor=sdE(q-vec3(0.,.06,.36),vec3(.28,.07,.12)); if(visor<body+.01){ body=min(body,visor); if(visor<=body) m=111; }
  vec3 rq=q-vec3(0.,.5,0.); float rotor=length(vec2(length(rq.xz)-.34,rq.y))-.03; float mast=sdCap(q,vec3(0.,.35,0.),vec3(0.,.5,0.),.04);
  float top=min(rotor,mast); if(top<body){ body=top; m=112; }
  float op=B.w; float cl=1e3;
  for(int k=0;k<2;k++){ float sd=k==0?-1.:1.; vec3 sh=vec3(.32*sd,-.22,.12), el=sh+vec3(.12*sd,-.3,.18+op*.12);
    vec3 h1=el+vec3(.06*sd*(1.+op),-.18,.1), h2=el+vec3(-.02*sd,-.2,.16+op*.08);
    cl=min(cl,min(sdCap(q,sh,el,.045),min(sdCap(q,el,h1,.03),sdCap(q,el,h2,.03)))); }
  if(cl<body){ body=cl; m=110; }
  if(B.z>3.){ // MAGNUS, the Warden Prime: a crown of spikes, a second armour band, shoulder plates
    vec3 cq=q-vec3(0.,.42,0.); float crown=length(vec2(length(cq.xz)-.3,cq.y))-.035;
    for(int k=0;k<5;k++){ float a=float(k)*1.2566; vec3 tip=vec3(cos(a)*.3,.32,sin(a)*.3); crown=min(crown,sdCap(cq,vec3(cos(a)*.3,0.,sin(a)*.3),tip,.03)); }
    float band2=length(vec2(length(q.xz)-.43,q.y-.2))-.04;
    float pl=min(sdE(q-vec3(.42,.0,0.),vec3(.12,.2,.2)),sdE(q-vec3(-.42,.0,0.),vec3(.12,.2,.2)));
    float extra=min(min(crown,band2),pl); if(extra<body){ body=extra; m=extra==crown?112:110; } }
  return body*sc;
}
float wardens(vec3 p, inout int m, float d){
  for(int i=0;i<3;i++){ if(uWar[i].w<.5) continue; float b=length(p-uWar[i].xyz)-1.25*uWarB[i].z; if(b>.3){ d=min(d,b); continue; }
    int mm; float w=wardenOne(p,i,mm); if(w<d){ d=w; m=mm; } }
  return d;
}
void wardenMat(int m, vec3 p, inout vec3 alb, inout vec3 em, inout float spec, inout float gloss){
  int i=0; float best=1e3; for(int k=0;k<3;k++){ float dd=length(p-uWar[k].xyz); if(uWar[k].w>.5&&dd<best){ best=dd; i=k; } }
  float rest=uWarB[i].y; vec3 eye=mix(vec3(1.,.15,.12),vec3(.3,.75,1.),rest);
  if(m==110){ alb=vec3(.16,.16,.19); spec=.9; gloss=70.; vec3 q=p-uWar[i].xyz; em+=eye*.25*smoothstep(.03,.0,abs(q.y+.02))*step(.4,length(q.xz)/max(uWarB[i].z,.1)); }
  else if(m==111){ alb=vec3(.02); spec=1.4; em+=eye*(4.+1.2*sin(uTime*9.+float(i)))*(1.-rest*.3); }
  else { alb=vec3(.3,.3,.34); spec=.8; em+=eye*.6*step(.5,fract(atan(p.z-uWar[i].z,p.x-uWar[i].x)*2.+uTime*30.)); }
}
