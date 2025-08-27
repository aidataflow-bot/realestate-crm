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

// Note: For now, we'll store transactions as a JSON field in the clients table
// In the future, this could be expanded to a separate transactions table

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
    // Get transactions for a specific client
    if (method === 'GET' && client_id) {
      if (isConnected && supabase) {
        const { data, error } = await supabase
          .from('clients')
          .select('transactions')
          .eq('id', client_id)
          .single();
        
        if (error) throw error;
        return res.json(data?.transactions || []);
      }
      
      return res.json([]);
    }
    
    // Add transaction to client
    if (method === 'POST' && client_id) {
      const transactionData = req.body;
      
      if (isConnected && supabase) {
        // First get current transactions
        const { data: currentClient, error: fetchError } = await supabase
          .from('clients')
          .select('transactions')
          .eq('id', client_id)
          .single();
        
        if (fetchError) throw fetchError;
        
        const currentTransactions = currentClient?.transactions || [];
        const newTransaction = {
          id: 'txn-' + Date.now(),
          type: transactionData.type, // 'buy', 'sell', 'lease'
          address: transactionData.address,
          price: parseFloat(transactionData.price) || 0,
          commission_rate: parseFloat(transactionData.commission_rate) || 3.0,
          gross_commission: parseFloat(transactionData.gross_commission) || 0,
          split_rate: parseFloat(transactionData.split_rate) || 50.0,
          net_commission: parseFloat(transactionData.net_commission) || 0,
          status: transactionData.status || 'pending',
          close_date: transactionData.close_date,
          notes: transactionData.notes || '',
          created_at: new Date().toISOString()
        };
        
        const updatedTransactions = [...currentTransactions, newTransaction];
        
        const { data, error } = await supabase
          .from('clients')
          .update({ 
            transactions: updatedTransactions,
            updated_at: new Date().toISOString()
          })
          .eq('id', client_id)
          .select()
          .single();
        
        if (error) throw error;
        return res.json(newTransaction);
      }
      
      return res.status(501).json({ error: 'Transaction storage not available without database' });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Transaction API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}