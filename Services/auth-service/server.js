/**
 * Auth Service Bootstrap Runner
 * Port: 5001
 */

const config = require('./src/config/env');
const { connectDB } = require('./src/config/database');
const app = require('./src/app');

async function startServer() {
  try {
    await connectDB();
    const server = app.listen(config.port, () => {
      console.log(`[Auth Service] Running smoothly on port ${config.port} (${config.env} mode)`);
    });

    const shutdown = async (signal) => {
      console.log(`[Auth Service] Received ${signal}. Gracefully shutting down...`);
      server.close(() => {
        console.log('[Auth Service] HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[Auth Service] Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
