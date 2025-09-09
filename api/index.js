import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://demo.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'demo_key';

// Initialize Supabase client
let supabase = null;
let isConnected = false;

// Debug logging
console.log('🔍 Environment check:');
console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
console.log('SUPABASE_URL value:', process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL.substring(0, 20)}...` : 'undefined');

try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    isConnected = true;
    console.log('✅ Supabase client initialized successfully');
  } else {
    console.log('⚠️ Supabase credentials not found, using fallback storage');
    console.log('Missing SUPABASE_URL:', !process.env.SUPABASE_URL);
    console.log('Missing SUPABASE_ANON_KEY:', !process.env.SUPABASE_ANON_KEY);
  }
} catch (error) {
  console.error('❌ Supabase initialization failed:', error);
  isConnected = false;
}

// Fallback in-memory storage for when Supabase is not configured
let MEMORY_STORE = {
  clients: [
    {
      id: 'sample-1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      tags: ['First Time Buyer', 'Referral'],
      notes: 'Looking for family home in Beverly Hills area',
      birthday: '1985-09-15',
      address: '123 Main St, Los Angeles, CA',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sample-2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@example.com',
      phone: '+1 (555) 987-6543',
      tags: ['Investor', 'Luxury'],
      notes: 'Looking for investment property in Malibu',
      birthday: '1978-03-22',
      address: '456 Oak Ave, Santa Monica, CA',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  properties: [],
  tasks: [],
  calls: []
};

// Database abstraction layer
const DB = {
  async getClients() {
    if (isConnected && supabase) {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
    return MEMORY_STORE.clients;
  },

  async getClient(id) {
    if (isConnected && supabase) {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
    return MEMORY_STORE.clients.find(c => c.id === id);
  },

  async createClient(clientData) {
    if (isConnected && supabase) {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
    
    const newClient = {
      id: 'client-' + Date.now(),
      ...clientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    MEMORY_STORE.clients.push(newClient);
    return newClient;
  },

  async updateClient(id, updates) {
    if (isConnected && supabase) {
      const { data, error } = await supabase
        .from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
    
    const index = MEMORY_STORE.clients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client not found');
    
    MEMORY_STORE.clients[index] = {
      ...MEMORY_STORE.clients[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return MEMORY_STORE.clients[index];
  },

  async deleteClient(id) {
    if (isConnected && supabase) {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    }
    
    const index = MEMORY_STORE.clients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client not found');
    
    MEMORY_STORE.clients.splice(index, 1);
    return { success: true };
  }
};

// Vercel serverless function handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  
  // Parse URL properly for Vercel
  const urlObject = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObject.pathname;
  
  // Debug logging
  console.log('🔍 Request details (API_V2_FIXED):');
  console.log('Method:', method);
  console.log('Original URL:', req.url);
  console.log('Parsed pathname:', pathname);
  console.log('Host:', req.headers.host);
  console.log('🚀 API V2 with improved URL parsing active!');
  
  try {
    // Health check
    if (pathname === '/api/health' && method === 'GET') {
      const clients = await DB.getClients();
      return res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        storage: isConnected ? 'Supabase Connected' : 'In-Memory Fallback',
        clients: clients.length,
        debug: {
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
          supabaseUrlPrefix: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 25) : 'not-set',
          isConnected: isConnected,
          environmentKeys: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
        }
      });
    }

    // Clients endpoint moved to /api/clients.js
    if (pathname === '/api/clients' && method === 'GET') {
      return res.status(410).json({ 
        error: 'This endpoint has been moved to /api/clients.js',
        redirect: '/api/clients'
      });
    }

    // Get single client
    if (pathname.startsWith('/api/clients/') && method === 'GET') {
      const id = pathname.split('/')[3];
      const client = await DB.getClient(id);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      return res.json(client);
    }

    // Create new client - moved to /api/clients.js
    if (pathname === '/api/clients' && method === 'POST') {
      return res.status(410).json({ 
        error: 'POST endpoint moved to /api/clients.js',
        redirect: 'Use dedicated clients endpoint'
      });
    }

    // Update client
    if (pathname.startsWith('/api/clients/') && method === 'PUT') {
      const id = pathname.split('/')[3];
      const updates = req.body;
      const updatedClient = await DB.updateClient(id, updates);
      return res.json(updatedClient);
    }

    // Delete client - handled by /api/clients.js
    if (pathname.startsWith('/api/clients/') && method === 'DELETE') {
      return res.status(410).json({ 
        error: 'DELETE endpoint moved to /api/clients.js',
        redirect: 'Use dedicated clients endpoint'
      });
    }

    // Placeholder routes for other resources
    if (pathname.match(/\/api\/clients\/[^\/]+\/properties/) && method === 'GET') {
      return res.json([]);
    }

    if (pathname.match(/\/api\/clients\/[^\/]+\/properties/) && method === 'POST') {
      return res.status(501).json({ error: 'Property management not yet implemented' });
    }

    if (pathname === '/api/tasks' && method === 'GET') {
      return res.json([]);
    }

    if (pathname.match(/\/api\/clients\/[^\/]+\/tasks/) && method === 'POST') {
      return res.status(501).json({ error: 'Task management not yet implemented' });
    }

    if (pathname.match(/\/api\/clients\/[^\/]+\/calls/) && method === 'POST') {
      return res.status(501).json({ error: 'Call logging not yet implemented' });
    }

    // Route not found
    return res.status(404).json({ error: 'Route not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}