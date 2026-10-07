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

async function sendDonationConfirmationEmail(to, { itemName, quantity, ngoTitle, ngoDeliveryAddress, ngoContactEmail, ngoContactPhone }) {
  const emailSubject = `ResQFlow: Donation Confirmation & Delivery Details (${itemName})`;
  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0284c7; margin: 0 0 6px 0;">🎉 Donation Registered Successfully!</h2>
        <p style="color: #64748b; font-size: 14px; margin: 0;">Thank you for stepping up to help flood-affected communities.</p>
      </div>
      
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; margin: 16px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Donation Summary</h3>
        <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Contributed Item:</strong> ${itemName}</p>
        <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Quantity:</strong> ${quantity} units</p>
        <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>NGO Initiative:</strong> ${ngoTitle}</p>
      </div>

      <div style="background: #f0fdf4; border: 1.5px solid #86efac; padding: 18px; margin: 20px 0; border-radius: 8px;">
        <h3 style="margin: 0 0 8px 0; color: #166534; font-size: 16px; display: flex; align-items: center; gap: 6px;">
          📦 Where to Send Relief Supplies (Drop-off Address)
        </h3>
        <p style="margin: 6px 0; color: #14532d; font-size: 15px; font-weight: 700; line-height: 1.4;">
          ${ngoDeliveryAddress}
        </p>
        <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #86efac; font-size: 13px; color: #166534;">
          <p style="margin: 3px 0;"><strong>NGO Contact Email:</strong> <a href="mailto:${ngoContactEmail}" style="color: #0284c7; font-weight: 600;">${ngoContactEmail}</a></p>
          ${ngoContactPhone ? `<p style="margin: 3px 0;"><strong>NGO Contact Phone:</strong> ${ngoContactPhone}</p>` : ''}
        </div>
      </div>

      <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 20px;">
        <strong>Next Steps:</strong> Please dispatch or bring your relief materials to the drop-off address above. Once the NGO team receives the supplies, they will mark your donation as <em>Delivered</em> on the platform.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">ResQFlow Emergency Disaster Relief Network</p>
    </div>
  `;

  await sendEmail(to, emailSubject, emailHtml);
}

module.exports = {
  sendEmail,
  sendDonationConfirmationEmail,
};
