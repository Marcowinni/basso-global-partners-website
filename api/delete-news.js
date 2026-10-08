// Vercel serverless function — remove a news item from Vercel Blob storage.
// Requires ADMIN_KEY (server-side secret) via the x-admin-key header — same
// gate as /api/publish-news.
const { del } = require('@vercel/blob');
const { readNews, writeNews } = require('./_news-feed');
const { isAdmin } = require('./_admin-auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ ok: false, error: 'Not authorized.' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const id = String((body && body.id) || '').trim();
  if (!id) return res.status(400).json({ ok: false, error: 'Missing id.' });

  try {
    const items = await readNews();
    const target = items.find((n) => n.id === id);
    if (!target) return res.status(200).json({ ok: true }); // already gone

    await writeNews(items.filter((n) => n.id !== id), items);

    if (target.pdf) {
      // Best-effort cleanup — the item is already gone from the feed.
      try { await del(target.pdf); } catch (e) {
        console.warn('delete-news: PDF cleanup failed for', id, e && e.message);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('delete-news: failed:', err);
    return res.status(502).json({ ok: false, error: 'Could not delete right now.' });
  }
};
