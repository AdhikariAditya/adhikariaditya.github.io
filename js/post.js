(function () {
  const mount = document.getElementById('post');
  const slug = (new URLSearchParams(location.search).get('p') || '').replace(/[^a-z0-9._-]/gi, '');
  const entry = (typeof BLOGS !== 'undefined' ? BLOGS : []).find(b => b.slug === slug);

  if (!slug) { fail('No post specified.'); return; }

  fetch('posts/' + slug + '.md', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(src => {
      const { meta, body } = MD.frontMatter(src);
      const title = meta.title || (entry && entry.title) || slug;
      const date = meta.date || (entry && entry.date) || '';
      const tag = meta.tag || (entry && entry.tag) || '';
      document.title = title + ' — Aditya Adhikari';
      mount.innerHTML =
        '<a class="back" href="index.html#blogs">← all posts</a>' +
        '<h1>' + title + '</h1>' +
        '<div class="post-meta">' + [date, tag].filter(Boolean).join(' · ') + '</div>' +
        '<div class="post-body">' + MD.render(body) + '</div>' +
        '<a class="back bottom" href="index.html#blogs">← all posts</a>';
    })
    .catch(() => fail('Could not load <code>posts/' + slug + '.md</code>.'));

  function fail(msg) {
    mount.innerHTML = '<a class="back" href="index.html#blogs">← all posts</a>' +
      '<h1>404</h1><div class="post-body"><p>' + msg + '</p>' +
      '<p class="hint">If you are opening these files straight from your hard drive, posts will not load — ' +
      'browsers block local file reads. Run <code>python3 -m http.server</code> in this folder, or view it on GitHub Pages.</p></div>';
  }
})();
