/* Transición de los accesos directos: presenta en un instante la idea del destino y lo descubre.
   Se carga sin "defer" para tapar la página de llegada antes de que se pinte. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!Element.prototype.animate) return;

  var KEY = 'portal';
  var HOLD = 1050;      // ms que se ve la presentación (desde el clic)
  var ARRIVE = 380;     // ms extra al llegar a otra página
  var EASE = 'cubic-bezier(.77,0,.18,1)';

  // ── Dibujos: trazos que se pintan solos (class d) y piezas que aparecen (class p) ──
  var ART = {
    chat: '<path class="d" d="M18 26h58a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H42L26 78V66h-8a8 8 0 0 1-8-8V34a8 8 0 0 1 8-8z"/><path class="d a" d="M94 52h8a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8h-4v10L84 90H62a8 8 0 0 1-8-8v-6"/><circle class="p" cx="31" cy="46" r="3.5"/><circle class="p" cx="47" cy="46" r="3.5"/><circle class="p" cx="63" cy="46" r="3.5"/>',
    doc: '<path class="d" d="M30 12h42l18 18v78H30z"/><path class="d" d="M72 12v18h18"/><path class="d" d="M42 48h36M42 62h36M42 76h22"/><path class="d a" d="M68 90l7 7 14-16"/><path class="scan" d="M20 40h80"/>',
    loop: '<path class="d" d="M30 46a32 32 0 0 1 56-8"/><path class="d" d="M88 20v20H68"/><path class="d a" d="M90 74a32 32 0 0 1-56 8"/><path class="d a" d="M32 100V80h20"/><circle class="p" cx="60" cy="60" r="7"/>',
    link: '<path class="d" d="M34 36L60 60l28-22M60 60l-22 28M60 60l28 26"/><circle class="p" cx="28" cy="30" r="10"/><circle class="p" cx="92" cy="32" r="10"/><circle class="p" cx="34" cy="92" r="10"/><circle class="p" cx="92" cy="90" r="10"/><circle class="p a" cx="60" cy="60" r="13"/>',
    clock: '<circle class="d" cx="60" cy="60" r="44"/><path class="d a" d="M60 34v28l18 12"/><path class="d" d="M60 8v8M60 104v8M8 60h8M104 60h8"/>',
    path: '<path class="d" d="M18 100C18 70 52 82 52 58S86 46 98 22"/><circle class="p" cx="18" cy="100" r="7"/><circle class="p" cx="52" cy="58" r="7"/><circle class="p a" cx="98" cy="22" r="11"/>',
    check: '<rect class="d" x="18" y="18" width="84" height="84" rx="14"/><path class="d a" d="M38 62l15 15 30-33"/>',
    grid: '<rect class="d" x="18" y="18" width="36" height="36" rx="8"/><rect class="d" x="66" y="18" width="36" height="36" rx="8"/><rect class="d" x="18" y="66" width="36" height="36" rx="8"/><rect class="d a" x="66" y="66" width="36" height="36" rx="8"/>',
    pin: '<path class="d" d="M60 108S26 74 26 48a34 34 0 0 1 68 0c0 26-34 60-34 60z"/><circle class="p a" cx="60" cy="48" r="12"/>',
    book: '<path class="d" d="M60 30C48 20 30 20 16 24v70c14-4 32-4 44 6 12-10 30-10 44-6V24c-14-4-32-4-44 6z"/><path class="d a" d="M60 30v70"/><path class="d" d="M28 42h20M28 56h20M72 42h20M72 56h20"/>'
  };

  var PLACES = {
    '/': ['Inicio', 'Tu negocio, con menos papeleo.', 'grid'],
    '#hero': ['Inicio', 'Tu negocio, con menos papeleo.', 'grid'],
    '#nosotros': ['Mi historia', 'De electricista en verano a automatizar negocios.', 'path'],
    '#servicios': ['Servicios', 'Empezamos por lo que más tiempo te quita.', 'grid'],
    '#casos': ['Casos reales', 'No te lo cuento: está funcionando.', 'check'],
    '#agencia': ['Mi agencia', 'O.N.E Agency: hablas siempre conmigo.', 'link'],
    '#contacto': ['Hablemos', '30 minutos, gratis y sin compromiso.', 'clock'],
    '/sobre-angel-carrillo/': ['Sobre mí', 'Quién hay detrás de cada automatización.', 'path'],
    '/servicios/': ['Servicios', 'Menos trabajo manual en tu negocio.', 'grid'],
    '/servicios/chatbots-ia-whatsapp/': ['Chatbot y WhatsApp', 'Responde y agenda cuando tú no puedes.', 'chat'],
    '/servicios/automatizacion-tareas-pymes/': ['Tareas repetitivas', 'Seguimientos y avisos que se hacen solos.', 'loop'],
    '/servicios/automatizar-facturas-ia/': ['Facturas con IA', 'Se leen solas. Tú confirmas lo dudoso.', 'doc'],
    '/servicios/integraciones-herramientas/': ['Integraciones', 'Tus herramientas se pasan los datos.', 'link'],
    '/servicios/agencia-ia-cordoba/': ['IA en Córdoba', 'Automatización para negocios de tu zona.', 'pin'],
    '/blog/': ['Blog', 'Lo que aprendo construyendo sistemas reales.', 'book'],
    '/blog/lecciones-sistema-partes-empresa-electricidad/': ['Partes de obra', 'Lecciones de un sistema para electricistas.', 'check'],
    '/blog/como-medir-horas-perdidas-tareas-repetitivas/': ['Horas perdidas', 'Cómo medir lo que te cuesta repetir.', 'clock'],
    '/blog/que-debe-responder-asistente-whatsapp-negocio-local/': ['Asistente de WhatsApp', 'Qué debe responder y qué no.', 'chat'],
    '/blog/facturas-en-excel-contabilidad-o-ia/': ['Excel o IA', 'Cuándo compensa cada forma de llevar facturas.', 'doc'],
    '/herramientas/': ['Herramientas', 'Gratis, para decidir por dónde empezar.', 'grid'],
    '/herramientas/que-automatizar-primero/': ['El test', 'Cuatro preguntas: qué automatizar primero.', 'check']
  };

  var CSS = '.pt{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;background:#fff;color:#14151A;cursor:pointer;overflow:hidden;font-family:Inter,system-ui,sans-serif}' +
    '.pt::before{content:"";position:absolute;width:90vmax;height:90vmax;border-radius:50%;background:radial-gradient(closest-side,rgba(242,182,50,.34),transparent);top:50%;left:50%;margin:-45vmax 0 0 -45vmax;animation:pt-glow 1.4s cubic-bezier(.16,1,.3,1) both}' +
    '.pt-in{position:relative;text-align:center;padding:24px;max-width:760px}' +
    '.pt svg{width:clamp(96px,20vmin,150px);height:auto;display:block;margin:0 auto 18px;fill:none;stroke:#14151A;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;overflow:visible}' +
    '.pt .a{stroke:#D99A0B}.pt circle.p{fill:#14151A;stroke:none}.pt circle.p.a{fill:#F2B632}' +
    '.pt .d{stroke-dasharray:1;stroke-dashoffset:1;animation:pt-draw .6s cubic-bezier(.65,0,.35,1) forwards}.pt .d:nth-of-type(2){animation-delay:.08s}.pt .d:nth-of-type(3){animation-delay:.16s}.pt .d.a{animation-delay:.28s}' +
    '.pt .p{transform-box:fill-box;transform-origin:center;animation:pt-pop .45s cubic-bezier(.34,1.56,.64,1) both;animation-delay:.3s}.pt .p~.p{animation-delay:.38s}.pt .p~.p~.p{animation-delay:.46s}.pt .p~.p~.p~.p{animation-delay:.54s}' +
    '.pt .scan{stroke:#F2B632;stroke-width:4;animation:pt-scan .85s cubic-bezier(.65,0,.35,1) .2s both}' +
    '.pt h2{font:400 clamp(42px,9vw,86px)/1.02 "Instrument Serif",Georgia,serif;letter-spacing:-.02em;margin:0;padding:0;color:#14151A}' +
    '.pt h2 span{display:inline-block;overflow:hidden;vertical-align:top;padding:0 .06em .08em;background:none;font-style:normal;color:inherit;-webkit-text-fill-color:currentColor}' +
    '.pt h2 i{display:inline-block;font-style:normal;animation:pt-up .55s cubic-bezier(.16,1,.3,1) both;animation-delay:calc(var(--i)*70ms + 140ms)}' +
    '.pt p{font-size:clamp(16px,2.6vw,21px);line-height:1.5;margin:10px 0 0;color:#54565F;animation:pt-fade .5s cubic-bezier(.16,1,.3,1) .36s both}' +
    '.pt-bar{display:block;width:160px;height:3px;margin:24px auto 0;border-radius:3px;background:rgba(20,21,26,.09);overflow:hidden}' +
    '.pt-bar b{display:block;height:100%;background:#F2B632;transform-origin:left;animation:pt-bar 1.3s cubic-bezier(.45,0,.25,1) both}' +
    '.pt.done *,.pt.done::before{animation-delay:-3s!important}' +
    '@keyframes pt-draw{to{stroke-dashoffset:0}}@keyframes pt-pop{from{opacity:0;transform:scale(.4)}}@keyframes pt-up{from{transform:translateY(110%) rotate(5deg)}}' +
    '@keyframes pt-fade{from{opacity:0;transform:translateY(14px)}}@keyframes pt-bar{from{transform:scaleX(0)}}@keyframes pt-glow{from{opacity:0;transform:scale(.45)}}' +
    '@keyframes pt-scan{0%{opacity:0;transform:translateY(-20px)}15%,80%{opacity:1}100%{opacity:0;transform:translateY(60px)}}';

  var style = document.createElement('style');
  style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);

  var current = null;   // { el, timer, go }
  var leaving = false;

  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function build(key) {
    var place = PLACES[key];
    var el = document.createElement('div');
    el.className = 'pt';
    el.setAttribute('role', 'status');
    var words = place[0].split(' ').map(function (w, i) {
      return '<span><i style="--i:' + i + '">' + esc(w) + '</i></span>';
    }).join(' ');
    var art = ART[place[2]].replace(/class="d/g, 'pathLength="1" class="d');
    el.innerHTML = '<div class="pt-in"><svg viewBox="0 0 120 120" aria-hidden="true">' + art + '</svg><h2>' + words +
      '</h2><p>' + esc(place[1]) + '</p><span class="pt-bar" aria-hidden="true"><b></b></span></div>';
    return el;
  }

  function reveal() {
    var c = current;
    if (!c) return;
    current = null;
    // La sección de destino entra a la vez que se descubre, sin huecos en blanco
    var dest = location.hash && document.getElementById(location.hash.slice(1));
    if (dest) Array.prototype.forEach.call(dest.querySelectorAll('[data-reveal]'), function (n) {
      if (n.getBoundingClientRect().top < innerHeight) n.classList.add('revealed');
    });
    clearTimeout(c.timer);
    c.el.style.pointerEvents = 'none';
    c.el.firstChild.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-48px)' }],
      { duration: 300, easing: 'cubic-bezier(.55,0,1,.45)', fill: 'forwards' });
    var out = c.el.animate([{ clipPath: 'ellipse(150% 130% at 50% 0%)' }, { clipPath: 'ellipse(120% 0% at 50% 0%)' }],
      { duration: 480, delay: 90, easing: EASE, fill: 'forwards' });
    var remove = function () { c.el.remove(); };
    out.onfinish = remove;
    setTimeout(remove, 900);
  }

  // Destino conocido de un enlace, o null si debe comportarse como siempre
  function target(a) {
    if (a.target && a.target !== '_self') return null;
    if (a.hasAttribute('download')) return null;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return null;
    var path = url.pathname.replace(/index\.html$/, '');
    var samePage = path === location.pathname.replace(/index\.html$/, '');
    if (samePage) {
      if (!url.hash || !PLACES[url.hash] || !document.getElementById(url.hash.slice(1))) return null;
      return { key: url.hash, samePage: true, url: url };
    }
    var key = path === '/' && PLACES[url.hash] ? url.hash : path;
    return PLACES[key] ? { key: key, samePage: false, url: url } : null;
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (e.detail === 0) return; // activado con teclado: navegación inmediata
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var t = target(a);
    if (!t) return;
    e.preventDefault();
    if (current || leaving) return;

    var el = build(t.key);
    document.documentElement.appendChild(el);
    var x = e.clientX, y = e.clientY;
    var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    el.animate([{ clipPath: 'circle(0px at ' + x + 'px ' + y + 'px)' }, { clipPath: 'circle(' + Math.ceil(r) + 'px at ' + x + 'px ' + y + 'px)' }],
      { duration: 480, easing: EASE, fill: 'backwards' });

    function go() {
      if (t.samePage) {
        var dest = document.getElementById(t.url.hash.slice(1));
        history.pushState(null, '', t.url.hash);
        dest.scrollIntoView({ behavior: 'instant' });
        if (!dest.hasAttribute('tabindex')) dest.setAttribute('tabindex', '-1');
        dest.focus({ preventScroll: true });
        reveal();
      } else {
        leaving = true;
        current = null;
        try { sessionStorage.setItem(KEY, JSON.stringify({ key: t.key, at: Date.now() })); } catch (err) {}
        location.assign(t.url.href);
      }
    }
    current = { el: el, go: go, timer: setTimeout(go, HOLD) };
    // Un segundo clic salta la presentación
    el.addEventListener('click', function () {
      if (current) { clearTimeout(current.timer); current.go(); }
    });
  }, true);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && current) { clearTimeout(current.timer); current.go(); }
  });

  // Al volver con "atrás" desde la caché del navegador no debe quedar nada tapando
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    leaving = false; current = null;
    Array.prototype.forEach.call(document.querySelectorAll('.pt'), function (n) { n.remove(); });
  });

  // ── Llegada desde otra página ──
  var saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(KEY)); sessionStorage.removeItem(KEY); } catch (err) {}
  if (saved && PLACES[saved.key] && Date.now() - saved.at < 8000) {
    var el = build(saved.key);
    el.classList.add('done'); // ya presentada: se muestra completa y se descubre la página
    document.documentElement.appendChild(el);
    // Si el destino es una sección, se coloca en ella antes de descubrir la página
    var place = function () {
      var dest = location.hash && document.getElementById(location.hash.slice(1));
      if (dest) dest.scrollIntoView({ behavior: 'instant' });
    };
    var go = function () { place(); reveal(); };
    var start = function () { place(); if (current) current.timer = setTimeout(go, ARRIVE); };
    current = { el: el, go: go, timer: setTimeout(go, 2500) };
    el.addEventListener('click', go);
    document.addEventListener('DOMContentLoaded', function () { clearTimeout(current && current.timer); start(); });
  }
})();
