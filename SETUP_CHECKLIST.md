# Malta Parking Finder - Setup Checklist

## Database Setup Checklist

### ✓ SQL File Prepared
- Location: `database/malta_parking.sql`
- Contains: 6 tables + sample data + views
- Ready to run in phpMyAdmin

### Database Details

**Tables Created:**
- [ ] users (3 sample users: 1 admin, 2 regular)
- [ ] parking_locations (8 Malta locations)
- [ ] parking_sessions (2 active sessions)
- [ ] user_profiles (2 profiles)
- [ ] parking_favorites (empty)
- [ ] audit_logs (empty)

**Views Created:**
- [ ] available_parking (query available spots)
- [ ] user_activity (user statistics)

### Sample Data
```
Admin:
  Email: admin@maltaparking.com
  Password: (needs to be hashed)
  
Users:
  john@example.com
  maria@example.com
```

---

## Quick Start Instructions

### 1. Database Connection
```bash
# Configuration
Host: localhost
Port: 3306
Username: root
Password: MySecurePassword123

# Run SQL File
1. Open http://localhost/phpmyadmin
2. Login with credentials above
3. Go to SQL tab
4. Copy content from database/malta_parking.sql
5. Execute
```

### 2. Backend Setup
```bash
cd backend
npm init -y
npm install express mysql2 bcryptjs jsonwebtoken cors dotenv uuid
npm install --save-dev nodemon

# Create files:
- server.js
- .env (see .env.example)
- routes/auth.js
- routes/parking.js
- middleware/auth.js

npm run dev
# Should output: "Server running on http://localhost:5000"
```

### 3. Frontend Connection
```bash
# Already using MapLibre GL (migrated from Mapbox)
# Update .env:
VITE_API_URL=http://localhost:5000

npm run dev
# Frontend at http://localhost:5173
```

---

## File Locations

```
parking/
├── database/
│   ├── malta_parking.sql          ← Run this in phpMyAdmin
│   └── DATABASE_SETUP.md
├── backend/
│   ├── server.js                  ← Create this
│   ├── package.json              ← Create this
│   ├── .env                       ← Create from .env.example
│   ├── routes/
│   │   ├── auth.js              ← Create this
│   │   └── parking.js           ← Create this
│   └── middleware/
│       └── auth.js              ← Create this
├── src/
│   ├── components/
│   │   └── ParkingMap.tsx        ✓ Already using MapLibre GL
│   ├── hooks/
│   │   ├── useAuth.tsx           ← Update to use backend
│   │   └── useParkingLocations.tsx ← Update to use backend
│   └── services/
│       └── api.ts               ← Create this
├── INTEGRATION_GUIDE.md          ← Full setup instructions
├── .env.example                  ← Template for environment vars
└── README.md
```

---

## Database Tables Summary

### users
```
Columns: id, email, password_hash, full_name, phone_number, 
         role (enum), is_active, created_at, updated_at
Sample: 1 admin + 2 users
```

### parking_locations
```
Columns: id, name, address, latitude, longitude, status (enum),
         capacity, occupied_spaces, description, created_at, updated_at
Sample: 8 Malta locations (Valletta, Sliema, St. Julians, etc.)
```

### parking_sessions
```
Columns: id, user_id (FK), parking_location_id (FK), check_in, check_out,
         duration_minutes, status (enum), created_at, updated_at
Sample: 2 active sessions
```

### user_profiles
```
Columns: id, user_id (FK), avatar_url, bio, preferences (JSON),
         location_permission_granted, location_permission_granted_at,
         created_at, updated_at
Sample: 2 profiles
```

### parking_favorites
```
Columns: id, user_id (FK), parking_location_id (FK), created_at
Unique: (user_id, parking_location_id)
```

### audit_logs
```
Columns: id, admin_id (FK), action, entity_type, entity_id,
         old_values (JSON), new_values (JSON), ip_address, user_agent,
         created_at
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/signup      → Create new user
POST   /api/auth/login       → Login user (returns JWT token)
POST   /api/auth/logout      → Logout user
```

### Parking (Authenticated)
```
GET    /api/parking          → Get all parking locations
GET    /api/parking/:id      → Get specific location
POST   /api/parking          → Create (admin only)
PUT    /api/parking/:id      → Update (admin only)
DELETE /api/parking/:id      → Delete (admin only)
```

### Sessions (Authenticated)
```
GET    /api/sessions         → Get user's parking sessions
POST   /api/sessions         → Create new session
PUT    /api/sessions/:id     → Update session (check-out)
```

### Users (Admin only)
```
GET    /api/users            → Get all users
GET    /api/users/:id        → Get specific user
PUT    /api/users/:id        → Update user
DELETE /api/users/:id        → Delete user
```

---

## Environment Variables

### Backend (.env in /backend folder)
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
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=24h

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env in root folder)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Malta Parking Finder
VITE_ENABLE_REAL_TIME_UPDATES=true
```

---

## Testing Credentials

After running the SQL file, use these to test:

```
Email: admin@maltaparking.com
Password: (needs to be generated)
Role: admin

Email: john@example.com
Email: maria@example.com
```

To set passwords:
1. Generate bcrypt hash (see INTEGRATION_GUIDE.md)
2. Update database with hashed password

---

## Migration Summary

✓ **Mapbox → MapLibre GL**
- Removed Mapbox token requirement
- Using free MapLibre demo tiles
- No API key needed
- All functionality preserved

✓ **Supabase → Local MySQL**
- Self-hosted database
- Full control over data
- Backend API for all operations
- JWT authentication

---

## Next Phase Tasks

1. [ ] Run SQL file in phpMyAdmin
2. [ ] Create backend folder structure
3. [ ] Install Node dependencies
4. [ ] Create server.js with routes
5. [ ] Create API service layer in frontend
6. [ ] Update useAuth hook for backend
7. [ ] Update useParkingLocations hook for backend
8. [ ] Test login flow end-to-end
9. [ ] Test parking CRUD operations
10. [ ] Implement admin dashboard
11. [ ] Add real-time updates (WebSockets)
12. [ ] Deploy to production

---

## Quick Commands

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in root)
npm run dev

# Database
# Open http://localhost/phpmyadmin
# Username: root
# Password: MySecurePassword123
```

---

## Support

For detailed setup instructions, see:
- `INTEGRATION_GUIDE.md` - Complete step-by-step guide
- `database/DATABASE_SETUP.md` - Database schema documentation
- `backend/SETUP.md` - Backend implementation details

