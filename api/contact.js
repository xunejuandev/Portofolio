// Vercel serverless function: POST /api/contact
// Sends the contact-form message to the owner's Gmail through Gmail SMTP.
// Needs env vars on Vercel: GMAIL_USER (the Gmail address) and GMAIL_APP_PASSWORD (16-char app password).
const nodemailer = require('nodemailer');

const LIMITS = { name: 100, email: 200, message: 3000 };
const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/;

// strip control characters (incl. CR/LF, which would allow header injection)
const oneLine = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(500).json({ success: false, message: 'Mail is not configured.' });
  }

  const body = req.body || {};

  // Honeypot: real visitors never tick this hidden box. Pretend success so bots move on.
  if (body.botcheck) return res.status(200).json({ success: true });

  const name = oneLine(body.name, LIMITS.name).replace(/["<>\\]/g, '');
  const email = oneLine(body.email, LIMITS.email);
  // message keeps its line breaks but loses other control characters
  const message = String(body.message ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, LIMITS.message);

  if (!name || !message || !EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, message: 'Please fill in every field with valid values.' });
  }

  const when = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' });

  try {
    await transporter.sendMail({
      from: `"${name} (${email})" <${process.env.GMAIL_USER}>`, // shows as: Alex Mercer (alex@company.com)
      to: process.env.GMAIL_USER,
      replyTo: `"${name}" <${email}>`,                           // the Reply button goes to the visitor
      subject: `Portfolio message from ${name}`,
      text: [
        'New message from your portfolio contact form',
        '--------------------------------------------',
        `Name:    ${name}`,
        `Email:   ${email}  (typed by the visitor, not verified)`,
        `Sent:    ${when} (WIB)`,
        '--------------------------------------------',
        '',
        message,
        '',
        '--------------------------------------------',
        'Press Reply to answer the visitor directly.',
      ].join('\n'),
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('sendMail failed:', err && err.message);
    return res.status(502).json({ success: false, message: 'Could not send the message. Please email me directly.' });
  }
};
