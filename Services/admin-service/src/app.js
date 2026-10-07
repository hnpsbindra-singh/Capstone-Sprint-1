const express = require('express');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');
const config = require('./config/env');

const app = express();

app.use(express.json());

if (config.env === 'development') {
  app.use((req, res, next) => {
    console.log(`[Admin Service] ${req.method} ${req.url}`);
    next();
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'admin-service',
    port: config.port,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/admin', adminRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
