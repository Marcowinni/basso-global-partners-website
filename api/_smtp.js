// SMTP transport shared by the mail-sending endpoints (contact, newsletter,
// smtp-health). Underscore prefix keeps Vercel from exposing this as an
// endpoint. Provider-agnostic: set the creds as Vercel env vars, no code change.
// Env: SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASS,
//      MAIL_FROM (optional, defaults to "Basso Website <SMTP_USER>")
const nodemailer = require('nodemailer');

// Returns null when the SMTP env vars are missing.
function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: { user: user, pass: pass },
    // nodemailer's defaults wait minutes; fail inside the function's time
    // budget so the visitor gets a JSON error instead of a platform timeout.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });
}

function mailFrom() {
  return process.env.MAIL_FROM || ('Basso Website <' + process.env.SMTP_USER + '>');
}

// Error codes only — SMTP error messages can echo addresses, which must not
// end up in the logs.
function describeSmtpError(err) {
  if (!err) return 'unknown error';
  return [err.code, err.responseCode, err.command].filter(Boolean).join(' ') || err.name || 'error';
}

module.exports = { createTransport, mailFrom, describeSmtpError };
