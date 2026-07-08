// Vercel serverless function — public news feed, backed by Vercel Blob storage
// (no database). Anyone can read this; publishing/deleting requires ADMIN_KEY
// via /api/publish-news and /api/delete-news.
const { list } = require('@vercel/blob');

const NEWS_PATH = 'news/news.json';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  try {
    const { blobs } = await list({ prefix: NEWS_PATH });
    const entry = blobs.find((b) => b.pathname === NEWS_PATH);
    if (!entry) return res.status(200).json([]);

    const fresh = await fetch(entry.url + '?t=' + Date.now());
    const items = fresh.ok ? await fresh.json() : [];
    return res.status(200).json(items);
  } catch (err) {
    return res.status(500).json({ error: 'Could not load news right now.' });
  }
};
