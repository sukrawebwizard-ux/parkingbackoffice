-- Malta Parking Finder Database Schema
-- Run this in phpMyAdmin to create the complete database

-- Create Database
CREATE DATABASE IF NOT EXISTS malta_parking;
USE malta_parking;

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
);

-- ============================================
-- Parking Locations Table
-- ============================================
CREATE TABLE IF NOT EXISTS parking_locations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  status ENUM('available', 'parked', 'being_parked') NOT NULL DEFAULT 'available',
  capacity INT DEFAULT 1,
  occupied_spaces INT DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_location (latitude, longitude),
  INDEX idx_name (name)
);

-- ============================================
-- Parking Sessions Table (User parking history)
-- ============================================
CREATE TABLE IF NOT EXISTS parking_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  parking_location_id VARCHAR(36) NOT NULL,
  check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  check_out TIMESTAMP,
  duration_minutes INT,
  status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parking_location_id) REFERENCES parking_locations(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_parking_location_id (parking_location_id),
  INDEX idx_status (status),
  INDEX idx_check_in (check_in)
);

-- ============================================
-- User Profiles Table (Extended user info)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  avatar_url VARCHAR(500),
  bio TEXT,
  preferences JSON,
  location_permission_granted BOOLEAN DEFAULT FALSE,
  location_permission_granted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- ============================================
-- Parking Favorites Table
-- ============================================
CREATE TABLE IF NOT EXISTS parking_favorites (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  parking_location_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parking_location_id) REFERENCES parking_locations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, parking_location_id),
  INDEX idx_user_id (user_id),
  INDEX idx_parking_location_id (parking_location_id)
);

-- ============================================
-- Audit Logs Table (Track admin actions)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  admin_id VARCHAR(36) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(36),
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_admin_id (admin_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);

-- ============================================
-- Sample Data for Testing
-- ============================================

-- Insert Sample Admin User
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_active)
VALUES (
  'admin-001',
  'admin@maltaparking.com',
  '$2b$10$YourHashedPasswordHere', -- Use bcrypt hashed password
  'Admin User',
  '+356 2131 3131',
  'admin',
  TRUE
);

-- Insert Sample Regular Users
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_active)
VALUES 
(
  'user-001',
  'john@example.com',
  '$2b$10$YourHashedPasswordHere',
  'John Abela',
  '+356 9123 4567',
  'user',
  TRUE
),
(
  'user-002',
  'maria@example.com',
  '$2b$10$YourHashedPasswordHere',
  'Maria Vella',
  '+356 9234 5678',
  'user',
  TRUE
);

-- Insert Sample Parking Locations (Malta)
INSERT INTO parking_locations (id, name, address, latitude, longitude, status, capacity, occupied_spaces, description)
VALUES
(
  'loc-001',
  'Valletta Main Plaza',
  'Republic Street, Valletta',
  35.8989,
  14.5146,
  'available',
  50,
  15,
  'Prime parking in Valletta city center'
),
(
  'loc-002',
  'Sliema Business Hub',
  'The Strand, Sliema',
  35.8989,
  14.4933,
  'parked',
  40,
  38,
  'Modern parking complex near commercial area'
),
(
  'loc-003',
  'St. Julians Entertainment',
  'Main Street, St. Julians',
  35.9155,
  14.4989,
  'available',
  60,
  25,
  'Multi-level parking with modern facilities'
),
(
  'loc-004',
  'Paceville Night Life',
  'Dragonara Road, Paceville',
  35.9189,
  14.5033,
  'being_parked',
  45,
  44,
  'Covered parking near clubs and restaurants'
),
(
  'loc-005',
  'Mosta Basilica Parking',
  'Parish Square, Mosta',
  35.8822,
  14.4233,
  'available',
  80,
  20,
  'Large parking area near famous basilica'
),
(
  'loc-006',
  'Birkirkara Shopping Center',
  'Main Street, Birkirkara',
  35.8733,
  14.4500,
  'available',
  100,
  65,
  'Largest shopping center parking in Malta'
),
(
  'loc-007',
  'Mdina Historic Parking',
  'City Gate, Mdina',
  35.8861,
  14.3989,
  'parked',
  35,
  34,
  'Ancient capital parking with historic charm'
),
(
  'loc-008',
  'Marsaxlokk Harbor View',
  'Xatt L-Ahmar, Marsaxlokk',
  35.8361,
  14.5439,
  'available',
  50,
  10,
  'Scenic harbor-side parking'
);

-- Insert Sample User Profiles
INSERT INTO user_profiles (id, user_id, location_permission_granted, location_permission_granted_at)
VALUES
(
  'profile-001',
  'user-001',
  TRUE,
  NOW()
),
(
  'profile-002',
  'user-002',
  TRUE,
  NOW()
);

-- Insert Sample Parking Sessions
INSERT INTO parking_sessions (id, user_id, parking_location_id, check_in, check_out, duration_minutes, status)
VALUES
(
  'session-001',
  'user-001',
  'loc-001',
  DATE_SUB(NOW(), INTERVAL 2 HOUR),
  NULL,
  NULL,
  'active'
),
(
  'session-002',
  'user-002',
  'loc-003',
  DATE_SUB(NOW(), INTERVAL 45 MINUTE),
  NULL,
  NULL,
  'active'
);

-- ============================================
-- Create Indexes for Performance
-- ============================================

-- Users table indexes
ALTER TABLE users ADD INDEX idx_created_at (created_at);

-- Parking locations indexes
ALTER TABLE parking_locations ADD INDEX idx_updated_at (updated_at);

-- Parking sessions indexes
ALTER TABLE parking_sessions ADD INDEX idx_updated_at (updated_at);

-- ============================================
-- Create Views for Common Queries
-- ============================================

-- View for available parking spots
CREATE OR REPLACE VIEW available_parking AS
SELECT 
  id,
  name,
  address,
  latitude,
  longitude,
  status,
  capacity,
  occupied_spaces,
  (capacity - occupied_spaces) as available_spaces,
  ROUND(((capacity - occupied_spaces) / capacity) * 100, 2) as availability_percentage,
  updated_at
FROM parking_locations
WHERE status = 'available';

-- View for user activity
CREATE OR REPLACE VIEW user_activity AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  COUNT(DISTINCT ps.id) as total_parking_sessions,
  SUM(CASE WHEN ps.status = 'active' THEN 1 ELSE 0 END) as active_sessions,
  MAX(ps.check_in) as last_parking_date
FROM users u
LEFT JOIN parking_sessions ps ON u.id = ps.user_id
GROUP BY u.id, u.email, u.full_name;

-- ============================================
-- Database Setup Complete
-- ============================================

-- ============================================
-- Insert Test Data
-- ============================================

-- Admin User
-- Email: admin@maltaparking.com
-- Password: Admin@123456
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_active)
VALUES (
  'admin-001',
  'admin@maltaparking.com',
  '$2a$10$9T/JWpFgutMkGkaBrt2umOsY7kzWq007RMyQ5pDQ2.ui7ysnnQKWq',
  'Admin User',
  '+356 2131 3131',
  'admin',
  TRUE
);

-- Regular User 1
-- Email: john@example.com
-- Password: User@123456
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_active)
VALUES (
  'user-001',
  'john@example.com',
  '$2a$10$yZO/00IgUO..6cf91lm2zOOUS.hCmv25au5BZ2o427ZMVhDdFYRt6',
  'John Smith',
  '+356 9988 7766',
  'user',
  TRUE
);

-- Regular User 2
-- Email: maria@example.com
-- Password: User@123456
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_active)
VALUES (
  'user-002',
  'maria@example.com',
  '$2a$10$yZO/00IgUO..6cf91lm2zOOUS.hCmv25au5BZ2o427ZMVhDdFYRt6',
  'Maria Garcia',
  '+356 9944 5533',
  'user',
  TRUE
);

-- Sample Parking Locations
INSERT INTO parking_locations (id, name, address, latitude, longitude, status, capacity, occupied_spaces, description)
VALUES
  ('parking-001', 'Valletta Central Car Park', 'South Street, Valletta', 35.8989, 14.5146, 'available', 150, 45, 'Main parking in Valletta center'),
  ('parking-002', 'Sliema Seafront', 'The Strand, Sliema', 35.9237, 14.4934, 'available', 200, 120, 'Beachfront parking'),
  ('parking-003', 'Paceville Garage', 'St George Street, Paceville', 35.9320, 14.4938, 'available', 300, 250, 'Large underground parking'),
  ('parking-004', 'Mosta Garage', 'Victory Street, Mosta', 35.8886, 14.4238, 'available', 100, 30, 'Small local parking'),
  ('parking-005', 'Birgu Harbor', 'Main Street, Birgu', 35.8877, 14.5366, 'available', 80, 20, 'Historic area parking'),
  ('parking-006', 'Three Cities Business Park', 'Industrial Road, Vittoriosa', 35.8850, 14.5400, 'available', 250, 180, 'Business park parking'),
  ('parking-007', 'Mdina Old City', 'Bastion Street, Mdina', 35.8808, 14.4024, 'available', 120, 85, 'Historic city parking'),
  ('parking-008', 'Airport Parking', 'Airport Road, Luqa', 35.8573, 14.4754, 'available', 500, 350, 'Airport short/long term parking');

