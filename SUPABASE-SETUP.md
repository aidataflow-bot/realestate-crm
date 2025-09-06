# Supabase Setup Guide for CLIENT FLOW 360 CRM

## Project Information
- **Project ID**: `kgezacvwtcetwdlxetji` 
- **Project URL**: `https://kgezacvwtcetwdlxetji.supabase.co`
- **Status**: ✅ Configured in CRM

## Quick Setup Steps

### 1. Get Your Supabase Anon Key
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `kgezacvwtcetwdlxetji`
3. Go to **Settings** → **API**
4. Copy the **anon public key** (starts with `eyJ0eXAiOiJKV1Q...`)

### 2. Environment Configuration ✅ COMPLETED

#### Local Development (.env):
```bash
SUPABASE_URL=https://kgezacvwtcetwdlxetji.supabase.co  # ✅ Set
SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE                   # ⏳ Needs your key
VITE_API_URL="/api"
VITE_APP_NAME="CLIENT FLOW 360 CRM"
VITE_APP_VERSION="2.5.0"
```

#### Production Vercel (.env.production):
```bash
SUPABASE_URL=https://kgezacvwtcetwdlxetji.supabase.co  # ✅ Set
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}                 # ⏳ Needs deployment config
```

### 3. Vercel Deployment Configuration
Add these environment variables in your Vercel project dashboard:

**Environment Variables:**
- `SUPABASE_URL` → `https://kgezacvwtcetwdlxetji.supabase.co`
- `SUPABASE_ANON_KEY` → `[your anon key from Supabase dashboard]`

### 4. Database Schema Setup
Run this SQL in your Supabase SQL Editor to create the required tables:

```sql
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

-- Create policy (adjust permissions as needed)
CREATE POLICY "Allow all operations for authenticated users" 
ON clients FOR ALL 
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();
```

### 5. Test Connection
After setup, verify the connection:

1. **Health Check**: Visit `/api/health` 
2. **Expected Response**:
   ```json
   {
     "status": "ok",
     "storage": "Supabase Connected",  // ← Should say this!
     "clients": 0,
     "debug": {
       "hasSupabaseUrl": true,
       "hasSupabaseKey": true,
       "isConnected": true
     }
   }
   ```

3. **CRM Header**: Should show `DB: Supabase Connected` instead of `DB: Fallback Storage`

## Current Configuration Status
- ✅ Project URL configured: `https://kgezacvwtcetwdlxetji.supabase.co`
- ✅ Environment files updated with your project ID
- ✅ API integration code ready
- ⏳ Awaiting your anon key configuration
- ⏳ Database tables need creation
- ⏳ Production environment variables need setup

## What You Need To Do Next:
1. **Get anon key** from Supabase dashboard → Settings → API
2. **Update local .env** with your anon key 
3. **Create database tables** using the SQL above
4. **Set Vercel env vars** for production deployment
5. **Test the connection** using health endpoint

## Troubleshooting
- If you see `DB: Fallback Storage` → Environment variables not loaded
- If you see `DB: In-Memory Fallback` → Supabase connection failed
- If you see `DB: Supabase Connected` → ✅ Everything working!

Your CRM is now pre-configured for your Supabase project `kgezacvwtcetwdlxetji`!