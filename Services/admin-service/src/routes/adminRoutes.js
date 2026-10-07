const express = require('express');
const adminController = require('../controllers/adminController');
const { auth } = require('../middlewares/authMiddleware');

const router = express.Router();

// Admin-only endpoints
router.get('/reports', auth(['ADMIN']), (req, res, next) => adminController.getReports(req, res, next));
router.get('/heatmap', auth(['ADMIN']), (req, res, next) => adminController.getHeatmap(req, res, next));
router.get('/ngo-requests', auth(['ADMIN']), (req, res, next) => adminController.getNgoRequests(req, res, next));
router.get('/donations', auth(['ADMIN']), (req, res, next) => adminController.getDonations(req, res, next));
router.get('/victims', auth(['ADMIN']), (req, res, next) => adminController.getVictims(req, res, next));
router.put('/victims/:id/block', auth(['ADMIN']), (req, res, next) => adminController.blockVictim(req, res, next));
router.delete('/reports/:id', auth(['ADMIN']), (req, res, next) => adminController.softDeleteReport(req, res, next));

module.exports = router;
