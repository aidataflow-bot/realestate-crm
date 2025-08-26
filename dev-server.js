const express = require('express');
const path = require('path');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://demo.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'demo_key';

// Initialize Supabase client
let supabase = null;
let isConnected = false;

try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    isConnected = true;
    console.log('✅ Supabase client initialized');
  } else {
    console.log('⚠️ Supabase credentials not found, using fallback storage');
  }
} catch (error) {
  console.error('❌ Supabase initialization failed:', error);
}

// Fallback in-memory storage
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

// API Routes
// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    storage: isConnected ? 'Supabase Connected' : 'In-Memory Fallback'
  });
});

// Get all clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await DB.getClients();
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single client
app.get('/api/clients/:id', async (req, res) => {
  try {
    const client = await DB.getClient(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new client
app.post('/api/clients', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, tags, notes, birthday, address } = req.body;
    
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

    const newClient = await DB.createClient(clientData);
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update client
app.put('/api/clients/:id', async (req, res) => {
  try {
    const updates = req.body;
    const updatedClient = await DB.updateClient(req.params.id, updates);
    res.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    await DB.deleteClient(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: error.message });
  }
});

// Placeholder routes for other resources
app.get('/api/clients/:clientId/properties', (req, res) => {
  res.json([]);
});

app.post('/api/clients/:clientId/properties', (req, res) => {
  res.status(501).json({ error: 'Property management not yet implemented' });
});

app.get('/api/tasks', (req, res) => {
  res.json([]);
});

app.post('/api/clients/:clientId/tasks', (req, res) => {
  res.status(501).json({ error: 'Task management not yet implemented' });
});

app.post('/api/clients/:clientId/calls', (req, res) => {
  res.status(501).json({ error: 'Call logging not yet implemented' });
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all route for other paths (avoid path-to-regexp issues)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Development server running on port ${PORT}`);
  console.log(`📡 Database: ${isConnected ? 'Supabase Connected' : 'In-Memory Fallback'}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api/health`);
});