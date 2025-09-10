-- Add properties_of_interest column to clients table
-- This column will store an array of property interest objects as JSONB

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS properties_of_interest JSONB DEFAULT '[]'::jsonb;

-- Update existing clients to have empty properties array if null
UPDATE clients 
SET properties_of_interest = '[]'::jsonb 
WHERE properties_of_interest IS NULL;

-- Create index for better performance on property searches
CREATE INDEX IF NOT EXISTS idx_clients_properties_of_interest 
ON clients USING gin (properties_of_interest);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clients' AND column_name = 'properties_of_interest';

-- Show a sample of updated table structure
SELECT id, first_name, last_name, properties_of_interest 
FROM clients 
LIMIT 3;