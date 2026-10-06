/**
 * Vercel Serverless Entrypoint for ResQFlow Auth Service
 */

const app = require('../src/app');
const { connectDB } = require('../src/config/database');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Auth DB Connection Error]:', err.message);
  }
  return app(req, res);
};
