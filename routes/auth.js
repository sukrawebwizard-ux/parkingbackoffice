// routes/auth.js - Authentication routes using Supabase

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

module.exports = function(supabase) {
  const router = express.Router();

  // ============================================
  // Helper Functions
  // ============================================

  const generateToken = (userId, email, role) => {
    return jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET || 'your_secret_key_here',
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );
  };

  const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
  };

  const verifyPassword = async (plainPassword, hash) => {
    return await bcrypt.compare(plainPassword, hash);
  };


// ============================================
// SIGN UP - Register new user
// ============================================
router.post('/signup', async (req, res) => {
  console.log('📝 SIGNUP REQUEST:', { email: req.body?.email, fullName: req.body?.full_name });
  try {
    const { email, password, full_name, phone_number } = req.body;

    // Validate input
    if (!email || !password || !full_name) {
      console.warn('❌ Signup validation failed - Missing fields');
      return res.status(400).json({
        error: 'Missing required fields: email, password, full_name' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase());

    if (checkError) throw checkError;

    if (existingUsers && existingUsers.length > 0) {
      console.warn('⚠️ Signup failed - User already exists:', email);
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const userId = uuidv4();
    const now = new Date().toISOString();

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name,
        phone_number: phone_number || null,
        role: 'user',
        is_active: true,
        created_at: now,
        updated_at: now
      }])
      .select();

    if (createError) throw createError;

    console.log('✅ User registered successfully:', email);
    const token = generateToken(userId, email.toLowerCase(), 'user');

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        full_name,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// LOGIN - Authenticate user
// ============================================
router.post('/login', async (req, res) => {
  console.log('🔐 LOGIN REQUEST:', { email: req.body?.email });
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.warn('❌ Login validation failed - Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from database
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('id, email, password_hash, full_name, role, is_active')
      .eq('email', email.toLowerCase());

    if (queryError) throw queryError;

    if (!users || users.length === 0) {
      console.warn('❌ Login failed - User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is inactive. Contact admin.' });
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, user.password_hash);
    if (!passwordMatch) {
      console.warn('❌ Login failed - Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    console.log('✅ Login successful:', { userId: user.id, email: user.email, role: user.role });
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// VERIFY TOKEN - Check if token is valid
// ============================================
router.post('/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here');

    res.json({
      message: 'Token is valid',
      user: decoded
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ============================================
// LOGOUT - Clear token (frontend handles)
// ============================================
router.post('/logout', (req, res) => {
  // Token clearing is handled on frontend (localStorage)
  res.json({ message: 'Logout successful' });
});

// ============================================
// REFRESH TOKEN - Get new token with valid one
// ============================================
router.post('/refresh', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here');

    // Generate new token
    const newToken = generateToken(decoded.userId, decoded.email, decoded.role);

    res.json({
      message: 'Token refreshed',
      token: newToken
    });
  } catch (error) {
    res.status(401).json({ error: 'Failed to refresh token' });
  }
});

// ============================================
// CHANGE PASSWORD - Update user password
// ============================================
router.post('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Verify token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here');
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const connection = await pool.getConnection();

    try {
      // Get user's current password
      const [users] = await connection.query(
        'SELECT password_hash FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const passwordMatch = await verifyPassword(currentPassword, users[0].password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash and update new password
      const newPasswordHash = await hashPassword(newPassword);
      await connection.query(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [newPasswordHash, decoded.userId]
      );

      res.json({ message: 'Password changed successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// REQUEST PASSWORD RESET - Send reset link
// ============================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const connection = await pool.getConnection();

    try {
      // Check if user exists
      const [users] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [email.toLowerCase()]
      );

      // Don't reveal if email exists (security best practice)
      if (users.length === 0) {
        return res.json({ 
          message: 'If the email exists, a password reset link will be sent' 
        });
      }

      // TODO: Generate reset token and send email
      // For now, just return success message

      res.json({ 
        message: 'If the email exists, a password reset link will be sent to your inbox' 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: error.message });
  }
});

  return router;
};
