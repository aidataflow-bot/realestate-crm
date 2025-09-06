-- CLIENT FLOW 360 CRM Database Setup
-- Project ID: kgezacvwtcetwdlxetji
-- Run this script in your Supabase SQL Editor

-- Create clients table for CRM
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    birthday DATE,
    address TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated access
CREATE POLICY "Allow all operations for authenticated users" 
ON clients FOR ALL 
USING (true);

-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at updates
CREATE OR REPLACE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample client data (optional)
INSERT INTO clients (first_name, last_name, email, phone, tags, notes, address) 
VALUES 
    ('John', 'Smith', 'john@example.com', '+1 (555) 123-4567', 
     ARRAY['First Time Buyer', 'Referral'], 
     'Looking for family home in Beverly Hills area', 
     '123 Main St, Los Angeles, CA'),
    ('Sarah', 'Johnson', 'sarah.j@example.com', '+1 (555) 987-6543', 
     ARRAY['Investor', 'Luxury'], 
     'Looking for investment property in Malibu', 
     '456 Oak Ave, Santa Monica, CA')
ON CONFLICT (email) DO NOTHING;

-- Verify table creation
SELECT 'Tables created successfully!' as status;
SELECT COUNT(*) as client_count FROM clients;