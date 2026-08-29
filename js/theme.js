(function () {
  var KEY = 'aa-theme';
  function label(t) { return t === 'light' ? 'dark mode' : 'light mode'; }
  function apply(t) {
    document.documentElement.setAttribute('data-theme', t);
    var btns = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].textContent = label(t);
      btns[i].setAttribute('aria-label', 'Switch to ' + label(t));
    }
  }
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  window.setTheme = function (t) {
    try { localStorage.setItem(KEY, t); } catch (e) {}
    apply(t);
  };
  apply(document.documentElement.getAttribute('data-theme') || stored() ||
    (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('[data-theme-toggle]');
    if (!b) return;
    e.preventDefault();
    setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  });
})();
