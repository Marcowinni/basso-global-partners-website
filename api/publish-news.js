// Vercel serverless function — publish a news item to Vercel Blob storage
// (no database; the PDF and the news/news.json index both live in Blob).
// Requires ADMIN_KEY (server-side secret) via the x-admin-key header — this
// endpoint writes to a page every visitor sees, so it must not be open.
//
// The PDF itself is uploaded directly from the browser to Blob via
// /api/blob-upload-token (bypasses the function body-size limit) — this
// endpoint only ever receives small JSON metadata + the resulting blob URL.
const { rename } = require('@vercel/blob');
const { pdfPathname } = require('./_slug');
const { readNews, writeNews } = require('./_news-feed');
const { isAdmin } = require('./_admin-auth');

const PDF_URL_RE = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/news\/pdfs\/.+\.pdf$/i;

function clean(v, max) {
  return String(v == null ? '' : v).trim().slice(0, max);
}

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
  body = body || {};

  const id = clean(body.id, 40);
  const title = clean(body.title, 160);
  const date = clean(body.date, 20);
  const category = clean(body.category, 40);
  const excerpt = clean(body.excerpt, 320);
  const pdfName = clean(body.pdfName, 120);
  const pdfUrl = String(body.pdfUrl || '');

  if (!id || !title || !date) {
    return res.status(400).json({ ok: false, error: 'Title and date are required.' });
  }
  if (!PDF_URL_RE.test(pdfUrl)) {
    return res.status(400).json({ ok: false, error: 'Invalid PDF upload.' });
  }

  try {
    // Read first: if the feed can't be read, stop before touching anything.
    const items = await readNews();

    // Give the blob a title-based pathname so the reader's saved file is named
    // after the article. Cosmetic — never worth failing an otherwise good
    // publish, so a failure here keeps the upload URL as-is.
    let finalPdfUrl = pdfUrl;
    try {
      const renamed = await rename(pdfUrl, pdfPathname(title, id), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/pdf'
      });
      finalPdfUrl = renamed.url;
    } catch (e) {
      console.warn('publish-news: PDF rename failed, keeping upload URL:', e && e.message);
    }

    const updated = items.concat([{
      id: id,
      title: title,
      date: date,
      category: category,
      excerpt: excerpt,
      pdf: finalPdfUrl,
      pdfName: pdfName,
      created: Date.now()
    }]);

    await writeNews(updated, items);
    return res.status(200).json({ ok: true, id: id });
  } catch (err) {
    console.error('publish-news: failed:', err);
    return res.status(502).json({ ok: false, error: 'Could not publish right now.' });
  }
};
