// Vercel serverless function — one-off migration: give already-published PDFs
// the same title-based blob pathname that /api/publish-news now assigns on
// publish. Older items were stored under the opaque id (n_abc123.pdf), so a
// reader saving the file got that as the filename.
//
// Safe to run repeatedly: items already on the right pathname are skipped.
// Pass { dryRun: true } to see the planned renames without touching anything.
//
// Requires ADMIN_KEY — same gate as /api/publish-news.
const { list, put, rename } = require('@vercel/blob');
const { pdfPathname } = require('./_slug');

const NEWS_PATH = 'news/news.json';

async function readNews() {
  const { blobs } = await list({ prefix: NEWS_PATH });
  const entry = blobs.find((b) => b.pathname === NEWS_PATH);
  if (!entry) return [];
  const res = await fetch(entry.url + '?t=' + Date.now());
  return res.ok ? await res.json() : [];
}

function writeNews(items) {
  return put(NEWS_PATH, JSON.stringify(items), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60
  });
}

function currentPathname(pdfUrl) {
  try {
    return decodeURIComponent(new URL(pdfUrl).pathname).replace(/^\//, '');
  } catch (e) {
    return '';
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || req.headers['x-admin-key'] !== adminKey) {
    return res.status(401).json({ ok: false, error: 'Not authorized.' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const dryRun = !!(body && body.dryRun);

  try {
    const items = await readNews();
    const report = [];

    for (const item of items) {
      if (!item.pdf || !item.id) continue;

      const from = currentPathname(item.pdf);
      const to = pdfPathname(item.title, item.id);
      if (!from || from === to) continue;

      if (dryRun) {
        report.push({ id: item.id, from: from, to: to, status: 'would-rename' });
        continue;
      }

      try {
        const renamed = await rename(item.pdf, to, {
          access: 'public',
          addRandomSuffix: false,
          contentType: 'application/pdf'
        });
        item.pdf = renamed.url;
        // Persist per item rather than once at the end — a mid-loop failure
        // would otherwise leave the feed pointing at blobs that no longer exist.
        await writeNews(items);
        report.push({ id: item.id, from: from, to: to, status: 'renamed' });
      } catch (err) {
        report.push({ id: item.id, from: from, to: to, status: 'failed', error: (err && err.message) || 'rename failed' });
      }
    }

    return res.status(200).json({ ok: true, dryRun: dryRun, changed: report.length, items: report });
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'Could not rename right now.' });
  }
};
