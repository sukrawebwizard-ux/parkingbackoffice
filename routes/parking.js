// routes/parking.js - Parking locations CRUD routes using Supabase

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

module.exports = function(supabase) {
  const router = express.Router();

  // ============================================
  // GET ALL PARKING LOCATIONS
  // ============================================
  router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('parking_locations')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      console.log('🅿️ GET /api/parking - Retrieved', data.length, 'parking locations');
      res.json({
        count: data.length,
        locations: data
      });
    } catch (error) {
      console.error('Get parking locations error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // GET PARKING LOCATION BY ID
  // ============================================
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Parking location ID is required' });
      }

      const { data, error } = await supabase
        .from('parking_locations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Parking location not found' });
      }

      res.json(data);
    } catch (error) {
      console.error('Get parking location error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // CREATE PARKING LOCATION (ADMIN ONLY)
  // ============================================
  router.post('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
      const { name, address, latitude, longitude, capacity, description, status } = req.body;

      // Validate required fields
      if (!name || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ 
          error: 'Required fields: name, latitude, longitude' 
        });
      }

      // Validate coordinates
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({ error: 'Invalid latitude/longitude coordinates' });
      }

      const id = uuidv4();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('parking_locations')
        .insert([{
          id,
          name,
          address: address || null,
          latitude: lat,
          longitude: lon,
          capacity: capacity || null,
          description: description || null,
          status: status || 'available',
          created_at: now,
          updated_at: now
        }])
        .select();

      if (error) throw error;

      console.log('✅ Created parking location:', name);
      res.status(201).json({
        message: 'Parking location created successfully',
        id,
        data: data[0]
      });
    } catch (error) {
      console.error('Create parking location error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // UPDATE PARKING LOCATION (ADMIN ONLY)
  // ============================================
  router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, address, latitude, longitude, status, capacity, occupied_spaces, description } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Parking location ID is required' });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (address !== undefined) updateData.address = address;
      if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
      if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
      if (status !== undefined) updateData.status = status;
      if (capacity !== undefined) updateData.capacity = capacity;
      if (occupied_spaces !== undefined) updateData.occupied_spaces = occupied_spaces;
      if (description !== undefined) updateData.description = description;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('parking_locations')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Parking location not found' });
      }

      console.log('✅ Updated parking location:', id);
      res.json({
        message: 'Parking location updated successfully',
        id,
        data: data[0]
      });
    } catch (error) {
      console.error('Update parking location error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // UPDATE PARKING STATUS
  // ============================================
  router.patch('/:id/status', verifyToken, verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, occupied_spaces } = req.body;

      if (!id || !status) {
        return res.status(400).json({ error: 'Parking ID and status are required' });
      }

      if (!['available', 'parked', 'being_parked'].includes(status)) {
        return res.status(400).json({ 
          error: 'Invalid status. Must be: available, parked, or being_parked' 
        });
      }

      const updateData = { status, updated_at: new Date().toISOString() };
      if (occupied_spaces !== undefined) updateData.occupied_spaces = occupied_spaces;

      const { data, error } = await supabase
        .from('parking_locations')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;

      res.json({
        message: 'Parking status updated',
        id,
        status
      });
    } catch (error) {
      console.error('Update parking status error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // DELETE PARKING LOCATION (ADMIN ONLY)
  // ============================================
  router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Parking location ID is required' });
      }

      const { error } = await supabase
        .from('parking_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Deleted parking location:', id);
      res.json({ message: 'Parking location deleted successfully', id });
    } catch (error) {
      console.error('Delete parking location error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // GET AVAILABLE PARKING LOCATIONS
  // ============================================
  router.get('/available/list', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('parking_locations')
        .select('*')
        .eq('status', 'available')
        .order('name', { ascending: true });

      if (error) throw error;

      res.json({
        count: data.length,
        data: data
      });
    } catch (error) {
      console.error('Get available parking error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
