import { createClient } from '@supabase/supabase-js';

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

// Fallback data
const FALLBACK_CLIENTS = [
  {
    id: 'fallback-1',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    status: 'active'
  },
  {
    id: 'fallback-2',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah@example.com',
    phone: '+1 (555) 987-6543',
    status: 'active'
  }
];

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  console.log('🔍 Request received:', req.method, 'to /api/clients');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    if (req.method === 'GET') {
      // Get all clients
      if (isConnected && supabase) {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Supabase error:', error);
          console.log('Returning fallback clients due to Supabase error');
          return res.json(Array.isArray(FALLBACK_CLIENTS) ? FALLBACK_CLIENTS : []);
        }
        
        console.log('Supabase query successful, data:', data);
        const result = Array.isArray(data) ? data : (data ? [data] : []);
        console.log('Returning clients array:', result.length, 'items');
        return res.json(result);
      } else {
        console.log('Using fallback clients (Supabase not connected)');
        const fallback = Array.isArray(FALLBACK_CLIENTS) ? FALLBACK_CLIENTS : [];
        console.log('Returning fallback clients array:', fallback.length, 'items');
        return res.json(fallback);
      }
    }
    
    if (req.method === 'POST') {
      // Create new client
      console.log('📝 POST request received for client creation');
      console.log('📝 Request body:', req.body);
      
      const { firstName, lastName, email, phone, tags, notes, birthday, address } = req.body || {};
      
      if (!firstName || !lastName) {
        return res.status(400).json({ error: 'First name and last name are required' });
      }

      const clientData = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
        notes,
        birthday,
        address,
        status: 'active'
      };

      if (isConnected && supabase) {
        const { data, error } = await supabase
          .from('clients')
          .insert([clientData])
          .select()
          .single();
        
        if (error) {
          console.error('Supabase insert error:', error);
          return res.status(500).json({ error: 'Failed to create client' });
        }
        
        return res.status(201).json(data);
      } else {
        return res.status(500).json({ error: 'Database not available' });
      }
    }
    
    if (req.method === 'DELETE') {
      // Delete client - extract ID from URL path
      console.log('🗑️ DELETE request received for client deletion');
      console.log('🗑️ Request URL:', req.url);
      
      // Parse client ID from URL: /api/clients/some-id
      const urlParts = req.url.split('/');
      const clientId = urlParts[urlParts.length - 1];
      
      console.log('🗑️ Extracted client ID:', clientId);
      
      if (!clientId || clientId === 'clients') {
        return res.status(400).json({ error: 'Client ID is required for deletion' });
      }

      if (isConnected && supabase) {
        console.log('🗑️ Attempting to delete client from Supabase:', clientId);
        
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', clientId);
        
        if (error) {
          console.error('❌ Supabase delete error:', error);
          return res.status(500).json({ error: 'Failed to delete client from database' });
        }
        
        console.log('✅ Client deleted successfully from Supabase:', clientId);
        return res.status(200).json({ success: true, deletedId: clientId });
      } else {
        console.log('❌ Supabase not connected - cannot delete from database');
        return res.status(500).json({ error: 'Database not available' });
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}