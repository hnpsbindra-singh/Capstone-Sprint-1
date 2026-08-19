/**
 * NGO Service — Port 5002
 * Own DB: NgoServiceDB (MongoDB)
 * Collections: NgoRequests
 *
 * Inter-Service Calls (OpenFeign equivalent via Axios):
 *   → Donor Service: GET  /api/donor/internal/donations?ngoRequestIds=...
 *   → Donor Service: PUT  /api/donor/internal/donations/:id/status
 *   → Auth  Service: GET  /api/auth/internal/user/:username  (email lookup)
 *
 * Endpoints:
 *  POST /api/ngo/request             — Create NGO resource request
 *  GET  /api/ngo/my-requests         — List authenticated NGO's requests
 *  GET  /api/ngo/available-donations — Get PENDING donations for NGO's requests
 *  POST /api/ngo/accept/:id          — Accept a donation
 *  POST /api/ngo/delivered/:id       — Mark donation as delivered
 *  GET  /api/ngo/heatmap             — Regional severity heatmap
 */

require('dotenv').config();
const express  = require('express');
const jwt      = require('jsonwebtoken');
const mongoose = require('mongoose');
const axios    = require('axios');

// ─── Config ──────────────────────────────────────────────────────────────────
const PORT        = process.env.PORT         || 5002;
const MONGO_URI   = process.env.MONGO_URI    || 'mongodb://localhost:27017/NgoServiceDB';
const JWT_SECRET  = process.env.JWT_SECRET;
const DONOR_URL   = process.env.DONOR_URL    || 'http://localhost:5003';
const AUTH_URL    = process.env.AUTH_URL     || 'http://localhost:5001';
const VICTIM_URL  = process.env.VICTIM_URL   || 'http://localhost:5005';

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('[SECURITY WARNING] JWT_SECRET environment variable is not defined!');
}

// ─── Feign-Style Service Clients (Axios) ─────────────────────────────────────
// These mirror what Spring Cloud OpenFeign @FeignClient interfaces would do.
const DonorServiceClient = {
  /** GET pending donations for a list of ngoRequestIds */
  getDonationsForRequests: async (ngoRequestIds) =>
    axios.get(`${DONOR_URL}/api/donor/internal/donations`, {
      params: { ngoRequestIds: ngoRequestIds.join(',') }
    }).then(r => r.data),

  /** GET single donation by id */
  getDonationById: async (id) =>
    axios.get(`${DONOR_URL}/api/donor/internal/donations/${id}`).then(r => r.data),

  /** PUT update donation status + notify donor */
  updateDonationStatus: async (id, payload) =>
    axios.put(`${DONOR_URL}/api/donor/internal/donations/${id}/status`, payload).then(r => r.data),
};

const AuthServiceClient = {
  getUserByUsername: async (username) =>
    axios.get(`${AUTH_URL}/api/auth/internal/user/${username}`).then(r => r.data),
};

// Victim Service Client — for heatmap (RegionSeverity is owned by Victim Service)
const VictimServiceClient = {
  getHeatmap: async () =>
    axios.get(`${VICTIM_URL}/api/victim/internal/heatmap`).then(r => r.data),
};

// ─── Brevo Email ─────────────────────────────────────────────────────────────
const BREVO_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@resqflow.org';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'ResQFlow';

async function sendEmail(to, subject, html) {
  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to }], subject, htmlContent: html,
    }, { headers: { 'api-key': BREVO_KEY } });
  } catch (e) { console.error('[Email]', e.response?.data || e.message); }
}

// ─── Mongoose Schemas ─────────────────────────────────────────────────────────
// NgoRequest mirrors Spring Boot NgoRequest.java → collection "ResourceRequest"
const ngoRequestSchema = new mongoose.Schema({
  ngoId:            { type: String, required: true },
  title:            { type: String, required: true },
  description:      { type: String },
  resourceNeeded:   { type: String, required: true },
  quantityNeeded:   { type: Number, required: true },
  quantityReceived: { type: Number, default: 0 },
  deliveryAddress:  { type: String, default: '' }, // Where to send / drop-off address
  contactEmail:     { type: String, default: '' }, // Official contact email
  contactPhone:     { type: String, default: '' }, // Contact phone number
  status:           { type: String, enum: ['OPEN', 'COMPLETED'], default: 'OPEN' },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },  // [longitude, latitude]
  },
}, { collection: 'ResourceRequest' });
ngoRequestSchema.index({ location: '2dsphere' });

const NgoRequest = mongoose.model('NgoRequest', ngoRequestSchema);

// RegionSeverity is owned by Victim Service — fetched via Feign HTTP call, not local DB

// ─── JWT Middleware ───────────────────────────────────────────────────────────
function auth(req, res, next) {
  const h = req.headers['authorization'];
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const d = jwt.verify(h.split(' ')[1], JWT_SECRET, { algorithms: ['HS256'] });
    req.user = { username: d.sub, role: d.role };
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
}

// ─── App ─────────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /api/ngo/request
 * Mirrors: NgoService.request() — Creates resource supply request
 */
app.post('/api/ngo/request', auth, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      resourceNeeded, 
      quantityNeeded, 
      latitude, 
      longitude,
      deliveryAddress,
      contactEmail,
      contactPhone 
    } = req.body;

    if (!title || !resourceNeeded || !quantityNeeded || latitude == null || longitude == null)
      return res.status(400).json({ error: 'title, resourceNeeded, quantityNeeded, latitude, longitude required' });

    const ngoRequest = new NgoRequest({
      ngoId:            req.user.username,
      title,
      description,
      resourceNeeded,
      quantityNeeded:   Number(quantityNeeded),
      quantityReceived: 0,
      deliveryAddress:  deliveryAddress?.trim() || 'Central NGO Regional Camp',
      contactEmail:     contactEmail?.trim() || req.user.username,
      contactPhone:     contactPhone?.trim() || '',
      status:           'OPEN',
      location:         { type: 'Point', coordinates: [Number(longitude), Number(latitude)] },
    });

    const saved = await ngoRequest.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('[NGO Request]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/ngo/my-requests
 * Mirrors: NgoService.myRequests() — All requests by authenticated NGO
 */
app.get('/api/ngo/my-requests', auth, async (req, res) => {
  try {
    const requests = await NgoRequest.find({ ngoId: req.user.username });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/ngo/available-donations
 * Mirrors: NgoService.availableDonations()
 * Calls Donor Service (Feign) to get PENDING donations for this NGO's requests
 */
app.get('/api/ngo/available-donations', auth, async (req, res) => {
  try {
    const myRequests = await NgoRequest.find({ ngoId: req.user.username });
    if (!myRequests.length) return res.json([]);

    const requestIds = myRequests.map(r => r._id.toString());
    const donations  = await DonorServiceClient.getDonationsForRequests(requestIds);
    res.json(donations);
  } catch (err) {
    console.error('[Available Donations]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/ngo/accept/:id
 * Mirrors: NgoService.accept()
 * - Fetches donation from Donor Service
 * - Validates ownership and quantity
 * - Calls Donor Service to update status → ACCEPTED
 * - Updates quantityReceived on NgoRequest
 */
app.post('/api/ngo/accept/:id', auth, async (req, res) => {
  try {
    const donation = await DonorServiceClient.getDonationById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    const ngoRequest = await NgoRequest.findById(donation.ngoRequestId);
    if (!ngoRequest)  return res.status(404).json({ error: 'NGO Request not found' });
    if (ngoRequest.ngoId !== req.user.username)
      return res.status(403).json({ error: 'Invalid Access' });
    if (donation.status !== 'PENDING')
      return res.status(400).json({ error: 'Donation must be in pending queue first' });

    const remaining = ngoRequest.quantityNeeded - (ngoRequest.quantityReceived || 0);
    if (donation.quantity > remaining)
      return res.status(400).json({ error: 'Donation exceeds required quantity' });

    const updatedQty = (ngoRequest.quantityReceived || 0) + donation.quantity;
    ngoRequest.quantityReceived = updatedQty;
    if (updatedQty >= ngoRequest.quantityNeeded) ngoRequest.status = 'COMPLETED';
    await ngoRequest.save();

    // Call Donor Service (Feign) to update donation status → ACCEPTED
    await DonorServiceClient.updateDonationStatus(req.params.id, { status: 'ACCEPTED' });

    // Send acceptance email to donor via Auth Service lookup + Brevo
    try {
      const donorUser = await AuthServiceClient.getUserByUsername(donation.donorId);
      if (donorUser?.username) {
        await sendEmail(donorUser.username, 'ResQFlow - Your Donation Has Been Accepted',
          `<div style="font-family:Arial,sans-serif;padding:20px">
            <h2 style="color:#2E7D32">Donation Accepted!</h2>
            <p>Your donation has been accepted by the NGO. Thank you for your generosity!</p>
            <p><strong>— ResQFlow Team</strong></p>
          </div>`);
      }
    } catch (emailErr) { console.error('[Accept Email]', emailErr.message); }

    res.json({ message: 'Donation accepted successfully' });
  } catch (err) {
    console.error('[Accept Donation]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/ngo/delivered/:id
 * Mirrors: NgoService.deliever()
 * - Validates donation status is ACCEPTED
 * - Calls Donor Service to update status → DELIVERED
 * - Sends delivery email to donor
 */
app.post('/api/ngo/delivered/:id', auth, async (req, res) => {
  try {
    const donation = await DonorServiceClient.getDonationById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    const ngoRequest = await NgoRequest.findById(donation.ngoRequestId);
    if (!ngoRequest)  return res.status(404).json({ error: 'NGO Request not found' });
    if (ngoRequest.ngoId !== req.user.username)
      return res.status(403).json({ error: 'Invalid Access' });
    if (donation.status !== 'ACCEPTED')
      return res.status(400).json({ error: 'Donation must be accepted first' });

    // Call Donor Service (Feign) to update donation status → DELIVERED
    await DonorServiceClient.updateDonationStatus(req.params.id, { status: 'DELIVERED' });

    // Send delivery email
    try {
      const donorUser = await AuthServiceClient.getUserByUsername(donation.donorId);
      if (donorUser?.username) {
        await sendEmail(donorUser.username, 'ResQFlow - Your Donation Has Been Delivered',
          `<div style="font-family:Arial,sans-serif;padding:20px">
            <h2 style="color:#2E7D32">Donation Delivered!</h2>
            <p>Your donated resources have been successfully delivered to flood victims. Thank you!</p>
            <p><strong>— ResQFlow Team</strong></p>
          </div>`);
      }
    } catch (emailErr) { console.error('[Deliver Email]', emailErr.message); }

    res.json({ message: 'Donation marked as delivered' });
  } catch (err) {
    console.error('[Deliver Donation]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/ngo/heatmap
 * Calls Victim Service (Feign) — RegionSeverity is owned by Victim Service
 */
app.get('/api/ngo/heatmap', auth, async (req, res) => {
  try {
    const heatmap = await VictimServiceClient.getHeatmap();
    res.json(heatmap);
  } catch (err) {
    console.error('[NGO Heatmap]', err.message);
    res.status(500).json({ error: 'Could not fetch heatmap from Victim Service: ' + err.message });
  }
});

// ─── Internal Feign Endpoints ─────────────────────────────────────────────────
// Called by Admin Service and other services

/** GET all NGO requests (Admin aggregation) */
app.get('/api/ngo/internal/requests', async (req, res) => {
  try {
    res.json(await NgoRequest.find());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** GET single NGO request by ID (called by Donor Service) */
app.get('/api/ngo/internal/requests/:id', async (req, res) => {
  try {
    const r = await NgoRequest.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Not found' });
    res.json(r);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** PUT update NgoRequest quantity/status (called by Donor Service on accept/deliver) */
app.put('/api/ngo/internal/requests/:id', async (req, res) => {
  try {
    const updated = await NgoRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'UP', service: 'ngo-service', port: PORT }));

// ─── Start ────────────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('[NGO Service] MongoDB connected to NgoServiceDB');
    app.listen(PORT, () => console.log(`[NGO Service] Running on port ${PORT}`));
  })
  .catch(err => { console.error('[NGO Service] MongoDB error:', err.message); process.exit(1); });
