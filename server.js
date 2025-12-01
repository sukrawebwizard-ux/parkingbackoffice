// server.js - Main backend server file
// Place this in your /backend folder

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// ============================================
// Middleware
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:8081',
];

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// Supabase Client
// ============================================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ============================================
// Routes Import
// ============================================
const createAuthRoutes = require('./routes/auth');
const createParkingRoutes = require('./routes/parking');
const createUserRoutes = require('./routes/users');

// ============================================
// API Routes
// ============================================
app.use('/api/auth', createAuthRoutes(supabase));
app.use('/api/parking', createParkingRoutes(supabase));
app.use('/api/users', createUserRoutes(supabase));

// ============================================
// Health Check Endpoint
// ============================================
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('parking_locations')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      database: 'disconnected'
    });
  }
});

// ============================================
// Status Endpoint
// ============================================
app.get('/api/status', (req, res) => {
  res.json({
    name: 'Malta Parking Finder API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Map Style Proxy Endpoint
// ============================================
app.get('/api/map-style', async (req, res) => {
  try {
    // Return a custom style that works with MapLibre GL
    const style = {
      "version": 8,
      "name": "Streets",
      "metadata": {},
      "sources": {
        "openmaptiles": {
          "type": "vector",
          "url": "https://tile.openstreetmap.org/data/v3.json"
        }
      },
      "sprite": "https://demotiles.maplibre.org/styles/positron-sprite",
      "glyphs": "https://demotiles.maplibre.org/fonts/{fontstack}/{range}.pbf",
      "layers": [
        {
          "id": "background",
          "type": "background",
          "paint": {
            "background-color": "#f0f0f0"
          }
        },
        {
          "id": "water",
          "type": "fill",
          "source": "openmaptiles",
          "source-layer": "water",
          "paint": {
            "fill-color": "#d2e9fb"
          }
        },
        {
          "id": "landuse",
          "type": "fill",
          "source": "openmaptiles",
          "source-layer": "landuse",
          "paint": {
            "fill-color": "#e8e8e0",
            "fill-opacity": 0.5
          }
        },
        {
          "id": "road",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "paint": {
            "line-color": "#ffffff",
            "line-width": 1
          }
        },
        {
          "id": "building",
          "type": "fill",
          "source": "openmaptiles",
          "source-layer": "building",
          "paint": {
            "fill-color": "#d4d0c9",
            "fill-opacity": 0.6
          }
        }
      ]
    };
    
    res.header('Access-Control-Allow-Origin', '*');
    res.json(style);
  } catch (error) {
    console.error('🗺️ Map style error:', error.message);
    // Return a minimal fallback style on error
    res.header('Access-Control-Allow-Origin', '*');
    res.json({
      "version": 8,
      "sources": {},
      "layers": [
        {
          "id": "background",
          "type": "background",
          "paint": { "background-color": "#e0e0e0" }
        }
      ]
    });
  }
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    path: req.path
  });
});

// ============================================
// Export for Routes
// ============================================
// Pool is passed to routes as parameter, no need to export

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('Malta Parking Finder API Server');
  console.log('='.repeat(50));
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Database: Supabase (${process.env.SUPABASE_URL})`);
  console.log(`✓ API Base URL: http://localhost:${PORT}/api`);
  console.log(`✓ CORS Origins: ${allowedOrigins.join(', ')}`);
  console.log('='.repeat(50));
  console.log('Available Endpoints:');
  console.log('  GET  /api/health          - Health check');
  console.log('  GET  /api/status          - Server status');
  console.log('  POST /api/auth/signup     - Register user');
  console.log('  POST /api/auth/login      - Login user');
  console.log('  GET  /api/parking         - Get all parking');
  console.log('  GET  /api/users           - Get all users (admin)');
  console.log('='.repeat(50) + '\n');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`✗ Port ${PORT} is already in use`);
  } else {
    console.error('✗ Server error:', err.message);
  }
  process.exit(1);
});

// ============================================
// Graceful Shutdown
// ============================================
process.on('SIGINT', async () => {
  console.log('\n\nShutting down gracefully...');
  console.log('Supabase client disconnected');
  process.exit(0);
});
