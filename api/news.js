// Vercel serverless function — public news feed, backed by Vercel Blob storage
// (no database). Anyone can read this; publishing/deleting requires ADMIN_KEY
// via /api/publish-news and /api/delete-news.
const { readNews } = require('./_news-feed');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const items = await readNews();
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(items);
  } catch (err) {
    // Not cached: a transient Blob error must not be served as an empty feed.
    console.error('news: feed read failed:', err);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Could not load news right now.' });
  }
};
