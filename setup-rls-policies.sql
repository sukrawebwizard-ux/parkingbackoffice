-- Enable RLS on parking_locations table
ALTER TABLE parking_locations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read" ON parking_locations
FOR SELECT USING (true);

-- Policy: Allow authenticated users to insert (will verify admin in app logic)
CREATE POLICY "Allow authenticated insert" ON parking_locations
FOR INSERT WITH CHECK (true);

-- Policy: Allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON parking_locations
FOR UPDATE USING (true);

-- Policy: Allow authenticated users to delete
CREATE POLICY "Allow authenticated delete" ON parking_locations
FOR DELETE USING (true);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to read own data
CREATE POLICY "Users can read own data" ON users
FOR SELECT USING (auth.uid()::text = id);

-- Policy: Allow users to read all users (for admin dashboard)
CREATE POLICY "Allow public read users" ON users
FOR SELECT USING (true);

-- Policy: Allow insert for signup
CREATE POLICY "Allow signup" ON users
FOR INSERT WITH CHECK (true);
