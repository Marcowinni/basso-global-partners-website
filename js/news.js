/* Basso Global Partners — public News page rendering.
 * Reads from NewsStore, renders cards into #newsGrid, and re-renders live
 * whenever NewsStore changes (admin publish → appears here without reload). */
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

  // Only allow safe hrefs (PDF data URLs today, http(s) URLs once on Supabase)
  function safeHref(url) {
    if (!url) return '';
    if (/^data:application\/pdf/i.test(url)) return url;
    if (/^https?:\/\//i.test(url)) return url;
    return '';
  }

  function cardHTML(n) {
    var href = safeHref(n.pdf);
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
    if (!grid) return;
    var items = window.NewsStore ? NewsStore.getPublished() : [];
    if (!items.length) {
      grid.innerHTML = '';
      grid.style.display = 'none';
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';
    grid.style.display = '';
    grid.innerHTML = items.map(cardHTML).join('');
  }

  if (window.NewsStore) NewsStore.subscribe(render);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
