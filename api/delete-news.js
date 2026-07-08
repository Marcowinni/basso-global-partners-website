// Vercel serverless function — remove a news item from Vercel Blob storage.
// Requires ADMIN_KEY (server-side secret) via the x-admin-key header — same
// gate as /api/publish-news.
const { list, put, del } = require('@vercel/blob');

const NEWS_PATH = 'news/news.json';

async function readNews() {
  const { blobs } = await list({ prefix: NEWS_PATH });
  const entry = blobs.find((b) => b.pathname === NEWS_PATH);
  if (!entry) return [];
  const res = await fetch(entry.url + '?t=' + Date.now());
  return res.ok ? await res.json() : [];
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
  const id = String((body && body.id) || '').trim();
  if (!id) return res.status(400).json({ ok: false, error: 'Missing id.' });

  try {
    const items = await readNews();
    const target = items.find((n) => n.id === id);
    const remaining = items.filter((n) => n.id !== id);

    await put(NEWS_PATH, JSON.stringify(remaining), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60
    });

    if (target && target.pdf) {
      try { await del(target.pdf); } catch (e) { /* best-effort cleanup, ignore */ }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'Could not delete right now.' });
  }
};
