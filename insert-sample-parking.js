// Script to insert sample parking locations and sessions

const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'MySecurePassword123',
  database: process.env.DB_NAME || 'malta_parking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function insertSampleData() {
  const pool = mysql.createPool(config);

  try {
    console.log('📍 Checking for existing parking locations...');
    const connection = await pool.getConnection();
    
    // Check count
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM parking_locations');
    const count = rows[0].count;
    
    console.log(`📍 Found ${count} existing parking locations`);

    if (count === 0) {
      console.log('📍 Inserting sample parking locations...');
      
      const locations = [
        {
          id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
          name: 'Valletta Underground',
          address: '321 Old Bakery Street, Valletta',
          latitude: 35.8954,
          longitude: 14.5149,
          status: 'available',
          capacity: 250,
          occupied_spaces: 45,
          description: 'Historic underground parking in Valletta city center'
        },
        {
          id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
          name: 'Sliema Seafront',
          address: '456 Tower Road, Sliema',
          latitude: 35.9071,
          longitude: 14.4949,
          status: 'available',
          capacity: 180,
          occupied_spaces: 120,
          description: 'Waterfront parking with sea views'
        },
        {
          id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
          name: 'Paceville Entertainment',
          address: '789 Dragonara Road, Paceville',
          latitude: 35.9061,
          longitude: 14.4904,
          status: 'parked',
          capacity: 150,
          occupied_spaces: 142,
          description: 'Parking near nightlife and restaurants'
        },
        {
          id: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
          name: 'Three Cities Terminal',
          address: '111 Marina Street, Vittoriosa',
          latitude: 35.8847,
          longitude: 14.5285,
          status: 'available',
          capacity: 200,
          occupied_spaces: 60,
          description: 'Modern parking facility near ferry terminal'
        },
        {
          id: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
          name: 'San Anton Gardens',
          address: '222 San Anton Street, Attard',
          latitude: 35.8762,
          longitude: 14.4168,
          status: 'being_parked',
          capacity: 120,
          occupied_spaces: 89,
          description: 'Garden-side parking in quiet area'
        },
        {
          id: '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u',
          name: 'Mdina Old City',
          address: '333 Main Gate, Mdina',
          latitude: 35.8804,
          longitude: 14.3974,
          status: 'available',
          capacity: 80,
          occupied_spaces: 32,
          description: 'Parking outside the fortified city'
        },
      ];

      for (const location of locations) {
        try {
          await connection.query(
            'INSERT INTO parking_locations (id, name, address, latitude, longitude, status, capacity, occupied_spaces, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [location.id, location.name, location.address, location.latitude, location.longitude, location.status, location.capacity, location.occupied_spaces, location.description]
          );
          console.log(`✅ Inserted: ${location.name}`);
        } catch (err) {
          console.error(`❌ Failed to insert ${location.name}:`, err.message);
        }
      }
    } else {
      console.log('📍 Sample data already exists, skipping insertion');
    }

    connection.release();
    console.log('\n✅ Sample data check complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

insertSampleData();
