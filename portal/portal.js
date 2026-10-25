/* FLE Virtual Worlds portal: reads worlds/index.json + each world manifest, and journeys/index.json.
   Filters by theme (category) and by Time · Place · Purpose; plots every world on a time axis. */
(async function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const CATS = { sustainability: 'Sustainability', technology: 'Technology', space: 'Space' };
  const CATC = { sustainability: 'var(--sus)', technology: 'var(--tech)', space: 'var(--space)' };
  const grid = $('grid');
  let worlds = [];
  try {
    const ix = await (await fetch('worlds/index.json')).json();
    worlds = await Promise.all(ix.worlds.map(async w => { const r = await fetch('worlds/' + w.file); if (!r.ok) throw new Error(w.file); return r.json(); }));
  } catch (e) {
    grid.innerHTML = `<p class="empty">The world list could not be loaded (${esc(e.message)}). Open this page through a web server, for example <code>python -m http.server</code> in the repository folder, not straight from the file system.</p>`;
    return;
  }

  /* --- facets --- */
  const timeOf = w => { const e = w.time?.era || ''; const out = []; if (e.includes('past')) out.push('past'); if (e.includes('present')) out.push('present'); if (e.includes('future')) out.push('future'); return out; };
  const placeOf = w => { const t = w.place?.type; return t === 'spacecraft' ? 'orbit' : t; };
  const FACETS = {
    cat: { el: 'f-cat', label: { all: 'All' , ...CATS }, get: w => w.categories || [] },
    time: { el: 'f-time', label: { any: 'Any time', past: 'Past', present: 'Present', future: 'Future' }, get: timeOf },
    place: { el: 'f-place', label: { any: 'Anywhere', city: 'City', laboratory: 'Laboratory', orbit: 'Orbit', virtual: 'Virtual world' }, get: w => [placeOf(w)] },
    purpose: { el: 'f-purpose', label: { any: 'Any purpose', explore: 'Explore', learn: 'Learn', simulate: 'Simulate', 'experience a story': 'Story' }, get: w => w.purposes || [] } };
  const sel = { cat: 'all', time: 'any', place: 'any', purpose: 'any' };
  for (const [k, f] of Object.entries(FACETS)) {
    const box = $(f.el);
    for (const [v, lab] of Object.entries(f.label)) {
      const n = v === 'all' || v === 'any' ? worlds.length : worlds.filter(w => f.get(w).includes(v)).length; if (!n) continue;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.setAttribute('aria-pressed', String(sel[k] === v));
      if (k === 'cat') b.dataset.filter = v; else b.dataset[k] = v;
      b.innerHTML = `${esc(lab)}<span class="n">${n}</span>`;
      b.onclick = () => { sel[k] = v; box.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === b))); apply(); };
      box.appendChild(b); } }

  /* --- cards --- */
  grid.innerHTML = '';
  const cards = worlds.map(w => {
    const a = document.createElement('article'); a.className = 'card'; a.id = 'w-' + w.id; a.dataset.categories = (w.categories || []).join(' ');
    const cats = (w.categories || []).map(c => `<span class="tag ${c}">${esc(CATS[c] || c)}</span>`).join('');
    const edge = (w.categories || []).map(c => `<i style="background:${CATC[c]}"></i>`).join('');
    const links = (w.launch || []).map(l => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('');
    const fmts = w.formats ? [w.formats.mobile && 'phone', w.formats.webxr && 'VR headset', w.formats.video360 && '360° video'].filter(Boolean) : [];
    a.innerHTML = `<div class="pic"><img loading="lazy" src="${esc(w.preview || '')}" alt="" onerror="this.remove()"><div class="edge">${edge}</div></div>
      <div class="body"><div class="tags">${cats}</div><h3>${esc(w.name)}</h3><p>${esc(w.summary)}</p>
      <div class="meta"><b>${esc(w.time?.label || '')}</b> in ${esc(w.place?.name || '')}</div>
      <div class="links">${links}</div>
      <div class="status">${esc(statusText(w))}${fmts.length ? `. Also on: ${fmts.join(', ')}.` : ''}</div></div>`;
    grid.appendChild(a); return { w, a }; });
  function statusText(w) { const s = w.status?.stage; return { pilot: 'New pilot world', complete: 'Complete', draft: 'Draft', 'film-only': 'In the film; interactive version planned' }[s] || 'In progress'; }
  const empty = document.createElement('p'); empty.className = 'empty'; empty.hidden = true;
  empty.innerHTML = 'No world matches all of those choices yet. <button type="button">Show every world</button>'; grid.appendChild(empty);
  empty.querySelector('button').onclick = () => { for (const k in sel) sel[k] = k === 'cat' ? 'all' : 'any'; document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.filter === 'all' || ['any'].includes(c.dataset.time || c.dataset.place || c.dataset.purpose)))); apply(); };

  /* --- the time axis --- */
  const axis = $('axis');
  const posOf = w => { const y = w.time?.year, e = w.time?.era || '';
    if (y && y < 2000) return 4 + (y - 1818) / (1930 - 1818) * 30;
    if (e === 'present') return 50; if (y === 2050) return 68; if (e === 'past-to-future') return 40;
    if (w.kind === 'film-world' || w.kind === 'film') return 80 + ((w.engine?.chapter ?? 4) - 1) * 2.2;
    return 92; };
  for (const [p, t] of [[4, '1818'], [34, '1927'], [50, 'Today'], [68, '2050'], [92, 'Tomorrow']]) { const s = document.createElement('span'); s.className = 'tick'; s.style.left = p + '%'; s.textContent = t; axis.appendChild(s); }
  const used = {};
  const dots = cards.map(({ w, a }) => { const p = posOf(w); const key = Math.round(p / 3); const lane = used[key] = (used[key] ?? -1) + 1;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'dot'; b.style.left = p + '%'; b.style.setProperty('--c', CATC[(w.categories || [])[0]] || 'var(--ink)');
    if (p > 70) b.classList.add('r'); else if (p < 20) b.classList.add('l'); if (lane === 1) b.dataset.up = ''; if (lane >= 2) b.dataset.up2 = '';
    b.setAttribute('aria-label', `${w.name}, ${w.time?.label || ''}`); b.innerHTML = `<span class="tip">${esc(w.name)}</span>`;
    b.onclick = () => { a.scrollIntoView({ block: 'center' }); a.classList.add('flash'); setTimeout(() => a.classList.remove('flash'), 1600); a.querySelector('a')?.focus({ preventScroll: true }); };
    axis.appendChild(b); return b; });

  function apply() { let n = 0;
    cards.forEach(({ w, a }, i) => { const ok = Object.entries(FACETS).every(([k, f]) => sel[k] === 'all' || sel[k] === 'any' || f.get(w).includes(sel[k])); a.hidden = !ok; dots[i].hidden = !ok; if (ok) n++; });
    $('count').textContent = `(${n} of ${worlds.length})`; empty.hidden = n > 0; }
  apply();

  /* --- journeys --- */
  try { const J = await (await fetch('journeys/index.json')).json(); const names = Object.fromEntries(worlds.map(w => [w.id, w.name]));
    $('jlist').innerHTML = J.journeys.map(j => `<li><div><b>${esc(j.title)}</b><span>${esc(j.summary)} ${Math.floor(j.duration / 60)}:${String(j.duration % 60).padStart(2, '0')} · ${j.worlds.map(id => esc(names[id] || id)).join(', ')}</span></div>
      <div class="links"><a href="skyship-engine/journey.html?journey=${esc(j.id)}">Fly</a><a href="skyship-engine/journey.html?journey=${esc(j.id)}&amp;mode=explore">Explore</a><a href="skyship-engine/journey.html?journey=${esc(j.id)}&amp;mode=learn">Learn</a></div></li>`).join('');
  } catch (e) { $('jlist').innerHTML = '<li>The journey list could not be loaded.</li>'; }
})();
