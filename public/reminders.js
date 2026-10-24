/* Sehat Copilot: medicine reminders, appointments, calendar export and the "What your copilot did" feed.
   Loaded after app.js. Uses its globals (S, t, esc, render, buildDoses, schedMeds, curKey, curSet, todayKey, fmtDate ...).
   Everything is kept on this device. Reminders follow what the prescription says; the copilot never advises a change. */
(function () {
  const KP = k => (typeof profKey === 'function' ? profKey(k) : k);
  const jget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(KP(k)) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
  const jset = (k, v) => { try { localStorage.setItem(KP(k), JSON.stringify(v)); } catch (e) { /* storage blocked */ } };

  /* ---------- labels ---------- */
  Object.assign(STR.en, {
    rm_what: 'What your copilot did', rm_sub: 'Your copilot acts on its own. You can see, edit or reject everything it did.',
    rm_rx: 'Scheduled {n} reminders from your prescription of {date}', rm_rx_note: 'The reminders follow what the prescription says. Nothing starts until you accept.',
    rm_fu: 'A follow-up looks overdue: {text} (record of {date})', rm_rp: 'A repeat test looks due: {title}',
    rm_visit: 'Drafted questions for your next visit', rm_open_visit: 'Open visit summary', rm_open_rec: 'Open record',
    rm_accept: 'Accept', rm_edit: 'Edit', rm_reject: 'Reject', rm_undo: 'Undo', rm_dismiss: 'Dismiss', rm_done: 'Mark done',
    rm_accepted: 'Accepted. These reminders are on.', rm_rejected: 'Rejected. No reminders were set.',
    rm_at: 'at {time}', rm_until: 'until {date}', rm_snoozed: 'snoozed until {time}', rm_noend: 'no end date',
    rm_snooze: 'Snooze', rm_min: '{n} min', rm_stop: 'Stop reminders for this medicine', rm_cal: 'Add to Google Calendar',
    rm_stop_confirm: 'Stop reminders for {name}? This only stops reminders in this app. It does not change your prescription.',
    rm_ed_title: 'Edit reminders', rm_time: 'Time', rm_dose: 'Dose', rm_end: 'Last day', rm_save: 'Save', rm_cancel: 'Cancel',
    rm_ap_title: 'Appointments & follow-ups', rm_ap_add: 'Add appointment', rm_ap_edit: 'Edit appointment', rm_ap_empty: 'No appointments or follow-ups yet.',
    rm_ap_name: 'Title', rm_ap_date: 'Date', rm_ap_time: 'Time', rm_ap_note: 'Note', rm_overdue: 'Overdue', rm_nodate: 'no date found',
    rm_del: 'Delete', rm_del_confirm: 'Delete this appointment?', rm_from: 'From your record of {date}',
    rm_ics: 'Download calendar (.ics)', rm_ics_note: 'Add the file to your phone calendar so alerts reach you even when this app is closed.',
    rm_due: 'Time for {name} ({time})', rm_close: 'Close'
  });
  Object.assign(STR.hi, {
    rm_what: 'आपके कोपायलट ने क्या किया', rm_sub: 'आपका कोपायलट अपने आप काम करता है। उसने जो किया उसे आप देख, बदल या अस्वीकार कर सकते हैं।',
    rm_rx: '{date} के आपके पर्चे से {n} याद दिलाने तय किए', rm_rx_note: 'याद दिलाना वही है जो पर्चे में लिखा है। आपके स्वीकार करने तक कुछ शुरू नहीं होता।',
    rm_fu: 'फ़ॉलो-अप की तारीख़ निकल चुकी लगती है: {text} ({date} का रिकॉर्ड)', rm_rp: 'दोबारा जाँच का समय हो गया लगता है: {title}',
    rm_visit: 'अगली मुलाक़ात के लिए सवाल तैयार किए', rm_open_visit: 'विज़िट सारांश खोलें', rm_open_rec: 'रिकॉर्ड खोलें',
    rm_accept: 'स्वीकार करें', rm_edit: 'बदलें', rm_reject: 'अस्वीकार करें', rm_undo: 'वापस करें', rm_dismiss: 'हटाएँ', rm_done: 'पूरा हुआ',
    rm_accepted: 'स्वीकार किया। ये याद दिलाने चालू हैं।', rm_rejected: 'अस्वीकार किया। कोई याद दिलाना नहीं लगाया गया।',
    rm_at: '{time} बजे', rm_until: '{date} तक', rm_snoozed: '{time} तक टाला गया', rm_noend: 'कोई अंतिम तारीख़ नहीं',
    rm_snooze: 'टालें', rm_min: '{n} मिनट', rm_stop: 'इस दवा के याद दिलाने बंद करें', rm_cal: 'Google कैलेंडर में जोड़ें',
    rm_stop_confirm: '{name} के याद दिलाने बंद करें? इससे सिर्फ़ इस ऐप के याद दिलाने बंद होते हैं। आपका पर्चा नहीं बदलता।',
    rm_ed_title: 'याद दिलाने बदलें', rm_time: 'समय', rm_dose: 'खुराक', rm_end: 'आख़िरी दिन', rm_save: 'सहेजें', rm_cancel: 'रद्द करें',
    rm_ap_title: 'अपॉइंटमेंट और फ़ॉलो-अप', rm_ap_add: 'अपॉइंटमेंट जोड़ें', rm_ap_edit: 'अपॉइंटमेंट बदलें', rm_ap_empty: 'अभी कोई अपॉइंटमेंट या फ़ॉलो-अप नहीं है।',
    rm_ap_name: 'शीर्षक', rm_ap_date: 'तारीख़', rm_ap_time: 'समय', rm_ap_note: 'टिप्पणी', rm_overdue: 'तारीख़ निकल गई', rm_nodate: 'तारीख़ नहीं मिली',
    rm_del: 'हटाएँ', rm_del_confirm: 'यह अपॉइंटमेंट हटाएँ?', rm_from: '{date} के आपके रिकॉर्ड से',
    rm_ics: 'कैलेंडर डाउनलोड करें (.ics)', rm_ics_note: 'फ़ाइल को फ़ोन के कैलेंडर में जोड़ें ताकि ऐप बंद होने पर भी अलर्ट मिलें।',
    rm_due: '{name} का समय ({time})', rm_close: 'बंद करें'
  });

  /* ---------- dates ---------- */
  const p2 = n => String(n).padStart(2, '0');
  const isoOf = d => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
  const dOf = s => new Date(String(s).slice(0, 10) + 'T00:00:00');
  const addDays = (s, n) => { const d = dOf(s); d.setDate(d.getDate() + n); return isoOf(d); };
  const validISO = (y, m, d) => { const x = new Date(y, m - 1, d); return x.getFullYear() === y && x.getMonth() === m - 1 && x.getDate() === d ? y + '-' + p2(m) + '-' + p2(d) : null; };
  const MON = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' ');
  const NUMW = { a: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, ten: 10, fourteen: 14 };
  function durDays(s) {
    s = String(s || '').toLowerCase();
    const m = s.match(/(\d+(?:\.\d+)?|a|one|two|three|four|five|six|seven|ten|fourteen)\s*(day|d\b|week|wk|month|mo\b)/);
    if (!m) return null;
    const n = isNaN(m[1]) ? NUMW[m[1]] : Number(m[1]);
    return Math.round(n * (/^d/.test(m[2]) ? 1 : (/^(w)/.test(m[2]) ? 7 : 30)));
  }
  /* a follow-up note is free text: find a date in it, or "after 2 weeks" counted from the record date */
  function parseFU(txt, rd) {
    const s = String(txt || '').toLowerCase();
    let m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return validISO(+m[1], +m[2], +m[3]);
    if ((m = s.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4}|\d{2})\b/))) return validISO(+m[3] < 100 ? 2000 + +m[3] : +m[3], +m[2], +m[1]);
    if ((m = s.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]{3})[a-z]*\.?,?\s+(\d{4})/)) && MON.indexOf(m[2]) >= 0) return validISO(+m[3], MON.indexOf(m[2]) + 1, +m[1]);
    if ((m = s.match(/\b([a-z]{3})[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/)) && MON.indexOf(m[1]) >= 0) return validISO(+m[3], MON.indexOf(m[1]) + 1, +m[2]);
    if (rd && (m = s.match(/(?:after|in|within|next)\s+(\d+|a|one|two|three|four|six)\s*(day|week|month)/))) {
      const n = isNaN(m[1]) ? NUMW[m[1]] : Number(m[1]), d = dOf(rd);
      if (m[2] === 'month') d.setMonth(d.getMonth() + n); else d.setDate(d.getDate() + n * (m[2] === 'week' ? 7 : 1));
      return isoOf(d);
    }
    return null;
  }

  /* ---------- reminder state: edits, snoozes, stopped courses ---------- */
  const SLOT_T = { morning: '08:00', afternoon: '14:00', night: '21:00', asis: '09:00' };
  const ov = () => { const o = jget('sehat_rem', {}); ['t', 'd', 'e', 'x', 's'].forEach(k => { if (!o[k]) o[k] = {}; }); return o; };
  const ovSave = o => jset('sehat_rem', o);
  const tickable = d => d.slot === 'morning' || d.slot === 'afternoon' || d.slot === 'night' || d.slot === 'asis';
  const doseTime = (d, o) => (o || ov()).t[d.key] || SLOT_T[d.slot] || '09:00';
  function endOf(m, o) {
    const e = (o || ov()).e[curKey(m)];
    if (e) return e;
    if (m.ends && /^\d{4}-\d\d-\d\d/.test(m.ends)) return String(m.ends).slice(0, 10);
    const n = durDays(m.duration);
    return n && m.date ? addDays(String(m.date).slice(0, 10), n - 1) : null;
  }
  /* true when the course has ended (end date passed) or the user stopped its reminders */
  function hide(m) {
    const o = ov(), e = endOf(m, o);
    return !!o.x[curKey(m)] || !!(e && e < todayKey());
  }
  const hhmm = ts => { const d = new Date(ts); return d.getHours() + ':' + p2(d.getMinutes()); };
  const medName = m => m.name + (m.strength ? ' ' + m.strength : '');

  /* controls under each dose in the medicine schedule card */
  function doseCtl(d) {
    if (!tickable(d)) return '';
    const o = ov(), m = d.m, sn = o.s[d.key], end = endOf(m, o), live = sn && sn > Date.now();
    const line = [t('rm_at', { time: doseTime(d, o) }), o.d[d.key], end ? t('rm_until', { date: fmtDate(end) }) : t('rm_noend'), live ? t('rm_snoozed', { time: hhmm(sn) }) : ''].filter(Boolean).join(' · ');
    const ev = doseEvent(d, o);
    return '<details class="remctl"><summary>' + esc(line) + '</summary><div class="rm-btns"><span class="muted small">' + esc(t('rm_snooze')) + ':</span>' +
      [10, 30, 60].map(n => '<button type="button" class="btn small secondary" data-act="rm_snooze" data-k="' + esc(d.key) + '" data-n="' + n + '">' + esc(t('rm_min', { n })) + '</button>').join('') +
      '<button type="button" class="btn small secondary" data-act="rm_edit" data-m="' + esc(curKey(m)) + '">' + esc(t('rm_edit')) + '</button>' +
      '<button type="button" class="btn small danger" data-act="rm_stop" data-m="' + esc(curKey(m)) + '" data-name="' + esc(m.name) + '">' + esc(t('rm_stop')) + '</button>' +
      '<a class="btn small secondary" target="_blank" rel="noopener" href="' + esc(gcal(ev)) + '">' + esc(t('rm_cal')) + '</a></div></details>';
  }

  /* ---------- calendar ---------- */
  const compact = (iso, tm, plusMin) => { const d = new Date(iso + 'T' + (tm || '09:00') + ':00'); d.setMinutes(d.getMinutes() + (plusMin || 0)); return d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + 'T' + p2(d.getHours()) + p2(d.getMinutes()) + '00'; };
  function doseEvent(d, o) {
    const m = d.m, rd = m.date ? String(m.date).slice(0, 10) : '', today = todayKey();
    return {
      uid: 'sehat-' + d.key.replace(/[^a-z0-9]/gi, '') + '@sehat', title: medName(m), date: rd > today ? rd : today, time: doseTime(d, o), mins: 15,
      until: endOf(m, o), alarm: '-PT0M',
      details: [(o.d[d.key] || m.dose) ? 'Dose: ' + (o.d[d.key] || m.dose) : '', [m.frequency, m.timing].filter(Boolean).join(', '), 'From your prescription' + (m.date ? ' of ' + String(m.date).slice(0, 10) : '') + '. Reminder only.'].filter(Boolean).join('. ')
    };
  }
  function apptEvent(a) {
    return { uid: 'sehat-' + String(a.id).replace(/[^a-z0-9]/gi, '') + '@sehat', title: a.title, date: a.date, time: a.time || '09:00', mins: 60, until: null, alarm: '-P1D', details: a.note || '' };
  }
  function gcal(e) {
    const enc = encodeURIComponent;
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + enc(e.title) + '&dates=' + compact(e.date, e.time) + '/' + compact(e.date, e.time, e.mins) +
      '&details=' + enc(e.details) + (e.until && e.until >= e.date ? '&recur=RRULE:FREQ=DAILY;UNTIL=' + e.until.replace(/-/g, '') : '');
  }
  function allEvents() {
    const o = ov();
    return buildDoses(schedMeds()).filter(tickable).map(d => doseEvent(d, o)).concat(appts().filter(a => a.date).map(apptEvent));
  }
  function icsText() {
    const esc2 = s => String(s || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1');
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Sehat Copilot//Reminders//EN', 'CALSCALE:GREGORIAN'], stamp = compact(todayKey(), '00:00') + 'Z';
    allEvents().forEach(e => {
      L.push('BEGIN:VEVENT', 'UID:' + e.uid, 'DTSTAMP:' + stamp, 'DTSTART:' + compact(e.date, e.time), 'DTEND:' + compact(e.date, e.time, e.mins));
      if (e.until && e.until >= e.date) L.push('RRULE:FREQ=DAILY;UNTIL=' + e.until.replace(/-/g, '') + 'T235959');
      L.push('SUMMARY:' + esc2(e.title), 'DESCRIPTION:' + esc2(e.details), 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc2(e.title), 'TRIGGER:' + e.alarm, 'END:VALARM', 'END:VEVENT');
    });
    L.push('END:VCALENDAR');
    return L.join('\r\n') + '\r\n';
  }
  function downloadIcs() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([icsText()], { type: 'text/calendar' }));
    a.download = 'sehat-reminders.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ---------- appointments & follow-ups ---------- */
  const apStore = () => { const s = jget('sehat_appts', {}); return { items: Array.isArray(s.items) ? s.items : [], done: s.done || {} }; };
  function appts() {
    const st = apStore(), out = st.items.map(a => Object.assign({ src: 'm' }, a));
    (S.records || []).forEach(r => {
      if (!r.follow_up || st.done[r.id]) return;
      out.push({ id: 'fu:' + r.id, src: 'r', title: r.follow_up, date: parseFU(r.follow_up, r.date), rec: r.id, rdate: r.date });
    });
    const key = a => a.date ? a.date + ' ' + (a.time || '09:00') : '9999';
    return out.sort((a, b) => key(a) < key(b) ? -1 : 1);
  }
  const overdue = a => !!a.date && a.date < todayKey();
  function apptCard() {
    const list = appts(), evs = allEvents();
    return '<div class="card" id="rmAppts"><div class="row between"><h2>' + esc(t('rm_ap_title')) + '</h2><button type="button" class="btn small secondary" data-act="rm_ap_new">' + esc(t('rm_ap_add')) + '</button></div>' +
      (list.length ? '<ul class="list rm-ap">' + list.map(a => {
        const meta = [a.date ? fmtDate(a.date) + (a.time ? ' ' + a.time : '') : t('rm_nodate'), a.src === 'r' ? t('rm_from', { date: fmtDate(a.rdate) }) : '', a.note].filter(Boolean).join(' · ');
        return '<li><span class="l"><strong>' + esc(a.title) + '</strong>' + (overdue(a) ? ' <span class="flag f-high">' + esc(t('rm_overdue')) + '</span>' : '') + '<br><span class="muted small">' + esc(meta) + '</span>' +
          '<div class="rm-btns">' + (a.date ? '<a class="btn small secondary" target="_blank" rel="noopener" href="' + esc(gcal(apptEvent(a))) + '">' + esc(t('rm_cal')) + '</a>' : '') +
          (a.src === 'm' ? '<button type="button" class="btn small secondary" data-act="rm_ap_edit" data-id="' + esc(a.id) + '">' + esc(t('rm_edit')) + '</button><button type="button" class="btn small danger" data-act="rm_ap_del" data-id="' + esc(a.id) + '">' + esc(t('rm_del')) + '</button>'
            : '<button type="button" class="btn small secondary" data-act="rm_done" data-rec="' + esc(a.rec) + '">' + esc(t('rm_done')) + '</button><button type="button" class="btn small link" data-act="openrec" data-id="' + esc(a.rec) + '">' + esc(t('rm_open_rec')) + '</button>') +
          '</div></span></li>';
      }).join('') + '</ul>' : '<p class="muted">' + esc(t('rm_ap_empty')) + '</p>') +
      (evs.length ? '<div class="rm-btns" style="margin-top:12px"><button type="button" class="btn small" data-act="rm_ics">' + esc(t('rm_ics')) + '</button></div><p class="muted small" style="margin:6px 0 0">' + esc(t('rm_ics_note')) + '</p>' : '') + '</div>';
  }

  /* ---------- copilot actions feed ---------- */
  const acts = () => jget('sehat_actions', []);
  const actsSave = l => jset('sehat_actions', l);
  function addAct(a) {
    const l = acts();
    if (l.some(x => x.id === a.id)) return false;
    a.ts = Date.now(); a.st = 'new'; l.push(a); actsSave(l);
    return true;
  }
  function setSt(id, st) { const l = acts(), a = l.find(x => x.id === id); if (a) { a.st = st; actsSave(l); } return a; }
  const actDoses = a => buildDoses(a.meds.map(m => ({ m, date: a.date }))).filter(tickable);
  /* called by app.js after a NEW record is saved */
  function onSaved(rec) {
    const meds = arr(rec.medicines).filter(m => m && m.name).map(m => ({ name: m.name, strength: m.strength || null, dose: m.dose || null, frequency: m.frequency || null, timing: m.timing || null, duration: m.duration || null, date: rec.date || null }));
    if (meds.length) {
      const a = { id: 'rx:' + rec.id, type: 'rx', rec: rec.id, date: rec.date || todayKey(), meds };
      if (actDoses(a).length) addAct(a);
      addAct({ id: 'visit:' + rec.id, type: 'visit', rec: rec.id });
    }
    scan();
  }
  /* overdue follow-ups and overdue repeat tests */
  function scan() {
    if (!S || !S.records || !S.records.length) return;
    const st = apStore(), today = todayKey();
    S.records.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).filter(r => r.follow_up && !st.done[r.id]).filter(r => { const d = parseFU(r.follow_up, r.date); return d && d < today; })
      .slice(0, 2).forEach(r => addAct({ id: 'fu:' + r.id, type: 'fu', rec: r.id, text: r.follow_up, date: r.date }));
    const pv = S.insights && S.insights.data && Array.isArray(S.insights.data.preventive) ? S.insights.data.preventive : [];
    pv.filter(p => p && p.kind === 'repeat_test' && p.overdue && p.title).forEach(p => addAct({ id: 'rp:' + String(p.kind || '') + ':' + String(p.title).toLowerCase(), type: 'rp', title: p.title, why: p.why || '', records: arr(p.records) }));
  }
  function actionsCard(opts) {
    try { scan(); } catch (e) { /* ignore */ }
    let l = acts().filter(a => a.type === 'rx' || a.st !== 'rejected').sort((a, b) => b.ts - a.ts);
    if (opts && opts.recent) l = l.filter(a => a.st === 'new').slice(0, 3); else l = l.slice(0, 6);
    if (!l.length) return '';
    const btn = (act, id, label, cls) => '<button type="button" class="btn small ' + (cls || 'secondary') + '" data-act="' + act + '" data-id="' + esc(id) + '">' + esc(t(label)) + '</button>';
    return '<div class="card rm-feed" id="rmFeed"><h2>' + esc(t('rm_what')) + '</h2><p class="muted small" style="margin:2px 0 8px">' + esc(t('rm_sub')) + '</p><ul class="list">' + l.map(a => {
      let head = '', body = '', b = '';
      if (a.type === 'rx') {
        const ds = actDoses(a), o = ov();
        head = t('rm_rx', { n: ds.length, date: fmtDate(a.date) });
        body = '<ul class="rm-doses">' + a.meds.map(m => {
          const mine = ds.filter(d => d.m === m || curKey(d.m) === curKey(m)), e = endOf(m, o);
          return '<li>' + esc(medName(m)) + ': ' + esc(mine.map(d => doseTime(d, o)).join(', ') || '-') + ' · ' + esc(e ? t('rm_until', { date: fmtDate(e) }) : t('rm_noend')) + '</li>';
        }).join('') + '</ul>';
        if (a.st === 'new') b = btn('rm_acc', a.id, 'rm_accept', '') + btn('rm_aedit', a.id, 'rm_edit') + btn('rm_rej', a.id, 'rm_reject', 'danger') + '</div><p class="muted small" style="margin:6px 0 0">' + esc(t('rm_rx_note')) + '</p><div>';
        else b = '<span class="small">' + esc(t(a.st === 'accepted' ? 'rm_accepted' : 'rm_rejected')) + '</span> ' + (a.st === 'accepted' ? btn('rm_aedit', a.id, 'rm_edit') : '') + btn('rm_undo', a.id, 'rm_undo', 'link');
      } else if (a.type === 'fu') {
        head = t('rm_fu', { text: a.text, date: fmtDate(a.date) });
        b = btn('rm_done', a.rec, 'rm_done') + '<button type="button" class="btn small link" data-act="openrec" data-id="' + esc(a.rec) + '">' + esc(t('rm_open_rec')) + '</button>' + btn('rm_dis', a.id, 'rm_dismiss', 'link');
      } else if (a.type === 'rp') {
        head = t('rm_rp', { title: a.title });
        body = a.why ? '<p class="muted small" style="margin:2px 0 0">' + esc(a.why) + '</p>' : '';
        b = btn('rm_dis', a.id, 'rm_dismiss', 'link');
      } else {
        head = t('rm_visit');
        b = '<button type="button" class="btn small secondary" data-act="visit">' + esc(t('rm_open_visit')) + '</button>' + btn('rm_dis', a.id, 'rm_dismiss', 'link');
      }
      return '<li><span class="l"><strong>' + esc(head) + '</strong>' + body + '<div class="rm-btns">' + b + '</div></span></li>';
    }).join('') + '</ul></div>';
  }
  function rxMeds(id) { const a = acts().find(x => x.id === id); return a && a.type === 'rx' ? a : null; }

  /* ---------- editor overlay ---------- */
  let ED = null;
  function closeEd() { const n = document.getElementById('remEd'); if (n) n.remove(); ED = null; }
  function openEd(html, state) {
    closeEd(); ED = state;
    const n = document.createElement('div');
    n.id = 'remEd'; n.className = 'rm-ov'; n.setAttribute('role', 'dialog'); n.setAttribute('aria-modal', 'true');
    n.innerHTML = '<div class="rm-box">' + html + '<div class="row" style="margin-top:14px"><button type="button" class="btn" data-act="rm_save">' + esc(t('rm_save')) + '</button><button type="button" class="btn secondary" data-act="rm_cancel">' + esc(t('rm_cancel')) + '</button></div></div>';
    document.body.appendChild(n);
    const f = n.querySelector('input'); if (f) f.focus();
  }
  function editMeds(items) {
    const o = ov(), seen = {};
    let h = '<h2 style="margin-bottom:10px">' + esc(t('rm_ed_title')) + '</h2>';
    items.forEach(x => {
      const k = curKey(x.m); if (seen[k]) return; seen[k] = 1;
      const ds = buildDoses([x]).filter(tickable);
      h += '<fieldset class="rm-fs"><legend>' + esc(medName(x.m)) + '</legend><label class="rm-f">' + esc(t('rm_end')) + '<input type="date" data-e="' + esc(k) + '" value="' + esc(endOf(x.m, o) || '') + '"></label>' +
        ds.map(d => '<div class="rm-two"><label class="rm-f">' + esc(t('rm_time')) + '<input type="time" data-t="' + esc(d.key) + '" value="' + esc(doseTime(d, o)) + '"></label>' +
          '<label class="rm-f">' + esc(t('rm_dose')) + '<input type="text" data-d="' + esc(d.key) + '" value="' + esc(o.d[d.key] || x.m.dose || '') + '"></label></div>').join('') + '</fieldset>';
    });
    openEd(h, { kind: 'meds', items });
  }
  function editAppt(id) {
    const a = id ? apStore().items.find(x => x.id === id) : null;
    const fld = (l, k, ty, v) => '<label class="rm-f">' + esc(t(l)) + '<input type="' + ty + '" id="rmA_' + k + '" value="' + esc(v || '') + '"></label>';
    openEd('<h2 style="margin-bottom:10px">' + esc(t(a ? 'rm_ap_edit' : 'rm_ap_add')) + '</h2>' + fld('rm_ap_name', 'title', 'text', a && a.title) + '<div class="rm-two">' + fld('rm_ap_date', 'date', 'date', a && a.date) + fld('rm_ap_time', 'time', 'time', a && a.time) + '</div>' + fld('rm_ap_note', 'note', 'text', a && a.note), { kind: 'appt', id: a ? a.id : null });
  }
  function saveEd() {
    if (!ED) return;
    const q = s => Array.from(document.querySelectorAll('#remEd ' + s));
    if (ED.kind === 'meds') {
      const o = ov();
      q('[data-t]').forEach(i => { if (i.value) o.t[i.dataset.t] = i.value; });
      q('[data-d]').forEach(i => { const v = i.value.trim(), k = i.dataset.d; if (v) o.d[k] = v; else delete o.d[k]; });
      q('[data-e]').forEach(i => { if (i.value) o.e[i.dataset.e] = i.value; else delete o.e[i.dataset.e]; });
      ovSave(o);
    } else {
      const v = k => (document.getElementById('rmA_' + k) || {}).value || '';
      const title = v('title').trim(), date = v('date');
      if (!title || !date) { (document.getElementById(title ? 'rmA_date' : 'rmA_title') || {}).focus(); return; }
      const st = apStore(), it = { id: ED.id || 'a' + Date.now(), title, date, time: v('time') || '', note: v('note').trim() };
      const i = st.items.findIndex(x => x.id === it.id);
      if (i >= 0) st.items[i] = it; else st.items.push(it);
      jset('sehat_appts', st);
    }
    closeEd(); render();
  }

  /* ---------- clicks ---------- */
  document.addEventListener('click', e => {
    const el = e.target.closest ? e.target.closest('[data-act^="rm_"]') : null;
    if (!el) return;
    const a = el.dataset.act, id = el.dataset.id;
    if (a === 'rm_acc' || a === 'rm_rej' || a === 'rm_undo') {
      const x = rxMeds(id); if (!x) return;
      x.meds.forEach(m => curSet(curKey(m), a === 'rm_acc'));
      setSt(id, a === 'rm_acc' ? 'accepted' : (a === 'rm_rej' ? 'rejected' : 'new'));
      render();
    } else if (a === 'rm_aedit') { const x = rxMeds(id); if (x) editMeds(x.meds.map(m => ({ m, date: x.date }))); }
    else if (a === 'rm_dis') { setSt(id, 'rejected'); render(); }
    else if (a === 'rm_done') { const st = apStore(); st.done[el.dataset.rec || id] = 1; jset('sehat_appts', st); render(); }
    else if (a === 'rm_snooze') { const o = ov(); o.s[el.dataset.k] = Date.now() + Number(el.dataset.n) * 60000; ovSave(o); render(); }
    else if (a === 'rm_edit') { const ds = buildDoses(schedMeds()).filter(d => curKey(d.m) === el.dataset.m); if (ds.length) editMeds([{ m: ds[0].m, date: ds[0].date }]); }
    else if (a === 'rm_stop') { if (confirm(t('rm_stop_confirm', { name: el.dataset.name }))) { const o = ov(); o.x[el.dataset.m] = 1; ovSave(o); render(); } }
    else if (a === 'rm_ap_new') editAppt(null);
    else if (a === 'rm_ap_edit') editAppt(id);
    else if (a === 'rm_ap_del') { if (confirm(t('rm_del_confirm'))) { const st = apStore(); st.items = st.items.filter(x => x.id !== id); jset('sehat_appts', st); render(); } }
    else if (a === 'rm_ics') downloadIcs();
    else if (a === 'rm_save') saveEd();
    else if (a === 'rm_cancel') closeEd();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeEd(); });

  /* ---------- while the app is open: doses with a custom time or an ended snooze ---------- */
  const FIRED = {};
  function toast(msg) {
    let n = document.getElementById('rmToast');
    if (!n) { n = document.createElement('div'); n.id = 'rmToast'; n.className = 'rm-toast'; n.setAttribute('role', 'status'); n.setAttribute('aria-live', 'polite'); document.body.appendChild(n); }
    n.textContent = msg; n.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => { n.hidden = true; }, 20000);
  }
  function tick() {
    if (!S || !S.records || !S.records.length) return;
    const o = ov(), now = Date.now(), day = todayKey(), tk = takenGet();
    buildDoses(schedMeds()).filter(tickable).forEach(d => {
      if (tk[d.key]) return;
      const sn = o.s[d.key];
      let due = sn || null;
      if (!due && o.t[d.key]) due = new Date(day + 'T' + o.t[d.key] + ':00').getTime();
      if (!due || now < due || now - due > 10 * 60000) return;
      const fk = day + d.key + due;
      if (FIRED[fk]) return;
      FIRED[fk] = 1;
      const msg = t('rm_due', { name: medName(d.m), time: doseTime(d, o) });
      toast(msg);
      if (typeof remindOn === 'function' && remindOn()) { try { new Notification(t('mt_notif_title'), { body: msg }); } catch (x) { /* ignore */ } }
    });
  }
  setInterval(tick, 20000);

  window.SehatRem = { actionsCard, apptCard, doseCtl, hide, onSaved, icsText, gcal, allEvents, parseFU, tick };
})();
