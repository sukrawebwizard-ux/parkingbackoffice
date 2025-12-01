// Test script to verify backend API is working
const http = require('http');

function testEndpoint(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          console.log(`${method} ${path}: ${res.statusCode}`);
          console.log(JSON.stringify(json, null, 2));
          resolve(json);
        } catch (e) {
          console.log(`${method} ${path}: ${res.statusCode}`);
          console.log(body);
          resolve(body);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Testing Backend API...\n');
  
  try {
    // Test health check
    console.log('1. Testing health check:');
    await testEndpoint('GET', '/api/health');
    console.log('\n');

    // Test status
    console.log('2. Testing status:');
    await testEndpoint('GET', '/api/status');
    console.log('\n');

    // Test login with admin account
    console.log('3. Testing login with admin account:');
    await testEndpoint('POST', '/api/auth/login', {
      email: 'admin@maltaparking.com',
      password: 'Admin@123456'
    });
    console.log('\n');

    // Test login with wrong password
    console.log('4. Testing login with wrong password:');
    await testEndpoint('POST', '/api/auth/login', {
      email: 'admin@maltaparking.com',
      password: 'wrongpassword'
    });
    console.log('\n');

    // Test signup
    console.log('5. Testing signup:');
    await testEndpoint('POST', '/api/auth/signup', {
      email: 'testuser@example.com',
      password: 'TestPassword123',
      full_name: 'Test User',
      phone_number: '+356 9999 9999'
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

runTests();
