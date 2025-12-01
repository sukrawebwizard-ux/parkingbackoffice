// routes/users.js - User management routes using Supabase

const express = require('express');
const { verifyToken, verifyAdmin, verifyOwnData } = require('../middleware/auth');

module.exports = function(supabase) {
  const router = express.Router();

  // ============================================
  // GET CURRENT USER PROFILE
  // ============================================
  router.get('/me', verifyToken, async (req, res) => {
    try {
      const { userId } = req.user;

      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, phone_number, role, is_active, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(data);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: error.message });
    }
  });

// ============================================
// GET ALL USERS (ADMIN ONLY)
// ============================================
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone_number, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GET USER BY ID (ADMIN OR OWN DATA)
// ============================================
router.get('/:id', verifyToken, verifyOwnData('id'), async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone_number, role, is_active, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// UPDATE USER PROFILE
// ============================================
router.put('/:id/profile', verifyToken, verifyOwnData('id'), async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phoneNumber } = req.body;

    const updateData = {};
    if (fullName) updateData.full_name = fullName;
    if (phoneNumber) updateData.phone_number = phoneNumber;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User profile updated successfully',
      data: data[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// UPDATE USER STATUS (ADMIN ONLY)
// ============================================
router.patch('/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ error: 'isActive field is required' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({
      message: 'User status updated',
      id,
      isActive
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: error.message });
  }
});

  return router;
};

