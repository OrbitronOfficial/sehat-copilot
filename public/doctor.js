/* Sehat Doctor (beta): today's queue, consultation (record / drop audio / type) -> AI draft ->
   doctor approves -> queued for the patient's app; sent prescriptions, patient history, to-do.
   Recordings stay on this device (IndexedDB 'sehat-doctor'). */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').trim().toLowerCase();
  let rec = null, chunks = [], started = 0, tick = null, audio = null, draft = null;

  /* ---------- sidebar ---------- */
  const SVG = d => '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';
  const NAV = [
    ['today', 'Today', '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>'],
    ['consult', 'Consultation', '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'],
    ['rx', 'Prescriptions', '<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h5"/>'],
    ['history', 'Patient history', '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>'],
    ['todo', 'To-do', '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>'],
  ];
  let view = 'today';
  try { view = sessionStorage.getItem('sehat_doc_view') || 'today'; } catch (e) { /* private mode */ }
  function go(v) {
    view = v; try { sessionStorage.setItem('sehat_doc_view', v); } catch (e) { /* private mode */ }
    $('nav').innerHTML = NAV.map(([k, l, i]) => '<button type="button" data-go="' + k + '"' + (k === v ? ' aria-current="page"' : '') + '>' + SVG(i) + '<span>' + l + '</span></button>').join('');
    document.querySelectorAll('.d-view').forEach(s => { s.hidden = s.dataset.view !== v; });
    if (v === 'today') drawQueue();
    if (v === 'rx') drawRx();
    if (v === 'history') drawHistory();
    if (v === 'todo') drawTodo();
    if (v === 'consult') fillKnown();
    scrollTo({ top: 0, behavior: 'smooth' });
  }
  $('nav').onclick = e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); };
  $('themeBtn').onclick = () => {
    const d = document.documentElement, t = d.dataset.theme === 'dark' ? 'light' : 'dark';
    d.dataset.theme = t; try { localStorage.setItem('sehat_theme', t); } catch (e) { /* private mode */ }
  };

  /* ---------- storage ---------- */
  function db() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('sehat-doctor', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('consults', { keyPath: 'id' });
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
  }
  async function put(c) { const d = await db(); return new Promise(res => { const tx = d.transaction('consults', 'readwrite'); tx.objectStore('consults').put(c); tx.oncomplete = res; }); }
  async function all() { const d = await db(); return new Promise(res => { const q = d.transaction('consults').objectStore('consults').getAll(); q.onsuccess = () => res((q.result || []).sort((a, b) => b.at - a.at)); }); }
  const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage full or blocked */ } };

  async function api(path, body) {
    const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'Request failed (' + r.status + ')');
    return j;
  }
  const status = (t, bad) => { $('status').textContent = t; $('status').className = 'd-status' + (bad ? ' bad' : ''); };
  const patient = () => ({ name: $('pName').value.trim(), age: $('pAge').value.trim(), sex: $('pSex').value });
  const b64 = blob => new Promise(res => { const f = new FileReader(); f.onload = () => res(String(f.result)); f.readAsDataURL(blob); });

  /* ---------- audio: live recording, dropped file or picked file all go one way ---------- */
  $('recBtn').onclick = async () => {
    if (rec) return rec.stop();
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { return alert('Microphone permission is needed to record.'); }
    chunks = [];
    rec = new MediaRecorder(stream, { audioBitsPerSecond: 24000 });
    rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      clearInterval(tick); $('recCard').classList.remove('recording');
      $('recBtn').textContent = 'Record again'; rec = null;
      await useAudio(new Blob(chunks, { type: chunks[0] ? chunks[0].type : 'audio/webm' }), Math.round((Date.now() - started) / 1000));
    };
    rec.start(1000); started = Date.now();
    $('recCard').classList.add('recording'); $('recBtn').textContent = 'Stop recording';
    tick = setInterval(() => { const s = Math.round((Date.now() - started) / 1000); $('recTime').textContent = 'Recording ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }, 500);
  };
  const TYPES = { mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', ogg: 'audio/ogg', webm: 'audio/webm' };
  async function useFile(f) {
    if (!f) return;
    const ext = (f.name.split('.').pop() || '').toLowerCase();
    if (!(String(f.type).indexOf('audio/') === 0 || TYPES[ext])) return status('That is not an audio file. Use mp3, wav, m4a, webm or ogg.', true);
    $('recTime').textContent = f.name;
    await useAudio(new Blob([f], { type: f.type || TYPES[ext] }), null);
  }
  const drop = $('drop');
  drop.onclick = () => $('audioFile').click();
  drop.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('audioFile').click(); } };
  ['dragenter', 'dragover'].forEach(n => drop.addEventListener(n, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(n => drop.addEventListener(n, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => useFile(e.dataTransfer.files[0]));
  $('audioFile').onchange = async e => { await useFile(e.target.files[0]); e.target.value = ''; };

  async function useAudio(blob, secs) {
    audio = { mime: blob.type, dataUrl: await b64(blob), secs };
    $('player').src = audio.dataUrl; $('player').hidden = false;
    status('Turning speech into text…');
    try {
      const j = await api('/api/transcribe', { audio: audio.dataUrl, mime: audio.mime });
      $('transcript').value = j.text || ''; status(j.text ? 'Transcript ready. Correct it if needed.' : 'No speech was heard.', !j.text);
    } catch (e) { status(e.message + ' You can type the notes instead.', true); }
    $('draftBtn').disabled = $('transcript').value.trim().length < 20;
  }
  $('transcript').oninput = () => { $('draftBtn').disabled = $('transcript').value.trim().length < 20; };

  /* ---------- draft, edit, approve ---------- */
  $('draftBtn').onclick = async () => {
    $('draftBtn').disabled = true; status('Writing the draft prescription…');
    try { draft = await api('/api/consult', { transcript: $('transcript').value, patient: patient() }); fill(draft); status('Draft ready below.'); }
    catch (e) { status(e.message, true); }
    $('draftBtn').disabled = false;
  };
  function medRow(m) {
    const tr = document.createElement('tr');
    const hint = m.check ? '<div class="d-note" style="font-size:.78rem">' + esc(m.check) + '</div>' : m.heard_as ? '<div class="d-status" style="font-size:.78rem">Heard as "' + esc(m.heard_as) + '"</div>' : '';
    tr.innerHTML = ['name', 'strength', 'frequency', 'timing', 'duration'].map(k => '<td><input class="d-in" data-k="' + k + '" value="' + esc(k === 'frequency' ? [m.dose, m.frequency].filter(Boolean).join(' ') : m[k]) + '">' + (k === 'name' ? hint : '') + '</td>').join('') +
      '<td><button class="btn small secondary" title="Remove">×</button></td>';
    tr.querySelector('button').onclick = () => tr.remove();
    $('meds').appendChild(tr);
  }
  function fill(d) {
    $('draftCard').hidden = false;
    $('dx').value = (d.diagnoses || []).map(x => x.name).join(', ');
    $('meds').innerHTML = ''; (d.medicines || []).forEach(medRow);
    $('advice').value = (d.advice || []).join('\n'); $('fu').value = d.follow_up || '';
    if (!$('pName').value && d.patient && d.patient.name) $('pName').value = d.patient.name;
    $('draftCard').scrollIntoView({ behavior: 'smooth' });
  }
  $('addMed').onclick = () => medRow({});
  $('discardBtn').onclick = () => { draft = null; $('draftCard').hidden = true; };
  $('approveBtn').onclick = async () => {
    if (!draft) return;
    const p = patient();
    if (!p.name) { $('pName').focus(); $('pName').scrollIntoView({ behavior: 'smooth', block: 'center' }); return alert('Add the patient name so the prescription reaches the right person.'); }
    const meds = Array.from($('meds').querySelectorAll('tr')).map(tr => {
      const m = {}; tr.querySelectorAll('input').forEach(i => { m[i.dataset.k] = i.value.trim(); }); return m;
    }).filter(m => m.name).map(m => Object.assign({ generic: '', dose: '', instructions: '', source_text: '', page: null, confidence: 1 }, m));
    const record = Object.assign({}, draft, {
      patient: p, medicines: meds, follow_up: $('fu').value.trim(), warnings: [],
      advice: $('advice').value.split('\n').map(s => s.trim()).filter(Boolean),
      diagnoses: $('dx').value.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name, source_text: '', confidence: 1 })),
      title: 'Prescription from your doctor', overall_confidence: 1,
    });
    delete record.transcript;  // the patient gets the prescription; the recording stays with the doctor
    try {
      await api('/api/consult/send', { record });
      await put({ id: record.id, at: Date.now(), patient: p, audio, transcript: $('transcript').value, record, sent: true });
      alert('Approved and sent to ' + p.name + '. It appears in their app the next time it opens.');
      draft = null; audio = null; $('draftCard').hidden = true; $('transcript').value = ''; $('player').hidden = true;
      $('recTime').textContent = 'Not recording'; $('recBtn').textContent = 'Start recording'; status(''); $('draftBtn').disabled = true;
      ['pName', 'pAge'].forEach(id => { $(id).value = ''; }); $('pSex').value = '';
      go('rx');
    } catch (e) { alert(e.message); }
  };

  /* ---------- prescriptions sent ---------- */
  const consultHTML = c => '<div class="d-item"><div class="d-row"><b>' + esc(c.patient.name) + '</b><span class="d-status">' + new Date(c.at).toLocaleString() + '</span><span class="d-tag">Approved and sent</span></div>' +
    '<div>' + esc((c.record.diagnoses || []).map(x => x.name).join(', ') || 'No diagnosis') + ' · ' + esc((c.record.medicines || []).map(m => [m.name, m.strength].filter(Boolean).join(' ')).join(', ') || 'No medicines') + '</div>' +
    (c.record.follow_up ? '<div class="d-status">Follow-up: ' + esc(c.record.follow_up) + '</div>' : '') +
    (c.audio ? '<audio controls src="' + esc(c.audio.dataUrl) + '"></audio>' : '') +
    (c.transcript ? '<details><summary class="d-status">Transcript</summary><p>' + esc(c.transcript) + '</p></details>' : '') + '</div>';
  async function drawRx() {
    const q = norm($('rxSearch').value), list = (await all()).filter(c => !q || norm(c.patient.name).includes(q) || (c.record.medicines || []).some(m => norm(m.name).includes(q)));
    $('rxList').innerHTML = list.length ? list.map(consultHTML).join('') : '<p class="d-empty">No prescriptions sent yet.</p>';
  }
  $('rxSearch').oninput = drawRx;

  /* ---------- today's queue, most urgent first; the doctor can override ---------- */
  const day = d => 'sehat_doc_queue_' + d;
  const QK = day(new Date().toISOString().slice(0, 10));
  const RULES = [
    ['major', /chest pain|breathless|short(ness)? of breath|unconscious|faint|seizure|fit|stroke|bleed|blood in|severe|accident|very high (fever|sugar|bp)|pregnan/i, 'Red-flag symptom'],
    ['moderate', /fever|vomit|diarr|pain|infection|sugar|bp|pressure|dizz|cough|swelling|rash|weak/i, 'Needs attention today'],
  ];
  const triage = cc => { for (const [lv, re, why] of RULES) { const m = String(cc).match(re); if (m) return { lv, why: why + ': "' + m[0] + '"' }; } return { lv: 'minor', why: 'Routine or follow-up' }; };
  const RANK = { major: 0, moderate: 1, minor: 2 };
  const load = () => lsGet(QK, []), save = q => lsSet(QK, q);
  function drawQueue() {
    const q = load().sort((a, b) => (a.done - b.done) || (RANK[a.lv] - RANK[b.lv]) || (a.at - b.at));
    const n = l => q.filter(p => !p.done && p.lv === l).length;
    $('qStats').innerHTML = [['', q.length, 'Patients today'], ['', q.filter(p => p.done).length, 'Seen'], ['major', n('major'), 'Major waiting'], ['moderate', n('moderate'), 'Moderate waiting'], ['', n('minor'), 'Minor waiting']]
      .map(([c, v, l]) => '<div class="stat ' + c + '"><div class="stat-n">' + v + '</div><div class="stat-l">' + l + '</div></div>').join('');
    $('queue').innerHTML = q.length ? q.map((p, i) => '<tr class="' + (p.done ? 'done' : '') + '"><td>' + (i + 1) + '</td><td><b>' + esc(p.name) + '</b> <span class="d-status">' + esc(p.age) + '</span></td><td>' + esc(p.cc) + '</td>' +
      '<td><select class="d-in pr-' + p.lv + '" data-id="' + p.id + '">' + ['major', 'moderate', 'minor'].map(l => '<option value="' + l + '"' + (l === p.lv ? ' selected' : '') + '>' + l[0].toUpperCase() + l.slice(1) + '</option>').join('') + '</select></td>' +
      '<td class="d-status">' + esc(p.manual ? 'Set by you' : p.why) + '</td><td><button class="btn small ' + (p.done ? 'secondary' : 'primary') + '" data-start="' + p.id + '">' + (p.done ? 'Seen' : 'Start') + '</button></td></tr>').join('')
      : '<tr><td colspan="6" class="d-empty">No patients added for today yet.</td></tr>';
  }
  $('qAdd').onclick = () => {
    const name = $('qName').value.trim(); if (!name) return $('qName').focus();
    const t = triage($('qCc').value), q = load();
    q.push({ id: Date.now().toString(36), name, age: $('qAge').value.trim(), cc: $('qCc').value.trim(), lv: t.lv, why: t.why, at: Date.now(), done: false });
    save(q); $('qName').value = $('qAge').value = $('qCc').value = ''; drawQueue();
  };
  $('queue').onchange = e => { const id = e.target.dataset.id; if (!id) return; const q = load(), p = q.find(x => x.id === id); if (p) { p.lv = e.target.value; p.manual = true; save(q); drawQueue(); } };
  $('queue').onclick = e => {
    const id = e.target.dataset.start; if (!id) return;
    const q = load(), p = q.find(x => x.id === id); if (!p) return;
    p.done = true; save(q);
    go('consult');
    $('pName').value = p.name; $('pAge').value = p.age; $('transcript').value = p.cc ? 'Complaint: ' + p.cc + '. ' : '';
  };

  /* ---------- patient history: every visit and prescription for one person ---------- */
  function visits() {  // queue entries from every day kept on this device
    const out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf('sehat_doc_queue_') === 0) lsGet(k, []).forEach(v => out.push(Object.assign({ day: k.slice(16) }, v)));
    }
    return out;
  }
  async function people() {
    const names = new Map();
    (await all()).forEach(c => names.set(norm(c.patient.name), c.patient.name));
    visits().forEach(v => names.set(norm(v.name), v.name));
    return Array.from(names.values()).filter(Boolean).sort();
  }
  async function fillKnown() { $('knownPatients').innerHTML = (await people()).map(n => '<option value="' + esc(n) + '">').join(''); }
  let histWho = '';
  async function drawHistory() {
    const ps = await people();
    $('histPeople').innerHTML = ps.length ? ps.map(n => '<button class="btn small ' + (norm(n) === histWho ? 'primary' : 'secondary') + '" data-who="' + esc(n) + '">' + esc(n) + '</button>').join('') : '<p class="d-empty">No patients yet. Add them on Today or send a prescription.</p>';
    if (!histWho) return;
    const cs = (await all()).filter(c => norm(c.patient.name) === histWho);
    const vs = visits().filter(v => norm(v.name) === histWho).sort((a, b) => b.at - a.at);
    $('histBody').innerHTML = '<h2>Visits</h2>' + (vs.length ? '<div class="d-scroll"><table class="d-table"><thead><tr><th>Date</th><th>Complaint</th><th>Priority</th></tr></thead><tbody>' +
      vs.map(v => '<tr><td>' + esc(v.day) + '</td><td>' + esc(v.cc) + '</td><td class="pr-' + v.lv + '">' + esc(v.lv) + '</td></tr>').join('') + '</tbody></table></div>' : '<p class="d-empty">No visits recorded.</p>') +
      '<h2 style="margin-top:18px">Prescriptions</h2>' + (cs.length ? cs.map(consultHTML).join('') : '<p class="d-empty">No prescriptions sent.</p>');
  }
  $('histPeople').onclick = e => { const b = e.target.closest('[data-who]'); if (b) { histWho = norm(b.dataset.who); drawHistory(); } };

  /* ---------- to-do ---------- */
  const TK = 'sehat_doc_todo';
  function drawTodo() {
    const t = lsGet(TK, []);
    $('todoList').innerHTML = t.length ? t.map((x, i) => '<label class="d-todo' + (x.done ? ' done' : '') + '"><input type="checkbox" data-i="' + i + '"' + (x.done ? ' checked' : '') + '><span>' + esc(x.text) + '</span><button class="btn small secondary x" data-del="' + i + '" aria-label="Remove">×</button></label>').join('') : '<p class="d-empty">Nothing to do. Add a task above.</p>';
  }
  const addTodo = () => { const v = $('todoIn').value.trim(); if (!v) return; const t = lsGet(TK, []); t.unshift({ text: v, done: false }); lsSet(TK, t); $('todoIn').value = ''; drawTodo(); };
  $('todoAdd').onclick = addTodo;
  $('todoIn').onkeydown = e => { if (e.key === 'Enter') addTodo(); };
  $('todoList').onchange = e => { const i = e.target.dataset.i; if (i == null) return; const t = lsGet(TK, []); t[i].done = e.target.checked; lsSet(TK, t); drawTodo(); };
  $('todoList').onclick = e => { const i = e.target.dataset.del; if (i == null) return; e.preventDefault(); const t = lsGet(TK, []); t.splice(i, 1); lsSet(TK, t); drawTodo(); };

  go(NAV.some(n => n[0] === view) ? view : 'today');
})();
