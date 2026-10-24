// ===================== WORLD MODULE: THE FOREST WORLD (Chapter 3, inside a miniature world) =====================
// Rolling wooded hills with a river valley (river centre x = 6 sin(0.05 z)), a flat clearing around the
// stump at FOREST_STUMP, and a tiny glowing orrery on the stump. Butterfly sprite drawn in the main pass.
uniform vec4 uBfly;      // butterfly position xyz, visibility
const vec3 FOREST_STUMP = vec3(0.,0.,-44.);
float riverX(float z){ return 6.*sin(z*.05); }
float terrH(vec2 xz){
  float h = 3.2*(vnoise(vec3(xz*.06,0.))-.35) + 1.1*(vnoise(vec3(xz*.19,4.))-.5) + .3*(vnoise(vec3(xz*.6,9.))-.5);
  float rv = abs(xz.x-riverX(xz.y)); h = mix(-.7, h, smoothstep(1.6,5.,rv));
  float cl = length(xz-FOREST_STUMP.xz); h *= smoothstep(5.,13.,cl);
  return h;
}
float forest(vec3 p, out int m){
  float hy = terrH(p.xz); float d = (p.y-hy)*.6; m=50;
  float w = p.y+.35; if(w<d){ d=w; m=51; }
  vec2 cell = floor(p.xz/7.); vec2 r = hash12(cell)*vec2(1.)+vec2(0.); 
  vec2 jit = vec2(hash12(cell+1.3),hash12(cell+7.7))*3.2-1.6;
  vec2 tc = (cell+.5)*7.+jit;
  float keep = step(5.,abs(tc.x-riverX(tc.y)))*step(8.,length(tc-FOREST_STUMP.xz))*step(.25,hash12(cell+3.1));
  if(keep>.5 && p.y<14.){ float th=terrH(tc); vec3 tb=vec3(tc.x,th,tc.y); float sc=.8+.6*hash12(cell+5.);
    float trunk=sdCap(p,tb,tb+vec3(0.,2.2*sc,0.),.22*sc); if(trunk<d){ d=trunk; m=52; }
    float can=smin(length((p-tb-vec3(0.,3.*sc,0.))/vec3(1.6,1.3,1.6)*1.)-sc, length(p-tb-vec3(.5,3.9*sc,.2))-.9*sc, .5)*.8; if(can<d){ d=can; m=53; } }
  else d=min(d, max(length(p.xz-tc)-3., .5));
  vec3 s=p-FOREST_STUMP; float stump=sdCylY(s-vec3(0.,.3,0.),.75,.3)-.04; if(stump<d){ d=stump; m=54; }
  float mini=length(s-vec3(0.,.95,0.))-.16; if(mini<d){ d=mini; m=55; }
  float ring=length(vec2(length(s.xz)-.32, s.y-.95))-.015; if(ring<d){ d=ring; m=56; }
  return d;
}
vec3 forestSky(vec3 rd){
  float sy=rd.y; vec3 col=mix(vec3(.75,.85,.95),vec3(.25,.5,.9),smoothstep(0.,.6,sy));
  float sd=max(dot(rd,SUN),0.); col+=vec3(1.,.9,.7)*(pow(sd,10.)*.4+pow(sd,800.)*6.);
  float cl=smoothstep(.5,.75,fbm(vec3(rd.xz/(max(sy,.05)+.1)*1.2,uTime*.01))); col=mix(col,vec3(1.),cl*.7*smoothstep(0.,.2,sy));
  if(sy<0.) col=mix(vec3(.3,.42,.35),col,exp(sy*20.));
  return col;
}
vec3 forestHaze(vec3 rd){ return mix(vec3(.62,.72,.75),vec3(.55,.7,.9),smoothstep(-.1,.4,rd.y)); }
void forestMat(int m, vec3 p, vec3 n, inout vec3 alb, inout vec3 em, inout float spec, inout float gloss){
  if(m==50){ float f=fbm(p*.4); alb=mix(vec3(.22,.45,.16),vec3(.38,.55,.2),f); spec=.05;
    float rv=abs(p.x-riverX(p.z)); alb=mix(vec3(.55,.5,.38),alb,smoothstep(1.4,2.6,rv));
    float fl=step(.93,hash12(floor(p.xz*3.)))*step(.6,n.y); alb=mix(alb,mix(vec3(1.,.85,.3),vec3(.9,.5,.8),hash12(floor(p.xz*3.)+2.)),fl);
    float cl=length(p.xz-FOREST_STUMP.xz); alb=mix(alb,vec3(.42,.6,.24),1.-smoothstep(4.,8.,cl)); }
  else if(m==51){ alb=vec3(.05,.18,.2); spec=1.3; gloss=150.; }
  else if(m==52){ alb=vec3(.3,.2,.12); }
  else if(m==53){ alb=mix(vec3(.12,.36,.12),vec3(.25,.5,.15),fbm(p*.8)); spec=.05; }
  else if(m==54){ alb=vec3(.42,.3,.18); vec3 s=p-FOREST_STUMP; if(s.y>.6) alb=mix(vec3(.75,.6,.4),vec3(.55,.4,.25),step(.5,fract(length(s.xz)*14.))); }
  else if(m==55){ alb=vec3(0.); em=vec3(1.,.8,.45)*3.; }
  else if(m==56){ alb=vec3(.85,.62,.28); spec=1.; em=vec3(1.,.7,.35)*.4; }
}
vec3 butterflyShade(vec3 ro, vec3 rd, float tmax){
  if(uBfly.w<=.01) return vec3(0.);
  vec3 P=uBfly.xyz; vec3 N=normalize(ro-P); float dn=dot(rd,N); float t=dot(P-ro,N)/dn; if(t<0.||t>tmax) return vec3(0.);
  vec3 h=ro+rd*t-P; vec3 R=normalize(cross(vec3(0.,1.,0.),N)); vec2 q=vec2(dot(h,R),h.y)/.16;
  float flap=.35+.65*abs(sin(uTime*16.)); q.x/=flap;
  vec2 a=vec2(abs(q.x),q.y); float up=length((a-vec2(.45,.25))/vec2(.45,.42))-1., lo=length((a-vec2(.35,-.3))/vec2(.32,.3))-1.;
  float w=min(up,lo); float body=length(q/vec2(.06,.45))-1.;
  float f=1.-smoothstep(-.06,.06,w); float b=1.-smoothstep(-.1,.1,body);
  vec3 c=mix(vec3(.3,.5,1.),vec3(.8,.4,1.),smoothstep(.1,.8,a.x))*(1.2+.8*(1.-smoothstep(.0,.3,abs(w+.25))));
  return (c*f*1.4 + vec3(.1)*b + vec3(.4,.6,1.)*exp(-max(w,0.)*3.)*.25)*uBfly.w;
}
