/* Blog: reads posts/posts.json to list posts, and shows one post from its Markdown file. */
(function () {
  function fmtDate(d) {
    var dt = new Date(d + "T00:00:00");
    return isNaN(dt) ? d : dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function loadPosts() {
    return fetch("posts/posts.json", { cache: "no-cache" })
      .then(function (r) { return r.json(); })
      .then(function (list) {
        return list.filter(function (p) { return !p.draft; })
          .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      });
  }

  /* List of post cards (home page preview + blog page) */
  var listEl = document.getElementById("latestPosts") || document.getElementById("allPosts");
  if (listEl) {
    var limit = parseInt(listEl.getAttribute("data-limit"), 10) || 999;
    loadPosts().then(function (posts) {
      if (!posts.length) { listEl.innerHTML = '<p class="empty">First post coming soon.</p>'; return; }
      listEl.innerHTML = posts.slice(0, limit).map(function (p) {
        return '<a class="card post-card" href="post.html?p=' + encodeURIComponent(p.slug) + '">' +
          '<time datetime="' + esc(p.date) + '">' + fmtDate(p.date) + "</time>" +
          "<h3>" + esc(p.title) + "</h3><p>" + esc(p.summary) + '</p><span class="read">Read →</span></a>';
      }).join("");
    }).catch(function () {
      listEl.innerHTML = '<p class="empty">Posts could not be loaded.</p>';
    });
  }

  /* A single post */
  var postEl = document.getElementById("postBody");
  if (postEl) {
    var slug = new URLSearchParams(location.search).get("p") || "";
    var titleEl = document.getElementById("postTitle");
    var metaEl = document.getElementById("postMeta");
    if (!/^[a-z0-9-]+$/.test(slug)) { titleEl.textContent = "Post not found"; postEl.innerHTML = ""; return; }
    Promise.all([loadPosts(), fetch("posts/" + slug + ".md").then(function (r) { if (!r.ok) throw 0; return r.text(); })])
      .then(function (res) {
        var info = res[0].filter(function (p) { return p.slug === slug; })[0] || { title: slug, date: "" };
        document.title = info.title + " — Rifat Adnan";
        titleEl.textContent = info.title;
        metaEl.textContent = info.date ? fmtDate(info.date) : "";
        postEl.innerHTML = window.marked ? marked.parse(res[1]) : "<pre>" + esc(res[1]) + "</pre>";
      })
      .catch(function () {
        titleEl.textContent = "Post not found";
        postEl.innerHTML = '<p>That post doesn\'t exist. <a href="blog.html">See all posts</a>.</p>';
      });
  }
})();
