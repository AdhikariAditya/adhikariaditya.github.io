(function () {
  const $ = (id) => document.getElementById(id);
  const out = $('output'), screen = $('screen'), input = $('cmdline');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const host = PROFILE.promptHost || 'aditya@adhikari';
  const PS1 = host + ':~$';

  $('titlebar-name').textContent = host + ': ~ — bash';

  let awaitingConfirm = true;
  let mail = null;
  const past = [];
  let hi = -1;

  const p = (t) => '<div class="t-p">' + esc(t) + '</div>';
  const head = (t) => '<div class="t-head">' + esc(t) + '</div>';
  const err = (t) => '<div class="t-err">' + esc(t) + '</div>';

  const helpTable = (rows) => '<div class="t-help">' +
    rows.map(r => '<div class="k">' + esc(r.cmd) + '</div><div class="v">' + esc(r.desc) + '</div>').join('') + '</div>';

  const items = (rows) => '<div class="t-items">' + rows.map(r =>
    '<div class="t-item"><span class="t-perm">' + (r.perm || 'drwxr-xr-x') + '</span><div>' +
    '<div><h4>' + esc(r.label) + '</h4>' + (r.meta ? '<span class="t-meta">' + esc(r.meta) + '</span>' : '') + '</div>' +
    (r.desc ? '<div class="t-desc">' + esc(r.desc) + '</div>' : '') +
    (r.learned && r.learned.length ? '<div class="t-tagrow tight"><span class="label">gained</span><div class="t-tags">' + r.learned.map(x => '<span>' + esc(x) + '</span>').join('') + '</div></div>' : '') +
    (r.href ? '<a class="t-link" href="' + esc(r.href) + '"' + (/^https?:/.test(r.href) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>→ ' + esc(r.hrefLabel || r.href) + '</a>' : '') +
    '</div></div>').join('') + '</div>';

  const tagGroups = (groups) => groups.map(g =>
    '<div class="t-tagrow"><span class="label">' + esc(g.label) + '</span><div class="t-tags">' +
    g.items.map(i => '<span>' + esc(i) + '</span>').join('') + '</div></div>').join('');

  const about = () =>
    '<div class="t-about">' +
    '<img class="t-photo" src="' + esc(PROFILE.photo) + '" alt="" onerror="this.removeAttribute(\'src\')">' +
    '<div class="t-abouttext"><div class="tag">' + esc(PROFILE.tagline) + '</div>' +
    '<div class="nm">' + esc(PROFILE.name) + '</div>' +
    '<div class="t-p">' + esc(PROFILE.bio) + '</div></div></div>';

  const HELP_ROWS = [
    { cmd: 'whoami', desc: 'about me' },
    { cmd: 'grep "education" Aditya_Adhikari', desc: 'education and degrees' },
    { cmd: 'find . -name "certifications"', desc: 'certifications' },
    { cmd: 'cat skills.txt', desc: 'languages, tools and other skills' },
    { cmd: 'ls blogs/', desc: 'blogs and CTF writeups' },
    { cmd: 'cat blogs/<name>', desc: 'read a post right here in the shell' },
    { cmd: 'ls projects/', desc: 'projects, with links to GitHub' },
    { cmd: 'grep "experience" Aditya_Adhikari', desc: 'roles, experience and internships' },
    { cmd: 'mail', desc: 'write me a message — sent straight to my inbox' },
    { cmd: 'wget contact.sh', desc: 'LinkedIn, GitHub' },
    { cmd: 'curl download_resume.sh', desc: 'open my resume in a new tab' },
    { cmd: 'theme', desc: 'toggle light/dark mode — or: theme light, theme dark' },
    { cmd: 'clear', desc: 'clear the screen' },
    { cmd: 'normal', desc: 'switch to the normal viewing experience' }
  ];

  const MATCHERS = [
    [/^help$|^\?$|^man$/, 'help'],
    [/^whoami$/, 'whoami'],
    [/^grep\s+.*education.*/, 'education'],
    [/^grep\s+.*experience.*/, 'experience'],
    [/^find\s+.*certification.*|^certifications?$/, 'certifications'],
    [/^cat\s+skills(\.txt)?$|^skills$/, 'skills'],
    [/^ls\s+\.?\/?blogs\/?$|^blogs?$/, 'blogs'],
    [/^(cat|less|more|read)\s+\.?\/?blogs\/\S+/, 'readpost'],
    [/^ls\s+\.?\/?projects\/?$|^projects?$/, 'projects'],
    [/^(wget|curl|sh|bash|\.\/)?\s*\.?\/?contact(\.sh)?$/, 'contact'],
    [/^mail$|^msg$|^message$|^(sh|bash|\.\/)?\s*\.?\/?message\.sh$/, 'mail'],
    [/^(wget|curl|sh|bash|\.\/)?\s*\.?\/?download_resume(\.sh)?$|^resume$/, 'resume'],
    [/^theme(\s+(light|dark|toggle))?$|^light$|^dark$/, 'theme'],
    [/^clear$|^cls$/, 'clear'],
    [/^normal$|^gui$/, 'normal'],
    [/^ls$|^ls\s+-la?$|^ls\s+\.$/, 'ls'],
    [/^pwd$/, 'pwd'],
    [/^sudo\s+.*/, 'sudo'],
    [/^exit$|^logout$/, 'exit']
  ];

  const timeRow = (it) => ({ label: it.title, meta: [it.org, it.period].filter(Boolean).join(' · '), desc: it.desc, learned: it.learned });

  function body(key, raw) {
    switch (key) {
      case 'help': return p('Available commands:') + helpTable(HELP_ROWS);
      case 'whoami': return about();
      case 'education': return head('EDUCATION') + items(onTerm(EDUCATION).map(timeRow));
      case 'experience': return head('EXPERIENCE') + items(onTerm(EXPERIENCE).map(timeRow));
      case 'certifications': return head('./certifications') + items(onTerm(CERTIFICATIONS).map(timeRow));
      case 'skills': return head('skills.txt') + tagGroups(onTerm(SKILLS));
      case 'blogs': return head('./blogs/') + items(onTerm(BLOGS).map(b => ({
        label: (b.slug ? b.slug + '.md' : b.title), meta: [b.date, b.tag].filter(Boolean).join(' · '),
        desc: b.slug ? b.title : '',
        href: b.slug ? 'post.html?p=' + encodeURIComponent(b.slug) : (b.href && b.href !== '#' ? b.href : ''),
        hrefLabel: 'read', perm: '-rw-r--r--'
      }))) + p('') + p("read one without leaving the shell:  cat blogs/<name>") +
        '<a class="t-link" href="blogs.html">→ browse every writeup on one page</a>';
      case 'projects': return head('./projects/') + items(onTerm(PROJECTS).map(pr => ({
        label: pr.title, desc: pr.desc, href: pr.href, hrefLabel: pr.hrefLabel || pr.href, learned: pr.learned
      }))) + p('') + '<a class="t-link" href="projects.html">→ browse every project on one page</a>';
      case 'contact': return head('running contact.sh') + items(onTerm(CONTACT).map(c => ({
        label: c.label, meta: c.value, href: c.href, hrefLabel: 'open', perm: '-rwxr-xr-x'
      }))) + p('') + p("or run 'mail' to write me a message without leaving the shell");
      case 'resume': return p('Opening ' + PROFILE.resume + ' ... done.') +
        '<a class="t-action" href="' + esc(PROFILE.resume) + '" target="_blank" rel="noopener">↗ open resume</a>';
      case 'ls': return '<div class="t-p">blogs/<br>projects/<br>skills.txt<br>contact.sh<br>message.sh<br>download_resume.sh<br>Aditya_Adhikari</div>';
      case 'pwd': return p('/home/aditya');
      case 'theme': {
        const arg = (raw.trim().toLowerCase().match(/light|dark|toggle/) || [])[0];
        const now = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const next = arg === 'light' || arg === 'dark' ? arg : (now === 'light' ? 'dark' : 'light');
        if (next === now) return p('theme: already ' + now + '.');
        setTheme(next);
        return p('theme: switched to ' + next + ' mode.');
      }
      case 'sudo': return err('aditya is not in the sudoers file. This incident will be reported.');
      case 'exit': return p("There is no exit. Try 'normal' for the point-and-click experience.");
      default: return err('bash: ' + raw + ': command not found — type \'help\' for assistance');
    }
  }

  function write(html, echo, promptText) {
    const entry = document.createElement('div');
    entry.className = 'entry';
    entry.innerHTML =
      (echo !== undefined ? '<div class="cmdecho"><span class="prompt">' + esc(promptText || PS1) + '</span><span class="typed">' + esc(echo) + '</span></div>' : '') +
      (html || '');
    out.appendChild(entry);
    screen.scrollTop = screen.scrollHeight;
  }

  function setPrompt() {
    $('prompt').textContent = awaitingConfirm ? '(y/n)' : (mail ? mail.ps : PS1);
  }

  function resolve(raw) {
    const cmd = raw.trim().replace(/\s+/g, ' ').toLowerCase();
    for (const [re, key] of MATCHERS) if (re.test(cmd)) return key;
    return null;
  }

  function run(raw) {
    if (awaitingConfirm) {
      const a = raw.trim().toLowerCase();
      if (a === 'y' || a === 'yes') {
        write(p('Redirecting to the normal viewing experience...'), raw, '(y/n)');
        setTimeout(() => setView('normal'), 450);
        return;
      }
      if (a === 'n' || a === 'no') {
        awaitingConfirm = false;
        write(p('Staying in the shell. Welcome aboard.') + p('') + head('type help for assistance'), raw, '(y/n)');
        setPrompt();
        return;
      }
      write(err('Please answer y or n.'), raw, '(y/n)');
      return;
    }
    if (mail) { mailStep(raw); return; }
    if (!raw.trim()) { write('', ''); return; }
    past.push(raw);
    const key = resolve(raw);
    if (key === 'clear') { out.innerHTML = ''; return; }
    if (key === 'readpost') { readPost(raw); return; }
    if (key === 'mail') { startMail(raw); return; }
    if (key === 'normal') {
      write(p('Switching to the normal viewing experience...'), raw);
      setTimeout(() => setView('normal'), 400);
      return;
    }
    write(body(key, raw.trim()), raw);
  }

  function readPost(raw) {
    const arg = raw.trim().split(/\s+/).pop().replace(/^\.?\/?blogs\//, '').replace(/\.md$/, '');
    const slug = arg.replace(/[^a-z0-9._-]/gi, '');
    const meta = BLOGS.find(b => b.slug === slug);
    if (!meta) {
      write(err('cat: ./blogs/' + arg + ': No such file or directory') + p("run 'ls ./blogs/' to see what's there"), raw);
      return;
    }
    write(p('reading ./blogs/' + slug + '.md ...'), raw);
    const entry = out.lastElementChild;
    fetch('posts/' + slug + '.md', { cache: 'no-cache' })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(src => {
        const fm = MD.frontMatter(src);
        entry.innerHTML = entry.querySelector('.cmdecho').outerHTML +
          head((fm.meta.title || meta.title) + '  —  ' + [fm.meta.date || meta.date, fm.meta.tag || meta.tag].filter(Boolean).join(' · ')) +
          '<pre class="t-post">' + esc(MD.toText(src)) + '</pre>' +
          '<a class="t-link" href="post.html?p=' + encodeURIComponent(slug) + '">→ open the formatted version</a>';
        screen.scrollTop = screen.scrollHeight;
      })
      .catch(() => {
        entry.innerHTML = entry.querySelector('.cmdecho').outerHTML +
          err('cat: ./blogs/' + slug + '.md: cannot read file') +
          p('(browsers block local file reads — serve the folder with `python3 -m http.server`, or view it on GitHub Pages)');
      });
  }

  const inbox = () => 'my inbox';

  function startMail(raw) {
    mail = { step: 'name', ps: 'name>', name: '', email: '', lines: [] };
    write(head('mail — compose a message') +
      p('Whatever you write is delivered straight to my inbox.') +
      p("Type 'cancel' on its own line at any point to abort.") + p('') +
      p('Who are you?'), raw);
    setPrompt();
  }

  function endMail() { mail = null; setPrompt(); }

  function mailStep(raw) {
    const v = raw.trim();
    const ps = mail.ps;

    if (/^(cancel|abort|:q!?)$/i.test(v)) {
      write(err('mail: aborted — nothing was sent.'), raw, ps);
      endMail();
      return;
    }

    if (mail.step === 'name') {
      if (!v) { write(err('mail: I need something to call you.'), raw, ps); return; }
      mail.name = v;
      mail.step = 'email';
      mail.ps = 'email>';
      write(p('Where should I reply?'), raw, ps);
      setPrompt();
      return;
    }

    if (mail.step === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        write(err('mail: that does not look like an email address.'), raw, ps);
        return;
      }
      mail.email = v;
      mail.step = 'body';
      mail.ps = '>';
      write(p('Write your message. Finish with a single . on its own line.'), raw, ps);
      setPrompt();
      return;
    }

    if (v === '.') {
      const message = mail.lines.join('\n').trim();
      if (!message) { write(err('mail: the message is empty.'), raw, ps); return; }
      sendMail(raw, { name: mail.name, email: mail.email, message: message });
      return;
    }

    mail.lines.push(raw);
    write('', raw, ps);
  }

  function sendMail(raw, msg) {
    const name = msg.name;
    write(p('sending — ' + msg.message.split('\n').length + ' line(s) ...'), raw, mail.ps);
    const entry = out.lastElementChild;
    const echo = entry.querySelector('.cmdecho').outerHTML;
    endMail();

    window.sendMessage(msg)
      .then(() => {
        entry.innerHTML = echo +
          p('mail: message delivered.') +
          head('Thanks, ' + name + ' — I\u2019ll get back to you at ' + msg.email) +
          p('');
        screen.scrollTop = screen.scrollHeight;
      })
      .catch(() => {
        entry.innerHTML = echo +
          err('mail: could not reach the mail relay.') +
          p('Try again in a moment, or reach me on LinkedIn — type: wget contact.sh');
        screen.scrollTop = screen.scrollHeight;
      });
  }

  function complete() {
    if (awaitingConfirm || mail) return;
    const typed = input.value.replace(/^\s+/, '');
    if (!typed) { write(helpTable(HELP_ROWS), ''); return; }

    const themeM = typed.match(/^(theme\s+)(\S*)$/i);
    if (themeM) {
      const opts = ['light', 'dark'].filter(o => o.startsWith(themeM[2].toLowerCase()));
      if (opts.length === 1) { input.value = themeM[1] + opts[0]; return; }
      if (opts.length) write(helpTable([{ cmd: 'light', desc: 'light mode' }, { cmd: 'dark', desc: 'dark mode' }]), typed);
      return;
    }

    const pathM = typed.match(/^((?:cat|less|more|read)\s+)(\.?\/?blogs\/)(\S*)$/i);
    if (pathM) {
      const files = onTerm(BLOGS).filter(b => b.slug).map(b => b.slug + '.md');
      const partial = pathM[3];
      const hits = files.filter(f => f.toLowerCase().startsWith(partial.toLowerCase()));
      if (!hits.length) return;
      if (hits.length === 1) { input.value = pathM[1] + pathM[2] + hits[0]; return; }
      let prefix = hits[0];
      for (const h of hits) while (h.toLowerCase().indexOf(prefix.toLowerCase()) !== 0) prefix = prefix.slice(0, -1);
      if (prefix.length > partial.length) { input.value = pathM[1] + pathM[2] + prefix; return; }
      write(helpTable(hits.map(f => ({ cmd: f, desc: (BLOGS.find(b => b.slug + '.md' === f) || {}).title || '' }))), typed);
      return;
    }

    const hits = HELP_ROWS.map(r => r.cmd).filter(c => c.toLowerCase().startsWith(typed.toLowerCase()));
    if (!hits.length) return;
    const stopAtArg = (c) => { const i = c.indexOf('<'); return i > 0 ? c.slice(0, i) : c + ' '; };
    if (hits.length === 1) { input.value = stopAtArg(hits[0]); return; }
    let prefix = hits[0];
    for (const h of hits) while (h.toLowerCase().indexOf(prefix.toLowerCase()) !== 0) prefix = prefix.slice(0, -1);
    const cut = prefix.indexOf('<');
    if (cut > 0) prefix = prefix.slice(0, cut);
    if (prefix.length > typed.length) { input.value = prefix; return; }
    write(helpTable(hits.map(c => HELP_ROWS.find(r => r.cmd === c))), typed);
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') { e.preventDefault(); complete(); return; }
    if (e.key === 'Enter') { e.preventDefault(); const v = input.value; input.value = ''; hi = -1; run(v); return; }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!past.length) return;
      let i = hi < 0 ? past.length : hi;
      i = Math.max(0, Math.min(past.length, i + (e.key === 'ArrowUp' ? -1 : 1)));
      hi = i >= past.length ? -1 : i;
      input.value = i >= past.length ? '' : past[i];
      return;
    }
    if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
  });
  const coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  screen.addEventListener('click', (e) => {
    if (coarse && e.target.closest('a,button')) return;
    if (coarse && String(getSelection()).length) return;
    input.focus();
  });

  write(
    p('Welcome to my website') + p('') +
    head('aditya_adhikari.sh — interactive shell') +
    p('This website is an interactive shell. However, if you wish, you can get a normal viewing experience.') +
    p('Do you want to be redirected to this normal viewing experience? (y/n)')
  );
  setPrompt();

  let saved = null;
  try { saved = localStorage.getItem('aa-view-mode'); } catch (e) {}
  const smallScreen = window.matchMedia && matchMedia('(max-width: 640px)').matches;
  setView(saved ? saved : (smallScreen ? 'normal' : 'shell'));
})();
