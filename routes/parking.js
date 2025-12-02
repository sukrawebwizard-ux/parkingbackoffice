const express = require('express');

module.exports = function(supabase) {
  const router = express.Router();

  // ============================================
  // GET /api/parking - Get all parking locations
  // ============================================
  router.get('/', async (req, res) => {
    try {
      const { data: parkingLocations, error } = await supabase
        .from('parking_locations')
        .select('*');

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({
        message: 'Parking locations retrieved successfully',
        data: parkingLocations || [],
        total: parkingLocations?.length || 0
      });
    } catch (error) {
      console.error('Parking retrieval error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // GET /api/parking/:id - Get specific parking location
  // ============================================
  router.get('/:id', async (req, res) => {
    try {
      const { data: parkingLocation, error } = await supabase
        .from('parking_locations')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error || !parkingLocation) {
        return res.status(404).json({ error: 'Parking location not found' });
      }

      res.json({
        message: 'Parking location retrieved successfully',
        data: parkingLocation
      });
    } catch (error) {
      console.error('Parking retrieval error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // POST /api/parking - Create new parking location
  // ============================================
  router.post('/', async (req, res) => {
    try {
      const { name, latitude, longitude, capacity, available_spaces, address, status } = req.body;

      if (!name || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ 
          error: 'Missing required fields: name, latitude, longitude' 
        });
      }

      const { data: newParking, error } = await supabase
        .from('parking_locations')
        .insert({
          name,
          latitude,
          longitude,
          capacity: capacity || 0,
          available_spaces: available_spaces || 0,
          address: address || '',
          status: status || 'available',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(201).json({
        message: 'Parking location created successfully',
        data: newParking
      });
    } catch (error) {
      console.error('Parking creation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // PUT /api/parking/:id - Update parking location
  // ============================================
  router.put('/:id', async (req, res) => {
    try {
      const { name, latitude, longitude, capacity, available_spaces, address, status } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;
      if (capacity !== undefined) updateData.capacity = capacity;
      if (available_spaces !== undefined) updateData.available_spaces = available_spaces;
      if (address !== undefined) updateData.address = address;
      if (status !== undefined) updateData.status = status;

      const { data: updatedParking, error } = await supabase
        .from('parking_locations')
        .update(updateData)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error || !updatedParking) {
        return res.status(404).json({ error: 'Parking location not found' });
      }

      res.json({
        message: 'Parking location updated successfully',
        data: updatedParking
      });
    } catch (error) {
      console.error('Parking update error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // DELETE /api/parking/:id - Delete parking location
  // ============================================
  router.delete('/:id', async (req, res) => {
    try {
      const { error } = await supabase
        .from('parking_locations')
        .delete()
        .eq('id', req.params.id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json({
        message: 'Parking location deleted successfully'
      });
    } catch (error) {
      console.error('Parking deletion error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
