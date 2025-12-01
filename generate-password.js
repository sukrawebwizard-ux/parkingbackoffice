// Script to generate bcrypt password hashes for testing
const bcrypt = require('bcryptjs');

async function generatePasswordHash(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    return hash;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Generate hashes for test accounts
console.log('Generating password hashes for test accounts...\n');

generatePasswordHash('Admin@123456').then(() => {
  console.log('');
  generatePasswordHash('User@123456');
});
