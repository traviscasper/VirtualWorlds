// ===================== CHARACTER: ALICIA (ELYSIA), the Loom's holographic AI =====================
// A full 3D raymarched figure, rendered in its own pass and blended over the scene, so she can be a
// translucent hologram (solidity 0) or fully solid (solidity 1, for the finale). Model space: about 1.7 units
// tall, centred at the hips, facing +Z; scaled so her height equals uAliB.x.
// Long platinum hair, anime face with large blue eyes, white dress with gold trims, puff sleeves,
// blue gemstone at the chest, golden geometric halo with orbiting diamonds.
uniform vec4 uAli;       // position xyz (hips), visibility
uniform vec4 uAliB;      // height, right-arm raise, dissolve, head turn
uniform vec4 uAliC;      // facing yaw, hold pose (both hands forward), solidity, unused
uniform vec3 uAliJ[6];   // arm joints in model space: shoulder, elbow, hand (left), then (right)
int aliM = 0;
vec3 aliRotY(vec3 v, float a){ float c=cos(a), s=sin(a); return vec3(c*v.x+s*v.z, v.y, -s*v.x+c*v.z); }
vec3 aliHead(vec3 q){ return aliRotY(q-vec3(0.,.66,0.), -uAliB.w*.45); }
float aliMap(vec3 q){
  float t=uTime;
  vec3 hq=aliHead(q);
  float head=smin(sdE(hq,vec3(.108,.128,.11)), sdE(hq-vec3(0.,-.05,.024),vec3(.072,.07,.075)), .035);
  float d=head; aliM=1;
  // hair: a shell over the head with the face cut away, long back hair, side locks
  float sway=sin(t*1.1+q.y*3.)*.014*max(.66-q.y,0.);
  float shell=sdE(hq-vec3(0.,.016,-.012),vec3(.121,.143,.122));
  shell=max(shell, -max(.03-hq.z, hq.y-.046+.012*abs(sin(hq.x*48.))));
  shell+=.0035*sin(hq.x*95.+hq.y*20.)*step(0.,hq.y-.02);
  float back=smin(sdE(q-vec3(sway,.33,-.078),vec3(.118,.4,.045)), sdE(q-vec3(sway*1.6,.02,-.08),vec3(.095,.24,.038)), .05);
  float locks=min(sdCap(q,vec3(-.1,.63,.045),vec3(-.118+sway,.32,.05),.019), sdCap(q,vec3(.1,.63,.045),vec3(.118+sway,.32,.05),.019));
  float hair=min(min(shell,back),locks);
  if(hair<d){ d=hair; aliM=2; }
  float neck=sdCap(q,vec3(0.,.49,0.),vec3(0.,.58,0.),.031); if(neck<d){ d=neck; aliM=1; }
  // dress: bodice, waist, puff sleeves, flared skirt with a moving hem
  float body=smin(sdE(q-vec3(0.,.385,0.),vec3(.118,.118,.074)), sdE(q-vec3(0.,.235,0.),vec3(.084,.075,.064)), .05);
  body=min(body, min(length(q-uAliJ[0])-.046, length(q-uAliJ[3])-.046));
  float y01=clamp((q.y+.85)/1.09,0.,1.); float ang=atan(q.z,q.x);
  float rr=mix(.37,.094,y01)+.016*sin(ang*7.+t*.8)*(1.-y01);
  float skirt=max((length(q.xz*vec2(1.,1.18))-rr)*.8, max(q.y-.245, -.85-q.y));
  body=smin(body,skirt,.03);
  float upper=min(sdCap(q,uAliJ[0],uAliJ[1],.033), sdCap(q,uAliJ[3],uAliJ[4],.033)); body=min(body,upper);
  if(body<d){ d=body; aliM=3; }
  float fore=min(sdCap(q,uAliJ[1],uAliJ[2],.025), sdCap(q,uAliJ[4],uAliJ[5],.025));
  fore=min(fore, min(length(q-uAliJ[2])-.032, length(q-uAliJ[5])-.032));
  if(fore<d){ d=fore; aliM=1; }
  float gem=length(q-vec3(0.,.405,.07))-.017; if(gem<d){ d=gem; aliM=5; }
  // halo: a gold ring behind the head and eight orbiting diamonds
  vec3 hl=q-vec3(0.,.71,-.135);
  float ring=length(vec2(length(hl.xy)-.21, hl.z))-.007;
  float a=atan(hl.y,hl.x)+t*.3; float sec=6.2832/8.; float k=floor(a/sec+.5); float ca=k*sec-t*.3;
  vec3 dp=hl-vec3(cos(ca)*.268, sin(ca)*.268, 0.); float dia=(abs(dp.x)+abs(dp.y)+abs(dp.z)-.026)*.57;
  float halo=min(ring,dia); if(halo<d){ d=halo; aliM=6; }
  return d;
}
vec3 aliFace(vec3 hq){
  vec2 f=hq.xy; float t=uTime;
  float bi=floor(t/3.7), bt=bi*3.7+1.+hash11(bi)*1.8; float open=1.-.95*smoothstep(.07,0.,abs(t-bt));
  vec3 c=vec3(1.,.85,.77);
  for(float s=-1.;s<2.;s+=2.){ vec2 e=f-vec2(s*.041,-.008); vec2 er=vec2(.024,.031*open);
    float ed=length(e/er)-1.;
    if(ed<0.){ float g=clamp((e.y/er.y)*.5+.5,0.,1.); vec3 iris=mix(vec3(.55,.85,1.),vec3(.08,.28,.85),g);
      float pup=length(e/vec2(.009,.014))-1.; iris=mix(iris,vec3(.02,.05,.2),step(pup,0.));
      float hl=length(e-vec2(-.007*s,.014))-.0065; iris=mix(iris,vec3(1.),step(hl,0.));
      c=iris; }
    float lash=abs(length((e-vec2(0.,-.006))/vec2(.028,.034))-1.)-.1; lash=max(lash,-e.y+.004);
    if(lash<0.) c=vec3(.18,.14,.16);
    float brow=abs(e.y-.048+e.x*e.x*6.)-.0028; if(brow<0. && abs(e.x)<.02) c=mix(c,vec3(.75,.68,.6),.8); }
  float mouth=abs(f.y+.066-f.x*f.x*9.)-.0024; if(mouth<0. && abs(f.x)<.015) c=vec3(.78,.4,.44);
  c=mix(c,vec3(1.,.66,.68),.4*smoothstep(.028,.0,length(vec2(abs(f.x)-.06,f.y+.038))));
  return c;
}
vec4 aliciaShade(vec3 ro, vec3 rd, float tmax){
  if(uAli.w<=.002) return vec4(0.);
  float sc=uAliB.x/1.7; vec3 C=uAli.xyz; float R=1.05*sc;
  vec3 oc=ro-C; float b=dot(oc,rd), cc=dot(oc,oc)-R*R, h=b*b-cc; if(h<0.) return vec4(0.);
  h=sqrt(h); float t=max(-b-h,0.), t1=min(-b+h,tmax); if(t>t1) return vec4(0.);
  bool hit=false; vec3 q;
  for(int i=0;i<90;i++){ vec3 p=ro+rd*t; q=aliRotY((p-C)/sc,-uAliC.x); float d=aliMap(q)*sc; if(d<.0006*t+.0004){ hit=true; break; } t+=d*.9; if(t>t1) break; }
  if(!hit) return vec4(0.);
  vec3 p=ro+rd*t; int m=aliM;
  vec2 e=vec2(.0015,0.);
  vec3 nl=normalize(vec3(aliMap(q+e.xyy)-aliMap(q-e.xyy), aliMap(q+e.yxy)-aliMap(q-e.yxy), aliMap(q+e.yyx)-aliMap(q-e.yyx)));
  vec3 n=aliRotY(nl,uAliC.x); aliMap(q); m=aliM;
  vec3 base=vec3(.95,.96,1.), em=vec3(0.);
  if(m==1){ base=vec3(1.,.85,.77); vec3 hq=aliHead(q); if(hq.z>.05 && length(hq.xy-vec2(0.,-.02))<.11) base=aliFace(hq); }
  else if(m==2){ base=vec3(.93,.86,.7); base+=vec3(.3,.26,.16)*pow(.5+.5*sin(q.y*70.+q.x*30.),6.)*.5; base*=.9+.1*sin(q.x*120.+q.y*20.); }
  else if(m==3){ base=vec3(.93,.94,.98);
    float trim=step(abs(q.y-.235),.013)+step(q.y,-.815)+step(abs(q.y-.475),.01)*step(abs(q.x),.07);
    float pat=step(.92,fract((atan(q.z,q.x)*7.+q.y*6.)/3.)) * step(q.y,-.5)*step(-.8,q.y);
    base=mix(base,vec3(1.,.78,.4),clamp(trim+pat*.6,0.,1.)); }
  else if(m==5){ base=vec3(.2,.5,1.); em=vec3(.3,.7,1.)*2.6; }
  else if(m==6){ base=vec3(1.,.78,.38); em=vec3(1.,.75,.35)*1.6; }
  vec3 L=normalize(-rd+vec3(.2,.7,0.));
  float dif=.45+.55*smoothstep(.0,.3,dot(n,L)); dif*=.85+.15*n.y;
  float rim=pow(1.-max(dot(n,-rd),0.),3.);
  float spec=pow(max(dot(reflect(rd,n),L),0.),30.)*(m==2?.35:.15);
  vec3 col=base*dif+spec+em+rim*vec3(.55,.75,1.)*.2;
  float holo=1.-clamp(uAliC.z,0.,1.);
  float scan=.86+.14*step(.5,fract(q.y*55.-uTime*1.4));
  col=mix(col, (col*vec3(.82,.97,1.12)+vec3(.02,.06,.12))*scan, .3*holo) + rim*vec3(.4,.8,1.)*holo*.6;
  float dis=smoothstep(uAliB.z-.15,uAliB.z+.15,fbm(q*5.+vec3(0.,0.,uTime*.3)));
  float flick=mix(1.,.9+.1*sin(uTime*13.+q.y*40.),holo);
  float a=uAli.w*mix(.82,1.,1.-holo)*dis*flick;
  return vec4(col*a,a);
}
