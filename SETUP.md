# Malta Parking Finder - Backend Setup (Node.js/Express)

## Quick Start

### 1. Install Dependencies
```bash
npm init -y
npm install express mysql2 bcryptjs jsonwebtoken cors dotenv uuid
npm install --save-dev nodemon
```

### 2. Create .env File
Copy the `.env.example` content below and create a `.env` file in your backend root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=MySecurePassword123
DB_NAME=malta_parking

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=24h

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Logging
LOG_LEVEL=info
```

### 3. Create Basic Server File

Create `server.js`:

```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test Database Connection
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = { pool, app };
```

### 4. Create Authentication Routes

Create `routes/auth.js`:

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../server');

const router = express.Router();

// Register
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber } = req.body;
    
    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await pool.getConnection();
    
    // Check if user exists
    const [rows] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      connection.release();
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Create user
    await connection.query(
      'INSERT INTO users (id, email, password_hash, full_name, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email, passwordHash, fullName, phoneNumber, 'user']
    );

    // Create user profile
    await connection.query(
      'INSERT INTO user_profiles (id, user_id) VALUES (?, ?)',
      [uuidv4(), userId]
    );

    connection.release();
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const connection = await pool.getConnection();
    
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      connection.release();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      connection.release();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if active
    if (!user.is_active) {
      connection.release();
      return res.status(403).json({ error: 'Account is inactive' });
    }

    connection.release();

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 5. Create Parking Routes

Create `routes/parking.js`:

```javascript
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../server');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all parking locations
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [locations] = await connection.query('SELECT * FROM parking_locations');
    connection.release();
    
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get parking location by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [locations] = await connection.query('SELECT * FROM parking_locations WHERE id = ?', [id]);
    connection.release();
    
    if (locations.length === 0) {
      return res.status(404).json({ error: 'Parking location not found' });
    }
    
    res.json(locations[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create parking location (Admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, address, latitude, longitude, capacity, description } = req.body;
    
    if (!name || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await pool.getConnection();
    const id = uuidv4();

    await connection.query(
      'INSERT INTO parking_locations (id, name, address, latitude, longitude, capacity, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, address, latitude, longitude, capacity || 1, description]
    );

    connection.release();
    
    res.status(201).json({ id, message: 'Parking location created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update parking location (Admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, latitude, longitude, status, capacity, description } = req.body;

    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE parking_locations SET name = ?, address = ?, latitude = ?, longitude = ?, status = ?, capacity = ?, description = ?, updated_at = NOW() WHERE id = ?',
      [name, address, latitude, longitude, status, capacity, description, id]
    );

    connection.release();
    
    res.json({ message: 'Parking location updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete parking location (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    await connection.query('DELETE FROM parking_locations WHERE id = ?', [id]);
    
    connection.release();
    
    res.json({ message: 'Parking location deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 6. Create Authentication Middleware

Create `middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
```

### 7. Update server.js to Use Routes

```javascript
const authRoutes = require('./routes/auth');
const parkingRoutes = require('./routes/parking');

app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
```

### 8. Update package.json scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 9. Run the Backend

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## API Endpoints Summary

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Parking Locations
- `GET /api/parking` - Get all parking locations
- `GET /api/parking/:id` - Get specific parking location
- `POST /api/parking` - Create parking (admin only)
- `PUT /api/parking/:id` - Update parking (admin only)
- `DELETE /api/parking/:id` - Delete parking (admin only)

