const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let supabase = null;
let isConnected = false;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    isConnected = true;
  } catch (error) {
    console.error('Supabase init failed:', error);
    isConnected = false;
  }
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { id } = req.query;
  console.log('🔍 Dynamic route request:', req.method, 'for client ID:', id);
  
  try {
    if (req.method === 'GET') {
      // Get single client by ID
      if (isConnected && supabase) {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Supabase error:', error);
          return res.status(404).json({ error: 'Client not found' });
        }
        
        console.log('Client found:', data);
        return res.json(data);
      } else {
        return res.status(500).json({ error: 'Database not available' });
      }
    }
    
    if (req.method === 'DELETE') {
      // Delete client by ID
      console.log('🗑️ DELETE request for client ID:', id);
      
      if (!id || id === 'clients') {
        return res.status(400).json({ error: 'Client ID is required for deletion' });
      }

      if (isConnected && supabase) {
        console.log('🗑️ Attempting to delete client from Supabase:', id);
        
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('❌ Supabase delete error:', error);
          return res.status(500).json({ error: 'Failed to delete client from database' });
        }
        
        console.log('✅ Client deleted successfully from Supabase:', id);
        return res.status(200).json({ success: true, deletedId: id });
      } else {
        console.log('❌ Supabase not connected - cannot delete from database');
        return res.status(500).json({ error: 'Database not available' });
      }
    }
    
    if (req.method === 'PUT') {
      // Update client by ID
      console.log('📝 PUT request for client ID:', id);
      console.log('📝 Update data received:', req.body);
      
      const updates = { ...req.body };
      
      // Map frontend field names to database column names
      if (updates.firstName) {
        updates.first_name = updates.firstName;
        delete updates.firstName;
      }
      if (updates.lastName) {
        updates.last_name = updates.lastName;
        delete updates.lastName;
      }
      if (updates.propertiesOfInterest !== undefined) {
        updates.properties_of_interest = updates.propertiesOfInterest;
        delete updates.propertiesOfInterest;
      }
      
      // Ensure tags are in correct format
      if (updates.tags && !Array.isArray(updates.tags)) {
        updates.tags = updates.tags.split(',').map(t => t.trim());
      }
      
      console.log('📝 Mapped update data for database:', updates);
      
      if (isConnected && supabase) {
        const { data, error } = await supabase
          .from('clients')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          console.error('Supabase update error:', error);
          return res.status(500).json({ error: 'Failed to update client', details: error.message });
        }
        
        console.log('✅ Client updated successfully:', data);
        return res.json(data);
      } else {
        return res.status(500).json({ error: 'Database not available' });
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}