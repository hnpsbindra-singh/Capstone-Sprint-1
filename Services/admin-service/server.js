/**
 * Admin Service — Port 5004
 * Own DB: AdminServiceDB (MongoDB) — read-only mirror of FloodReports
 *
 * Inter-Service Calls (OpenFeign equivalent via Axios):
 *   → NGO   Service: GET /api/ngo/internal/requests
 *   → Donor Service: GET /api/donor/internal/all-donations
 *   → Victim Service (Spring Boot): GET /api/victim/internal/reports (optional, fallback to local)
 *
 * Endpoints:
 *  GET /api/admin/reports        — All flood reports sorted by severity
 *  GET /api/admin/heatmap        — Regional severity heatmap
 *  GET /api/admin/ngo-requests   — All NGO resource requests
 *  GET /api/admin/donations      — All donations
 */

require('dotenv').config();
const express  = require('express');
const jwt      = require('jsonwebtoken');
const mongoose = require('mongoose');
const axios    = require('axios');

// ─── Config ──────────────────────────────────────────────────────────────────
const PORT         = process.env.PORT          || 5004;
const MONGO_URI    = process.env.MONGO_URI     || 'mongodb://localhost:27017/AdminServiceDB';
const JWT_SECRET   = process.env.JWT_SECRET;
const NGO_URL      = process.env.NGO_URL       || 'http://localhost:5002';
const DONOR_URL    = process.env.DONOR_URL     || 'http://localhost:5003';
const VICTIM_URL   = process.env.VICTIM_URL    || 'http://localhost:5005';  // Spring Boot Victim Service (Port 5005)
const AUTH_URL     = process.env.AUTH_URL      || 'http://localhost:5001';

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('[SECURITY WARNING] JWT_SECRET environment variable is not defined!');
}

// ─── Feign-Style Service Clients ─────────────────────────────────────────────
const NgoServiceClient = {
  getAllRequests: async () =>
    axios.get(`${NGO_URL}/api/ngo/internal/requests`).then(r => r.data),
};

const DonorServiceClient = {
  getAllDonations: async () =>
    axios.get(`${DONOR_URL}/api/donor/internal/all-donations`).then(r => r.data),
};

const AuthServiceClient = {
  getVictims: async () =>
    axios.get(`${AUTH_URL}/api/auth/internal/victims`).then(r => r.data),

  setVictimBlockStatus: async (victimId, isBlocked) =>
    axios.put(`${AUTH_URL}/api/auth/internal/user/${victimId}/block-reporting`, { isBlocked }).then(r => r.data),
};

const VictimServiceClient = {
  // Calls Spring Boot Victim Service internal endpoints
  getAllReports: async () =>
    axios.get(`${VICTIM_URL}/api/victim/internal/reports`).then(r => r.data),

  getHeatmap: async () =>
    axios.get(`${VICTIM_URL}/api/victim/internal/heatmap`).then(r => r.data),

  softDeleteReport: async (reportId) =>
    axios.delete(`${VICTIM_URL}/api/victim/internal/reports/${reportId}`).then(r => r.data),
};

// FloodReports and RegionSeverity are owned by Victim Service
// Fetched via Feign HTTP calls — no local schemas needed

// ─── JWT Middleware (Admin role required) ─────────────────────────────────────
function auth(roles = []) {
  return (req, res, next) => {
    const h = req.headers['authorization'];
    if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const d = jwt.verify(h.split(' ')[1], JWT_SECRET, { algorithms: ['HS256'] });
      req.user = { username: d.sub, role: d.role };
      if (roles.length && !roles.includes(d.role))
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      next();
    } catch { return res.status(401).json({ error: 'Invalid token' }); }
  };
}

// ─── App ─────────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/reports
 * Mirrors: AdminService.reports()
 * Tries Victim Service (Feign), falls back to local AdminServiceDB FloodReports
 */
app.get('/api/admin/reports', auth(['ADMIN']), async (req, res) => {
  try {
    const reports = await VictimServiceClient.getAllReports();
    res.json(reports);
  } catch (err) {
    console.error('[Admin Reports] Victim Service unavailable:', err.message);
    res.status(503).json({ error: 'Victim Service unavailable: ' + err.message });
  }
});

/**
 * GET /api/admin/heatmap
 * Mirrors: RegionSeverityService.getHeatmap()
 */
app.get('/api/admin/heatmap', auth(['ADMIN']), async (req, res) => {
  try {
    const heatmap = await VictimServiceClient.getHeatmap();
    res.json(heatmap);
  } catch (err) {
    console.error('[Admin Heatmap] Victim Service unavailable:', err.message);
    res.status(503).json({ error: 'Victim Service unavailable: ' + err.message });
  }
});

/**
 * GET /api/admin/ngo-requests
 * Mirrors: AdminController.ngoRequests() / NgoService.allRequests()
 * Calls NGO Service (Feign)
 */
app.get('/api/admin/ngo-requests', auth(['ADMIN']), async (req, res) => {
  try {
    const requests = await NgoServiceClient.getAllRequests();
    res.json(requests);
  } catch (err) {
    console.error('[Admin NGO Requests]', err.message);
    res.status(500).json({ error: 'Could not fetch NGO requests: ' + err.message });
  }
});

/**
 * GET /api/admin/donations
 * Mirrors: AdminController.donations() / NgoService.allDonations()
 * Calls Donor Service (Feign)
 */
app.get('/api/admin/donations', auth(['ADMIN']), async (req, res) => {
  try {
    const donations = await DonorServiceClient.getAllDonations();
    res.json(donations);
  } catch (err) {
    console.error('[Admin Donations]', err.message);
    res.status(500).json({ error: 'Could not fetch donations: ' + err.message });
  }
});

/**
 * GET /api/admin/victims
 * Fetches all victims and their block status from AuthService
 */
app.get('/api/admin/victims', auth(['ADMIN']), async (req, res) => {
  try {
    const victims = await AuthServiceClient.getVictims();
    res.json(victims);
  } catch (err) {
    console.error('[Admin Victims]', err.message);
    res.status(500).json({ error: 'Could not fetch victims: ' + err.message });
  }
});

/**
 * PUT /api/admin/victims/:id/block
 * Blocks or unblocks a victim from reporting floods
 * Body: { isBlocked: true | false } (defaults to true if omitted)
 */
app.put('/api/admin/victims/:id/block', auth(['ADMIN']), async (req, res) => {
  try {
    const isBlocked = req.body.isBlocked !== undefined ? req.body.isBlocked : true;
    const result = await AuthServiceClient.setVictimBlockStatus(req.params.id, isBlocked);
    res.json(result);
  } catch (err) {
    console.error('[Admin Block Victim]', err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || err.message;
    res.status(status).json({ error: 'Could not update victim block status: ' + message });
  }
});

/**
 * DELETE /api/admin/reports/:id
 * Soft deletes a flood report via Victim Service
 */
app.delete('/api/admin/reports/:id', auth(['ADMIN']), async (req, res) => {
  try {
    const result = await VictimServiceClient.softDeleteReport(req.params.id);
    res.json({ message: 'Flood report soft-deleted successfully', report: result });
  } catch (err) {
    console.error('[Admin Soft Delete Report]', err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || err.message;
    res.status(status).json({ error: 'Could not delete flood report: ' + message });
  }
});

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'UP', service: 'admin-service', port: PORT }));

// ─── Start ────────────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('[Admin Service] MongoDB connected to AdminServiceDB');
    app.listen(PORT, () => console.log(`[Admin Service] Running on port ${PORT}`));
  })
  .catch(err => { console.error('[Admin Service] MongoDB error:', err.message); process.exit(1); });
