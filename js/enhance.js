/* Basso Global Partners — progressive enhancement.
   Loads after main.js. Adds motion + fixes the parts that didn't work
   (contact form had no handler, login anchor jumped, no deep-linking).
   Nothing here is required for the content to render. */
(function () {
  'use strict';

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Scroll reveal (home page only — it is the scrolling view) ── */
  function setupReveal() {
    if (reduce || !('IntersectionObserver' in window)) return;

    var groups = [
      ['#page-home .stat-item',          90],
      ['#page-home .two-col-intro',       0],
      ['#page-home .pillar-card',        80],
      ['#page-home .snapshot-cta',        0],
      ['#page-home .team-preview-card',  70],
      ['#page-home .section > .section-eyebrow', 0],
      ['#page-home .section > .section-title',   0],
      ['#page-home .locations-wrapper',   0],
      ['#page-home .divider-cta',         0]
    ];

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    groups.forEach(function (g) {
      var sel = g[0], stagger = g[1];
      document.querySelectorAll(sel).forEach(function (el, i) {
        el.classList.add('reveal');
        if (stagger) el.style.animationDelay = (Math.min(i, 8) * stagger) + 'ms';
        io.observe(el);
      });
    });
  }

  /* ── 2. Stat count-up (fires once when the stats bar enters view) ── */
  function setupCountUp() {
    var bar = document.querySelector('.stats-bar');
    if (!bar) return;

    function run() {
      bar.querySelectorAll('.stat-num').forEach(function (el) {
        var target = parseInt((el.textContent.match(/\d+/) || [0])[0], 10);
        if (!target) return;
        var sup = el.querySelector('sup');
        var supHTML = sup ? sup.outerHTML : '';
        if (reduce) { return; } // leave the real number in place
        var start = null, dur = 1400;
        function frame(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.innerHTML = Math.round(target * eased) + supHTML;
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    }

    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(); io.disconnect(); }
      });
    }, { threshold: 0.4 });
    io.observe(bar);
  }

  /* ── 3. Hash routing — deep links + browser back/forward ──────────
     Wraps the existing global showPage (defined in main.js) so URLs
     like …/#team are shareable and the back button works. */
  function setupRouting() {
    if (typeof window.showPage !== 'function') return;
    var inner = window.showPage;

    window.showPage = function (name) {
      inner(name);
      if (location.hash.slice(1) !== name) {
        history.replaceState(null, '', '#' + name);
      }
    };

    window.addEventListener('hashchange', function () {
      var n = location.hash.slice(1);
      if (n && document.getElementById('page-' + n)) inner(n);
    });

    var initial = location.hash.slice(1);
    if (initial && document.getElementById('page-' + initial)) {
      inner(initial);
    }
  }

  /* ── 4. Contact form → opens the visitor's mail client ────────────
     No backend exists, so we compose a mailto: with the entered data.
     Honest, zero-dependency, and actually sends. */
  function setupContactForm() {
    var page = document.getElementById('page-contact');
    if (!page) return;

    var btn = Array.prototype.slice
      .call(page.querySelectorAll('.btn-primary'))
      .filter(function (b) { return /send message/i.test(b.textContent); })[0];
    if (!btn) return;

    var val = function (sel) {
      var el = page.querySelector(sel);
      return el ? el.value.trim() : '';
    };
    var flash = function (msg) {
      var old = btn.textContent;
      btn.textContent = msg;
      setTimeout(function () { btn.textContent = old; }, 2600);
    };

    btn.addEventListener('click', function () {
      var first = val('input[placeholder="Jane"]');
      var last  = val('input[placeholder="Smith"]');
      var org   = val('input[placeholder="Your firm or institution"]');
      var email = val('input[type="email"]');
      var topic = val('select') || 'General Inquiry';
      var msg   = val('textarea');

      if (!email || email.indexOf('@') < 0 || !msg) {
        flash('Add your email + message');
        return;
      }

      var subject = 'Website inquiry — ' + topic;
      var body =
        'Name: ' + (first + ' ' + last).trim() + '\n' +
        'Organization: ' + org + '\n' +
        'Email: ' + email + '\n' +
        'Inquiry type: ' + topic + '\n\n' +
        msg + '\n';

      window.location.href = 'mailto:ir@bassoglobalpartners.com' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      flash('Opening your mail app…');
    });
  }

  /* ── 5. Mobile nav — inject a hamburger toggle (no markup change) ── */
  function setupMobileNav() {
    var nav = document.getElementById('mainNav');
    if (!nav || nav.querySelector('.nav-toggle')) return;

    var btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.setAttribute('aria-label', 'Toggle menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(btn);

    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  setupMobileNav();
  setupReveal();
  setupCountUp();
  setupRouting();
  setupContactForm();
})();
