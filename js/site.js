(function () {
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  $('hero-tagline').textContent = PROFILE.tagline;
  $('hero-name').textContent = PROFILE.name;
  $('hero-bio').textContent = PROFILE.bio;
  $('hero-resume').href = PROFILE.resume;
  $('year').textContent = new Date().getFullYear();

  const portrait = $('portrait');
  const img = new Image();
  img.onload = () => { portrait.innerHTML = ''; portrait.classList.add('has-photo'); portrait.appendChild(img); };
  img.onerror = () => { portrait.appendChild(el('span', 'ph', 'add assets/profile.jpg')); };
  img.alt = 'Aditya Adhikari';
  img.src = PROFILE.photo;

  const timeline = (list, mount) => list.forEach(it => {
    mount.appendChild(el('div', 'card',
      '<div class="card-head"><h3>' + esc(it.title) + '</h3><span class="period">' + esc(it.period) + '</span></div>' +
      (it.org ? '<div class="org">' + esc(it.org) + '</div>' : '') +
      (it.desc ? '<p>' + esc(it.desc) + '</p>' : '')));
  });

  timeline(onWeb(EDUCATION), $('education-list'));
  timeline(onWeb(EXPERIENCE), $('experience-list'));

  onWeb(CERTIFICATIONS).forEach(c => {
    $('certifications-list').appendChild(el('div', 'card',
      '<h3>' + esc(c.title) + '</h3>' +
      '<div class="period">' + esc(c.org) + (c.period ? ' · ' + esc(c.period) : '') + '</div>' +
      (c.desc ? '<p>' + esc(c.desc) + '</p>' : '')));
  });

  onWeb(SKILLS).forEach(g => {
    const box = el('div');
    box.appendChild(el('div', 'label', esc(g.label) + '/'));
    box.appendChild(el('div', 'chips', g.items.map(i => '<span>' + esc(i) + '</span>').join('')));
    $('skills-list').appendChild(box);
  });

  const HOME_PROJECTS = 3, HOME_BLOGS = 5;

  onWeb(PROJECTS).slice(0, HOME_PROJECTS).forEach(p => {
    $('projects-list').appendChild(el('div', 'card',
      '<h3>' + esc(p.title) + '</h3>' +
      (p.desc ? '<p>' + esc(p.desc) + '</p>' : '') +
      (p.href ? '<a class="repo" href="' + esc(p.href) + '" target="_blank" rel="noopener noreferrer">' + esc(p.hrefLabel || p.href) + ' →</a>' : '')));
  });

  onWeb(BLOGS).slice(0, HOME_BLOGS).forEach(b => {
    const a = el('a', 'row',
      '<span class="date">' + esc(b.date) + '</span>' +
      '<span class="title">' + esc(b.title) + '</span>' +
      '<span class="tag">' + esc(b.tag) + '</span>');
    a.href = b.slug ? 'post.html?p=' + encodeURIComponent(b.slug) : (b.href || '#');
    if (!b.slug && b.href && /^https?:/.test(b.href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    $('blogs-list').appendChild(a);
  });

  onWeb(CONTACT).forEach(c => {
    const a = el('a', 'contact-card',
      '<div class="label">' + esc(c.label) + '</div><div class="value">' + esc(c.value) + '</div>');
    a.href = c.href;
    if (/^https?:/.test(c.href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    $('contact-list').appendChild(a);
  });

  const form = $('contact-form');
  if (form) {
    const status = $('form-status'), btn = $('send-btn');
    const say = (msg, kind) => { status.textContent = msg; status.className = 'form-status' + (kind ? ' ' + kind : ''); };
    const val = (n) => (form.elements[n].value || '').trim();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (val('_honey')) return;
      const name = val('name'), email = val('email'), message = val('message');
      if (!name || !email || !message) { say('Please fill in your name, email and message.', 'err'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { say('That email address does not look right.', 'err'); return; }

      btn.disabled = true;
      say('Sending\u2026');
      window.sendMessage({ name: name, email: email, message: message })
        .then(() => { form.reset(); say('Message sent \u2014 thanks, ' + name + '. I\u2019ll get back to you.', 'ok'); })
        .catch(() => say('Could not send right now. Email me directly at ' + CONTACT_FORM.fallback + '.', 'err'))
        .then(() => { btn.disabled = false; });
    });
  }

  window.setView = function (mode) {
    const shell = $('shell'), site = $('site');
    shell.hidden = mode !== 'shell';
    site.hidden = mode !== 'normal';
    try { localStorage.setItem('aa-view-mode', mode); } catch (e) {}
    if (mode === 'shell') { const i = $('cmdline'); if (i) i.focus(); }
    else window.scrollTo(0, 0);
  };
  $('to-normal').addEventListener('click', () => setView('normal'));
  $('to-shell').addEventListener('click', () => setView('shell'));
})();
