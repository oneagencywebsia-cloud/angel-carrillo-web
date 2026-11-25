/* Google Analytics 4 con consentimiento previo: no se carga nada de Google hasta pulsar "Aceptar". */
(function () {
  'use strict';
  var ID = 'G-RJE6GB4ZR1';
  var KEY = 'consent-analytics'; // 'granted' | 'denied'
  var loaded = false;

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(value) { try { localStorage.setItem(KEY, value); } catch (e) {} }

  function gtag() { window.dataLayer.push(arguments); }

  function load() {
    // Fuera del dominio real (pruebas en local, vista previa) no se envían datos.
    var production = location.hostname === 'angelcarrillo.es';
    window['ga-disable-' + ID] = !production;
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    gtag('js', new Date());
    gtag('config', ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }

  function disable() {
    window['ga-disable-' + ID] = true;
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ga') !== 0) return;
      ['', '; domain=' + location.hostname, '; domain=.' + location.hostname].forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; path=/' + d;
      });
    });
  }

  // Contactos: clics en email, Instagram y formulario de diagnóstico.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || !loaded || read() !== 'granted') return;
    var href = a.getAttribute('href');
    var method = href.indexOf('mailto:') === 0 ? 'email'
      : href.indexOf('https://ig.me/') === 0 ? 'instagram'
      : href.indexOf('https://one-agency.es/#contacto') === 0 ? 'formulario'
      : null;
    if (method) gtag('event', 'generate_lead', { method: method });
  });

  var css = '.ck{position:fixed;left:16px;right:16px;bottom:16px;z-index:10000;max-width:640px;margin:auto;' +
    'background:#fff;color:#14151A;border:1px solid rgba(20,21,26,.14);border-radius:14px;padding:18px 20px;' +
    'font:400 14px/1.55 Inter,system-ui,sans-serif;box-shadow:0 18px 50px rgba(20,21,26,.18)}' +
    '.ck p{margin:0 0 14px;color:#14151A}.ck a{color:#8F5D00;text-decoration:underline}' +
    '.ck div{display:flex;gap:10px;flex-wrap:wrap}' +
    '.ck button{flex:1 1 140px;font:600 14px Inter,system-ui,sans-serif;padding:10px 16px;border-radius:10px;' +
    'border:1px solid #F2B632;background:transparent;color:#14151A;cursor:pointer}' +
    '.ck button:hover,.ck button:focus-visible{background:#F2B632;color:#14151A}' +
    '.ck-links{text-align:center;padding:0 20px 18px;font-size:.8rem}' +
    '.ck-links a,.ck-links button{color:inherit;background:none;border:0;font:inherit;text-decoration:underline;cursor:pointer;padding:0}';

  var banner = null;

  function close() { if (banner) { banner.remove(); banner = null; } }

  function ask() {
    if (banner) return;
    banner = document.createElement('section');
    banner.className = 'ck';
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML = '<p>Uso cookies de Google Analytics para saber qué páginas se visitan. Solo se activan si las aceptas. ' +
      '<a href="/privacidad/">Más información</a></p>' +
      '<div><button type="button" data-ck="denied">Rechazar</button><button type="button" data-ck="granted">Aceptar</button></div>';
    banner.addEventListener('click', function (e) {
      var choice = e.target.getAttribute('data-ck');
      if (!choice) return;
      save(choice);
      if (choice === 'granted') load(); else disable();
      close();
    });
    document.body.appendChild(banner);
  }

  function init() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var footer = document.querySelector('footer');
    if (footer) {
      var links = document.createElement('p');
      links.className = 'ck-links';
      links.innerHTML = '<a href="/privacidad/">Privacidad y cookies</a> · <button type="button">Cambiar preferencias</button>';
      links.querySelector('button').addEventListener('click', ask);
      footer.appendChild(links);
    }

    var choice = read();
    if (choice === 'granted') load();
    else if (choice !== 'denied') ask();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
