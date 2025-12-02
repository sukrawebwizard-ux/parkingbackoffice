# 📁 Backend File Creation Guide

## Overview
This guide shows exactly which files to create in your `/backend` folder.

---

## Directory Structure to Create

```
parking/
└── backend/
    ├── server.js                  ← MAIN FILE
    ├── package.json              ← DEPENDENCIES
    ├── .env                      ← COPY from .env.example (configure it)
    ├── .env.example              ← TEMPLATE
    ├── SETUP.md                  ← DOCUMENTATION
    ├── routes/
    │   ├── auth.js              ← AUTHENTICATION ENDPOINTS
    │   ├── parking.js           ← PARKING CRUD ENDPOINTS
    │   └── users.js             ← USER MANAGEMENT ENDPOINTS
    └── middleware/
        └── auth.js              ← JWT VERIFICATION
```

---

## Files Overview

### 1. **server.js** (Main Server File)
- Entry point for the backend
- Sets up Express app
- Configures middleware
- Creates MySQL connection pool
- Imports and registers all routes
- Starts the server on port 5000

### 2. **package.json** (Dependencies)
Contains all npm packages needed:
- express (web framework)
- mysql2 (database driver)
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- cors (cross-origin)
- dotenv (environment variables)
- uuid (unique IDs)

### 3. **.env** (Configuration)
- Database credentials
- Server port
- JWT secret
- Frontend URL (for CORS)

### 4. **.env.example** (Template)
- Copy of .env structure for reference

---

## Routes Files Overview

### routes/auth.js
**Endpoints:**
- `POST /signup` - Register new user
- `POST /login` - User login
- `POST /verify` - Verify JWT token
- `POST /refresh` - Refresh token
- `POST /change-password` - Change password
- `POST /forgot-password` - Request password reset

**Functions:**
- User registration with validation
- Password hashing with bcrypt
- JWT token generation
- Password verification

---

### routes/parking.js
**Endpoints:**
- `GET /` - Get all parking locations
- `GET /:id` - Get specific location
- `GET /nearby/:lat/:lon` - Find nearby parking
- `GET /available/list` - Get available spots
- `POST /` - Create location (admin)
- `PUT /:id` - Update location (admin)
- `PATCH /:id/status` - Update status (admin)
- `DELETE /:id` - Delete location (admin)
- `GET /stats/summary` - Get statistics

**Features:**
- Geolocation distance calculation
- Occupancy percentage calculation
- Admin-only operations
- Comprehensive filtering

---

### routes/users.js
**Endpoints:**
- `GET /me` - Current user profile
- `GET /` - All users (admin)
- `GET /:id` - User details
- `PUT /:id/profile` - Update profile
- `PATCH /:id/status` - Activate/deactivate (admin)
- `PATCH /:id/role` - Change role (admin)
- `DELETE /:id` - Delete user (admin)
- `GET /stats/summary` - User statistics
- `PATCH /:id/location-permission` - Grant location access

**Features:**
- User profile management
- Role-based administration
- Location permission tracking
- User statistics

---

### middleware/auth.js
**Functions:**
- `verifyToken()` - Middleware to check JWT
- `verifyAdmin()` - Middleware to check admin role
- `verifyOwnData()` - Middleware to verify data ownership
- `rateLimit()` - Rate limiting (optional)
- `logRequest()` - Request logging

**Purpose:**
- Protect routes with authentication
- Enforce role-based access
- Prevent unauthorized access
- Track admin actions

---

## Step-by-Step Creation

### Step 1: Create Backend Folder
```bash
mkdir backend
cd backend
```

### Step 2: Copy Files
Copy the following files to your `backend` folder:
1. ✅ `server.js`
2. ✅ `package.json`
3. ✅ `.env.example`
4. ✅ `SETUP.md`
5. ✅ `routes/auth.js`
6. ✅ `routes/parking.js`
7. ✅ `routes/users.js`
8. ✅ `middleware/auth.js`

### Step 3: Create .env File
```bash
# Copy the template
cp .env.example .env

# Edit .env with your values:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=MySecurePassword123
# etc.
```

### Step 4: Install Dependencies
```bash
npm install
```

This will install:
- express
- mysql2
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- uuid
- nodemon (dev only)

### Step 5: Start Backend
```bash
npm run dev
```

Expected output:
```
==================================================
Malta Parking Finder API Server
==================================================
✓ Server running on http://localhost:5000
✓ Environment: development
✓ Database: localhost:3306
✓ API Base URL: http://localhost:5000/api
✓ CORS Origin: http://localhost:5173
==================================================
Available Endpoints:
  GET  /api/health          - Health check
  GET  /api/status          - Server status
  POST /api/auth/signup     - Register user
  POST /api/auth/login      - Login user
  GET  /api/parking         - Get all parking
  GET  /api/users           - Get all users (admin)
==================================================
```

---

## File Creation Commands

Create files using VS Code or your editor:

```bash
# Create routes folder
mkdir backend/routes

# Create middleware folder
mkdir backend/middleware

# Create files in routes
touch backend/routes/auth.js
touch backend/routes/parking.js
touch backend/routes/users.js

# Create files in middleware
touch backend/middleware/auth.js

# Create root backend files
touch backend/server.js
touch backend/package.json
touch backend/.env.example
touch backend/SETUP.md
```

---

## File Contents Quick Reference

| File | Lines | Key Function |
|------|-------|--------------|
| server.js | 150+ | Main server setup |
| package.json | 35 | Dependencies |
| routes/auth.js | 300+ | Authentication (5 endpoints) |
| routes/parking.js | 400+ | Parking CRUD (9 endpoints) |
| routes/users.js | 350+ | User management (8 endpoints) |
| middleware/auth.js | 100+ | JWT verification |

---

## Dependencies Installed

```json
{
  "bcryptjs": "^2.4.3",       // Password hashing
  "cors": "^2.8.5",            // Cross-origin requests
  "dotenv": "^16.3.1",         // Environment variables
  "express": "^4.18.2",        // Web framework
  "jsonwebtoken": "^9.1.1",    // JWT tokens
  "mysql2": "^3.6.2",          // Database driver
  "uuid": "^9.0.0"             // Unique IDs
}
```

---

## Verification Checklist

After creating all files, verify:

- [ ] All 8 files created
- [ ] Folder structure matches guide
- [ ] `package.json` has all dependencies
- [ ] `.env` file created (from .env.example)
- [ ] All imports in server.js work
- [ ] Routes folder has 3 files
- [ ] Middleware folder has 1 file
- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts server on port 5000
- [ ] `http://localhost:5000/api/health` returns ok

---

## Common Creation Issues

| Issue | Solution |
|-------|----------|
| Files not created | Use editor's file creation or terminal `touch` |
| npm install fails | Delete package-lock.json and retry |
| Port 5000 in use | Change PORT in .env |
| Import errors | Check file paths match exactly |
| DB connection fails | Verify .env credentials |

---

## What Each File Does

### server.js
- ✅ Starts the Express server
- ✅ Configures middleware (CORS, JSON parsing)
- ✅ Creates MySQL connection pool
- ✅ Imports all routes
- ✅ Registers API endpoints
- ✅ Error handling

### routes/auth.js
- ✅ User registration
- ✅ User login
- ✅ Token verification
- ✅ Token refresh
- ✅ Password management

### routes/parking.js
- ✅ List all parking locations
- ✅ Get parking details
- ✅ Find nearby parking
- ✅ Create parking (admin)
- ✅ Update parking (admin)
- ✅ Delete parking (admin)
- ✅ Get statistics

### routes/users.js
- ✅ User profile management
- ✅ User listings (admin)
- ✅ User activation/deactivation
- ✅ Role assignment (admin)
- ✅ User deletion (admin)
- ✅ Location permissions

### middleware/auth.js
- ✅ JWT token verification
- ✅ Admin role checking
- ✅ Data ownership verification
- ✅ Rate limiting
- ✅ Request logging

---

## Testing Files

After all files are created, test each route:

```bash
# Test health check
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@maltaparking.com","password":"test"}'

# Test get parking
curl http://localhost:5000/api/parking
```

---

## Summary

**Total files to create: 8**
- 1 main server file
- 1 package configuration
- 1 documentation file
- 2 environment files
- 3 route files
- 1 middleware file

**Time to create: 15 minutes**

All files are provided - just copy them to your backend folder!

