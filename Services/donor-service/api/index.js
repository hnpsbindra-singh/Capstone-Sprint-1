/**
 * Vercel Serverless Entrypoint for ResQFlow Donor Service
 */

const app = require('../src/app');
const { connectDB } = require('../src/config/database');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Donor DB Connection Error]:', err.message);
  }
  return app(req, res);
};
