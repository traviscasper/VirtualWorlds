// Regenerates docs/RECORDING_SCRIPT.md from the film: every spoken line with its ID, time in the finished film,
// character and emotion. Run: node tools/make_script.js   (after python3 build.py)
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..'); const html=fs.readFileSync(path.join(root,'ARCHIVE_Studio.html'),'utf8');
const s=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const ctx={console,Math,Float32Array,Float64Array,Array,Object,JSON,Uint8Array}; ctx.globalThis=ctx; vm.createContext(ctx); vm.runInContext(s[0],ctx);
const A=ctx.ARCHIVE, tc=t=>{ const m=Math.floor(t/60), x=(t%60).toFixed(1).padStart(4,'0'); return `${m}:${x}`; };
const lines=A.FILM.dialogue.map(d=>({...d,out:(A.storyToOut(d.start)||{t:null}).t})).filter(d=>d.out!=null).sort((a,b)=>a.out-b.out);
const by={}; for(const d of lines) (by[d.character]=by[d.character]||[]).push(d);
let md=`# ARCHIVE: Worlds Within Worlds — Recording Script\n\nGenerated from the film (${lines.length} lines). Times are positions in the finished 90-minute film.\n\n`;
md+=`## How to record and add lines\n
1. Record each line as a WAV file (any sample rate, mono or stereo, 16/24-bit or 32-bit float). Leave about 0.2 s of silence at the start.
2. Name the file with the line's ID, for example \`NARR-01.wav\` or \`CH05_SC03-04.wav\`.
3. Put the files in the \`vo/\` folder. The renderer places each one at its moment in the film and removes the placeholder chirps for that line. To preview in the studio, use **Recorded lines** in the Render and export panel.
4. Lines stay in sync even if scenes are re-paced, because each line is pinned to its story moment.
5. **Delivery:** the time column shows the space available. Shorter is fine, and a little longer usually is too.

## Adding your own music
Put WAV files in \`music/\` with a \`cues.json\` like:
\`\`\`json
[ {"file":"opening_theme.wav", "scene":"CH01_SC01", "offset":0, "gain":0.9, "replace":true},
  {"file":"finale.wav", "scene":"CH10_SC03", "offset":12, "gain":1.0, "replace":true} ]
\`\`\`
\`scene\` is a scene ID from the table below (or use \`"story": seconds\`), \`offset\` is seconds into that scene, \`replace:true\` mutes the generated score while your track plays, and \`fade\` is the fade in/out in seconds (default 1). In the studio, load the WAVs and \`cues.json\` together with **Your music**.

## Characters\n
- **NARRATOR**: a warm storyteller, not a character in the film. Unhurried and kind, like reading to someone you love.
- **ARCHIVE**: a small, curious, brave robot. Bright, quick, sometimes cheeky. Grows steadier through the film.
- **TOCK**: a small, fussy courier drone. Clipped and precise; loves rules. Secretly very loyal.
- **ALICIA**: the Loom's holographic AI. Calm, warm, a little sad until the end.
- **CITY**: Ferrum's public-address system. Flat, official.
- **WARDEN**: a starving maintenance drone. Low, mechanical, few words.\n\n`;
md+=`## Scene IDs\n\n| Scene | Title |\n|---|---|\n`+A.SCENES.map(s=>`| ${s.id} | ${s.title} |`).join('\n')+`\n\n`;
for(const who of ['NARRATOR','ARCHIVE','TOCK','ALICIA','CITY','WARDEN'].filter(w=>by[w]).concat(Object.keys(by).filter(w=>!['NARRATOR','ARCHIVE','TOCK','ALICIA','CITY','WARDEN'].includes(w)))){
  md+=`## ${who} (${by[who].length} lines)\n\n| ID | Time | Length | Emotion | Line |\n|---|---|---|---|---|\n`;
  for(const d of by[who]) md+=`| ${d.id} | ${tc(d.out)} | ${(d.end-d.start).toFixed(1)} s | ${d.emotion||''} | ${d.text.replace(/\|/g,'/')} |\n`;
  md+=`\n`; }
md+=`## Full script in film order\n\n| Time | Character | Line | ID |\n|---|---|---|---|\n`+lines.map(d=>`| ${tc(d.out)} | ${d.character} | ${d.text.replace(/\|/g,'/')} | ${d.id} |`).join('\n')+'\n';
fs.writeFileSync(path.join(root,'docs','RECORDING_SCRIPT.md'),md); console.log('wrote docs/RECORDING_SCRIPT.md with',lines.length,'lines');
