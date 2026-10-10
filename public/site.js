(function () {
  var ACC = "sehat_accounts", USR = "sehat_user";

  function read(key) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }
  function remove(key) { try { localStorage.removeItem(key); } catch (e) {} }

  function hex(buf) {
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
  }
  function newSalt() {
    var a = new Uint8Array(16);
    crypto.getRandomValues(a);
    return hex(a);
  }
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

  function el(tag, cls, text, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function renderNav() {
    var u = SehatAuth.current();
    document.querySelectorAll('[data-auth="nav"]').forEach(function (box) {
      box.textContent = "";
      if (u) {
        var first = u.name.trim().split(/\s+/)[0] || u.name;
        box.appendChild(el("span", "hi", "Hi, " + first));
        box.appendChild(el("a", "btn primary", "Open the app", { href: "/app" }));
        var out = el("button", "btn", "Sign out", { type: "button" });
        out.addEventListener("click", function () { SehatAuth.signOut(); renderNav(); });
        box.appendChild(out);
      } else {
        box.appendChild(el("a", "btn", "Sign in", { href: "/login" }));
        box.appendChild(el("a", "btn primary", "Open the app", { href: "/app" }));
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderNav();
    var nav = document.getElementById("nav");
    if (nav) {
      var f = function () { nav.classList.toggle("scrolled", window.scrollY > 10); };
      window.addEventListener("scroll", f, { passive: true });
      f();
    }
  });
})();
