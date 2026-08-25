(function () {
  window.sendMessage = function (msg) {
    var cfg = (typeof CONTACT_FORM === 'object' && CONTACT_FORM) || {};
    if (!cfg.endpoint) return Promise.reject(new Error('no endpoint configured'));
    if (location.protocol === 'file:') return Promise.reject(new Error('open the site over http, not file://'));

    var body = new FormData();
    body.append('name', msg.name);
    body.append('email', msg.email);
    body.append('message', msg.message);
    body.append('_subject', cfg.subject || 'New message from my website');
    body.append('_template', 'table');
    body.append('_captcha', 'false');

    return fetch(cfg.endpoint, { method: 'POST', mode: 'no-cors', body: body })
      .then(function () { return { success: true }; });
  };
})();
