/* ARCHIVE Skyship Engine · procedural journey score.
   Composes a soundtrack for any journey from each world's "audio.score" settings in its manifest:
     { "chords": [[midi...], ...], "bar": 4, "bells": [midi...], "pulse": 0..1, "ambience": "city"|"space"|"none", "drone": midi, "bright": 0..1 }
   Rendered offline so the live page and the 360 video share one mix (same approach as sci-fi-360/js/audio.js). */

const hz = n => 440 * Math.pow(2, (n - 69) / 12);
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** journey: { duration, transition, segments:[{t0,t1,music}] } → AudioBuffer */
export async function renderJourneyScore(journey, sampleRate = 44100) {
  const DUR = journey.duration, TR = journey.transition ?? 3;
  const ctx = new OfflineAudioContext(2, Math.ceil(sampleRate * DUR), sampleRate);
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, 0); master.gain.linearRampToValueAtTime(.9, 1.6); master.gain.setValueAtTime(.9, DUR - 2.4); master.gain.linearRampToValueAtTime(0, DUR);
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = .01; comp.release.value = .25;
  master.connect(comp); comp.connect(ctx.destination);
  const rev = ctx.createConvolver(); { const len = sampleRate * 3.2, b = ctx.createBuffer(2, len, sampleRate); const r = rng(3); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / len, 2.6); } rev.buffer = b; }
  const revIn = ctx.createGain(); revIn.gain.value = .5; revIn.connect(rev); rev.connect(master);
  const dry = ctx.createGain(); dry.connect(master);
  const out = (node, wet = .3, pan = 0) => { let n = node; if (pan) { const p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p); n = p; } n.connect(dry); if (wet) { const s = ctx.createGain(); s.gain.value = wet; n.connect(s); s.connect(revIn); } };
  const noiseBuf = (() => { const b = ctx.createBuffer(1, sampleRate * 4, sampleRate); const d = b.getChannelData(0); const r = rng(9); for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1; return b; })();
  const env = (g, t0, t1, peak, a, rel) => { g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(peak, t0 + a); g.gain.setValueAtTime(peak, Math.max(t0 + a, t1 - rel)); g.gain.linearRampToValueAtTime(0, t1); };

  function pad(t0, t1, notes, { type = 'sawtooth', gain = .04, a = 2, rel = 2, cut = 1000, wet = .5, det = 7, pan = 0 } = {}) {
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cut; f.Q.value = .7; const g = ctx.createGain(); env(g, t0, t1, gain, a, rel); f.connect(g); out(g, wet, pan);
    for (const n of notes) for (const d of [-det, det]) { const o = ctx.createOscillator(); o.type = type; o.frequency.value = hz(n); o.detune.value = d; o.connect(f); o.start(t0); o.stop(t1 + .05); } }
  function bell(t, n, { gain = .06, dec = 3, wet = .6, pan = 0 } = {}) {
    for (const [m, k] of [[1, 1], [2.76, .3], [5.4, .1], [2, .22]]) { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = hz(n) * m; const g = ctx.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain * k, t + .006); g.gain.exponentialRampToValueAtTime(.0004, t + dec / (m * .6 + .4)); o.connect(g); out(g, wet, pan); o.start(t); o.stop(t + dec + .1); } }
  function pluck(t, n, { gain = .05, dec = .9, wet = .4, pan = 0 } = {}) { const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = hz(n); const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .005); g.gain.exponentialRampToValueAtTime(.0005, t + dec); o.connect(g); out(g, wet, pan); o.start(t); o.stop(t + dec + .05); }
  function noise(t0, t1, { type = 'bandpass', freq = 1000, q = .7, gain = .04, a = .5, rel = .5, wet = .2, pan = 0, sweep = null } = {}) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    if (sweep) { f.frequency.setValueAtTime(sweep[0], t0); f.frequency.exponentialRampToValueAtTime(sweep[1], t1); }
    const g = ctx.createGain(); env(g, t0, t1, gain, a, rel); s.connect(f); f.connect(g); out(g, wet, pan); s.start(t0, (t0 * 1.37) % 3); s.stop(t1 + .05); }
  function bird(t, pan) { const o = ctx.createOscillator(); o.type = 'sine'; const f0 = 2400 + (t * 997 % 1) * 1800; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.35, t + .07); o.frequency.exponentialRampToValueAtTime(f0 * .9, t + .14);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.012, t + .02); g.gain.exponentialRampToValueAtTime(.0003, t + .16); o.connect(g); out(g, .35, pan); o.start(t); o.stop(t + .2); }
  function kick(t, g0 = .22) { const o = ctx.createOscillator(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + .16); const g = ctx.createGain();
    g.gain.setValueAtTime(g0, t); g.gain.exponentialRampToValueAtTime(.001, t + .35); o.connect(g); out(g, .05); o.start(t); o.stop(t + .4); }
  function whoosh(t, dur, k = 1) { noise(t, t + dur, { type: 'bandpass', freq: 400, q: 1.2, gain: .1 * k, a: dur * .55, rel: dur * .45, wet: .5, sweep: [200, 2600] });
    noise(t, t + dur, { type: 'lowpass', freq: 220, gain: .12 * k, a: dur * .5, rel: dur * .5, wet: .3 }); }

  journey.segments.forEach((seg, si) => {
    const m = seg.music || {}; const a = Math.max(0, seg.t0 - (si ? TR : 0)), b = Math.min(DUR, seg.t1 + (si < journey.segments.length - 1 ? TR : 0)); const r = rng(77 + si * 13);
    const chords = m.chords?.length ? m.chords : [[50, 57, 62, 66]]; const bar = m.bar || 4; const bright = m.bright ?? .5;
    if (m.drone) pad(a, b, [m.drone, m.drone + 7], { type: 'sine', gain: .05, a: 3, rel: 3, cut: 500, wet: .4, det: 3 });
    let ci = 0; for (let t = a; t < b - .5; t += bar * 2, ci++) { const ns = chords[ci % chords.length]; pad(t, Math.min(b, t + bar * 2 + 1.2), ns, { gain: .028, a: 1.8, rel: 1.6, cut: 700 + bright * 1400, wet: .55 }); }
    if (m.bells?.length) { const step = bar / 4; let k = 0; for (let t = a + 1; t < b - 1; t += step, k++) { if (r() < .82) bell(t, m.bells[k % m.bells.length] + (r() < .12 ? 12 : 0), { gain: .028 + bright * .02, dec: 2.6, pan: Math.sin(k * 1.7) * .5 }); } }
    if (m.pulse) { for (let t = a + bar; t < b - bar; t += bar / 4) { const beat = Math.round((t - a) / (bar / 4)) % 4; if (beat === 0) kick(t, .14 * m.pulse); pluck(t, chords[Math.floor((t - a) / (bar * 2)) % chords.length][0] + 12, { gain: .025 * m.pulse, dec: .35, wet: .2, pan: beat % 2 ? .3 : -.3 }); } }
    if (m.ambience === 'city') { noise(a, b, { type: 'lowpass', freq: 380, gain: .03, a: 2, rel: 2, wet: .1 }); for (let t = a + 2; t < b - 1; t += .9 + r() * 2.2) bird(t, r() * 1.6 - .8); }
    if (m.ambience === 'space') { noise(a, b, { type: 'lowpass', freq: 140, gain: .05, a: 3, rel: 3, wet: .3 }); pad(a, b, [chords[0][0] + 24], { type: 'sine', gain: .012, a: 4, rel: 4, wet: .8, det: 4 }); }
    if (si > 0) whoosh(seg.t0 - TR - 1, TR * 2 + 1.5, 1.1);
  });
  const lastSeg = journey.segments[journey.segments.length - 1]; const fin = (lastSeg.music?.chords || [[50, 57, 62, 66]])[0];
  pad(Math.max(0, DUR - 9), DUR, fin.map(n => n + 12), { type: 'triangle', gain: .03, a: 3, rel: 3, cut: 2600, wet: .7 });
  return ctx.startRendering();
}
