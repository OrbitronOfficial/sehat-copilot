(function () {
  var ACC = "sehat_accounts", USR = "sehat_user", THEME = "sehat_theme", LANG = "sehat_lang";

  /* ---------- storage helpers ---------- */
  function read(key) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }
  function remove(key) { try { localStorage.removeItem(key); } catch (e) {} }
  function readRaw(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function writeRaw(key, v) { try { localStorage.setItem(key, v); } catch (e) {} }

  function el(tag, cls, text, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  /* ---------- accounts (on-device only) ---------- */
  function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
  }
  function newSalt() { var a = new Uint8Array(16); crypto.getRandomValues(a); return hex(a); }
  async function hash(salt, pw) {
    if (!(window.crypto && crypto.subtle)) throw new Error("This browser cannot create accounts here (secure context needed). Try the demo account.");
    return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + pw)));
  }
  function cleanEmail(e) { return String(e || "").trim().toLowerCase(); }
  function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

  var SehatAuth = {
    async signUp(name, email, password) {
      name = String(name || "").trim();
      email = cleanEmail(email);
      if (!name) throw new Error("Please enter your name.");
      if (!validEmail(email)) throw new Error("Please enter a valid email address.");
      if (String(password || "").length < 6) throw new Error("Password must be at least 6 characters.");
      var accounts = read(ACC) || {};
      if (accounts[email]) throw new Error("That email is already registered. Try signing in.");
      var salt = newSalt();
      accounts[email] = { name: name, salt: salt, hash: await hash(salt, password) };
      if (!write(ACC, accounts)) throw new Error("Could not save the account. Browser storage looks blocked.");
      var user = { name: name, email: email, demo: false };
      write(USR, user);
      return user;
    },
    async signIn(email, password) {
      email = cleanEmail(email);
      var accounts = read(ACC) || {};
      var acc = accounts[email];
      if (!acc || (await hash(acc.salt, String(password || ""))) !== acc.hash) throw new Error("Wrong email or password.");
      var user = { name: acc.name, email: email, demo: false };
      write(USR, user);
      return user;
    },
    demo: function () {
      var user = { name: "Rahul Sharma", email: "demo@sehat.local", demo: true };
      write(USR, user);
      return user;
    },
    guest: function () { remove(USR); },
    current: function () {
      var u = read(USR);
      return u && typeof u.name === "string" ? u : null;
    },
    signOut: function () { remove(USR); },
    renderNav: renderNav
  };
  window.SehatAuth = SehatAuth;

  function renderNav() {
    var u = SehatAuth.current();
    document.querySelectorAll('[data-auth="nav"]').forEach(function (box) {
      box.textContent = "";
      if (u) {
        var first = u.name.trim().split(/\s+/)[0] || u.name;
        box.appendChild(el("span", "hi", "Hi, " + first, { "data-noi18n": "" }));
        box.appendChild(el("a", "btn primary", "Open the app", { href: "/app" }));
        var out = el("button", "btn ghost", "Sign out", { type: "button" });
        out.addEventListener("click", function () { SehatAuth.signOut(); renderNav(); translate(); });
        box.appendChild(out);
      } else {
        box.appendChild(el("a", "btn ghost", "Sign in", { href: "/login" }));
        box.appendChild(el("a", "btn primary", "Open the app", { href: "/app" }));
      }
    });
  }

  /* ---------- theme ---------- */
  var root = document.documentElement;
  function storedTheme() { var t = readRaw(THEME); return t === "dark" || t === "light" ? t : null; }
  function systemTheme() { return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
  function setTheme(t) {
    if (t !== "dark" && t !== "light") t = systemTheme();
    root.dataset.theme = t;
    writeRaw(THEME, t);
  }

  /* ---------- language ---------- */
  var LANGS = [["en", "English"], ["hi", "हिंदी"], ["bn", "বাংলা"], ["te", "తెలుగు"], ["mr", "मराठी"], ["ta", "தமிழ்"], ["gu", "ગુજરાતી"], ["kn", "ಕನ್ನಡ"], ["ml", "മലയാളം"], ["pa", "ਪੰਜਾਬੀ"]];
  var CODES = {};
  LANGS.forEach(function (l) { CODES[l[0]] = true; });
  var ATTRS = ["placeholder", "aria-label", "title"];
  var origText = new Map(), origAttr = new Map(), maps = {}, curLang = "en", ver = 0;

  function storedLang() {
    var v = readRaw(LANG);
    if (!v) return "en";
    if (v.charAt(0) === '"') { try { v = JSON.parse(v); } catch (e) {} }
    return CODES[v] ? v : "en";
  }
  function skip(node) { return !node || !!node.closest("script,style,noscript,[data-noi18n]"); }

  function apply(map) {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) {
      if (!n.nodeValue.trim() || skip(n.parentElement)) continue;
      if (!origText.has(n)) origText.set(n, n.nodeValue);
      var o = origText.get(n), t = map && map[o.replace(/\s+/g, " ").trim()];
      if (typeof t === "string" && t) {
        var m = o.match(/^(\s*)[\s\S]*?(\s*)$/);
        n.nodeValue = m[1] + t + m[2];
      } else if (n.nodeValue !== o) n.nodeValue = o;
    }
    document.querySelectorAll("[placeholder],[aria-label],[title]").forEach(function (e) {
      if (skip(e)) return;
      var rec = origAttr.get(e);
      if (!rec) { rec = {}; origAttr.set(e, rec); }
      ATTRS.forEach(function (a) {
        if (!e.hasAttribute(a)) return;
        if (!(a in rec)) rec[a] = e.getAttribute(a);
        var t = map && map[rec[a].replace(/\s+/g, " ").trim()];
        e.setAttribute(a, typeof t === "string" && t ? t : rec[a]);
      });
    });
  }
  function translate() { apply(curLang === "en" ? null : maps[curLang] || null); }

  function syncLangUI() {
    document.querySelectorAll("button[data-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === curLang)); });
    document.querySelectorAll("select[data-langselect]").forEach(function (s) { s.value = curLang; });
  }
  function setLang(code) {
    if (!CODES[code]) code = "en";
    writeRaw(LANG, code);
    curLang = code;
    root.lang = code;
    syncLangUI();
    if (code === "en") { apply(null); return Promise.resolve(); }
    var my = ++ver;
    var p = maps[code] ? Promise.resolve(maps[code]) :
      fetch("/i18n/site-" + code + ".json")
        .then(function (r) { return r.ok ? r.json() : {}; })
        .catch(function () { return {}; })
        .then(function (j) { maps[code] = j && typeof j === "object" ? j : {}; return maps[code]; });
    return p.then(function (m) { if (my === ver) apply(m); });
  }

  window.SehatSite = { setLang: setLang, getLang: function () { return curLang; }, setTheme: setTheme, translate: translate };

  /* ---------- nav tools: language select + theme toggle ---------- */
  var SVG_NS = "http://www.w3.org/2000/svg";
  function themeIcons(btn) {
    btn.innerHTML = '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.500 4 8 8 0 1 0 20 14.500z"/></svg>' +
      '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.500v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.200 5.200l1.800 1.800M17 17l1.800 1.800M5.200 18.800L7 17M17 7l1.800-1.800"/></svg>';
  }
  function buildTools() {
    document.querySelectorAll("[data-tools]").forEach(function (box) {
      var lab = el("label", "langsel");
      lab.appendChild(el("span", "sr", "Language"));
      var sel = el("select", null, null, { "data-noi18n": "", "data-langselect": "" });
      LANGS.forEach(function (l) { sel.appendChild(el("option", null, l[1], { value: l[0] })); });
      sel.addEventListener("change", function () { setLang(sel.value); });
      lab.appendChild(sel);
      box.appendChild(lab);
      var tb = el("button", "icon-btn", null, { type: "button", "aria-label": "Switch between light and dark theme" });
      themeIcons(tb);
      tb.addEventListener("click", function () { setTheme(root.dataset.theme === "dark" ? "light" : "dark"); });
      box.appendChild(tb);
    });
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".rv");
    var counts = new Map();
    els.forEach(function (e) {
      var n = counts.get(e.parentNode) || 0;
      counts.set(e.parentNode, n + 1);
      e.style.setProperty("--d", Math.min(n, 6) * 70 + "ms");
    });
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (e) { io.observe(e); });
    // Safety net: observers can stall (background tabs, embedded previews), and content
    // must never stay invisible. Reveal whatever is on screen by position as well.
    function sweep() {
      var h = window.innerHeight || 800;
      els.forEach(function (e) {
        if (!e.classList.contains("in") && e.getBoundingClientRect().top < h * 0.94) e.classList.add("in");
      });
    }
    setTimeout(sweep, 300);
    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep);
  }

  /* ---------- Saathi guide ---------- */
  var MASCOT = '<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="59" rx="15" ry="3" fill="#0F172A" opacity=".10"/><path d="M14 40c0-12 8-20 18-20s18 8 18 20v8c0 5-4 9-9 9H23c-5 0-9-4-9-9z" fill="#fff" stroke="#0F766E" stroke-width="2"/><path d="M27 33l5 7 5-7" fill="none" stroke="#0F766E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="32" cy="20" r="14" fill="#F3D9C4" stroke="#0F766E" stroke-width="2"/><path d="M18.5 18c1-8 7-12.5 13.5-12.5S44.5 10 45.5 18c-4-3-8-4.5-13.5-4.5S22.5 15 18.5 18z" fill="#0F766E"/><circle cx="27" cy="21" r="1.8" fill="#0F172A"/><circle cx="37" cy="21" r="1.8" fill="#0F172A"/><path d="M28 26.5c2.5 2 5.5 2 8 0" fill="none" stroke="#0F172A" stroke-width="1.6" stroke-linecap="round"/><path d="M22 34c-3 6-2 13 4 14.5" fill="none" stroke="#334155" stroke-width="1.8" stroke-linecap="round"/><circle cx="28" cy="49" r="3" fill="#fff" stroke="#334155" stroke-width="1.8"/><rect x="38" y="42" width="8" height="8" rx="1.5" fill="#0F766E"/><path d="M42 43.8v4.4M39.8 46h4.4" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>';
  var TIPS = {
    landing: "Sehat Copilot explains your prescriptions and lab reports in plain language. Try the live demo to see a sample record.",
    login: "An account is optional. The demo account opens a sample record in one click. Anything you create is kept only in this browser, on this device.",
    pricing: "Nothing is charged. These plans are illustrative, and the Family and Clinic plans are planned, not built."
  };
  var QA = [
    ["What is Sehat Copilot?", "Sehat Copilot reads your prescriptions and lab reports and explains them in plain language. It is a guide to your records, not a doctor."],
    ["Is my data safe?", "Documents are sent to third-party AI services only to be read. Our server stores nothing. Your records stay on this device, and you can delete everything from the app."],
    ["Do I need an account?", "No. Guest and demo both work. An account is optional."],
    ["Is it free?", "Yes, the prototype is free. Paid plans are planned, not built."]
  ];
  function buildSaathi() {
    var page = document.body.dataset.page || "landing";
    var box = el("div", "saathi");
    var tip = el("div", "saathi-tip", "Need a hand? Ask Saathi.");
    var btn = el("button", "saathi-btn", null, { type: "button", "aria-label": "Open Saathi, your records guide", "aria-expanded": "false" });
    btn.innerHTML = MASCOT;
    var panel = el("div", "saathi-panel", null, { role: "dialog", "aria-label": "Saathi", tabindex: "-1" });
    panel.hidden = true;

    var top = el("div", "sa-top");
    var head = el("span", "sa-head"); head.innerHTML = MASCOT;
    var ttl = el("div"); ttl.appendChild(el("b", null, "Saathi")); ttl.appendChild(el("span", null, "Your records guide. Not a doctor."));
    var close = el("button", "icon-btn", null, { type: "button", "aria-label": "Close" });
    close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    top.appendChild(head); top.appendChild(ttl); top.appendChild(close);

    var body = el("div", "sa-body");
    body.appendChild(el("div", "bub", "Hi, I am Saathi. I can answer a few questions about this page."));
    body.appendChild(el("div", "bub tip", TIPS[page] || TIPS.landing));

    var chips = el("div", "sa-chips");
    QA.forEach(function (qa) {
      var c = el("button", null, qa[0], { type: "button" });
      c.addEventListener("click", function () {
        body.appendChild(el("div", "bub me", qa[0]));
        body.appendChild(el("div", "bub", qa[1]));
        translate();
        body.scrollTop = body.scrollHeight;
      });
      chips.appendChild(c);
    });
    var foot = el("div", "sa-foot");
    foot.appendChild(el("a", "btn primary block", "Open the app", { href: "/app" }));

    panel.appendChild(top); panel.appendChild(body); panel.appendChild(chips); panel.appendChild(foot);
    box.appendChild(tip); box.appendChild(panel); box.appendChild(btn);
    document.body.appendChild(box);

    var hideTip = function () { tip.classList.add("gone"); };
    setTimeout(hideTip, 7000 + 1000);
    function open() {
      panel.hidden = false; hideTip();
      btn.setAttribute("aria-expanded", "true");
      translate();
      panel.focus();
    }
    function shut() { panel.hidden = true; btn.setAttribute("aria-expanded", "false"); btn.focus(); }
    btn.addEventListener("click", function () { panel.hidden ? open() : shut(); });
    close.addEventListener("click", shut);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) shut(); });
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderNav();
    buildTools();
    buildSaathi();
    initReveal();
    var nav = document.getElementById("nav");
    if (nav) {
      var f = function () { nav.classList.toggle("scrolled", window.scrollY > 10); };
      window.addEventListener("scroll", f, { passive: true });
      f();
    }
    document.querySelectorAll("button[data-lang]").forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.dataset.lang); });
    });
    if (window.matchMedia) {
      var mq = matchMedia("(prefers-color-scheme: dark)");
      var onSys = function () { if (!storedTheme()) root.dataset.theme = systemTheme(); };
      if (mq.addEventListener) mq.addEventListener("change", onSys);
    }
    var l = storedLang();
    curLang = l;
    syncLangUI();
    if (l !== "en") setLang(l); else root.lang = "en";
  });
})();
