const express = require('express');

module.exports = function(supabase) {
  const router = express.Router();

  // ============================================
  // GET /api/users - Get all users (admin only)
  // ============================================
  router.get('/', async (req, res) => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, full_name, phone_number, created_at');

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({
        message: 'Users retrieved successfully',
        data: users || [],
        total: users?.length || 0
      });
    } catch (error) {
      console.error('Users retrieval error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // GET /api/users/:id - Get specific user
  // ============================================
  router.get('/:id', async (req, res) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, phone_number, created_at')
        .eq('id', req.params.id)
        .single();

      if (error || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      console.error('User retrieval error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // PUT /api/users/:id - Update user profile
  // ============================================
  router.put('/:id', async (req, res) => {
    try {
      const { full_name, email } = req.body;

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          full_name,
          email
        })
        .eq('id', req.params.id)
        .select('id, email, full_name, created_at')
        .single();

      if (error || !updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('User update error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // DELETE /api/users/:id - Delete user
  // ============================================
  router.delete('/:id', async (req, res) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', req.params.id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('User deletion error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
