// ===================== WORLD MODULE: THE ORRERY (Chapter 3) =====================
// A brass orrery adrift in a violet void: a lantern-star, three turning gimbal rings, six miniature
// worlds on tilted orbits (forest, ocean, desert, floating islands, alien, habitat), and the arrival dais.
// Also ALICIA's apparition (a 2D light-figure drawn on a camera-facing plane) used for her glimpses.
uniform vec4 uOW[6];     // miniature worlds: centre xyz, radius
uniform vec4 uOrr;       // ring angle, star glow, world spin, unused
const vec3 ORR_C = vec3(0.,9.,-30.);

float orrery(vec3 p, out int m){
  float d = sdCylY(p-vec3(0.,-.35,0.), 5., .35)-.05; m=40;
  float rail = length(vec2(length(p.xz)-5.05, p.y-.05))-.06; if(rail<d){ d=rail; m=41; }
  vec3 q = p-ORR_C;
  float star = length(q)-2.2; if(star<d){ d=star; m=42; }
  float rb = abs(length(q)-20.)-3.2;
  if(rb<d){
    for(int i=0;i<3;i++){ float fi=float(i); vec3 r=q; float a=uOrr.x*(.35+.22*fi)+fi*1.1, b=.5+fi*.9;
      float ca=cos(a), sa=sin(a), cb=cos(b), sb=sin(b);
      r = vec3(r.x, ca*r.y-sa*r.z, sa*r.y+ca*r.z); r = vec3(cb*r.x+sb*r.z, r.y, -sb*r.x+cb*r.z);
      float tr = length(vec2(length(r.xz)-(18.+2.2*fi), r.y))-.13; if(tr<d){ d=tr; m=41; } }
  } else d=min(d,rb);
  for(int i=0;i<6;i++){ float s=length(p-uOW[i].xyz)-uOW[i].w; if(s<d){ d=s; m=43+i; } }
  return d;
}
vec3 orrerySky(vec3 rd){
  vec3 col = vec3(.012,.008,.03);
  col += vec3(.22,.08,.36)*pow(fbm(rd*2.2+vec3(5.,2.,1.)),3.)*2.2 + vec3(.05,.12,.32)*pow(fbm(rd*3.7+9.),2.5)*1.6;
  vec3 c = floor(rd*240.); float h = hash13(c);
  if(h>.994){ vec3 f=fract(rd*240.)-.5; col += mix(vec3(.8,.85,1.),vec3(1.,.8,.6),hash13(c+3.))*(1.-smoothstep(0.,.35,length(f)))*(h-.994)*180.; }
  vec3 sd = normalize(ORR_C-vec3(0.,2.,0.)); col += vec3(1.,.75,.4)*pow(max(dot(rd,sd),0.),40.)*.25;
  return col;
}
vec3 rotY(vec3 v, float a){ float c=cos(a), s=sin(a); return vec3(c*v.x+s*v.z, v.y, -s*v.x+c*v.z); }
void orreryMat(int m, vec3 p, vec3 n, inout vec3 alb, inout vec3 em, inout float spec, inout float gloss){
  if(m==40){ float r=length(p.xz); alb=vec3(.07,.08,.14); spec=.8; gloss=80.;
    float rings=1.-smoothstep(.0,.03,abs(fract(r*.8)-.5)-.44);
    alb=mix(alb, vec3(.85,.64,.3), rings*step(p.y,.01)); em += vec3(.3,.7,1.)*(1.-smoothstep(.0,.04,abs(r-4.6)))*1.2;
    float a=atan(p.z,p.x); em += vec3(1.,.75,.4)*(1.-smoothstep(.0,.02,abs(fract(a/(2.*PI)*24.)-.5)*r*.3))*step(r,4.4)*step(2.,r)*.25;
  } else if(m==41){ alb=vec3(.85,.62,.28); spec=1.2; gloss=70.; em += vec3(1.,.7,.3)*.06;
  } else if(m==42){ vec3 q=normalize(p-ORR_C); float f=fbm(q*3.+vec3(uTime*.05));
    alb=vec3(0.); em = mix(vec3(1.,.6,.25),vec3(1.,.95,.8),f)*(3.+uOrr.y*2.);
  } else {
    int i=m-43; vec3 c=uOW[i].xyz; vec3 q=rotY(normalize(p-c), uOrr.z*(.6+.15*float(i))+float(i));
    float f=fbm(q*2.6+float(i)*3.1); spec=.4; gloss=60.;
    if(i==0){ alb=mix(vec3(.16,.42,.14),vec3(.08,.26,.1),smoothstep(.45,.6,f)); alb=mix(alb,vec3(.1,.3,.6),step(f,.36)); }
    else if(i==1){ alb=vec3(.03,.16,.42)*(.8+.4*f); alb=mix(alb,vec3(.55,.62,.3),smoothstep(.66,.7,f)); spec=1.; gloss=120.; }
    else if(i==2){ alb=mix(vec3(.85,.55,.28),vec3(.65,.38,.2),.5+.5*sin(q.y*30.+f*9.)); }
    else if(i==3){ alb=mix(vec3(.5,.72,.95),vec3(.85,.92,1.),smoothstep(.5,.6,f)); alb=mix(alb,vec3(.3,.6,.25),smoothstep(.68,.72,fbm(q*5.))); }
    else if(i==4){ alb=mix(vec3(.3,.1,.4),vec3(.55,.2,.5),f); em += vec3(.2,.9,1.)*(1.-smoothstep(.0,.025,abs(f-.55)))*1.6; }
    else { alb=vec3(.5,.52,.56); vec2 g=fract(vec2(atan(q.z,q.x)*4., q.y*6.)); alb*= .8+.2*step(.08,min(g.x,g.y));
      em += vec3(1.,.85,.55)*step(.85,hash12(floor(vec2(atan(q.z,q.x)*16., q.y*20.))))*.9; alb=mix(alb,vec3(.85,.65,.3),1.-smoothstep(.0,.05,abs(q.y))); spec=1.; }
    float cl = smoothstep(.58,.75,fbm(q*4.+vec3(uTime*.03)+float(i)));
    if(i<4) alb=mix(alb,vec3(.95),cl*.6);
  }
}
vec3 ferrumView(vec2 v){
  vec3 c = mix(vec3(.5,.1,.12), vec3(.06,.05,.16), smoothstep(-.4,.8,v.y));
  float x=v.x*9.; float b=floor(x); float h=-.1+hash11(b*5.3)*.7;
  float tw=step(v.y,h)*step(.1,fract(x))*step(fract(x),.9);
  vec3 tc=vec3(.08,.06,.1)+vec3(1.,.3,.25)*step(.75,hash12(floor(v*vec2(90.,120.))))*.8+vec3(.3,.6,1.)*step(.93,hash12(floor(v*vec2(60.,40.))+7.));
  c=mix(c,tc,tw); c+=vec3(1.,.4,.3)*exp(-abs(v.y+.05)*10.)*.25;
  return c;
}
