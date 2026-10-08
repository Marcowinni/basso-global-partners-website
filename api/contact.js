// Vercel serverless function — contact form → email via SMTP.
// Required env: SMTP_* (see _smtp.js), CONTACT_TO
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

  const firstName = clean(body.firstName, 100);
  const lastName  = clean(body.lastName, 100);
  const org       = clean(body.organization, 200);
  const email     = clean(body.email, 200);
  const inquiry   = clean(body.inquiryType, 120) || 'General Inquiry';
  const message   = clean(body.message, 5000);

  if (!isEmail(email) || message.length < 2) {
    return res.status(400).json({ ok: false, error: 'Invalid email or empty message.' });
  }

  const to = process.env.CONTACT_TO;
  const transporter = createTransport();
  if (!transporter || !to) {
    console.error('contact: mail service not configured (SMTP_* / CONTACT_TO missing)');
    return res.status(500).json({ ok: false, error: 'Mail service not configured.' });
  }

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
      from: mailFrom(),
      to: to,
      replyTo: name + ' <' + email + '>',
      subject: 'Website inquiry — ' + inquiry,
      text: text
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('contact: send failed — inquiry NOT delivered:', describeSmtpError(err));
    return res.status(502).json({ ok: false, error: 'Could not send right now.' });
  }
};
