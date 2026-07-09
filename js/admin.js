/* Basso Global Partners — News console (publishes to Vercel Blob storage,
 * no database). Publishing is real and goes live for every site visitor —
 * protected server-side by ADMIN_KEY (see /api/blob-upload-token,
 * /api/publish-news, /api/delete-news). The key is entered here and sent per
 * request; it's kept in sessionStorage only so it doesn't need retyping for
 * every action in the same tab.
 *
 * PDFs upload directly from the browser to Vercel Blob (bypasses the ~4.5 MB
 * request-body limit Vercel enforces on serverless functions) — pin the esm.sh
 * version to match the @vercel/blob version in package.json when bumping. */
import { upload } from 'https://esm.sh/@vercel/blob@2.6.0/client';

(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var MAX_PDF_BYTES = 200 * 1024 * 1024;
  var KEY_STORE = 'basso_admin_key';

  (function restoreKey() {
    var el = $('admin-key');
    var saved = sessionStorage.getItem(KEY_STORE);
    if (el && saved) el.value = saved;
  })();

  function adminKey() {
    var el = $('admin-key');
    var v = el ? el.value.trim() : '';
    if (v) sessionStorage.setItem(KEY_STORE, v);
    return v;
  }

  function msg(text, kind) {
    var el = $('formMsg');
    el.textContent = text || '';
    el.className = kind || '';
  }

  function genId() {
    return 'n_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  /* ── Publish ──────────────────────────────────────────────────────── */
  $('newsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var key = adminKey();
    var title = $('f-title').value.trim();
    var date = $('f-date').value;
    var category = $('f-category').value.trim();
    var excerpt = $('f-excerpt').value.trim();
    var file = $('f-pdf').files[0];

    if (!key) { msg('Admin key required.', 'err'); return; }
    if (!title || !date) { msg('Title and date are required.', 'err'); return; }
    if (!file) { msg('Please choose a PDF.', 'err'); return; }
    if (file.type !== 'application/pdf') { msg('File must be a PDF.', 'err'); return; }
    if (file.size > MAX_PDF_BYTES) { msg('PDF over 200 MB.', 'err'); return; }

    var id = genId();
    var btn = $('publishBtn');
    btn.disabled = true; msg('Uploading…');

    upload('news/pdfs/' + id + '.pdf', file, {
      access: 'public',
      contentType: 'application/pdf',
      handleUploadUrl: '/api/blob-upload-token',
      headers: { 'x-admin-key': key },
      multipart: true // chunked + per-part retry — matters at this file size
    }).then(function (blob) {
      msg('Publishing…');
      return NewsStore.add({
        id: id,
        title: title,
        date: date,
        category: category,
        excerpt: excerpt,
        pdfUrl: blob.url,
        pdfName: file.name
      }, key);
    }).then(function () {
      $('newsForm').reset();
      $('admin-key').value = key; // keep the key filled in for the next publish
      msg('Published ✓ — live on the site now', 'ok');
      renderList();
      setTimeout(function () { msg(''); }, 3200);
    }).catch(function (err) {
      // The upload() SDK call swallows our /api/blob-upload-token error body and
      // always throws this generic message on a non-2xx response — in practice
      // that only happens here on a wrong admin key, since path/content-type are
      // fixed by this form.
      var authErr = /not authorized|failed to retrieve the client token/i.test((err && err.message) || '');
      msg(authErr ? 'Wrong admin key.' : 'Something went wrong.', 'err');
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
    NewsStore.getAll().then(function (items) {
      $('count').textContent = items.length ? '· ' + items.length : '';
      if (!items.length) {
        wrap.innerHTML = '<div class="empty">No news published yet.</div>';
        return;
      }
      wrap.innerHTML = items.map(function (n) {
        var pdf = n.pdf ? ' · <a href="' + esc(n.pdf) + '" target="_blank" rel="noopener">PDF</a>' : '';
        return '<div class="news-row">' +
          '<div class="meta"><div class="t">' + esc(n.title) + '</div>' +
          '<div class="d">' + esc(n.date) + (n.category ? ' · ' + esc(n.category) : '') + pdf + '</div></div>' +
          '<button class="row-del" data-id="' + esc(n.id) + '">Delete</button></div>';
      }).join('');
      wrap.querySelectorAll('.row-del').forEach(function (b) {
        b.addEventListener('click', function () {
          if (!confirm('Delete this news item? This removes it from the live site.')) return;
          var key = adminKey();
          if (!key) { alert('Admin key required.'); return; }
          NewsStore.remove(b.getAttribute('data-id'), key).then(renderList).catch(function () {
            alert('Delete failed — check the admin key.');
          });
        });
      });
    });
  }

  /* ── Init ─────────────────────────────────────────────────────────── */
  renderList();
})();
