# Malta Parking Finder - Complete Integration Guide

## Overview
This guide helps you set up the complete Malta Parking Finder application with:
- React Frontend (already set up)
- Node.js/Express Backend
- MySQL Database (localhost)

---

## STEP 1: Database Setup ✓

### 1.1 Create Database
1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Login:
   - Username: `root`
   - Password: `MySecurePassword123`
3. Click the "SQL" tab
4. Open file: `database/malta_parking.sql`
5. Copy all content and paste into phpMyAdmin SQL editor
6. Click "Go"

### 1.2 Verify Tables
After running the SQL, you should see these tables in `malta_parking` database:
```
✓ users
✓ parking_locations
✓ parking_sessions
✓ user_profiles
✓ parking_favorites
✓ audit_logs
```

### 1.3 Verify Sample Data
```sql
-- In phpMyAdmin SQL tab, run:
SELECT COUNT(*) FROM users;          -- Should show 3
SELECT COUNT(*) FROM parking_locations;  -- Should show 8
```

---

## STEP 2: Backend Setup

### 2.1 Create Backend Folder Structure
```
parking/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── routes/
│   │   ├── auth.js
│   │   ├── parking.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── parkingController.js
│   └── config/
│       └── database.js
└── frontend/
    └── ... (your React app)
```

### 2.2 Initialize Node.js Project
```bash
cd backend
npm init -y
```

### 2.3 Install Dependencies
```bash
npm install express mysql2 bcryptjs jsonwebtoken cors dotenv uuid
npm install --save-dev nodemon
```

### 2.4 Create .env File
Create `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=MySecurePassword123
DB_NAME=malta_parking

PORT=5000
NODE_ENV=development

JWT_SECRET=malta_parking_jwt_secret_key_2024
JWT_EXPIRY=24h

FRONTEND_URL=http://localhost:5173
```

### 2.5 Create server.js
Create `backend/server.js` (see SETUP.md for full code)

### 2.6 Create Routes
- `backend/routes/auth.js` - Authentication endpoints
- `backend/routes/parking.js` - Parking CRUD endpoints

### 2.7 Create Middleware
- `backend/middleware/auth.js` - JWT verification

### 2.8 Start Backend
```bash
npm run dev
```

Expected output:
```
Server running on http://localhost:5000
```

---

## STEP 3: Frontend Integration

### 3.1 Update Frontend .env
Your frontend `.env` should have:
```env
VITE_API_URL=http://localhost:5000
```

### 3.2 Create API Service Layer
Create `src/services/api.ts`:

```typescript
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
```

### 3.3 Update useAuth Hook
Modify `src/hooks/useAuth.tsx` to use backend:

```typescript
import API from '@/services/api';

export function useAuth() {
  const signIn = async (email: string, password: string) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      localStorage.setItem('auth_token', response.data.token);
      return { error: null, data: response.data };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      const response = await API.post('/auth/signup', {
        email,
        password,
        fullName: metadata.full_name,
        phoneNumber: metadata.phone_number,
      });
      return { error: null, data: response.data };
    } catch (error) {
      return { error };
    }
  };

  // ... rest of the hook
}
```

### 3.4 Update useParkingLocations Hook
Modify `src/hooks/useParkingLocations.tsx`:

```typescript
import API from '@/services/api';

export function useParkingLocations() {
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await API.get('/parking');
        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching parking locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return { locations, loading };
}
```

---

## STEP 4: Test the Connection

### 4.1 Test Backend Health
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 4.2 Test Authentication
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@maltaparking.com","password":"AdminPassword123"}'
```

### 4.3 Test Parking API
```bash
curl http://localhost:5000/api/parking
```

---

## STEP 5: Frontend Setup

### 5.1 Start Frontend
```bash
cd parking (root folder)
npm run dev
```

### 5.2 Access Application
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Database: `http://localhost/phpmyadmin`

---

## STEP 6: Update ParkingMap Component

Since you migrated to MapLibre GL, update the component to use the backend API:

```typescript
import { useEffect } from 'react';
import { useParkingLocations } from '@/hooks/useParkingLocations';

export default function ParkingMap({
  userLocation,
  onLocationSelect,
}: ParkingMapProps) {
  const { locations } = useParkingLocations();

  // Map will now use backend data instead of Supabase
  // Rest of the component remains the same
}
```

---

## STEP 7: Default Test Accounts

After database setup, you have these accounts:

### Admin Account
```
Email: admin@maltaparking.com
Password: (needs to be set - see password generation below)
Role: admin
Name: Admin User
```

### User Accounts
```
Email: john@example.com
Email: maria@example.com
```

### Generate Bcrypt Passwords
Since passwords are hashed, you need to generate them. Run this Node.js script:

```javascript
// generate-password.js
const bcrypt = require('bcryptjs');

async function generatePassword(plainPassword) {
  const hash = await bcrypt.hash(plainPassword, 10);
  console.log(`Password: ${plainPassword}`);
  console.log(`Hash: ${hash}`);
}

// Generate hash for "AdminPassword123"
generatePassword('AdminPassword123');
```

Then update the database:
```sql
UPDATE users 
SET password_hash = '$2b$10$...' -- paste the generated hash
WHERE email = 'admin@maltaparking.com';
```

---

## STEP 8: Running Everything

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
npm run dev
```

### Terminal 3 - Database (phpMyAdmin)
```
http://localhost/phpmyadmin
```

---

## API Documentation

### Authentication Endpoints

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "fullName": "New User",
  "phoneNumber": "+356 9123 4567"
}

Response:
{
  "message": "User created successfully"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@maltaparking.com",
  "password": "AdminPassword123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "admin-001",
    "email": "admin@maltaparking.com",
    "fullName": "Admin User",
    "role": "admin"
  }
}
```

### Parking Endpoints

#### Get All Parking Locations
```
GET /api/parking
Authorization: Bearer {token}

Response:
[
  {
    "id": "loc-001",
    "name": "Valletta Main Plaza",
    "address": "Republic Street, Valletta",
    "latitude": 35.8989,
    "longitude": 14.5146,
    "status": "available",
    "capacity": 50,
    "occupied_spaces": 15
  },
  ...
]
```

#### Create Parking Location (Admin Only)
```
POST /api/parking
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "New Parking Spot",
  "address": "Some Address",
  "latitude": 35.9000,
  "longitude": 14.5000,
  "capacity": 30,
  "description": "New parking facility"
}

Response:
{
  "id": "loc-009",
  "message": "Parking location created"
}
```

#### Update Parking Location (Admin Only)
```
PUT /api/parking/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "parked",
  "occupied_spaces": 28
}
```

#### Delete Parking Location (Admin Only)
```
DELETE /api/parking/:id
Authorization: Bearer {admin_token}

Response:
{
  "message": "Parking location deleted"
}
```

---

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# If in use, kill the process or use different port
```

### Database Connection Error
```bash
# Verify credentials in .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=MySecurePassword123

# Test connection with MySQL CLI
mysql -h localhost -u root -p
```

### CORS Errors
Make sure `FRONTEND_URL=http://localhost:5173` is set in backend `.env`

### Token Issues
Check that token is saved in localStorage and sent in Authorization header

---

## Next Steps

1. ✅ Set up database with SQL file
2. ✅ Create Node.js backend with Express
3. ✅ Implement JWT authentication
4. ✅ Connect React frontend to backend APIs
5. ⏳ Add real-time updates (WebSockets)
6. ⏳ Implement admin dashboard
7. ⏳ Add parking sessions tracking
8. ⏳ Deploy to production

