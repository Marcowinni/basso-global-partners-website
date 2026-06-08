/* Basso Global Partners — News Admin (frontend-only demo).
 *
 * ⚠️ SECURITY: the login below is a CLIENT-SIDE gate only — it is NOT real
 * authentication and provides NO protection (anyone can read this file / the
 * localStorage data). It exists so the dashboard is usable before the backend
 * is built. Replace with Supabase Auth (server-verified session) before this
 * goes anywhere near production. Do not store anything sensitive here.
 */
(function () {
  'use strict';

  // Demo password — placeholder only. Real auth replaces this entirely.
  var DEMO_PASSWORD = 'basso2026';
  var SESSION_KEY = 'basso_admin_ok';
  var MAX_PDF_BYTES = 2 * 1024 * 1024; // ~2MB demo cap (localStorage). Supabase Storage removes this.

  var $ = function (id) { return document.getElementById(id); };

  /* ── Auth gate (demo) ─────────────────────────────────────────────── */
  function isLoggedIn() { return sessionStorage.getItem(SESSION_KEY) === '1'; }

  function showDash(on) {
    $('login').style.display = on ? 'none' : '';
    $('dash').hidden = !on;
    if (on) renderList();
  }

  function tryLogin() {
    var pw = $('pw').value;
    if (pw === DEMO_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      $('loginErr').textContent = '';
      $('pw').value = '';
      showDash(true);
    } else {
      $('loginErr').textContent = 'Wrong password.';
    }
  }

  $('loginBtn').addEventListener('click', tryLogin);
  $('pw').addEventListener('keydown', function (e) { if (e.key === 'Enter') tryLogin(); });
  $('logoutBtn').addEventListener('click', function () {
    sessionStorage.removeItem(SESSION_KEY);
    showDash(false);
  });

  /* ── Publish ──────────────────────────────────────────────────────── */
  function msg(text, kind) {
    var el = $('formMsg');
    el.textContent = text || '';
    el.className = kind || '';
  }

  function readFileAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(new Error('read failed')); };
      r.readAsDataURL(file);
    });
  }

  $('newsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var title = $('f-title').value.trim();
    var date = $('f-date').value;
    var category = $('f-category').value.trim();
    var excerpt = $('f-excerpt').value.trim();
    var file = $('f-pdf').files[0];

    if (!title || !date) { msg('Title and date are required.', 'err'); return; }
    if (!file) { msg('Please choose a PDF.', 'err'); return; }
    if (file.type !== 'application/pdf') { msg('File must be a PDF.', 'err'); return; }
    if (file.size > MAX_PDF_BYTES) {
      msg('PDF over 2 MB. (Demo cap — the Supabase Storage backend removes this.)', 'err');
      return;
    }

    var btn = $('publishBtn');
    btn.disabled = true; msg('Publishing…');
    readFileAsDataURL(file).then(function (dataUrl) {
      return NewsStore.add({
        title: title,
        date: date,
        category: category,
        excerpt: excerpt,
        pdf: dataUrl,
        pdfName: file.name
      });
    }).then(function () {
      e.target.reset();
      msg('Published ✓', 'ok');
      setTimeout(function () { msg(''); }, 2600);
    }).catch(function () {
      msg('Something went wrong.', 'err');
    }).then(function () { btn.disabled = false; });
  });

  /* ── List + delete ────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderList() {
    var wrap = $('adminList');
    var items = NewsStore.getAll();
    $('count').textContent = items.length ? '· ' + items.length : '';
    if (!items.length) {
      wrap.innerHTML = '<div class="empty">No news published yet.</div>';
      return;
    }
    wrap.innerHTML = items.map(function (n) {
      var pdf = /^data:application\/pdf/i.test(n.pdf) || /^https?:\/\//i.test(n.pdf)
        ? ' · <a href="' + n.pdf + '" target="_blank" rel="noopener">PDF</a>' : '';
      return '<div class="news-row">' +
        '<div class="meta"><div class="t">' + esc(n.title) + '</div>' +
        '<div class="d">' + esc(n.date) + (n.category ? ' · ' + esc(n.category) : '') + pdf + '</div></div>' +
        '<button class="row-del" data-id="' + esc(n.id) + '">Delete</button></div>';
    }).join('');
    wrap.querySelectorAll('.row-del').forEach(function (b) {
      b.addEventListener('click', function () {
        if (confirm('Delete this news item?')) NewsStore.remove(b.getAttribute('data-id'));
      });
    });
  }

  // Live: re-render when the store changes (this tab or another tab)
  NewsStore.subscribe(function () { if (isLoggedIn()) renderList(); });

  /* ── Init ─────────────────────────────────────────────────────────── */
  showDash(isLoggedIn());
})();
