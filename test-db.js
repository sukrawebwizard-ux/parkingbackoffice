const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'malta_parking',
    });

    console.log('✅ Database connected successfully!');

    // Test query
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables in database:', tables);

    const [locations] = await connection.execute('SELECT COUNT(*) as count FROM parking_locations');
    console.log('Parking locations count:', locations);

    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
