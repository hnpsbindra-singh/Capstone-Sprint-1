const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Public authentication routes
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/verify-otp', (req, res, next) => authController.verifyOtp(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/send-otp', (req, res, next) => authController.sendOtp(req, res, next));
router.put('/verify-reset-otp', (req, res, next) => authController.verifyResetOtp(req, res, next));

// Inter-service internal endpoints (Feign equivalent)
router.get('/internal/user/:username', (req, res, next) => authController.getUserByUsername(req, res, next));
router.get('/internal/user-by-id/:id', (req, res, next) => authController.getUserById(req, res, next));
router.get('/internal/victims', (req, res, next) => authController.getVictims(req, res, next));
router.put('/internal/user/:id/block-reporting', (req, res, next) => authController.blockReporting(req, res, next));

module.exports = router;
