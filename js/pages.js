(function () {
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const yearEl = $('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const toTime = (d) => {
    const s = String(d || '');
    let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]).getTime();
    m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]).getTime();
    return 0;
  };
  const yearOf = (d) => { const m = String(d || '').match(/\d{4}/); return m ? m[0] : 'undated'; };

  const pMount = $('projects-list');
  if (pMount) {
    const list = onWeb(PROJECTS);
    const n = list.length;
    if ($('projects-count')) $('projects-count').textContent = n + (n === 1 ? ' project' : ' projects');
    if (!n) pMount.appendChild(el('p', 'empty', 'Nothing here yet — check back soon.'));
    list.forEach(p => {
      pMount.appendChild(el('div', 'card',
        '<h3>' + esc(p.title) + '</h3>' +
        (p.period ? '<div class="period">' + esc(p.period) + '</div>' : '') +
        (p.desc ? '<p>' + esc(p.desc) + '</p>' : '') +
        (p.stack && p.stack.length ? '<div class="chips small">' + p.stack.map(s => '<span>' + esc(s) + '</span>').join('') + '</div>' : '') +
        (p.learned && p.learned.length ? '<div class="learned"><span class="learned-label">skills gained/</span><div class="chips small">' + p.learned.map(s => '<span>' + esc(s) + '</span>').join('') + '</div></div>' : '') +
        (p.href ? '<a class="repo" href="' + esc(p.href) + '" target="_blank" rel="noopener noreferrer">' + esc(p.hrefLabel || p.href) + ' →</a>' : '')));
    });
  }

  const bMount = $('blogs-list');
  if (bMount) {
    const posts = onWeb(BLOGS).slice().sort((a, b) => toTime(b.date) - toTime(a.date));
    const n = posts.length;
    if ($('blogs-count')) $('blogs-count').textContent = n + (n === 1 ? ' post' : ' posts');

    const tags = [];
    posts.forEach(b => { if (b.tag && tags.indexOf(b.tag) < 0) tags.push(b.tag); });

    const filters = $('blog-filters');
    let active = 'all';

    const rowFor = (b) => {
      const a = el('a', 'row',
        '<span class="date">' + esc(b.date) + '</span>' +
        '<span class="title">' + esc(b.title) + '</span>' +
        '<span class="tag">' + esc(b.tag || '') + '</span>');
      a.href = b.slug ? 'post.html?p=' + encodeURIComponent(b.slug) : (b.href || '#');
      if (!b.slug && b.href && /^https?:/.test(b.href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      return a;
    };

    const draw = () => {
      bMount.innerHTML = '';
      const shown = posts.filter(b => active === 'all' || b.tag === active);
      if (!shown.length) { bMount.appendChild(el('p', 'empty', 'No posts under that tag yet.')); return; }
      let lastYear = null;
      shown.forEach(b => {
        const y = yearOf(b.date);
        if (y !== lastYear) { bMount.appendChild(el('div', 'year-mark', esc(y))); lastYear = y; }
        bMount.appendChild(rowFor(b));
      });
    };

    if (filters && tags.length > 1) {
      ['all'].concat(tags).forEach(t => {
        const b = el('button', 'chip-btn' + (t === 'all' ? ' on' : ''), esc(t));
        b.type = 'button';
        b.addEventListener('click', () => {
          active = t;
          filters.querySelectorAll('.chip-btn').forEach(x => x.classList.toggle('on', x === b));
          draw();
        });
        filters.appendChild(b);
      });
    }
    draw();
  }
})();
