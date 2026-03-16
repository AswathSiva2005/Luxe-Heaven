const nodemailer = require("nodemailer");

// Uses environment variables for configuration
// If not configured, it will log to console instead of sending.
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL;

const transporter = (function () {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    console.warn(
      "[mailer] SMTP not configured. Emails will be logged instead of sent."
    );
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465, // true for 465, false for other ports
    auth: { user, pass },
  });
})();

async function sendAdminNotification(subject, html) {
  try {
    if (!ADMIN_NOTIFY_EMAIL) {
      console.warn("[mailer] ADMIN_NOTIFY_EMAIL not set. Cannot send notification.");
      return;
    }

    if (!transporter) {
      console.log("[mailer] Email would be sent with subject:", subject);
      console.log("[mailer] Content:", html);
      return;
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `noreply@${process.env.SMTP_HOST || "localhost"}`,
      to: ADMIN_NOTIFY_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error("[mailer] Failed to send email:", err);
  }
}

async function sendMail({ to, subject, html }) {
  try {
    if (!transporter) {
      console.log("[mailer] Email would be sent to:", to);
      console.log("[mailer] Subject:", subject);
      console.log("[mailer] Content:", html);
      return;
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `noreply@${process.env.SMTP_HOST || "localhost"}`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("[mailer] Failed to send email:", err);
  }
}

module.exports = {
  sendAdminNotification,
  sendMail,
};
