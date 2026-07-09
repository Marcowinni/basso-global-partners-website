// Vercel serverless function — issues short-lived client upload tokens for
// direct browser → Vercel Blob uploads. This bypasses the ~4.5 MB request-body
// limit Vercel enforces on serverless functions, so scanned PDF reports up to
// MAX_UPLOAD_BYTES make it through (the function never sees the file bytes).
// Requires ADMIN_KEY, same gate as /api/publish-news — the token is scoped to
// news/pdfs/ only.
const { handleUpload } = require('@vercel/blob/client');

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const PATH_PREFIX = 'news/pdfs/';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || req.headers['x-admin-key'] !== adminKey) {
    return res.status(401).json({ error: 'Not authorized.' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  try {
    const jsonResponse = await handleUpload({
      body: body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(PATH_PREFIX)) {
          throw new Error('Invalid upload path.');
        }
        return {
          allowedContentTypes: ['application/pdf'],
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: false
        };
      }
    });
    return res.status(200).json(jsonResponse);
  } catch (err) {
    return res.status(400).json({ error: (err && err.message) || 'Could not issue upload token.' });
  }
};
