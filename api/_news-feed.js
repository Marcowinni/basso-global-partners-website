// Read/write of the news index (news/news.json in Vercel Blob), shared by the
// news endpoints. Underscore prefix keeps Vercel from exposing this as an
// endpoint.
const { list, put } = require('@vercel/blob');

const NEWS_PATH = 'news/news.json';
const BACKUP_PREFIX = 'news/backups/';

// Throws instead of returning [] on a failed read: publish/delete write the
// result back, so treating a transient Blob error as "empty feed" would wipe
// every published item.
async function readNews() {
  const { blobs } = await list({ prefix: NEWS_PATH });
  const entry = blobs.find((b) => b.pathname === NEWS_PATH);
  if (!entry) return [];

  const res = await fetch(entry.url + '?t=' + Date.now());
  if (!res.ok) throw new Error('news.json read failed: HTTP ' + res.status);
  const items = await res.json();
  if (!Array.isArray(items)) throw new Error('news.json is not an array');
  return items;
}

// Copies the version being replaced to news/backups/ first, so a bad write
// can be undone by restoring the latest backup.
async function writeNews(items, previous) {
  if (previous.length) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await put(BACKUP_PREFIX + 'news-' + stamp + '.json', JSON.stringify(previous), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json'
    });
  }

  await put(NEWS_PATH, JSON.stringify(items), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60
  });
}

module.exports = { readNews, writeNews };
