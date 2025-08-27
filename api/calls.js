import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client
let supabase = null;
let isConnected = false;

try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    isConnected = true;
  }
} catch (error) {
  console.error('❌ Supabase initialization failed:', error);
  isConnected = false;
}

// Fallback in-memory storage
let MEMORY_CALLS = [];

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  const { client_id } = req.query;
  
  try {
    // Get calls for a specific client
    if (method === 'GET' && client_id) {
      if (isConnected && supabase) {
        const { data, error } = await supabase
          .from('calls')
          .select('*')
          .eq('client_id', client_id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return res.json(data || []);
      }
      
      const clientCalls = MEMORY_CALLS.filter(call => call.client_id === client_id);
      return res.json(clientCalls);
    }
    
    // Create new call log
    if (method === 'POST') {
      const callData = req.body;
      
      if (isConnected && supabase) {
        const { data, error } = await supabase
          .from('calls')
          .insert([{
            client_id: callData.client_id,
            call_type: callData.call_type || 'outbound',
            duration: parseInt(callData.duration) || 0,
            notes: callData.notes || '',
            outcome: callData.outcome,
            follow_up_date: callData.follow_up_date || null
          }])
          .select()
          .single();
        
        if (error) throw error;
        return res.json(data);
      }
      
      // Fallback to memory storage
      const newCall = {
        id: 'call-' + Date.now(),
        client_id: callData.client_id,
        call_type: callData.call_type || 'outbound',
        duration: parseInt(callData.duration) || 0,
        notes: callData.notes || '',
        outcome: callData.outcome,
        follow_up_date: callData.follow_up_date || null,
        created_at: new Date().toISOString()
      };
      
      MEMORY_CALLS.push(newCall);
      return res.json(newCall);
    }
    
    // Get all calls (for analytics)
    if (method === 'GET' && !client_id) {
      if (isConnected && supabase) {
        const { data, error } = await supabase
          .from('calls')
          .select('*, clients(first_name, last_name)')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return res.json(data || []);
      }
      
      return res.json(MEMORY_CALLS);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Call API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}