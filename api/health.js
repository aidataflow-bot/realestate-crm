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

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    let clientCount = 0;
    
    if (isConnected && supabase) {
      const { data, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        clientCount = data?.length || 0;
      }
    }
    
    return res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      storage: isConnected ? 'Supabase Connected' : 'In-Memory Fallback',
      clients: clientCount,
      debug: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
        supabaseUrlPrefix: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 25) + '...' : 'not-set',
        isConnected: isConnected
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({ 
      error: 'Health check failed',
      message: error.message 
    });
  }
}