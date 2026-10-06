const express = require('express');
const authRoutes = require('./routes/authRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');
const config = require('./config/env');

const app = express();

// Standard Middlewares
app.use(express.json());

// Request logging in development
if (config.env === 'development') {
  app.use((req, res, next) => {
    console.log(`[Auth Service] ${req.method} ${req.url}`);
    next();
  });
}

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'auth-service',
    port: config.port,
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);

// 404 & Centralized Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
