/* Movimiento de la web. Sin dependencias; si algo falla, el contenido sigue visible. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Índices para las listas en cascada
  $$('.dolor-list, .proceso-list, .caso-datos').forEach(function (list) {
    $$('li', list).forEach(function (li, i) { li.style.setProperty('--i', i); });
  });
  // La cascada de los casos depende de que la tarjeta tenga .revealed (ya la lleva con data-reveal)

  // ── Fondo: manchas de color y red de puntos ──
  var bg = document.createElement('div');
  bg.className = 'bgfx';
  bg.setAttribute('aria-hidden', 'true');
  bg.innerHTML = '<i></i><i></i><i></i>';
  document.body.insertBefore(bg, document.body.firstChild);

  if (!reduce) network(bg);

  function network(host) {
    var cv = document.createElement('canvas');
    var ctx = cv.getContext('2d');
    if (!ctx) return;
    host.appendChild(cv);
    var w = 0, h = 0, dots = [], mouse = { x: -999, y: -999 }, last = 0;
    function size() {
      var r = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      cv.width = w * r; cv.height = h * r;
      ctx.setTransform(r, 0, 0, r, 0, 0);
      var n = Math.min(Math.round(w * h / 19000), 70);
      dots = [];
      for (var i = 0; i < n; i++) dots.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
    }
    function line(a, b, max, alpha) {
      var d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > max) return;
      ctx.strokeStyle = 'rgba(190,130,10,' + (alpha * (1 - d / max)).toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    function frame(t) {
      requestAnimationFrame(frame);
      var k = Math.min((t - last) / 16.7, 3) || 1; last = t;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var p = dots[i];
        p.x += p.vx * k; p.y += p.vy * k;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.fillStyle = 'rgba(190,130,10,.40)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.2832); ctx.fill();
        for (var q = i + 1; q < dots.length; q++) line(p, dots[q], 130, .22);
        line(p, mouse, 190, .55);
      }
    }
    size();
    window.addEventListener('resize', size, { passive: true });
    window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
    requestAnimationFrame(frame); // el navegador la pausa sola en pestañas ocultas
  }

  // ── Cabecera compacta y barra de lectura (la portada ya tiene la suya) ──
  var bar = null;
  if (!document.getElementById('progress-bar')) {
    bar = document.createElement('div'); bar.className = 'readbar'; document.body.appendChild(bar);
  }
  function onScroll() {
    root.classList.toggle('scrolled', window.scrollY > 24);
    if (bar) bar.style.transform = 'scaleX(' + Math.min(window.scrollY / Math.max(root.scrollHeight - window.innerHeight, 1), 1) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (reduce) return;

  // ── Titular palabra a palabra ──
  $$('h1').forEach(function (h1) {
    h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
    var i = 0;
    (function split(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 1) { if (child.tagName !== 'BR') { child.classList.add('mark'); split(child); } return; }
        if (child.nodeType !== 3) return;
        var frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var s = document.createElement('wrd'); // etiqueta propia: las reglas "h1 span" no la tocan
          s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = part;
          frag.appendChild(s);
        });
        node.replaceChild(frag, child);
      });
    })(h1);
  });

  // ── Entradas al scroll en las páginas interiores ──
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--rd', (n++ * 80) + 'ms');
        e.target.classList.add('in'); io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    $$('main#contenido > *:not(section):not(h1):not(.grid), main#contenido > .grid > *, main#contenido > section.cta-box').forEach(function (el) {
      if (el.hasAttribute('data-reveal') || el.id === 'quiz') return;
      el.classList.add('rv'); io.observe(el);
    });
    // Cifras que cuentan hasta su valor
    var counter = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        counter.unobserve(e.target);
        var el = e.target, m = el.textContent.trim().match(/^(\D*)(\d+)(.*)$/);
        if (!m) return;
        var end = +m[2], start = performance.now();
        (function step(now) {
          var p = Math.max(0, Math.min((now - start) / 1400, 1));
          el.textContent = m[1] + Math.round(end * (1 - Math.pow(1 - p, 3))) + m[3];
          if (p < 1) requestAnimationFrame(step);
        })(start);
      });
    });
    $$('.stat-num, .agency-stat .big').forEach(function (el) { counter.observe(el); });
  }

  if (!fine) return;

  // ── Foco de luz en tarjetas ──
  $$('.service-card, .caso-card, .card, .cambio, .agency-stat').forEach(function (el) {
    el.classList.add('spot');
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // ── Inclinación de la tarjeta del héroe ──
  var card = document.querySelector('.flow-card');
  if (card) {
    card.parentNode.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 9).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((.5 - (e.clientY - r.top) / r.height) * 9).toFixed(2) + 'deg');
    });
    card.parentNode.addEventListener('pointerleave', function () {
      card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
    });
  }

  // ── Botones magnéticos ──
  $$('.btn-primary, .btn, .nav-cta, .cta').forEach(function (b) {
    b.classList.add('magnet');
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      b.style.translate = ((e.clientX - r.left - r.width / 2) * .14).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * .22).toFixed(1) + 'px';
    });
    b.addEventListener('pointerleave', function () { b.style.translate = ''; });
  });
})();
