const axios = require('axios');
const config = require('../config/env');

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

async function sendEmail(to, subject, htmlContent) {
  if (!config.brevo.apiKey) {
    console.warn(`[Email Skipped] BREVO_API_KEY is not set. Email "${subject}" to ${to} was not sent.`);
    return;
  }

  try {
    await axios.post(
      BREVO_API,
      {
        sender: {
          name: config.brevo.senderName,
          email: config.brevo.senderEmail,
        },
        to: [{ email: to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          'api-key': config.brevo.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
    console.log(`[Email] Sent "${subject}" → ${to}`);
  } catch (err) {
    console.error(`[Email Error] Failed to send "${subject}" to ${to}:`, err.response?.data || err.message);
  }
}

async function sendWelcomeEmail(to, name) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #1565C0;">Welcome to ResQFlow, ${name}!</h2>
      <p>Your account has been successfully created and verified.</p>
      <p>You can now log in and start using the ResQFlow Flood Rescue System.</p>
      <p><strong>— The ResQFlow Team</strong></p>
    </div>`;
  await sendEmail(to, 'Welcome to ResQFlow', html);
}

async function sendOtpEmail(to, otp) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #1565C0;">Your OTP Code</h2>
      <p>Your One Time Password for ResQFlow is:</p>
      <div style="background: #f4f4f4; padding: 16px; text-align: center; border-radius: 8px; margin: 16px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1565C0;">${otp}</span>
      </div>
      <p style="color: #e53935;"><strong>Valid for 5 minutes only.</strong></p>
    </div>`;
  await sendEmail(to, 'Your ResQFlow OTP Code', html);
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOtpEmail,
};
