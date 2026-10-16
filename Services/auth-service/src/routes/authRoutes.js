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
router.get('/internal/donors', (req, res, next) => authController.getDonors(req, res, next));
router.get('/internal/ngos', (req, res, next) => authController.getNgos(req, res, next));
router.get('/internal/admins', (req, res, next) => authController.getAdmins(req, res, next));
router.get('/internal/users', (req, res, next) => authController.getAllUsers(req, res, next));
router.put('/internal/user/:id/block', (req, res, next) => authController.blockUser(req, res, next));
router.put('/internal/user/:id/block-reporting', (req, res, next) => authController.blockReporting(req, res, next));
router.post('/internal/admin/create-admin', (req, res, next) => authController.createAdmin(req, res, next));
router.put('/internal/ngo/:id/approve', (req, res, next) => authController.setNgoApproval(req, res, next));

module.exports = router;
