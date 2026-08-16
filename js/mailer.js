(function () {
  window.sendMessage = function (msg) {
    var cfg = (typeof CONTACT_FORM === 'object' && CONTACT_FORM) || {};
    if (!cfg.endpoint) return Promise.reject(new Error('no endpoint configured'));

    var payload = {
      name: msg.name,
      email: msg.email,
      message: msg.message,
      _subject: cfg.subject || 'New message from my website',
      _template: 'table',
      _captcha: 'false'
    };

    return fetch(cfg.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        var ok = r.ok && (j.success === undefined || j.success === true || String(j.success) === 'true');
        if (!ok) throw new Error(j.message || ('HTTP ' + r.status));
        return j;
      });
    });
  };
})();
