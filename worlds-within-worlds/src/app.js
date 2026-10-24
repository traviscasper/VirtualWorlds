(function(){
'use strict';
const A=window.ARCHIVE, $=id=>document.getElementById(id);
const RENDER=/[?&]render=1/.test(location.search);
const glC=$('gl'), ovC=$('ov'), ov=ovC.getContext('2d');
let R;
try{ R=new A.Renderer(glC,$('shader-src').textContent); }
catch(e){ $('msg').textContent='Could not start the 3D renderer: '+e.message; throw e; }

// ---------- headless render mode (used by render.mjs) ----------
if(RENDER){
  document.body.classList.add('render');
  glC.width=ovC.width=1920; glC.height=ovC.height=1080;
  const comp=document.createElement('canvas'); comp.width=1920; comp.height=1080; const cx=comp.getContext('2d');
  // view (optional): {expr, yaw, pitch, dist, fov, ty} — character turnaround / expression test renders
  window.__renderFrame=(t,q=1,w=1920,h=1080,view=null)=>{
    if(glC.width!==w){ glC.width=ovC.width=comp.width=w; glC.height=ovC.height=comp.height=h; }
    R.quality=q; const st=A.evaluate(t);
    if(view&&view.equirect) st.equirect=true; if(view&&view.stereo) st.stereo=true;
    if(view&&(view.expr||view.camPos||view.dist||view.yaw!=null)){ const a=st.a, c=st.c;
      if(view.expr){ const v=A.EXPR[view.expr]; A.EXPR_KEYS.forEach((k,i)=>a[k]=v[i]); a.eyePow=[1,1]; a.power=Math.max(a.power,1); a.headYaw=0; a.headPitch=0; a.headTilt=0; }
      const p=a.pos, y=a.yaw+(view.yaw||0), pt=view.pitch||0, d=view.dist||3.4, ty=view.ty??.05;
      c.tgt=[p[0],p[1]+ty,p[2]]; c.pos=[p[0]+Math.sin(y)*Math.cos(pt)*d, p[1]+ty+Math.sin(pt)*d, p[2]+Math.cos(y)*Math.cos(pt)*d];
      if(view.camPos){ c.pos=view.camPos; c.tgt=view.camTgt; }
      c.roll=0; c.proj=0; c.fov=view.fov||38; }
    if(R.gl.isContextLost()) return 'CONTEXT_LOST';
    R.tiles=(view&&view.equirect)?8:4; R.render(st); R.gl.finish();
    if(R.gl.isContextLost()) return 'CONTEXT_LOST';     // the graphics driver reset: tell the renderer to reload and retry
    A.drawOverlay(ov,st,w,h,{}); cx.fillStyle='#000'; cx.fillRect(0,0,w,h); cx.drawImage(glC,0,0); cx.drawImage(ovC,0,0);
    return comp.toDataURL('image/jpeg',.95);
  };
  window.__manifest=()=>A.manifest();
  window.__ready=true; return;
}

// ---------- state ----------
const S={ t:0, playing:false, speed:1, quality:1, scale:.75, captions:false, expr:'', move:null, moveT0:0, hide:false,
  cam:'film', proj:'film', planetZ:2.6, fov:null, orbit:{yaw:.6,pitch:.25,dist:3.2,ty:.2,rel:false}, viewFov:null, mute:{music:false,sfx:false,dialogue:false}, vol:.85, tts:false };

// ---------- UI construction ----------
Object.keys(A.EXPR).forEach(k=>{ const o=document.createElement('option'); o.value=k; o.textContent=k[0].toUpperCase()+k.slice(1); $('exprSel').appendChild(o); });
const MOVES={ Wave:'wave', Point:'point', Spin:'spin', Scan:'scan', Celebrate:'celebrate', Startle:'startle' };
for(const [label,id] of Object.entries(MOVES)){ const b=document.createElement('button'); b.className='chip'; b.textContent=label; b.onclick=()=>{ S.move=id; S.moveT0=performance.now()/1000; }; $('moves').appendChild(b); }
A.CHAPTERS.forEach((c,i)=>{ const o=document.createElement('option'); o.value=i; o.textContent=`${c[0]} ${c[1]}`; $('chapSel').appendChild(o); });
const tl=$('tl'), D=A.FILM_SECONDS;
A.CHAPTERS.forEach((c,i)=>{ const d=document.createElement('div'); d.className='ch'; d.style.left=(i*10)+'%'; d.style.width='10%'; d.innerHTML=`<b>${c[1]}</b><span>${c[0]}</span>`; tl.appendChild(d); });
const animEnd=Math.max(...A.SCENES.filter(s=>s.status==='animated').map(s=>s.end));
const done=document.createElement('div'); done.className='done'; done.style.left='0'; done.style.width=(animEnd/D*100)+'%'; tl.appendChild(done);
A.SCENES.forEach(s=>{ const k=document.createElement('div'); k.className='tick'; k.style.left=(s.start/D*100)+'%'; tl.appendChild(k); });
const list=$('sceneList');
A.SCENES.forEach(s=>{ const b=document.createElement('button'); b.dataset.id=s.id; b.innerHTML=`<span>${s.id} ${s.title}</span><span class="st ${s.status==='animated'?'ok':''}">${s.status==='animated'?'Animated':'Planned'}</span>`; b.onclick=()=>seek(s.start); list.appendChild(b); });

// ---------- sizing ----------
function resize(){ const r=$('stage').getBoundingClientRect(); const dpr=Math.min(devicePixelRatio||1,2);
  const w=Math.round(r.width*dpr*S.scale), h=Math.round(w*9/16); if(glC.width!==w){ glC.width=ovC.width=w; glC.height=ovC.height=h; } }
addEventListener('resize',resize); resize();

// ---------- overrides ----------
function applyOverrides(st){
  const now=performance.now()/1000, a=st.a;
  if(S.v360==='equi'||S.v360==='vr') st.equirect=true; if(S.v360==='vr') st.stereo=true;
  if(S.v360==='look'){ const c=st.c, d=V3.sub(c.tgt,c.pos), L=Math.hypot(...d), y0=Math.atan2(d[0],d[2]), p0=Math.asin(Math.max(-1,Math.min(1,d[1]/L)));
    const y=y0+S.look.yaw, p=Math.max(-1.45,Math.min(1.45,p0+S.look.pitch)); c.tgt=[c.pos[0]+Math.sin(y)*Math.cos(p)*L, c.pos[1]+Math.sin(p)*L, c.pos[2]+Math.cos(y)*Math.cos(p)*L]; c.roll=0; c.proj=0; }
  if(S.expr){ const v=A.EXPR[S.expr]; A.EXPR_KEYS.forEach((k,i)=>a[k]=v[i]); a.eyePow=[1,1]; a.power=Math.max(a.power,1); }
  if(S.move){ const u=now-S.moveT0; const R0=[.25,.35,.5];
    const env=Math.min(1,u/.3)*Math.min(1,Math.max(0,(2.2-u)/.3));
    if(u>2.2) S.move=null;
    else switch(S.move){
      case 'wave': a.armR=[A.util.lerp(a.armR[0],2.55,env),.55,.9+Math.sin(u*11)*.5*env]; break;
      case 'point': a.armR=[A.util.lerp(a.armR[0],1.45,env),.15,.05]; break;
      case 'spin': a.yaw+=A.util.sstep(0,2.2,u)*Math.PI*2; break;
      case 'scan': a.headYaw+=Math.sin(u/2.2*Math.PI*2)*.8*env; break;
      case 'celebrate': a.armL=a.armR=[A.util.lerp(.25,2.7,env),.9,.3]; a.pos=a.pos.slice(); a.pos[1]+=Math.abs(Math.sin(u*6))*.15*env; if(!S.expr){a.happy=1;a.smile=1;} break;
      case 'startle': a.pos=a.pos.slice(); a.pos[2]-=.4*env; a.size=1.3; a.open=1.25; a.mouthOpen=.85; break;
    } }
  if(S.hide){ a.pos=[0,-50,0]; a.power=0; }
  const c=st.c;
  if(S.cam==='orbit'){ const o=S.orbit, p=a.pos, y=o.yaw+(o.rel?a.yaw:0); c.tgt=[p[0],p[1]+o.ty,p[2]];
    c.pos=[p[0]+Math.sin(y)*Math.cos(o.pitch)*o.dist, p[1]+o.ty+Math.sin(o.pitch)*o.dist, p[2]+Math.cos(y)*Math.cos(o.pitch)*o.dist]; c.roll=0; c.proj=0;
    if(S.viewFov) c.fov=S.viewFov; }
  if(S.proj==='persp') c.proj=0; else if(S.proj==='planet'){ c.proj=1; c.planet=S.planetZ; }
  if(S.fov) c.fov=S.fov;
}

// ---------- audio streaming (20 s blocks, generated on demand) ----------
let ac=null, master=null, gains={}, blocks=new Map(), playing=[], audioAnchor=null;
const BLK=20;
function ensureAudio(){ if(ac) return; ac=new (window.AudioContext||window.webkitAudioContext)({sampleRate:48000});
  master=ac.createGain(); master.gain.value=S.vol; master.connect(ac.destination);
  ['music','sfx','dialogue'].forEach(k=>{ gains[k]=ac.createGain(); gains[k].gain.value=S.mute[k]?0:1; gains[k].connect(master); }); }
function getBlock(i){ if(blocks.has(i)) return blocks.get(i);
  const p=new Promise(res=>setTimeout(()=>{ const t0=i*BLK, t1=Math.min(D,t0+BLK); const r=A.audio.renderAudio(t0,t1);
    const out={}; for(const k of ['music','sfx','dialogue']){ const b=ac.createBuffer(2,r[k][0].length,48000); b.copyToChannel(r[k][0],0); b.copyToChannel(r[k][1],1); out[k]=b; } res(out); },0));
  blocks.set(i,p); if(blocks.size>12){ const first=blocks.keys().next().value; if(first!==i) blocks.delete(first); } return p; }
function stopAudio(){ if(playing.pump) clearInterval(playing.pump); playing.forEach(n=>{try{n.stop();}catch(e){}}); playing=[]; }
async function startAudio(t){
  ensureAudio(); await ac.resume(); stopAudio();
    $('audioNote').textContent='Preparing sound…';
  const i0=Math.floor(t/BLK); const b0=await getBlock(i0);
  if(!S.playing) return;
  const startCtx=ac.currentTime+.08; audioAnchor={ctx:startCtx,t};
  const sched=(i,b)=>{ const bt0=i*BLK; const when=startCtx+(bt0-t); const off=Math.max(0,t-bt0);
    for(const k in b){ const src=ac.createBufferSource(); src.buffer=b[k]; src.connect(gains[k]); src.start(Math.max(when,startCtx),off); playing.push(src); } };
  sched(i0,b0); $('audioNote').textContent='Sound is generated on your device as the film plays.';
  let next=i0+1; const pump=async()=>{ if(!S.playing||next*BLK>=D) return; const nb=await getBlock(next); if(!S.playing) return; sched(next,nb); next++; };
  playing.pump=setInterval(()=>{ if(!S.playing) return; const tNow=clock(); if(tNow>next*BLK-12) pump(); },500); pump();
}
function clock(){ const a=audioAnchor; if(!a) return S.t;
  if(a.ctx!==undefined&&ac) return a.t+Math.max(0,ac.currentTime-a.ctx);
  return a.t+(performance.now()/1000-a.wall)*S.speed; }
function play(){ if(S.playing) return; S.playing=true; $('play').textContent='Pause'; $('play').setAttribute('aria-label','Pause');
  if(S.speed!==1||!(window.AudioContext||window.webkitAudioContext)){ audioAnchor={wall:performance.now()/1000,t:S.t}; return; }
  audioAnchor=null; startAudio(S.t).catch(()=>{ audioAnchor={wall:performance.now()/1000,t:S.t}; $('audioNote').textContent='Sound could not start; playing silently.'; }); }
function pause(){ S.t=clock(); S.playing=false; $('play').textContent='Play'; $('play').setAttribute('aria-label','Play'); stopAudio(); if(playing.pump) clearInterval(playing.pump); audioAnchor=null; if(window.speechSynthesis) speechSynthesis.cancel(); }
function seek(t){ const was=S.playing; if(was) pause(); S.t=Math.max(0,Math.min(D-.01,t)); spoken.clear(); if(was) play(); }

// ---------- voice preview ----------
const spoken=new Set();
function speak(st){ if(!S.tts||!S.playing||!window.speechSynthesis) return;
  for(const d of A.FILM.dialogue){ if(st.tt>=d.start&&st.tt<d.start+.3&&!spoken.has(d.text+d.start)){ spoken.add(d.text+d.start); const u=new SpeechSynthesisUtterance(d.text); u.pitch=1.7; u.rate=1.05; speechSynthesis.speak(u); } } }

// ---------- main loop ----------
let lastScene='';
function frame(){
  if(S.playing){ S.t=clock(); if(S.t>=D){ S.t=D-.01; pause(); } }
  const st=A.evaluate(S.t); applyOverrides(st);
  R.quality=S.quality; R.render(st); A.drawOverlay(ov,st,ovC.width,ovC.height,{captions:S.captions}); speak(st);
  const tc=S.t, h=Math.floor(tc/3600), m=Math.floor(tc/60)%60, s=Math.floor(tc)%60, f=Math.floor((tc%1)*30);
  $('tc').firstChild.nodeValue=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(f).padStart(2,'0')}`;
  $('where').textContent=`${st.scene.id} · ${st.scene.title}`;
  $('ph').style.left=(S.t/D*100)+'%';
  if(lastScene!==st.scene.id){ lastScene=st.scene.id; list.querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',b.dataset.id===st.scene.id)); $('chapSel').value=st.chapter.index; }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------- controls ----------
$('play').onclick=()=>S.playing?pause():play();
$('restart').onclick=()=>seek(0);
const sceneIdx=()=>A.SCENES.findIndex(s=>S.t>=s.start&&S.t<s.end);
$('prevS').onclick=()=>{ const i=sceneIdx(); const s=A.SCENES[Math.max(0,S.t-A.SCENES[i].start>1.5?i:i-1)]; seek(s.start); };
$('nextS').onclick=()=>{ const i=sceneIdx(); seek(A.SCENES[Math.min(A.SCENES.length-1,i+1)].start); };
$('speed').onchange=e=>{ const was=S.playing; if(was) pause(); S.speed=+e.target.value; $('audioNote').textContent=S.speed===1?'Sound is generated on your device as the film plays.':'Sound plays at normal speed only.'; if(was) play(); };
$('chapSel').onchange=e=>{ const o=A.storyToOut(+e.target.value*540+.01); seek(o?o.t:+e.target.value*540); };
// deep link from the FLE Virtual Worlds portal: ?chapter=0-9 (story chapter) or ?t=seconds (film time)
{ const q=new URLSearchParams(location.search), ch=q.get('chapter'), tt=q.get('t');
  if(ch!=null&&/^\d$/.test(ch)){ $('chapSel').value=ch; $('chapSel').onchange({target:$('chapSel')}); } else if(tt!=null&&isFinite(+tt)) seek(+tt); }
// jump list of the action scenes (the edit's inserts), in film order, with their time in the finished film
{ const fmt=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
  const acts=A.edit().inserts.map(i=>({i,t:A.storyToOut(i.from).t})).sort((a,b)=>a.t-b.t);
  for(const {i,t} of acts){ const o=document.createElement('option'); o.value=t; const ch=(i.id.match(/^CH(\d+)/)||[])[1];
    o.textContent=`${fmt(t)} \u00B7 Ch ${+ch} \u00B7 ${i.title}`; $('actSel').appendChild(o); }
  $('actSel').onchange=e=>{ if(e.target.value!=='') seek(+e.target.value); e.target.value=''; }; }
addEventListener('keydown',e=>{ if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return; if(e.code==='Space'){ e.preventDefault(); S.playing?pause():play(); }
  if(e.code==='ArrowRight') seek(S.t+(e.shiftKey?10:1)); if(e.code==='ArrowLeft') seek(S.t-(e.shiftKey?10:1)); });
let drag=false; const scrub=e=>{ const r=tl.getBoundingClientRect(); seek((e.clientX-r.left)/r.width*D); };
tl.addEventListener('pointerdown',e=>{ drag=true; tl.setPointerCapture(e.pointerId); scrub(e); });
tl.addEventListener('pointermove',e=>{ if(drag) scrub(e); }); tl.addEventListener('pointerup',()=>drag=false);
$('exprSel').onchange=e=>S.expr=e.target.value;
$('hideArc').onclick=e=>{ S.hide=!S.hide; e.target.setAttribute('aria-pressed',S.hide); };
$('camMode').onchange=e=>{ S.cam=e.target.value; S.viewFov=S.cam==='orbit'?38:null; };
// character views: full body, face, side, back (relative to the way ARCHIVE is facing)
const VIEWS={ full:{yaw:0,pitch:.08,dist:3.4,ty:.05}, face:{yaw:0,pitch:.05,dist:1.6,ty:.45}, side:{yaw:Math.PI/2,pitch:.05,dist:3.2,ty:.05}, back:{yaw:Math.PI,pitch:.1,dist:3.4,ty:.05} };
document.querySelectorAll('#views .chip').forEach(b=>b.onclick=()=>{ const v=b.dataset.v;
  if(v==='film'){ S.cam='film'; S.viewFov=null; $('camMode').value='film'; return; }
  Object.assign(S.orbit,VIEWS[v],{rel:true}); S.cam='orbit'; S.viewFov=38; $('camMode').value='orbit'; $('zoomR').value=S.orbit.dist; });
$('zoomR').oninput=e=>{ if(S.cam!=='orbit'){ Object.assign(S.orbit,VIEWS.full,{rel:true}); S.cam='orbit'; S.viewFov=38; $('camMode').value='orbit'; } S.orbit.dist=+e.target.value; };
$('projSel').onchange=e=>S.proj=e.target.value;
$('planetZ').oninput=e=>S.planetZ=+e.target.value;
$('fovLock').onclick=e=>{ const on=e.target.getAttribute('aria-pressed')!=='true'; e.target.setAttribute('aria-pressed',on); $('fovR').disabled=!on; if(on){ $('fovR').value=45; S.fov=45; } else S.fov=null; };
$('fovR').oninput=e=>S.fov=+e.target.value;
$('qual').onchange=e=>S.quality=+e.target.value;
$('resScale').onchange=e=>{ S.scale=+e.target.value; resize(); };
$('capT').onclick=e=>{ S.captions=!S.captions; e.target.setAttribute('aria-pressed',S.captions); };
$('vol').oninput=e=>{ S.vol=+e.target.value; if(master) master.gain.value=S.vol; };
document.querySelectorAll('[data-stem]').forEach(b=>b.onclick=()=>{ const k=b.dataset.stem; S.mute[k]=!S.mute[k]; b.setAttribute('aria-pressed',!S.mute[k]); if(gains[k]) gains[k].gain.value=S.mute[k]?0:1; });
$('tts').onclick=e=>{ S.tts=!S.tts; e.target.setAttribute('aria-pressed',S.tts); if(!window.speechSynthesis) $('audioNote').textContent='This browser has no speech voice; captions still work.'; };
const touches=new Map(); let pinch0=null;
$('stage').addEventListener('pointerdown',e=>{ touches.set(e.pointerId,{x:e.clientX,y:e.clientY}); if(touches.size===2&&S.cam==='orbit'){ const [p,q]=[...touches.values()]; pinch0={d:Math.hypot(p.x-q.x,p.y-q.y),dist:S.orbit.dist}; orbDrag=null; } });
$('stage').addEventListener('pointermove',e=>{ if(!touches.has(e.pointerId)) return; touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch0&&touches.size===2){ const [p,q]=[...touches.values()]; const d=Math.hypot(p.x-q.x,p.y-q.y); S.orbit.dist=Math.max(1.2,Math.min(12,pinch0.dist*pinch0.d/Math.max(d,1))); $('zoomR').value=S.orbit.dist; } });
const endTouch=e=>{ touches.delete(e.pointerId); if(touches.size<2) pinch0=null; };
$('stage').addEventListener('pointerup',endTouch); $('stage').addEventListener('pointercancel',endTouch);
const V3={sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]]}; S.look={yaw:0,pitch:0}; S.v360='off';
$('v360').onchange=e=>{ S.v360=e.target.value; S.look={yaw:0,pitch:0}; $('lookReset').hidden=S.v360!=='look'; };
$('lookReset').onclick=()=>{ S.look={yaw:0,pitch:0}; };
let lookDrag=null; $('stage').addEventListener('pointerdown',e=>{ if(S.v360!=='look'||S.cam==='orbit') return; lookDrag={x:e.clientX,y:e.clientY}; $('stage').setPointerCapture(e.pointerId); });
$('stage').addEventListener('pointermove',e=>{ if(!lookDrag) return; S.look.yaw+=(e.clientX-lookDrag.x)*.006; S.look.pitch-=(e.clientY-lookDrag.y)*.005; lookDrag={x:e.clientX,y:e.clientY}; });
$('stage').addEventListener('pointerup',()=>lookDrag=null); $('stage').addEventListener('dblclick',()=>{ S.look={yaw:0,pitch:0}; });
let orbDrag=null; $('stage').addEventListener('pointerdown',e=>{ if(S.cam!=='orbit'||touches.size>1) return; orbDrag={x:e.clientX,y:e.clientY}; $('stage').setPointerCapture(e.pointerId); });
$('stage').addEventListener('pointermove',e=>{ if(!orbDrag||pinch0) return; S.orbit.yaw-=(e.clientX-orbDrag.x)*.008; S.orbit.pitch=Math.max(-.4,Math.min(1.3,S.orbit.pitch+(e.clientY-orbDrag.y)*.006)); orbDrag={x:e.clientX,y:e.clientY}; });
$('stage').addEventListener('pointerup',()=>orbDrag=null);
$('stage').addEventListener('wheel',e=>{ if(S.cam!=='orbit') return; e.preventDefault(); S.orbit.dist=Math.max(1.2,Math.min(12,S.orbit.dist*(1+e.deltaY*.001))); $('zoomR').value=S.orbit.dist; },{passive:false});

function range(){ const v=$('rng').value; const sc=A.sceneAt(S.t), ch=A.chapterAt(S.t);
  return v==='opening'?[0,120]:v==='scene'?[sc.start,sc.end]:v==='chapter'?[ch.start,ch.end]:[0,D]; }
function download(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000); }
// recorded voice-over: files named <LINE-ID>.wav replace the placeholder chirps for those lines
$('voIn').onchange=async e=>{ ensureAudio(); const byId={}; for(const d of A.FILM.dialogue) byId[d.id]=d; let n=0, skipped=[];
  for(const f of e.target.files){ const id=f.name.replace(/\.wav$/i,''); const d=byId[id]; if(!d){ skipped.push(f.name); continue; }
    try{ const buf=await ac.decodeAudioData(await f.arrayBuffer()); const L=buf.getChannelData(0), R=buf.numberOfChannels>1?buf.getChannelData(1):L;
      const out=A.storyToOut(d.start); if(!out) continue; A.audio.voClips=A.audio.voClips.filter(c=>c.id!==id);
      A.audio.voClips.push({id,t:out.t,L:new Float32Array(L),R:new Float32Array(R),dur:buf.duration}); n++; } catch(err){ skipped.push(f.name); } }
  blocks.clear(); $('voNote').textContent=`${n} line(s) loaded`+(skipped.length?`; not matched: ${skipped.slice(0,4).join(', ')}${skipped.length>4?'…':''}`:''); };
async function decodeWav(file){ ensureAudio(); const buf=await ac.decodeAudioData(await file.arrayBuffer());
  const n=Math.round(buf.duration*48000), off=new OfflineAudioContext(2,n,48000), src=off.createBufferSource(); src.buffer=buf; src.connect(off.destination); src.start(); const r=await off.startRendering();
  return {L:r.getChannelData(0),R:r.getChannelData(1)}; }
$('voIn').onchange=async e=>{ const byId={}; for(const d of A.FILM.dialogue) byId[d.id]=d; let n=0, miss=[];
  for(const f of e.target.files){ const id=f.name.replace(/\.wav$/i,''); const d=byId[id]; if(!d){ miss.push(f.name); continue; }
    const pcm=await decodeWav(f); const o=A.storyToOut(d.start); if(!o) continue; A.audio.voClips=A.audio.voClips.filter(c=>c.id!==id); A.audio.voClips.push({id,t:o.t,L:pcm.L,R:pcm.R,dur:pcm.L.length/48000}); n++; }
  blocks.clear(); $('voNote').textContent=`${n} recorded line(s) loaded.`+(miss.length?` No matching line for: ${miss.join(', ')}`:''); };
$('muIn').onchange=async e=>{ const files=[...e.target.files]; const cf=files.find(f=>/\.json$/i.test(f.name)); if(!cf){ $('voNote').textContent='Add cues.json together with the music files.'; return; }
  const cues=JSON.parse(await cf.text()); let n=0; A.audio.musicClips=[];
  for(const q of cues){ const f=files.find(x=>x.name===q.file); if(!f) continue; const sc=q.scene?A.SCENES.find(s=>s.id===q.scene):null; const st=(q.story!=null?q.story:(sc?sc.start:0))+(q.offset||0);
    const o=A.storyToOut(st); if(!o) continue; const pcm=await decodeWav(f); A.audio.musicClips.push({t:o.t,L:pcm.L,R:pcm.R,dur:pcm.L.length/48000,gain:q.gain??1,replace:q.replace!==false,fade:q.fade??1}); n++; }
  blocks.clear(); $('voNote').textContent=`${n} music cue(s) loaded.`; };
$('manBtn').onclick=()=>download(new Blob([JSON.stringify(A.manifest(),null,2)],{type:'application/json'}),'archive_manifest.json');
$('wavBtn').onclick=async()=>{ const [t0,t1]=range(); if(t1-t0>600){ $('recNote').textContent='Audio export here is limited to 10 minutes at a time; use render.mjs for longer ranges.'; return; }
  $('recNote').textContent='Generating audio…'; await new Promise(r=>setTimeout(r,30)); const r=A.audio.renderAudio(t0,t1);
  download(new Blob([A.audio.wav(r.mix)],{type:'audio/wav'}),`archive_${Math.round(t0)}-${Math.round(t1)}s_mix.wav`); $('recNote').textContent='Audio downloaded.'; };

// ---------- real-time recording (MediaRecorder) ----------
$('recBtn').onclick=async()=>{
  if(!window.MediaRecorder){ $('recNote').textContent='This browser cannot record video. Use Chrome or Edge, or render.mjs.'; return; }
  const [t0,t1]=range(); if(t1-t0>900){ $('recNote').textContent='Real-time recording is limited to 15 minutes per file. Record chapter by chapter, or use render.mjs.'; return; }
  pause(); const btn=$('recBtn'); btn.disabled=true;
  const is360=S.v360!=='off', isVR=S.v360==='vr'; const W=is360?2560:1920, H=isVR?2560:(is360?1280:1080), oldW=glC.width, oldH=glC.height; glC.width=ovC.width=W; glC.height=ovC.height=H; // 360: equirectangular, front = film camera
  const comp=document.createElement('canvas'); comp.width=W; comp.height=H; const cx=comp.getContext('2d');
  ensureAudio(); await ac.resume(); $('recNote').textContent='Generating sound for the recording…'; await new Promise(r=>setTimeout(r,30));
  const r=A.audio.renderAudio(t0,t1); const buf=ac.createBuffer(2,r.mix[0].length,48000); buf.copyToChannel(r.mix[0],0); buf.copyToChannel(r.mix[1],1);
  const dest=ac.createMediaStreamDestination(); const src=ac.createBufferSource(); src.buffer=buf; src.connect(dest);
  const vs=comp.captureStream(30); const stream=new MediaStream([...vs.getVideoTracks(),...dest.stream.getAudioTracks()]);
  const types=['video/mp4;codecs=avc1.640028,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm'];
  const mime=types.find(t=>MediaRecorder.isTypeSupported(t))||'';
  const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:16e6,audioBitsPerSecond:192e3}); const chunks=[];
  rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  let slow=0, frames=0;
  rec.onstop=()=>{ const ext=mime.includes('mp4')?'mp4':'webm'; download(new Blob(chunks,{type:mime||'video/webm'}),`ARCHIVE_${Math.round(t0)}-${Math.round(t1)}s${isVR?'_VR360_TB':(is360?'_360':'')}.${ext}`);
    glC.width=ovC.width=oldW; glC.height=ovC.height=oldH; btn.disabled=false; $('recBar').style.width='0';
    $('recNote').textContent=`Saved ${ext.toUpperCase()}${is360?(isVR?' (VR 3D 360, top/bottom — tag it as spherical + stereoscopic top/bottom before uploading)':' (360 — tag it with the Spatial Media Metadata Injector before uploading)'):''}. `+(slow/frames>.05?`About ${Math.round(slow/frames*100)}% of frames took longer than 1/30 s, so motion may stutter; try render.mjs.`:'Recording kept up with real time.'); };
  rec.start(1000); const startCtx=ac.currentTime+.1; src.start(startCtx); $('recNote').textContent='Recording… keep this tab visible.';
  const step=()=>{ const t=t0+Math.max(0,ac.currentTime-startCtx); if(t>=t1){ rec.stop(); return; }
    const p0=performance.now(); const st=A.evaluate(t); if(is360) st.equirect=true; if(isVR) st.stereo=true; R.quality=1; R.render(st); A.drawOverlay(ov,st,W,H,{}); cx.drawImage(glC,0,0); cx.drawImage(ovC,0,0);
    frames++; if(performance.now()-p0>34) slow++; $('recBar').style.width=((t-t0)/(t1-t0)*100)+'%'; requestAnimationFrame(step); };
  requestAnimationFrame(step);
};
})();
