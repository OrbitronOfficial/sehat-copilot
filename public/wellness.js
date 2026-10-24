'use strict';
/* ================= Views split out of "My health", Wellness graphs, steps and reading guidance =================
   Loaded after app.js / reminders.js / journal.js. app.js calls viewMeds / viewVisits / viewJournal /
   viewWellness / viewFamily from render(), hubTiles() from viewHealth(), and SehatWell.* from wellnessCard().
   Not a diagnosis tool: the guidance below is first-aid style advice only, never names a medicine or a dose. */

/* ---- thresholds that trigger the "what to do now" guidance (mmHg and mg/dL) ---- */
const WL_BP_LOW_UP = 90, WL_BP_LOW_LO = 60;      // low blood pressure: upper < 90 or lower < 60
const WL_BP_HIGH_UP = 180, WL_BP_HIGH_LO = 120;  // very high blood pressure: 180/120 or more
const WL_SUGAR_LOW = 70, WL_SUGAR_HIGH = 300;    // low sugar: < 70, very high sugar: > 300
/* usual adult ranges drawn as the dashed band on the graphs (a general guide, not a personal target) */
const WL_USUAL = { bp_up: [90, 120], bp_lo: [60, 80], sugar_fasting: [70, 100], sugar_pp: [70, 140], pulse: [60, 100] };

Object.assign(STR.en, {
  nav_meds: 'Medicines', nav_visits: 'Visits', nav_journal: 'Journal', nav_wellness: 'Wellness', nav_family: 'Family', nav_more: 'More',
  meds_sub: 'Today\'s doses, the medicines found in your records, and what to ask your pharmacist.',
  visits_sub: 'Doctor visits, follow-ups and reminders.', journal_sub: 'How you feel each day, and a summary to show your doctor.',
  wellness_sub: 'Home readings, steps and everyday habits.', family_sub: 'Everyone whose records are kept on this device.',
  hub_meds_n: '{x} of {y} taken today', hub_meds_rec: '{n} recorded', hub_meds_none: 'No medicines yet', hub_visits: 'Appointments and reminders', hub_journal: 'Log how you feel today',
  hub_wellness: 'Readings, graphs and steps', visit_card_t: 'Preparing for a visit?', visit_card_p: 'Make a one-page summary of your records to show your doctor.',
  pet_tip_meds: 'Tick each dose as you take it. Confirm which medicines you really take.', pet_tip_visits: 'Your appointments and follow-ups are here.',
  pet_tip_journal: 'A few taps a day. The summary helps you tell your doctor what changed.', pet_tip_wellness: 'Log blood pressure, sugar, weight and steps and see them on a graph.',
  pet_tip_family: 'One card for each person whose records you keep here.',
  /* wellness graphs */
  wl_graph: 'Home readings over time', wl_7: '7 days', wl_30: '30 days', wl_nodata: 'No home readings in the last {n} days. Add one in the log.',
  wl_usual: 'Dashed band: the usual adult range, a general guide and not your personal target.', wl_upper: 'Upper', wl_lower: 'Lower', wl_range: 'Usual: {a} to {b}',
  wl_foryou: 'For you: everyday habits', wl_period: 'Show', wl_pt: '{d}: {v} {u}',
  /* steps */
  st_title: 'Daily steps', st_date: 'Date', st_count: 'Steps', st_add: 'Save steps', st_note: 'Phone step counters and Google Fit can\'t be read by a website, so enter your steps here.',
  st_err_date: 'Please pick a date that is not in the future.', st_err_num: 'Steps must be a whole number from 0 to 100000.', st_empty: 'No steps entered for these days yet.',
  st_avg: 'Average {n} steps a day (on days entered)', st_total: 'Total {n} steps', st_del: 'Remove', st_saved: 'Steps saved.', st_list: 'Entered steps ({n})', st_unit: 'steps',
  /* guidance */
  g_low_bp_t: 'This blood pressure is on the low side', g_low_bp: 'Sit or lie down and raise your legs; drink a glass of water; stand up slowly.',
  g_low_sugar_t: 'This sugar reading is low', g_low_sugar: 'Take 15 g of fast-acting sugar (half a glass of juice or 3 teaspoons of sugar in water), recheck in 15 minutes, repeat if still low, then eat a snack.',
  g_high_bp_t: 'This blood pressure is very high', g_high_bp: 'Rest for 5 minutes and measure again; if it stays this high, contact a doctor today.',
  g_high_sugar_t: 'This sugar reading is very high', g_high_sugar: 'Drink water and check again; contact your doctor today, especially if you feel unwell.',
  g_doctor: 'Please consult your doctor about this reading.', g_112: 'Call 112 now if you have fainting, chest pain, breathlessness, confusion or one-sided weakness.',
  g_saved_h: 'Reading saved. What to do now'
});
Object.assign(STR.hi, {
  nav_meds: 'दवाइयाँ', nav_visits: 'मुलाक़ातें', nav_journal: 'डायरी', nav_wellness: 'तंदुरुस्ती', nav_family: 'परिवार', nav_more: 'और',
  meds_sub: 'आज की खुराकें, आपके रिकॉर्ड में मिली दवाइयाँ, और केमिस्ट से क्या पूछें।',
  visits_sub: 'डॉक्टर से मुलाक़ातें, फ़ॉलो-अप और याद दिलाने वाले संदेश।', journal_sub: 'हर दिन आप कैसा महसूस करते हैं, और डॉक्टर को दिखाने के लिए सारांश।',
  wellness_sub: 'घर पर लिए गए माप, क़दम और रोज़ की अच्छी आदतें।', family_sub: 'वे सभी लोग जिनके रिकॉर्ड इस डिवाइस पर रखे हैं।',
  hub_meds_n: 'आज {y} में से {x} ली गईं', hub_meds_rec: '{n} दर्ज', hub_meds_none: 'अभी कोई दवा नहीं', hub_visits: 'अपॉइंटमेंट और याद दिलाना', hub_journal: 'आज कैसा लग रहा है, दर्ज करें',
  hub_wellness: 'माप, ग्राफ़ और क़दम', visit_card_t: 'डॉक्टर से मिलने जा रहे हैं?', visit_card_p: 'डॉक्टर को दिखाने के लिए अपने रिकॉर्ड का एक पन्ने का सारांश बनाएँ।',
  pet_tip_meds: 'हर खुराक लेने पर टिक करें। पक्का करें कि आप कौन-सी दवाइयाँ सच में ले रहे हैं।', pet_tip_visits: 'आपके अपॉइंटमेंट और फ़ॉलो-अप यहाँ हैं।',
  pet_tip_journal: 'दिन में बस कुछ टैप। सारांश से डॉक्टर को बताना आसान होता है कि क्या बदला।', pet_tip_wellness: 'ब्लड प्रेशर, शुगर, वज़न और क़दम दर्ज करें और ग्राफ़ में देखें।',
  pet_tip_family: 'जिन लोगों के रिकॉर्ड आप यहाँ रखते हैं, हर एक के लिए एक कार्ड।',
  wl_graph: 'घर पर लिए माप, समय के साथ', wl_7: '7 दिन', wl_30: '30 दिन', wl_nodata: 'पिछले {n} दिनों में घर का कोई माप नहीं है। डायरी में एक जोड़ें।',
  wl_usual: 'धारीदार पट्टी: वयस्कों की आम सीमा। यह सिर्फ़ एक सामान्य अंदाज़ा है, आपका अपना लक्ष्य नहीं।', wl_upper: 'ऊपरी', wl_lower: 'निचला', wl_range: 'आम तौर पर: {a} से {b}',
  wl_foryou: 'आपके लिए: रोज़ की अच्छी आदतें', wl_period: 'दिखाएँ', wl_pt: '{d}: {v} {u}',
  st_title: 'रोज़ के क़दम', st_date: 'तारीख़', st_count: 'क़दम', st_add: 'क़दम सहेजें', st_note: 'फ़ोन का स्टेप काउंटर और Google Fit को कोई वेबसाइट नहीं पढ़ सकती, इसलिए अपने क़दम यहाँ खुद लिखें।',
  st_err_date: 'कृपया आज या उससे पहले की तारीख़ चुनें।', st_err_num: 'क़दम 0 से 100000 के बीच की पूरी संख्या होनी चाहिए।', st_empty: 'इन दिनों के लिए अभी कोई क़दम दर्ज नहीं हैं।',
  st_avg: 'औसत {n} क़दम रोज़ (दर्ज किए गए दिनों में)', st_total: 'कुल {n} क़दम', st_del: 'हटाएँ', st_saved: 'क़दम सहेज लिए गए।', st_list: 'दर्ज क़दम ({n})', st_unit: 'क़दम',
  g_low_bp_t: 'यह ब्लड प्रेशर कम है', g_low_bp: 'बैठ जाएँ या लेट जाएँ और पैर ऊपर उठाएँ; एक गिलास पानी पिएँ; धीरे-धीरे खड़े हों।',
  g_low_sugar_t: 'यह शुगर का माप कम है', g_low_sugar: '15 ग्राम तेज़ असर वाली चीनी लें (आधा गिलास जूस या पानी में 3 चम्मच चीनी), 15 मिनट बाद फिर जाँचें, अब भी कम हो तो दोहराएँ, फिर कुछ खा लें।',
  g_high_bp_t: 'यह ब्लड प्रेशर बहुत ऊँचा है', g_high_bp: '5 मिनट आराम करें और फिर से नापें; अगर इतना ही ऊँचा रहे तो आज ही डॉक्टर से संपर्क करें।',
  g_high_sugar_t: 'यह शुगर का माप बहुत ऊँचा है', g_high_sugar: 'पानी पिएँ और फिर से जाँचें; आज ही अपने डॉक्टर से संपर्क करें, ख़ासकर अगर तबीयत ठीक न लग रही हो।',
  g_doctor: 'कृपया इस माप के बारे में अपने डॉक्टर से सलाह लें।', g_112: 'बेहोशी, सीने में दर्द, साँस फूलना, भ्रम या शरीर के एक तरफ़ कमज़ोरी हो तो अभी 112 पर कॉल करें।',
  g_saved_h: 'माप सहेजा गया। अब क्या करें'
});

const SehatWell = (function () {
  const W = { period: 7, justId: null, sform: null };

  /* ---------- guidance on a reading ---------- */
  function guideKind(e) {
    if (!e) return null;
    if (e.type === 'bp') {
      if (e.value >= WL_BP_HIGH_UP || (e.value2 != null && e.value2 >= WL_BP_HIGH_LO)) return 'high_bp';
      if (e.value < WL_BP_LOW_UP || (e.value2 != null && e.value2 < WL_BP_LOW_LO)) return 'low_bp';
    } else if (e.type === 'sugar_fasting' || e.type === 'sugar_pp') {
      if (e.value < WL_SUGAR_LOW) return 'low_sugar';
      if (e.value > WL_SUGAR_HIGH) return 'high_sugar';
    }
    return null;
  }
  function guideBox(e, heading) {
    const k = guideKind(e);
    if (!k) return '';
    return '<div class="wl-guide' + (k.indexOf('high') === 0 ? ' hi' : '') + '" role="alert" data-guide="' + esc(e.id) + '"><h4>' + esc(heading || t('g_' + k + '_t')) + ' <span class="mono small">(' + esc(vitText(e)) + ' ' + esc(VIT_UNIT[e.type]) + ')</span></h4>' +
      '<p>' + esc(t('g_' + k)) + '</p><p><strong>' + esc(t('g_doctor')) + '</strong></p><p class="wl-danger">' + esc(t('g_112')) + '</p></div>';
  }
  function onSaved(e) {
    W.justId = e && guideKind(e) ? e.id : null;
    if (W.justId) setTimeout(() => { const b = document.querySelector('.wl-guide[data-guide="' + W.justId + '"]'); if (b && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 60);
  }
  function savedBox() {
    const e = W.justId && S.vitals.find(x => x.id === W.justId);
    return e ? guideBox(e, t('g_saved_h')) : '';
  }
  function latestBox(e) { return e && e.id !== W.justId && S.vitals.find(x => x.id === e.id) ? guideBox(e) : ''; }

  /* ---------- steps (per profile, on this device) ---------- */
  function stepsGet() {
    try { return arr(JSON.parse(localStorage.getItem(profKey('sehat_steps')) || '[]')).filter(x => x && /^\d{4}-\d{2}-\d{2}$/.test(x.date) && isNum(x.steps)).map(x => ({ date: x.date, steps: Math.round(Number(x.steps)) })); } catch (e) { return []; }
  }
  function stepsSave(list) { try { localStorage.setItem(profKey('sehat_steps'), JSON.stringify(list)); } catch (e) { /* storage blocked */ } }
  function sf() { if (!W.sform) W.sform = { date: '', steps: '', err: null, ok: false }; if (!W.sform.date) W.sform.date = todayKey(); return W.sform; }
  function addSteps() {
    const f = sf(), n = String(f.steps).trim().replace(/[,\s]/g, '');
    f.ok = false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date) || f.date > todayKey()) { f.err = 'st_err_date'; return render(); }
    if (!/^\d{1,6}$/.test(n) || Number(n) > 100000) { f.err = 'st_err_num'; return render(); }
    const list = stepsGet().filter(x => x.date !== f.date);
    list.push({ date: f.date, steps: Number(n) });
    list.sort((a, b) => a.date.localeCompare(b.date));
    stepsSave(list);
    f.steps = ''; f.err = null; f.ok = true;
    render();
  }

  /* ---------- date helpers for the period graphs ---------- */
  const dayMs = 864e5;
  const parseDay = d => { const p = String(d).split('-'); return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])).getTime(); };
  function period() {
    const n = W.period, end = parseDay(todayKey());
    return { n, start: end - (n - 1) * dayMs, end };
  }
  const dayIdx = (d, P) => Math.round((parseDay(d) - P.start) / dayMs);
  const shortDate = d => fmtDate(d, { day: 'numeric', month: 'short' });
  const dayLabel = (P, i) => shortDate(new Date(P.start + i * dayMs).toLocaleDateString('en-CA'));

  /* ---------- SVG line chart (one per reading type) ---------- */
  function lineChart(c, P) {
    const Wd = 360, H = 176, pl = 38, pr = 16, pt = 18, pb = 28;
    let all = [];
    c.lines.forEach(l => { all = all.concat(l.pts.map(p => p.v)); });
    c.bands.forEach(b => { all.push(b[0], b[1]); });
    let mn = Math.min.apply(null, all), mx = Math.max.apply(null, all);
    const padv = (mx - mn) * 0.1 || 1; mn -= padv; mx += padv;
    const X = i => pl + (P.n === 1 ? 0.5 : i / (P.n - 1)) * (Wd - pl - pr);
    const Y = v => pt + (1 - (v - mn) / (mx - mn)) * (H - pt - pb);
    let g = '';
    c.bands.forEach(b => {
      g += '<rect class="wl-band" x="' + pl + '" y="' + Y(b[1]).toFixed(1) + '" width="' + (Wd - pl - pr) + '" height="' + Math.max(1, Y(b[0]) - Y(b[1])).toFixed(1) + '" fill="#0F766E" fill-opacity="0.10" stroke="#0F766E" stroke-opacity="0.55" stroke-dasharray="4 3"/>';
    });
    g += '<line x1="' + pl + '" y1="' + (H - pb) + '" x2="' + (Wd - pr) + '" y2="' + (H - pb) + '" stroke="var(--line)"/>';
    c.lines.forEach(l => {
      const pts = l.pts.map(p => [X(p.i), Y(p.v)]);
      if (pts.length > 1) g += '<polyline fill="none" stroke="' + l.color + '" stroke-width="1.8" points="' + pts.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ') + '"/>';
      const labelAll = l.pts.length <= 9;
      l.pts.forEach((p, k) => {
        const x = X(p.i).toFixed(1), y = Y(p.v);
        g += '<circle cx="' + x + '" cy="' + y.toFixed(1) + '" r="4.5" fill="' + (p.out ? '#B45309' : l.color) + '" stroke="var(--card)" stroke-width="1.5"><title>' + esc(t('wl_pt', { d: fmtDate(p.date), v: fmtNum(p.v), u: c.unit }) + (l.label ? ' (' + l.label + ')' : '')) + '</title></circle>';
        if (labelAll || k === l.pts.length - 1) g += '<text class="' + (k === l.pts.length - 1 ? 'last' : '') + '" x="' + x + '" y="' + (y + (l.below ? 15 : -8)).toFixed(1) + '" text-anchor="middle">' + esc(fmtNum(p.v)) + '</text>';
      });
    });
    g += '<text x="' + (pl - 5) + '" y="' + (pt + 4) + '" text-anchor="end">' + esc(fmtNum(mx)) + '</text>';
    g += '<text x="' + (pl - 5) + '" y="' + (H - pb) + '" text-anchor="end">' + esc(fmtNum(mn)) + '</text>';
    g += '<text x="' + pl + '" y="' + (H - 9) + '" text-anchor="start">' + esc(dayLabel(P, 0)) + '</text>';
    g += '<text x="' + (Wd - pr) + '" y="' + (H - 9) + '" text-anchor="end">' + esc(dayLabel(P, P.n - 1)) + '</text>';
    return '<svg viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="' + esc(c.name) + '">' + g + '</svg>';
  }
  function readingCharts(P) {
    const out = [];
    const inP = ty => S.vitals.filter(e => e.type === ty && e.date >= new Date(P.start).toLocaleDateString('en-CA') && e.date <= todayKey()).sort((a, b) => a.date.localeCompare(b.date));
    VIT_TYPES.forEach(ty => {
      const es = inP(ty);
      if (!es.length) return;
      const pt = (e, v, band) => ({ i: dayIdx(e.date, P), date: e.date, v, out: band ? (v < band[0] || v > band[1]) : false });
      let c;
      if (ty === 'bp') {
        c = { name: t('vit_bp'), unit: 'mmHg', bands: [WL_USUAL.bp_up, WL_USUAL.bp_lo], lines: [
          { label: t('wl_upper'), color: '#0F766E', pts: es.map(e => pt(e, e.value, WL_USUAL.bp_up)) },
          { label: t('wl_lower'), color: '#475569', below: true, pts: es.filter(e => e.value2 != null).map(e => pt(e, e.value2, WL_USUAL.bp_lo)) }], range: WL_USUAL.bp_up[0] + '/' + WL_USUAL.bp_lo[0] + ' to ' + WL_USUAL.bp_up[1] + '/' + WL_USUAL.bp_lo[1], legend: true };
      } else {
        const b = WL_USUAL[ty] || null;
        c = { name: t('vit_' + ty), unit: VIT_UNIT[ty], bands: b ? [b] : [], lines: [{ label: '', color: '#0F766E', pts: es.map(e => pt(e, e.value, b)) }], range: b ? b[0] + ' to ' + b[1] : '' };
      }
      out.push('<div class="trend wl-chart"><h4><span>' + esc(c.name) + '</span><span class="mono muted small">' + esc(c.unit) + '</span></h4>' + lineChart(c, P) +
        (c.legend ? '<p class="wl-legend small"><span class="wl-key u"></span>' + esc(t('wl_upper')) + ' <span class="wl-key l"></span>' + esc(t('wl_lower')) + '</p>' : '') +
        (c.range ? '<p class="muted small" style="margin:2px 0 0">' + esc(t('wl_range', { a: c.range.split(' to ')[0], b: c.range.split(' to ')[1] })) + '</p>' : '') + '</div>');
    });
    return out;
  }
  function toggleHTML() {
    return '<div class="wl-toggle" role="group" aria-label="' + esc(t('wl_period')) + '">' + [7, 30].map(n => '<button type="button" class="chip" data-wl="p' + n + '" aria-pressed="' + (W.period === n) + '">' + esc(t('wl_' + n)) + '</button>').join('') + '</div>';
  }
  function graphCard() {
    const P = period(), cs = readingCharts(P);
    return '<div class="card" id="wlGraph"><div class="row between"><h2>' + esc(t('wl_graph')) + '</h2>' + toggleHTML() + '</div>' +
      (cs.length ? '<div class="trends wl-charts" style="margin-top:12px">' + cs.join('') + '</div><p class="muted small" style="margin:10px 0 0">' + esc(t('wl_usual')) + '</p>'
        : '<p class="muted" style="margin:10px 0 0">' + esc(t('wl_nodata', { n: P.n })) + '</p>') + '</div>';
  }

  /* ---------- steps bar chart ---------- */
  function stepsChart(P) {
    const byDay = {};
    stepsGet().forEach(x => { const i = dayIdx(x.date, P); if (i >= 0 && i < P.n) byDay[i] = x; });
    const days = Object.keys(byDay).map(Number);
    if (!days.length) return { html: '', n: 0 };
    const Wd = 360, H = 176, pl = 40, pr = 10, pt = 18, pb = 28, mx = Math.max.apply(null, days.map(i => byDay[i].steps)) * 1.1 || 1;
    const slot = (Wd - pl - pr) / P.n, bw = Math.max(3, slot * 0.7);
    let g = '<line x1="' + pl + '" y1="' + (H - pb) + '" x2="' + (Wd - pr) + '" y2="' + (H - pb) + '" stroke="var(--line)"/>';
    days.forEach(i => {
      const x = pl + i * slot + (slot - bw) / 2, h = byDay[i].steps / mx * (H - pt - pb), y = H - pb - h;
      g += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(1, h).toFixed(1) + '" rx="2" fill="#0F766E"><title>' + esc(t('wl_pt', { d: fmtDate(byDay[i].date), v: byDay[i].steps.toLocaleString(), u: t('st_unit') })) + '</title></rect>';
      if (P.n <= 7) g += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (y - 4).toFixed(1) + '" text-anchor="middle">' + esc(byDay[i].steps >= 10000 ? (byDay[i].steps / 1000).toFixed(1) + 'k' : byDay[i].steps) + '</text>';
    });
    g += '<text x="' + (pl - 5) + '" y="' + (pt + 4) + '" text-anchor="end">' + esc(Math.round(mx).toLocaleString()) + '</text><text x="' + (pl - 5) + '" y="' + (H - pb) + '" text-anchor="end">0</text>';
    g += '<text x="' + pl + '" y="' + (H - 9) + '" text-anchor="start">' + esc(dayLabel(P, 0)) + '</text><text x="' + (Wd - pr) + '" y="' + (H - 9) + '" text-anchor="end">' + esc(dayLabel(P, P.n - 1)) + '</text>';
    const total = days.reduce((a, i) => a + byDay[i].steps, 0);
    return { n: days.length, total, avg: Math.round(total / days.length), html: '<div class="trend wl-chart"><svg viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="' + esc(t('st_title')) + '">' + g + '</svg></div>' };
  }
  function stepsCard() {
    const f = sf(), P = period(), ch = stepsChart(P), list = stepsGet().slice().reverse();
    const form = '<form id="stepForm" class="vit-form" novalidate>' +
      '<label class="fld"><span>' + esc(t('st_date')) + '</span><input type="date" id="stDate" max="' + esc(todayKey()) + '" value="' + esc(f.date) + '"></label>' +
      '<label class="fld"><span>' + esc(t('st_count')) + '</span><input type="text" inputmode="numeric" id="stCount" class="mono" autocomplete="off" value="' + esc(f.steps) + '"></label>' +
      '<div class="vit-act"><button type="submit" class="btn">' + esc(t('st_add')) + '</button></div>' +
      '<p class="vit-err" role="alert"' + (f.err ? '' : ' hidden') + '>' + esc(f.err ? t(f.err) : '') + '</p></form>';
    return '<div class="card" id="wlSteps"><div class="row between"><h2>' + esc(t('st_title')) + '</h2>' + toggleHTML() + '</div>' +
      '<p class="muted small" style="margin:6px 0 10px">' + esc(t('st_note')) + '</p>' + form + (f.ok ? '<p class="small" role="status" style="color:var(--ok);margin:6px 0 0">' + esc(t('st_saved')) + '</p>' : '') +
      (ch.n ? '<div style="margin-top:12px">' + ch.html + '<p class="small" style="margin:8px 0 0"><strong>' + esc(t('st_avg', { n: ch.avg.toLocaleString() })) + '</strong> · ' + esc(t('st_total', { n: ch.total.toLocaleString() })) + '</p></div>' : '<p class="muted" style="margin:12px 0 0">' + esc(t('st_empty')) + '</p>') +
      (list.length ? '<details class="vit-all" style="margin-top:10px"><summary>' + esc(t('st_list', { n: list.length })) + '</summary><ul class="list">' + list.map(x => '<li><span class="l"><span class="mono">' + esc(x.steps.toLocaleString()) + '</span> ' + esc(t('st_unit')) + '<br><span class="muted small">' + esc(fmtDate(x.date)) + '</span></span><span class="r"><button type="button" class="btn small danger" data-wl="stepdel" data-date="' + esc(x.date) + '">' + esc(t('st_del')) + '</button></span></li>').join('') + '</ul></details>' : '') + '</div>';
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const el = e.target && e.target.closest ? e.target.closest('[data-wl]') : null;
    if (S.moreOpen && e.target.isConnected && !(e.target.closest && e.target.closest('.nav'))) { S.moreOpen = false; applyStatic(); }
    if (e.target && e.target.closest && e.target.closest('[data-act="nav"]')) W.justId = null;
    if (!el) return;
    const a = el.getAttribute('data-wl');
    if (a === 'p7' || a === 'p30') { W.period = a === 'p7' ? 7 : 30; render(); }
    else if (a === 'stepdel') { stepsSave(stepsGet().filter(x => x.date !== el.getAttribute('data-date'))); render(); }
  });
  document.addEventListener('submit', e => { if (e.target && e.target.id === 'stepForm') { e.preventDefault(); addSteps(); } });
  document.addEventListener('input', e => {
    const el = e.target; if (!el || !W.sform) return;
    if (el.id === 'stDate') W.sform.date = el.value; else if (el.id === 'stCount') W.sform.steps = el.value;
  });
  document.addEventListener('change', e => { if (e.target && e.target.id === 'stDate') sf().date = e.target.value; });
  document.addEventListener('sehat:profile', () => { W.justId = null; W.sform = null; });

  return { onSaved, savedBox, latestBox, graphCard, stepsCard, guideKind };
})();
window.SehatWell = SehatWell;

/* ================= The views ================= */
function viewHead(titleKey, subKey, extra) {
  return '<div class="page-head row between"><div><h1>' + esc(t(titleKey)) + '</h1><p>' + esc(t(subKey)) + '</p></div>' + (extra || '') + '</div>';
}
/* common wrapper: shows the skeleton while the first insights load, else calls fn(insights) */
function withInsights(head, fn) {
  const g = getInsights();
  if (g.loading) return head + '<div class="stack">' + skelCard(3) + skelCard(4) + '</div><p class="muted small" role="status">' + esc(t('ins_loading')) + '</p>';
  return head + fn(g.data);
}

function hubTiles() {
  const doses = buildDoses(schedMeds()).filter(d => isTickable(d.slot)), tk = takenGet();
  const medSub = doses.length ? t('hub_meds_n', { x: doses.filter(d => tk[d.key]).length, y: doses.length }) : (curInsights().medicines.length ? t('hub_meds_rec', { n: curInsights().medicines.length }) : t('hub_meds_none'));
  const tile = (icon, view, label, sub) => '<button type="button" class="qa hub" data-act="nav" data-view="' + view + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[icon] + '</svg><span><strong>' + esc(label) + '</strong><small>' + esc(sub) + '</small></span></button>';
  return '<div class="quick hubs">' + tile('meds', 'meds', t('nav_meds'), medSub) + tile('visits', 'visits', t('nav_visits'), t('hub_visits')) +
    tile('journal', 'journal', t('nav_journal'), t('hub_journal')) + tile('wellness', 'wellness', t('nav_wellness'), t('hub_wellness')) + '</div>';
}

function viewMeds() {
  return withInsights(viewHead('nav_meds', 'meds_sub'), I => {
    const sched = I.medicines.filter(m => m.status !== 'course_ended').map(m => ({ m, date: m.date }));
    return '<div class="stack">' + medsTodayCard(schedMeds()) + confirmMedsCard() + medsRecordedCard(I) + pharmacistCard(sched) + '</div>';
  });
}
function viewVisits() {
  const head = viewHead('nav_visits', 'visits_sub');
  const R = window.SehatRem;
  const body = R ? (typeof R.visitsCard === 'function' ? R.visitsCard() : R.apptCard()) : '';  // reminders.js
  return head + '<div class="stack">' + body + '<div class="card"><h2 style="margin-bottom:6px">' + esc(t('visit_card_t')) + '</h2><p class="muted">' + esc(t('visit_card_p')) + '</p>' +
    '<button type="button" class="btn secondary" data-act="visit">' + esc(t('visit_btn')) + '</button></div></div>';
}
function viewJournal() {
  return withInsights(viewHead('nav_journal', 'journal_sub'), I => jrH(I, 'top'));
}
function viewWellness() {
  return withInsights(viewHead('nav_wellness', 'wellness_sub'), I => {
    const habits = jrH(I, 'habits');
    return '<div class="stack">' + wellnessCard(I) + SehatWell.graphCard() + SehatWell.stepsCard() + '</div>' +
      (habits ? '<section class="hsec"><div class="kicker">' + esc(t('wl_foryou')) + '</div>' + habits.replace(/^<section class="hsec">/, '').replace(/<\/section>$/, '') + '</section>' : '');
  });
}
function viewFamily() {
  return viewHead('nav_family', 'family_sub') + (window.SehatFamily && SehatFamily.view ? SehatFamily.view() : '');
}
