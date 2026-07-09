// Vercel serverless function — newsletter signup → email via SMTP.
// Same SMTP creds as /api/contact.js. Sends straight to IR, no mail-client
// round-trip for the visitor.
// Required env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// Optional env: NEWSLETTER_TO (defaults to ir@bassoglobalpartners.com), MAIL_FROM
const nodemailer = require('nodemailer');

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

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to   = process.env.NEWSLETTER_TO || 'ir@bassoglobalpartners.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  if (!host || !user || !pass) {
    return res.status(500).json({ ok: false, error: 'Mail service not configured.' });
  }

  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: { user: user, pass: pass }
  });

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || ('Basso Website <' + user + '>'),
      to: to,
      replyTo: email,
      subject: 'Newsletter subscription request',
      text: 'Please add the following address to the Basso quarterly newsletter:\n\n' + email + '\n'
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'Could not send right now.' });
  }
};
