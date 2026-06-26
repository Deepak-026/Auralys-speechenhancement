const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const { PORT, NODE_ENV, OUTPUT_DIR } = require('./config/env.config');
const enhancementRoutes = require('./routes/enhancement');
const historyRoutes = require('./routes/history');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Ensure runtime directories exist
const dirs = [
  OUTPUT_DIR,
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../temp'),
  path.join(__dirname, '../logs'),
];
dirs.forEach((d) => fs.mkdirSync(d, { recursive: true }));

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS — allow frontend dev server
app.use(
  cors({
    origin:
      NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGIN || false
        : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Logging
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting — protect enhancement endpoint
const enhancementLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Serve enhanced audio files statically
app.use('/outputs', express.static(OUTPUT_DIR, { maxAge: '1d' }));

// API Routes
app.use('/api/enhancement', enhancementLimiter, enhancementRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend built files
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.path} not found.` });
});

// SPA catch-all — serve index.html for frontend routes
if (fs.existsSync(frontendDist)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🎙️  AURALYS Backend running on http://localhost:${PORT}`);
  console.log(`   Environment : ${NODE_ENV}`);
  console.log(`   Output dir  : ${OUTPUT_DIR}\n`);
});

module.exports = app;
