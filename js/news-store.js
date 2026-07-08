/* Basso Global Partners — News data layer.
 *
 * Backed by Vercel Blob storage via serverless endpoints — no database, no
 * localStorage. The feed is one JSON file (news/news.json in Blob) served
 * through GET /api/news; publishing/deleting go through ADMIN_KEY-gated
 * endpoints that write to Blob. Same public interface as before
 * (getPublished / getAll / add / remove), so news.js only needed to switch
 * from sync to async (fetch returns a Promise).
 */
(function () {
  'use strict';

  function byDateDesc(a, b) {
    return (b.date || '').localeCompare(a.date || '') || (b.created || 0) - (a.created || 0);
  }

  function postJSON(url, payload, adminKey) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey || '' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (!r.ok || !data.ok) throw new Error((data && data.error) || 'Request failed');
        return data;
      });
    });
  }

  window.NewsStore = {
    getPublished: function () {
      return fetch('/api/news')
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (items) { return (items || []).slice().sort(byDateDesc); })
        .catch(function () { return []; });
    },

    getAll: function () { return window.NewsStore.getPublished(); },

    add: function (item, adminKey) { return postJSON('/api/publish-news', item, adminKey); },

    remove: function (id, adminKey) { return postJSON('/api/delete-news', { id: id }, adminKey); }
  };
})();
