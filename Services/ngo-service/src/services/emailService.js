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

async function sendAcceptanceEmail(to) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2E7D32;">Donation Accepted!</h2>
      <p>Great news! Your donation has been accepted by the NGO partner.</p>
      <p>The NGO will be coordinating pickup and delivery of your donated resources to affected flood victims.</p>
      <p>Thank you for your generosity and contribution to disaster relief efforts.</p>
      <p><strong>— The ResQFlow Team</strong></p>
    </div>`;
  await sendEmail(to, 'ResQFlow - Your Donation Has Been Accepted', html);
}

async function sendDeliveredEmail(to) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2E7D32;">Donation Successfully Delivered!</h2>
      <p>Your donated resources have been successfully delivered to flood victims in need.</p>
      <p>Your support is making a real difference in the lives of disaster-affected communities.</p>
      <p>Thank you from all of us at ResQFlow and the communities you have helped.</p>
      <p><strong>— The ResQFlow Team</strong></p>
    </div>`;
  await sendEmail(to, 'ResQFlow - Your Donation Has Been Delivered', html);
}

module.exports = {
  sendEmail,
  sendAcceptanceEmail,
  sendDeliveredEmail,
};
