// Vercel serverless function — publish a news item to Vercel Blob storage
// (no database; the PDF and the news/news.json index both live in Blob).
// Requires ADMIN_KEY (server-side secret) via the x-admin-key header — this
// endpoint writes to a page every visitor sees, so it must not be open.
const { list, put } = require('@vercel/blob');

const NEWS_PATH = 'news/news.json';
const MAX_PDF_BYTES = 2 * 1024 * 1024;

function clean(v, max) {
  return String(v == null ? '' : v).trim().slice(0, max);
}

function genId() {
  return 'n_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

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
  body = body || {};

  const title = clean(body.title, 160);
  const date = clean(body.date, 20);
  const category = clean(body.category, 40);
  const excerpt = clean(body.excerpt, 320);
  const pdfName = clean(body.pdfName, 120);
  const pdfDataUrl = String(body.pdf || '');

  if (!title || !date) {
    return res.status(400).json({ ok: false, error: 'Title and date are required.' });
  }
  const m = /^data:application\/pdf;base64,(.+)$/.exec(pdfDataUrl);
  if (!m) {
    return res.status(400).json({ ok: false, error: 'A PDF file is required.' });
  }
  const pdfBuffer = Buffer.from(m[1], 'base64');
  if (pdfBuffer.length > MAX_PDF_BYTES) {
    return res.status(400).json({ ok: false, error: 'PDF over 2 MB.' });
  }

  try {
    const id = genId();
    const pdfBlob = await put('news/pdfs/' + id + '.pdf', pdfBuffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/pdf'
    });

    const items = await readNews();
    items.push({
      id: id,
      title: title,
      date: date,
      category: category,
      excerpt: excerpt,
      pdf: pdfBlob.url,
      pdfName: pdfName,
      created: Date.now()
    });

    await put(NEWS_PATH, JSON.stringify(items), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60
    });

    return res.status(200).json({ ok: true, id: id });
  } catch (err) {
    console.error('publish-news failed:', err && err.stack || err);
    return res.status(502).json({ ok: false, error: 'Could not publish right now.' });
  }
};
