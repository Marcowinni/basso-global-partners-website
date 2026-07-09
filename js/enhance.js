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

  /* ── 4. Contact form → POST to the serverless endpoint (/api/contact),
     which sends the email server-side. Requires a consent checkbox and
     carries a honeypot field for spam. Falls back to a clear error. */
  function setupContactForm() {
    var btn = document.getElementById('contact-submit');
    if (!btn) return;

    var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
    var label = btn.textContent;
    var flash = function (msg) {
      btn.textContent = msg;
      setTimeout(function () { btn.textContent = label; }, 3200);
    };

    btn.addEventListener('click', function () {
      var consent = document.getElementById('contact-consent');
      var email = v('contact-email');
      var message = v('contact-message');

      if (!consent || !consent.checked) { flash('Please accept the privacy note'); return; }
      if (!email || email.indexOf('@') < 0 || !message) { flash('Add your email + message'); return; }

      var payload = {
        firstName: v('contact-first'),
        lastName: v('contact-last'),
        organization: v('contact-org'),
        email: email,
        inquiryType: v('contact-inquiry'),
        message: message,
        company_url: v('contact-hp') // honeypot — real users leave it empty
      };

      btn.disabled = true;
      flash('Sending…');

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (data) {
          if (data && data.ok) {
            flash('Thank you — message sent ✓');
            ['contact-first', 'contact-last', 'contact-org', 'contact-email', 'contact-message']
              .forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ''; });
            if (consent) consent.checked = false;
          } else {
            flash('Could not send — please try again');
          }
        })
        .catch(function () { flash('Could not send — please try again'); })
        .then(function () { btn.disabled = false; });
    });
  }

  /* ── 4b. Newsletter signup → POST to /api/newsletter (same pattern as the
     contact form) — sends server-side instead of opening the visitor's mail
     app with a mailto: draft. */
  function setupNewsletterForm() {
    var btn = document.getElementById('newsletter-submit');
    var input = document.getElementById('newsletter-email');
    if (!btn || !input) return;

    var label = btn.textContent;
    var flash = function (msg) {
      btn.textContent = msg;
      setTimeout(function () { btn.textContent = label; }, 3200);
    };

    btn.addEventListener('click', function () {
      var email = input.value.trim();
      if (!email || email.indexOf('@') < 0) {
        input.style.borderColor = 'rgba(201,168,76,0.6)';
        flash('Please enter a valid email address');
        return;
      }

      var hp = document.getElementById('newsletter-hp');
      var payload = { email: email, company_url: hp ? hp.value : '' };

      btn.disabled = true;
      flash('Sending…');

      fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (data) {
          if (data && data.ok) {
            flash('Subscribed ✓');
            input.value = '';
          } else {
            flash('Could not subscribe — please try again');
          }
        })
        .catch(function () { flash('Could not subscribe — please try again'); })
        .then(function () { btn.disabled = false; });
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

  /* ── 6. Keyboard activation for role="button" elements ────────────
     Interactive divs (pillar cards, strategy rows, team cards) carry
     role="button" + tabindex="0" but no native key handling. One
     delegated listener makes Enter/Space activate them; Space also
     prevents the default page scroll. Nav anchors work natively. */
  function setupKeyboardActivation() {
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (!e.target.matches || !e.target.matches('[role="button"]')) return;
      if (e.key === ' ') e.preventDefault();
      e.target.click();
    });
  }

  setupMobileNav();
  setupReveal();
  setupCountUp();
  setupRouting();
  setupContactForm();
  setupNewsletterForm();
  setupKeyboardActivation();
})();
