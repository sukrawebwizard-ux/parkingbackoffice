const mysql = require('mysql2/promise');

async function updatePasswords() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'MySecurePassword123',
      database: 'malta_parking'
    });

    const correctHash = '$2a$10$yZO/00IgUO..6cf91lm2zOOUS.hCmv25au5BZ2o427ZMVhDdFYRt6';

    await conn.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [correctHash, 'john@example.com']
    );

    await conn.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [correctHash, 'maria@example.com']
    );

    console.log('✓ Passwords updated successfully!');
    console.log('Users can now login with password: User@123456');
    
    await conn.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updatePasswords();
