/**
 * Donor Service — Port 5003
 * Own DB: DonorServiceDB (MongoDB)
 * Collections: Donations
 *
 * Inter-Service Calls (OpenFeign equivalent via Axios):
 *   → NGO  Service: GET /api/ngo/internal/requests/:id   (validate request exists)
 *   → NGO  Service: PUT /api/ngo/internal/requests/:id   (update quantityReceived + status on accept/delivered - called by NGO service)
 *
 * Endpoints:
 *  GET  /api/donor/requests            — All open NGO requests (calls NGO Service)
 *  POST /api/donor/donate/:ngoRequestId — Create a donation
 *  GET  /api/donor/my-donations         — Authenticated donor's donations
 *  GET  /api/donor/heatmap              — Regional severity heatmap
 *
 * Internal (for Feign calls from NGO Service):
 *  GET  /api/donor/internal/donations         — By ngoRequestIds query param
 *  GET  /api/donor/internal/donations/:id     — Single donation
 *  PUT  /api/donor/internal/donations/:id/status — Update status
 */

require('dotenv').config();
const express  = require('express');
const jwt      = require('jsonwebtoken');
const mongoose = require('mongoose');
const axios    = require('axios');

// ─── Config ──────────────────────────────────────────────────────────────────
const PORT       = process.env.PORT       || 5003;
const MONGO_URI  = process.env.MONGO_URI  || 'mongodb://localhost:27017/DonorServiceDB';
const JWT_SECRET = process.env.JWT_SECRET;
const NGO_URL    = process.env.NGO_URL    || 'http://localhost:5002';
const VICTIM_URL = process.env.VICTIM_URL || 'http://localhost:5005';

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('[SECURITY WARNING] JWT_SECRET environment variable is not defined!');
}

// ─── Feign-Style Service Client ───────────────────────────────────────────────
const NgoServiceClient = {
  getRequestById: async (id) =>
    axios.get(`${NGO_URL}/api/ngo/internal/requests/${id}`).then(r => r.data),

  getAllRequests: async () =>
    axios.get(`${NGO_URL}/api/ngo/internal/requests`).then(r => r.data),
};

// Victim Service Client — for heatmap (RegionSeverity is owned by Victim Service)
const VictimServiceClient = {
  getHeatmap: async () =>
    axios.get(`${VICTIM_URL}/api/victim/internal/heatmap`).then(r => r.data),
};

// ─── Brevo Email ─────────────────────────────────────────────────────────────
const BREVO_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@resqflow.org';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'ResQFlow Relief Network';

async function sendEmail(to, subject, html) {
  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to }], subject, htmlContent: html,
    }, { headers: { 'api-key': BREVO_KEY } });
  } catch (e) { console.error('[Donor Email Error]', e.response?.data || e.message); }
}

// ─── Mongoose Schemas ─────────────────────────────────────────────────────────
// Donation mirrors Spring Boot Donation.java → collection "Donations"
const donationSchema = new mongoose.Schema({
  donorId:            { type: String, required: true },   // username of donor
  ngoRequestId:       { type: String, required: true },   // _id of NgoRequest (in NgoServiceDB)
  itemName:           { type: String, required: true },
  quantity:           { type: Number, required: true },
  ngoTitle:           { type: String, default: '' },
  ngoContactEmail:    { type: String, default: '' },
  ngoDeliveryAddress: { type: String, default: '' },
  ngoContactPhone:    { type: String, default: '' },
  status:             { type: String, enum: ['PENDING', 'ACCEPTED', 'DELIVERED'], default: 'PENDING' },
  donatedAt:          { type: Number, default: () => Date.now() },
}, { collection: 'Donations' });

const Donation = mongoose.model('Donation', donationSchema);

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
 * GET /api/donor/requests
 * Mirrors: DonorService.requests()
 * Calls NGO Service (Feign) to get all OPEN requests
 */
app.get('/api/donor/requests', auth, async (req, res) => {
  try {
    const allRequests = await NgoServiceClient.getAllRequests();
    // Filter non-completed (mirrors: findByStatusNot(COMPLETED))
    const open = allRequests.filter(r => r.status !== 'COMPLETED');
    res.json(open);
  } catch (err) {
    console.error('[Donor Requests]', err.message);
    res.status(500).json({ error: 'Could not fetch NGO requests: ' + err.message });
  }
});

/**
 * POST /api/donor/donate/:ngoRequestId
 * Mirrors: DonorService.donate()
 * - Calls NGO Service (Feign) to validate request
 * - Creates Donation document with NGO delivery details in DonorServiceDB
 * - Sends confirmation email with drop-off & NGO contact info to the donor
 */
app.post('/api/donor/donate/:ngoRequestId', auth, async (req, res) => {
  try {
    const { ngoRequestId } = req.params;
    const { itemName, quantity } = req.body;

    if (!itemName || !quantity || Number(quantity) <= 0)
      return res.status(400).json({ error: 'itemName and a positive quantity are required' });

    // Feign call → NGO Service: validate request exists and is open
    let ngoRequest;
    try {
      ngoRequest = await NgoServiceClient.getRequestById(ngoRequestId);
    } catch (e) {
      return res.status(404).json({ error: 'NGO Request Not Found' });
    }

    if (ngoRequest.status === 'COMPLETED')
      return res.status(400).json({ error: 'Request already completed' });

    const remaining = ngoRequest.quantityNeeded - (ngoRequest.quantityReceived || 0);
    if (Number(quantity) > remaining)
      return res.status(400).json({ error: 'Donation exceeds required quantity' });

    const ngoTitle = ngoRequest.title || 'NGO Relief Operation';
    const ngoContactEmail = ngoRequest.contactEmail || ngoRequest.ngoId || 'support@resqflow.org';
    const ngoDeliveryAddress = ngoRequest.deliveryAddress || 'Designated Regional Relief Hub';
    const ngoContactPhone = ngoRequest.contactPhone || '';

    const donation = new Donation({
      donorId:            req.user.username,
      ngoRequestId,
      itemName,
      quantity:           Number(quantity),
      ngoTitle,
      ngoContactEmail,
      ngoDeliveryAddress,
      ngoContactPhone,
      status:             'PENDING',
      donatedAt:          Date.now(),
    });

    const saved = await donation.save();

    // Send confirmation email with delivery instructions to Donor
    const donorEmail = req.user.username;
    const emailSubject = `ResQFlow: Donation Confirmation & Delivery Details (${itemName})`;
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0284c7; margin: 0 0 6px 0;">🎉 Donation Registered Successfully!</h2>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Thank you for stepping up to help flood-affected communities.</p>
        </div>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; margin: 16px 0; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Donation Summary</h3>
          <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Contributed Item:</strong> ${itemName}</p>
          <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Quantity:</strong> ${quantity} units</p>
          <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>NGO Initiative:</strong> ${ngoTitle}</p>
        </div>

        <div style="background: #f0fdf4; border: 1.5px solid #86efac; padding: 18px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0; color: #166534; font-size: 16px; display: flex; align-items: center; gap: 6px;">
            📦 Where to Send Relief Supplies (Drop-off Address)
          </h3>
          <p style="margin: 6px 0; color: #14532d; font-size: 15px; font-weight: 700; line-height: 1.4;">
            ${ngoDeliveryAddress}
          </p>
          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #86efac; font-size: 13px; color: #166534;">
            <p style="margin: 3px 0;"><strong>NGO Contact Email:</strong> <a href="mailto:${ngoContactEmail}" style="color: #0284c7; font-weight: 600;">${ngoContactEmail}</a></p>
            ${ngoContactPhone ? `<p style="margin: 3px 0;"><strong>NGO Contact Phone:</strong> ${ngoContactPhone}</p>` : ''}
          </div>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-top: 20px;">
          <strong>Next Steps:</strong> Please dispatch or bring your relief materials to the drop-off address above. Once the NGO team receives the supplies, they will mark your donation as <em>Delivered</em> on the platform.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">ResQFlow Emergency Disaster Relief Network</p>
      </div>
    `;

    sendEmail(donorEmail, emailSubject, emailHtml);

    // Return saved donation with full NGO details snapshot for instant frontend modal display
    res.status(201).json({
      ...saved.toObject(),
      ngoTitle,
      ngoContactEmail,
      ngoDeliveryAddress,
      ngoContactPhone
    });
  } catch (err) {
    console.error('[Donate]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/donor/my-donations
 * Mirrors: DonorService.myDonations() — sorted by donatedAt desc
 */
app.get('/api/donor/my-donations', auth, async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.username }).sort({ donatedAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/donor/heatmap
 * Calls Victim Service (Feign) — RegionSeverity is owned by Victim Service
 */
app.get('/api/donor/heatmap', auth, async (req, res) => {
  try {
    const heatmap = await VictimServiceClient.getHeatmap();
    res.json(heatmap);
  } catch (err) {
    console.error('[Donor Heatmap]', err.message);
    res.status(500).json({ error: 'Could not fetch heatmap from Victim Service: ' + err.message });
  }
});

// ─── Internal Feign Endpoints (called by NGO Service) ────────────────────────

/**
 * GET /api/donor/internal/donations
 * Called by NGO Service to get donations for given ngoRequestIds
 * Query: ?ngoRequestIds=id1,id2,id3&status=PENDING (optional)
 */
app.get('/api/donor/internal/donations', async (req, res) => {
  try {
    const { ngoRequestIds, status } = req.query;
    const query = {};
    if (ngoRequestIds) query.ngoRequestId = { $in: ngoRequestIds.split(',') };
    if (status)        query.status = status;
    else               query.status = 'PENDING';  // default: pending

    const donations = await Donation.find(query);
    res.json(donations);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * GET /api/donor/internal/donations/:id
 * Called by NGO Service to fetch a single donation before accept/deliver
 */
app.get('/api/donor/internal/donations/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    res.json(donation);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * PUT /api/donor/internal/donations/:id/status
 * Called by NGO Service when accepting or delivering a donation
 * Body: { status: 'ACCEPTED' | 'DELIVERED' }
 */
app.put('/api/donor/internal/donations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACCEPTED', 'DELIVERED'].includes(status))
      return res.status(400).json({ error: 'Invalid status. Must be ACCEPTED or DELIVERED' });

    const donation = await Donation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    res.json(donation);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * GET /api/donor/internal/all-donations
 * Called by Admin Service to get all donations for platform overview
 */
app.get('/api/donor/internal/all-donations', async (req, res) => {
  try {
    res.json(await Donation.find());
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'UP', service: 'donor-service', port: PORT }));

// ─── Start ────────────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('[Donor Service] MongoDB connected to DonorServiceDB');
    app.listen(PORT, () => console.log(`[Donor Service] Running on port ${PORT}`));
  })
  .catch(err => { console.error('[Donor Service] MongoDB error:', err.message); process.exit(1); });
