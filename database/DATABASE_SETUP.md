# Malta Parking Finder - Backend Setup Guide

## Database Setup

### Step 1: Create the Database
1. Open phpMyAdmin (localhost/phpmyadmin)
2. Login with:
   - Username: `root`
   - Password: `MySecurePassword123`
3. Go to the SQL tab
4. Copy all the content from `database/malta_parking.sql`
5. Paste it into the SQL editor
6. Click "Go" to execute

### Step 2: Verify Tables Created
The following tables should be created:
- **users** - User accounts with role-based access
- **parking_locations** - All parking spots in Malta
- **parking_sessions** - User parking history
- **user_profiles** - Extended user information
- **parking_favorites** - Bookmarked parking spots
- **audit_logs** - Admin action tracking

### Step 3: Database Structure

#### USERS Table
```
- id (UUID) - Primary Key
- email - Unique email address
- password_hash - Bcrypt hashed password
- full_name - User's full name
- phone_number - Contact number
- role - 'admin' or 'user'
- is_active - Account active status
- created_at, updated_at - Timestamps
```

#### PARKING_LOCATIONS Table
```
- id (UUID) - Primary Key
- name - Location name
- address - Physical address
- latitude, longitude - GPS coordinates
- status - 'available', 'parked', 'being_parked'
- capacity - Total parking spaces
- occupied_spaces - Currently occupied spaces
- description - Location details
- created_at, updated_at - Timestamps
```

#### PARKING_SESSIONS Table
```
- id (UUID) - Primary Key
- user_id (FK) - References users.id
- parking_location_id (FK) - References parking_locations.id
- check_in - Session start time
- check_out - Session end time (nullable)
- duration_minutes - Total duration
- status - 'active', 'completed', 'cancelled'
- created_at, updated_at - Timestamps
```

#### USER_PROFILES Table
```
- id (UUID) - Primary Key
- user_id (FK) - References users.id (unique)
- avatar_url - User profile picture
- bio - User biography
- preferences - JSON stored preferences
- location_permission_granted - Boolean
- location_permission_granted_at - Timestamp
- created_at, updated_at - Timestamps
```

#### PARKING_FAVORITES Table
```
- id (UUID) - Primary Key
- user_id (FK) - References users.id
- parking_location_id (FK) - References parking_locations.id
- created_at - Timestamp
```

#### AUDIT_LOGS Table
```
- id (UUID) - Primary Key
- admin_id (FK) - References users.id
- action - Action type (CREATE, UPDATE, DELETE, etc.)
- entity_type - Type of entity modified (user, parking_location, etc.)
- entity_id - ID of modified entity
- old_values - JSON of previous values
- new_values - JSON of new values
- ip_address - Admin's IP address
- user_agent - Browser information
- created_at - Timestamp
```

## Default Test Credentials

```
Admin Account:
Email: admin@maltaparking.com
Name: Admin User
Role: admin

User 1:
Email: john@example.com
Name: John Abela
Role: user

User 2:
Email: maria@example.com
Name: Maria Vella
Role: user
```

**Note:** Passwords are hashed and need to be set. See password generation instructions in the SQL file.

## Sample Parking Locations

8 parking locations are pre-populated across Malta:
1. Valletta Main Plaza - 35.8989, 14.5146
2. Sliema Business Hub - 35.8989, 14.4933
3. St. Julians Entertainment - 35.9155, 14.4989
4. Paceville Night Life - 35.9189, 14.5033
5. Mosta Basilica Parking - 35.8822, 14.4233
6. Birkirkara Shopping Center - 35.8733, 14.4500
7. Mdina Historic Parking - 35.8861, 14.3989
8. Marsaxlokk Harbor View - 35.8361, 14.5439

## Next Steps

1. Run the SQL file in phpMyAdmin
2. Set up Node.js backend with these API endpoints:
   - POST /api/auth/signup - User registration
   - POST /api/auth/login - User login
   - POST /api/auth/logout - User logout
   - GET /api/parking - Get all parking locations
   - GET /api/parking/:id - Get specific parking location
   - POST /api/parking - Create parking (admin only)
   - PUT /api/parking/:id - Update parking (admin only)
   - DELETE /api/parking/:id - Delete parking (admin only)
   - GET /api/users - Get all users (admin only)
   - GET /api/sessions - Get parking sessions
   - POST /api/sessions - Create parking session

3. Connect React frontend to backend APIs
4. Implement JWT authentication
5. Add real-time updates with WebSockets

