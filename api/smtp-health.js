// Vercel cron (monthly, see "crons" in vercel.json) — checks that the
// contact-form SMTP login still works. The form is low-traffic and Brevo SMTP
// keys can expire after a stretch without use, so without this a dead key
// would only show up when a real inquiry fails. With HEALTH_TO set it also
// sends a short status mail, which both confirms delivery and counts as use.
// Auth: Vercel sends "Authorization: Bearer <CRON_SECRET>" with cron requests;
// without CRON_SECRET set this endpoint refuses every call.
// Env: CRON_SECRET, SMTP_* (see _smtp.js), HEALTH_TO (optional)
const { createTransport, mailFrom, describeSmtpError } = require('./_smtp');

module.exports = async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== 'Bearer ' + secret) {
    return res.status(401).json({ ok: false });
  }

  const transporter = createTransport();
  if (!transporter) {
    console.error('smtp-health: mail service not configured (SMTP_* missing)');
    return res.status(500).json({ ok: false });
  }

  try {
    await transporter.verify();
    if (process.env.HEALTH_TO) {
      await transporter.sendMail({
        from: mailFrom(),
        to: process.env.HEALTH_TO,
        subject: 'Basso website — monthly mail check OK',
        text: 'The contact-form mail login works (' + new Date().toISOString() + ').\n' +
          'No action needed. If this monthly mail stops arriving, check SMTP_PASS in Vercel.\n'
      });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('smtp-health: SMTP check FAILED — the contact form cannot send:', describeSmtpError(err));
    return res.status(502).json({ ok: false });
  }
};
