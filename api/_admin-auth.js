// ADMIN_KEY check shared by every write endpoint. Underscore prefix keeps
// Vercel from exposing this as an endpoint.
const crypto = require('crypto');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest();
}

// Hashing both sides gives equal-length buffers (timingSafeEqual requires
// that) so the comparison leaks neither the key nor its length via timing.
// Fails closed when ADMIN_KEY is unset.
function isAdmin(req) {
  const expected = process.env.ADMIN_KEY;
  const given = req.headers['x-admin-key'];
  if (!expected || typeof given !== 'string' || !given) return false;
  return crypto.timingSafeEqual(sha256(given), sha256(expected));
}

module.exports = { isAdmin };
