/* Basso Global Partners — single-document viewer for news PDFs.
 *
 * Exists because Chrome's standalone PDF viewer takes the tab title from the
 * PDF's own /Title metadata — reports exported from PowerPoint/Word arrive
 * labelled "PowerPoint Presentation". Framing the PDF inside our own page puts
 * the article title in the tab and in a header bar instead. */
(function () {
  'use strict';

  // Mirrors the server-side check in /api/publish-news — the item comes from
  // our own admin-gated feed, but the URL still ends up in an iframe src.
  var PDF_URL_RE = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/news\/pdfs\/.+\.pdf$/i;

  function $(id) { return document.getElementById(id); }

  function fmtDate(d) {
    var m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(d || '');
    if (!m) return d || '';
    var months = ['January','February','March','April','May','June','July',
                  'August','September','October','November','December'];
    var day = m[3] ? (parseInt(m[3], 10) + ' ') : '';
    return (day + (months[parseInt(m[2], 10) - 1] || '') + ' ' + m[1]).trim();
  }

  function fail(text) {
    $('pdfMsg').textContent = text;
    $('pdfTitle').textContent = 'Document unavailable';
  }

  function show(item) {
    var parts = [item.category, fmtDate(item.date)].filter(Boolean);

    document.title = item.title + ' — Basso Global Partners';
    $('pdfTitle').textContent = item.title;
    $('pdfMeta').textContent = parts.join(' · ');

    var dl = $('pdfDownload');
    dl.href = item.pdf;
    dl.hidden = false;

    $('pdfMsg').hidden = true;
    $('pdfFrame').src = item.pdf;
    $('pdfFrame').hidden = false;
  }

  var id = new URLSearchParams(window.location.search).get('id');
  if (!id) { fail('No document selected.'); return; }

  window.NewsStore.getPublished().then(function (items) {
    var item = items.filter(function (n) { return n.id === id; })[0];
    if (!item) { fail('This document is no longer available.'); return; }
    if (!PDF_URL_RE.test(item.pdf || '')) { fail('This document could not be loaded.'); return; }
    show(item);
  }).catch(function () {
    fail('Could not load this document right now.');
  });
})();
