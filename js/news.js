/* Basso Global Partners — public News page rendering.
 * Reads from NewsStore (Vercel Blob-backed, fetched over the network) and
 * renders cards into #newsGrid. */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtDate(d) {
    if (!d) return '';
    var m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(d);
    if (!m) return esc(d);
    var months = ['January','February','March','April','May','June','July',
                  'August','September','October','November','December'];
    var month = months[parseInt(m[2], 10) - 1] || '';
    var day = m[3] ? (parseInt(m[3], 10) + ' ') : '';
    return (day + month + ' ' + m[1]).trim();
  }

  // PDFs open through our own viewer page rather than the raw Blob URL, so the
  // tab shows the article title instead of the PDF's exporter metadata.
  function viewerHref(n) {
    if (!n.pdf || !n.id) return '';
    return 'news-pdf.html?id=' + encodeURIComponent(n.id);
  }

  function cardHTML(n) {
    var href = viewerHref(n);
    var tag = n.category ? '<div class="news-tag">' + esc(n.category) + '</div>' : '';
    var date = n.date ? '<div class="news-date">' + esc(fmtDate(n.date)) + '</div>' : '';
    var excerpt = n.excerpt ? '<div class="news-excerpt">' + esc(n.excerpt) + '</div>' : '';
    var link = href
      ? '<a class="news-link" href="' + href + '" target="_blank" rel="noopener">Read PDF ↗</a>'
      : '';
    return '<div class="news-card">' + tag + date +
      '<div class="news-title">' + esc(n.title) + '</div>' + excerpt + link + '</div>';
  }

  function render() {
    var grid = document.getElementById('newsGrid');
    var empty = document.getElementById('newsEmpty');
    if (!grid || !window.NewsStore) return;
    NewsStore.getPublished().then(function (items) {
      if (!items.length) {
        grid.innerHTML = '';
        grid.style.display = 'none';
        if (empty) empty.style.display = '';
        return;
      }
      if (empty) empty.style.display = 'none';
      grid.style.display = '';
      grid.innerHTML = items.map(cardHTML).join('');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
