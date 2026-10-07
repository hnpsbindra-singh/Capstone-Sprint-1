/**
 * Vercel Serverless Entrypoint for ResQFlow NGO Service
 */

const app = require('../src/app');
const { connectDB } = require('../src/config/database');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel NGO DB Connection Error]:', err.message);
  }
  return app(req, res);
};
