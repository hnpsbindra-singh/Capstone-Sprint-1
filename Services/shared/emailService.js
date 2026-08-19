// Shared Brevo Email Service
// Mirrors Spring Boot EmailService.java logic using Brevo REST API
const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@resqflow.org';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'ResQFlow';
const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

async function sendEmail(to, subject, htmlContent) {
  try {
    await axios.post(
      BREVO_API,
      {
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`[Email] Sent "${subject}" to ${to}`);
  } catch (err) {
    console.error(`[Email] Failed to send "${subject}" to ${to}:`, err.response?.data || err.message);
  }
}

async function sendWelcome(to, name) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #1565C0;">Welcome to ResQFlow, ${name}!</h2>
      <p>Your account has been successfully created and verified.</p>
      <p>You can now log in and start using the ResQFlow Flood Rescue System to report floods, donate resources, or coordinate rescue operations.</p>
      <p style="color: #666; font-size: 12px;">Stay safe and be prepared.</p>
      <p><strong>— The ResQFlow Team</strong></p>
    </div>`;
  await sendEmail(to, 'Welcome to ResQFlow - Account Created', html);
}

async function sendOtp(to, otp) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #1565C0;">Your OTP Code</h2>
      <p>Your One Time Password for ResQFlow is:</p>
      <div style="background: #f4f4f4; padding: 16px; text-align: center; border-radius: 8px; margin: 16px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1565C0;">${otp}</span>
      </div>
      <p style="color: #e53935;"><strong>This OTP is valid for 5 minutes only.</strong></p>
      <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
    </div>`;
  await sendEmail(to, 'Your ResQFlow OTP Code', html);
}

async function sendAcceptance(to) {
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

async function sendDelivered(to) {
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

module.exports = { sendWelcome, sendOtp, sendAcceptance, sendDelivered };
