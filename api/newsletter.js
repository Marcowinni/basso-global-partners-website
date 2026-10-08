// Vercel serverless function — newsletter signup → email via SMTP.
// Same SMTP creds as /api/contact.js. Sends straight to IR, no mail-client
// round-trip for the visitor.
// Required env: SMTP_* (see _smtp.js)
// Optional env: NEWSLETTER_TO (defaults to ir@bassoglobalpartners.com)
const { createTransport, mailFrom, describeSmtpError } = require('./_smtp');

function clean(v, max) {
  return String(v == null ? '' : v).trim().slice(0, max);
}
function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  // Honeypot: bots fill this hidden field. Pretend success, send nothing.
  if (clean(body.company_url, 200)) {
    return res.status(200).json({ ok: true });
  }

  const email = clean(body.email, 200);
  if (!isEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email.' });
  }

  const to = process.env.NEWSLETTER_TO || 'ir@bassoglobalpartners.com';
  const transporter = createTransport();
  if (!transporter) {
    console.error('newsletter: mail service not configured (SMTP_* missing)');
    return res.status(500).json({ ok: false, error: 'Mail service not configured.' });
  }

  try {
    await transporter.sendMail({
      from: mailFrom(),
      to: to,
      replyTo: email,
      subject: 'Newsletter subscription request',
      text: 'Please add the following address to the Basso quarterly newsletter:\n\n' + email + '\n'
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('newsletter: send failed — signup NOT delivered:', describeSmtpError(err));
    return res.status(502).json({ ok: false, error: 'Could not send right now.' });
  }
};
