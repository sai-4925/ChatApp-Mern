const nodemailer = require('nodemailer');

const isConfigured = Boolean(
  process.env.EMAIL_HOST &&
  process.env.EMAIL_PORT &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASSWORD
);

const buildFromAddress = () => {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;

  const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
  const hostname = clientOrigin.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `ChatApp <no-reply@${hostname}>`;
};

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  : null;

const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    throw new Error('Email service is not configured');
  }

  await transporter.sendMail({
    from: buildFromAddress(),
    to,
    subject,
    text,
    html,
  });
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const frontendBaseUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const resetUrl = `${frontendBaseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

  const subject = 'Reset your ChatApp password';
  const text = `We received a request to reset your ChatApp password.\n\n` +
    `Click the link below to choose a new password:\n${resetUrl}\n\n` +
    `If you did not request a password reset, you can safely ignore this email.`;

  const html = `
    <p>We received a request to reset your ChatApp password.</p>
    <p><a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#ffffff;border-radius:8px;text-decoration:none;">Reset password</a></p>
    <p>If the button does not work, copy and paste the following link into your browser:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
  `;

  return sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  isConfigured,
};
