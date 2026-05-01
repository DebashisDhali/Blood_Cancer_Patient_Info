const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const { createClient } = require('@supabase/supabase-js');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const fundRoutes = require('./routes/fundRoutes');
const donationRoutes = require('./routes/donationRoutes');
const documentRoutes = require('./routes/documentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const statsRoutes = require('./routes/statsRoutes');

const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');

dotenv.config();
const app = express();

// 1. Core Security & Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(xss()); // Sanitize data against XSS
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(compression());

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 login/register requests
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 minutes
  message: { message: 'Too many API requests, please slow down.' }
});

// CORS Setup
const normalizeOrigin = (origin = '') => origin.trim().replace(/\/+$/, '');
const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',').map(o => normalizeOrigin(o)).filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin)) || 
        /^https:\/\/[a-z0-9-]+\.(netlify|vercel)\.app$/i.test(normalizeOrigin(origin)) ||
        /^http:\/\/localhost:\d+$/i.test(origin)) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 2. Data Parsing
app.set('trust proxy', 1); // Trust Vercel proxy for rate-limiting
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Apply rate limiter to auth routes
app.use('/api/auth', authLimiter);

// 3. Supabase Connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
app.locals.supabase = supabase;

// 4. API Routes (Flexible Mapping)
const apiRoutes = [
  { path: '/auth', handler: authRoutes },
  { path: '/patients', handler: patientRoutes },
  { path: '/funds', handler: fundRoutes },
  { path: '/donations', handler: donationRoutes },
  { path: '/documents', handler: documentRoutes },
  { path: '/admin', handler: adminRoutes },
  { path: '/stats', handler: statsRoutes }
];

apiRoutes.forEach(route => {
  app.use(`/api${route.path}`, apiLimiter, route.handler); // Standard: /api/auth
  app.use(route.path, apiLimiter, route.handler);          // Fallback: /auth
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', database: 'Supabase Connected' });
});

// Root Route (Prevents "Cannot GET /" confusion)
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1 style="color: #6366f1;">Cancer Support API</h1>
      <p>The backend server is running successfully! 🚀</p>
      <p>Please use the frontend application to interact with the platform.</p>
    </div>
  `);
});

// 5. Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

