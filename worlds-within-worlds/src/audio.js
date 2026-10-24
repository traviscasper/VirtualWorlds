/* ARCHIVE audio: score + SFX + dialogue placeholders, synthesized as a pure function of time.
   renderAudio(t0,t1) for any window gives sample-identical results to rendering the whole film,
   so 5-minute chunks join seamlessly. Stems: music, sfx, dialogue. */
(function (G) {
'use strict';
const AR = G.ARCHIVE;
const SR = 48000, TAU = Math.PI*2;
const N = 8192, MASK = N-1;
const SIN = new Float32Array(N), SAW = new Float32Array(N), TRI = new Float32Array(N);
for (let i=0;i<N;i++){ const x=i/N; SIN[i]=Math.sin(TAU*x); let s=0; for(let h=1;h<=18;h++) s+=Math.sin(TAU*h*x)/h*(1-h/19); SAW[i]=s*.55; let tr=0; for(let h=1;h<=9;h+=2) tr+=Math.sin(TAU*h*x)/(h*h)*((h-1)/2%2?-1:1); TRI[i]=tr*.8; }
const sinT=x=>SIN[((x-Math.floor(x))*N)&MASK], sawT=x=>SAW[((x-Math.floor(x))*N)&MASK], triT=x=>TRI[((x-Math.floor(x))*N)&MASK];
const mtof=m=>440*Math.pow(2,(m-69)/12);
function nz(i){ let x=Math.imul(i^0x27d4eb2d,0x165667b1); x^=x>>>15; x=Math.imul(x,0x85ebca6b); x^=x>>>13; return ((x>>>0)/4294967296)*2-1; }
const env=(tn,a,d)=>Math.min(1,tn/a)*(tn>d?Math.exp(-(tn-d)*3):1);

// ---------- instruments: fn(tn, note, state, sampleIndex) ----------
const INST = {
  piano:{tail:3,fn:(tn,n)=>{ const f=n.f, a=Math.min(1,tn*250), r=tn>n.d?Math.exp(-(tn-n.d)*5):1;
    return (sinT(f*tn)*Math.exp(-tn*.9)+.42*sinT(2*f*tn+.13)*Math.exp(-tn*1.9)+.2*sinT(3.003*f*tn)*Math.exp(-tn*3.2)+.09*sinT(4.01*f*tn)*Math.exp(-tn*5)+.05*sinT(5.02*f*tn)*Math.exp(-tn*7))*a*r*.32; }},
  pad:{tail:3.5,stateful:true,init:()=>({y:0}),fn:(tn,n,s)=>{ const f=n.f, a=Math.min(1,tn/(n.att||1.6)); const r=tn>n.d?Math.exp(-(tn-n.d)*1.1):1;
    const x=.5*(sawT(f*tn*1.004)+sawT(f*tn*.996))+.35*sinT(f*tn*.5); s.y+=(x-s.y)*.06; return s.y*a*a*r*.22; }},
  strings:{tail:2.5,stateful:true,init:()=>({y:0,y2:0}),fn:(tn,n,s)=>{ const f=n.f, a=Math.min(1,tn/(n.att||.45)); const r=tn>n.d?Math.exp(-(tn-n.d)*2.2):1;
    const vib=.0025*f/(TAU*5.3)*Math.sin(TAU*5.3*tn)*Math.min(1,tn*1.5);
    const x=.6*sawT(f*tn+vib)+.4*sawT(f*tn*1.003-vib); s.y+=(x-s.y)*.13; s.y2+=(s.y-s.y2)*.2; return s.y2*a*r*.24; }},
  brass:{tail:1.2,stateful:true,init:()=>({y:0}),fn:(tn,n,s)=>{ const f=n.f, a=Math.min(1,tn/.07); const r=tn>n.d?Math.exp(-(tn-n.d)*4):1;
    const k=.05+.25*Math.min(1,tn/.25)*(.7+.3*Math.sin(tn*3)); s.y+=(sawT(f*tn)-s.y)*k; return s.y*a*r*.25; }},
  bell:{tail:4,fn:(tn,n)=>{ const f=n.f, a=Math.min(1,tn*400);
    return (sinT(f*tn)*Math.exp(-tn*.8)+.5*sinT(2.76*f*tn)*Math.exp(-tn*1.6)+.25*sinT(5.4*f*tn)*Math.exp(-tn*3)+.12*sinT(8.93*f*tn)*Math.exp(-tn*5))*a*.2; }},
  celesta:{tail:2.5,fn:(tn,n)=>{ const f=n.f, a=Math.min(1,tn*500); return (sinT(f*tn)*Math.exp(-tn*2.2)+.35*sinT(4*f*tn)*Math.exp(-tn*6))*a*.22; }},
  pluck:{tail:.9,fn:(tn,n)=>{ const f=n.f, a=Math.min(1,tn*600); return (sinT(f*tn)*Math.exp(-tn*5)+.45*sinT(2*f*tn)*Math.exp(-tn*9)+.2*sinT(3*f*tn)*Math.exp(-tn*14))*a*.32; }},
  bass:{tail:1,fn:(tn,n)=>{ const f=n.f; return (sinT(f*tn)+.25*sinT(2*f*tn))*env(tn,.02,n.d)*.36; }},
  drone:{tail:4,fn:(tn,n)=>{ const f=n.f, a=Math.min(1,tn/(n.att||3)); const r=tn>n.d?Math.exp(-(tn-n.d)*.8):1;
    return (sinT(f*tn)+.4*sinT(1.5*f*tn+.3)*(.5+.5*Math.sin(tn*.4))+.2*triT(2*f*tn))*a*r*.28; }},
  timp:{tail:2,fn:(tn,n,s,i)=>{ const f=n.f; const ph=f*tn+.3*f*(1-Math.exp(-tn*18))/18; return (sinT(ph)*Math.exp(-tn*2.2)+nz(i)*Math.exp(-tn*35)*.3)*.6; }},
  // ---- sound effects ----
  noiseSweep:{tail:.5,stateful:true,init:()=>({a:0,b:0}),fn:(tn,n,s,i)=>{ const u=Math.min(1,tn/n.d); const fc=n.f0+(n.f1-n.f0)*u; const k=Math.min(.9,fc/SR*TAU);
    const x=nz(i); s.a+=(x-s.a)*k; s.b+=(s.a-s.b)*k; const e=Math.sin(Math.PI*Math.min(1,tn/n.d)); return (s.a-s.b)*e*e*(n.g||1)*1.8; }},
  chirp:{tail:.05,fn:(tn,n)=>{ if(tn>n.d) return 0; const u=tn/n.d; const f=n.f0*Math.pow(n.f1/n.f0,u);
    const rr=n.f1/n.f0; const ph=Math.abs(rr-1)<1e-4?n.f0*tn:n.f0*n.d*(Math.pow(rr,u)-1)/Math.log(rr);
    const vib=Math.sin(TAU*28*tn)*.04; const e=Math.sin(Math.PI*u);
    return (sinT(ph+vib)+.3*sinT(2*ph)+.12*sawT(ph))*e*(n.g||1)*.3; }},
  glitch:{tail:.05,fn:(tn,n,s,i)=>{ if(tn>n.d) return 0; const slot=Math.floor(tn*34); const f=200+((nz(slot*13)+1)*.5)*2400; const on=nz(slot*7)>-.3?1:0;
    const sq=sinT(f*tn)>0?1:-1; return (sq*.6+nz(i>>3)*.4)*on*(1-tn/n.d)*.22; }},
  thump:{tail:1.5,fn:(tn,n,s,i)=>{ const f=n.f||60; const ph=f*tn+1.5*f*(1-Math.exp(-tn*12))/12; return (sinT(ph)*Math.exp(-tn*(n.k||4))+nz(i)*Math.exp(-tn*50)*.35)*.7*(n.g||1); }},
  hum:{tail:.2,fn:(tn,n)=>{ if(tn>n.d) return 0; const T=n.t+tn; const f=n.f0+(n.f1-n.f0)*Math.min(1,tn/n.d);
    const ph=n.f0*tn+(n.f1-n.f0)*tn*tn/(2*n.d); const e=Math.min(1,tn/.3)*Math.min(1,(n.d-tn)/.3);
    return (sinT(ph)+.5*sinT(2*ph)+.25*sinT(3*ph))*e*(n.g||1)*.12; }},
  sputter:{tail:.2,stateful:true,init:()=>({y:0}),fn:(tn,n,s,i)=>{ if(tn>n.d) return 0; const slot=Math.floor(tn*14); const on=nz(slot*17+3)>.1?1:0; const ee=Math.exp(-(tn*14-slot)*5);
    s.y+=(nz(i)-s.y)*.25; return s.y*on*ee*.7; }},
  crackle:{tail:.1,fn:(tn,n,s,i)=>{ if(tn>n.d) return 0; const p=nz(i*3+11); return (p>.993?nz(i):0)*1.4*(n.g||1); }},
};

// ---------- the score (CH01 opening, 0–120 s); later chapters append here ----------
function buildScore(){
  const notes=[]; const beat=60/72, bar=beat*4;
  const add=(t,d,m,i,v=1,pan=0,o={})=>notes.push(Object.assign({t,d,f:mtof(m),m,i,v,pan,stem:'music'},o));
  const chord=(t,d,ms,i,v,o)=>ms.forEach((m,k)=>add(t,d,m,i,v,(k/(ms.length-1||1))*.8-.4,o));
  const CH={ Cmaj7:[48,55,59,64], Am7:[45,52,55,60], Fmaj7:[41,48,52,57], Gsus:[43,50,55,60], G:[43,50,55,59],
    Em7:[40,47,50,55], Fm6:[41,48,50,56], Dm9:[38,45,48,53,57], Bbmaj7:[46,53,57,62], Asus:[45,52,57,59], Fadd9:[41,48,55,57] };
  // S0: darkness drone
  add(.5,13,36,'drone',.8,-.2,{att:4}); add(1.5,12,43,'drone',.5,.2,{att:5});
  // S1: piano arpeggios (boot)
  const prog1=['Cmaj7','Am7','Fmaj7','Gsus','Cmaj7','Am7'];
  prog1.forEach((c,b)=>{ const t0=15+b*bar; const ch=CH[c]; const pat=[0,1,2,3,2,1,2,3];
    pat.forEach((k,j)=>add(t0+j*beat/2,beat*.9,ch[k]+12,'piano',.5+.15*(j===0)+.1*(b/6),.1*(j%2?1:-1)));
    add(t0,bar,ch[0]-12,'bass',.5,0); add(t0,bar*1.05,ch[0],'pad',.35+.05*b,0,{att:1.4}); });
  // S2: ARCHIVE theme (piano, then strings)
  const theme=[[0,64,1],[1,67,1],[2,74,2],[4,72,1],[5,71,.5],[5.5,69,.5],[6,67,2],[8,64,1],[9,67,1],[10,69,1],[11,71,1],[12,72,1.5],[13.5,74,.5],[14,76,2.4]];
  const prog2=['Cmaj7','Em7','Fmaj7','Gsus','Am7','Em7','Fmaj7','G'];
  const T2=35;
  theme.forEach(([b,m,d])=>add(T2+b*beat,d*beat,m+12,'piano',.9,.05));
  prog2.forEach((c,b)=>{ const t0=T2+b*bar/2; chord(t0,bar/2,CH[c].map(x=>x+12),'strings',.28,{att:.6}); add(t0,bar/2,CH[c][0]-12,'bass',.45,0); });
  const T2b=T2+16*beat;
  theme.slice(7).forEach(([b,m,d])=>add(T2b+(b-8)*beat,d*beat*1.1,m+12,'strings',.85,-.1,{att:.25}));
  ['Am7','Fmaj7','Fm6','Cmaj7'].forEach((c,b)=>{ const t0=T2b+b*bar/2; chord(t0,bar/2,CH[c],'pad',.35,{att:.8}); });
  // S3: playful pizzicato (56–78) with a gap at the startle (63.9–66.5)
  const T3=56.2, e8=beat/2;
  const pizz=[[0,67],[1,72],[2,71],[3,72],[4,74],[6,72],[8,67],[9,69],[10,71],[11,72],[12,74],[13,76],[14,74],[15,72]];
  for(let rep=0;rep<2;rep++) pizz.forEach(([k,m])=>{ const t=T3+rep*16*e8+k*e8; if(t<63.85) add(t,e8*.6,m,'pluck',.8,(k%2?.3:-.3)); });
  for(let k=0;k<12;k++){ const t=T3+k*beat; if(t<63.8) add(t,beat*.5,[36,43,40,43][k%4],'pluck',.9,0); }
  add(66.6,1.2,76,'celesta',.7,.2); add(67.4,1.2,79,'celesta',.6,-.2); add(68.4,.5,83,'celesta',.5,.3); add(69.4,.5,81,'celesta',.5,-.3);
  const T3b=70.4;
  pizz.forEach(([k,m])=>add(T3b+k*e8,e8*.6,m+12,'pluck',.75,(k%2?.35:-.35)));
  for(let k=0;k<8;k++) add(T3b+k*beat,beat*.5,[36,43,41,43][k%4],'pluck',.9,0);
  chord(T3b,bar*2,CH.Cmaj7,'pad',.25,{att:1});
  // S4: mystery (77.4–102)
  const prog4=['Fadd9','Dm9','Bbmaj7','Asus','Fadd9','Dm9','Bbmaj7'];
  prog4.forEach((c,b)=>{ const t0=77.4+b*bar; chord(t0,bar*1.02,CH[c],'pad',.42,{att:1.8}); add(t0,bar,CH[c][0]-12,'drone',.5,0,{att:1.5});
    [0,1.5,2.5].forEach((o,j)=>add(t0+o*beat,beat*2,CH[c][(j+1)%CH[c].length]+24,'celesta',.55,j?.3:-.3)); });
  for(let k=0;k<14;k++){ const t=91+k*(.42-.02*k); add(t,.2,[67,72,74,79][k%4]+12,'pluck',.55+.03*k,(k%2?.4:-.4)); }
  // S5: grand statement (102–120)
  const T5=102;
  const prog5=[['Cmaj7',0],['Am7',2],['Fmaj7',4],['G',6]];
  prog5.forEach(([c,b])=>{ const t0=T5+b*beat; chord(t0,beat*2.1,CH[c].map(x=>x+12),'strings',.42,{att:.3}); chord(t0,beat*2,[CH[c][0],CH[c][0]+7],'brass',.5,{}); add(t0,beat*2,CH[c][0]-12,'bass',.6,0); });
  theme.slice(0,7).forEach(([b,m,d])=>add(T5+b*beat,d*beat,m+12,'brass',.6,.1));
  theme.slice(0,7).forEach(([b,m,d])=>add(T5+b*beat,d*beat,m+24,'strings',.7,-.1,{att:.15}));
  add(102,.8,36,'timp',1,0); add(105.3,.8,43,'timp',.8,0); add(108.6,.8,36,'timp',.9,0);
  const T5b=T5+8*beat;
  theme.slice(7).forEach(([b,m,d])=>add(T5b+(b-8)*beat,d*beat,m+12,'strings',.8,0,{att:.12}));
  ['Am7','Fmaj7','Gsus','Cmaj7'].forEach((c,b)=>{ const t0=T5b+b*beat*2; chord(t0,beat*2.1,CH[c].map(x=>x+12),'strings',.4,{att:.25}); add(t0,beat*2,CH[c][0]-12,'bass',.6,0); });
  add(110.1,1,36,'timp',1.1,0); chord(110.1,6,[48,55,60,64,67,72],'brass',.45,{}); chord(110.1,7,[60,64,67,71,76],'pad',.5,{att:.5});
  [84,88,91,96].forEach((m,k)=>add(110.2+k*.11,3,m,'bell',.6,k*.2-.3));
  [[0,64],[1,67],[2,74]].forEach(([b,m])=>add(116.2+b*beat*1.2,beat*2,m+12,'piano',.6,0));
  chord(116.2,4,[48,55,64,71],'pad',.3,{att:1.5});
  for(const ext of (G.ARCHIVE_SCORE_EXT||[])) ext({add,chord,CH,beat,bar,theme,mtof});
  return notes;
}

function buildSfx(){
  const out=[]; const S=(o)=>out.push(Object.assign({stem:'sfx',pan:0,v:1},o));
  for(const c of AR.FILM.sfx){ const t=c.t;
    switch(c.name){
      case 'ping': S({t,d:.1,f:mtof(c.f),i:'bell',v:.9,stem:'sfx'}); S({t,d:.1,f:mtof(c.f+12),i:'celesta',v:.4}); break;
      case 'hum_rise': S({t,d:3,i:'hum',f0:55,f1:110,g:.6}); break;
      case 'boot_chime': [76,83,88].forEach((m,k)=>S({t:t+k*.12,d:.2,f:mtof(m),i:'bell',v:.7,pan:k*.3-.3})); break;
      case 'power_up': S({t,d:3.6,i:'hum',f0:60,f1:240,g:.9}); S({t,d:2.4,i:'noiseSweep',f0:300,f1:4000,g:.25}); break;
      case 'servo': S({t,d:.35,i:'chirp',f0:420,f1:560,g:.35}); break;
      case 'sputter': S({t,d:c.d,i:'sputter',v:.9}); break;
      case 'lift': S({t,d:3.6,i:'noiseSweep',f0:200,f1:900,g:.4}); S({t,d:3.6,i:'hum',f0:110,f1:150,g:.5}); break;
      case 'shake': [0,.4,.8].forEach(k=>S({t:t+k,d:.2,i:'chirp',f0:500,f1:380,g:.25})); break;
      case 'lights_on': for(let k=0;k<6;k++){ S({t:t+k*1.1,d:.6,i:'thump',f:50+k*6,k:6,g:.45}); S({t:t+k*1.1,d:.3,f:mtof(72+k*2),i:'bell',v:.25,pan:(k%2?.5:-.5)}); } break;
      case 'whoosh': S({t,d:c.d,i:'noiseSweep',f0:c.soft?250:350,f1:c.soft?1400:2600,g:c.soft?.35:.55}); break;
      case 'spin': S({t,d:1.6,i:'noiseSweep',f0:600,f1:3000,g:.35}); break;
      case 'holo_on': S({t,d:5,i:'crackle',g:.5}); for(let k=0;k<3;k++) S({t:t+.8+k*1.3,d:.15,i:'chirp',f0:1800,f1:2600,g:.2,pan:k-1}); break;
      case 'poke': S({t,d:.08,i:'chirp',f0:1500,f1:1900,g:.4}); break;
      case 'glitch': S({t,d:c.d,i:'glitch',v:1}); S({t,d:.5,i:'thump',f:90,k:9,g:.5}); break;
      case 'blip': S({t,d:.1,i:'chirp',f0:c.f,f1:c.f*1.4,g:.35}); break;
      case 'deep_tone': S({t,d:.5,i:'thump',f:41,k:.9,g:1}); S({t,d:4,i:'hum',f0:82,f1:82,g:.4}); break;
      case 'orb_rise': S({t,d:c.d,i:'noiseSweep',f0:150,f1:1800,g:.3}); for(let k=0;k<16;k++) S({t:t+k*.3,d:.2,f:mtof([79,83,86,88,91,95][k%6]),i:'celesta',v:.35,pan:Math.sin(k)*.6}); break;
      case 'touch': S({t,d:.12,f:mtof(91),i:'bell',v:.6}); break;
      case 'spin_up': S({t,d:c.d,i:'noiseSweep',f0:300,f1:5200,g:.6}); S({t,d:c.d,i:'hum',f0:120,f1:620,g:.5}); break;
      case 'thunk': S({t,d:.4,i:'thump',f:70,k:7,g:.9}); break;
      case 'pulse': S({t,d:.6,i:'thump',f:45,k:2.2,g:.8}); S({t,d:2,i:'noiseSweep',f0:2000,f1:300,g:.3}); break;
      case 'planet_morph': S({t,d:c.d,i:'noiseSweep',f0:c.rev?3000:200,f1:c.rev?200:3000,g:.45}); S({t,d:c.d,i:'hum',f0:c.rev?220:55,f1:c.rev?55:220,g:.35}); break;
      case 'title_hit': S({t,d:1,i:'thump',f:38,k:1.2,g:1}); break;
      case 'voice': voice(out,t,c.pattern); break;
      default: { const f=(G.ARCHIVE_SFX_EXT||{})[c.name]; if(f) f(S,c,{mtof}); }
    }
  }
  // continuous hover hum following thrust (sampled at 4 Hz, rendered in short overlapping grains)
  const A=AR.FILM.A;
  const animEnd=Math.max(...AR.SCENES.filter(s=>s.status==='animated').map(s=>s.end));
  for(let t=0;t<animEnd;t+=.25){ const s=A.tr.thrust.at(t)*A.tr.power.at(t); if(s>.02) out.push({t,d:.5,i:'hum',f0:95+s*40,f1:95+s*40,g:.22*s,stem:'sfx',pan:0,v:1}); }
  return out;
}
// ARCHIVE's chirp-voice placeholder (dialogue stem). Replace with recorded VO later.
function voice(out,t,p){ const V=(dt,d,f0,f1,g=1)=>out.push({t:t+dt,d,i:'chirp',f0,f1,g:.55*g,stem:'dialogue',pan:0,v:1});
  const P={ q:[[0,.16,600,760],[.2,.24,700,1150]], q2:[[0,.12,650,720],[.15,.12,720,640],[.32,.3,680,1200]],
    whoa:[[0,.5,900,520]], eep:[[0,.18,1200,2000],[.2,.12,2000,1800]], yawn:[[0,.7,500,800],[.7,.6,800,420]],
    giggle:[[0,.08,1100,1300],[.11,.08,1050,1250],[.22,.08,1000,1200],[.33,.12,950,1250]],
    hi:[[0,.14,800,1000],[.18,.25,1000,1300]], phew:[[0,.5,1000,500,.8]] };
  (P[p]||P.q).forEach(a=>V(...a)); }

let SCORE=null;
// notes are authored in story time; the edit maps them onto the output timeline (cut stretches are dropped,
// sped-up stretches play their notes closer together)
function allNotes(){ if(!SCORE){ const raw=buildScore().concat(buildSfx()); SCORE=[];
    for(const n of raw){ const m=AR.storyToOut?AR.storyToOut(n.t):{t:n.t,speed:1}; if(!m) continue; SCORE.push(Object.assign({},n,{t:m.t,d:n.d/m.speed})); }
    SCORE.sort((a,b)=>a.t-b.t); } return SCORE; }

// ---------- reverb (stateful, warmed up with pre-roll so chunks match) ----------
function makeReverb(){ const combs=[1557,1617,1491,1422,1277,1356], ap=[556,441,341];
  const mk=(sp)=>({c:combs.map(n=>({b:new Float32Array(n+sp),i:0,f:0})),a:ap.map(n=>({b:new Float32Array(n+sp),i:0}))});
  return {L:mk(0),R:mk(23)}; }
function revStep(ch,x){ let y=0; for(const c of ch.c){ const o=c.b[c.i]; c.f=o*.75+c.f*.25; c.b[c.i]=x+c.f*.83; c.i=(c.i+1)%c.b.length; y+=o; }
  y*=.16; for(const a of ch.a){ const o=a.b[a.i]; const v=y+o*.5; a.b[a.i]=v; a.i=(a.i+1)%a.b.length; y=o-v*.5; } return y; }

function renderAudio(t0,t1,opt={}){
  const pre = opt.preroll ?? 4;
  const w0=Math.round(t0*SR), w1=Math.round(t1*SR), p0=Math.max(0,Math.round((t0-pre)*SR));
  const n=w1-p0;
  const stems={music:[new Float32Array(n),new Float32Array(n)],sfx:[new Float32Array(n),new Float32Array(n)],dialogue:[new Float32Array(n),new Float32Array(n)]};
  const clips=AR.audio&&AR.audio.voClips||[], mclips=AR.audio&&AR.audio.musicClips||[];
  for(const note of allNotes()){
    const inst=INST[note.i]; if(!inst) continue;
    if(note.stem==='dialogue' && clips.length && clips.some(c=>note.t>=c.t-.25&&note.t<=c.t+c.dur+.25)) continue; // a recorded line replaces its chirps
    if(note.stem==='music' && mclips.length && mclips.some(c=>c.replace&&note.t>=c.t-.5&&note.t<c.t+c.dur)) continue; // your track replaces the generated score here
    const s0=Math.round(note.t*SR), s1=Math.round((note.t+note.d+inst.tail)*SR);
    const a=Math.max(s0,p0), b=Math.min(s1,w1); if(a>=b) continue;
    const st=inst.init?inst.init():null; const start=inst.stateful?s0:a;
    const pan=note.pan||0, gl=Math.cos((pan*.5+.5)*Math.PI/2)*1.41, gr=Math.sin((pan*.5+.5)*Math.PI/2)*1.41;
    const [L,R]=stems[note.stem]; const v=note.v;
    for(let s=start;s<b;s++){ const x=inst.fn((s-s0)/SR,note,st,s)*v; if(s>=a){ const j=s-p0; L[j]+=x*gl; R[j]+=x*gr; } }
  }
  // recorded voice-over clips (decoded PCM at SR), placed at their output times
  for(const c of clips){ const s0=Math.round(c.t*SR); const a0=Math.max(s0,p0), b0=Math.min(s0+c.L.length,w1); const [L,R]=stems.dialogue;
    for(let s=a0;s<b0;s++){ const j=s-p0, k=s-s0; L[j]+=c.L[k]*(c.gain||1); R[j]+=c.R[k]*(c.gain||1); } }
  for(const c of mclips){ const s0=Math.round(c.t*SR); const a0=Math.max(s0,p0), b0=Math.min(s0+c.L.length,w1); const [L,R]=stems.music; const fo=Math.round((c.fade||1)*SR);
    for(let s=a0;s<b0;s++){ const j=s-p0, k=s-s0, g=(c.gain||1)*Math.min(1,k/fo,(c.L.length-k)/fo); L[j]+=c.L[k]*g; R[j]+=c.R[k]*g; } }
  // reverb: music fully, sfx/dialogue lightly
  const rv=makeReverb();
  const off=w0-p0, len=w1-w0;
  const out={}; for(const k in stems) out[k]=[new Float32Array(len),new Float32Array(len)];
  for(let j=0;j<n;j++){
    const sendL=stems.music[0][j]*.55+stems.sfx[0][j]*.25+stems.dialogue[0][j]*.2, sendR=stems.music[1][j]*.55+stems.sfx[1][j]*.25+stems.dialogue[1][j]*.2;
    const yL=revStep(rv.L,sendL), yR=revStep(rv.R,sendR);
    if(j>=off){ const o=j-off;
      out.music[0][o]=stems.music[0][j]+yL*.9; out.music[1][o]=stems.music[1][j]+yR*.9;
      out.sfx[0][o]=stems.sfx[0][j]; out.sfx[1][o]=stems.sfx[1][j];
      out.dialogue[0][o]=stems.dialogue[0][j]; out.dialogue[1][o]=stems.dialogue[1][j]; }
  }
  const g=opt.gains||{music:.8,sfx:.85,dialogue:.9};
  const mix=[new Float32Array(len),new Float32Array(len)];
  for(let c=0;c<2;c++) for(let o=0;o<len;o++){ const x=out.music[c][o]*g.music+out.sfx[c][o]*g.sfx+out.dialogue[c][o]*g.dialogue; mix[c][o]=Math.tanh(x*1.1)*.92; }
  out.mix=mix; out.sampleRate=SR; return out;
}

function wav(ch,sr=SR){ const n=ch[0].length, b=new ArrayBuffer(44+n*4), d=new DataView(b);
  const w=(o,s)=>{for(let i=0;i<s.length;i++)d.setUint8(o+i,s.charCodeAt(i));};
  w(0,'RIFF'); d.setUint32(4,36+n*4,true); w(8,'WAVE'); w(12,'fmt '); d.setUint32(16,16,true); d.setUint16(20,1,true); d.setUint16(22,2,true);
  d.setUint32(24,sr,true); d.setUint32(28,sr*4,true); d.setUint16(32,4,true); d.setUint16(34,16,true); w(36,'data'); d.setUint32(40,n*4,true);
  let o=44; for(let i=0;i<n;i++){ for(let c=0;c<2;c++){ d.setInt16(o,Math.max(-1,Math.min(1,ch[c][i]))*32767,true); o+=2; } } return b; }

AR.audio={SR,renderAudio,wav,allNotes,INST,voClips:[],musicClips:[]};
})(typeof window!=='undefined'?window:globalThis);
