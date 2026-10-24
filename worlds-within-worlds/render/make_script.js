// builds docs/RECORDING_SCRIPT.md from the film's dialogue timeline
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'..','ARCHIVE_Studio.html'),'utf8'); const s=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const ctx={console,Math,Float32Array,Float64Array,Array,Object,JSON,Uint8Array}; ctx.globalThis=ctx; vm.createContext(ctx); vm.runInContext(s[0],ctx);
const A=ctx.ARCHIVE, D=A.FILM.dialogue;
const tc=t=>{ const m=Math.floor(t/60), x=(t%60).toFixed(1).padStart(4,'0'); return `${m}:${x}`; };
const rows=D.map(d=>{ const o=A.storyToOut(d.start); return {...d, out:o?o.t:null}; }).filter(d=>d.out!=null).sort((a,b)=>a.out-b.out);
const chars={}; rows.forEach(r=>chars[r.character]=(chars[r.character]||0)+1);
let md=`# ARCHIVE: Worlds Within Worlds — Recording script\n\nGenerated from the film's timeline. Every spoken line, in film order, with its ID, timecode, character and delivery note.\n\n`;
md+=`## How to record and add the voices\n- Record each line as its own WAV file named by its **ID**, for example \`NARR-01.wav\` or \`CH05_SC03-04.wav\`.\n- Any sample rate is fine; mono or stereo; 16- or 24-bit PCM. Trim the silence at the start: the line plays from the first sample at its timecode.\n- Keep each take close to the listed length; it's fine to run a little long, but very long takes will overlap the next line.\n- **Preview:** in ARCHIVE_Studio.html, open Render and export, then choose the files under "Recorded lines".\n- **Final film:** put the files in a folder called \`vo\` next to \`render\`, then run \`node render/render.mjs --film --headed\`. It places every recorded line automatically. Lines you haven't recorded keep their placeholder chirps (the narrator stays silent until recorded).\n\n`;
md+=`## Cast (lines)\n`+Object.entries(chars).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`- ${c}: ${n}`).join('\n')+`\n\n`;
md+=`### Voice notes\n- **NARRATOR**: a warm, unhurried storyteller, not a character in the film. Think of someone telling a bedtime story they love.\n- **ARCHIVE**: small, bright and curious; sincere, quick to laugh, never sarcastic.\n- **TOCK**: a precise little courier drone; deadpan and rule-bound, with a soft heart that shows more as the film goes on.\n- **ALICIA**: the Loom's holographic AI; calm and kind, a little tired early on, warm and whole by the end.\n- **CITY / WARDEN**: machine announcements; flat and clipped.\n\n`;
md+=`## Lines\n\n| Time | ID | Character | Delivery | Line |\n|---|---|---|---|---|\n`;
for(const r of rows) md+=`| ${tc(r.out)} | \`${r.id}\` | ${r.character} | ${r.emotion||''} | ${r.text.replace(/\|/g,'\\|')} |\n`;
fs.writeFileSync(require('path').join(__dirname,'..','docs','RECORDING_SCRIPT.md'),md); console.log('lines',rows.length,chars);
