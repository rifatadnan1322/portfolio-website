/* "Smart FAQ" chatbot: matches a visitor's question to the closest answer in js/faq.js.
   No server, no API key. */
(function () {
  var FAQ = window.FAQ || [];
  var STOP = "a an the is are was were be to of in on for and or with about me tell you your his he him rifat's can could would please what's whats does do did i my it this that how what who".split(" ");
  var stop = {};
  STOP.forEach(function (w) { stop[w] = 1; });

  function words(s) {
    return s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
  }
  // Rough "same word?" check that forgives a typo or a plural.
  function near(a, b) {
    if (a === b) return true;
    if (a.length < 4 || b.length < 4) return false;
    if (a.indexOf(b) === 0 || b.indexOf(a) === 0) return true;      // forecast / forecasting
    if (Math.abs(a.length - b.length) > 1) return false;
    var dp = [], i, j;                                            // edit distance ≤ 1
    for (i = 0; i <= a.length; i++) { dp[i] = [i]; }
    for (j = 0; j <= b.length; j++) { dp[0][j] = j; }
    for (i = 1; i <= a.length; i++)
      for (j = 1; j <= b.length; j++)
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return dp[a.length][b.length] <= 1;
  }

  function score(question, item) {
    var q = question.toLowerCase();
    var qw = words(question);
    var meaningful = qw.filter(function (w) { return !stop[w]; });
    var s = 0;
    item.keywords.forEach(function (k) {
      k = k.toLowerCase();
      if (k.indexOf(" ") > -1) { if (q.indexOf(k) > -1) s += 3; return; }   // phrase
      var weight = stop[k] ? 0.5 : 2;
      if (qw.some(function (w) { return near(w, k); })) s += weight;
    });
    words(item.q).forEach(function (w) {
      if (!stop[w] && meaningful.some(function (m) { return near(m, w); })) s += 1;
    });
    return s;
  }

  function best(question) {
    var top = null, topScore = 0;
    FAQ.forEach(function (item) {
      var s = score(question, item);
      if (s > topScore) { topScore = s; top = item; }
    });
    return topScore >= 2 ? top : null;
  }

  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function render(text) {
    return esc(text).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, t, href) {
      if (!/^(#|https?:|mailto:|[a-z0-9-]+\.html)/i.test(href)) return t;
      var onPage = href.charAt(0) === "#";
      var homeHash = onPage && !document.getElementById(href.slice(1)) ? "index.html" + href : href;
      var ext = /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : "";
      return '<a href="' + homeHash + '"' + ext + (onPage ? " data-close-chat" : "") + ">" + t + "</a>";
    });
  }

  /* ---- Build the chat window ---- */
  var fab = document.createElement("button");
  fab.className = "chat-fab";
  fab.setAttribute("aria-label", "Open chat");
  fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg><span class="chat-fab__badge"></span>';

  var box = document.createElement("section");
  box.className = "chat";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "Chat with Rifat's assistant");
  box.innerHTML =
    '<div class="chat__head"><div class="chat__avatar">RA</div>' +
    '<div class="chat__title"><strong>Ask about Rifat</strong><span>Instant answers · FAQ bot</span></div>' +
    '<button class="chat__close" aria-label="Close chat">×</button></div>' +
    '<div class="chat__body" aria-live="polite"></div>' +
    '<form class="chat__form"><input type="text" placeholder="Type a question…" aria-label="Your question" maxlength="200" autocomplete="off">' +
    '<button type="submit" aria-label="Send"><svg viewBox="0 0 24 24"><path d="M3 20.5l18-8.5L3 3.5 3 10l12 2-12 2z"/></svg></button></form>';

  document.body.appendChild(box);
  document.body.appendChild(fab);

  var body = box.querySelector(".chat__body");
  var form = box.querySelector(".chat__form");
  var input = form.querySelector("input");
  var started = false;

  function add(text, who) {
    var m = document.createElement("div");
    m.className = "msg msg--" + who;
    if (who === "bot") m.innerHTML = render(text); else m.textContent = text;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
  }
  function suggest(exclude) {
    var pool = FAQ.filter(function (f) { return f !== exclude; });
    var picks = exclude ? pool.sort(function () { return Math.random() - 0.5; }).slice(0, 3) : pool.slice(0, 4);
    var wrap = document.createElement("div");
    wrap.className = "chat__suggest";
    picks.forEach(function (f) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = f.q;
      b.addEventListener("click", function () { ask(f.q); });
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }
  function ask(text) {
    text = text.trim();
    if (!text) return;
    body.querySelectorAll(".chat__suggest").forEach(function (s) { s.remove(); });
    add(text, "user");
    var typing = document.createElement("div");
    typing.className = "msg msg--bot msg--typing";
    typing.innerHTML = "<i></i><i></i><i></i>";
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;
    setTimeout(function () {
      typing.remove();
      var hit = best(text);
      add(hit ? hit.a : window.FAQ_FALLBACK, "bot");
      suggest(hit);
    }, 450);
  }
  function open() {
    box.classList.add("is-open");
    fab.setAttribute("aria-label", "Close chat");
    var badge = fab.querySelector(".chat-fab__badge");
    if (badge) badge.remove();
    if (!started) { started = true; add(window.FAQ_GREETING, "bot"); suggest(null); }
    setTimeout(function () { input.focus({ preventScroll: true }); }, 200);
  }
  function close() {
    box.classList.remove("is-open");
    fab.setAttribute("aria-label", "Open chat");
  }

  fab.addEventListener("click", function () { box.classList.contains("is-open") ? close() : open(); });
  box.querySelector(".chat__close").addEventListener("click", close);
  form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); input.value = ""; });
  body.addEventListener("click", function (e) { if (e.target.closest("[data-close-chat]")) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  document.querySelectorAll("[data-open-chat]").forEach(function (b) { b.addEventListener("click", open); });
})();
