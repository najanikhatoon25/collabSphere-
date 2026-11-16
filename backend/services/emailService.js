const nodemailer = require("nodemailer");

const buildInvitationLink = ({ projectId, token }) => {
  const baseUrl = (process.env.APP_URL || "http://localhost:5173").replace(/\/$/, "");
  const fragment = new URLSearchParams({ projectId, token }).toString();
  return `${baseUrl}/invitations#${fragment}`;
};

const transporter = (() => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT || 587) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
})();

const sendInvitationEmail = async ({ to, projectName, projectId, token }) => {
  if (!transporter) {
    const error = new Error(
      "Email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in the backend environment."
    );
    error.code = "EMAIL_NOT_CONFIGURED";
    throw error;
  }

  const inviteLink = buildInvitationLink({ projectId, token });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: `Invitation to join ${projectName} on CollabSphere`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2 style="margin-bottom: 12px;">You have been invited to join ${projectName}</h2>
        <p>Hello,</p>
        <p>You have been invited to collaborate on a project in CollabSphere.</p>
        <p>
          <a href="${inviteLink}" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 16px; border-radius: 8px; text-decoration: none;">
            Accept invitation
          </a>
        </p>
        <p>Or use this link:</p>
        <p><a href="${inviteLink}">${inviteLink}</a></p>
        <p>If you did not expect this invitation, you can ignore this email.</p>
      </div>
    `,
  });

  return inviteLink;
};

module.exports = {
  buildInvitationLink,
  sendInvitationEmail,
};
