const express = require('express');
const ngoController = require('../controllers/ngoController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Authenticated NGO endpoints
router.post('/request', authMiddleware, (req, res, next) => ngoController.createRequest(req, res, next));
router.get('/my-requests', authMiddleware, (req, res, next) => ngoController.getMyRequests(req, res, next));
router.get('/available-donations', authMiddleware, (req, res, next) => ngoController.getAvailableDonations(req, res, next));
router.post('/accept/:id', authMiddleware, (req, res, next) => ngoController.acceptDonation(req, res, next));
router.post('/delivered/:id', authMiddleware, (req, res, next) => ngoController.markDelivered(req, res, next));
router.post('/donations/:id/verify-receipt', authMiddleware, (req, res, next) => ngoController.markDelivered(req, res, next));
router.get('/heatmap', authMiddleware, (req, res, next) => ngoController.getHeatmap(req, res, next));

// Inter-Service Internal endpoints (OpenFeign equivalents)
router.get('/internal/requests', (req, res, next) => ngoController.getInternalRequests(req, res, next));
router.get('/internal/requests/:id', (req, res, next) => ngoController.getInternalRequestById(req, res, next));
router.put('/internal/requests/:id', (req, res, next) => ngoController.updateInternalRequest(req, res, next));

module.exports = router;
