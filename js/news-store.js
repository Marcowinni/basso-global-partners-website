/* Basso Global Partners — News data layer.
 *
 * FRONTEND-ONLY for now: persists to localStorage so the admin dashboard and
 * the public News page work end-to-end without a backend yet.
 *
 * SWAP TO SUPABASE LATER: replace the bodies of the methods below. The public
 * interface (getPublished / getAll / add / remove / subscribe) stays identical,
 * so news.js and admin.js do NOT change. Each method notes its Supabase target.
 *
 * Realtime today = the browser `storage` event (fires in OTHER tabs): publish in
 * the admin tab → the public News tab updates instantly. With Supabase this
 * becomes a Realtime postgres_changes subscription (true server push).
 */
(function () {
  'use strict';

  var KEY = 'basso_news_v1';
  var listeners = new Set();

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function write(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    notify();
  }
  function notify() {
    listeners.forEach(function (fn) { try { fn(); } catch (e) {} });
  }
  function byDateDesc(a, b) {
    return (b.date || '').localeCompare(a.date || '') || (b.created || 0) - (a.created || 0);
  }
  function genId() {
    return 'n_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  // Cross-tab realtime (placeholder for Supabase Realtime channel)
  window.addEventListener('storage', function (e) { if (e.key === KEY) notify(); });

  window.NewsStore = {
    /* → Supabase: from('news').select('*').eq('published',true).order('date',{ascending:false}) */
    getPublished: function () { return read().filter(function (n) { return n.published; }).sort(byDateDesc); },

    /* → Supabase: from('news').select('*').order('date',{ascending:false})  (admin, RLS-protected) */
    getAll: function () { return read().sort(byDateDesc); },

    /* → Supabase: upload PDF to Storage bucket, then from('news').insert({...,pdf:publicUrl}) */
    add: function (item) {
      var items = read();
      items.push(Object.assign({
        id: genId(),
        published: true,
        created: Date.now()
      }, item));
      write(items);
      return Promise.resolve();
    },

    /* → Supabase: storage.remove([path]) + from('news').delete().eq('id',id) */
    remove: function (id) { write(read().filter(function (n) { return n.id !== id; })); },

    /* → Supabase: supabase.channel('news').on('postgres_changes',{event:'*',table:'news'},cb).subscribe() */
    subscribe: function (fn) { listeners.add(fn); return function () { listeners.delete(fn); }; }
  };
})();
