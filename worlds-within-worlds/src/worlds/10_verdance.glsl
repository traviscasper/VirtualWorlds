// ===================== WORLD MODULE: VERDANCE (Chapter 2) =====================
// The First World: a canal city at dawn. Terraced garden towers, elevated trams, promenade trees,
// service robots, a fountain plaza and a lookout at the city's edge. Also TOCK, the courier drone.
// Layout (world units): canal along -Z (|x|<3, z 30..-56), plaza at (0,0,-70), lookout edge z=-104.
uniform vec4 uCity;    // window/tram lights 0..1, tram phase, robot phase, flicker flash
uniform vec4 uJets;    // fountain jet heights
uniform vec4 uTock;    // position xyz, yaw
uniform vec4 uTockE;   // eye open, look x, look y, happy
uniform float uTockVis;

const vec3 SUN = normalize(vec3(-.38,.42,-.82));

float sdRBox(vec3 p, vec3 b, float r){ return sdBox(p,b)-r; }

// ---- TOCK: a small clockwork courier drone (one eye, one propeller) ----
vec3 tockLocal(vec3 p){ vec3 q=p-uTock.xyz; float c=cos(-uTock.w), s=sin(-uTock.w); return vec3(c*q.x+s*q.z, q.y, -s*q.x+c*q.z); }
float tock(vec3 p, out int m){
  vec3 q = tockLocal(p);
  float body = length(q)-.2; m=30;
  float band = sdCylY(q, .205, .025)-.01; if(band<body){ body=band; m=33; }
  float eye = sdCap(q, vec3(0.,.02,.1), vec3(0.,.02,.19), .095);
  if(eye<body){ body=eye; m=31; }
  float hub = sdCap(q, vec3(0.,.18,0.), vec3(0.,.29,0.), .028);
  vec3 bq = q-vec3(0.,.29,0.); float ph=uTime*42.; float c=cos(ph), s=sin(ph);
  bq.xz = vec2(c*bq.x-s*bq.z, s*bq.x+c*bq.z);
  float blade = sdRBox(bq, vec3(.25,.004,.03), .006);
  float pr = min(hub, blade); if(pr<body){ body=pr; m=32; }
  float foot = sdCap(q, vec3(0.,-.19,0.), vec3(0.,-.26,0.), .02); if(foot<body){ body=foot; m=32; }
  return body;
}

float verdance(vec3 p, out int m){
  // ground: promenades, lawns and the canal trench; the city ends at the lookout (z=-104)
  float trench = sdBox(p-vec3(0.,-.1,-13.), vec3(3.,1.1,43.));
  float g = max(max(p.y, -trench), -104.-p.z);
  float d = g; m = (abs(p.x)<3.03 && p.y<-.02 && p.z>-56.05 && p.z<30.05) ? 22 : 20;
  float water = p.y+.62; if(water<d){ d=water; m=21; }
  // promenade trees
  { vec3 q=p; q.x=abs(q.x)-4.9; float zc=q.z-6.*floor(q.z/6.+.5);
    float tb=max(abs(q.x)-1.15, p.y-3.6);
    if(tb>.4 || p.z<-56. || p.z>28.) d=min(d, max(tb,.4));
    else { float trunk=sdCap(vec3(q.x,p.y,zc),vec3(0.),vec3(0.,1.9,0.),.09);
      float can=sdE(vec3(q.x,p.y-2.55,zc),vec3(1.,.82,1.))+.05*sin(p.x*9.)*sin(p.y*7.)*sin(p.z*8.);
      if(trunk<d){d=trunk;m=23;} if(can<d){d=can;m=24;} } }
  // terraced garden towers (12-unit cells)
  { vec2 cid=floor(p.xz/12.); vec2 cc=(cid+.5)*12.; vec2 q=p.xz-cc;
    bool skip = abs(cc.x)<10. || cc.y<-96. || length(cc-vec2(0.,-70.))<21. || cc.y>36.;
    float bd = 1e3;
    if(!skip){ float h=hash12(cid*1.37+3.1), h2=hash12(cid*2.11+7.7);
      float w=2.5+h*1.5, dd=2.5+h2*1.5, H=7.+h*17.;
      vec3 bp=vec3(q.x,p.y,q.y);
      float H2=H*.35+3., H3=2.+h2*6.;
      bd = sdRBox(bp-vec3(0.,H*.5,0.),vec3(w,H*.5,dd),.2);
      bd = min(bd, sdRBox(bp-vec3(0.,H+H2*.5,0.),vec3(w*.72,H2*.5,dd*.72),.2));
      bd = min(bd, sdRBox(bp-vec3(0.,H+H2+H3*.5,0.),vec3(w*.45,H3*.5,dd*.45),.2)); }
    vec2 e=6.-abs(q); bd=min(bd, max(min(e.x,e.y),0.)+.6);
    if(bd<d){ d=bd; m=26; } }
  // elevated tram guideways and cars
  { vec3 q=p; float sx=sign(q.x); q.x=abs(q.x)-9.5;
    if(abs(q.x)<2.5 && p.y<8.){
      float zr = abs(p.z+35.)-65.;
      float beam = max(sdBox(q-vec3(0.,5.4,p.z),vec3(.38,.22,1.)), zr);
      float zc=q.z-12.*floor(q.z/12.+.5);
      float pil = max(sdCap(vec3(q.x,p.y,zc),vec3(0.),vec3(0.,5.3,0.),.22), zr);
      if(min(beam,pil)<d){ d=min(beam,pil); m=27; }
      float tz = p.z + (sx>0.? uCity.y : -uCity.y+11.); float zt = tz-45.*floor(tz/45.+.5);
      float car = max(sdRBox(vec3(q.x,p.y-6.35,zt),vec3(.82,.6,3.5),.34), zr);
      if(car<d){ d=car; m=28; }
    } else d=min(d, max(abs(q.x)-2.2, .3)); }
  // fountain plaza
  { vec3 q=p-vec3(0.,0.,-70.); float r=length(q.xz);
    if(r<5.5 && p.y<6.){
      float basin = max(abs(r-4.)-.3, p.y-.6);
      if(basin<d){ d=basin; m=34; }
      float pool = max(p.y-.32, r-3.75); if(pool<d){ d=pool; m=21; }
      for(int i=0;i<4;i++){ float a=float(i)*1.5708; vec3 jc=vec3(cos(a)*2.1,0.,sin(a)*2.1);
        float hj=uJets[i]; if(hj<.05) continue;
        float jet=sdCap(q-jc, vec3(0.,.3,0.), vec3(0.,.3+hj,0.), .1+.04*sin(p.y*9.-uTime*14.));
        if(jet<d){ d=jet; m=29; } }
    } else d=min(d, max(r-5.3,.3)); }
  // lookout railing
  { float rail = sdBox(p-vec3(0.,.95,-103.75), vec3(40.,.04,.04));
    float pz=p.x-3.*floor(p.x/3.+.5); float post=sdBox(vec3(pz,p.y-.5,p.z+103.75),vec3(.04,.45,.04));
    float rl=min(rail,post); if(rl<d){ d=rl; m=27; } }
  // service robots on the promenades
  { vec3 q=p; float sx=sign(q.x); q.x=abs(q.x)-3.9;
    float rb=max(abs(q.x)-.45, p.y-1.3);
    if(rb>.3 || p.z<-56. || p.z>28.) d=min(d, max(rb,.3));
    else { float z = p.z + (sx>0.? uCity.z : -uCity.z+4.); float zc=z-9.*floor(z/9.+.5);
      float body=sdCap(vec3(q.x,p.y,zc),vec3(0.,.35,0.),vec3(0.,.72,0.),.2);
      float hd=length(vec3(q.x,p.y-1.02,zc))-.17;
      float rr=min(body,hd); if(rr<d){ d=rr; m=25; } } }
  return d;
}

vec3 verdanceSky(vec3 rd){
  float sy = rd.y;
  vec3 col = mix(vec3(1.,.78,.55), vec3(.3,.52,.92), smoothstep(-.02,.4,sy));
  col = mix(col, vec3(.14,.3,.72), smoothstep(.4,1.,sy));
  float sd = max(dot(rd,SUN),0.);
  col += vec3(1.,.85,.6)*pow(sd,12.)*.7 + vec3(1.,.95,.8)*pow(sd,900.)*8.;
  float cl = smoothstep(.55,.8,fbm(vec3(rd.xz/(max(sy,.04)+.12)*1.4,uTime*.01)));
  col = mix(col, mix(vec3(1.,.9,.8),vec3(1.,.75,.6),pow(sd,3.)), cl*.55*smoothstep(.0,.15,sy));
  // distant skyline and hills along the horizon (open sea toward the sunrise)
  float az = atan(rd.x,-rd.z);
  float hills = .012+.035*fbm(vec3(az*2.5,0.,1.));
  float towers = step(.55,abs(az))*(.02+.06*pow(fbm(vec3(floor(az*28.)*.37,2.,0.)),2.)*step(.35,fract(az*28.)));
  float hz = max(hills, towers);
  if(sy<hz && sy>-.05){ vec3 hc = mix(vec3(.55,.62,.72), vec3(.7,.68,.66), smoothstep(-.05,hz,sy)); col = mix(col, hc, .85); }
  if(sy<-.0){ col = mix(vec3(.25,.42,.6), col, exp(sy*30.)); col += vec3(1.,.8,.55)*pow(max(dot(reflect(rd,vec3(0.,1.,0.)),SUN),0.),60.)*.8; }
  return col;
}
vec3 verdanceHaze(vec3 rd){ return mix(vec3(.8,.72,.62), vec3(.5,.62,.85), smoothstep(-.1,.4,rd.y)) + vec3(.25,.18,.1)*pow(max(dot(rd,SUN),0.),6.); }

// materials (albedo, emission, spec) for Verdance and Tock
void verdanceMat(int m, vec3 p, vec3 n, inout vec3 alb, inout vec3 em, inout float spec, inout float gloss){
  float L = uCity.x;
  if(m==20){ float ax=abs(p.x); vec3 q=p-vec3(0.,0.,-70.); float rp=length(q.xz);
    vec2 g=abs(fract(p.xz*.5)-.5); float tile=1.-smoothstep(.46,.49,max(g.x,g.y));
    if(ax<6.5 || rp<15. || p.z<-90.){ alb=mix(vec3(.62,.6,.55),vec3(.74,.71,.65),tile); spec=.25;
      if(rp<15.) alb=mix(alb, vec3(.82,.72,.5), (1.-smoothstep(.0,.06,abs(fract(rp*.5)-.5)-.4))*.6);
      if(p.z<-90. && ax>4.) alb=mix(vec3(.24,.46,.2),vec3(.33,.55,.25),fbm(p*.6)); }
    else { alb = mix(vec3(.22,.44,.18), vec3(.34,.56,.24), fbm(p*.5)); spec=.05;
      float path = 1.-smoothstep(.6,.8,min(abs(fract((p.x)/12.)-.5)*12., abs(fract(p.z/12.)-.5)*12.));
      alb = mix(alb, vec3(.7,.67,.6), path); }
    em += vec3(.3,.75,1.)*(1.-smoothstep(.0,.04,abs(ax-3.15)))*.5*L*step(-56.,p.z)*step(p.z,30.);
  } else if(m==21){ alb=vec3(.03,.1,.13); spec=1.2; gloss=160.;
  } else if(m==22){ alb=vec3(.52,.5,.46)*(.8+.2*fbm(p*3.)); spec=.15;
  } else if(m==23){ alb=vec3(.28,.2,.13);
  } else if(m==24){ float h=hash13(floor(p*.5+.5)); alb=mix(vec3(.16,.4,.14),vec3(.3,.55,.18),fbm(p*2.)); if(h>.8) alb=mix(alb,vec3(.95,.62,.72),.55); spec=.05;
  } else if(m==25){ alb=vec3(.88,.9,.92); spec=.7; gloss=60.;
    if(p.y>.95 && p.y<1.1) em += vec3(.25,.85,.8)*1.2*L;
  } else if(m==26){ float hb=hash12(floor(p.xz/12.)*3.3); alb = hb<.3 ? vec3(.86,.83,.76) : (hb<.55 ? vec3(.82,.66,.56) : (hb<.8 ? vec3(.72,.8,.74) : vec3(.9,.9,.88))); spec=.3; gloss=40.;
    if(n.y>.6){ alb=mix(vec3(.2,.45,.18),vec3(.36,.58,.22),fbm(p*1.3)); spec=.05; }
    else { float along = abs(n.x)>.5 ? p.z : p.x;
      vec2 w=vec2(fract(along/1.25), fract(p.y/1.6));
      float win = step(.18,w.x)*step(w.x,.82)*step(.25,w.y)*step(w.y,.8);
      float lit = step(.45, hash12(floor(vec2(along/1.25, p.y/1.6))+floor(p.xz/12.)*7.));
      alb = mix(alb, vec3(.12,.18,.24), win*.8); em += vec3(1.,.82,.55)*win*lit*.55*L;
      float trim = 1.-smoothstep(.0,.06,abs(fract(p.y/6.)-.02)); alb=mix(alb, vec3(.9,.7,.34), trim); spec+=trim*.6;
      float vine = smoothstep(.62,.7,fbm(p*.9))*step(fract(p.y/6.),.35); alb=mix(alb,vec3(.22,.48,.2),vine); } 
  } else if(m==27){ alb=vec3(.86,.87,.88); spec=.4; em += vec3(.3,.75,1.)*(1.-smoothstep(.0,.04,abs(p.y-5.2)))*.8*L;
  } else if(m==28){ alb=vec3(.93,.94,.96); spec=1.; gloss=90.;
    if(abs(p.y-6.45)<.22) { alb=vec3(.08,.12,.18); em += vec3(.6,.85,1.)*(.35+uCity.w*2.)*L; }
    if(abs(p.y-6.0)<.04) em += vec3(.3,.75,1.)*1.4*L;
  } else if(m==29){ alb=vec3(.75,.88,1.); spec=1.2; gloss=80.; em += vec3(.25,.4,.55);
  } else if(m==34){ alb=vec3(.82,.8,.74); spec=.4; vec3 q=p-vec3(0.,0.,-70.); float a=atan(q.z,q.x);
    if(p.y>.5) em += vec3(.3,.8,1.)*(1.-smoothstep(.0,.08,abs(fract(a/(6.2832)*4.+.125)-.5)*6.))*(.6+1.5*max(max(uJets.x,uJets.y),max(uJets.z,uJets.w))/4.);
  } else if(m==30 || m==33){ vec3 q=tockLocal(p); alb = m==33 ? vec3(.15,.55,.55) : vec3(.82,.62,.3); spec=1.1; gloss=90.;
    if(m==33) em += vec3(.2,.7,.7)*.35;
  } else if(m==31){ vec3 q=tockLocal(p); alb=vec3(.03,.03,.04); spec=1.4; gloss=200.;
    if(q.z>.17){ vec2 e=q.xy-vec2(0.,.02)-vec2(uTockE.y,uTockE.z)*.025;
      float open=max(uTockE.x,.05);
      float iris = length(e/vec2(1.,open))-.055; float ring=abs(length(e)-.075)-.007;
      float hap = abs(length(e+vec2(0.,.03))-.05)-.012; hap=max(hap,-(e.y+.005));
      float sh = mix(iris, hap, uTockE.w);
      em += vec3(1.,.6,.2)*(1.-smoothstep(-.004,.004,sh))*2.6 + vec3(1.,.75,.35)*(1.-smoothstep(-.003,.003,ring))*1.2*(1.-uTockE.w);
      em += vec3(1.,.95,.8)*(1.-smoothstep(.006,.012,length(e-vec2(-.02,.025))))*(1.-uTockE.w)*step(.4,open); }
  } else if(m==32){ alb=vec3(.12,.12,.14); spec=.8;
  }
}
