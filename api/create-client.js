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
    console.log('✅ Supabase initialized for client creation');
  } catch (error) {
    console.error('❌ Supabase init failed:', error);
    isConnected = false;
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  console.log('🔍 Create client endpoint hit:', req.method);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }
  
  try {
    console.log('📝 Processing client creation request...');
    console.log('📝 Request body:', req.body);
    
    const { firstName, lastName, email, phone, tags, notes, birthday, address } = req.body || {};
    
    if (!firstName || !lastName) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'First name and last name are required',
        received: { firstName, lastName }
      });
    }

    const clientData = {
      first_name: firstName,
      last_name: lastName,
      email: email || null,
      phone: phone || null,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      notes: notes || null,
      birthday: birthday || null,
      address: address || null,
      status: 'active'
    };

    console.log('📝 Prepared client data:', clientData);

    if (isConnected && supabase) {
      console.log('💾 Saving to Supabase...');
      
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Supabase insert error:', error);
        return res.status(500).json({ 
          error: 'Failed to save client to database',
          details: error.message 
        });
      }
      
      console.log('✅ Client saved to Supabase:', data);
      return res.status(201).json({
        success: true,
        client: data,
        message: 'Client created successfully'
      });
      
    } else {
      console.log('⚠️ Supabase not connected, would save to fallback');
      return res.status(500).json({ 
        error: 'Database not available',
        debug: {
          hasUrl: !!SUPABASE_URL,
          hasKey: !!SUPABASE_ANON_KEY,
          isConnected
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}