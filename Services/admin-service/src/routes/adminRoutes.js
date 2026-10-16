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
router.get('/donors', auth(['ADMIN']), (req, res, next) => adminController.getDonors(req, res, next));
router.get('/ngos', auth(['ADMIN']), (req, res, next) => adminController.getNgos(req, res, next));
router.get('/admins', auth(['ADMIN']), (req, res, next) => adminController.getAdmins(req, res, next));
router.get('/users', auth(['ADMIN']), (req, res, next) => adminController.getAllUsers(req, res, next));
router.put('/users/:id/block', auth(['ADMIN']), (req, res, next) => adminController.blockUser(req, res, next));
router.put('/victims/:id/block', auth(['ADMIN']), (req, res, next) => adminController.blockVictim(req, res, next));
router.put('/donors/:id/block', auth(['ADMIN']), (req, res, next) => adminController.blockUser(req, res, next));
router.put('/ngos/:id/block', auth(['ADMIN']), (req, res, next) => adminController.blockUser(req, res, next));
router.put('/admins/:id/block', auth(['ADMIN']), (req, res, next) => adminController.blockUser(req, res, next));
router.delete('/reports/:id', auth(['ADMIN']), (req, res, next) => adminController.softDeleteReport(req, res, next));

module.exports = router;
