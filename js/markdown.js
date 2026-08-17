(function () {
  const esc = (s) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  function inline(s) {
    return esc(s)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
      .replace(/~~([^~]+)~~/g, '<del>$1</del>');
  }

  /* Front matter: leading --- block of key: value lines */
  function frontMatter(src) {
    const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!m) return { meta: {}, body: src };
    const meta = {};
    m[1].split(/\r?\n/).forEach(line => {
      const i = line.indexOf(':');
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    });
    return { meta, body: src.slice(m[0].length) };
  }

  function render(src) {
    const lines = src.replace(/\r\n/g, '\n').split('\n');
    let html = '', i = 0;

    const flushList = (tag, test, strip) => {
      const buf = [];
      while (i < lines.length && test(lines[i])) buf.push(inline(lines[i++].replace(strip, '')));
      html += '<' + tag + '>' + buf.map(t => '<li>' + t + '</li>').join('') + '</' + tag + '>';
    };

    while (i < lines.length) {
      const line = lines[i];

      if (/^```/.test(line)) {
        const lang = line.slice(3).trim();
        const buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
        i++;
        html += '<pre data-lang="' + esc(lang) + '"><code>' + esc(buf.join('\n')) + '</code></pre>';
        continue;
      }
      if (/^\s*$/.test(line)) { i++; continue; }
      if (/^(-{3,}|\*{3,})\s*$/.test(line)) { html += '<hr>'; i++; continue; }

      const h = line.match(/^(#{1,4})\s+(.*)$/);
      if (h) { const n = h[1].length + 1; html += '<h' + n + '>' + inline(h[2]) + '</h' + n + '>'; i++; continue; }

      if (/^>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(inline(lines[i++].replace(/^>\s?/, '')));
        html += '<blockquote>' + buf.join('<br>') + '</blockquote>';
        continue;
      }
      if (/^\s*[-*+]\s+/.test(line)) { flushList('ul', l => /^\s*[-*+]\s+/.test(l), /^\s*[-*+]\s+/); continue; }
      if (/^\s*\d+\.\s+/.test(line)) { flushList('ol', l => /^\s*\d+\.\s+/.test(l), /^\s*\d+\.\s+/); continue; }

      if (/^\|.*\|\s*$/.test(line) && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) {
        const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map(c => inline(c.trim()));
        const headRow = cells(lines[i]); i += 2;
        const rows = [];
        while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
        html += '<table><thead><tr>' + headRow.map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>' +
          rows.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
        continue;
      }

      const buf = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,4}\s|>|```|\s*[-*+]\s|\s*\d+\.\s|\|)/.test(lines[i])) buf.push(lines[i++]);
      html += '<p>' + inline(buf.join(' ')) + '</p>';
    }
    return html;
  }

  function toText(src) {
    return src.replace(/\r\n/g, '\n')
      .replace(/^---[\s\S]*?---\n/, '')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '[image: $1]')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1 ($2)')
      .replace(/[`*_~]/g, '')
      .trim();
  }

  window.MD = { render, frontMatter, toText };
})();
