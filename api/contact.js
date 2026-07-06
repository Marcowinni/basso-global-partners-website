// Vercel serverless function — contact form → email via SMTP.
// Provider-agnostic: set the SMTP creds as Vercel env vars, no code change.
// Required env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO
// Optional env: MAIL_FROM (defaults to "Basso Website <SMTP_USER>")
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

  const firstName = clean(body.firstName, 100);
  const lastName  = clean(body.lastName, 100);
  const org       = clean(body.organization, 200);
  const email     = clean(body.email, 200);
  const inquiry   = clean(body.inquiryType, 120) || 'General Inquiry';
  const message   = clean(body.message, 5000);

  if (!isEmail(email) || message.length < 2) {
    return res.status(400).json({ ok: false, error: 'Invalid email or empty message.' });
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to   = process.env.CONTACT_TO;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  if (!host || !user || !pass || !to) {
    return res.status(500).json({ ok: false, error: 'Mail service not configured.' });
  }

  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: { user: user, pass: pass }
  });

  const name = (firstName + ' ' + lastName).trim() || '(no name given)';
  const text =
    'New contact form submission — bassoglobalpartners.com\n\n' +
    'Name: ' + name + '\n' +
    'Organization: ' + org + '\n' +
    'Email: ' + email + '\n' +
    'Inquiry type: ' + inquiry + '\n\n' +
    'Message:\n' + message + '\n';

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || ('Basso Website <' + user + '>'),
      to: to,
      replyTo: name + ' <' + email + '>',
      subject: 'Website inquiry — ' + inquiry,
      text: text
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'Could not send right now.' });
  }
};
