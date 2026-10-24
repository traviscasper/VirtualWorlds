/* ARCHIVE · procedural soundtrack. Rendered offline so the live page and the 360 video share one mix.
   0:00 Frankenstein — storm, D minor strings, thunder synced to the lightning
   0:40 R.U.R.        — industrial rhythm in A minor, clangs, steam
   1:20 Metropolis    — grand brass chords in C, timpani, a rising swell into orbit
   2:00 Future        — warm D major pads, bells, a held final chord */
import { STRIKES, SHEETS } from './world_frankenstein.js';

const DUR = 180;
const hz = n => 440 * Math.pow(2, (n - 69) / 12);           // midi → Hz
const N = { D2: 38, A2: 45, D3: 50, F3: 53, A3: 57, Bb2: 46, G2: 43, C3: 48, E3: 52, Cs3: 49, A1: 33, C2: 36, E2: 40, F2: 41, G3: 55, B2: 47, D4: 62, Fs3: 54, B3: 59, E4: 64, A4: 69, Fs4: 66, D5: 74, F5: 77, A5: 81, Cs5: 73, E5: 76, G4: 67, C4: 60, Bb3: 58 };
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export async function renderSoundtrack(sampleRate = 44100, onProgress) {
  const ctx = new OfflineAudioContext(2, Math.ceil(sampleRate * DUR), sampleRate);
  const master = ctx.createGain(); master.gain.value = 0;
  master.gain.setValueAtTime(0, 0); master.gain.linearRampToValueAtTime(.9, 1.6); master.gain.setValueAtTime(.9, DUR - 2.4); master.gain.linearRampToValueAtTime(0, DUR);
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = .01; comp.release.value = .25;
  master.connect(comp); comp.connect(ctx.destination);
  // reverb (generated impulse)
  const rev = ctx.createConvolver(); { const len = sampleRate * 3.6, b = ctx.createBuffer(2, len, sampleRate); const r = rng(3); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / len, 3.2); } rev.buffer = b; }
  const revIn = ctx.createGain(); revIn.gain.value = .55; revIn.connect(rev); rev.connect(master);
  const dry = ctx.createGain(); dry.gain.value = 1; dry.connect(master);
  const out = (node, wet = .3, pan = 0) => { let n = node; if (pan) { const p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p); n = p; } n.connect(dry); if (wet) { const s = ctx.createGain(); s.gain.value = wet; n.connect(s); s.connect(revIn); } };
  const noiseBuf = (() => { const b = ctx.createBuffer(1, sampleRate * 4, sampleRate); const d = b.getChannelData(0); const r = rng(9); for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1; return b; })();
  const brownBuf = (() => { const b = ctx.createBuffer(1, sampleRate * 4, sampleRate); const d = b.getChannelData(0); const r = rng(11); let l = 0; for (let i = 0; i < d.length; i++) { l = (l + .02 * (r() * 2 - 1)) / 1.02; d[i] = l * 3.5; } return b; })();

  /* ---------- instruments ---------- */
  function env(g, t0, t1, peak, a, rel) { g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(peak, t0 + a); g.gain.setValueAtTime(peak, Math.max(t0 + a, t1 - rel)); g.gain.linearRampToValueAtTime(0, t1); }
  function pad(t0, t1, notes, { type = 'sawtooth', gain = .05, a = 2, rel = 2, cut = 900, q = .7, wet = .45, det = 7, pan = 0, vib = 0 } = {}) {
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cut; f.Q.value = q; const g = ctx.createGain(); env(g, t0, t1, gain, a, rel); f.connect(g); out(g, wet, pan);
    for (const n of notes) for (const d of [-det, det]) { const o = ctx.createOscillator(); o.type = type; o.frequency.value = hz(n); o.detune.value = d; if (vib) { const l = ctx.createOscillator(); l.frequency.value = 4.6 + Math.random() * .0; const lg = ctx.createGain(); lg.gain.value = vib; l.connect(lg); lg.connect(o.detune); l.start(t0); l.stop(t1 + .1); } o.connect(f); o.start(t0); o.stop(t1 + .1); } return f; }
  function pluck(t, n, { type = 'triangle', gain = .12, dec = 1.2, wet = .5, pan = 0, cut = 4000 } = {}) { const o = ctx.createOscillator(); o.type = type; o.frequency.value = hz(n); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(cut, t); f.frequency.exponentialRampToValueAtTime(Math.max(200, cut * .2), t + dec);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .005); g.gain.exponentialRampToValueAtTime(.0005, t + dec); o.connect(f); f.connect(g); out(g, wet, pan); o.start(t); o.stop(t + dec + .05); }
  function bell(t, n, { gain = .08, dec = 3.5, wet = .6, pan = 0 } = {}) { for (const [m, k] of [[1, 1], [2.76, .35], [5.4, .12], [2, .25]]) { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = hz(n) * m; const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain * k, t + .004); g.gain.exponentialRampToValueAtTime(.0003, t + dec / Math.sqrt(m)); o.connect(g); out(g, wet, pan); o.start(t); o.stop(t + dec + .1); } }
  function noise(t0, t1, { type = 'bandpass', freq = 1000, q = .7, gain = .05, a = .5, rel = .5, wet = .2, buf = noiseBuf, pan = 0, sweep = null } = {}) { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    if (sweep) { f.frequency.setValueAtTime(sweep[0], t0); f.frequency.exponentialRampToValueAtTime(sweep[1], t1); } const g = ctx.createGain(); env(g, t0, t1, gain, a, rel); s.connect(f); f.connect(g); out(g, wet, pan); s.start(t0, (t0 * 1.37) % 3); s.stop(t1 + .05); return g; }
  function thunder(t, k = 1, pan = 0) { const s = ctx.createBufferSource(); s.buffer = brownBuf; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(90, t + 3.5);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.9 * k, t + .06); g.gain.exponentialRampToValueAtTime(.35 * k, t + .6); g.gain.linearRampToValueAtTime(.5 * k, t + 1.1); g.gain.exponentialRampToValueAtTime(.001, t + 5); s.connect(f); f.connect(g); out(g, .35, pan); s.start(t, (t * 2.1) % 2); s.stop(t + 5.2);
    const c = ctx.createBufferSource(); c.buffer = noiseBuf; const cf = ctx.createBiquadFilter(); cf.type = 'highpass'; cf.frequency.value = 1800; const cg = ctx.createGain(); cg.gain.setValueAtTime(.32 * k, t); cg.gain.exponentialRampToValueAtTime(.001, t + .45); c.connect(cf); cf.connect(cg); out(cg, .2, pan); c.start(t); c.stop(t + .5); }
  function zap(t, k = 1, pan = 0) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(40, t + .4); const g = ctx.createGain(); g.gain.setValueAtTime(.1 * k, t); g.gain.exponentialRampToValueAtTime(.001, t + .45); const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 2; o.connect(f); f.connect(g); out(g, .2, pan); o.start(t); o.stop(t + .5); }
  function kick(t, g0 = .5) { const o = ctx.createOscillator(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + .18); const g = ctx.createGain(); g.gain.setValueAtTime(g0, t); g.gain.exponentialRampToValueAtTime(.001, t + .5); o.connect(g); out(g, .1); o.start(t); o.stop(t + .55); }
  function clang(t, f0 = 420, g0 = .09, pan = 0) { for (const [m, k] of [[1, 1], [1.47, .6], [2.09, .45], [2.56, .3], [3.9, .2]]) { const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = f0 * m; const g = ctx.createGain(); g.gain.setValueAtTime(g0 * k * .4, t); g.gain.exponentialRampToValueAtTime(.0004, t + .9 / m + .15); const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = f0 * m; f.Q.value = 6; o.connect(f); f.connect(g); out(g, .35, pan); o.start(t); o.stop(t + 1.2); }
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; const hf = ctx.createBiquadFilter(); hf.type = 'highpass'; hf.frequency.value = 2500; const hg = ctx.createGain(); hg.gain.setValueAtTime(g0 * .8, t); hg.gain.exponentialRampToValueAtTime(.001, t + .12); s.connect(hf); hf.connect(hg); out(hg, .2, pan); s.start(t, (t * 3.1) % 3); s.stop(t + .15); }
  function tick(t, g0 = .03, pan = 0) { const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000; const g = ctx.createGain(); g.gain.setValueAtTime(g0, t); g.gain.exponentialRampToValueAtTime(.001, t + .05); s.connect(f); f.connect(g); out(g, .1, pan); s.start(t, (t * 5.3) % 3); s.stop(t + .06); }
  function timp(t, n, g0 = .35) { const o = ctx.createOscillator(); o.frequency.setValueAtTime(hz(n) * 1.3, t); o.frequency.exponentialRampToValueAtTime(hz(n), t + .08); const g = ctx.createGain(); g.gain.setValueAtTime(g0, t); g.gain.exponentialRampToValueAtTime(.001, t + 2.2); o.connect(g); out(g, .4); o.start(t); o.stop(t + 2.3); noise(t, t + .25, { type: 'lowpass', freq: 300, gain: g0 * .5, a: .002, rel: .2, wet: .3 }); }
  function brass(t0, t1, notes, gain = .045, pan = 0) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(300, t0); f.frequency.linearRampToValueAtTime(2200, t0 + .5); f.frequency.linearRampToValueAtTime(1300, t1); f.Q.value = 1.2;
    const g = ctx.createGain(); env(g, t0, t1, gain, .35, .6); f.connect(g); out(g, .45, pan); for (const n of notes) for (const d of [-5, 6]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(n); o.detune.value = d; o.connect(f); o.start(t0); o.stop(t1 + .1); } }
  function whoosh(t, dur = 6, k = 1) { noise(t, t + dur, { type: 'bandpass', freq: 400, q: 1.2, gain: .12 * k, a: dur * .55, rel: dur * .45, wet: .5, sweep: [200, 2400] }); noise(t, t + dur, { type: 'lowpass', freq: 220, gain: .14 * k, a: dur * .5, rel: dur * .5, wet: .2, buf: brownBuf }); }

  /* ================= 1 · FRANKENSTEIN (0–40) ================= */
  noise(0, 41.5, { type: 'bandpass', freq: 2600, q: .4, gain: .07, a: 2, rel: 3, wet: .15 });       // rain
  noise(0, 41.5, { type: 'lowpass', freq: 180, gain: .09, a: 3, rel: 3, wet: .1, buf: brownBuf }); // wind
  pad(0, 42, [N.D2, N.A2], { gain: .05, a: 4, rel: 4, cut: 380 });
  const s1 = [[0, 10, [N.D3, N.F3, N.A3]], [10, 20, [N.Bb2, N.D3, N.F3]], [20, 30, [N.G2, N.Bb2, N.D3, N.G3]], [30, 41, [N.A2, N.Cs3, N.E3, N.A3]]];
  for (const [a, b, ns] of s1) pad(a, b + 1.5, ns, { gain: .032, a: 2.5, rel: 2, cut: 1100, vib: 6, wet: .6 });
  pad(0, 41, [N.A5], { type: 'sine', gain: .012, a: 5, rel: 4, vib: 14, wet: .8, det: 3 });
  { const motif = [N.D5, N.F5, N.A5, N.Cs5, N.D5, N.E5, N.F5, N.E5]; for (let bar = 0; bar < 5; bar++) motif.forEach((n, i) => pluck(3 + bar * 8 + i * .5, n - (bar === 2 ? 2 : 0), { type: 'sine', gain: .045, dec: 1.6, wet: .7, pan: Math.sin(i) * .4 })); }
  for (const [t, tg] of STRIKES) { const far = tg.startsWith('far'); thunder(t + (far ? .9 : .25), far ? .8 : 1, tg === 'coil' ? -.5 : tg === 'rods' ? .5 : 0); if (!far) { zap(t, 1.2, tg === 'coil' ? -.5 : .5); } }
  for (const t of SHEETS) thunder(t + 1.4, .45, (t * 7 % 2) - 1);
  { const r = rng(5); noise(12, 21, { type: 'bandpass', freq: 900, q: 3, gain: .02, a: 2, rel: 2, wet: .1, pan: -.5 }); for (let i = 0; i < 70; i++) { const t = 11 + r() * 21; zap(t, .25 + r() * .3, t < 20 ? -.6 : .6); } }
  whoosh(36.5, 7.5, 1);

  /* ================= 2 · R.U.R. (40–80) ================= */
  const BEAT = .6; const r2 = rng(21);
  pad(39, 82, [N.A1], { gain: .045, a: 3, rel: 3, cut: 220, type: 'sawtooth' });                  // machine hum
  noise(39, 82, { type: 'lowpass', freq: 140, gain: .05, a: 3, rel: 3, wet: .1, buf: brownBuf });
  for (let b = 0; b * BEAT < 39; b++) { const t = 41 + b * BEAT; if (t > 79.6) break; const bar = Math.floor(b / 4), beat = b % 4; const fade = Math.min(1, (t - 41) / 3, (80.5 - t) / 2.5);
    if (beat === 0 || beat === 2) kick(t, .42 * fade); if (beat === 1 || beat === 3) clang(t, beat === 1 ? 410 : 530, .085 * fade, beat === 1 ? -.4 : .4);
    tick(t + BEAT / 2, .025 * fade, .3); if (bar % 2 === 1 && beat === 3) tick(t + BEAT * .75, .03 * fade, -.3);
    const bass = [N.A1, N.A1, N.C2, N.E2, N.F2, N.F2, N.E2, N.C2][b % 8]; pluck(t, bass + 12, { type: 'sawtooth', gain: .07 * fade, dec: .45, wet: .15, cut: 900 });
    if (bar % 4 === 0 && beat === 0) noise(t + .3, t + 1.8, { type: 'highpass', freq: 3000, gain: .05 * fade, a: .05, rel: 1.2, wet: .3, pan: r2() - .5 }); }
  const s2 = [[41, 50.6, [N.A2, N.C3, N.E3]], [50.6, 60.2, [N.F2, N.A2, N.C3]], [60.2, 69.8, [N.G2, N.B2, N.D3]], [69.8, 80.5, [N.E2, N.G2, N.B2, N.E3]]];
  for (const [a, b, ns] of s2) pad(a, b + 1, ns, { gain: .022, a: 1.5, rel: 1.5, cut: 700, wet: .5 });
  whoosh(76.5, 7.5, .9);

  /* ================= 3 · METROPOLIS (80–120) ================= */
  noise(79, 121, { type: 'bandpass', freq: 500, q: .5, gain: .035, a: 3, rel: 2, wet: .2 });    // city hum
  const s3 = [[81, 86, [N.F2, N.F3, N.A3, N.C4]], [86, 91, [N.G2, N.G3, N.B3, N.D4]], [91, 96, [N.A2, N.A3, N.C4, N.E4]], [96, 101, [N.F2, N.F3, N.A3, N.C4]],
              [101, 106, [N.C3, N.G3, N.C4, N.E4]], [106, 111, [N.G2, N.G3, N.B3, N.D4]], [111, 116, [N.F2, N.A3, N.C4, N.F3 + 12]], [116, 121, [N.G2, N.B3, N.D4, N.G4]]];
  for (const [a, b, ns] of s3) { brass(a, b + .4, ns, a > 110 ? .05 : .04); timp(a, ns[0] - 12 + 12, .3); pad(a, b + .4, [ns[0] - 12], { gain: .03, a: .6, rel: .6, cut: 300 }); }
  { const ar = [0, 2, 1, 3, 2, 1, 3, 2]; for (let i = 0; i * .25 < 39; i++) { const t = 81 + i * .25; if (t > 120) break; const ch = s3.find(([a, b]) => t >= a && t < b); if (!ch) continue; const n = ch[2][ar[i % 8] % ch[2].length] + 12; pluck(t, n, { type: 'sawtooth', gain: .028 * Math.min(1, (t - 81) / 4), dec: .22, wet: .3, cut: 2600, pan: (i % 2 ? .3 : -.3) }); } }
  for (let t = 100; t < 120; t += 2.5) noise(t, t + .9, { type: 'bandpass', freq: 300 + (t % 7) * 40, q: 4, gain: .02, a: .2, rel: .5, wet: .5, pan: (t % 5) / 2.5 - 1 }); // distant horns
  noise(110, 121.5, { type: 'highpass', freq: 5000, gain: .07, a: 10, rel: 1.2, wet: .6 });       // cymbal swell
  whoosh(116.5, 8, 1.2);

  /* ================= 4 · SUSTAINABLE FUTURE (120–180) ================= */
  const s4 = [[121, 127, [N.D3, N.Fs3, N.A3, N.D4]], [127, 133, [N.B2, N.D3, N.Fs3, N.B3]], [133, 139, [N.G2, N.B2, N.D3, N.G3]], [139, 145, [N.A2, N.Cs3, N.E3, N.A3]],
              [145, 151, [N.D3, N.Fs3, N.A3, N.D4]], [151, 157, [N.B2, N.D3, N.Fs3, N.B3]], [157, 163, [N.G2, N.B2, N.D3, N.G3]], [163, 168, [N.A2, N.Cs3, N.E3, N.A3]], [168, 180, [N.D3, N.Fs3, N.A3, N.D4, N.Fs4]]];
  for (const [a, b, ns] of s4) { pad(a, b + 1.5, ns, { type: 'triangle', gain: .05, a: 2, rel: 2.5, cut: 2200, wet: .7, vib: 4 }); pad(a, b + 1.5, [ns[0] - 12], { type: 'sine', gain: .06, a: 1.5, rel: 2, wet: .3 }); }
  pad(124, 180, [N.A4, N.D5], { type: 'sine', gain: .012, a: 8, rel: 6, wet: .9, vib: 10 });
  { const pat = [0, 1, 2, 3, 2, 1]; for (let i = 0; i * .5 < 46; i++) { const t = 122 + i * .5; if (t >= 168) break; const ch = s4.find(([a, b]) => t >= a && t < b); const n = ch[2][pat[i % 6] % ch[2].length] + 12; bell(t, n, { gain: .05 * Math.min(1, (t - 122) / 4), dec: 2.6, pan: Math.sin(i * .7) * .5 }); } }
  bell(168, N.D5, { gain: .12, dec: 7 }); bell(168.02, N.A4, { gain: .08, dec: 7 }); bell(171, N.Fs4 + 12, { gain: .06, dec: 6 }); bell(174, N.D5 + 12, { gain: .05, dec: 6 });
  noise(121, 180, { type: 'highpass', freq: 7000, gain: .012, a: 6, rel: 6, wet: .9 });          // airy shimmer
  onProgress?.(.1);
  const buf = await ctx.startRendering(); onProgress?.(1); return buf;
}

/** 16-bit PCM WAV of [t0, t1] seconds */
export function encodeWav(buf, t0 = 0, t1 = buf.duration) { const sr = buf.sampleRate, ch = buf.numberOfChannels, i0 = Math.floor(t0 * sr), i1 = Math.min(buf.length, Math.floor(t1 * sr)), n = Math.max(0, i1 - i0);
  const out = new DataView(new ArrayBuffer(44 + n * ch * 2)); const w = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); out.setUint32(4, 36 + n * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true); out.setUint32(24, sr, true); out.setUint32(28, sr * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, n * ch * 2, true);
  const data = []; for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c)); let o = 44; for (let i = i0; i < i1; i++) for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, data[c][i])); out.setInt16(o, v < 0 ? v * 32768 : v * 32767, true); o += 2; }
  return new Uint8Array(out.buffer); }
export const SOUNDTRACK_SECONDS = DUR;
