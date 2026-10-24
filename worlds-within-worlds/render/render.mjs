#!/usr/bin/env node
/* ARCHIVE render pipeline — frame-exact, chunked, resumable.
   Usage examples:
     node render.mjs --from 0 --to 120                 # opening, 1920x1080, 30 fps
     node render.mjs --chapter 1                       # CH01 (0:00–9:00)
     node render.mjs --film                            # all 90 minutes, 5-minute segments
     node render.mjs --film --assemble-only            # just join finished segments + audio
   Options: --width 1920 --height 1080 --fps 30 --quality 1 --segment 300 --workers 1
            --out ./out --crf 16 --preset medium --headed (use real GPU window) --swiftshader (CPU only)
            --angle gl  (Windows: use the OpenGL graphics path if loading is very slow; also d3d11, vulkan)
            --vr   (VR 3D: stereoscopic 360°, top/bottom, 3840x3840 by default)
            --360  (equirectangular 360° video, 3840x1920 by default; the centre of the frame is always the film camera's forward)
            --vo ./vo  (folder of recorded lines named <LINE-ID>.wav; see docs/RECORDING_SCRIPT.md)
   Requires: Node 18+, `npm i playwright` + `npx playwright install chromium`, and ffmpeg on PATH. */
import fs from 'fs'; import path from 'path'; import vm from 'vm'; import { spawn, spawnSync } from 'child_process'; import { fileURLToPath, pathToFileURL } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2); const arg=(k,d)=>{ const i=argv.indexOf('--'+k); return i<0?d:(argv[i+1]&&!argv[i+1].startsWith('--')?argv[i+1]:true); };
const VR=!!arg('vr',false); const V360=VR||!!arg('360',false); const FPS=+arg('fps',30), W=+arg('width',V360?3840:1920), H=+arg('height',VR?3840:(V360?1920:1080)), Q=+arg('quality',1), SEG=+arg('segment',300), WORKERS=+arg('workers',1);
const OUT=path.resolve(arg('out',path.join(here,'out'))), CRF=String(arg('crf',16)), PRESET=String(arg('preset','medium'));
const STUDIO=path.resolve(arg('studio',path.join(here,'..','ARCHIVE_Studio.html')));
let FROM=+arg('from',0), TO=+arg('to',120);
if(arg('chapter')){ const c=+arg('chapter'); FROM=(c-1)*540; TO=c*540; }
if(arg('film')){ FROM=0; TO=5400; }
const label=`${String(Math.round(FROM)).padStart(4,'0')}-${String(Math.round(TO)).padStart(4,'0')}`;
const SEGDIR=path.join(OUT,'segments',`${W}x${H}_q${Q}`); fs.mkdirSync(SEGDIR,{recursive:true}); fs.mkdirSync(path.join(OUT,'audio'),{recursive:true});
const log=(...a)=>console.log(new Date().toISOString().slice(11,19),...a);

function ffprobe(file){ const r=spawnSync('ffprobe',['-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=nb_read_frames,width,height,r_frame_rate:format=duration','-of','json',file]);
  try{ return JSON.parse(r.stdout.toString()); }catch(e){ return null; } }
function segOk(file,frames){ if(!fs.existsSync(file)) return false; const p=ffprobe(file); const s=p&&p.streams&&p.streams[0]; return !!s && +s.nb_read_frames===frames && +s.width===W && +s.height===H; }

// ---------- segments ----------
const f0=Math.round(FROM*FPS), f1=Math.round(TO*FPS), segF=Math.round(SEG*FPS);
const segs=[]; for(let a=Math.floor(f0/segF)*segF; a<f1; a+=segF){ const s=Math.max(a,f0), e=Math.min(a+segF,f1); segs.push({s,e,file:path.join(SEGDIR,`seg_${String(s).padStart(6,'0')}_${String(e).padStart(6,'0')}.mp4`)}); }
const progFile=path.join(OUT,'progress.json');
const prog={range:[FROM,TO],fps:FPS,size:[W,H],quality:Q,segments:segs.map(s=>({file:path.basename(s.file),frames:s.e-s.s,status:'pending'})),startedAt:new Date().toISOString()};
const saveProg=()=>fs.writeFileSync(progFile,JSON.stringify(prog,null,2));

async function renderSegments(){
  const todo=segs.filter((s,i)=>{ const ok=segOk(s.file,s.e-s.s); if(ok) prog.segments[i].status='done'; return !ok; });
  saveProg(); if(!todo.length){ log('All segments already rendered.'); return; }
  log(`${todo.length} of ${segs.length} segments to render at ${W}x${H}, quality ${Q}.`);
  let pw; try{ pw=await import('playwright'); }catch(e){ pw=await import(process.env.PLAYWRIGHT_MODULE||'/home/claude/.npm-global/lib/node_modules/playwright/index.mjs'); }
  const args=arg('swiftshader')?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']:['--ignore-gpu-blocklist','--enable-gpu-rasterization',`--use-angle=${arg('angle',process.platform==='win32'?'gl':'default')}`  /* Windows' default Direct3D path can't compile the film's large shader; OpenGL can */];
  const browser=await pw.chromium.launch({headless:!arg('headed'),args});
  const t0=Date.now(); let doneFrames=0; const total=todo.reduce((a,s)=>a+s.e-s.s,0);
  async function worker(id){
    const page=await browser.newPage({viewport:{width:W,height:H}});
    let loadErr=null; page.on('pageerror',e=>{ log(`[w${id}] page error:`,e.message||String(e)); if(e.stack) log(String(e.stack).split('\n').slice(0,4).join('\n')); loadErr=loadErr||e; });
    page.on('console',m=>{ if(m.type()==='error'||m.type()==='warning') log(`[w${id}] browser ${m.type()}:`,m.text().slice(0,600)); }); page.on('crash',()=>log(`[w${id}] the browser page crashed (often out of GPU or memory). Try --workers 1 or a smaller --width.`));
    // The film's shader is very large; on Windows the graphics driver can take several minutes to compile it the
    // first time, and the page's "load" event waits for that. So don't time out on load; wait up to 20 min for ready.
    let tl=Date.now();
    async function load(){
    if(id===0) log('Loading the film and compiling its shaders (this can take a few minutes)…');
      tl=Date.now();
      for(let attempt=1;;attempt++){ loadErr=null;
        const tick=setInterval(()=>log(`  still compiling… ${Math.round((Date.now()-tl)/1000)} s`),30000);
        try{ await page.goto(pathToFileURL(STUDIO).href+'?render=1',{waitUntil:'commit',timeout:0});
          await Promise.race([ page.waitForFunction(()=>window.__ready,null,{timeout:1200000,polling:1000}),
            new Promise((_,rej)=>{ const iv=setInterval(()=>{ if(loadErr){ clearInterval(iv); rej(loadErr); } },500); }) ]);
          break; }
        catch(err){ if(attempt>=3) throw new Error('The film failed to load 3 times. The graphics driver could not compile the shader. Try --angle vulkan or --angle d3d11, update your graphics driver, or close other apps using the GPU.');
          log(`  load failed (${err.message||err}). Retrying (attempt ${attempt+1} of 3)…`); await new Promise(r=>setTimeout(r,3000)); }
        finally{ clearInterval(tick); } }
    }
    await load();
    // draw one throwaway frame so the first recorded frame isn't caught while the graphics are still settling
    await page.evaluate(([w,h,e])=>window.__renderFrame(0,1,w,h,e?{equirect:true,stereo:e===2}:null),[W,H,VR?2:(V360?1:0)]);
    if(id===0) log(`Ready after ${Math.round((Date.now()-tl)/1000)} s. Rendering…`);
    if(id===0){ const m=await page.evaluate(()=>window.__manifest()); fs.writeFileSync(path.join(OUT,'manifest.json'),JSON.stringify(m,null,2)); }
    while(todo.length){
      const seg=todo.shift(); const i=segs.indexOf(seg); prog.segments[i].status='rendering'; saveProg();
      const tmp=seg.file.replace('.mp4','.partial.mp4');
      const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-',
        '-c:v','libx264','-preset',PRESET,'-crf',CRF,'-pix_fmt','yuv420p','-g',String(FPS*2),'-bf','2','-movflags','+faststart','-r',String(FPS),tmp],{stdio:['pipe','inherit','inherit']});
      for(let f=seg.s; f<seg.e; f++){
        let url=null;
        for(let tries=0;;tries++){
          try{ url=await page.evaluate(([t,q,w,h,e])=>window.__renderFrame(t,q,w,h,e?{equirect:true,stereo:e===2}:null),[f/FPS,Q,W,H,VR?2:(V360?1:0)]); }
          catch(err){ url='ERROR: '+(err.message||err); }
          if(url && url.startsWith('data:')) break;
          if(tries>=5){ ff.stdin.destroy(); throw new Error(`Frame ${f} kept failing (${url}). Stopping so no black frames are saved; run the same command again to resume.`); }
          log(`\n[w${id}] frame ${f}: the graphics driver reset (${url}). Reloading the film and retrying…`);
          await load();
          await page.evaluate(([w,h,e])=>window.__renderFrame(0,1,w,h,e?{equirect:true,stereo:e===2}:null),[W,H,VR?2:(V360?1:0)]); }
        const buf=Buffer.from(url.slice(url.indexOf(',')+1),'base64');
        if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
        doneFrames++;
        if(doneFrames%30===0){ const el=(Date.now()-t0)/1000, fps=doneFrames/el; const eta=(total-doneFrames)/fps;
          prog.segments[i].rendered=f-seg.s+1; prog.renderFps=+fps.toFixed(3); prog.etaSeconds=Math.round(eta); saveProg();
          process.stdout.write(`\r[w${id}] ${seg.s}-${seg.e} frame ${f-seg.s+1}/${seg.e-seg.s} · ${fps.toFixed(2)} fps · ETA ${(eta/60).toFixed(1)} min   `); }
      }
      ff.stdin.end(); await new Promise(r=>ff.on('close',r));
      if(segOk(tmp,seg.e-seg.s)){ fs.renameSync(tmp,seg.file); prog.segments[i].status='done'; log(`\nsegment verified: ${path.basename(seg.file)}`); }
      else { prog.segments[i].status='failed'; log(`\nsegment failed verification: ${path.basename(seg.file)} (will retry on next run)`); }
      saveProg();
    }
    await page.close();
  }
  await Promise.all(Array.from({length:Math.max(1,WORKERS)},(_,i)=>worker(i)));
  await browser.close();
}

// ---------- WAV reader for recorded voice-over ----------
function readWav(file, SR){ const b=fs.readFileSync(file); if(b.toString('ascii',0,4)!=='RIFF') return null;
  let o=12, fmt=null, data=null; while(o+8<=b.length){ const id=b.toString('ascii',o,o+4), sz=b.readUInt32LE(o+4);
    if(id==='fmt ') fmt={tag:b.readUInt16LE(o+8),ch:b.readUInt16LE(o+10),sr:b.readUInt32LE(o+12),bits:b.readUInt16LE(o+22)};
    if(id==='data') data={o:o+8,n:sz}; o+=8+sz+(sz&1); }
  if(!fmt||!data) return null; const bps=fmt.bits/8, frames=Math.floor(data.n/(bps*fmt.ch));
  const rd=(i)=>{ const p=data.o+i*bps; if(fmt.tag===3&&fmt.bits===32) return b.readFloatLE(p); if(fmt.bits===16) return b.readInt16LE(p)/32768;
    if(fmt.bits===24){ const v=b[p]|(b[p+1]<<8)|(b[p+2]<<16); return (v&0x800000?v-0x1000000:v)/8388608; } if(fmt.bits===32) return b.readInt32LE(p)/2147483648; return 0; };
  const n=Math.floor(frames*SR/fmt.sr), L=new Float32Array(n), R=new Float32Array(n);
  for(let i=0;i<n;i++){ const x=i*fmt.sr/SR, j=Math.min(Math.floor(x),frames-2), f=x-j;
    const l=rd(j*fmt.ch)*(1-f)+rd((j+1)*fmt.ch)*f, r=fmt.ch>1?rd(j*fmt.ch+1)*(1-f)+rd((j+1)*fmt.ch+1)*f:l; L[i]=l; R[i]=r; }
  return {L,R}; }

// ---------- audio: one continuous pass for the whole range (no seams) ----------
function renderAudioFiles(){
  const ctx={console}; ctx.globalThis=ctx; vm.createContext(ctx);
  const html=fs.readFileSync(STUDIO,'utf8');
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  vm.runInContext(scripts[0],ctx); vm.runInContext(scripts[1],ctx); // engine + audio
  const AU=ctx.ARCHIVE.audio, SR=AU.SR;
  // recorded voice-over: vo/<LINE-ID>.wav (any sample rate, mono or stereo, 16/24-bit PCM or 32-bit float)
  const VO=arg('vo',path.join(here,'..','vo'));
  if(fs.existsSync(VO)){ const byId={}; for(const d of ctx.ARCHIVE.FILM.dialogue) byId[d.id]=d; let n=0;
    for(const f of fs.readdirSync(VO)){ const m=f.match(/^(.+)\.wav$/i); if(!m||!byId[m[1]]) continue;
      const pcm=readWav(path.join(VO,f), SR); if(!pcm) { log(`skipped ${f}: unsupported WAV`); continue; }
      const out=ctx.ARCHIVE.storyToOut(byId[m[1]].start); if(!out) continue;
      AU.voClips.push({t:out.t, L:pcm.L, R:pcm.R, dur:pcm.L.length/SR}); n++; }
    log(`voice-over: ${n} recorded line(s) placed from ${VO}`); }
  // your own music: music/cues.json = [{"file":"theme.wav","scene":"CH01_SC01" | "story":123.4,"offset":0,"gain":1,"replace":true}]
  const MU=arg('music',path.join(here,'..','music')), CUES=path.join(MU,'cues.json');
  if(fs.existsSync(CUES)){ const cues=JSON.parse(fs.readFileSync(CUES,'utf8')); let n=0;
    for(const q of cues){ const f=path.join(MU,q.file); if(!fs.existsSync(f)){ log(`music cue skipped, missing ${q.file}`); continue; }
      const sc=q.scene?ctx.ARCHIVE.SCENES.find(s=>s.id===q.scene):null; const st=(q.story!=null?q.story:(sc?sc.start:0))+(q.offset||0);
      const out=ctx.ARCHIVE.storyToOut(st); const pcm=readWav(f,SR); if(!out||!pcm){ log(`music cue skipped: ${q.file}`); continue; }
      AU.musicClips.push({t:out.t,L:pcm.L,R:pcm.R,dur:pcm.L.length/SR,gain:q.gain??1,replace:q.replace!==false,fade:q.fade??1}); n++; }
    log(`music: ${n} cue(s) placed from ${CUES}`); }
  const files={}; for(const k of ['mix','music','sfx','dialogue']){ const f=path.join(OUT,'audio',`${k}_${label}.wav`); files[k]={f,fd:fs.openSync(f,'w'),n:0}; fs.writeSync(files[k].fd,Buffer.alloc(44)); }
  const BL=60; for(let t=FROM;t<TO;t+=BL){ const t1=Math.min(TO,t+BL); const r=AU.renderAudio(t,t1);
    for(const k in files){ const ch=r[k], n=ch[0].length, b=Buffer.alloc(n*4); for(let i=0;i<n;i++){ b.writeInt16LE(Math.round(Math.max(-1,Math.min(1,ch[0][i]))*32767),i*4); b.writeInt16LE(Math.round(Math.max(-1,Math.min(1,ch[1][i]))*32767),i*4+2); }
      fs.writeSync(files[k].fd,b); files[k].n+=n; }
    process.stdout.write(`\raudio ${Math.round(t1-FROM)}/${Math.round(TO-FROM)} s   `); }
  for(const k in files){ const {fd,n}=files[k]; const h=Buffer.alloc(44); h.write('RIFF',0); h.writeUInt32LE(36+n*4,4); h.write('WAVE',8); h.write('fmt ',12); h.writeUInt32LE(16,16); h.writeUInt16LE(1,20); h.writeUInt16LE(2,22);
    h.writeUInt32LE(SR,24); h.writeUInt32LE(SR*4,28); h.writeUInt16LE(4,32); h.writeUInt16LE(16,34); h.write('data',36); h.writeUInt32LE(n*4,40); fs.writeSync(fd,h,0,44,0); fs.closeSync(fd); }
  log('\naudio stems written'); return files.mix.f;
}

// ---------- assemble ----------
function assemble(mixWav){
  const list=path.join(OUT,`concat_${label}.txt`);
  const missing=segs.filter(s=>!segOk(s.file,s.e-s.s)); if(missing.length){ log(`Cannot assemble: ${missing.length} segment(s) missing or invalid.`); return null; }
  fs.writeFileSync(list,segs.map(s=>`file '${s.file.replace(/'/g,"'\\''")}'`).join('\n'));
  const outFile=path.join(OUT,`ARCHIVE_${label}_${W}x${H}_${FPS}fps.mp4`);
  const r=spawnSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',list,'-i',mixWav,'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','256k','-movflags','+faststart','-shortest',outFile],{stdio:'inherit'});
  if(r.status!==0){ log('ffmpeg assembly failed'); return null; }
  const p=ffprobe(outFile), s=p.streams[0]; const expect=f1-f0;
  const ok=+s.nb_read_frames===expect && +s.width===W && +s.height===H && Math.abs(+p.format.duration-(TO-FROM))<.1;
  log(`assembled ${path.basename(outFile)}: ${s.width}x${s.height}, ${s.r_frame_rate} fps, ${s.nb_read_frames}/${expect} frames, ${(+p.format.duration).toFixed(2)} s → ${ok?'VERIFIED':'CHECK FAILED'}`);
  prog.output={file:outFile,verified:ok}; saveProg(); return ok?outFile:null;
}

(async()=>{
  if(!arg('assemble-only')) await renderSegments();
  const mix=renderAudioFiles();
  assemble(mix);
})().catch(e=>{ console.error(e); process.exit(1); });
