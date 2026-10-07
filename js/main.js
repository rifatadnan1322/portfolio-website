/* Site behaviour: menu, light/dark switch, scroll animations, contact links, contact form. */
(function () {
  var root = document.documentElement;

  /* ---- Light / dark switch ---- */
  var themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ---- Mobile menu ---- */
  var nav = document.querySelector(".nav");
  var navBtn = document.getElementById("navToggle");
  if (nav && navBtn) {
    navBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navBtn.setAttribute("aria-expanded", open);
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        navBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Fade-in on scroll ---- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Contact links (filled from js/config.js) ---- */
  var S = window.SITE || {};
  var icons = {
    email: '<svg viewBox="0 0 24 24"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 7.2L4 7.3V17h16V7.3z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.3 0-3-1.85-3s-2.13 1.45-2.13 2.9V21H9z"/></svg>',
    github: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>',
    cv: '<svg viewBox="0 0 24 24"><path d="M6 2h8l6 6v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm7 1.5V9h5.5zM8 13h8v1.6H8zm0 3.4h8V18H8z"/></svg>'
  };
  var links = [];
  if (S.email) links.push({ k: "email", href: "mailto:" + S.email, label: "Email" });
  if (S.linkedin) links.push({ k: "linkedin", href: S.linkedin, label: "LinkedIn" });
  if (S.github) links.push({ k: "github", href: S.github, label: "GitHub" });
  if (S.cv) links.push({ k: "cv", href: S.cv, label: "Download CV" });
  document.querySelectorAll("[data-social]").forEach(function (box) {
    box.innerHTML = links.map(function (l) {
      var ext = l.k === "linkedin" || l.k === "github" ? ' target="_blank" rel="noopener"' : "";
      return '<a class="social" href="' + l.href + '"' + ext + '>' + icons[l.k] + l.label + "</a>";
    }).join("");
  });

  /* ---- Footer year ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- Contact form (sent to Netlify without leaving the page) ---- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      status.textContent = "Sending…";
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          status.textContent = "Thanks! Your message is on its way. ✓";
        })
        .catch(function () {
          status.textContent = "Sorry, that didn't send. Please try again in a moment.";
        });
    });
  }
})();
