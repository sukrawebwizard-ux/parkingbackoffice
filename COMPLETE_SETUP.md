# Malta Parking Finder - Complete Project Setup

A full-stack parking management application for Malta with admin and user roles.

## 📋 Quick Links

- **Database Setup**: `database/malta_parking.sql`
- **Integration Guide**: `INTEGRATION_GUIDE.md`
- **Setup Checklist**: `SETUP_CHECKLIST.md`
- **Database Documentation**: `database/DATABASE_SETUP.md`
- **Backend Setup**: `backend/SETUP.md`

---

## 🚀 Quick Start

### Step 1: Database Setup (5 minutes)
```bash
1. Open http://localhost/phpmyadmin
2. Login: root / MySecurePassword123
3. Go to SQL tab
4. Copy content from: database/malta_parking.sql
5. Execute
```

### Step 2: Backend Setup (10 minutes)
```bash
cd backend
npm install express mysql2 bcryptjs jsonwebtoken cors dotenv uuid
npm install --save-dev nodemon

# Create .env file with database credentials
npm run dev
```

### Step 3: Frontend Setup (Already done)
```bash
# In root folder
npm run dev
```

---

## 📁 Project Structure

```
parking/
├── database/
│   ├── malta_parking.sql          ← SQL to run in phpMyAdmin
│   └── DATABASE_SETUP.md
├── backend/
│   ├── server.js                  ← Main server file
│   ├── package.json
│   ├── .env                       ← Environment variables
│   ├── routes/
│   │   ├── auth.js               ← Authentication endpoints
│   │   ├── parking.js            ← Parking CRUD endpoints
│   │   └── users.js              ← User management endpoints
│   ├── middleware/
│   │   └── auth.js               ← JWT verification
│   └── SETUP.md
├── src/
│   ├── components/
│   │   ├── ParkingMap.tsx        ✓ Uses MapLibre GL
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth.tsx           ← Connect to backend
│   │   ├── useParkingLocations.tsx ← Connect to backend
│   │   └── ...
│   └── services/
│       └── api.ts                ← API client (create this)
├── INTEGRATION_GUIDE.md           ← Complete setup instructions
├── SETUP_CHECKLIST.md
├── .env.example
├── vite.config.ts
├── package.json
└── README.md (this file)
```

---

## 🗄️ Database Overview

### Tables Created
1. **users** - User accounts with JWT authentication
2. **parking_locations** - All parking spots in Malta
3. **parking_sessions** - User parking history
4. **user_profiles** - Extended user information
5. **parking_favorites** - Bookmarked parking spots
6. **audit_logs** - Admin action tracking

### Sample Data
- **1 Admin User**: admin@maltaparking.com
- **2 Regular Users**: john@example.com, maria@example.com
- **8 Parking Locations**: Across Malta (Valletta, Sliema, St. Julians, etc.)

### Views
- `available_parking` - Query available spots with statistics
- `user_activity` - User parking statistics

---

## 🔐 Authentication

### Flow
1. User signs up/logs in via Auth page
2. Backend validates credentials and returns JWT token
3. Token stored in localStorage
4. Token sent in Authorization header for protected routes
5. Backend verifies token and grants access

### Token Structure
```json
{
  "userId": "user-id-here",
  "email": "user@example.com",
  "role": "admin" // or "user"
}
```

### Sample Credentials
```
Admin:
  Email: admin@maltaparking.com
  Password: (needs bcrypt hash - see password generation)

Users:
  john@example.com
  maria@example.com
```

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/signup              Create new user
POST   /api/auth/login               Login user
POST   /api/auth/logout              Logout user
POST   /api/auth/verify              Verify token
POST   /api/auth/refresh             Refresh token
POST   /api/auth/change-password     Change password
POST   /api/auth/forgot-password     Request password reset
```

### Parking Locations
```
GET    /api/parking                  Get all locations
GET    /api/parking/:id              Get specific location
GET    /api/parking/nearby/:lat/:lon Get nearby parking
GET    /api/parking/available/list   Get available locations
POST   /api/parking                  Create (admin only)
PUT    /api/parking/:id              Update (admin only)
PATCH  /api/parking/:id/status       Update status (admin only)
DELETE /api/parking/:id              Delete (admin only)
GET    /api/parking/stats/summary    Get parking statistics
```

### Users
```
GET    /api/users/me                 Get current user profile
GET    /api/users                    Get all users (admin only)
GET    /api/users/:id                Get user details
PUT    /api/users/:id/profile        Update user profile
PATCH  /api/users/:id/status         Update active status (admin only)
PATCH  /api/users/:id/role           Update user role (admin only)
DELETE /api/users/:id                Delete user (admin only)
GET    /api/users/stats/summary      Get user statistics (admin only)
PATCH  /api/users/:id/location-permission Grant location access
```

---

## 🔧 Environment Variables

### Backend (.env in /backend)
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=MySecurePassword123
DB_NAME=malta_parking

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=malta_parking_jwt_secret_2024
JWT_EXPIRY=24h

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env in root)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Malta Parking Finder
VITE_ENABLE_REAL_TIME_UPDATES=true
VITE_ENABLE_USER_FAVORITES=true
VITE_ENABLE_ADMIN_PANEL=true
```

---

## 🎨 Features

### Phase 1: Setup ✅
- [x] Frontend: React + TypeScript
- [x] Backend: Node.js + Express
- [x] Database: MySQL with 6 tables
- [x] Map: MapLibre GL (free, no token needed)

### Phase 2: Authentication ✅
- [x] Sign Up with validation
- [x] Login with JWT
- [x] Role-based access (admin/user)
- [x] Location permission flow

### Phase 3: User Experience ✅
- [x] Display user location
- [x] Show parking spots on map
- [x] Color-coded pins (green/red/yellow)
- [x] Parking details bottom sheet
- [x] List view toggle
- [x] User profile page

### Phase 4: Admin Panel
- [ ] Dashboard with statistics
- [ ] Parking management (CRUD)
- [ ] Users list with activation toggle
- [ ] Audit logs

### Phase 5: Integration
- [x] Backend API endpoints created
- [ ] Connect all frontend hooks to backend
- [ ] WebSocket real-time updates
- [ ] Email notifications

### Phase 6: UI/UX
- [x] Mobile-friendly design
- [x] Color scheme (green/red/yellow)
- [x] Icons and smooth animations
- [x] Bottom sheets and modals

### Phase 7: Deployment
- [ ] Deploy backend (Heroku, Railway, etc.)
- [ ] Build frontend (npm run build)
- [ ] Environment variables configuration
- [ ] Database backups

---

## 🔑 Admin Features

### Admin Dashboard
- View all users and parking locations
- Statistics (total users, active sessions, occupancy rate)
- User activation/deactivation
- Create/Edit/Delete parking locations
- Audit logs of all admin actions

### Admin Permissions
```
✓ View all parking locations
✓ Create parking locations
✓ Edit parking location details
✓ Delete parking locations
✓ Update parking status
✓ View all users
✓ Activate/deactivate users
✓ Change user roles
✓ View system statistics
✓ View audit logs
```

---

## 📊 Database Schema

### users
```sql
id (UUID)
email (UNIQUE)
password_hash
full_name
phone_number
role (admin|user)
is_active (BOOLEAN)
created_at, updated_at
```

### parking_locations
```sql
id (UUID)
name
address
latitude, longitude
status (available|parked|being_parked)
capacity, occupied_spaces
description
created_at, updated_at
```

### parking_sessions
```sql
id (UUID)
user_id (FK → users)
parking_location_id (FK → parking_locations)
check_in, check_out (TIMESTAMPS)
duration_minutes
status (active|completed|cancelled)
created_at, updated_at
```

### user_profiles
```sql
id (UUID)
user_id (FK → users, UNIQUE)
avatar_url
bio, preferences (JSON)
location_permission_granted (BOOLEAN)
location_permission_granted_at
created_at, updated_at
```

### parking_favorites
```sql
id (UUID)
user_id (FK → users)
parking_location_id (FK → parking_locations)
created_at
UNIQUE(user_id, parking_location_id)
```

### audit_logs
```sql
id (UUID)
admin_id (FK → users)
action (CREATE|UPDATE|DELETE|etc)
entity_type (user|parking_location|etc)
entity_id
old_values, new_values (JSON)
ip_address, user_agent
created_at
```

---

## 🛠️ Development Workflow

### Terminal 1: Backend Server
```bash
cd backend
npm run dev
# Listens on http://localhost:5000
```

### Terminal 2: Frontend Development
```bash
npm run dev
# Runs on http://localhost:5173
```

### Terminal 3: Database Admin
```
http://localhost/phpmyadmin
Username: root
Password: MySecurePassword123
```

---

## 🔐 Password Generation

To set user passwords with bcrypt:

```javascript
// generate-password.js
const bcrypt = require('bcryptjs');

async function generatePassword(plainPassword) {
  const hash = await bcrypt.hash(plainPassword, 10);
  console.log(`Password: ${plainPassword}`);
  console.log(`Hash: ${hash}`);
}

generatePassword('AdminPassword123');
generatePassword('UserPassword123');
```

Run: `node generate-password.js`

Then update database:
```sql
UPDATE users 
SET password_hash = '$2b$10$...' 
WHERE email = 'admin@maltaparking.com';
```

---

## 🧪 Testing Endpoints with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@maltaparking.com","password":"AdminPassword123"}'
```

### Get Parking Locations (with token)
```bash
curl http://localhost:5000/api/parking \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Parking Location (admin only)
```bash
curl -X POST http://localhost:5000/api/parking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name":"New Location",
    "latitude":35.9,
    "longitude":14.5,
    "capacity":50
  }'
```

---

## 📱 Frontend Integration

### Update useAuth Hook
```typescript
import API from '@/services/api';

// Replace Supabase calls with API calls
const signIn = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  localStorage.setItem('auth_token', response.data.token);
  return response.data;
};
```

### Update useParkingLocations Hook
```typescript
import API from '@/services/api';

const fetchLocations = async () => {
  const response = await API.get('/parking');
  setLocations(response.data.data);
};
```

### Create API Service
```typescript
// src/services/api.ts
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
```

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Verify MySQL is running
mysql -h localhost -u root -p

# Check .env values
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=MySecurePassword123
```

### Port Already in Use
```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill the process or use different port
```

### CORS Errors
```bash
# Make sure in backend .env:
FRONTEND_URL=http://localhost:5173

# And in frontend .env:
VITE_API_URL=http://localhost:5000
```

### Token Issues
- Verify token is saved in localStorage
- Check Authorization header format: `Bearer <token>`
- Ensure JWT_SECRET matches between server and token generation

---

## 📚 Additional Resources

- **MapLibre GL**: https://maplibre.org/
- **Express.js**: https://expressjs.com/
- **MySQL Documentation**: https://dev.mysql.com/
- **JWT**: https://jwt.io/
- **React Hook Form**: https://react-hook-form.com/

---

## 📞 Support

For detailed setup instructions, refer to:
1. `INTEGRATION_GUIDE.md` - Step-by-step integration
2. `SETUP_CHECKLIST.md` - Quick checklist
3. `database/DATABASE_SETUP.md` - Database details
4. `backend/SETUP.md` - Backend implementation

---

## 📝 License

This project is part of the Malta Parking Finder application.

---

## ✅ Checklist

- [ ] Run SQL file in phpMyAdmin
- [ ] Create backend folder structure
- [ ] Install Node.js dependencies
- [ ] Create server.js with all routes
- [ ] Set up .env files (backend and frontend)
- [ ] Create API service layer in frontend
- [ ] Update authentication hooks
- [ ] Test login flow
- [ ] Test parking CRUD operations
- [ ] Build admin dashboard
- [ ] Implement real-time updates
- [ ] Deploy to production

---

**Happy Parking! 🚗**

