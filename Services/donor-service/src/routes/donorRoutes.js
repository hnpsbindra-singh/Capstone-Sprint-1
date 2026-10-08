const express = require('express');
const donorController = require('../controllers/donorController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Authenticated Donor endpoints
router.get('/requests', authMiddleware, (req, res, next) => donorController.getOpenRequests(req, res, next));
router.post('/donate/:ngoRequestId', authMiddleware, (req, res, next) => donorController.donate(req, res, next));
router.put('/donations/:id/dispatch', authMiddleware, (req, res, next) => donorController.dispatch(req, res, next));
router.get('/my-donations', authMiddleware, (req, res, next) => donorController.getMyDonations(req, res, next));
router.get('/heatmap', authMiddleware, (req, res, next) => donorController.getHeatmap(req, res, next));

// Inter-Service Internal endpoints (OpenFeign equivalents)
router.get('/internal/donations', (req, res, next) => donorController.getInternalDonations(req, res, next));
router.get('/internal/donations/:id', (req, res, next) => donorController.getInternalDonationById(req, res, next));
router.put('/internal/donations/:id/status', (req, res, next) => donorController.updateInternalDonationStatus(req, res, next));
router.get('/internal/all-donations', (req, res, next) => donorController.getInternalAllDonations(req, res, next));

module.exports = router;
