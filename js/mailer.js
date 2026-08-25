(function () {
  window.sendMessage = function (msg) {
    var cfg = (typeof CONTACT_FORM === 'object' && CONTACT_FORM) || {};
    if (!cfg.endpoint) return Promise.reject(new Error('no endpoint configured'));

    var payload = {
      name: msg.name,
      email: msg.email,
      message: msg.message,
      _subject: cfg.subject || 'New message from my website'
    };

    return fetch(cfg.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) {
          var detail = (j.errors && j.errors[0] && j.errors[0].message) || j.error || ('HTTP ' + r.status);
          throw new Error(detail);
        }
        return j;
      });
    });
  };
})();
